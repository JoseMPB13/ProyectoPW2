from flask import Blueprint, jsonify
from app.services.report_service import ReportService
from app.models import User
from flask_jwt_extended import jwt_required, get_jwt_identity

# Creamos el Blueprint para los reportes
reports_bp = Blueprint('reports', __name__, url_prefix='/reports')

# ==============================================================================
# Endpoint: Dashboard (Métricas)
# ==============================================================================
@reports_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_metrics():
    """
    Devuelve métricas clave para el panel de administración.
    Solo accesible para administradores.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    # Verificación de rol (Admin only)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Acceso denegado. Se requieren permisos de administrador"}), 403

    try:
        metrics = ReportService.get_monthly_metrics()
        return jsonify(metrics), 200

    except Exception as e:
        return jsonify({"msg": f"Error al generar reporte: {str(e)}"}), 500
