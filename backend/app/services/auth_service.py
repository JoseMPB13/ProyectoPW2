from app import db
from app.models import Usuario, Role
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import timedelta

class AuthService:
    """
    Servicio encargado de la lógica de autenticación y gestión de usuarios.
    """

    @staticmethod
    def register_user(nombre, apellido_p, correo, password, rol_nombre='recepcion', apellido_m=None, celular=None):
        """
        Registra un nuevo usuario en la base de datos.
        Realiza validaciones de duplicidad (correo) y hashea la contraseña.

        Args:
            nombre (str): Nombre.
            apellido_p (str): Apellido Paterno.
            correo (str): Correo electrónico.
            password (str): Contraseña en texto plano.
            rol_nombre (str, optional): Nombre del rol. Defaults to 'recepcion'.
            apellido_m (str, optional): Apellido Materno.
            celular (str, optional): Celular.

        Returns:
            Usuario: El objeto usuario creado.

        Raises:
            ValueError: Si el correo ya existe o el rol es inválido.
        """
        
        if Usuario.query.filter_by(correo=correo).first():
            raise ValueError("El correo electrónico ya está registrado")

        # Buscar el rol
        rol_obj = Role.query.filter_by(nombre_rol=rol_nombre).first()
        if not rol_obj:
            raise ValueError(f"El rol '{rol_nombre}' no existe")

        # Hasheamos la contraseña por seguridad antes de guardarla
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
        Autentica a un usuario verificando sus credenciales.
        Genera un token JWT si la autenticación es exitosa.

        Args:
            email (str): Correo del usuario.
            password (str): Contraseña en texto plano.

        Returns:
            dict | None: Diccionario con token y usuario si es exitoso, None si falla.
        """
        # Buscar usuario por correo
        user = Usuario.query.filter_by(correo=email).first()

        # Verificar si el usuario existe y la contraseña coincide con el hash almacenado
        if not user or not check_password_hash(user.password, password):
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
            Usuario | None: Objeto usuario o None.
        """
        return Usuario.query.get(user_id)

    @staticmethod
    def get_users_by_role(role_name=None):
        """
        Obtiene usuarios filtrados por rol.
        
        Args:
           role_name (str, optional): Nombre del rol para filtrar (admin, mecanico, recepcion).
        
        Returns:
           list[Usuario]: Lista de usuarios encontrados.
        """
        if role_name:
            # Join con Role para filtrar por nombre de rol
            return Usuario.query.join(Role).filter(Role.nombre_rol == role_name).all()
        return Usuario.query.all()

    @staticmethod
    def update_user(user_id, data):
        """
        Actualiza los datos de un usuario.
        
        Args:
            user_id (int): ID del usuario a actualizar.
            data (dict): Diccionario con los campos a actualizar.
        
        Returns:
            Usuario: El usuario actualizado.
        
        Raises:
            ValueError: Si el usuario no existe.
        """
        user = Usuario.query.get(user_id)
        if not user:
            raise ValueError("Usuario no encontrado")
        
        # Actualizar campos permitidos
        if 'nombre' in data:
            user.nombre = data['nombre']
        if 'apellido_p' in data:
            user.apellido_p = data['apellido_p']
        if 'apellido_m' in data:
            user.apellido_m = data['apellido_m']
        if 'correo' in data:
            # Verificar que el correo no esté en uso por otro usuario
            existing = Usuario.query.filter_by(correo=data['correo']).first()
            if existing and existing.id != user_id:
                raise ValueError("El correo ya está en uso por otro usuario")
            user.correo = data['correo']
        if 'celular' in data:
            user.celular = data['celular']
        if 'rol_nombre' in data:
            rol_obj = Role.query.filter_by(nombre_rol=data['rol_nombre']).first()
            if not rol_obj:
                raise ValueError(f"El rol '{data['rol_nombre']}' no existe")
            user.rol_id = rol_obj.id
        if 'password' in data:
            user.password = generate_password_hash(data['password'])
        
        db.session.commit()
        return user

    @staticmethod
    def delete_user(user_id):
        """
        Elimina un usuario del sistema.
        
        Args:
            user_id (int): ID del usuario a eliminar.
        
        Raises:
            ValueError: Si el usuario no existe.
        """
        user = Usuario.query.get(user_id)
        if not user:
            raise ValueError("Usuario no encontrado")
        
        db.session.delete(user)
        db.session.commit()
