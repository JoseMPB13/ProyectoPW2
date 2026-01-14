from flask import Blueprint, request, jsonify
from app import db
from app.models import Service

services_bp = Blueprint('services', __name__)

# ==============================================================================
# Obtener todos los servicios
# ==============================================================================
@services_bp.route('', methods=['GET'])
def get_services():
    try:
        services = Service.query.all()
        return jsonify([service.to_dict() for service in services]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==============================================================================
# Crear un nuevo servicio
# ==============================================================================
@services_bp.route('', methods=['POST'])
def create_service():
    try:
        data = request.get_json()
        
        # Validaciones
        if not data.get('name'):
            return jsonify({'error': 'El nombre es obligatorio'}), 400
        if data.get('base_price') is None:
            return jsonify({'error': 'El precio base es obligatorio'}), 400

        new_service = Service(
            name=data['name'],
            description=data.get('description', ''),
            base_price=float(data['base_price'])
        )

        db.session.add(new_service)
        db.session.commit()

        return jsonify({'message': 'Servicio creado exitosamente', 'service': new_service.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==============================================================================
# Actualizar un servicio
# ==============================================================================
@services_bp.route('/<int:id>', methods=['PUT'])
def update_service(id):
    try:
        service = Service.query.get_or_404(id)
        data = request.get_json()

        if 'name' in data:
            service.name = data['name']
        if 'description' in data:
            service.description = data['description']
        if 'base_price' in data:
            service.base_price = float(data['base_price'])

        db.session.commit()
        return jsonify({'message': 'Servicio actualizado', 'service': service.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==============================================================================
# Eliminar un servicio
# ==============================================================================
@services_bp.route('/<int:id>', methods=['DELETE'])
def delete_service(id):
    try:
        service = Service.query.get_or_404(id)
        db.session.delete(service)
        db.session.commit()
        return jsonify({'message': 'Servicio eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
