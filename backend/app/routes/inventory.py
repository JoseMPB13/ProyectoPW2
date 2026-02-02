from flask import Blueprint, request, jsonify
from app import db
from app.models import Repuesto
from flask_jwt_extended import jwt_required

# ==============================================================================
# ENCABEZADO DEL ARCHIVO (Controlador/Módulo)
# ==============================================================================
# Propósito:
#   Gestiona el catálogo de Repuestos y el Inventario.
#   Permite consultar disponibilidad, crear nuevos items y ajustar stock.
#
# Flujo Lógico:
#   1. CRUD directo sobre el modelo `Repuesto`.
#   2. Búsqueda simple por nombre/marca para autocompletado en órdenes.
#   3. Borrado Lógico (`activo=False`) para mantener integridad histórica.
#
# Interacciones:
#   - Modelo: `Repuesto`.
#   - Cliente: Módulo de Inventario en Frontend.
# ==============================================================================

inventory_bp = Blueprint('inventory', __name__)

# ==============================================================================
# Endpoint: Listar Repuestos (Catálogo)
# ==============================================================================
@inventory_bp.route('/parts', methods=['GET'])
@jwt_required()
def get_parts():
    """
    Obtiene el inventario de repuestos con opción de búsqueda.
    
    Query Params:
        search (str): Término para filtrar por nombre o marca (insensible a mayúsculas).
        
    Returns:
        200 OK: Lista JSON de repuestos activos.
    """
    try:
        search = request.args.get('search', type=str)
        # Filtramos siempre por activos para no mostrar históricos borrados
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
    Ingresa un nuevo tipo de repuesto al sistema.
    
    Request Body:
        nombre (str): Nombre descriptivo.
        marca (str): Fabricante.
        precio_venta (float): Precio unitario para el cliente.
        stock (int): Cantidad inicial disponible.
        stock_minimo (int): Punto de re-orden (Alerta).
        
    Returns:
        201 Created: Repuesto creado.
    """
    data = request.get_json()
    
    # Validación simple requerida
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
        
        return jsonify({
            "msg": "Repuesto creado exitosamente", 
            "part": new_part.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error al crear repuesto: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Actualizar Repuesto
# ==============================================================================
@inventory_bp.route('/parts/<int:id>', methods=['PUT'])
@jwt_required()
def update_part(id):
    """
    Actualiza la información de un repuesto existente.
    
    Args:
        id (int): ID del repuesto.
        
    Request Body:
        Campos a actualizar (nombre, stock, precio, etc.).
    """
    try:
        part = Repuesto.query.get(id)
        if not part or not part.activo:
            return jsonify({"msg": "Repuesto no encontrado"}), 404

        data = request.get_json()
        
        # Patch manual campo por campo
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
    """
    Realiza un borrado lógico (Soft Delete) del repuesto.
    No se elimina físicamente para no romper integridad de órdenes pasadas.
    """
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
