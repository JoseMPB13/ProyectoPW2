"""
Script para poblar la base de datos con datos de prueba.
Ejecutar desde el directorio backend: python seed_database.py
"""

from app import create_app, db
from app.models import (
    Role, EstadoOrden, Usuario, Cliente, Auto, 
    Servicio, Repuesto, Orden, OrdenDetalleServicio, OrdenDetalleRepuesto
)
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import random

def clear_database():
    """Limpia todas las tablas de la base de datos."""
    print("🗑️  Limpiando base de datos...")
    
    from sqlalchemy import text
    
    # Eliminar en orden inverso de dependencias
    # Primero pagos (con SQL directo porque el modelo está comentado)
    db.session.execute(text("DELETE FROM pagos"))
    
    # Luego el resto con ORM
    OrdenDetalleRepuesto.query.delete()
    OrdenDetalleServicio.query.delete()
    Orden.query.delete()
    Repuesto.query.delete()
    Servicio.query.delete()
    Auto.query.delete()
    Cliente.query.delete()
    Usuario.query.delete()
    EstadoOrden.query.delete()
    Role.query.delete()
    
    db.session.commit()
    print("✅ Base de datos limpiada")


def seed_roles():
    """Crea los roles del sistema."""
    print("\n👥 Creando roles...")
    
    roles = [
        Role(nombre_rol='admin'),
        Role(nombre_rol='mecanico'),
        Role(nombre_rol='recepcionista')
    ]
    
    db.session.add_all(roles)
    db.session.commit()
    print(f"✅ {len(roles)} roles creados")
    return roles

def seed_estados_orden():
    """Crea los estados de orden."""
    print("\n📋 Creando estados de orden...")
    
    estados = [
        EstadoOrden(nombre_estado='Pendiente'),
        EstadoOrden(nombre_estado='En Proceso'),
        EstadoOrden(nombre_estado='Finalizado'),
        EstadoOrden(nombre_estado='Entregado')
    ]
    
    db.session.add_all(estados)
    db.session.commit()
    print(f"✅ {len(estados)} estados creados")
    return estados

def seed_usuarios(roles):
    """Crea usuarios del sistema."""
    print("\n👤 Creando usuarios...")
    
    # Obtener roles
    admin_role = next(r for r in roles if r.nombre_rol == 'admin')
    mecanico_role = next(r for r in roles if r.nombre_rol == 'mecanico')
    recepcionista_role = next(r for r in roles if r.nombre_rol == 'recepcionista')
    
    usuarios = [
        # Administradores
        Usuario(
            nombre='Juan',
            apellido_p='Pérez',
            apellido_m='García',
            correo='admin@taller.com',
            celular='70123456',
            password=generate_password_hash('admin123'),
            rol_id=admin_role.id,
            activo=True
        ),
        
        # Mecánicos
        Usuario(
            nombre='Carlos',
            apellido_p='Rodríguez',
            apellido_m='López',
            correo='carlos.mecanico@taller.com',
            celular='71234567',
            password=generate_password_hash('mecanico123'),
            rol_id=mecanico_role.id,
            activo=True
        ),
        Usuario(
            nombre='Miguel',
            apellido_p='Fernández',
            apellido_m='Sánchez',
            correo='miguel.mecanico@taller.com',
            celular='72345678',
            password=generate_password_hash('mecanico123'),
            rol_id=mecanico_role.id,
            activo=True
        ),
        Usuario(
            nombre='Roberto',
            apellido_p='Martínez',
            apellido_m='Gómez',
            correo='roberto.mecanico@taller.com',
            celular='73456789',
            password=generate_password_hash('mecanico123'),
            rol_id=mecanico_role.id,
            activo=True
        ),
        
        # Recepcionistas
        Usuario(
            nombre='Ana',
            apellido_p='González',
            apellido_m='Díaz',
            correo='ana.recepcion@taller.com',
            celular='74567890',
            password=generate_password_hash('recepcion123'),
            rol_id=recepcionista_role.id,
            activo=True
        ),
        Usuario(
            nombre='María',
            apellido_p='López',
            apellido_m='Ramírez',
            correo='maria.recepcion@taller.com',
            celular='75678901',
            password=generate_password_hash('recepcion123'),
            rol_id=recepcionista_role.id,
            activo=True
        )
    ]
    
    db.session.add_all(usuarios)
    db.session.commit()
    print(f"✅ {len(usuarios)} usuarios creados")
    return usuarios

