from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
from app.models import User
from flask_jwt_extended import jwt_required, get_jwt_identity

# ==============================================================================
# Capa de RUTAS (Controlador) - Autenticación
# ==============================================================================
# Maneja el registro, login y obtención de datos del usuario actual.
# Delega toda la lógica de validación de negocio y BD a AuthService.
# ==============================================================================

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# ==============================================================================
# Endpoint: Registro de Usuario
# ==============================================================================
@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Registra un nuevo usuario en el sistema.

    Request Body:
        username (str): Nombre de usuario.
        email (str): Correo electrónico.
        password (str): Contraseña.
        role (str, optional): Rol ('admin', 'mecanico', 'recepcion').

    Returns:
        JSON: Mensaje de éxito y datos del usuario creado.
    """
    data = request.get_json()

    # Validaciones básicas de entrada (HTTP layer)
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Faltan datos obligatorios"}), 400

    try:
        # Llamada al servicio
        new_user = AuthService.register_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role=data.get('role', 'recepcion')
        )
        return jsonify({"msg": "Usuario registrado exitosamente", "user": new_user.to_dict()}), 201
    except ValueError as e:
        # Errores de negocio (ej: usuario duplicado) -> 400 Bad Request
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        # Errores inesperados -> 500 Internal Server Error
        return jsonify({"msg": f"Error al registrar usuario: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Login (Inicio de Sesión)
# ==============================================================================
@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Autentica un usuario y devuelve un token JWT.

    Request Body:
        email (str): Correo electrónico.
        password (str): Contraseña.

    Returns:
        JSON: Token de acceso y datos del usuario.
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
    
    Requiere Header Authorization: Bearer <token>
    """
    # Obtener la identidad del token (el ID del usuario)
    current_user_id = get_jwt_identity()
    
    user = AuthService.get_user_by_id(current_user_id)
    
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    return jsonify(user.to_dict()), 200
