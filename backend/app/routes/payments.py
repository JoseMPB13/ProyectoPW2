# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Pago, Orden, Auto, Cliente
from datetime import datetime
from sqlalchemy import text

# ==============================================================================
# ENCABEZADO DEL ARCHIVO (Controlador de Pagos)
# ==============================================================================
# Propósito:
#   Gestiona el ciclo de vida financiero de las órdenes de trabajo.
#   Permite registrar abonos, liquidar saldos y consultar históricos.
#
# Flujo Lógico Central:
#   1. Recepción de Intención de Pago.
#   2. Validación de Estado (Orden Finalizada/Entregada).
#   3. Verificación de Saldo (No sobrepagar).
#   4. Registro Transaccional del Pago.
#   5. Actualización de Balance de la Orden.
#
# Interacciones:
#   - Modelos: Pago, Orden, Cliente, Auto.
#   - Cliente HTTP: Módulo de Caja/Pagos del Frontend.
# ==============================================================================

payments_bp = Blueprint('payments', __name__, url_prefix='/payments')

# ==============================================================================
# Endpoint: Registrar Nuevo Pago
# ==============================================================================
@payments_bp.route('/', methods=['POST'])
@jwt_required()
def create_payment():
    """
    Registra un pago parcial o total asociado a una orden finalizada.
    
    Request Body:
        orden_id (int): ID de la orden.
        monto (float): Cantidad a abonar.
        metodo_pago (str): Efectivo, Tarjeta, Transferencia, etc.
        referencia (str, optional): Nro de operación bancaria o nota.
        
    Returns:
        201 Created: Pago exitoso y nuevo balance.
        400 Bad Request: Monto inválido, orden no finalizada o exceso de saldo.
    """
    try:
        data = request.get_json()
        
        # Validaciones de Entrada
        if not data:
            return jsonify({'msg': 'No se recibieron datos'}), 400
        
        orden_id = data.get('orden_id')
        monto = data.get('monto')
        metodo_pago = data.get('metodo_pago')
        referencia = data.get('referencia', '')
        
        if not all([orden_id, monto, metodo_pago]):
            return jsonify({'msg': 'Faltan campos requeridos: orden_id, monto, metodo_pago'}), 400
        
        # Validación Numérica (Monto)
        try:
            monto = float(monto)
            if monto <= 0:
                return jsonify({'msg': 'El monto debe ser mayor a 0'}), 400
        except (ValueError, TypeError):
            return jsonify({'msg': 'Monto invalido'}), 400
        
        # Validación de Negocio (Orden - Estado)
        work_order = Orden.query.get(orden_id)
        if not work_order:
            return jsonify({'msg': 'Orden no encontrada'}), 404
        
        # Regla: Solo se cobra por trabajos termiandos
        estado_orden = work_order.estado.nombre_estado if work_order.estado else None
        if estado_orden not in ['Finalizado', 'Entregado']:
            return jsonify({
                "msg": "No se puede registrar un pago para una orden que no ha sido finalizada",
                "estado_actual": estado_orden,
                "estados_permitidos": ["Finalizado", "Entregado"]
            }), 400
        
        # Regla: No se puede pagar más de lo adeudado
        saldo_pendiente = work_order.calcular_saldo_pendiente()
        if float(monto) > saldo_pendiente + 0.01:  # Tolerancia Floating Point
            return jsonify({
                "msg": "El monto del pago excede el saldo pendiente",
                "monto_solicitado": float(monto),
                "saldo_pendiente": saldo_pendiente,
                "total_orden": work_order.total_estimado
            }), 400
        
        # Ejecución Transaccional
        usuario_id = get_jwt_identity()
        fecha_pago = datetime.now()
        
        nuevo_pago = Pago(
            orden_id=orden_id,
            monto=monto,
            metodo_pago=metodo_pago,
            referencia=referencia,
            fecha_pago=fecha_pago,
            usuario_id=usuario_id,
            activo=True
        )
        
        db.session.add(nuevo_pago)
        db.session.commit()
        
        # Respuesta Enriquecida con nuevo estado financiero
        balance = {
            'total_orden': work_order.total_estimado,
            'total_pagado': work_order.calcular_total_pagado(),
            'saldo_pendiente': work_order.calcular_saldo_pendiente(),
            'pagado_completamente': work_order.esta_pagado_completamente()
        }
        
        return jsonify({
            'msg': 'Pago registrado exitosamente',
            'payment': {
                'id': nuevo_pago.id,
                'orden_id': orden_id,
                'monto': monto,
                'metodo_pago': metodo_pago,
                'referencia': referencia,
                'fecha_pago': fecha_pago.isoformat()
            },
            'balance': balance
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error al crear pago: {str(e)}")
        return jsonify({'msg': 'Error al crear el pago', 'error': str(e)}), 500


# ==============================================================================
# Endpoint: Historial de Pagos
# ==============================================================================
@payments_bp.route('/history', methods=['GET'])
@jwt_required()
def get_payment_history():
    """
    Consulta transacciones pasadas con filtros opcionales.
    Realiza JOINs complejos para devolver contexto del Cliente y Auto.
    """
    try:
        # Filtros
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        per_page = int(request.args.get('per_page', 1000))
        
        # Query Builder con JOINs
        query = db.session.query(
            Pago.id,
            Pago.orden_id,
            Pago.monto,
            Pago.metodo_pago,
            Pago.referencia,
            Pago.fecha_pago,
            Cliente.nombre.label('cliente_nombre'),
            Cliente.apellido_p.label('cliente_apellido'),
            Auto.placa
        ).join(
            Orden, Pago.orden_id == Orden.id
        ).join(
            Auto, Orden.auto_id == Auto.id
        ).join(
            Cliente, Auto.cliente_id == Cliente.id
        ).filter(
            Pago.activo == True
        )
        
        if fecha_inicio:
            query = query.filter(Pago.fecha_pago >= fecha_inicio)
        if fecha_fin:
            query = query.filter(Pago.fecha_pago <= fecha_fin)
        
        query = query.order_by(Pago.fecha_pago.desc())
        
        payments = query.limit(per_page).all()
        
        # Serialización Manual
        result = []
        for p in payments:
            result.append({
                'id': p.id,
                'orden_id': p.orden_id,
                'monto': float(p.monto),
                'metodo_pago': p.metodo_pago,
                'referencia': p.referencia or '',
                'fecha_pago': p.fecha_pago.isoformat() if p.fecha_pago else None,
                'cliente_nombre': f"{p.cliente_nombre} {p.cliente_apellido or ''}".strip(),
                'placa': p.placa
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error al obtener historial de pagos: {str(e)}")
        return jsonify({'msg': 'Error al obtener historial', 'error': str(e)}), 500


# ==============================================================================
# Endpoint: Detalle de Pago Individual
# ==============================================================================
@payments_bp.route('/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    """
    Recupera información puntual de un recibo o pago por ID.
    Usa SQL crudo (text) para performance en consultas complejas.
    """
    try:
        query = text("""
            SELECT 
                p.id,
                p.orden_id,
                p.monto,
                p.metodo_pago,
                p.referencia,
                p.fecha_pago,
                c.nombre as cliente_nombre,
                c.apellido_p as cliente_apellido,
                a.placa,
                o.total_estimado
            FROM pagos p
            JOIN ordenes o ON p.orden_id = o.id
            JOIN autos a ON o.auto_id = a.id
            JOIN clientes c ON a.cliente_id = c.id
            WHERE p.id = :payment_id AND p.activo = TRUE
        """)
        
        result = db.session.execute(query, {'payment_id': payment_id}).fetchone()
        
        if not result:
            return jsonify({'msg': 'Pago no encontrado'}), 404
        
        payment_data = {
            'id': result.id,
            'orden_id': result.orden_id,
            'monto': float(result.monto),
            'metodo_pago': result.metodo_pago,
            'referencia': result.referencia or '',
            'fecha_pago': result.fecha_pago.isoformat() if result.fecha_pago else None,
            'cliente_nombre': f"{result.cliente_nombre} {result.cliente_apellido or ''}".strip(),
            'placa': result.placa,
            'total_orden': float(result.total_estimado) if result.total_estimado else 0
        }
        
        return jsonify(payment_data), 200
        
    except Exception as e:
        print(f"Error al obtener pago: {str(e)}")
        return jsonify({'msg': 'Error al obtener el pago', 'error': str(e)}), 500


# ==============================================================================
# Endpoint: Resumen de Ingresos (KPI)
# ==============================================================================
@payments_bp.route('/revenue', methods=['GET'])
@jwt_required()
def get_revenue_summary():
    """
    Calcula totales para KPIs financieros.
    """
    try:
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        
        query = db.session.query(
            db.func.sum(Pago.monto).label('total_ingresos'),
            db.func.count(Pago.id).label('total_pagos')
        ).filter(Pago.activo == True)
        
        if fecha_inicio:
            query = query.filter(Pago.fecha_pago >= fecha_inicio)
        if fecha_fin:
            query = query.filter(Pago.fecha_pago <= fecha_fin)
        
        result = query.first()
        
        summary = {
            'total_ingresos': float(result.total_ingresos) if result.total_ingresos else 0.0,
            'total_pagos': int(result.total_pagos) if result.total_pagos else 0
        }
        
        return jsonify(summary), 200
        
    except Exception as e:
        print(f"Error al obtener resumen de ingresos: {str(e)}")
        return jsonify({'msg': 'Error al obtener resumen', 'error': str(e)}), 500


# ==============================================================================
# Endpoint: Balance de Cuenta de Orden
# ==============================================================================
@payments_bp.route('/order/<int:orden_id>/balance', methods=['GET'])
@jwt_required()
def get_order_payment_balance(orden_id):
    """
    Estado de cuenta detallado de una orden.
    Retorna cuánto se estimó, cuánto se ha pagado y el remanente.
    """
    try:
        orden = Orden.query.get(orden_id)
        if not orden:
            return jsonify({'msg': 'Orden no encontrada'}), 404
        
        pagos = Pago.query.filter_by(orden_id=orden_id, activo=True).all()
        
        pagos_list = []
        for pago in pagos:
            pagos_list.append({
                'id': pago.id,
                'monto': float(pago.monto),
                'metodo_pago': pago.metodo_pago,
                'referencia': pago.referencia or '',
                'fecha_pago': pago.fecha_pago.isoformat() if pago.fecha_pago else None
            })
        
        balance = {
            'orden_id': orden_id,
            'total_estimado': float(orden.total_estimado) if orden.total_estimado else 0.0,
            'total_pagado': orden.calcular_total_pagado(),
            'saldo_pendiente': orden.calcular_saldo_pendiente(),
            'pagado_completamente': orden.esta_pagado_completamente(),
            'estado_orden': orden.estado.nombre_estado if orden.estado else None,
            'pagos': pagos_list
        }
        
        return jsonify(balance), 200
        
    except Exception as e:
        print(f"Error al obtener balance de pagos: {str(e)}")
        return jsonify({'msg': 'Error al obtener balance', 'error': str(e)}), 500
