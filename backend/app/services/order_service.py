from app import db
from app.models import Service, WorkOrder, OrderItem, Vehicle

class OrderService:
    @staticmethod
    def create_service(name, base_price, description=''):
        new_service = Service(
            name=name,
            description=description,
            base_price=base_price
        )
        db.session.add(new_service)
        db.session.commit()
        return new_service

    @staticmethod
    def get_all_services():
        return Service.query.all()

    @staticmethod
    def get_service_by_id(service_id):
        return Service.query.get(service_id)

    @staticmethod
    def create_order(vehicle_id, user_id):
        # Validar existencia del vehículo
        vehicle = Vehicle.query.get(vehicle_id)
        if not vehicle:
            raise ValueError("Vehículo no encontrado")

        new_order = WorkOrder(
            vehicle_id=vehicle_id,
            user_id=user_id,
            status='pendiente',
            total=0.0
        )
        db.session.add(new_order)
        db.session.commit()
        return new_order

    @staticmethod
    def add_order_item(order_id, service_id):
        order = WorkOrder.query.get(order_id)
        if not order:
            raise ValueError("Orden no encontrada")

        service = Service.query.get(service_id)
        if not service:
            raise ValueError("Servicio no encontrado")

        # Crear el item de la orden
        new_item = OrderItem(
            work_order_id=order_id,
            service_id=service.id,
            price_at_moment=service.base_price
        )

        db.session.add(new_item)
        
        # Actualizar el total de la orden
        order.total += service.base_price
        
        db.session.commit()
        return new_item, order.total

    @staticmethod
    def get_order_by_id(order_id):
        return WorkOrder.query.get(order_id)

    @staticmethod
    def update_order_status(order_id, new_status):
        valid_statuses = ['pendiente', 'en_progreso', 'finalizado', 'entregado']
        if new_status not in valid_statuses:
            raise ValueError(f"Estado inválido. Permitidos: {', '.join(valid_statuses)}")

        order = WorkOrder.query.get(order_id)
        if not order:
            raise ValueError("Orden no encontrada")

        order.status = new_status
        db.session.commit()
        return order
