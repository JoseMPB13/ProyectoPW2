from flask import Blueprint, request, jsonify
from app.services.order_service import OrderService
from app.models import User
from flask_jwt_extended import jwt_required, get_jwt_identity

# ==============================================================================
# Capa de RUTAS (Controlador) - Orders
# ==============================================================================
# Esta capa se encarga EXCLUSIVAMENTE de:
# 1. Recibir la petición HTTP (GET, POST, etc.)
# 2. Extraer y validar básicamente los datos de entrada (JSON, Params)
# 3. Llamar a la Capa de Servicios (OrderService) para ejecutar la lógica
# 4. Retornar la respuesta HTTP adecuada (JSON + Status Code)
# ==============================================================================

orders_bp = Blueprint('orders', __name__)

# ==============================================================================
# Endpoint: Crear Servicio (Solo Admin)
# ==============================================================================
@orders_bp.route('/services', methods=['POST'])
@jwt_required()
def create_service():
    """
    Crea un nuevo tipo de servicio en el catálogo.
    Endpoint protegido para administradores.

    Request Body:
        name (str): Nombre del servicio.
        base_price (float): Precio base.
        description (str): Descripción opcional.

    Returns:
        JSON: Objeto del servicio creado.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    # Verificación de rol (Controlador valida permisos HTTP)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Acceso denegado. Se requieren permisos de administrador"}), 403

    data = request.get_json()
    # Validación básica de entrada
    if not data or not data.get('name') or not data.get('base_price'):
        return jsonify({"msg": "Faltan datos obligatorios (name, base_price)"}), 400

    try:
        # Llamada al servicio para lógica de negocio
        new_service = OrderService.create_service(
            name=data['name'],
            base_price=float(data['base_price']),
            description=data.get('description', '')
        )
        return jsonify({"msg": "Servicio creado exitosamente", "service": new_service.to_dict()}), 201
    except Exception as e:
        return jsonify({"msg": f"Error al crear servicio: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Listar Servicios (Helper)
# ==============================================================================
@orders_bp.route('/services', methods=['GET'])
def get_services():
    """
    Obtiene la lista de todos los servicios disponibles.
    Público (o protegido según requerimiento, aquí público).
    """
    services = OrderService.get_all_services()
    return jsonify([s.to_dict() for s in services]), 200

# ==============================================================================
# Endpoint: Crear Orden de Trabajo
# ==============================================================================
@orders_bp.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    """
    Crea una nueva orden de trabajo vinculada a un vehículo.
    Usuario autenticado es el creador.

    Request Body:
        vehicle_id (int): ID del vehículo.

    Returns:
        JSON: La orden creada.
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('vehicle_id'):
        return jsonify({"msg": "Se requiere vehicle_id"}), 400
    
    try:
        # Delegamos al servicio
        new_order = OrderService.create_order(
            vehicle_id=data['vehicle_id'],
            user_id=current_user_id
        )
        return jsonify({"msg": "Orden creada exitosamente", "order": new_order.to_dict()}), 201
    except ValueError as e:
        # Capturamos excepciones de negocio específicas (ej: vehículo no encontrado)
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
    Obtiene la lista de órdenes de trabajo con paginación y filtros.
    Query Params: page, per_page, status, search.
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', type=str)
        search = request.args.get('search', type=str)

        # Mapeo de status si viene del frontend con nombres "bonitos"
        # Opcional: Si el frontend envía 'En reparación', convertimos a 'en_progreso'
        status_map = {
            'En reparación': 'en_progreso',
            'Listo': 'finalizado',
            'En taller': 'pendiente',
            'Entregado': 'entregado'
        }
        if status in status_map:
            status = status_map[status]

        pagination = OrderService.get_all_orders(page, per_page, status, search)
        
        response_items = []
        for order in pagination.items:
             order_dict = order.to_dict()
             # Enriquecer con info extendida para Dashboard
             if order.vehicle:
                 order_dict['vehicle_plate'] = order.vehicle.plate
                 order_dict['vehicle_brand'] = order.vehicle.brand
                 order_dict['vehicle_model'] = order.vehicle.model
                 order_dict['vehicle_vin'] = order.vehicle.vin
                 if order.vehicle.owner:
                     order_dict['client_name'] = f"{order.vehicle.owner.first_name} {order.vehicle.owner.last_name}"
                     
             if order.creator:
                 order_dict['technician_name'] = order.creator.username # Usamos username como técnico por ahora

             response_items.append(order_dict)

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
# Endpoint: Agregar Item a Orden
# ==============================================================================
@orders_bp.route('/orders/<int:order_id>/items', methods=['POST'])
@jwt_required()
def add_order_item(order_id):
    """
    Agrega un servicio a una orden existente.

    Path Params:
        order_id (int): ID de la orden.
    
    Request Body:
        service_id (int): ID del servicio a agregar.

    Returns:
        JSON: Item creado y nuevo total de la orden.
    """
    data = request.get_json()
    if not data or not data.get('service_id'):
        return jsonify({"msg": "Se requiere service_id"}), 400

    try:
        # Delegamos la lógica compleja (crear item + actualizar total orden) al servicio
        new_item, order_total = OrderService.add_order_item(
            order_id=order_id,
            service_id=data['service_id']
        )
        return jsonify({
            "msg": "Servicio agregado a la orden", 
            "item": new_item.to_dict(), 
            "order_total": order_total
        }), 201
    except ValueError as e:
        return jsonify({"msg": str(e)}), 404
    except Exception as e:
        return jsonify({"msg": f"Error al agregar item: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Obtener Detalle de Orden
# ==============================================================================
@orders_bp.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """
    Obtiene el detalle completo de una orden: Cliente, Vehículo, Items.
    """
    order = OrderService.get_order_by_id(order_id)
    if not order:
        return jsonify({"msg": "Orden no encontrada"}), 404
    
    response = order.to_dict()
    
    # Enriquecimiento de respuesta para el Frontend (opcional pero útil)
    if order.vehicle:
          response['vehicle_info'] = order.vehicle.to_dict()
          if order.vehicle.owner:
              response['client_info'] = order.vehicle.owner.to_dict()

    return jsonify(response), 200

# ==============================================================================
# Endpoint: Actualizar Estado de Orden
# ==============================================================================
@orders_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    """
    Actualiza el estado de la orden (pendiente, en_progreso, finalizado).
    """
    data = request.get_json()
    if not data or not data.get('status'):
        return jsonify({"msg": "Se requiere status"}), 400

    try:
        order = OrderService.update_order_status(order_id, data['status'])
        return jsonify({"msg": "Estado actualizado", "status": order.status}), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        return jsonify({"msg": f"Error al actualizar estado: {str(e)}"}), 500
