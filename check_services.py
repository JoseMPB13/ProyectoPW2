import sys
import os

# Adjust path to find app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app import create_app, db
from app.models import Servicio

app = create_app()

with app.app_context():
    print("--- CHECKING SERVICES ---")
    services = Servicio.query.all()
    print(f"Total Services in DB: {len(services)}")
    for s in services:
        print(f" - ID: {s.id}, Name: {s.nombre}, Active: {s.activo}, Price: {s.precio}")
