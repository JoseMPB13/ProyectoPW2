import requests
import random
import time

BASE_URL = "http://127.0.0.1:5000"

def verify_payments_workflow():
    print("Iniciando pruebas de Pagos...")
    unique_suffix = random.randint(1000, 9999)

    # 1. Login Admin
    print("\n[1] Autenticando como Admin...")
    admin_data = {
        "username": f"admin_pay_{unique_suffix}",
        "email": f"admin_pay_{unique_suffix}@example.com",
        "password": "securepass",
        "role": "admin"
    }
    # Register (ignore error if exists)
    requests.post(f"{BASE_URL}/auth/register", json=admin_data)
    # Login
    response = requests.post(f"{BASE_URL}/auth/login", json={"email": admin_data['email'], "password": admin_data['password']})
    if response.status_code != 200:
        print("❌ Error en login de admin")
        return
    token = response.json()['access_token']
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login Admin exitoso.")

    # 2. Crear Datos Previos (Cliente, Vehiculo, Orden)
    print("\n[2] Creando Cliente, Vehículo y Orden...")
    # Cliente
    client_res = requests.post(f"{BASE_URL}/clients", json={
        "first_name": "PayClient", "last_name": "Test", "email": f"payclient{unique_suffix}@test.com"
    }, headers=headers) # Using logic from verify_orders
    
    # If clients endpoint requires auth (which looks like it does from __init__ blueprint but checking orders.py showed some public? No wait, almost all protected).
    # Assuming clients needs auth or just try.
    if client_res.status_code not in [200, 201]:
         # Try creating via protected endpoint if previous failed or check create_client logic.
         pass

    # Actually let's just assume we can create them.
    # To be safe, I'll rely on the status codes.
    
    if client_res.status_code == 201:
        client_id = client_res.json()['client']['id']
    else:
        # Maybe client exists or error.
        print(f"⚠️  Aviso crear cliente: {client_res.status_code}, {client_res.text}")
        # Try to continue if we failed? No, we need an ID.
        # Let's brute force create a vehicle without client if allowed? No.
        return

    # Vehiculo
    vehicle_res = requests.post(f"{BASE_URL}/clients/{client_id}/vehicles", json={
        "plate": f"PAY-{unique_suffix}", "brand": "Ford", "model": "Fiesta", "year": 2019
    }, headers=headers)
    vehicle_id = vehicle_res.json()['vehicle']['id']

    # Orden
    order_res = requests.post(f"{BASE_URL}/orders", json={"vehicle_id": vehicle_id}, headers=headers)
    order_id = order_res.json()['order']['id']
    print(f"✅ Orden creada ID: {order_id}")

    # 3. Crear Pago
    print("\n[3] Creando Pago...")
    payment_data = {
        "work_order_id": order_id,
        "amount": 150.00,
        "payment_method": "tarjeta",
        "status": "pagado"
    }
    pay_res = requests.post(f"{BASE_URL}/payments/", json=payment_data, headers=headers)
    if pay_res.status_code == 201:
        print("✅ Pago creado exitosamente.")
        print(pay_res.json())
    else:
        print(f"❌ Error al crear pago: {pay_res.text}")
        return

    # 4. Historial
    print("\n[4] Consultando Historial...")
    hist_res = requests.get(f"{BASE_URL}/payments/history", headers=headers)
    if hist_res.status_code == 200:
        history = hist_res.json()
        print(f"✅ Historial obtenido: {len(history)} pagos registrados.")
        # Verify our payment is there
        found = any(p['work_order_id'] == order_id for p in history)
        if found:
            print("✅ Pago verificado en historial.")
        else:
            print("❌ Pago NO encontrado en historial.")
    else:
        print(f"❌ Error al obtener historial: {hist_res.text}")

    # 5. Revenue
    print("\n[5] Consultando Revenue...")
    rev_res = requests.get(f"{BASE_URL}/payments/revenue", headers=headers)
    if rev_res.status_code == 200:
        rev = rev_res.json()
        print(f"✅ Revenue obtenido: Total {rev['total_revenue']}")
        print(f"✅ Desglose: {rev['by_method']}")
    else:
        print(f"❌ Error al obtener revenue: {rev_res.text}")

if __name__ == "__main__":
    verify_payments_workflow()
