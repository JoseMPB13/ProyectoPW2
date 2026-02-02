from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
from flask_jwt_extended import jwt_required, get_jwt_identity

# ==============================================================================
# ENCABEZADO DEL ARCHIVO (Visión Macro)
# ==============================================================================
# Propósito:
#   Este módulo define el Controlador de Autenticación (`auth_bp`). 
#   Actúa como la puerta de entrada para todas las operaciones relacionadas con 
#   la gestión de usuarios y sesiones (registro, inicio de sesión, perfil, CRUD de usuarios).
#
# Flujo Lógico Central:
#   1. Recibe la solicitud HTTP (GET, POST, PUT, DELETE).
#   2. Extrae y valida datos básicos de la petición (JSON body, Path params).
#   3. Delega la lógica de negocio al servicio `AuthService`.
#   4. Maneja las excepciones (Errores de negocio vs Errores de servidor).
#   5. Retorna una respuesta JSON estandarizada con el código HTTP adecuado.
#
# Interacciones:
#   - Llamado por: Cliente Frontend (Web/Mobile) vía HTTP.
#   - Llama a: `AuthService` (Lógica de negocio y acceso a BD).
# ==============================================================================

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# ==============================================================================
# Endpoint: Registro de Usuario
# ==============================================================================
@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Registra un nuevo usuario en el sistema.

    Descripción:
        Recibe los datos del formulario de registro, valida los campos obligatorios
        y solicita al servicio de autenticación la creación del usuario.

    Args (Request Body):
        nombre (str): Nombre del usuario.
        apellido_p (str): Apellido Paterno.
        apellido_m (str, optional): Apellido Materno.
        email (str): Correo electrónico (debe ser único).
        password (str): Contraseña en texto plano.
        role (str, optional): Rol de usuario ('admin', 'mecanico', 'recepcion'). Default: 'recepcionista'.
        celular (str, optional): Número de celular.

    Returns:
        JSON: Objeto con mensaje de éxito y datos del usuario creado (sin password).
        HTTP 201: Creado exitosamente.
        HTTP 400: Error de validación o datos faltantes.
        HTTP 500: Error interno del servidor.
    """
    # Contexto Backend:
    # Flask recibe el payload JSON. No usamos formularios HTML estándar aquí, sino API REST.
    data = request.get_json()

    # Lógica Interna: Normalización de datos
    # Aceptamos 'nombre' o 'username' para flexibilidad en la integración.
    nombre = data.get('nombre') or data.get('username')
    email = data.get('email') or data.get('correo')
    password = data.get('password')
    apellido_p = data.get('apellido_p', 'Apellido') 

    # Lógica Interna: Validación de campos obligatorios
    # Si falta alguno de estos, no tiene sentido molestar a la BD.
    if not nombre or not email or not password:
        return jsonify({"msg": "Faltan datos obligatorios (nombre/username, email, password)"}), 400

    try:
        # Interacción: Delegación a AuthService
        # El servicio se encarga del hashing de contraseña y verificación de unicidad del correo.
        new_user = AuthService.register_user(
            nombre=nombre,
            apellido_p=apellido_p,
            apellido_m=data.get('apellido_m'),
            correo=email,
            password=password,
            rol_nombre=data.get('rol_nombre') or data.get('role', 'recepcionista'),
            celular=data.get('celular')
        )
        return jsonify({"msg": "Usuario registrado exitosamente", "user": new_user.to_dict()}), 201
    
    except ValueError as e:
        # Lógica Interna: Captura de errores de negocio
        # Ejemplo: El servicio lanza ValueError si el correo ya existe. Convertimos a 400.
        return jsonify({"msg": str(e)}), 400
    except Exception as e:
        # Lógica Interna: Red de seguridad
        # Cualquier otro error inesperado se reporta como 500.
        return jsonify({"msg": f"Error al registrar usuario: {str(e)}"}), 500

# ==============================================================================
# Endpoint: Login (Inicio de Sesión)
# ==============================================================================
@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Autentica un usuario y emite un token JWT.

    Descripción:
        Verifica las credenciales proporcionadas contra la base de datos.
        Si son válidas, genera un token de acceso firmado (JWT).

    Args (Request Body):
        email (str): Correo registrado.
        password (str): Contraseña en texto plano.

    Returns:
        JSON: Token de acceso ('access_token') y datos del perfil de usuario.
        HTTP 200: Login exitoso.
        HTTP 400: Faltan credenciales.
        HTTP 401: Credenciales inválidas (usuario no existe o password incorrecto).
    """
    data = request.get_json()

    # Lógica Interna: Validación temprana
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Faltan credenciales"}), 400

    # Interacción: AuthService.login_user
    # Retorna un diccionario con token y usuario si tiene éxito, o None si falla.
    result = AuthService.login_user(data['email'], data['password'])

    if not result:
        # Contexto Backend: 401 Unauthorized es el estándar para fallos de autenticación.
        return jsonify({"msg": "Credenciales inválidas"}), 401

    return jsonify({
        "msg": "Inicio de sesión exitoso",
        "access_token": result['access_token'],
        "user": result['user'].to_dict()
    }), 200

