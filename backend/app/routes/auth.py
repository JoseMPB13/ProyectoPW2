from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
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
        nombre (str): Nombre del usuario.
        apellido_p (str): Apellido Paterno.
        apellido_m (str, optional): Apellido Materno.
        email (str): Correo electrónico.
        password (str): Contraseña.
        role (str, optional): Rol ('admin', 'mecanico', 'recepcion').
        celular (str, optional): Celular.

    Returns:
        JSON: Mensaje de éxito y datos del usuario creado.
    """
    data = request.get_json()

    # Validaciones básicas de entrada (HTTP layer)
    # Adaptamos para aceptar 'username' como 'nombre' por compatibilidad si es necesario
    nombre = data.get('nombre') or data.get('username')
    email = data.get('email') or data.get('correo')
    password = data.get('password')
    apellido_p = data.get('apellido_p', 'Apellido') # Default para evitar error si falta

    if not nombre or not email or not password:
        return jsonify({"msg": "Faltan datos obligatorios (nombre/username, email, password)"}), 400

    try:
        # Llamada al servicio
        new_user = AuthService.register_user(
            nombre=nombre,
            apellido_p=apellido_p,
            apellido_m=data.get('apellido_m'),
            correo=email,
            password=password,
            rol_nombre=data.get('role', 'recepcion'),
            celular=data.get('celular')
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

# ==============================================================================
# Endpoint: Listar Usuarios (Admin o Internal)
# ==============================================================================
@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """
    Obtiene lista de usuarios, opcionalmente filtrada por rol.
    Query Params: role
    """
    role = request.args.get('role', type=str)
    
    # Podríamos restringir esto solo a admins
    current_user_id = get_jwt_identity()
    user = AuthService.get_user_by_id(current_user_id)
    
    # Ejemplo de restricción muy básica (opcional)
    # Verificamos si user.rol existe y si su nombre es 'admin'
    # if not user.rol or user.rol.nombre_rol != 'admin':
    #     return jsonify({"msg": "Forbidden"}), 403

    users = AuthService.get_users_by_role(role)
    return jsonify([u.to_dict() for u in users]), 200

# ==============================================================================
# Endpoint: Obtener Usuario por ID
# ==============================================================================
@auth_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """
    Obtiene un usuario específico por ID.
    """
    user = AuthService.get_user_by_id(user_id)
    
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    
    return jsonify(user.to_dict()), 200

# ==============================================================================
# Endpoint: Actualizar Usuario
# ==============================================================================
@auth_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """
    Actualiza los datos de un usuario.
    """
    data = request.get_json()
    
    try:
        updated_user = AuthService.update_user(user_id, data)
        return jsonify({
            "msg": "Usuario actualizado exitosamente",
            "user": updated_user.to_dict()
        }), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 404
    except Exception as e:
        return jsonify({"msg": f"Error al actualizar usuario: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Eliminar Usuario
# ==============================================================================
@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """
    Elimina un usuario del sistema.
    """
    try:
        AuthService.delete_user(user_id)
        return jsonify({"msg": "Usuario eliminado exitosamente"}), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 404
    except Exception as e:
        return jsonify({"msg": f"Error al eliminar usuario: {str(e)}"}), 500