def seed_clientes():
    """Crea clientes."""
    print("\n👨‍💼 Creando clientes...")
    
    clientes = [
        Cliente(
            ci='1234567',
            nombre='Pedro',
            apellido_p='Ramírez',
            apellido_m='Torres',
            correo='pedro.ramirez@email.com',
            celular='76789012',
            direccion='Av. 6 de Agosto #1234',
            activo=True
        ),
        Cliente(
            ci='2345678',
            nombre='Laura',
            apellido_p='Morales',
            apellido_m='Vega',
            correo='laura.morales@email.com',
            celular='77890123',
            direccion='Calle Comercio #567',
            activo=True
        ),
        Cliente(
            ci='3456789',
            nombre='Jorge',
            apellido_p='Castro',
            apellido_m='Flores',
            correo='jorge.castro@email.com',
            celular='78901234',
            direccion='Av. Arce #890',
            activo=True
        ),
        Cliente(
            ci='4567890',
            nombre='Carmen',
            apellido_p='Vargas',
            apellido_m='Ríos',
            correo='carmen.vargas@email.com',
            celular='79012345',
            direccion='Calle Potosí #234',
            activo=True
        ),
        Cliente(
            ci='5678901',
            nombre='Ricardo',
            apellido_p='Mendoza',
            apellido_m='Silva',
            correo='ricardo.mendoza@email.com',
            celular='70234567',
            direccion='Av. Ballivián #456',
            activo=True
        ),
        Cliente(
            ci='6789012',
            nombre='Sofía',
            apellido_p='Herrera',
            apellido_m='Ortiz',
            correo='sofia.herrera@email.com',
            celular='71345678',
            direccion='Calle Murillo #789',
            activo=True
        ),
        Cliente(
            ci='7890123',
            nombre='Daniel',
            apellido_p='Rojas',
            apellido_m='Paz',
            correo='daniel.rojas@email.com',
            celular='72456789',
            direccion='Av. Camacho #123',
            activo=True
        ),
        Cliente(
            ci='8901234',
            nombre='Valentina',
            apellido_p='Cruz',
            apellido_m='Luna',
            correo='valentina.cruz@email.com',
            celular='73567890',
            direccion='Calle Sucre #345',
            activo=True
        )
    ]
    
    db.session.add_all(clientes)
    db.session.commit()
    print(f"✅ {len(clientes)} clientes creados")
    return clientes

def seed_autos(clientes):
    """Crea autos para los clientes."""
    print("\n🚗 Creando autos...")
    
    marcas_modelos = [
        ('Toyota', 'Corolla', 2020),
        ('Honda', 'Civic', 2019),
        ('Nissan', 'Sentra', 2021),
        ('Chevrolet', 'Cruze', 2018),
        ('Hyundai', 'Elantra', 2022),
        ('Mazda', 'Mazda3', 2020),
        ('Ford', 'Focus', 2019),
        ('Volkswagen', 'Jetta', 2021),
        ('Kia', 'Forte', 2020),
        ('Suzuki', 'Swift', 2022),
        ('Toyota', 'Yaris', 2021),
        ('Honda', 'Fit', 2019)
    ]
    
    autos = []
    placa_num = 1000
    
    # Cada cliente tiene 1-2 autos
    for cliente in clientes:
        num_autos = random.randint(1, 2)
        for _ in range(num_autos):
            marca, modelo, anio = random.choice(marcas_modelos)
            auto = Auto(
                placa=f'ABC-{placa_num}',
                marca=marca,
                modelo=modelo,
                anio=anio,
                color=random.choice(['Blanco', 'Negro', 'Gris', 'Rojo', 'Azul', 'Plateado']),
                cliente_id=cliente.id,
                activo=True
            )
            autos.append(auto)
            placa_num += 1
    
    db.session.add_all(autos)
    db.session.commit()
    print(f"✅ {len(autos)} autos creados")
    return autos

