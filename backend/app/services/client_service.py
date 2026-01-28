from app import db
from app.models import Cliente, Auto
from sqlalchemy.exc import IntegrityError

class ClientService:
    """
    Servicio para la gestión de Clientes y sus Vehículos.
    """

    @staticmethod
    def create_client(first_name, last_name, email=None, phone=None, address=None):
        """
        Crea un nuevo cliente.

        Args:
            first_name (str): Nombre.
            last_name (str): Apellido.
            email (str, optional): Email.
            phone (str, optional): Teléfono (Celular).
            address (str, optional): Dirección.

        Returns:
            Cliente: Cliente creado.

        Raises:
            ValueError: Si el email ya existe (IntegrityError).
        """
        # Mapping to Spanish model fields
        # Note: Cliente model has nombre, apellido_p, apellido_m, correo, celular, direccion
        # We map last_name to apellido_p. apellido_m is left None/Empty if not provided.

        new_client = Cliente(
            nombre=first_name,
            apellido_p=last_name,
            correo=email,
            celular=phone,
            direccion=address,
            # apellido_m can be passed if we update signature, for now None
        )
        try:
            db.session.add(new_client)
            db.session.commit()
            return new_client
        except IntegrityError:
            db.session.rollback()
            # Check what failed (ci or correo?)
            # Assuming correo for this context
            raise ValueError("El correo o CI ya está registrado (verifique datos únicos)")

    @staticmethod
    def get_all_clients(page=1, per_page=10, search=None):
        """
        Retorna clientes con paginación y búsqueda.
        
        Args:
            page (int): Página actual.
            per_page (int): Items por página.
            search (str, optional): Término de búsqueda (nombre, apellido, email).

        Returns:
            Pagination: Objeto de paginación SQLAlchemy.
        """
        query = Cliente.query
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Cliente.nombre.ilike(search_term)) |
                (Cliente.apellido_p.ilike(search_term)) |
                (Cliente.correo.ilike(search_term))
            )
            
        return query.order_by(Cliente.creado_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
        
    @staticmethod
    def get_client_by_id(client_id):
        """Retorna un cliente por ID."""
        return Cliente.query.get(client_id)

    @staticmethod
    def add_vehicle(client_id, plate, brand, model, year, color=None):
        """
        Asocia un vehículo a un cliente.

        Args:
            client_id (int): ID del cliente dueño.
            plate (str): Placa.
            brand (str): Marca.
            model (str): Modelo.
            year (int): Año.
            color (str, optional): Color (mapped from vin/color args).

        Returns:
            Auto: Vehículo creado.

        Raises:
            ValueError: Si cliente no existe o placa duplicada.
        """
        client = Cliente.query.get(client_id)
        if not client:
            raise ValueError("Cliente no encontrado")

        new_vehicle = Auto(
            cliente_id=client_id,
            placa=plate,
            marca=brand,
            modelo=model,
            anio=year,
            color=color or "Desconocido"
        )

        try:
            db.session.add(new_vehicle)
            db.session.commit()
            return new_vehicle
        except IntegrityError:
            db.session.rollback()
            raise ValueError("La placa ya existe")

    @staticmethod
    def get_client_vehicles(client_id):
        """
        Obtiene los vehículos de un cliente específico.
        
        Raises:
            ValueError: Si el cliente no existe.
        """
        client = Cliente.query.get(client_id)
        if not client:
            raise ValueError("Cliente no encontrado")
        # Relationship in Cliente is 'autos'
        return client.autos

    @staticmethod
    def update_vehicle(vehicle_id, plate=None, brand=None, model=None, year=None, color=None):
        """
        Actualiza un vehículo existente.
        """
        vehicle = Auto.query.get(vehicle_id)
        if not vehicle:
            raise ValueError("Vehículo no encontrado")

        if plate and plate != vehicle.placa:
            # Check unique plate if changed
            if Auto.query.filter_by(placa=plate).first():
                raise ValueError(f"La placa {plate} ya está registrada en otro vehículo")
            vehicle.placa = plate
        
        if brand: vehicle.marca = brand
        if model: vehicle.modelo = model
        if year: vehicle.anio = year
        if color: vehicle.color = color

        try:
            db.session.commit()
            return vehicle
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Error de integridad al actualizar vehículo")
        except Exception as e:
            db.session.rollback()
            raise e