# ==============================================================================
# Endpoint: Obtener Usuario Actual (Perfil)
# ==============================================================================
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Obtiene el perfil del usuario autenticado.

    Descripción:
        Utiliza el token JWT enviado en la cabecera 'Authorization' para identificar
        al usuario y recuperar sus datos actualizados de la BD.

    Decoradores:
        @jwt_required(): Verifica que la petición incluya un token válido.

    Returns:
        JSON: Datos completos del usuario (sin contraseña).
        HTTP 200: Éxito.
        HTTP 404: Si el token es válido pero el usuario fue eliminado de la BD.
    """
    # Lógica Interna: Extracción de identidad
    # get_jwt_identity() recupera el 'sub' (subject) codificado en el token (el ID del usuario).
    current_user_id = get_jwt_identity()
    
    # Contexto Backend: Consulta DB
    # Es importante volver a consultar la BD y no confiar solo en los datos del token,
    # ya que el usuario podría haber sido actualizado o deshabilitado recientemente.
    user = AuthService.get_user_by_id(current_user_id)
    
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    return jsonify(user.to_dict()), 200

# ==============================================================================
# Endpoint: Listar Usuarios
# ==============================================================================
@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """
    Lista todos los usuarios registrados.

    Descripción:
        Permite obtener un listado de usuarios, opcionalmente filtrados por rol.
        Ideal para paneles de administración.

    Query Params:
        role (str, optional): Filtra usuarios por nombre de rol (ej: 'mecanico').

    Returns:
        JSON: Lista de objetos usuario.
        HTTP 200: Éxito.
    """
    # Lógica Interna: Obtención de parámetros GET
    role = request.args.get('role', type=str)
    
    # Interacción: Consulta filtrada
    users = AuthService.get_users_by_role(role)
    
    # Lógica Interna: Serialización
    # Convertimos la lista de objetos SQLAlchemy a una lista de diccionarios JSON.
    return jsonify([u.to_dict() for u in users]), 200

# ==============================================================================
# Endpoint: Obtener Usuario por ID
# ==============================================================================
@auth_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """
    Obtiene los detalles de un usuario específico.

    Args (Path Param):
        user_id (int): ID único del usuario a consultar.

    Returns:
        JSON: Datos del usuario.
        HTTP 200: Encontrado.
        HTTP 404: No encontrado.
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
    Actualiza la información de un usuario existente.

    Args (Path Param):
        user_id (int): ID del usuario a modificar.

    Args (Request Body):
        JSON con los campos a actualizar (nombre, correo, rol, etc.).

    Returns:
        JSON: Mensaje y datos actualizados.
        HTTP 200: Actualización exitosa.
        HTTP 404: Usuario no encontrado o error de validación de datos (ej: rol inexistente).
        HTTP 500: Error de servidor.
    """
    data = request.get_json()
    
    try:
        # Interacción: Actualización atómica
        # AuthService maneja la transacción y verificaciones de unicidad (correo).
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
    Elimina (suave o físicamente) un usuario del sistema.

    Args (Path Param):
        user_id (int): ID del usuario a eliminar.

    Returns:
        JSON: Confirmación de eliminación.
        HTTP 200: Eliminado correctamente.
        HTTP 404: Usuario no existe.
        HTTP 500: Error de integridad referencial o base de datos.
    """
    try:
        AuthService.delete_user(user_id)
        return jsonify({"msg": "Usuario eliminado exitosamente"}), 200
    except ValueError as e:
        return jsonify({"msg": str(e)}), 404
    except Exception as e:
        return jsonify({"msg": f"Error al eliminar usuario: {str(e)}"}), 500
