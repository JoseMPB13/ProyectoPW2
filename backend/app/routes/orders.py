from flask import Blueprint, request, jsonify, send_file
from app.utils.pdf_generator import InvoiceGenerator
from app.services.order_service import OrderService
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Usuario

# ==============================================================================
# ENCABEZADO DEL ARCHIVO (Controlador/Ruta)
# ==============================================================================
# Propósito:
#   Maneja los endpoints HTTP RESTful para el módulo de Órdenes de Trabajo.
#   Actúa como la "puerta de entrada" (Gateway) para procesar solicitudes del Frontend.
#
# Flujo Lógico:
#   1. Autenticación: Todos los endpoints requieren JWT (@jwt_required).
#   2. Validación de Entrada: Verifica datos básicos (JSON body, query params).
#   3. Delegación: Llama a `OrderService` para la lógica de negocio pesada.
#   4. Respuesta: Formatea los objetos de dominio a JSON estándar.
#
# Endpoints Clave:
#   - POST /orders: Creación con detalles (Full Graph Creation).
#   - PUT /orders/{id}: Actualización con sincronización (Full Graph Update).
#   - GET /orders: Listado con filtros y paginación.
#
# Interacciones:
#   - Cliente: Frontend Web/Móvil.
#   - Servicio: `OrderService` (Business Layer).
# ==============================================================================

orders_bp = Blueprint('orders', __name__)

