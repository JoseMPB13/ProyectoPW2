from flask import Blueprint, request, jsonify
from app import db
from app.models import Orden
from sqlalchemy import func, text
from flask_jwt_extended import jwt_required


# ==============================================================================
# Capa de RUTAS (Controlador) - Payments
# ==============================================================================
payments_bp = Blueprint('payments', __name__, url_prefix='/payments')

# ==============================================================================
# Endpoint: Crear Pago
# ==============================================================================
@payments_bp.route('/', methods=['POST'])
@jwt_required()
def create_payment():
    """
    Registra un nuevo pago asociado a una orden de trabajo.
    """
    data = request.get_json()
    
    # Aceptar tanto orden_id como work_order_id para compatibilidad
    orden_id = data.get('orden_id') or data.get('work_order_id')
    monto = data.get('monto') or data.get('amount')
    metodo_pago = data.get('metodo_pago') or data.get('payment_method')
    
    # Validación de datos básicos
    if not orden_id or not monto or not metodo_pago:
        return jsonify({"msg": "Faltan datos obligatorios (orden_id, monto, metodo_pago)"}), 400

    # Verificar existencia de la orden
    work_order = Orden.query.get(orden_id)
    if not work_order:
        return jsonify({"msg": "Orden de trabajo no encontrada"}), 404

    try:
        # Insertar pago con SQL directo
        query = text("""
            INSERT INTO pagos (orden_id, monto, metodo_pago, activo)
            VALUES (:orden_id, :monto, :metodo_pago, :activo)
            RETURNING id
        """)
        
        result = db.session.execute(query, {
            'orden_id': orden_id,
            'monto': float(monto),
            'metodo_pago': metodo_pago,
            'activo': True
        })
        
        pago_id = result.scalar()
        db.session.commit()
        
        return jsonify({
            "msg": "Pago registrado exitosamente",
            "payment": {
                "id": pago_id,
                "orden_id": orden_id,
                "monto": float(monto),
                "metodo_pago": metodo_pago
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error al registrar pago: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Historial de Pagos
# ==============================================================================
@payments_bp.route('/history', methods=['GET'])
@jwt_required()
def get_payment_history():
    """
    Obtiene el historial de pagos paginado.
    Query Params: page, per_page
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Consulta SQL directa para obtener pagos
        query = text("""
            SELECT 
                p.id,
                p.orden_id,
                p.monto,
                p.metodo_pago,
                p.fecha_pago,
                p.activo,
                a.placa as orden_placa,
                o.total_estimado as orden_total
            FROM pagos p
            LEFT JOIN ordenes o ON p.orden_id = o.id
            LEFT JOIN autos a ON o.auto_id = a.id
            WHERE p.activo = true
            ORDER BY p.fecha_pago DESC
            LIMIT :per_page OFFSET :offset
        """)
        
        count_query = text("SELECT COUNT(*) FROM pagos WHERE activo = true")
        
        offset = (page - 1) * per_page
        result = db.session.execute(query, {'per_page': per_page, 'offset': offset})
        total = db.session.execute(count_query).scalar()
        
        payments = []
        for row in result:
            payments.append({
                'id': row.id,
                'orden_id': row.orden_id,
                'monto': float(row.monto) if row.monto else 0.0,
                'metodo_pago': row.metodo_pago,
                'fecha_pago': row.fecha_pago.isoformat() if row.fecha_pago else None,
                'activo': row.activo,
                'orden_placa': row.orden_placa,
                'orden_total': float(row.orden_total) if row.orden_total else 0.0
            })
        
        pages = (total + per_page - 1) // per_page
        
        return jsonify({
            'items': payments,
            'total': total,
            'pages': pages,
            'current_page': page,
            'per_page': per_page
        }), 200
    except Exception as e:
        return jsonify({"msg": f"Error al obtener historial: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Resumen de Ingresos
# ==============================================================================
@payments_bp.route('/revenue', methods=['GET'])
@jwt_required()
def get_revenue_summary():
    """
    Genera un resumen de ingresos totales, con filtrado opcional por fechas.
    Query Params: fecha_inicio (YYYY-MM-DD), fecha_fin (YYYY-MM-DD)
    """
    try:
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        
        # Base queries
        base_where = "WHERE activo = true"
        params = {}
        
        if fecha_inicio:
            base_where += " AND fecha_pago >= :fecha_inicio"
            params['fecha_inicio'] = fecha_inicio
            
        if fecha_fin:
            # Asumimos fin del día o comparamos fecha
            base_where += " AND fecha_pago <= :fecha_fin"
            # Ajustar para incluir todo el día si es necesario, pero simple string comparison works for standard format often
            # Mejor usar cast a date o timestamp
            params['fecha_fin'] = f"{fecha_fin} 23:59:59"

        # 1. Total Ingresos (Sum)
        sum_sql = text(f"SELECT COALESCE(SUM(monto), 0.0) FROM pagos {base_where}")
        total_revenue = db.session.execute(sum_sql, params).scalar()
        
        # 2. Total Pagos (Count)
        count_sql = text(f"SELECT COUNT(*) FROM pagos {base_where}")
        total_count = db.session.execute(count_sql, params).scalar()
        
        # 3. Desglose por método
        method_sql = text(f"""
            SELECT metodo_pago, SUM(monto) as total
            FROM pagos
            {base_where}
            GROUP BY metodo_pago
        """)
        
        result = db.session.execute(method_sql, params)
        method_summary = {row.metodo_pago: float(row.total) for row in result}

        return jsonify({
            "total_ingresos": float(total_revenue),
            "total_pagos": int(total_count),
            "by_method": method_summary
        }), 200
    except Exception as e:
        return jsonify({"msg": f"Error al generar resumen: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Obtener Pago por ID
# ==============================================================================
@payments_bp.route('/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment_by_id(payment_id):
    """
    Obtiene un pago específico por ID.
    """
    try:
        query = text("""
            SELECT 
                p.id,
                p.orden_id,
                p.monto,
                p.metodo_pago,
                p.fecha_pago,
                p.activo,
                a.placa as orden_placa,
                o.total_estimado as orden_total
            FROM pagos p
            LEFT JOIN ordenes o ON p.orden_id = o.id
            LEFT JOIN autos a ON o.auto_id = a.id
            WHERE p.id = :payment_id AND p.activo = true
        """)
        
        result = db.session.execute(query, {'payment_id': payment_id}).fetchone()
        
        if not result:
            return jsonify({"msg": "Pago no encontrado"}), 404
        
        payment = {
            'id': result.id,
            'orden_id': result.orden_id,
            'monto': float(result.monto) if result.monto else 0.0,
            'metodo_pago': result.metodo_pago,
            'fecha_pago': result.fecha_pago.isoformat() if result.fecha_pago else None,
            'activo': result.activo,
            'orden_placa': result.orden_placa,
            'orden_total': float(result.orden_total) if result.orden_total else 0.0
        }
        
        return jsonify(payment), 200
    except Exception as e:
        return jsonify({"msg": f"Error al obtener pago: {str(e)}"}), 500
