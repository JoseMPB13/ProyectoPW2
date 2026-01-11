from flask import Blueprint, jsonify

# ==============================================================================
# Endpoint de Salud (Health Check)
# ==============================================================================
# Utilizado por balanceadores de carga o sistemas de monitoreo para verificar
# que el backend está corriendo y respondiendo.
# ==============================================================================

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health():
    """
    Endpoint simple para verificar el estado del servidor.

    Returns:
        JSON: Estado 'ok' y mensaje de funcionamiento.
    """
    return jsonify({
        "status": "ok",
        "message": "Backend Taller Negreira funcionando"
    })
