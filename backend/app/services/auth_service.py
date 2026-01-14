from app import db
from app.models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import timedelta

class AuthService:
    """
    Servicio encargado de la lógica de autenticación y gestión de usuarios.
    """

    @staticmethod
    def register_user(username, email, password, role='recepcion'):
        """
        Registra un nuevo usuario en la base de datos.
        Realiza validaciones de duplicidad (username/email) y hashea la contraseña.

        Args:
            username (str): Nombre de usuario.
            email (str): Correo electrónico.
            password (str): Contraseña en texto plano.
            role (str, optional): Rol del usuario. Defaults to 'recepcion'.

        Returns:
            User: El objeto usuario creado.

        Raises:
            ValueError: Si el usuario o email ya existen.
        """
        # Verificar si el usuario o email ya existen en la BD
        if User.query.filter_by(username=username).first():
            raise ValueError("El nombre de usuario ya existe")
        
        if User.query.filter_by(email=email).first():
            raise ValueError("El correo electrónico ya está registrado")

        # Hasheamos la contraseña por seguridad antes de guardarla
        hashed_password = generate_password_hash(password)
        
        new_user = User(
            username=username,
            email=email,
            password_hash=hashed_password,
            role=role
        )

        db.session.add(new_user)
        db.session.commit()
        return new_user

    @staticmethod
    def login_user(email, password):
        """
        Autentica a un usuario verificando sus credenciales.
        Genera un token JWT si la autenticación es exitosa.

        Args:
            email (str): Correo del usuario.
            password (str): Contraseña en texto plano.

        Returns:
            dict | None: Diccionario con token y usuario si es exitoso, None si falla.
        """
        # Buscar usuario por email
        user = User.query.filter_by(email=email).first()

        # Verificar si el usuario existe y la contraseña coincide con el hash almacenado
        if not user or not check_password_hash(user.password_hash, password):
            return None

        # Crear el token de acceso JWT
        # 'identity' almacena el ID del usuario para identificarlo en futuras peticiones
        access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(days=1))
        
        return {
            "access_token": access_token,
            "user": user
        }

    @staticmethod
    def get_user_by_id(user_id):
        """
        Busca un usuario por su ID.
        
        Args:
            user_id (str|int): ID del usuario.

        Returns:
            User | None: Objeto usuario o None.
        """
        return User.query.get(user_id)

    @staticmethod
    def get_users_by_role(role=None):
        """
        Obtiene usuarios filtrados por rol.
        
        Args:
           role (str, optional): Rol para filtrar (admin, mecanico, recepcion).
        
        Returns:
           list[User]: Lista de usuarios encontrados.
        """
        if role:
            return User.query.filter_by(role=role).all()
        return User.query.all()
