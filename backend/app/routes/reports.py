from flask import Blueprint, jsonify
from app.services.report_service import ReportService
from app.services.auth_service import AuthService
from flask_jwt_extended import jwt_required, get_jwt_identity

# ==============================================================================
# Capa de RUTAS (Controlador) - Reports
# ==============================================================================
# Endpoints de solo lectura para dashboards y métricas.
# ==============================================================================

reports_bp = Blueprint('reports', __name__, url_prefix='/reports')

# ==============================================================================
# Endpoint: Dashboard (Métricas)
# ==============================================================================
@reports_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_metrics():
    """
    Devuelve métricas clave para el panel de administración.
    Accesible para todos los usuarios autenticados.

    Returns:
        JSON: Métricas mensuales.
    """
    try:
        # Delegamos la lógica de agregación al servicio
        metrics = ReportService.get_monthly_metrics()
        return jsonify(metrics), 200

    except Exception as e:
        return jsonify({"msg": f"Error al generar reporte: {str(e)}"}), 500