def seed_servicios():
    """Crea servicios del taller."""
    print("\n🔧 Creando servicios...")
    
    servicios = [
        Servicio(nombre='Cambio de Aceite', descripcion='Cambio de aceite de motor', precio=150.00, activo=True),
        Servicio(nombre='Alineación y Balanceo', descripcion='Alineación y balanceo de ruedas', precio=200.00, activo=True),
        Servicio(nombre='Revisión de Frenos', descripcion='Revisión completa del sistema de frenos', precio=180.00, activo=True),
        Servicio(nombre='Cambio de Filtros', descripcion='Cambio de filtro de aire y combustible', precio=120.00, activo=True),
        Servicio(nombre='Diagnóstico Computarizado', descripcion='Diagnóstico con escáner automotriz', precio=250.00, activo=True),
        Servicio(nombre='Cambio de Bujías', descripcion='Cambio de bujías de encendido', precio=100.00, activo=True),
        Servicio(nombre='Revisión de Suspensión', descripcion='Revisión completa de suspensión', precio=220.00, activo=True),
        Servicio(nombre='Cambio de Batería', descripcion='Instalación de batería nueva', precio=80.00, activo=True),
        Servicio(nombre='Lavado Completo', descripcion='Lavado exterior e interior', precio=60.00, activo=True),
        Servicio(nombre='Pulido y Encerado', descripcion='Pulido y encerado de carrocería', precio=150.00, activo=True),
        Servicio(nombre='Cambio de Correa de Distribución', descripcion='Cambio de correa de distribución', precio=350.00, activo=True),
        Servicio(nombre='Reparación de Motor', descripcion='Reparación general de motor', precio=800.00, activo=True),
        Servicio(nombre='Cambio de Embrague', descripcion='Cambio de kit de embrague', precio=600.00, activo=True),
        Servicio(nombre='Reparación de Transmisión', descripcion='Reparación de caja de cambios', precio=900.00, activo=True),
        Servicio(nombre='Pintura de Retoque', descripcion='Retoque de pintura en áreas pequeñas', precio=200.00, activo=True)
    ]
    
    db.session.add_all(servicios)
    db.session.commit()
    print(f"✅ {len(servicios)} servicios creados")
    return servicios

def seed_repuestos():
    """Crea repuestos en inventario."""
    print("\n🔩 Creando repuestos...")
    
    repuestos = [
        Repuesto(nombre='Filtro de Aceite', marca='Mann', precio_venta=45.00, stock=50, stock_minimo=10, activo=True),
        Repuesto(nombre='Filtro de Aire', marca='Bosch', precio_venta=38.00, stock=40, stock_minimo=10, activo=True),
        Repuesto(nombre='Filtro de Combustible', marca='Mann', precio_venta=55.00, stock=35, stock_minimo=8, activo=True),
        Repuesto(nombre='Bujía NGK', marca='NGK', precio_venta=28.00, stock=80, stock_minimo=20, activo=True),
        Repuesto(nombre='Pastillas de Freno Delanteras', marca='Brembo', precio_venta=150.00, stock=25, stock_minimo=5, activo=True),
        Repuesto(nombre='Pastillas de Freno Traseras', marca='Brembo', precio_venta=130.00, stock=25, stock_minimo=5, activo=True),
        Repuesto(nombre='Disco de Freno Delantero', marca='Brembo', precio_venta=220.00, stock=15, stock_minimo=4, activo=True),
        Repuesto(nombre='Disco de Freno Trasero', marca='Brembo', precio_venta=180.00, stock=15, stock_minimo=4, activo=True),
        Repuesto(nombre='Aceite de Motor 5W-30', marca='Castrol', precio_venta=110.00, stock=60, stock_minimo=15, activo=True),
        Repuesto(nombre='Aceite de Motor 10W-40', marca='Shell', precio_venta=95.00, stock=55, stock_minimo=15, activo=True),
        Repuesto(nombre='Batería 12V 60Ah', marca='Bosch', precio_venta=450.00, stock=12, stock_minimo=3, activo=True),
        Repuesto(nombre='Correa de Distribución', marca='Gates', precio_venta=280.00, stock=20, stock_minimo=5, activo=True),
        Repuesto(nombre='Amortiguador Delantero', marca='Monroe', precio_venta=320.00, stock=16, stock_minimo=4, activo=True),
        Repuesto(nombre='Amortiguador Trasero', marca='Monroe', precio_venta=290.00, stock=16, stock_minimo=4, activo=True),
        Repuesto(nombre='Líquido de Frenos DOT 4', marca='Castrol', precio_venta=35.00, stock=45, stock_minimo=10, activo=True),
        Repuesto(nombre='Refrigerante', marca='Prestone', precio_venta=42.00, stock=40, stock_minimo=10, activo=True),
        Repuesto(nombre='Limpia Parabrisas', marca='Bosch', precio_venta=48.00, stock=30, stock_minimo=8, activo=True),
        Repuesto(nombre='Foco H4', marca='Philips', precio_venta=25.00, stock=50, stock_minimo=15, activo=True),
        Repuesto(nombre='Foco LED H7', marca='Osram', precio_venta=65.00, stock=30, stock_minimo=10, activo=True),
        Repuesto(nombre='Termostato', marca='Wahler', precio_venta=75.00, stock=20, stock_minimo=5, activo=True)
    ]
    
    db.session.add_all(repuestos)
    db.session.commit()
    print(f"✅ {len(repuestos)} repuestos creados")
    return repuestos


