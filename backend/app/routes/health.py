from flask import Blueprint, jsonify

# ==============================================================================
# ENCABEZADO DEL ARCHIVO (Health Check)
# ==============================================================================
# Propósito:
#   Punto de verificación de estado del sistema (Heartbeat).
#   Utilizado por monitores de uptime y balanceadores de carga.
#
# Interacciones:
#   - Infraestructura (AWS, Docker, K8s).
#   - Frontend (Verificación inicial de conexión).
# ==============================================================================

health_bp = Blueprint("health", __name__)

# ==============================================================================
# Endpoint: Estado del Sistema
# ==============================================================================
@health_bp.route("/health", methods=["GET"])
def health():
    """
    Retorna estado positivo si el servidor de aplicación está activo.
    Idealmente verificaría también conexión a DB.
    
    Returns:
        JSON: { status: 'ok', ... }
    """
    return jsonify({
        "status": "ok",
        "message": "Backend Taller Negreira funcionando"
    })
