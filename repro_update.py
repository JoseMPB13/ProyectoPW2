import sys
import os

# Adjust path to find app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app import create_app, db
from app.models import Orden, Servicio, OrdenDetalleServicio
from app.services.order_service import OrderService

app = create_app()

with app.app_context():
    print("--- REPRODUCING UPDATE ISSUE ---")
    
    # 1. Get an active order
    order = Orden.query.filter_by(activo=True).order_by(Orden.id.desc()).first()
    if not order:
        print("No active orders.")
        exit()
        
    print(f"Target Order: #{order.id} | Current Services: {len(order.detalles_servicios)}")
    
    # 2. Get a service to add
    svc = Servicio.query.filter_by(activo=True).first()
    if not svc:
         print("No services available.")
         exit()
         
    print(f"Service to add: {svc.nombre} (ID: {svc.id})")
    
    # 3. Check if already exists
    exists = any(d.servicio_id == svc.id for d in order.detalles_servicios)
    print(f"Service already in order? {exists}")
    
    # 4. Construct Update Payload
    # Current services + New service (if not exists, or just ensure it is there)
    current_ids = [d.servicio_id for d in order.detalles_servicios]
    if svc.id not in current_ids:
        current_ids.append(svc.id)
        print("Adding new service ID to list.")
    else:
        print("Service ID already in list. Keeping it (Testing idempotent update).")
        
    update_data = {
        "servicios": current_ids,
        "repuestos": [d.to_dict() for d in order.detalles_repuestos] # Keep parts as is
    }
    
    print(f"Payload: {update_data}")
    
    # 5. Call Service
    try:
        updated_order = OrderService.update_order_with_details(order.id, update_data)
        print("Update successful.")
        
        # Verify persistence
        db.session.refresh(updated_order)
        final_ids = [d.servicio_id for d in updated_order.detalles_servicios]
        print(f"Final Service IDs: {final_ids}")
        
        if svc.id in final_ids:
            print("[OK] Service is present.")
        else:
            print("[FAIL] Service found in payload but NOT in database.")
            
    except Exception as e:
        print(f"[ERROR] Update failed: {e}")
