from app import db
from app.models import Orden, OrdenDetalleServicio, OrdenDetalleRepuesto, Servicio, Repuesto, Auto, Usuario

class OrderService:
    """
    Servicio que encapsula la lógica de negocio relacionada con Órdenes de Trabajo según el nuevo modelo de datos.
    Maneja la creación de órdenes, asignación de detalles (servicios y repuestos) y cálculo de totales.
    """

    # ==============================================================================
    # GESTIÓN DE ÓRDENES
    # ==============================================================================

    @staticmethod
    def create_order(auto_id, tecnico_id, estado_id, problema_reportado=''):
        """
        Crea una nueva orden de trabajo.

        Args:
            auto_id (int): ID del auto.
            tecnico_id (int): ID del usuario técnico.
            estado_id (int): ID del estado inicial.
            problema_reportado (str): Descripción del problema.

        Returns:
            Orden: La nueva orden creada.
        """
        # Validar existencia del auto (y que esté activo)
        auto = Auto.query.filter_by(id=auto_id, activo=True).first()
        if not auto:
            raise ValueError("Auto no encontrado o inactivo")

        # Validar técnico
        tecnico = Usuario.query.filter_by(id=tecnico_id, activo=True).first()
        if not tecnico:
            raise ValueError("Técnico no encontrado o inactivo")

        new_order = Orden(
            auto_id=auto_id,
            tecnico_id=tecnico_id,
            estado_id=estado_id,
            problema_reportado=problema_reportado,
            total_estimado=0.0,
            activo=True
        )
        db.session.add(new_order)
        db.session.commit()
        return new_order

    @staticmethod
    def get_order_by_id(order_id):
        """
        Obtiene una orden por su ID si está activa.
        """
        return Orden.query.filter_by(id=order_id, activo=True).first()

    @staticmethod
    def get_all_orders(page=1, per_page=10, estado_id=None, search=None):
        """
        Obtiene órdenes registradas con paginación, filtros y búsqueda.
        """
        query = Orden.query.filter_by(activo=True).join(Auto)

        if estado_id:
            query = query.filter(Orden.estado_id == estado_id)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Auto.placa.ilike(search_term)) |
                (Auto.marca.ilike(search_term)) |
                (Auto.modelo.ilike(search_term))
            )
        
        # Ordenar por fecha de ingreso descendente
        query = query.order_by(Orden.fecha_ingreso.desc())
        
        return query.paginate(page=page, per_page=per_page, error_out=False)

    @staticmethod
    def update_order_status(order_id, estado_id):
        """
        Actualiza el estado de una orden.
        """
        order = Orden.query.filter_by(id=order_id, activo=True).first()
        if not order:
            raise ValueError("Orden no encontrada")

        order.estado_id = estado_id
        db.session.commit()
        return order

    # ==============================================================================
    # GESTIÓN DE DETALLES (SERVICIOS Y REPUESTOS)
    # ==============================================================================

    @staticmethod
    def add_service_to_order(order_id, servicio_id):
        """
        Agrega un servicio a la orden.
        """
        order = Orden.query.filter_by(id=order_id, activo=True).first()
        if not order:
            raise ValueError("Orden no encontrada")

        servicio = Servicio.query.filter_by(id=servicio_id, activo=True).first()
        if not servicio:
            raise ValueError("Servicio no encontrado o inactivo")

        # Crear detalle capturando el precio actual
        detalle = OrdenDetalleServicio(
            orden_id=order_id,
            servicio_id=servicio_id,
            precio_aplicado=servicio.precio
        )
        db.session.add(detalle)
        db.session.commit()

        # Actualizar total
        OrderService.calculate_order_total(order_id)
        return detalle

    @staticmethod
    def add_repuesto_to_order(order_id, repuesto_id, cantidad=1):
        """
        Agrega un repuesto a la orden.
        """
        order = Orden.query.filter_by(id=order_id, activo=True).first()
        if not order:
            raise ValueError("Orden no encontrada")

        repuesto = Repuesto.query.filter_by(id=repuesto_id, activo=True).first()
        if not repuesto:
            raise ValueError("Repuesto no encontrado o inactivo")

        # Verificar stock (opcional pero recomendado)
        if repuesto.stock < cantidad:
            raise ValueError(f"Stock insuficiente para el repuesto {repuesto.nombre}. Disponible: {repuesto.stock}")

        # Crear detalle capturando el precio de venta actual
        detalle = OrdenDetalleRepuesto(
            orden_id=order_id,
            repuesto_id=repuesto_id,
            cantidad=cantidad,
            precio_unitario_aplicado=repuesto.precio_venta
        )
        
        # Actualizar stock
        repuesto.stock -= cantidad

        db.session.add(detalle)
        db.session.commit()

        # Actualizar total
        OrderService.calculate_order_total(order_id)
        return detalle

    @staticmethod
    def calculate_order_total(order_id):
        """
        Calcula y actualiza el total estimado de la orden sumando servicios y repuestos.
        """
        order = Orden.query.get(order_id)
        if not order:
            return 0.0

        total_servicios = sum(d.precio_aplicado for d in order.detalles_servicios)
        total_repuestos = sum(d.precio_unitario_aplicado * d.cantidad for d in order.detalles_repuestos)
        
        order.total_estimado = total_servicios + total_repuestos
        db.session.commit()
        return order.total_estimado
