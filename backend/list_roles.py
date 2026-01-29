from app import create_app, db
from app.models import Role

app = create_app()

with app.app_context():
    roles = Role.query.all()
    print(f"Found {len(roles)} roles:")
    for role in roles:
        print(f"ID: {role.id}, Name: {role.nombre_rol}")
