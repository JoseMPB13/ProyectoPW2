from flask import Blueprint, request, jsonify
from app.services.client_service import ClientService

# ==============================================================================
# Capa de RUTAS (Controlador) - Clients
# ==============================================================================
# Gestiona las peticiones HTTP relacionadas con clientes y sus vehículos.
# Delega la lógica de negocio a ClientService.
# ==============================================================================

clients_bp = Blueprint('clients', __name__, url_prefix='/clients')

# ==============================================================================
# Endpoint: Crear Cliente
# ==============================================================================
@clients_bp.route('', methods=['POST'])
def create_client():
    """
    Crea un nuevo cliente.

    Request Body:
        first_name (str): Nombre.
        last_name (str): Apellido.
        email (str, optional): Email.
        phone (str, optional): Teléfono.
        address (str, optional): Dirección.

    Returns:
        JSON: Cliente creado.
    """
    data = request.get_json()

    # Validamos campos obligatorios
    if not data or not data.get('first_name') or not data.get('last_name'):
        return jsonify({"msg": "Nombre y Apellido son obligatorios"}), 400

    try:
        new_client = ClientService.create_client(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data.get('email'),
            phone=data.get('phone'),
            address=data.get('address')
        )
        return jsonify({"msg": "Cliente creado exitosamente", "client": new_client.to_dict()}), 201
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        return jsonify({"msg": f"Error interno: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Listar Clientes
# ==============================================================================
@clients_bp.route('', methods=['GET'])
def get_clients():
    """
    Obtiene lista de clientes con paginación y filtros.
    Query Params: page, per_page, search.
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', type=str)

        pagination = ClientService.get_all_clients(page, per_page, search)
        
        return jsonify({
            'items': [c.to_dict() for c in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': pagination.page,
            'per_page': pagination.per_page
        }), 200
    except Exception as e:
        return jsonify({"msg": f"Error al obtener clientes: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Agregar Vehículo a Cliente
# ==============================================================================
@clients_bp.route('/<int:client_id>/vehicles', methods=['POST'])
def add_vehicle(client_id):
    """
    Agrega un vehículo asociado a un cliente específico.
    
    Path Params:
        client_id (int): ID del cliente.

    Request Body:
        plate (str): Placa.
        brand (str): Marca.
        model (str): Modelo.
        year (int): Año.
        vin (str, optional): VIN.
    """
    data = request.get_json()

    # Validaciones de campos obligatorios del vehículo
    required_fields = ['plate', 'brand', 'model', 'year']
    if not data or not all(field in data for field in required_fields):
        return jsonify({"msg": f"Faltan datos obligatorios: {', '.join(required_fields)}"}), 400

    try:
        new_vehicle = ClientService.add_vehicle(
            client_id=client_id,
            plate=data['plate'],
            brand=data['brand'],
            model=data['model'],
            year=data['year'],
            vin=data.get('vin')
        )
        return jsonify({"msg": "Vehículo agregado exitosamente", "vehicle": new_vehicle.to_dict()}), 201
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        return jsonify({"msg": f"Error interno: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Listar Vehículos de un Cliente
# ==============================================================================
@clients_bp.route('/<int:client_id>/vehicles', methods=['GET'])
def get_client_vehicles(client_id):
    """
    Obtiene todos los vehículos asociados a un cliente.
    """
    try:
        vehicles = ClientService.get_client_vehicles(client_id)
        return jsonify([vehicle.to_dict() for vehicle in vehicles]), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 404
    except Exception as e:
        return jsonify({"msg": f"Error al obtener vehículos: {str(e)}"}), 500
