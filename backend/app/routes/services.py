from flask import Blueprint, request, jsonify
from app import db
from app.models import Servicio
from flask_jwt_extended import jwt_required

services_bp = Blueprint('services', __name__)

# ==============================================================================
# Obtener todos los servicios
# ==============================================================================
@services_bp.route('', methods=['GET'])
@jwt_required()
def get_services():
    try:
        # Solo mostrar servicios activos
        services = Servicio.query.filter_by(activo=True).all()
        return jsonify([service.to_dict() for service in services]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==============================================================================
# Crear un nuevo servicio
# ==============================================================================
@services_bp.route('', methods=['POST'])
@jwt_required()
def create_service():
    try:
        data = request.get_json()
        
        # Validaciones de nuevos campos
        # Antes era 'name', 'base_price' -> Ahora 'nombre', 'precio'
        if not data.get('nombre'):
            return jsonify({'error': 'El nombre es obligatorio'}), 400
        if data.get('precio') is None:
            return jsonify({'error': 'El precio es obligatorio'}), 400

        new_service = Servicio(
            nombre=data['nombre'],
            descripcion=data.get('descripcion', ''),
            precio=float(data['precio']),
            activo=True
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
@jwt_required()
def update_service(id):
    try:
        service = Servicio.query.get(id)
        if not service or not service.activo:
            return jsonify({'error': 'Servicio no encontrado'}), 404

        data = request.get_json()

        if 'nombre' in data:
            service.nombre = data['nombre']
        if 'descripcion' in data:
            service.descripcion = data['descripcion']
        if 'precio' in data:
            service.precio = float(data['precio'])

        db.session.commit()
        return jsonify({'message': 'Servicio actualizado', 'service': service.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==============================================================================
# Eliminar un servicio
# ==============================================================================
@services_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_service(id):
    try:
        service = Servicio.query.get(id)
        if not service:
            return jsonify({'error': 'Servicio no encontrado'}), 404
        
        service.activo = False # Borrado lógico
        db.session.commit()
        return jsonify({'message': 'Servicio eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
