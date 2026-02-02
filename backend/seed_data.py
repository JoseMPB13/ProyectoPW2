from app import create_app, db
from app.models import Role, Usuario, Cliente, Auto, Servicio, Repuesto, Orden, EstadoOrden, OrdenDetalleServicio, OrdenDetalleRepuesto
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import random

app = create_app()

def seed_data():
    with app.app_context():
        print("Eliminando base de datos actual...")
        db.drop_all()
        print("Creando nuevas tablas...")
        db.create_all()

        # ==============================================================================
        # 1. ROLES Y ESTADOS
        # ==============================================================================
        print("Creando Roles y Estados...")
        roles = ['admin', 'recepcion', 'mecanico']
        role_objects = {}
        for r_name in roles:
            role = Role(nombre_rol=r_name)
            db.session.add(role)
            role_objects[r_name] = role
        
        estados = ['Pendiente', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado']
        estado_objects = {}
        for e_name in estados:
            estado = EstadoOrden(nombre_estado=e_name)
            db.session.add(estado)
            estado_objects[e_name] = estado

        db.session.commit()

        # ==============================================================================
        # 2. USUARIOS
        # ==============================================================================
        print("Creando Usuarios...")
        users_data = [
            # Admin
            {'nombre': 'Admin', 'apellido_p': 'System', 'correo': 'admin@taller.com', 'password': 'admin123', 'rol': 'admin'},
            # Recepcionista
            {'nombre': 'Ana', 'apellido_p': 'García', 'correo': 'recepcion@taller.com', 'password': 'recepcion123', 'rol': 'recepcion'},
            # Mecanicos
            {'nombre': 'Carlos', 'apellido_p': 'Méndez', 'correo': 'mecanico1@taller.com', 'password': 'mecanico123', 'rol': 'mecanico'},
            {'nombre': 'Luis', 'apellido_p': 'Pérez', 'correo': 'mecanico2@taller.com', 'password': 'mecanico123', 'rol': 'mecanico'},
            {'nombre': 'Jorge', 'apellido_p': 'Ramírez', 'correo': 'mecanico3@taller.com', 'password': 'mecanico123', 'rol': 'mecanico'},
        ]

        user_objects = []
        for u in users_data:
            user = Usuario(
                nombre=u['nombre'],
                apellido_p=u['apellido_p'],
                correo=u['correo'],
                password=generate_password_hash(u['password']),
                rol_id=role_objects[u['rol']].id,
                activo=True
            )
            db.session.add(user)
            user_objects.append(user)
        
        db.session.commit()

        # ==============================================================================
        # 3. SERVICIOS (15 items)
        # ==============================================================================
        print("Creando Servicios...")
        servicios_list = [
            ('Cambio de Aceite', 'Reemplazo de aceite de motor y filtro', 45.00),
            ('Afinación Mayor', 'Cambio de bujías, filtros y limpieza de inyectores', 120.00),
            ('Alineación y Balanceo', 'Ajuste de la geometría de las ruedas', 35.00),
            ('Revisión de Frenos', 'Inspección y limpieza de sistema de frenos', 25.00),
            ('Cambio de Pastillas', 'Reemplazo de pastillas de freno delanteras', 60.00),
            ('Diagnóstico por Scanner', 'Escaneo de códigos de error OBD2', 30.00),
            ('Limpieza de Inyectores', 'Limpieza por ultrasonido de inyectores', 50.00),
            ('Cambio de Batería', 'Instalación de batería nueva y revisión de carga', 15.00),
            ('Revisión Sistema Eléctrico', 'Diagnóstico de fallas eléctricas', 40.00),
            ('Cambio de Correa de Distribución', 'Reemplazo de kit de distribución', 150.00),
            ('Reparación de Suspensión', 'Cambio de amortiguadores y bujes', 180.00),
            ('Carga de Aire Acondicionado', 'Recarga de gas refrigerante R134a', 55.00),
            ('Lavado de Motor', 'Lavado a vapor del compartimiento del motor', 20.00),
            ('Cambio de Liquido de Frenos', 'Purga y cambio de líquido DOT4', 35.00),
            ('Cambio de Filtro de Aire', 'Reemplazo de filtro de aire de motor', 15.00)
        ]

        servicio_objects = []
        for nombre, desc, precio in servicios_list:
            svc = Servicio(nombre=nombre, descripcion=desc, precio=precio, activo=True)
            db.session.add(svc)
            servicio_objects.append(svc)
        
        db.session.commit()

        # ==============================================================================
        # 4. REPUESTOS (20 items)
        # ==============================================================================
        print("Creando Repuestos...")
        repuestos_list = [
            ('Filtro de Aceite', 'Bosch', 10.00),
            ('Filtro de Aire', 'Mann', 15.00),
            ('Bujías NGK', 'NGK', 5.00),
            ('Pastillas de Freno Delanteras', 'Brembo', 45.00),
            ('Pastillas de Freno Traseras', 'Brembo', 40.00),
            ('Amortiguador Delantero', 'Monroe', 85.00),
            ('Amortiguador Trasero', 'Monroe', 75.00),
            ('Batería 12V 60Ah', 'Moura', 110.00),
            ('Aceite Sintético 5W30 (1L)', 'Castrol', 12.00),
            ('Aceite Mineral 20W50 (1L)', 'Shell', 8.00),
            ('Líquido de Frenos DOT4', 'Bosch', 10.00),
            ('Refrigerante Motor', 'Coolant', 15.00),
            ('Correa de Distribución', 'Gates', 35.00),
            ('Bomba de Agua', 'SKF', 45.00),
            ('Juego de Cables de Bujía', 'NGK', 25.00),
            ('Disco de Freno', 'Fremax', 50.00),
            ('Kit de Embrague', 'Valeo', 180.00),
            ('Bombilla H7', 'Philips', 8.00),
            ('Limpia Parabrisas', 'Bosch', 12.00),
            ('Sensor de Oxígeno', 'Denso', 65.00)
        ]

        repuesto_objects = []
        for nombre, marca, precio in repuestos_list:
            rep = Repuesto(
                nombre=nombre,
                marca=marca,
                precio_venta=precio,
                stock=random.randint(10, 50),
                stock_minimo=5,
                activo=True
            )
            db.session.add(rep)
            repuesto_objects.append(rep)
        
        db.session.commit()

        # ==============================================================================
        # 5. CLIENTES Y AUTOS
        # ==============================================================================
        print("Creando Clientes y Autos...")
        
        # Cliente 1 (1 auto)
        c1 = Cliente(ci='1234567', nombre='Juan', apellido_p='Silva', correo='juan@cliente.com', celular='70012345')
        db.session.add(c1)
        db.session.commit()
        
        a1 = Auto(cliente_id=c1.id, placa='2020-ABC', marca='Toyota', modelo='Corolla', anio=2018, color='Blanco', activo=True)
        db.session.add(a1)

        # Cliente 2 (1 auto)
        c2 = Cliente(ci='7654321', nombre='Maria', apellido_p='Lopez', correo='maria@cliente.com', celular='70054321')
        db.session.add(c2)
        db.session.commit()
        
        a2 = Auto(cliente_id=c2.id, placa='4040-XYZ', marca='Nissan', modelo='Sentra', anio=2020, color='Gris', activo=True)
        db.session.add(a2)

        # Cliente 3 (2 autos)
        c3 = Cliente(ci='1122334', nombre='Pedro', apellido_p='Gomez', correo='pedro@cliente.com', celular='70098765')
        db.session.add(c3)
        db.session.commit()
        
        a3 = Auto(cliente_id=c3.id, placa='1010-QWE', marca='Honda', modelo='Civic', anio=2019, color='Negro', activo=True)
        a4 = Auto(cliente_id=c3.id, placa='3030-ASD', marca='Suzuki', modelo='Vitara', anio=2022, color='Azul', activo=True)
        db.session.add(a3)
        db.session.add(a4)

        db.session.commit()

        autos_list = [a1, a2, a3, a4]

        # ==============================================================================
        # 6. ORDENES (3 En Proceso)
        # ==============================================================================
        print("Creando Ordenes...")
        estado_proceso = estado_objects['En Proceso']
        mecanicos = [u for u in user_objects if u.rol_id == role_objects['mecanico'].id]

        # Orden 1
        o1 = Orden(
            auto_id=a1.id,
            tecnico_id=mecanicos[0].id,
            estado_id=estado_proceso.id,
            problema_reportado="Ruido al frenar",
            fecha_ingreso=datetime.utcnow()
        )
        db.session.add(o1)
        db.session.commit()

        # Detalles Orden 1 (Frenos)
        item_s1_1 = OrdenDetalleServicio(orden_id=o1.id, servicio_id=servicio_objects[3].id, precio_aplicado=servicio_objects[3].precio) # Revision frenos
        item_s1_2 = OrdenDetalleServicio(orden_id=o1.id, servicio_id=servicio_objects[4].id, precio_aplicado=servicio_objects[4].precio) # Cambio pastillas
        item_r1_1 = OrdenDetalleRepuesto(orden_id=o1.id, repuesto_id=repuesto_objects[3].id, cantidad=1, precio_unitario_aplicado=repuesto_objects[3].precio_venta) # Pastillas Brembo
        
        db.session.add(item_s1_1)
        db.session.add(item_s1_2)
        db.session.add(item_r1_1)
        
        o1.total_estimado = item_s1_1.precio_aplicado + item_s1_2.precio_aplicado + (item_r1_1.precio_unitario_aplicado * item_r1_1.cantidad)
        db.session.commit()

        # Orden 2
        o2 = Orden(
            auto_id=a2.id,
            tecnico_id=mecanicos[1].id,
            estado_id=estado_proceso.id,
            problema_reportado="Servicio de mantenimiento general",
            fecha_ingreso=datetime.utcnow()
        )
        db.session.add(o2)
        db.session.commit()

        # Detalles Orden 2 (Afinación)
        item_s2_1 = OrdenDetalleServicio(orden_id=o2.id, servicio_id=servicio_objects[0].id, precio_aplicado=servicio_objects[0].precio) # Aceite
        item_s2_2 = OrdenDetalleServicio(orden_id=o2.id, servicio_id=servicio_objects[1].id, precio_aplicado=servicio_objects[1].precio) # Afinacion
        item_r2_1 = OrdenDetalleRepuesto(orden_id=o2.id, repuesto_id=repuesto_objects[0].id, cantidad=1, precio_unitario_aplicado=repuesto_objects[0].precio_venta) # Filtro Aceite
        item_r2_2 = OrdenDetalleRepuesto(orden_id=o2.id, repuesto_id=repuesto_objects[2].id, cantidad=4, precio_unitario_aplicado=repuesto_objects[2].precio_venta) # Bujias

        db.session.add(item_s2_1)
        db.session.add(item_s2_2)
        db.session.add(item_r2_1)
        db.session.add(item_r2_2)

        o2.total_estimado = item_s2_1.precio_aplicado + item_s2_2.precio_aplicado + (item_r2_1.precio_unitario_aplicado * item_r2_1.cantidad) + (item_r2_2.precio_unitario_aplicado * item_r2_2.cantidad)
        db.session.commit()

        # Orden 3
        o3 = Orden(
            auto_id=a3.id, # Honda Civic
            tecnico_id=mecanicos[2].id,
            estado_id=estado_proceso.id,
            problema_reportado="El aire acondicionado no enfría",
            fecha_ingreso=datetime.utcnow()
        )
        db.session.add(o3)
        db.session.commit()

        # Detalles Orden 3 (Aire Acondicionado)
        item_s3_1 = OrdenDetalleServicio(orden_id=o3.id, servicio_id=servicio_objects[11].id, precio_aplicado=servicio_objects[11].precio) # Carga Aire
        item_s3_2 = OrdenDetalleServicio(orden_id=o3.id, servicio_id=servicio_objects[8].id, precio_aplicado=servicio_objects[8].precio) # Revisión eléctrica
        
        db.session.add(item_s3_1)
        db.session.add(item_s3_2)

        o3.total_estimado = item_s3_1.precio_aplicado + item_s3_2.precio_aplicado
        db.session.commit()
        
        print("\n=== BD POBLADA CON ÉXITO ===")
        print("\nCREDENCIALES DE USUARIOS GENERADOS:")
        print("-----------------------------------")
        for u in users_data:
            print(f"Rol: {u['rol'].upper():<12} | Correo: {u['correo']:<25} | Password: {u['password']}")
        print("-----------------------------------")

if __name__ == '__main__':
    seed_data()
