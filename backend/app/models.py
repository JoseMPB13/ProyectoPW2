from app import db
from datetime import datetime

# ==============================================================================
# ENCABEZADO DEL ARCHIVO (Visión Macro)
# ==============================================================================
# Propósito:
#   Este archivo define el Modelo de Datos (Schema) de la aplicación utilizando
#   SQLAlchemy ORM. Representa la estructura de la base de datos relacional.
#
# Flujo Lógico:
#   - Define clases Python que heredan de `db.Model`.
#   - Mapea estas clases a tablas SQL (`__tablename__`).
#   - Establece columnas (tipos de datos, restricciones) y relaciones entre tablas.
#   - Proporciona métodos de utilidad (`to_dict`) para serialización JSON.
#
# Interacciones:
#   - Importado por: Todos los Servicios (`services/`) y el script de seed (`seed_data.py`).
#   - Interactúa con: Base de Datos PostgreSQL/SQLite a través de `db.session` de Flask-SQLAlchemy.
# ==============================================================================

# ==============================================================================
# 1. TABLAS MAESTRAS (Roles y Estados)
# ==============================================================================

class Role(db.Model):
    """
    Representa los Roles de Usuario en el sistema.
    
    Tablas: 'roles'
    Uso: Control de acceso (RBAC). Ej: 'admin', 'mecanico', 'recepcion'.
    """
    __tablename__ = 'roles'

    id = db.Column(db.Integer, primary_key=True)
    nombre_rol = db.Column(db.String(50), unique=True, nullable=False)

    # Relación: Un rol puede ser asignado a muchos usuarios.
    # Backref 'rol' permite acceder a role.usuarios y usuario.rol
    usuarios = db.relationship('Usuario', backref='rol', lazy=True)

    def to_dict(self):
        """
        Serializa el objeto Rol a un diccionario.
        Returns:
            dict: {id, nombre_rol}
        """
        return {
            'id': self.id,
            'nombre_rol': self.nombre_rol
        }

class EstadoOrden(db.Model):
    """
    Representa los posibles estados de una Orden de Trabajo.
    
    Tablas: 'estados_orden'
    Uso: Control de flujo. Ej: 'Pendiente', 'En Proceso', 'Finalizado'.
    """
    __tablename__ = 'estados_orden'

    id = db.Column(db.Integer, primary_key=True)
    nombre_estado = db.Column(db.String(50), unique=True, nullable=False)

    # Relación: Un estado puede estar presente en muchas órdenes.
    ordenes = db.relationship('Orden', backref='estado', lazy=True)

    def to_dict(self):
        """
        Serializa el objeto EstadoOrden a un diccionario.
        Returns:
            dict: {id, nombre_estado}
        """
        return {
            'id': self.id,
            'nombre_estado': self.nombre_estado
        }

# ==============================================================================
# 2. GESTIÓN DE PERSONAS (Usuarios y Clientes)
# ==============================================================================

class Usuario(db.Model):
    """
    Representa a los usuarios del sistema (Personal del taller).
    
    Tablas: 'usuarios'
    Lógica: Almacena credenciales (password hasheado) y perfil básico.
    """
    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido_p = db.Column(db.String(100), nullable=False)
    apellido_m = db.Column(db.String(100))
    correo = db.Column(db.String(150), unique=True, nullable=False)
    celular = db.Column(db.String(20))
    password = db.Column(db.String(255), nullable=False) # Hash almacenado
    rol_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    activo = db.Column(db.Boolean, default=True)
    creado_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relación: Un usuario (técnico) puede tener muchas órdenes asignadas.
    ordenes = db.relationship('Orden', backref='tecnico', lazy=True)

    def to_dict(self):
        """
        Serializa el usuario para enviar al frontend.
        
        Nota de Seguridad:
            NO incluye el campo `password`.
            
        Returns:
            dict: Datos del perfil de usuario con nombre de rol incluido.
        """
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido_p': self.apellido_p,
            'apellido_m': self.apellido_m,
            'correo': self.correo,
            'celular': self.celular,
            'rol_id': self.rol_id,
            'rol_nombre': self.rol.nombre_rol if self.rol else None,
            'activo': self.activo,
            'creado_at': self.creado_at.isoformat() if self.creado_at else None,
        }

