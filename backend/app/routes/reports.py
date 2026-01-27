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
    Solo accesible para administradores.

    Returns:
        JSON: Métricas mensuales.
    """
    current_user_id = get_jwt_identity()
    user = AuthService.get_user_by_id(current_user_id)

    # Verificación de rol (Admin only) 
    # user.rol es la relación con el objeto Role (nombre_rol)
    if not user or not user.rol or user.rol.nombre_rol != 'admin':
        return jsonify({"msg": "Acceso denegado. Se requieren permisos de administrador"}), 403

    try:
        # Delegamos la lógica de agregación al servicio
        metrics = ReportService.get_monthly_metrics()
        return jsonify(metrics), 200

    except Exception as e:
        return jsonify({"msg": f"Error al generar reporte: {str(e)}"}), 500
