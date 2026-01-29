from app import create_app, db
from sqlalchemy import text
from app.models import (
    OrdenDetalleRepuesto, OrdenDetalleServicio, Orden, 
    Repuesto, Servicio, Auto, Cliente
)

def reset_data():
    app = create_app()
    with app.app_context():
        print("🗑️  Iniciando limpieza de datos (Conservando Usuarios y Roles)...")
        
        try:
            # 1. Eliminar pagos (SQL directo)
            print("   - Eliminando Pagos...")
            db.session.execute(text("DELETE FROM pagos"))
            
            # 2. Eliminar detalles de ordenes
            print("   - Eliminando Detalles de Órdenes...")
            db.session.query(OrdenDetalleRepuesto).delete()
            db.session.query(OrdenDetalleServicio).delete()
            
            # 3. Eliminar Órdenes
            print("   - Eliminando Órdenes...")
            db.session.query(Orden).delete()
            
            # 4. Eliminar Autos y Clientes
            print("   - Eliminando Autos...")
            db.session.query(Auto).delete()
            print("   - Eliminando Clientes...")
            db.session.query(Cliente).delete()
            
            # 5. Eliminar Inventario y Servicios (Opcional, pero el usuario dijo 'vuelve a cero')
            print("   - Eliminando Repuestos...")
            db.session.query(Repuesto).delete()
            print("   - Eliminando Servicios...")
            db.session.query(Servicio).delete()
            
            # NO tocaremos Usuarios, Roles, ni Estados de Orden (Metadata crítica)
            
            db.session.commit()
            print("✅ Limpieza completada exitosamente.")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error durante la limpieza: {e}")

if __name__ == "__main__":
    reset_data()
