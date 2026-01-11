from app import db
from app.models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import timedelta

class AuthService:
    @staticmethod
    def register_user(username, email, password, role='recepcion'):
        # Verificar si el usuario o email ya existen
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
        # Buscar usuario por email
        user = User.query.filter_by(email=email).first()

        # Verificar si el usuario existe y la contraseña es correcta
        if not user or not check_password_hash(user.password_hash, password):
            return None

        # Crear el token de acceso
        access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(days=1))
        
        return {
            "access_token": access_token,
            "user": user
        }

    @staticmethod
    def get_user_by_id(user_id):
        return User.query.get(user_id)
