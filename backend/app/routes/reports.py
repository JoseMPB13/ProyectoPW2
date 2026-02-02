from flask import Blueprint, jsonify
from app.services.report_service import ReportService
from flask_jwt_extended import jwt_required

# ==============================================================================
# ENCABEZADO DEL ARCHIVO (Controlador de Reportes)
# ==============================================================================
# Propósito:
#   Endpoints de solo lectura para la generación de Dashboards y Reportes.
#   Centraliza la entrega de métricas de negocio.
#
# Interacciones:
#   - ReportService: Lógica de agregación y cálculo.
# ==============================================================================

reports_bp = Blueprint('reports', __name__, url_prefix='/reports')

# ==============================================================================
# Endpoint: Dashboard (Métricas)
# ==============================================================================
@reports_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_metrics():
    """
    Devuelve las métricas consolidadas para el Dashboard Principal.
    
    Datos incluidos:
        - Ingresos Totales.
        - Órdenes por Estado.
        - Totales de Clientes y Vehículos.
        - Alertas de Stock.
    
    Returns:
        JSON: Estructura de métricas lista para renderizado.
    """
    try:
        # Delegación completa al servicio.
        # El controlador solo actúa como pasarela HTTP.
        metrics = ReportService.get_monthly_metrics()
        return jsonify(metrics), 200

    except Exception as e:
        return jsonify({"msg": f"Error al generar reporte: {str(e)}"}), 500
