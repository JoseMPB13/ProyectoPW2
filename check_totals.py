import sys
import os

# Adjust path to find app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app import create_app, db
from app.models import Orden, OrdenDetalleServicio, OrdenDetalleRepuesto

app = create_app()

with app.app_context():
    print("--- Checking Recent Orders ---")
    orders = Orden.query.order_by(Orden.id.desc()).limit(5).all()
    
    for order in orders:
        print(f"Order #{order.id} | Total Estimado (DB): {order.total_estimado}")
        
        # Manually calculate checks
        total_servicios = sum(d.precio_aplicado for d in order.detalles_servicios)
        total_repuestos = sum(d.cantidad * d.precio_unitario_aplicado for d in order.detalles_repuestos)
        manual_total = total_servicios + total_repuestos
        
        print(f"   - Servicios Sum: {total_servicios}")
        print(f"   - Repuestos Sum: {total_repuestos}")
        print(f"   - Manual Calc: {manual_total}")
        
        if abs(manual_total - order.total_estimado) > 0.01:
             print("   [!] DISCREPANCY DETECTED")
        else:
             print("   [OK] Matches")
