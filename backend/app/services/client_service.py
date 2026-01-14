from app import db
from app.models import Client, Vehicle
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
            phone (str, optional): Teléfono.
            address (str, optional): Dirección.

        Returns:
            Client: Cliente creado.

        Raises:
            ValueError: Si el email ya existe (IntegrityError).
        """
        new_client = Client(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            address=address
        )
        try:
            db.session.add(new_client)
            db.session.commit()
            return new_client
        except IntegrityError:
            db.session.rollback()
            raise ValueError("El email ya está registrado para otro cliente")

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
        query = Client.query
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Client.first_name.ilike(search_term)) |
                (Client.last_name.ilike(search_term)) |
                (Client.email.ilike(search_term))
            )
            
        return query.order_by(Client.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
        
    @staticmethod
    def get_client_by_id(client_id):
        """Retorna un cliente por ID."""
        return Client.query.get(client_id)

    @staticmethod
    def add_vehicle(client_id, plate, brand, model, year, vin=None):
        """
        Asocia un vehículo a un cliente.

        Args:
            client_id (int): ID del cliente dueño.
            plate (str): Placa.
            brand (str): Marca.
            model (str): Modelo.
            year (int): Año.
            vin (str, optional): VIN.

        Returns:
            Vehicle: Vehículo creado.

        Raises:
            ValueError: Si cliente no existe o placa/VIN duplicados.
        """
        client = Client.query.get(client_id)
        if not client:
            raise ValueError("Cliente no encontrado")

        new_vehicle = Vehicle(
            client_id=client_id,
            plate=plate,
            brand=brand,
            model=model,
            year=year,
            vin=vin
        )

        try:
            db.session.add(new_vehicle)
            db.session.commit()
            return new_vehicle
        except IntegrityError:
            db.session.rollback()
            raise ValueError("La placa o el VIN ya existen")

    @staticmethod
    def get_client_vehicles(client_id):
        """
        Obtiene los vehículos de un cliente específico.
        
        Raises:
            ValueError: Si el cliente no existe.
        """
        client = Client.query.get(client_id)
        if not client:
            raise ValueError("Cliente no encontrado")
        return client.vehicles