# ==============================================================================
# Endpoint: Crear Orden de Trabajo con Detalles
# ==============================================================================
@orders_bp.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    """
    Crea una nueva orden de trabajo completa, incluyendo servicios y repuestos.
    
    Descripción:
        Endpoint transaccional que recibe la estructura completa de una orden.
        Delega la validación de inventario y lógicas de negocio al servicio.
    
    Request Body (JSON):
        {
            "auto_id": int,
            "tecnico_id": int,
            "estado_id": int,
            "problema_reportado": str,
            "diagnostico": str (opcional),
            "fecha_ingreso": str (ISO, opcional),
            "fecha_entrega": str (ISO, opcional),
            "servicios": [1, 2, ...],  // Lista de IDs
            "repuestos": [             // Lista de Objetos
                {"id": 5, "cantidad": 2},
                {"id": 8, "cantidad": 1}
            ]
        }
    
    Returns:
        201 Created: Objeto orden creado.
        400 Bad Request: Error de validación (stock, datos faltantes).
        500 Internal Error: Error de servidor o BD.
    """
    data = request.get_json()

    # Validaciones básicas de capa HTTP
    # (Las validaciones profundas de negocio ocurren en el servicio)
    required_fields = ['auto_id', 'tecnico_id', 'estado_id']
    if not data or not all(k in data for k in required_fields):
        return jsonify({"msg": "Faltan datos obligatorios (auto_id, tecnico_id, estado_id)"}), 400
    
    try:
        # Delegación a Capa de Servicio
        new_order = OrderService.create_order_with_details(data)
        
        return jsonify({
            "msg": "Orden creada exitosamente",
            "order": new_order.to_dict()
        }), 201
        
    except ValueError as e:
        # Errores de Negocio (ej: Stock insuficiente) -> 400 Bad Request
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        # Errores Inesperados -> 500
        return jsonify({"msg": f"Error al crear orden: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Listar Órdenes
# ==============================================================================
@orders_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    """
    Recupera el listado maestro de órdenes aplicando filtros.
    
    Query Params:
        page (int): Página actual (default: 1).
        per_page (int): Tamaño de página (default: 10).
        estado_id (int): Filtrar por ID de estado.
        search (str): Búsqueda por texto (placa, marca, modelo).
        client_id (int): Filtrar por ID de cliente dueño.
        
    Returns:
        200 OK: Lista paginada y metadatos.
    """
    try:
        # Extracción segura de parámetros
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        estado_id = request.args.get('estado_id', type=int)
        search = request.args.get('search', type=str)
        client_id = request.args.get('client_id', type=int)

        pagination = OrderService.get_all_orders(page, per_page, estado_id, search, client_id)
        
        # Serialización de resultados
        response_items = []
        for order in pagination.items:
             # to_dict serializa todo el árbol necesario para la grilla
             response_items.append(order.to_dict())

        return jsonify({
            'items': response_items,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': pagination.page,
            'per_page': pagination.per_page
        }), 200
        
    except Exception as e:
        return jsonify({"msg": f"Error al obtener órdenes: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Obtener Detalle de Orden
# ==============================================================================
@orders_bp.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """
    Obtiene la ficha técnica completa de una orden específica.
    """
    order = OrderService.get_order_by_id(order_id)
    if not order:
        return jsonify({"msg": "Orden no encontrada"}), 404
    
    # Retorna JSON con todos los detalles anidados (servicios, repuestos, pagos)
    return jsonify(order.to_dict()), 200

# ==============================================================================
# Endpoint: Descargar Factura PDF
# ==============================================================================
@orders_bp.route('/orders/<int:order_id>/invoice', methods=['GET'])
@jwt_required()
def get_order_invoice(order_id):
    """
    Genera on-the-fly un documento PDF (Factura/Recibo) para la orden.
    
    Returns:
        application/pdf: Stream de bytes del archivo generado.
    """
    try:
        order = OrderService.get_order_by_id(order_id)
        if not order:
             return jsonify({"msg": "Orden no encontrada"}), 404
        
        # Generación del Buffer PDF en memoria
        pdf_buffer = InvoiceGenerator.generate(order.to_dict())
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'Orden_{order_id}.pdf'
        )
    except Exception as e:
        return jsonify({"msg": f"Error al generar factura: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Actualizar Orden Completa (Sincronización)
# ==============================================================================
@orders_bp.route('/orders/<int:order_id>', methods=['PUT'])
@jwt_required()
def update_order(order_id):
    """
    Actualiza el estado completo de una orden (Header + Detalles).
    
    Descripción:
        Implementa "Full Synchronization". El cliente envía el estado deseado
        y el servidor calcula los diferenciales (Agregar/Borrar/Modificar).
        Es ideal para formularios de edición complejos.
    
    Request Body:
        Ver `create_order`. Debe incluir listas completas de items.
        
    Returns:
        200 OK: Orden actualizada.
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"msg": "No se proporcionaron datos para actualizar"}), 400
    
    try:
        # Lógica de sincronización delegada
        updated_order = OrderService.update_order_with_details(order_id, data)
        
        return jsonify({
            "msg": "Orden actualizada exitosamente",
            "order": updated_order.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        return jsonify({"msg": f"Error al actualizar orden: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Actualizar Estado de Orden (Método Rápido)
# ==============================================================================
@orders_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    """
    Actualización atómica solo del estado (Kanban Drag & Drop).
    
    Body:
        { "estado_id": int }
    """
    data = request.get_json()
    estado_id = data.get('estado_id') or data.get('status_id') # Compatibilidad

    if not estado_id:
        return jsonify({"msg": "Se requiere estado_id"}), 400

    try:
        order = OrderService.update_order_status(order_id, estado_id)
        return jsonify({"msg": "Estado actualizado", "estado": order.estado.to_dict() if order.estado else None}), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        return jsonify({"msg": f"Error al actualizar estado: {str(e)}"}), 500

# ==============================================================================
# Endpoints LEGACY: Operaciones Individuales
# (Mantenidos para compatibilidad, pero se prefiere la actualización por lotes)
# ==============================================================================

@orders_bp.route('/orders/<int:order_id>/services', methods=['POST'])
@jwt_required()
def add_service_to_order(order_id):
    """
    [LEGACY] Agrega un servicio individual a la orden.
    Use PUT /orders/<id> para operaciones modernas.
    """
    data = request.get_json()
    if not data or not data.get('servicio_id'):
        return jsonify({"msg": "Se requiere servicio_id"}), 400

    try:
        new_detail = OrderService.add_service_to_order(
            order_id=order_id,
            servicio_id=data['servicio_id']
        )
        return jsonify({
            "msg": "Servicio agregado a la orden", 
            "detail": new_detail.to_dict()
        }), 201
    except ValueError as e:
        return jsonify({"msg": str(e)}), 404
    except Exception as e:
        return jsonify({"msg": f"Error al agregar servicio: {str(e)}"}), 500

@orders_bp.route('/orders/<int:order_id>/parts', methods=['POST'])
@jwt_required()
def add_part_to_order(order_id):
    """
    [LEGACY] Agrega un repuesto individual a la orden.
    Use PUT /orders/<id> para operaciones modernas.
    """
    data = request.get_json()
    if not data or not data.get('repuesto_id'):
        return jsonify({"msg": "Se requiere repuesto_id"}), 400

    try:
        new_detail = OrderService.add_repuesto_to_order(
            order_id=order_id,
            repuesto_id=data['repuesto_id'],
            cantidad=int(data.get('cantidad', 1))
        )
        return jsonify({
            "msg": "Repuesto agregado a la orden", 
            "detail": new_detail.to_dict()
        }), 201
    except ValueError as e:
        # P.ej: Stock insuficiente
        return jsonify({"msg": str(e)}), 400 
    except Exception as e:
        return jsonify({"msg": f"Error al agregar repuesto: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Catálogos Auxiliares
# ==============================================================================
@orders_bp.route('/orders/estados', methods=['GET'])
@jwt_required()
def get_order_estados():
    """Retorna la lista maestra de estados posibles para una orden."""
    from app.models import EstadoOrden
    try:
        estados = EstadoOrden.query.all()
        return jsonify([e.to_dict() for e in estados]), 200
    except Exception as e:
        return jsonify({"msg": f"Error al obtener estados: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Utilidad de Mantenimiento
# ==============================================================================
@orders_bp.route('/orders/debug-recalculate', methods=['GET'])
def debug_recalculate():
    """
    [ADMIN] Fuerza el recálculo de los totales monetarios de todas las órdenes.
    Útil para corregir inconsistencias de datos históricos.
    """
    try:
        stats = OrderService.recalculate_all_totals()
        return jsonify({"msg": "Totales recalculados", "stats": stats}), 200
    except Exception as e:
        return jsonify({"msg": f"Error: {str(e)}"}), 500
