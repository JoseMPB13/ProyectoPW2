from app import create_app, db
from app.models import Usuario, Role
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    email = 'admin@taller.com'
    new_password = 'admin123'
    
    user = Usuario.query.filter_by(correo=email).first()
    
    # Identify correct admin role (assuming 'admin' or something similar from list_roles output)
    # I will be fuzzy here to be safe or defaulting to a known ID if list_roles output is delayed
    admin_role = Role.query.filter(Role.nombre_rol.ilike('%admin%')).first()
    
    if user:
        print(f"User {email} found. Resetting password...")
        user.password = generate_password_hash(new_password)
        if admin_role:
             print(f"Updating role to {admin_role.nombre_rol} (ID: {admin_role.id})")
             user.rol_id = admin_role.id
        else:
             print("Admin role not found, keeping existing role.")
             
        db.session.commit()
        print("Password reset successful.")
    else:
        print(f"User {email} not found. Creating new admin user...")
        if admin_role:
            new_user = Usuario(
                nombre='Admin',
                apellido_p='System',
                correo=email,
                password=generate_password_hash(new_password),
                rol_id=admin_role.id,
                activo=True
            )
            db.session.add(new_user)
            db.session.commit()
            print("Admin user created.")
        else:
            print("Cannot create admin user: Admin role not found in DB.")