def seed_ordenes(autos, usuarios, estados, servicios, repuestos):
    """Crea órdenes de trabajo con sus detalles."""
    print("\n📝 Creando órdenes de trabajo...")
    
    # Filtrar solo mecánicos
    mecanicos = [u for u in usuarios if u.rol.nombre_rol == 'mecanico']
    
    ordenes_creadas = []
    
    # Crear 15 órdenes de ejemplo
    for i in range(15):
        # Seleccionar auto y mecánico aleatorios
        auto = random.choice(autos)
        mecanico = random.choice(mecanicos)
        estado = random.choice(estados)
        
        # Fecha de ingreso aleatoria en los últimos 30 días
        dias_atras = random.randint(0, 30)
        fecha_ingreso = datetime.now() - timedelta(days=dias_atras)
        
        # Problema reportado aleatorio
        problemas = [
            'Motor hace ruido extraño al acelerar',
            'Frenos chirrían al frenar',
            'Luces delanteras no encienden',
            'Pérdida de potencia en subidas',
            'Vibración en el volante',
            'Aire acondicionado no enfría',
            'Consumo excesivo de combustible',
            'Humo negro del escape',
            'Batería se descarga rápidamente',
            'Transmisión patina',
            'Suspensión muy dura',
            'Ruido en la dirección',
            'Sobrecalentamiento del motor',
            'Aceite con fugas',
            'Embrague patina'
        ]
        
        diagnosticos = [
            'Requiere cambio de correa de distribución',
            'Pastillas de freno desgastadas',
            'Fusible quemado, reemplazar',
            'Filtro de aire sucio, afecta rendimiento',
            'Balanceo de ruedas necesario',
            'Compresor de A/C con falla',
            'Inyectores sucios, requiere limpieza',
            'Sensor de oxígeno defectuoso',
            'Batería al final de su vida útil',
            'Embrague desgastado',
            'Amortiguadores en mal estado',
            'Bomba de dirección con fuga',
            'Termostato defectuoso',
            'Junta de tapa de válvulas deteriorada',
            'Kit de embrague desgastado'
        ]
        
        orden = Orden(
            auto_id=auto.id,
            tecnico_id=mecanico.id,
            estado_id=estado.id,
            problema_reportado=random.choice(problemas),
            diagnostico=random.choice(diagnosticos) if random.random() > 0.3 else '',
            fecha_ingreso=fecha_ingreso,
            total_estimado=0  # Se calculará después
        )
        
        db.session.add(orden)
        db.session.flush()  # Para obtener el ID de la orden
        
        # Agregar 1-3 servicios aleatorios
        num_servicios = random.randint(1, 3)
        servicios_seleccionados = random.sample(servicios, num_servicios)
        
        for servicio in servicios_seleccionados:
            detalle_servicio = OrdenDetalleServicio(
                orden_id=orden.id,
                servicio_id=servicio.id,
                precio_aplicado=servicio.precio
            )
            db.session.add(detalle_servicio)
        
        # Agregar 0-4 repuestos aleatorios
        num_repuestos = random.randint(0, 4)
        if num_repuestos > 0:
            repuestos_seleccionados = random.sample(repuestos, num_repuestos)
            
            for repuesto in repuestos_seleccionados:
                # Cantidad aleatoria entre 1 y 3 (sin exceder stock)
                cantidad = min(random.randint(1, 3), repuesto.stock)
                
                if cantidad > 0:
                    detalle_repuesto = OrdenDetalleRepuesto(
                        orden_id=orden.id,
                        repuesto_id=repuesto.id,
                        cantidad=cantidad,
                        precio_unitario_aplicado=repuesto.precio_venta
                    )
                    db.session.add(detalle_repuesto)
                    
                    # Descontar del stock
                    repuesto.stock -= cantidad
        
        # Calcular total estimado
        total_servicios = sum(s.precio for s in servicios_seleccionados)
        total_repuestos = sum(
            d.cantidad * d.precio_unitario_aplicado 
            for d in orden.detalles_repuestos
        )
        orden.total_estimado = total_servicios + total_repuestos
        
        ordenes_creadas.append(orden)
    
    db.session.commit()
    print(f"✅ {len(ordenes_creadas)} órdenes creadas con sus detalles")
    return ordenes_creadas


