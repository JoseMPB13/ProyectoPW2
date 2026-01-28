from app import db
from app.models import Orden, OrdenDetalleServicio, OrdenDetalleRepuesto, Servicio, Repuesto, Auto, Usuario
from sqlalchemy.exc import SQLAlchemyError

class OrderService:
    """
    Servicio que encapsula la lógica de negocio relacionada con Órdenes de Trabajo.
    Implementa estrategia de Sincronización Completa (Batch Update) para gestión de detalles.
    """

    # ==============================================================================
    # GESTIÓN DE ÓRDENES - CREACIÓN CON DETALLES
    # ==============================================================================

    @staticmethod
    def create_order_with_details(data):
        """
        Crea una nueva orden de trabajo con servicios y repuestos en una sola transacción.
        
        Args:
            data (dict): Diccionario con:
                - auto_id (int): ID del auto
                - tecnico_id (int): ID del técnico
                - estado_id (int): ID del estado inicial
                - problema_reportado (str): Descripción del problema
                - diagnostico (str, opcional): Diagnóstico técnico
                - servicios (list, opcional): Lista de dicts con {servicio_id, precio_aplicado (opcional)}
                - repuestos (list, opcional): Lista de dicts con {repuesto_id, cantidad, precio_unitario_aplicado (opcional)}
        
        Returns:
            Orden: La orden creada con todos sus detalles
            
        Raises:
            ValueError: Si hay errores de validación
            SQLAlchemyError: Si hay errores en la transacción
        """
        try:
            # Validar auto
            auto = Auto.query.filter_by(id=data['auto_id'], activo=True).first()
            if not auto:
                raise ValueError("Auto no encontrado o inactivo")

            # Validar técnico
            tecnico = Usuario.query.filter_by(id=data['tecnico_id'], activo=True).first()
            if not tecnico:
                raise ValueError("Técnico no encontrado o inactivo")

            # Crear la orden principal
            new_order = Orden(
                auto_id=data['auto_id'],
                tecnico_id=data['tecnico_id'],
                estado_id=data['estado_id'],
                problema_reportado=data.get('problema_reportado', ''),
                diagnostico=data.get('diagnostico', ''),
                total_estimado=0.0,
                activo=True
            )
            
            if 'fecha_entrega' in data and data['fecha_entrega']:
                new_order.fecha_entrega = data['fecha_entrega']
                
            if 'fecha_ingreso' in data and data['fecha_ingreso']:
                new_order.fecha_ingreso = data['fecha_ingreso']

            db.session.add(new_order)
            db.session.flush()  # Obtener el ID sin hacer commit

            # Procesar servicios
            servicios_data = data.get('servicios', [])
            total_servicios = 0.0
            
            for item in servicios_data:
                # Soporte para lista de IDs [1, 4] o lista de objetos [{id:1}, ...]
                if isinstance(item, int):
                    servicio_id = item
                    precio_aplicado = None
                else:
                    servicio_id = item.get('servicio_id') or item.get('id')
                    precio_aplicado = item.get('precio_aplicado')

                servicio = Servicio.query.filter_by(id=servicio_id, activo=True).first()
                if not servicio:
                    raise ValueError(f"Servicio con ID {servicio_id} no encontrado")
                
                # Usar precio proporcionado o el precio actual del servicio
                actual_precio = precio_aplicado if precio_aplicado is not None else servicio.precio
                
                detalle = OrdenDetalleServicio(
                    orden_id=new_order.id,
                    servicio_id=servicio.id,
                    precio_aplicado=actual_precio
                )
                db.session.add(detalle)
                total_servicios += actual_precio

            # Procesar repuestos con validación y descuento de stock
            repuestos_data = data.get('repuestos', [])
            total_repuestos = 0.0
            
            for item in repuestos_data:
                repuesto_id = item.get('repuesto_id') or item.get('id')
                cantidad = item.get('cantidad', 1)

                repuesto = Repuesto.query.filter_by(id=repuesto_id, activo=True).first()
                if not repuesto:
                    raise ValueError(f"Repuesto con ID {repuesto_id} no encontrado")
                
                # Validar stock disponible
                if repuesto.stock < cantidad:
                    raise ValueError(
                        f"Stock insuficiente para '{repuesto.nombre}'. "
                        f"Disponible: {repuesto.stock}, Solicitado: {cantidad}"
                    )
                
                # Usar precio proporcionado o el precio actual del repuesto
                precio_unitario = item.get('precio_unitario_aplicado', repuesto.precio_venta)
                
                # Crear detalle
                detalle = OrdenDetalleRepuesto(
                    orden_id=new_order.id,
                    repuesto_id=repuesto.id,
                    cantidad=cantidad,
                    precio_unitario_aplicado=precio_unitario
                )
                db.session.add(detalle)
                
                # Descontar stock
                repuesto.stock -= cantidad
                total_repuestos += (precio_unitario * cantidad)

            # Actualizar total estimado
            new_order.total_estimado = total_servicios + total_repuestos

            # Commit de toda la transacción
            db.session.commit()
            
            return new_order

        except ValueError as e:
            db.session.rollback()
            raise e
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error en la base de datos: {str(e)}")

    # ==============================================================================
    # GESTIÓN DE ÓRDENES - ACTUALIZACIÓN CON SINCRONIZACIÓN COMPLETA
    # ==============================================================================

    @staticmethod
    def update_order_with_details(order_id, data):
        """
        Actualiza una orden existente con sincronización completa de servicios y repuestos.
        
        Estrategia de Sincronización:
        - Compara los detalles actuales vs los nuevos
        - Elimina detalles que ya no están en la lista (devuelve stock para repuestos)
        - Agrega nuevos detalles (descuenta stock para repuestos)
        - Actualiza cantidades existentes (ajusta stock según diferencia)
        
        Args:
            order_id (int): ID de la orden a actualizar
            data (dict): Diccionario con:
                - tecnico_id (int, opcional): Nuevo técnico asignado
                - estado_id (int, opcional): Nuevo estado
                - problema_reportado (str, opcional): Actualización del problema
                - diagnostico (str, opcional): Actualización del diagnóstico
                - servicios (list): Lista COMPLETA de servicios que debe tener la orden
                - repuestos (list): Lista COMPLETA de repuestos que debe tener la orden
        
        Returns:
            Orden: La orden actualizada
            
        Raises:
            ValueError: Si hay errores de validación
            SQLAlchemyError: Si hay errores en la transacción
        """
        try:
            # Obtener la orden
            order = Orden.query.filter_by(id=order_id, activo=True).first()
            if not order:
                raise ValueError("Orden no encontrada")

            # Actualizar campos básicos de la orden si se proporcionan
            if 'tecnico_id' in data:
                tecnico = Usuario.query.filter_by(id=data['tecnico_id'], activo=True).first()
                if not tecnico:
                    raise ValueError("Técnico no encontrado o inactivo")
                order.tecnico_id = data['tecnico_id']
            
            if 'estado_id' in data:
                order.estado_id = data['estado_id']
            
            if 'problema_reportado' in data:
                order.problema_reportado = data['problema_reportado']
            
            if 'diagnostico' in data:
                order.diagnostico = data['diagnostico']

            if 'fecha_entrega' in data:
                order.fecha_entrega = data['fecha_entrega']
            
            if 'fecha_ingreso' in data:
                order.fecha_ingreso = data['fecha_ingreso']

            # ==============================================================================
            # SINCRONIZACIÓN DE SERVICIOS
            # ==============================================================================
            
            if 'servicios' in data:
                nuevos_servicios = data['servicios']
                
                # Normalizar lista de IDs o objetos
                nuevos_servicios_map = {}
                for item in nuevos_servicios:
                    if isinstance(item, int):
                         sid = item
                         nuevos_servicios_map[sid] = {'servicio_id': sid}
                    else:
                         sid = item.get('servicio_id') or item.get('id')
                         nuevos_servicios_map[sid] = item
                
                servicios_actuales = {d.servicio_id: d for d in order.detalles_servicios}
                nuevos_ids = set(nuevos_servicios_map.keys())

                # ELIMINAR servicios que ya no están en la nueva lista
                for servicio_id, detalle in servicios_actuales.items():
                    if servicio_id not in nuevos_ids:
                        db.session.delete(detalle)
                
                # AGREGAR o MANTENER servicios
                for sid, s_data in nuevos_servicios_map.items():
                    servicio = Servicio.query.filter_by(id=sid, activo=True).first()
                    if not servicio:
                         raise ValueError(f"Servicio con ID {sid} no encontrado")
                    
                    if sid in servicios_actuales:
                        # Ya existe, actualizar precio si se proporciona
                        if 'precio_aplicado' in s_data:
                            servicios_actuales[sid].precio_aplicado = s_data['precio_aplicado']
                    else:
                        # No existe, crear nuevo detalle
                        precio_aplicado = s_data.get('precio_aplicado', servicio.precio)
                        nuevo_detalle = OrdenDetalleServicio(
                            orden_id=order_id,
                            servicio_id=sid,
                            precio_aplicado=precio_aplicado
                        )
                        db.session.add(nuevo_detalle)

            # ==============================================================================
            # SINCRONIZACIÓN DE REPUESTOS CON GESTIÓN INTELIGENTE DE INVENTARIO
            # ==============================================================================
            
            if 'repuestos' in data:
                nuevos_repuestos = data['repuestos']
                
                # Normalizar repuestos
                nuevos_repuestos_map = {}
                for item in nuevos_repuestos:
                    rid = item.get('repuesto_id') or item.get('id')
                    nuevos_repuestos_map[rid] = item

                repuestos_actuales = {d.repuesto_id: d for d in order.detalles_repuestos}
                nuevos_ids = set(nuevos_repuestos_map.keys())
                
                # ELIMINAR repuestos que ya no están en la nueva lista (DEVOLVER STOCK)
                for rid, detalle in repuestos_actuales.items():
                    if rid not in nuevos_ids:
                        repuesto = Repuesto.query.get(rid)
                        if repuesto:
                            repuesto.stock += detalle.cantidad
                        db.session.delete(detalle)
                
                # AGREGAR nuevos repuestos o ACTUALIZAR cantidades existentes
                for rid, r_data in nuevos_repuestos_map.items():
                    nueva_cantidad = r_data.get('cantidad', 1)
                    
                    repuesto = Repuesto.query.filter_by(id=rid, activo=True).first()
                    if not repuesto:
                        raise ValueError(f"Repuesto con ID {rid} no encontrado")
                    
                    if rid in repuestos_actuales:
                        # Ya existe, ajustar cantidad y stock
                        detalle_actual = repuestos_actuales[rid]
                        cantidad_actual = detalle_actual.cantidad
                        diferencia = nueva_cantidad - cantidad_actual
                        
                        if diferencia != 0:
                            if diferencia > 0 and repuesto.stock < diferencia:
                                raise ValueError(
                                    f"Stock insuficiente para '{repuesto.nombre}'. "
                                    f"Disponible: {repuesto.stock}, Necesario: {diferencia}"
                                )
                            repuesto.stock -= diferencia
                            detalle_actual.cantidad = nueva_cantidad
                        
                        if 'precio_unitario_aplicado' in r_data:
                            detalle_actual.precio_unitario_aplicado = r_data['precio_unitario_aplicado']
                    
                    else:
                        # No existe, crear nuevo detalle y descontar stock
                        if repuesto.stock < nueva_cantidad:
                            raise ValueError(
                                f"Stock insuficiente para '{repuesto.nombre}'. "
                                f"Disponible: {repuesto.stock}, Solicitado: {nueva_cantidad}"
                            )
                        
                        precio_unitario = r_data.get('precio_unitario_aplicado', repuesto.precio_venta)
                        
                        nuevo_detalle = OrdenDetalleRepuesto(
                            orden_id=order_id,
                            repuesto_id=rid,
                            cantidad=nueva_cantidad,
                            precio_unitario_aplicado=precio_unitario
                        )
                        db.session.add(nuevo_detalle)
                        repuesto.stock -= nueva_cantidad

            # Recalcular total estimado
            db.session.flush()  # Asegurar que los cambios estén disponibles
            OrderService._recalculate_order_total(order)

            # Commit de toda la transacción
            db.session.commit()
            
            # Refrescar la orden para obtener las relaciones actualizadas
            db.session.refresh(order)
            
            return order

        except ValueError as e:
            db.session.rollback()
            raise e
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error en la base de datos: {str(e)}")

    # ==============================================================================
    # MÉTODOS AUXILIARES
    # ==============================================================================

    @staticmethod
    def _recalculate_order_total(order):
        """
        Recalcula el total estimado de una orden.
        
        Args:
            order (Orden): Instancia de la orden
        """
        total_servicios = sum(d.precio_aplicado for d in order.detalles_servicios)
        total_repuestos = sum(d.precio_unitario_aplicado * d.cantidad for d in order.detalles_repuestos)
        order.total_estimado = total_servicios + total_repuestos

    # ==============================================================================
    # MÉTODOS DE CONSULTA
    # ==============================================================================

    @staticmethod
    def get_order_by_id(order_id):
        """
        Obtiene una orden por su ID si está activa.
        
        Args:
            order_id (int): ID de la orden
            
        Returns:
            Orden: La orden encontrada o None
        """
        return Orden.query.filter_by(id=order_id, activo=True).first()

    @staticmethod
    def get_all_orders(page=1, per_page=10, estado_id=None, search=None, client_id=None):
        """
        Obtiene órdenes registradas con paginación, filtros y búsqueda.
        
        Args:
            page (int): Número de página
            per_page (int): Elementos por página
            estado_id (int, opcional): Filtrar por estado
            search (str, opcional): Término de búsqueda
            client_id (int, opcional): Filtrar por ID de cliente
            
        Returns:
            Pagination: Objeto de paginación con las órdenes
        """
        query = Orden.query.filter_by(activo=True).join(Auto)

        if estado_id:
            query = query.filter(Orden.estado_id == estado_id)
        
        # Filtro por Cliente (Relación Orden -> Auto -> Cliente)
        # Asumimos que Auto tiene cliente_id o similar relation.
        # En models.py, Cliente tiene relationship 'autos' backref='cliente'.
        # Esto implica que Auto tiene una columna 'cliente_id' (foreign key).
        if client_id:
            query = query.filter(Auto.cliente_id == client_id)
        
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
        Actualiza únicamente el estado de una orden.
        
        Args:
            order_id (int): ID de la orden
            estado_id (int): Nuevo estado
            
        Returns:
            Orden: La orden actualizada
            
        Raises:
            ValueError: Si la orden no existe
        """
        order = Orden.query.filter_by(id=order_id, activo=True).first()
        if not order:
            raise ValueError("Orden no encontrada")

        order.estado_id = estado_id
        db.session.commit()
        return order

    # ==============================================================================
    # MÉTODOS LEGACY (Mantener compatibilidad con código existente)
    # ==============================================================================

    @staticmethod
    def create_order(auto_id, tecnico_id, estado_id, problema_reportado=''):
        """
        Método legacy para crear orden sin detalles.
        Se mantiene para compatibilidad con código existente.
        """
        data = {
            'auto_id': auto_id,
            'tecnico_id': tecnico_id,
            'estado_id': estado_id,
            'problema_reportado': problema_reportado,
            'servicios': [],
            'repuestos': []
        }
        return OrderService.create_order_with_details(data)

    @staticmethod
    def add_service_to_order(order_id, servicio_id):
        """
        Método legacy para agregar un servicio.
        Se mantiene para compatibilidad con código existente.
        """
        order = Orden.query.filter_by(id=order_id, activo=True).first()
        if not order:
            raise ValueError("Orden no encontrada")

        servicio = Servicio.query.filter_by(id=servicio_id, activo=True).first()
        if not servicio:
            raise ValueError("Servicio no encontrado o inactivo")

        detalle = OrdenDetalleServicio(
            orden_id=order_id,
            servicio_id=servicio_id,
            precio_aplicado=servicio.precio
        )
        db.session.add(detalle)
        db.session.commit()

        OrderService._recalculate_order_total(order)
        db.session.commit()
        
        return detalle

    @staticmethod
    def add_repuesto_to_order(order_id, repuesto_id, cantidad=1):
        """
        Método legacy para agregar un repuesto.
        Se mantiene para compatibilidad con código existente.
        """
        order = Orden.query.filter_by(id=order_id, activo=True).first()
        if not order:
            raise ValueError("Orden no encontrada")

        repuesto = Repuesto.query.filter_by(id=repuesto_id, activo=True).first()
        if not repuesto:
            raise ValueError("Repuesto no encontrado o inactivo")

        if repuesto.stock < cantidad:
            raise ValueError(f"Stock insuficiente para el repuesto {repuesto.nombre}. Disponible: {repuesto.stock}")

        detalle = OrdenDetalleRepuesto(
            orden_id=order_id,
            repuesto_id=repuesto_id,
            cantidad=cantidad,
            precio_unitario_aplicado=repuesto.precio_venta
        )
        
        repuesto.stock -= cantidad

        db.session.add(detalle)
        db.session.commit()

        OrderService._recalculate_order_total(order)
        db.session.commit()
        
        return detalle

    @staticmethod
    def calculate_order_total(order_id):
        """
        Método legacy para calcular total.
        Se mantiene para compatibilidad con código existente.
        """
        order = Orden.query.get(order_id)
        if not order:
            return 0.0

        OrderService._recalculate_order_total(order)
        db.session.commit()
        return order.total_estimado
