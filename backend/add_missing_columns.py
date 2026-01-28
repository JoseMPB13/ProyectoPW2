from app import create_app
from app.models import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        # Verificar y agregar columna referencia
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='pagos' AND column_name='referencia'
        """)
        result = db.session.execute(check_query).fetchone()
        
        if not result:
            print("Agregando columna 'referencia' a 'pagos'...")
            alter_query = text("ALTER TABLE pagos ADD COLUMN IF NOT EXISTS referencia VARCHAR(100)")
            db.session.execute(alter_query)
            db.session.commit()
            print("OK: Columna 'referencia' agregada")
        else:
            print("OK: Columna 'referencia' ya existe")
            
        # Verificar y agregar columna usuario_id
        check_user = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='pagos' AND column_name='usuario_id'
        """)
        result2 = db.session.execute(check_user).fetchone()
        
        if not result2:
            print("Agregando columna 'usuario_id' a 'pagos'...")
            alter_query2 = text("ALTER TABLE pagos ADD COLUMN IF NOT EXISTS usuario_id INTEGER")
            db.session.execute(alter_query2)
            db.session.commit()
            print("OK: Columna 'usuario_id' agregada")
        else:
            print("OK: Columna 'usuario_id' ya existe")
            
        print("\nMigracion completada!")
        
    except Exception as e:
        print(f"ERROR: {e}")
        db.session.rollback()
        import traceback
        traceback.print_exc()
