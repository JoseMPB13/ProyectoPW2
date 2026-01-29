from app import create_app, db
from app.models import Usuario

app = create_app()

with app.app_context():
    users = Usuario.query.all()
    print(f"Found {len(users)} users:")
    for user in users:
        print(f"ID: {user.id}, Email: {user.correo}, Role: {user.rol_nombre if hasattr(user, 'rol_nombre') else user.rol_id}, Active: {user.activo}")
        # Check if role relationship works
        if user.rol:
             print(f"  - Role Name: {user.rol.nombre_rol}")
        else:
             print(f"  - No Role associated!")
