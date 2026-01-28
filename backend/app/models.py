from app import db
from datetime import datetime

# ==============================================================================
# 1. TABLAS MAESTRAS (Roles y Estados)
# ==============================================================================

class Role(db.Model):
    __tablename__ = 'roles'

    id = db.Column(db.Integer, primary_key=True)
    nombre_rol = db.Column(db.String(50), unique=True, nullable=False)

    # Relación con usuarios
    usuarios = db.relationship('Usuario', backref='rol', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre_rol': self.nombre_rol
        }

class EstadoOrden(db.Model):
    __tablename__ = 'estados_orden'

    id = db.Column(db.Integer, primary_key=True)
    nombre_estado = db.Column(db.String(50), unique=True, nullable=False)

    # Relación con ordenes
    ordenes = db.relationship('Orden', backref='estado', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre_estado': self.nombre_estado
        }

# ==============================================================================
# 2. GESTIÓN DE PERSONAS (Usuarios y Clientes)
# ==============================================================================

class Usuario(db.Model):
    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido_p = db.Column(db.String(100), nullable=False)
    apellido_m = db.Column(db.String(100))
    correo = db.Column(db.String(150), unique=True, nullable=False)
    celular = db.Column(db.String(20))
    password = db.Column(db.String(255), nullable=False)
    rol_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    activo = db.Column(db.Boolean, default=True)
    creado_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relación: Un usuario (tecnico) puede tener muchas órdenes asignadas
    ordenes = db.relationship('Orden', backref='tecnico', lazy=True)

    def to_dict(self):
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
            # No incluimos password por seguridad
        }

class Cliente(db.Model):
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

    # Relación con autos
    autos = db.relationship('Auto', backref='cliente', lazy=True)

    def to_dict(self):
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
    __tablename__ = 'autos'

    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'))
    placa = db.Column(db.String(20), unique=True, nullable=False)
    marca = db.Column(db.String(50))
    modelo = db.Column(db.String(50))
    anio = db.Column(db.Integer)
    color = db.Column(db.String(30))
    activo = db.Column(db.Boolean, default=True)

    # Relación con ordenes
    ordenes = db.relationship('Orden', backref='auto', lazy=True)

    def to_dict(self):
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
    __tablename__ = 'servicios'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    precio = db.Column(db.Float, nullable=False) # DECIMAL(10,2) en DB
    activo = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'precio': self.precio,
            'activo': self.activo
        }

class Repuesto(db.Model):
    __tablename__ = 'repuestos'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    marca = db.Column(db.String(50))
    precio_venta = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    stock_minimo = db.Column(db.Integer, default=5)
    activo = db.Column(db.Boolean, default=True)

    def to_dict(self):
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

    # Relaciones con detalles
    detalles_servicios = db.relationship('OrdenDetalleServicio', backref='orden', lazy=True)
    detalles_repuestos = db.relationship('OrdenDetalleRepuesto', backref='orden', lazy=True)
    pagos = db.relationship('Pago', backref='orden', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'auto_id': self.auto_id,
            'placa': self.auto.placa if self.auto else None,
            'marca': self.auto.marca if self.auto else None,
            'modelo': self.auto.modelo if self.auto else None,
            'cliente_nombre': f"{self.auto.cliente.nombre} {self.auto.cliente.apellido_p}" if self.auto and self.auto.cliente else 'Sin cliente',
            'tecnico_id': self.tecnico_id,
            'tecnico_nombre': f"{self.tecnico.nombre} {self.tecnico.apellido_p}" if self.tecnico else None,
            'estado_id': self.estado_id,
            'estado_nombre': self.estado.nombre_estado if self.estado else None,
            'fecha_ingreso': self.fecha_ingreso.isoformat() if self.fecha_ingreso else None,
            'fecha_entrega': self.fecha_entrega.isoformat() if self.fecha_entrega else None,
            'fecha_estimada_salida': self.fecha_entrega.isoformat() if self.fecha_entrega else None, # Alias for consistency
            'fecha_salida': self.fecha_entrega.isoformat() if self.fecha_entrega else None, # Alias for consistency
            'problema_reportado': self.problema_reportado,
            'diagnostico': self.diagnostico,
            'total_estimado': self.total_estimado,
            'activo': self.activo,
            'detalles_servicios': [d.to_dict() for d in self.detalles_servicios],
            'detalles_repuestos': [d.to_dict() for d in self.detalles_repuestos],
            'pagos': [p.to_dict() for p in self.pagos]
        }

class Pago(db.Model):
    __tablename__ = 'pagos'

    id = db.Column(db.Integer, primary_key=True)
    orden_id = db.Column(db.Integer, db.ForeignKey('ordenes.id'))
    monto = db.Column(db.Float, nullable=False)
    fecha_pago = db.Column(db.DateTime, default=datetime.utcnow)
    metodo_pago = db.Column(db.String(50)) # Efectivo, QR, Transferencia
    activo = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'orden_id': self.orden_id,
            'monto': self.monto,
            'fecha_pago': self.fecha_pago.isoformat() if self.fecha_pago else None,
            'metodo_pago': self.metodo_pago,
            'activo': self.activo
        }

# ==============================================================================
# 5. TABLAS DE DETALLE
# ==============================================================================

class OrdenDetalleServicio(db.Model):
    __tablename__ = 'orden_detalle_servicios'

    id = db.Column(db.Integer, primary_key=True)
    orden_id = db.Column(db.Integer, db.ForeignKey('ordenes.id'))
    servicio_id = db.Column(db.Integer, db.ForeignKey('servicios.id'))
    precio_aplicado = db.Column(db.Float)

    servicio = db.relationship('Servicio')

    def to_dict(self):
        return {
            'id': self.id,
            'orden_id': self.orden_id,
            'servicio_id': self.servicio_id,
            'servicio_nombre': self.servicio.nombre if self.servicio else None,
            'precio_aplicado': self.precio_aplicado
        }

class OrdenDetalleRepuesto(db.Model):
    __tablename__ = 'orden_detalle_repuestos'

    id = db.Column(db.Integer, primary_key=True)
    orden_id = db.Column(db.Integer, db.ForeignKey('ordenes.id'))
    repuesto_id = db.Column(db.Integer, db.ForeignKey('repuestos.id'))
    cantidad = db.Column(db.Integer, default=1)
    precio_unitario_aplicado = db.Column(db.Float)

    repuesto = db.relationship('Repuesto')

    def to_dict(self):
        return {
            'id': self.id,
            'orden_id': self.orden_id,
            'repuesto_id': self.repuesto_id,
            'repuesto_nombre': self.repuesto.nombre if self.repuesto else None,
            'cantidad': self.cantidad,
            'precio_unitario_aplicado': self.precio_unitario_aplicado
        }

# ==============================================================================
# 5. PAGOS
# ==============================================================================

# NOTA: Modelo Pago comentado porque causa conflictos al iniciar el servidor
# Los pagos se manejan con SQL directo en el endpoint

# class Pago(db.Model):
#     __tablename__ = 'pagos'
#     id = db.Column(db.Integer, primary_key=True)
#     orden_id = db.Column(db.Integer, db.ForeignKey('ordenes.id'), nullable=False)
#     monto = db.Column(db.Float, nullable=False)
#     metodo_pago = db.Column(db.String(50), nullable=False)
#     fecha_pago = db.Column(db.DateTime, default=datetime.utcnow)
#     activo = db.Column(db.Boolean, default=True)



