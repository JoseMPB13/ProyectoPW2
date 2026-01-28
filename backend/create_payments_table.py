"""
Script para crear la tabla de pagos en la base de datos.
Ejecutar desde el directorio backend: python create_payments_table.py
"""

from app import create_app, db
from app.models import Pago

def create_payments_table():
    """Crea la tabla de pagos si no existe."""
    print("🔧 Creando tabla de pagos...")
    
    app = create_app()
    
    with app.app_context():
        try:
            # Crear solo la tabla de pagos
            db.create_all()
            print("✅ Tabla de pagos creada exitosamente")
        except Exception as e:
            print(f"❌ Error al crear tabla: {str(e)}")

if __name__ == '__main__':
    create_payments_table()
