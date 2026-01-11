import os
from app import create_app, db
# Importamos todos los modelos para asegurarnos de que SQLAlchemy los reconozca
# antes de llamar a create_all().
from app.models import User, Client, Vehicle, Service, WorkOrder, OrderItem, Payment

def init_db():
    """
    Inicializa la base de datos creando todas las tablas definidas en los modelos.
    Se conecta a la base de datos configurada en .env (Supabase).
    """
    # Creamos la instancia de la aplicación Flask
    app = create_app()

    # Usamos el contexto de la aplicación para tener acceso a la configuración y a la BD
    with app.app_context():
        # Verificamos qué URI de base de datos se está usando
        db_uri = app.config['SQLALCHEMY_DATABASE_URI']
        print(f"Conectando a la base de datos: {db_uri.split('@')[-1]}") # Solo mostramos el host por seguridad

        try:
            # Crea todas las tablas definidas en los modelos que hereden de db.Model
            db.create_all()
            print("Tablas creadas exitosamente en Supabase.")
        except Exception as e:
            print(f"Error al crear las tablas: {e}")

if __name__ == "__main__":
    init_db()