class Cliente(db.Model):
    """
    Representa a los dueños de vehículos.
    
    Tablas: 'clientes'
    Identificador único de negocio: CI (Cédula de Identidad).
    """
    __tablename__ = 'clientes'

    id = db.Column(db.Integer, primary_key=True)
    ci = db.Column(db.String(20), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    apellido_p = db.Column(db.String(100), nullable=False)
    apellido_m = db.Column(db.String(100))
    correo = db.Column(db.String(150))
    celular = db.Column(db.String(20))
    direccion = db.Column(db.Text)
    activo = db.Column(db.Boolean, default=True)
    creado_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relación: Un cliente puede tener múltiples autos.
    autos = db.relationship('Auto', backref='cliente', lazy=True)

    def to_dict(self):
        """
        Serializa el cliente incluyendo sus vehículos asociados.
        
        Returns:
            dict: Datos del cliente y lista de autos.
        """
        return {
            'id': self.id,
            'ci': self.ci,
            'nombre': self.nombre,
            'apellido_p': self.apellido_p,
            'apellido_m': self.apellido_m,
            'correo': self.correo,
            'celular': self.celular,
            'direccion': self.direccion,
            'activo': self.activo,
            'creado_at': self.creado_at.isoformat() if self.creado_at else None,
            'autos': [auto.to_dict() for auto in self.autos] if self.autos else []
        }


# ==============================================================================
# 3. ACTIVOS E INVENTARIO
# ==============================================================================

class Auto(db.Model):
    """
    Representa un Vehículo atendido en el taller.
    
    Tablas: 'autos'
    Identificador único de negocio: Placa.
    """
    __tablename__ = 'autos'

    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'))
    placa = db.Column(db.String(20), unique=True, nullable=False)
    marca = db.Column(db.String(50))
    modelo = db.Column(db.String(50))
    anio = db.Column(db.Integer)
    color = db.Column(db.String(30))
    activo = db.Column(db.Boolean, default=True)

    # Relación: Un auto tiene un historial de muchas órdenes.
    ordenes = db.relationship('Orden', backref='auto', lazy=True)

    def to_dict(self):
        """
        Serializa la información del vehículo.
        Returns:
            dict: Datos del auto y referencia al ID del cliente.
        """
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'placa': self.placa,
            'marca': self.marca,
            'modelo': self.modelo,
            'anio': self.anio,
            'color': self.color,
            'activo': self.activo
        }

class Servicio(db.Model):
    """
    Catálogo de Servicios ofrecidos (Mano de obra).
    
    Tablas: 'servicios'
    """
    __tablename__ = 'servicios'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    precio = db.Column(db.Float, nullable=False) # Base price
    activo = db.Column(db.Boolean, default=True)

    def to_dict(self):
        """
        Returns:
            dict: {id, nombre, descripcion, precio, activo}
        """
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'precio': self.precio,
            'activo': self.activo
        }

class Repuesto(db.Model):
    """
    Inventario de partes y repuestos.
    
    Tablas: 'repuestos'
    Lógica: Mantiene el control de stock físico.
    """
    __tablename__ = 'repuestos'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    marca = db.Column(db.String(50))
    precio_venta = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    stock_minimo = db.Column(db.Integer, default=5)
    activo = db.Column(db.Boolean, default=True)

    def to_dict(self):
        """
        Returns:
            dict: Datos del repuesto incluyendo niveles de stock.
        """
        return {
            'id': self.id,
            'nombre': self.nombre,
            'marca': self.marca,
            'precio_venta': self.precio_venta,
            'stock': self.stock,
            'stock_minimo': self.stock_minimo,
            'activo': self.activo
        }

