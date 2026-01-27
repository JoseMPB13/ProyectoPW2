from flask import Blueprint, request, jsonify
from app import db
from app.models import Repuesto
from flask_jwt_extended import jwt_required

inventory_bp = Blueprint('inventory', __name__)

# ==============================================================================
# Endpoint: Listar Repuestos
# ==============================================================================
@inventory_bp.route('/parts', methods=['GET'])
@jwt_required()
def get_parts():
    """
    Obtiene la lista de repuestos.
    Query Params: search (nombre o marca)
    """
    try:
        search = request.args.get('search', type=str)
        query = Repuesto.query.filter_by(activo=True)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Repuesto.nombre.ilike(search_term)) | 
                (Repuesto.marca.ilike(search_term))
            )
        
        parts = query.all()
        return jsonify([p.to_dict() for p in parts]), 200
    except Exception as e:
        return jsonify({"msg": f"Error al obtener repuestos: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Crear Repuesto
# ==============================================================================
@inventory_bp.route('/parts', methods=['POST'])
@jwt_required()
def create_part():
    """
    Crea un nuevo repuesto en el inventario.
    """
    data = request.get_json()
    if not data or not data.get('nombre') or data.get('precio_venta') is None:
        return jsonify({"msg": "Faltan datos obligatorios (nombre, precio_venta)"}), 400

    try:
        new_part = Repuesto(
            nombre=data['nombre'],
            marca=data.get('marca'),
            precio_venta=float(data['precio_venta']),
            stock=int(data.get('stock', 0)),
            stock_minimo=int(data.get('stock_minimo', 5)),
            activo=True
        )
        db.session.add(new_part)
        db.session.commit()
        return jsonify({"msg": "Repuesto creado exitosamente", "part": new_part.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error al crear repuesto: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Actualizar Repuesto
# ==============================================================================
@inventory_bp.route('/parts/<int:id>', methods=['PUT'])
@jwt_required()
def update_part(id):
    try:
        part = Repuesto.query.get(id)
        if not part or not part.activo:
            return jsonify({"msg": "Repuesto no encontrado"}), 404

        data = request.get_json()
        if 'nombre' in data:
            part.nombre = data['nombre']
        if 'marca' in data:
            part.marca = data['marca']
        if 'precio_venta' in data:
            part.precio_venta = float(data['precio_venta'])
        if 'stock' in data:
            part.stock = int(data['stock'])
        if 'stock_minimo' in data:
            part.stock_minimo = int(data['stock_minimo'])

        db.session.commit()
        return jsonify({"msg": "Repuesto actualizado", "part": part.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error al actualizar repuesto: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Eliminar Repuesto (Logico)
# ==============================================================================
@inventory_bp.route('/parts/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_part(id):
    try:
        part = Repuesto.query.get(id)
        if not part:
            return jsonify({"msg": "Repuesto no encontrado"}), 404
        
        part.activo = False # Borrado lógico
        db.session.commit()
        return jsonify({"msg": "Repuesto eliminado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error al eliminar repuesto: {str(e)}"}), 500
