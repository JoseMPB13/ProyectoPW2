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

    first_name = data.get('first_name') or data.get('nombre')
    last_name = data.get('last_name') or data.get('apellido_p')
    ci = data.get('ci')
    
    # Validamos campos obligatorios
    if not first_name or not last_name or not ci:
        return jsonify({"msg": "Nombre, Apellido y CI son obligatorios"}), 400

    try:
        new_client = ClientService.create_client(
            first_name=first_name,
            last_name=last_name,
            ci=ci,
            email=data.get('email') or data.get('correo'),
            phone=data.get('phone') or data.get('celular'),
            address=data.get('address') or data.get('direccion')
        )
        return jsonify({"msg": "Cliente creado exitosamente", "client": new_client.to_dict()}), 201
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        return jsonify({"msg": f"Error interno: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Actualizar Cliente
# ==============================================================================
@clients_bp.route('/<int:client_id>', methods=['PUT'])
def update_client(client_id):
    """
    Actualiza la información de un cliente.
    """
    data = request.get_json()
    try:
        updated_client = ClientService.update_client(
            client_id=client_id,
            nombre=data.get('nombre') or data.get('first_name'),
            apellido_p=data.get('apellido_p') or data.get('last_name'),
            apellido_m=data.get('apellido_m'),
            ci=data.get('ci'),
            correo=data.get('correo') or data.get('email'),
            celular=data.get('celular') or data.get('phone'),
            direccion=data.get('direccion') or data.get('address')
        )
        return jsonify({"msg": "Cliente actualizado exitosamente", "client": updated_client.to_dict()}), 200
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
        missing = [f for f in required_fields if f not in data]
        print(f"DEBUG: Faltan campos: {missing}. Data recibida: {data}")
        return jsonify({"msg": f"Faltan datos obligatorios: {', '.join(required_fields)}"}), 400

    try:
        new_vehicle = ClientService.add_vehicle(
            client_id=client_id,
            plate=data['plate'],
            brand=data['brand'],
            model=data['model'],
            year=data['year'],
            color=data.get('color') or data.get('vin') # Backward compatibility or new field
        )
        return jsonify({"msg": "Vehículo agregado exitosamente", "vehicle": new_vehicle.to_dict()}), 201
    except ValueError as e:
        print(f"DEBUG: ValueError en add_vehicle: {e}")
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        print(f"DEBUG: Exception en add_vehicle: {e}")
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

# ==============================================================================
# Endpoint: Actualizar Vehículo
# ==============================================================================
@clients_bp.route('/vehicles/<int:vehicle_id>', methods=['PUT'])
def update_vehicle(vehicle_id):
    """
    Actualiza los datos de un vehículo.
    """
    data = request.get_json()
    try:
        updated_vehicle = ClientService.update_vehicle(
            vehicle_id=vehicle_id,
            plate=data.get('plate'),
            brand=data.get('brand'),
            model=data.get('model'),
            year=data.get('year'),
            color=data.get('color') or data.get('vin')
        )
        return jsonify({"msg": "Vehículo actualizado", "vehicle": updated_vehicle.to_dict()}), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        return jsonify({"msg": f"Error interno: {str(e)}"}), 500
