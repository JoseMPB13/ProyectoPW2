from flask import Blueprint, request, jsonify
from app import db
from app.models import Payment, WorkOrder
from sqlalchemy import func
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
    
    # Validación de datos básicos
    if not data or not data.get('work_order_id') or not data.get('amount') or not data.get('payment_method'):
        return jsonify({"msg": "Faltan datos obligatorios (work_order_id, amount, payment_method)"}), 400

    work_order_id = data.get('work_order_id')
    amount = data.get('amount')
    payment_method = data.get('payment_method')
    status = data.get('status', 'pagado') # Por defecto pagado si no se especifica

    # Verificar existencia de la orden
    work_order = WorkOrder.query.get(work_order_id)
    if not work_order:
        return jsonify({"msg": "Orden de trabajo no encontrada"}), 404

    try:
        new_payment = Payment(
            work_order_id=work_order_id,
            amount=float(amount),
            payment_method=payment_method,
            status=status
        )
        db.session.add(new_payment)
        db.session.commit()
        
        return jsonify({
            "msg": "Pago registrado exitosamente",
            "payment": new_payment.to_dict()
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
        
        pagination = Payment.query.order_by(Payment.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'items': [p.to_dict() for p in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': pagination.page,
            'per_page': pagination.per_page
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
    Genera un resumen de ingresos totales.
    """
    try:
        # Sumar todos los pagos con status 'pagado'
        total_revenue = db.session.query(func.sum(Payment.amount)).filter(Payment.status == 'pagado').scalar() or 0.0
        
        # Desglose por método de pago
        revenue_by_method = db.session.query(
            Payment.payment_method, 
            func.sum(Payment.amount)
        ).filter(Payment.status == 'pagado').group_by(Payment.payment_method).all()
        
        method_summary = {method: amount for method, amount in revenue_by_method}

        return jsonify({
            "total_revenue": total_revenue,
            "by_method": method_summary
        }), 200
    except Exception as e:
        return jsonify({"msg": f"Error al generar resumen: {str(e)}"}), 500