# ==============================================================================
# 4. OPERACIONES Y PAGOS
# ==============================================================================

class Orden(db.Model):
    """
    La Entidad Central del sistema: Orden de Trabajo.
    
    Tablas: 'ordenes'
    Propósito: Agrupa el vehículo, el técnico, los servicios realizados y los repuestos usados.
    """
    __tablename__ = 'ordenes'

    id = db.Column(db.Integer, primary_key=True)
    auto_id = db.Column(db.Integer, db.ForeignKey('autos.id'))
    tecnico_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    estado_id = db.Column(db.Integer, db.ForeignKey('estados_orden.id'))
    fecha_ingreso = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_entrega = db.Column(db.DateTime)
    problema_reportado = db.Column(db.Text)
    diagnostico = db.Column(db.Text)
    total_estimado = db.Column(db.Float, default=0.00)
    activo = db.Column(db.Boolean, default=True)

    # Relaciones de Detalle (Composition)
    detalles_servicios = db.relationship('OrdenDetalleServicio', backref='orden', lazy=True)
    detalles_repuestos = db.relationship('OrdenDetalleRepuesto', backref='orden', lazy=True)
    pagos = db.relationship('Pago', backref='orden', lazy=True)

    def calcular_total_pagado(self):
        """
        Suma los pagos activos registrados para esta orden.
        Returns:
            float: Suma total de pagos.
        """
        return sum(pago.monto for pago in self.pagos if pago.activo)
    
    def calcular_saldo_pendiente(self):
        """
        Calcula cuánto falta por pagar.
        Fórmula: total_estimado - total_pagado.
        Returns:
            float: Saldo pendiente.
        """
        return self.total_estimado - self.calcular_total_pagado()
    
    def esta_pagado_completamente(self):
        """
        Verifica si la deuda ha sido saldada.
        Returns:
            bool: True si el saldo es <= 0 (con tolerancia de centavos).
        """
        return self.calcular_saldo_pendiente() <= 0.01

    def to_dict(self):
        """
        Serialización compleja de la Orden.
        Incluye 'flattener' de datos relacionados (Cliente, Auto, Técnico) 
        para facilitar el consumo en el frontend (tablas planas).
        
        Returns:
            dict: Objeto orden completo con detalles anidados y cálculos financieros.
        """
        return {
            'id': self.id,
            'auto_id': self.auto_id,
            'placa': self.auto.placa if self.auto else None,
            'marca': self.auto.marca if self.auto else None,
            'modelo': self.auto.modelo if self.auto else None,
            'cliente_nombre': f"{self.auto.cliente.nombre} {self.auto.cliente.apellido_p}" if self.auto and self.auto.cliente else 'Sin cliente',
            'cliente_ci': self.auto.cliente.ci if self.auto and self.auto.cliente else None,
            'cliente_correo': self.auto.cliente.correo if self.auto and self.auto.cliente else None,
            'cliente_telefono': self.auto.cliente.celular if self.auto and self.auto.cliente else None,
            'tecnico_id': self.tecnico_id,
            'tecnico_nombre': f"{self.tecnico.nombre} {self.tecnico.apellido_p}" if self.tecnico else None,
            'estado_id': self.estado_id,
            'estado_nombre': self.estado.nombre_estado if self.estado else None,
            'fecha_ingreso': self.fecha_ingreso.isoformat() if self.fecha_ingreso else None,
            'fecha_entrega': self.fecha_entrega.isoformat() if self.fecha_entrega else None,
            'fecha_estimada_salida': self.fecha_entrega.isoformat() if self.fecha_entrega else None, # Alias
            'fecha_salida': self.fecha_entrega.isoformat() if self.fecha_entrega else None, # Alias
            'problema_reportado': self.problema_reportado,
            'diagnostico': self.diagnostico,
            'total_estimado': self.total_estimado,
            'activo': self.activo,
            'detalles_servicios': [d.to_dict() for d in self.detalles_servicios],
            'detalles_repuestos': [d.to_dict() for d in self.detalles_repuestos],
            'pagos': [p.to_dict() for p in self.pagos],
            'total_pagado': self.calcular_total_pagado(),
            'saldo_pendiente': self.calcular_saldo_pendiente(),
            'pagado_completamente': self.esta_pagado_completamente()
        }

