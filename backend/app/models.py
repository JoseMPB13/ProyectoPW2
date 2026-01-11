from app import db
from datetime import datetime

# ==============================================================================
# Modelo User (Usuario)
# ==============================================================================
class User(db.Model):
    """
    Modelo que representa a los usuarios del sistema.
    
    Este modelo maneja la autenticación y los roles dentro de la aplicación.
    Los usuarios pueden ser administradores, mecánicos o personal de recepción.

    Atributos:
        id (int): Identificador único del usuario.
        username (str): Nombre de usuario único para login.
        email (str): Correo electrónico único para comunicaciones.
        password_hash (str): Hash de la contraseña (nunca se guarda en texto plano).
        role (str): Rol del usuario ('admin', 'mecanico', 'recepcion').
        created_at (datetime): Fecha y hora de creación del registro.
    
    Relaciones:
        work_orders (relationship): Relación uno-a-muchos con WorkOrder. Un usuario crea múltiples órdenes.
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)  # Nombre de usuario único
    email = db.Column(db.String(120), unique=True, nullable=False)    # Correo electrónico único
    password_hash = db.Column(db.String(255), nullable=False)         # Contraseña hasheada (seguridad)
    role = db.Column(db.String(20), nullable=False, default='recepcion')  # Roles: admin, mecanico, recepcion
    created_at = db.Column(db.DateTime, default=datetime.utcnow)      # Fecha de registro automatico

    # Relación inversa: Un usuario puede crear muchas órdenes de trabajo
    # backref='creator' permite acceder al usuario desde la orden (orden.creator)
    work_orders = db.relationship('WorkOrder', backref='creator', lazy=True)

    def to_dict(self):
        """
        Convierte el objeto User a un diccionario para su serialización JSON.

        Returns:
            dict: Diccionario con los datos públicos del usuario (sin password).
        """
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# ==============================================================================
# Modelo Client (Cliente)
# ==============================================================================
class Client(db.Model):
    """
    Modelo que representa a los clientes del taller mecánico.
    
    Almacena la información personal y de contacto de los dueños de los vehículos.

    Atributos:
        id (int): Identificador único del cliente.
        first_name (str): Nombre del cliente.
        last_name (str): Apellido del cliente.
        email (str): Correo electrónico (opcional).
        phone (str): Teléfono de contacto.
        address (str): Dirección física.
        created_at (datetime): Fecha de registro.
    
    Relaciones:
        vehicles (relationship): Relación uno-a-muchos con Vehicle. Un cliente posee múltiples vehículos.
    """
    __tablename__ = 'clients'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)  # Nombre
    last_name = db.Column(db.String(50), nullable=False)   # Apellido
    email = db.Column(db.String(120), unique=True, nullable=True) # Email opcional pero único si existe
    phone = db.Column(db.String(20), nullable=True)        # Teléfono de contacto
    address = db.Column(db.String(200), nullable=True)     # Dirección física
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relación: Un cliente tiene varios vehículos asociados
    # backref='owner' permite acceder al dueño desde el vehículo (vehiculo.owner)
    vehicles = db.relationship('Vehicle', backref='owner', lazy=True)

    def to_dict(self):
        """
        Convierte el objeto Client a un diccionario.

        Returns:
            dict: Datos del cliente listos para JSON.
        """
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# ==============================================================================
# Modelo Vehicle (Vehículo)
# ==============================================================================
class Vehicle(db.Model):
    """
    Modelo que representa los vehículos que ingresan al taller.

    Atributos:
        id (int): Identificador único del vehículo.
        client_id (int): Clave foránea que referencia al Cliente dueño.
        plate (str): Placa o matrícula (única).
        brand (str): Marca del vehículo (ej: Toyota).
        model (str): Modelo del vehículo (ej: Corolla).
        year (int): Año de fabricación.
        vin (str): Número de Identificación Vehicular (opcional, único).
    
    Relaciones:
        work_orders (relationship): Relación uno-a-muchos con WorkOrder. Historial de reparaciones.
    """
    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False) # Relación con Cliente
    plate = db.Column(db.String(20), unique=True, nullable=False) # Placa única
    brand = db.Column(db.String(50), nullable=False)              # Marca
    model = db.Column(db.String(50), nullable=False)              # Modelo
    year = db.Column(db.Integer, nullable=False)                  # Año
    vin = db.Column(db.String(50), unique=True, nullable=True)    # Número de chasis (VIN)

    # Relación: Un vehículo puede tener muchas órdenes de trabajo (historial)
    work_orders = db.relationship('WorkOrder', backref='vehicle', lazy=True)

    def to_dict(self):
        """
        Convierte el objeto Vehicle a un diccionario.

        Returns:
            dict: Datos del vehículo.
        """
        return {
            'id': self.id,
            'client_id': self.client_id,
            'plate': self.plate,
            'brand': self.brand,
            'model': self.model,
            'year': self.year,
            'vin': self.vin
        }

# ==============================================================================
# Modelo Service (Servicio)
# ==============================================================================
class Service(db.Model):
    """
    Catálogo de servicios disponibles en el taller.
    
    Define los tipos de trabajos que se pueden realizar y sus precios base.
    
    Atributos:
        id (int): ID del servicio.
        name (str): Nombre del servicio (ej: Cambio de Aceite).
        description (str): Descripción detallada de lo que incluye.
        base_price (float): Precio base sugerido.
    """
    __tablename__ = 'services'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)           # Nombre del servicio
    description = db.Column(db.Text, nullable=True)            # Descripción detallada
    base_price = db.Column(db.Float, nullable=False, default=0.0) # Precio base sugerido

    def to_dict(self):
        """
        Convierte el objeto Service a un diccionario.

        Returns:
            dict: Datos del servicio.
        """
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'base_price': self.base_price
        }

# ==============================================================================
# Modelo WorkOrder (Orden de Trabajo)
# ==============================================================================
class WorkOrder(db.Model):
    """
    Representa una Orden de Trabajo (OT) en el sistema.
    
    Es la entidad central que vincula un vehículo, un cliente (via vehiculo),
    un usuario creador y los servicios realizados (items).

    Atributos:
        id (int): ID de la orden.
        vehicle_id (int): FK al vehículo que recibe el servicio.
        user_id (int): FK al usuario que abrió la orden.
        status (str): Estado actual ('pendiente', 'en_progreso', 'finalizado').
        total (float): Costo total acumulado de los servicios.
        created_at (datetime): Fecha de creación.
    
    Relaciones:
        items (relationship): Lista de OrderItem (servicios añadidos a esta orden).
    """
    __tablename__ = 'work_orders'

    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False) # Vehículo a reparar
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)       # Usuario que creó la orden
    status = db.Column(db.String(20), default='pendiente') # Estados: pendiente, en_progreso, finalizado
    total = db.Column(db.Float, default=0.0)               # Total monetario de la orden
    created_at = db.Column(db.DateTime, default=datetime.utcnow) # Fecha de creación

    # Relación: Una orden tiene muchos items (servicios realizados)
    items = db.relationship('OrderItem', backref='work_order', lazy=True)

    def to_dict(self):
        """
        Convierte la Orden a diccionario, incluyendo sus items anidados.

        Returns:
            dict: Datos completos de la orden con lista de items.
        """
        return {
            'id': self.id,
            'vehicle_id': self.vehicle_id,
            'user_id': self.user_id,
            'status': self.status,
            'total': self.total,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'items': [item.to_dict() for item in self.items] # Incluir items anidados para el frontend
        }

# ==============================================================================
# Modelo OrderItem (Item de Orden)
# ==============================================================================
class OrderItem(db.Model):
    """
    Representa un detalle o línea dentro de una Orden de Trabajo.
    
    Actúa como tabla intermedia entre WorkOrder y Service, registrando
    el precio histórico del servicio en el momento que se realizó.

    Atributos:
        id (int): ID del item.
        work_order_id (int): FK a la orden padre.
        service_id (int): FK al servicio del catálogo.
        price_at_moment (float): Precio cobrado (puede diferir del precio base actual si este cambia).
    
    Relaciones:
        service (relationship): Acceso al objeto Service para obtener nombre/descripción.
    """
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    work_order_id = db.Column(db.Integer, db.ForeignKey('work_orders.id'), nullable=False) # Orden padre
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)       # Servicio realizado
    price_at_moment = db.Column(db.Float, nullable=False) # Precio congelado al momento de la orden

    # Relación para acceder a info del servicio desde el item
    service = db.relationship('Service')

    def to_dict(self):
        """
        Convierte el Item a diccionario.

        Returns:
            dict: Datos del item, incluyendo el nombre del servicio.
        """
        return {
            'id': self.id,
            'work_order_id': self.work_order_id,
            'service_id': self.service_id,
            'service_name': self.service.name if self.service else None, # Helper útil para mostrar en UI
            'price_at_moment': self.price_at_moment
        }
