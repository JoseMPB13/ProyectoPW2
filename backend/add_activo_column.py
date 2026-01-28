from app import create_app
from app.models import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        # Verificar y agregar columna activo
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='pagos' AND column_name='activo'
        """)
        result = db.session.execute(check_query).fetchone()
        
        if not result:
            print("Agregando columna 'activo' a 'pagos'...")
            # Agregar la columna
            alter_query = text("ALTER TABLE pagos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE")
            db.session.execute(alter_query)
            
            # Asegurar commit inmediato del DDL
            db.session.commit()
            
            # Actualizar valores existentes
            print("Actualizando registros existentes...")
            update_query = text("UPDATE pagos SET activo = TRUE WHERE activo IS NULL")
            db.session.execute(update_query)
            db.session.commit()
            
            print("OK: Columna 'activo' agregada y actualizada")
        else:
            print("OK: Columna 'activo' ya existe")
            
        print("\nMigracion completada exitosamente!")
        
    except Exception as e:
        print(f"ERROR: {e}")
        db.session.rollback()
        import traceback
        traceback.print_exc()
