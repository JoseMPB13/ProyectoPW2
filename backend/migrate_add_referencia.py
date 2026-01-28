"""
Script de migración para agregar el campo 'referencia' a la tabla pagos.
Ejecutar desde el directorio backend: python migrate_add_referencia.py
"""

from app import create_app, db
from sqlalchemy import text

def add_referencia_field():
    """Agrega el campo referencia a la tabla pagos si no existe."""
    app = create_app()
    
    with app.app_context():
        try:
            # Verificar si la columna ya existe
            check_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='pagos' AND column_name='referencia'
            """)
            
            result = db.session.execute(check_query).fetchone()
            
            if result:
                print("✅ El campo 'referencia' ya existe en la tabla pagos")
                return
            
            # Agregar columna referencia
            print("📝 Agregando campo 'referencia' a la tabla pagos...")
            alter_query = text("""
                ALTER TABLE pagos 
                ADD COLUMN referencia VARCHAR(100) DEFAULT NULL
            """)
            
            db.session.execute(alter_query)
            db.session.commit()
            
            print("✅ Campo 'referencia' agregado exitosamente")
            print("   Tipo: VARCHAR(100)")
            print("   Nullable: TRUE")
            print("   Default: NULL")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error al ejecutar migración: {str(e)}")
            raise

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🔧 MIGRACIÓN: Agregar campo 'referencia' a tabla pagos")
    print("="*60 + "\n")
    
    add_referencia_field()
    
    print("\n" + "="*60)
    print("✅ MIGRACIÓN COMPLETADA")
    print("="*60 + "\n")