def seed_pagos(ordenes):
    """Crea pagos para las órdenes."""
    print("\n💰 Creando pagos...")
    
    from sqlalchemy import text
    
    pagos_creados = []
    metodos_pago = ['Efectivo', 'QR', 'Transferencia', 'Tarjeta']
    
    # Crear pagos para el 70% de las órdenes
    ordenes_con_pago = random.sample(ordenes, int(len(ordenes) * 0.7))
    
    for orden in ordenes_con_pago:
        # Algunas órdenes tienen pago completo, otras parcial
        if random.random() > 0.3:
            # Pago completo
            monto = float(orden.total_estimado)
        else:
            # Pago parcial (50-90% del total)
            porcentaje = random.uniform(0.5, 0.9)
            monto = float(orden.total_estimado) * porcentaje
        
        # Fecha de pago entre la fecha de ingreso y ahora
        dias_desde_ingreso = (datetime.now() - orden.fecha_ingreso).days
        if dias_desde_ingreso > 0:
            dias_hasta_pago = random.randint(0, dias_desde_ingreso)
            fecha_pago = orden.fecha_ingreso + timedelta(days=dias_hasta_pago)
        else:
            fecha_pago = orden.fecha_ingreso
        
        # Insertar directamente con SQL para evitar problemas con el modelo
        query = text("""
            INSERT INTO pagos (orden_id, monto, fecha_pago, metodo_pago, activo)
            VALUES (:orden_id, :monto, :fecha_pago, :metodo_pago, :activo)
        """)
        
        db.session.execute(query, {
            'orden_id': orden.id,
            'monto': monto,
            'fecha_pago': fecha_pago,
            'metodo_pago': random.choice(metodos_pago),
            'activo': True
        })
        
        pagos_creados.append({
            'orden_id': orden.id,
            'monto': monto,
            'metodo_pago': random.choice(metodos_pago)
        })
    
    db.session.commit()
    print(f"✅ {len(pagos_creados)} pagos creados")
    return pagos_creados


def main():
    """Función principal para poblar la base de datos."""
    print("\n" + "="*60)
    print("🌱 POBLANDO BASE DE DATOS CON DATOS DE PRUEBA")
    print("="*60)
    
    app = create_app()
    
    with app.app_context():
        # Limpiar base de datos
        clear_database()
        
        # Poblar tablas en orden de dependencias
        roles = seed_roles()
        estados = seed_estados_orden()
        usuarios = seed_usuarios(roles)
        clientes = seed_clientes()
        autos = seed_autos(clientes)
        servicios = seed_servicios()
        repuestos = seed_repuestos()
        ordenes = seed_ordenes(autos, usuarios, estados, servicios, repuestos)
        pagos = seed_pagos(ordenes)
        
        print("\n" + "="*60)
        print("✅ BASE DE DATOS POBLADA EXITOSAMENTE")
        print("="*60)
        print("\n📊 RESUMEN:")
        print(f"   • Roles: {len(roles)}")
        print(f"   • Estados de Orden: {len(estados)}")
        print(f"   • Usuarios: {len(usuarios)}")
        print(f"   • Clientes: {len(clientes)}")
        print(f"   • Autos: {len(autos)}")
        print(f"   • Servicios: {len(servicios)}")
        print(f"   • Repuestos: {len(repuestos)}")
        print(f"   • Órdenes: {len(ordenes)}")
        print(f"   • Pagos: {len(pagos)}")
        
        print("\n🔑 CREDENCIALES DE ACCESO:")
        print("   Admin:")
        print("     Email: admin@taller.com")
        print("     Password: admin123")
        print("\n   Mecánico:")
        print("     Email: carlos.mecanico@taller.com")
        print("     Password: mecanico123")
        print("\n   Recepcionista:")
        print("     Email: ana.recepcion@taller.com")
        print("     Password: recepcion123")
        print("\n" + "="*60 + "\n")

if __name__ == '__main__':
    main()

