from flask import Blueprint, request, jsonify
from app import db
from app.models import Servicio
from flask_jwt_extended import jwt_required

# ==============================================================================
# ENCABEZADO DEL ARCHIVO (Controlador de Servicios)
# ==============================================================================
# Propósito:
#   Gestiona el catálogo de Servicios (Mano de Obra) ofrecidos por el taller.
#
# Flujo Lógico:
#   1. CRUD directo sobre el modelo `Servicio`.
#   2. Filtrado lógico (Activo/Inactivo) para no romper integridad de órdenes pasadas.
#
# Interacciones:
#   - Modelo: `Servicio`.
#   - Cliente: Módulo de Admin/Servicios en Frontend.
# ==============================================================================

services_bp = Blueprint('services', __name__)

# ==============================================================================
# Endpoint: Listar Servicios
# ==============================================================================
@services_bp.route('', methods=['GET'])
@jwt_required()
def get_services():
    """
    Obtiene el catálogo de servicios activos.
    """
    try:
        # Filtro Hardcoded: Solo servicios activos se muestran al usuario final
        services = Servicio.query.filter_by(activo=True).all()
        return jsonify([service.to_dict() for service in services]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==============================================================================
# Endpoint: Crear Servicio
# ==============================================================================
@services_bp.route('', methods=['POST'])
@jwt_required()
def create_service():
    """
    Registra un nuevo servicio en el catálogo.
    
    Request Body:
        nombre (str): Nombre del servicio.
        precio (float): Costo base.
        descripcion (str): Detalle opcional.
    """
    try:
        data = request.get_json()
        
        # Validaciones
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

        return jsonify({
            'message': 'Servicio creado exitosamente', 
            'service': new_service.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==============================================================================
# Endpoint: Actualizar Servicio
# ==============================================================================
@services_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_service(id):
    """
    Modifica precio o descripción de un servicio.
    """
    try:
        service = Servicio.query.get(id)
        if not service or not service.activo:
            return jsonify({'error': 'Servicio no encontrado'}), 404

        data = request.get_json()

        # Update parcial
        if 'nombre' in data:
            service.nombre = data['nombre']
        if 'descripcion' in data:
            service.descripcion = data['descripcion']
        if 'precio' in data:
            service.precio = float(data['precio'])

        db.session.commit()
        return jsonify({
            'message': 'Servicio actualizado', 
            'service': service.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==============================================================================
# Endpoint: Eliminar Servicio
# ==============================================================================
@services_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_service(id):
    """
    Realiza un borrado lógico del servicio (Soft Delete).
    """
    try:
        service = Servicio.query.get(id)
        if not service:
            return jsonify({'error': 'Servicio no encontrado'}), 404
        
        service.activo = False 
        db.session.commit()
        return jsonify({'message': 'Servicio eliminado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
