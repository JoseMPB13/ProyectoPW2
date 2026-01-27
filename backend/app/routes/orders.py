from flask import Blueprint, request, jsonify
from app.services.order_service import OrderService
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Usuario

# ==============================================================================
# Capa de RUTAS (Controlador) - Orders
# ==============================================================================

orders_bp = Blueprint('orders', __name__)

# ==============================================================================
# Endpoint: Crear Orden de Trabajo
# ==============================================================================
@orders_bp.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    """
    Crea una nueva orden de trabajo.
    
    Request Body:
        auto_id (int): ID del vehículo.
        tecnico_id (int): ID del técnico asignado.
        estado_id (int): ID del estado inicial.
        problema_reportado (str): Descripción del problema.
    """
    data = request.get_json()

    # Validaciones básicas
    required_fields = ['auto_id', 'tecnico_id', 'estado_id']
    if not data or not all(k in data for k in required_fields):
        return jsonify({"msg": "Faltan datos obligatorios (auto_id, tecnico_id, estado_id)"}), 400
    
    try:
        new_order = OrderService.create_order(
            auto_id=data['auto_id'],
            tecnico_id=data['tecnico_id'],
            estado_id=data['estado_id'],
            problema_reportado=data.get('problema_reportado', '')
        )
        return jsonify({"msg": "Orden creada exitosamente", "order": new_order.to_dict()}), 201
    except ValueError as e:
        return jsonify({"msg": str(e)}), 404
    except Exception as e:
        return jsonify({"msg": f"Error al crear orden: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Listar Órdenes
# ==============================================================================
@orders_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    """
    Obtiene la lista de órdenes con paginación y filtros.
    Query Params: page, per_page, estado_id, search.
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        estado_id = request.args.get('estado_id', type=int)
        search = request.args.get('search', type=str)

        pagination = OrderService.get_all_orders(page, per_page, estado_id, search)
        
        response_items = []
        for order in pagination.items:
             # to_dict ya incluye info básica relacionada gracias al modelo actualizado
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
    Obtiene el detalle completo de una orden.
    """
    order = OrderService.get_order_by_id(order_id)
    if not order:
        return jsonify({"msg": "Orden no encontrada"}), 404
    
    # El método to_dict del modelo Orden ya es muy completo (incluye detalles y pagos)
    return jsonify(order.to_dict()), 200

# ==============================================================================
# Endpoint: Actualizar Estado de Orden
# ==============================================================================
@orders_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    """
    Actualiza el estado de la orden.
    Body: status_id (int) - alias de estado_id para compatibilidad con frontend si es necesario, pero usaremos estado_id preferiblemente.
    """
    data = request.get_json()
    estado_id = data.get('estado_id') or data.get('status_id') # Soporte para ambos nombres

    if not estado_id:
        return jsonify({"msg": "Se requiere estado_id"}), 400

    try:
        order = OrderService.update_order_status(order_id, estado_id)
        # Retornamos el estado actualizado (objeto serializable)
        return jsonify({"msg": "Estado actualizado", "estado": order.estado.to_dict() if order.estado else None}), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        return jsonify({"msg": f"Error al actualizar estado: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Agregar Servicio a Orden
# ==============================================================================
@orders_bp.route('/orders/<int:order_id>/services', methods=['POST'])
@jwt_required()
def add_service_to_order(order_id):
    """
    Agrega un servicio a una orden existente.
    Body: servicio_id (int)
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

# ==============================================================================
# Endpoint: Agregar Repuesto a Orden
# ==============================================================================
@orders_bp.route('/orders/<int:order_id>/parts', methods=['POST'])
@jwt_required()
def add_part_to_order(order_id):
    """
    Agrega un repuesto a una orden existente.
    Body: repuesto_id (int), cantidad (int, default 1)
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
        return jsonify({"msg": str(e)}), 400 # Error de stock o no encontrado
    except Exception as e:
        return jsonify({"msg": f"Error al agregar repuesto: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Obtener Estados de Orden
# ==============================================================================
@orders_bp.route('/orders/estados', methods=['GET'])
@jwt_required()
def get_order_estados():
    """
    Obtiene la lista de estados de orden disponibles.
    """
    from app.models import EstadoOrden
    try:
        estados = EstadoOrden.query.all()
        return jsonify([e.to_dict() for e in estados]), 200
    except Exception as e:
        return jsonify({"msg": f"Error al obtener estados: {str(e)}"}), 500