class Pago(db.Model):
    """
    Registro de transacciones monetarias asociadas a una orden.
    
    Tablas: 'pagos'
    """
    __tablename__ = 'pagos'

    id = db.Column(db.Integer, primary_key=True)
    orden_id = db.Column(db.Integer, db.ForeignKey('ordenes.id'))
    monto = db.Column(db.Float, nullable=False)
    fecha_pago = db.Column(db.DateTime, default=datetime.utcnow)
    metodo_pago = db.Column(db.String(50)) # Efectivo, QR, Transferencia, Tarjeta
    referencia = db.Column(db.String(100)) # ID externo opcional
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True) # Quien cobró
    activo = db.Column(db.Boolean, default=True)

    def to_dict(self):
        """
        Returns:
            dict: Datos del pago.
        """
        return {
            'id': self.id,
            'orden_id': self.orden_id,
            'monto': self.monto,
            'fecha_pago': self.fecha_pago.isoformat() if self.fecha_pago else None,
            'metodo_pago': self.metodo_pago,
            'referencia': self.referencia,
            'usuario_id': self.usuario_id,
            'activo': self.activo
        }

# ==============================================================================
# 5. TABLAS DE DETALLE (Tablas Intermedias / Pivot)
# ==============================================================================

class OrdenDetalleServicio(db.Model):
    """
    Tabla pivote entre Ordenes y Servicios.
    
    Tablas: 'orden_detalle_servicios'
    Propósito: Registra qué servicios se aplicaron y a qué precio (snapshot).
    """
    __tablename__ = 'orden_detalle_servicios'

    id = db.Column(db.Integer, primary_key=True)
    orden_id = db.Column(db.Integer, db.ForeignKey('ordenes.id'))
    servicio_id = db.Column(db.Integer, db.ForeignKey('servicios.id'))
    precio_aplicado = db.Column(db.Float) # Importante: Precio histórico, no el del catálogo actual.

    servicio = db.relationship('Servicio')

    def to_dict(self):
        """
        Returns:
            dict: Detalle del servicio con nombre denormalizado.
        """
        return {
            'id': self.id,
            'orden_id': self.orden_id,
            'servicio_id': self.servicio_id,
            'servicio_nombre': self.servicio.nombre if self.servicio else None,
            'precio_aplicado': self.precio_aplicado
        }

class OrdenDetalleRepuesto(db.Model):
    """
    Tabla pivote entre Ordenes y Repuestos.
    
    Tablas: 'orden_detalle_repuestos'
    Propósito: Registra consumo de stock.
    """
    __tablename__ = 'orden_detalle_repuestos'

    id = db.Column(db.Integer, primary_key=True)
    orden_id = db.Column(db.Integer, db.ForeignKey('ordenes.id'))
    repuesto_id = db.Column(db.Integer, db.ForeignKey('repuestos.id'))
    cantidad = db.Column(db.Integer, default=1)
    precio_unitario_aplicado = db.Column(db.Float) # Precio histórico

    repuesto = db.relationship('Repuesto')

    def to_dict(self):
        """
        Returns:
            dict: Detalle del repuesto, cantidad y subtotal implícito.
        """
        return {
            'id': self.id,
            'orden_id': self.orden_id,
            'repuesto_id': self.repuesto_id,
            'repuesto_nombre': self.repuesto.nombre if self.repuesto else None,
            'cantidad': self.cantidad,
            'precio_unitario_aplicado': self.precio_unitario_aplicado
        }



