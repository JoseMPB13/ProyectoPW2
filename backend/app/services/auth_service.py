from app import db
from app.models import Usuario, Role
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import timedelta

# ==============================================================================
# ENCABEZADO DEL ARCHIVO (Servicio de Autenticación)
# ==============================================================================
# Propósito:
#   Centraliza la lógica de seguridad y gestión de usuarios.
#   Maneja registro, login, hashing de contraseñas y emisión de JWT.
#
# Flujo Lógico Central:
#   1. Registro: Valida unicidad de correo -> Hash Password -> Persiste Usuario.
#   2. Login: Busca Usuario -> Verifica Hash -> Emite JWT.
#
# Interacciones:
#   - Modelos: Usuario, Role.
#   - Controladores: auth.py (Consumidor principal).
# ==============================================================================

class AuthService:
    """
    Capa de servicio para lógica de negocio de identidad y acceso.
    """

    @staticmethod
    def register_user(nombre, apellido_p, correo, password, rol_nombre='recepcion', apellido_m=None, celular=None):
        """
        Registra un nuevo usuario en el sistema.
        
        Args:
            nombre, apellido_p, correo: Datos básicos.
            password: Se almacenará SOLO el hash.
            rol_nombre: Defaults 'recepcion' por seguridad.
            
        Returns:
            Usuario: Instancia creada.
            
        Raises:
            ValueError: Si hay duplicados o datos inválidos.
        """
        
        # Validar Unicidad
        if Usuario.query.filter_by(correo=correo).first():
            raise ValueError("El correo electrónico ya está registrado")

        # Validar Rol
        rol_obj = Role.query.filter_by(nombre_rol=rol_nombre).first()
        if not rol_obj:
            raise ValueError(f"El rol '{rol_nombre}' no existe")

        # Seguridad: Hashing
        hashed_password = generate_password_hash(password)
        
        new_user = Usuario(
            nombre=nombre,
            apellido_p=apellido_p,
            apellido_m=apellido_m,
            correo=correo,
            celular=celular,
            password=hashed_password,
            rol_id=rol_obj.id
        )

        db.session.add(new_user)
        db.session.commit()
        return new_user

    @staticmethod
    def login_user(email, password):
        """
        Verifica credenciales y genera sesión.
        
        Returns:
            dict: { access_token, user } si éxito.
            None: si falla validación.
        """
        user = Usuario.query.filter_by(correo=email).first()

        # Validación estricta de hash
        if not user or not check_password_hash(user.password, password):
            return None

        # Emisión de Token (Validez 24h)
        # Identity es el ID del usuario para easy lookup en decoradores
        access_token = create_access_token(
            identity=str(user.id), 
            expires_delta=timedelta(days=1)
        )
        
        return {
            "access_token": access_token,
            "user": user
        }

    @staticmethod
    def get_user_by_id(user_id):
        """
        Recupera usuario por PK.
        """
        return Usuario.query.get(user_id)

    @staticmethod
    def get_users_by_role(role_name=None):
        """
        Lista usuarios, opcionalmente filtrando por rol.
        """
        if role_name:
            return Usuario.query.join(Role).filter(Role.nombre_rol == role_name).all()
        return Usuario.query.all()

    @staticmethod
    def update_user(user_id, data):
        """
        Actualiza perfil de usuario.
        Maneja re-hashing de password si se solicita cambio.
        """
        user = Usuario.query.get(user_id)
        if not user:
            raise ValueError("Usuario no encontrado")
        
        # Actualización condicional de campos
        if 'nombre' in data: user.nombre = data['nombre']
        if 'apellido_p' in data: user.apellido_p = data['apellido_p']
        if 'apellido_m' in data: user.apellido_m = data['apellido_m']
        if 'celular' in data: user.celular = data['celular']
        
        # Logic compleja para correo (check duplicados en update)
        if 'correo' in data:
            existing = Usuario.query.filter_by(correo=data['correo']).first()
            if existing and existing.id != user_id:
                raise ValueError("El correo ya está en uso por otro usuario")
            user.correo = data['correo']
            
        # Logic compleja para rol
        if 'rol_nombre' in data:
            rol_obj = Role.query.filter_by(nombre_rol=data['rol_nombre']).first()
            if not rol_obj:
                raise ValueError(f"El rol '{data['rol_nombre']}' no existe")
            user.rol_id = rol_obj.id
            
        # Logic compleja para password
        if 'password' in data and data['password']:
            user.password = generate_password_hash(data['password'])
        
        db.session.commit()
        return user

    @staticmethod
    def delete_user(user_id):
        """
        Elimina físicamente al usuario.
        TODO: Considerar Soft Delete en el futuro.
        """
        user = Usuario.query.get(user_id)
        if not user:
            raise ValueError("Usuario no encontrado")
        
        db.session.delete(user)
        db.session.commit()
