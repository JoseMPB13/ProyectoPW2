from app import db
from app.models import Client, Vehicle
from sqlalchemy.exc import IntegrityError

class ClientService:
    @staticmethod
    def create_client(first_name, last_name, email=None, phone=None, address=None):
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
    def get_all_clients():
        return Client.query.all()
        
    @staticmethod
    def get_client_by_id(client_id):
        return Client.query.get(client_id)

    @staticmethod
    def add_vehicle(client_id, plate, brand, model, year, vin=None):
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
        client = Client.query.get(client_id)
        if not client:
            raise ValueError("Cliente no encontrado")
        return client.vehicles
