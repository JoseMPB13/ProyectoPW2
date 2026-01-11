from app import db
from app.models import Service, WorkOrder, OrderItem, Vehicle

class OrderService:
    """
    Servicio que encapsula la lógica de negocio relacionada con Servicios y Órdenes de Trabajo.
    Maneja las transacciones con la base de datos y validaciones de negocio.
    """

    @staticmethod
    def create_service(name, base_price, description=''):
        """
        Crea un nuevo servicio en el catálogo.

        Args:
            name (str): Nombre del servicio (ej: 'Cambio de Aceite').
            base_price (float): Precio base del servicio.
            description (str, opcional): Descripción detallada del servicio.

        Returns:
            Service: Objeto del servicio creado.
        
        Raises:
            SQLAlchemyError: Si hay errores de base de datos.
        """
        new_service = Service(
            name=name,
            description=description,
            base_price=base_price
        )
        db.session.add(new_service)
        db.session.commit() # Confirmar transacción
        return new_service

    @staticmethod
    def get_all_services():
        """
        Obtiene todos los servicios disponibles en el catálogo.

        Returns:
            list[Service]: Lista de objetos Service.
        """
        return Service.query.all()

    @staticmethod
    def get_service_by_id(service_id):
        """
        Busca un servicio por su ID.

        Args:
            service_id (int): ID del servicio a buscar.

        Returns:
            Service | None: El objeto Service si existe, o None.
        """
        return Service.query.get(service_id)

    @staticmethod
    def create_order(vehicle_id, user_id):
        """
        Crea una nueva orden de trabajo vacía para un vehículo.

        Args:
            vehicle_id (int): ID del vehículo.
            user_id (int): ID del usuario que crea la orden.

        Returns:
            WorkOrder: La nueva orden creada con estado 'pendiente'.
        
        Raises:
            ValueError: Si el vehículo no existe.
        """
        # 1. Validar existencia del vehículo antes de crear la orden
        vehicle = Vehicle.query.get(vehicle_id)
        if not vehicle:
            raise ValueError("Vehículo no encontrado")

        # 2. Inicializar la orden con total en 0.0
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
        """
        Agrega un servicio (Item) a una orden existente y actualiza el total.

        Args:
            order_id (int): ID de la orden de trabajo.
            service_id (int): ID del servicio a agregar.

        Returns:
            tuple(OrderItem, float): Tupla con el nuevo item y el total actualizado de la orden.
        
        Raises:
            ValueError: Si la orden o el servicio no existen.
        """
        # 1. Buscar la orden
        order = WorkOrder.query.get(order_id)
        if not order:
            raise ValueError("Orden no encontrada")

        # 2. Buscar el servicio para obtener su precio base actual
        service = Service.query.get(service_id)
        if not service:
            raise ValueError("Servicio no encontrado")

        # 3. Crear el item congelando el precio al momento de la venta
        new_item = OrderItem(
            work_order_id=order_id,
            service_id=service.id,
            price_at_moment=service.base_price
        )

        db.session.add(new_item)
        
        # 4. Actualizar el total de la orden sumando el precio del servicio
        order.total += service.base_price
        
        db.session.commit() # Confirmar ambas operaciones (item + update orden) atómicamente
        return new_item, order.total

    @staticmethod
    def get_order_by_id(order_id):
        """
        Obtiene una orden por su ID.

        Args:
            order_id (int): ID de la orden.

        Returns:
            WorkOrder | None: Objeto WorkOrder o None.
        """
        return WorkOrder.query.get(order_id)

    @staticmethod
    def update_order_status(order_id, new_status):
        """
        Actualiza el estado de una orden.

        Args:
            order_id (int): ID de la orden.
            new_status (str): Nuevo estado ('pendiente', 'en_progreso', etc).

        Returns:
            WorkOrder: La orden actualizada.
        
        Raises:
            ValueError: Si el estado no es válido o la orden no existe.
        """
        valid_statuses = ['pendiente', 'en_progreso', 'finalizado', 'entregado']
        if new_status not in valid_statuses:
            raise ValueError(f"Estado inválido. Permitidos: {', '.join(valid_statuses)}")

        order = WorkOrder.query.get(order_id)
        if not order:
            raise ValueError("Orden no encontrada")

        order.status = new_status
        db.session.commit()
        return order
