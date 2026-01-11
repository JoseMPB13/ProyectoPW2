from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
from app.models import User
from flask_jwt_extended import jwt_required, get_jwt_identity

# Creamos el Blueprint para las rutas de autenticación
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# ==============================================================================
# Endpoint: Registro de Usuario
# ==============================================================================
@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Registra un nuevo usuario en el sistema.
    Espera un JSON con: username, email, password, role (opcional).
    """
    data = request.get_json()

    # Validaciones básicas de entrada
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Faltan datos obligatorios"}), 400

    try:
        new_user = AuthService.register_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role=data.get('role', 'recepcion')
        )
        return jsonify({"msg": "Usuario registrado exitosamente", "user": new_user.to_dict()}), 201
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        return jsonify({"msg": f"Error al registrar usuario: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Login (Inicio de Sesión)
# ==============================================================================
@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Autentica un usuario y devuelve un token JWT.
    Espera un JSON con: email, password.
    """
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Faltan credenciales"}), 400

    result = AuthService.login_user(data['email'], data['password'])

    if not result:
        return jsonify({"msg": "Credenciales inválidas"}), 401

    return jsonify({
        "msg": "Inicio de sesión exitoso",
        "access_token": result['access_token'],
        "user": result['user'].to_dict()
    }), 200

# ==============================================================================
# Endpoint: Obtener Usuario Actual (Protected)
# ==============================================================================
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Devuelve la información del usuario actualmente autenticado.
    Requiere un token JWT válido en el header Authorization.
    """
    # Obtener la identidad del token (el ID del usuario que guardamos en login)
    current_user_id = get_jwt_identity()
    
    user = AuthService.get_user_by_id(current_user_id)
    
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    return jsonify(user.to_dict()), 200
