from app import db
from app.models import Orden, OrdenDetalleServicio, OrdenDetalleRepuesto, Servicio, Repuesto, Auto, Usuario
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func

# ==============================================================================
# ENCABEZADO DEL ARCHIVO (Visión Macro)
# ==============================================================================
# Propósito:
#   Gestiona el ciclo de vida de las Órdenes de Trabajo (Creación, Actualización, Consulta).
#   Es el "cerebro" central de la operación del taller.
#
# Flujo Lógico Central:
#   1. Recepción de datos crudos del controlador/API.
#   2. Validación de negocio (existencia de auto, stock suficiente, técnico activo).
#   3. Gestión Transaccional (Atomicidad): Todas las operaciones (crear orden + detalles + descontar stock)
#      ocurren en una sola transacción. Si algo falla, se hace rollback de todo.
#   4. Estrategia de Actualización: "Full Synchronization". 
#      El frontend envía el estado completo deseado de la orden (lista completa de items).
#      El servicio calcula las diferencias (Diff): Qué borrar, qué agregar y qué actualizar,
#      gestionando automáticamente la devolución o consumo de stock.
#
# Interacciones:
#   - Interactúa con Modelos: Orden, Auto, Usuario, Servicio, Repuesto.
#   - Llamado por: `routes/orders.py` (API REST).
# ==============================================================================

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
        Crea una nueva orden de trabajo con servicios y repuestos en una sola transacción atómica.
        
        Descripción:
            Orquesta la creación de la cabecera de la orden y sus líneas de detalle.
            Verifica y descuenta stock de repuestos en tiempo real.
        
        Args:
            data (dict): Diccionario conteniendo:
                - auto_id (int): ID del auto existente.
                - tecnico_id (int): ID del técnico responsable.
                - estado_id (int): ID del estado inicial (ej: 'Pendiente').
                - problema_reportado (str): Texto descriptivo.
                - diagnostico (str, optional): Texto técnico.
                - servicios (list, optional): Lista de {servicio_id, [precio_aplicado]}.
                - repuestos (list, optional): Lista de {repuesto_id, cantidad, [precio_unitario_aplicado]}.
        
        Returns:
            Orden: La instancia de orden persistida con todos sus detalles vinculados.
            
        Raises:
            ValueError: Si fallan validaciones de negocio (stock insuficiente, IDs no válidos).
            Exception: Si ocurre error de base de datos (SQLAlchemyError).
        """
        try:
            # Lógica Interna: Validaciones de Existencia
            # Usamos filter_by(activo=True) para asegurar Integridad Referencial Lógica.
            auto = Auto.query.filter_by(id=data['auto_id'], activo=True).first()
            if not auto:
                raise ValueError("Auto no encontrado o inactivo")

            tecnico = Usuario.query.filter_by(id=data['tecnico_id'], activo=True).first()
            if not tecnico:
                raise ValueError("Técnico no encontrado o inactivo")

            # Lógica Interna: Creación de Cabecera
            new_order = Orden(
                auto_id=data['auto_id'],
                tecnico_id=data['tecnico_id'],
                estado_id=data['estado_id'],
                problema_reportado=data.get('problema_reportado', ''),
                diagnostico=data.get('diagnostico', ''),
                total_estimado=0.0, # Se calculará al final
                activo=True
            )
            
            # Manejo de fechas opcionales
            if 'fecha_entrega' in data and data['fecha_entrega']:
                new_order.fecha_entrega = data['fecha_entrega']
                
            if 'fecha_ingreso' in data and data['fecha_ingreso']:
                new_order.fecha_ingreso = data['fecha_ingreso']

            db.session.add(new_order)
            db.session.flush()  # CRÍTICO: Genera el ID de la orden sin confirmar la transacción (commit)

            # ==============================================================================
            # DETALLES: SERVICIOS
            # ==============================================================================
            servicios_data = data.get('servicios', [])
            total_servicios = 0.0
            
            for item in servicios_data:
                # Normalización de entrada: Soporta tanto lista de IDs [1, 2] como objetos [{id:1}, {id:2}]
                if isinstance(item, int):
                    servicio_id = item
                    precio_aplicado = None
                else:
                    servicio_id = item.get('servicio_id') or item.get('id')
                    precio_aplicado = item.get('precio_aplicado')

                # Validación
                servicio = Servicio.query.filter_by(id=servicio_id, activo=True).first()
                if not servicio:
                    raise ValueError(f"Servicio con ID {servicio_id} no encontrado")
                
                # Determinación de Precio: Prioridad al precio manual, fallback al catálogo.
                actual_precio = precio_aplicado if precio_aplicado is not None else servicio.precio
                
                detalle = OrdenDetalleServicio(
                    orden_id=new_order.id,
                    servicio_id=servicio.id,
                    precio_aplicado=actual_precio
                )
                db.session.add(detalle)
                total_servicios += actual_precio

            # ==============================================================================
            # DETALLES: REPUESTOS (Gestión de Stock)
            # ==============================================================================
            repuestos_data = data.get('repuestos', [])
            total_repuestos = 0.0
            
            for item in repuestos_data:
                repuesto_id = item.get('repuesto_id') or item.get('id')
                cantidad = item.get('cantidad', 1)

                repuesto = Repuesto.query.filter_by(id=repuesto_id, activo=True).first()
                if not repuesto:
                    raise ValueError(f"Repuesto con ID {repuesto_id} no encontrado")
                
                # Lógica de Negocio: Validación estricta de Stock
                # No permitimos vender lo que no tenemos.
                if repuesto.stock < cantidad:
                    raise ValueError(
                        f"Stock insuficiente para '{repuesto.nombre}'. "
                        f"Disponible: {repuesto.stock}, Solicitado: {cantidad}"
                    )
                
                precio_unitario = item.get('precio_unitario_aplicado', repuesto.precio_venta)
                
                detalle = OrdenDetalleRepuesto(
                    orden_id=new_order.id,
                    repuesto_id=repuesto.id,
                    cantidad=cantidad,
                    precio_unitario_aplicado=precio_unitario
                )
                db.session.add(detalle)
                
                # Efecto colateral: Descuento de stock en DB
                repuesto.stock -= cantidad
                total_repuestos += (precio_unitario * cantidad)

            # Lógica Interna: Cálculo y Persistencia
            new_order.total_estimado = total_servicios + total_repuestos

            # Commit final: Si llegamos aquí, todo es válido.
            db.session.commit()
            
            return new_order

        except ValueError as e:
            # Control de Errores: Deshacer cambios parciales si falla validación de negocio
            db.session.rollback()
            raise e
        except SQLAlchemyError as e:
            # Control de Errores: Deshacer si falla la BD
            db.session.rollback()
            raise Exception(f"Error en la base de datos: {str(e)}")

    # ==============================================================================
    # GESTIÓN DE ÓRDENES - ACTUALIZACIÓN CON SINCRONIZACIÓN COMPLETA
    # ==============================================================================

    @staticmethod
    def update_order_with_details(order_id, data):
        """
        Actualiza una orden existente aplicando una estrategia de "Sincronización Completa".
        
        Descripción:
            Recibe la 'imagen deseada' de la orden. El servicio se encarga de calcular
            el delta (diferencias) con la base de datos:
            - Items ausentes en 'data' -> Se eliminan (y se devuelve stock).
            - Items nuevos en 'data' -> Se crean (y se consume stock).
            - Items existentes -> Se actualizan cantidades (y se ajusta stock diferencial).
        
        Args:
            order_id (int): ID de la orden.
            data (dict): Datos actualizados (técnico, fechas, lista completa de servicios/repuestos).
        
        Returns:
            Orden: Objeto actualizado y refrescado.
        """
        try:
            # 1. Obtener la entidad a modificar
            order = Orden.query.filter_by(id=order_id, activo=True).first()
            if not order:
                raise ValueError("Orden no encontrada")

            # 2. Actualización de campos escalares (Header)
            if 'tecnico_id' in data:
                tecnico = Usuario.query.filter_by(id=data['tecnico_id'], activo=True).first()
                if not tecnico:
                    raise ValueError("Técnico no encontrado o inactivo")
                order.tecnico_id = data['tecnico_id']
            
            if 'estado_id' in data: order.estado_id = data['estado_id']
            if 'problema_reportado' in data: order.problema_reportado = data['problema_reportado']
            if 'diagnostico' in data: order.diagnostico = data['diagnostico']
            if 'fecha_entrega' in data: order.fecha_entrega = data['fecha_entrega']
            if 'fecha_ingreso' in data: order.fecha_ingreso = data['fecha_ingreso']

            # ==============================================================================
            # SINCRONIZACIÓN DE SERVICIOS
            # ==============================================================================
            if 'servicios' in data:
                nuevos_servicios = data['servicios']
                
                # Normalización a diccionario para búsqueda rápida O(1)
                nuevos_servicios_map = {}
                for item in nuevos_servicios:
                    if isinstance(item, int):
                         sid = item
                         nuevos_servicios_map[sid] = {'servicio_id': sid}
                    else:
                         sid = item.get('servicio_id') or item.get('id')
                         nuevos_servicios_map[sid] = item
                
                # Mapeo de estado actual en BD
                servicios_actuales = {d.servicio_id: d for d in order.detalles_servicios}
                nuevos_ids = set(nuevos_servicios_map.keys())

                # PASO A: Eliminar (Delete)
                # Si está en BD pero no en la nueva lista, se borra.
                for servicio_id, detalle in servicios_actuales.items():
                    if servicio_id not in nuevos_ids:
                        db.session.delete(detalle)
                
                # PASO B: Crear o Actualizar (Upsert logic)
                for sid, s_data in nuevos_servicios_map.items():
                    servicio = Servicio.query.filter_by(id=sid, activo=True).first()
                    if not servicio:
                         raise ValueError(f"Servicio con ID {sid} no encontrado")
                    
                    if sid in servicios_actuales:
                        # Update: Si ya existe, solo actualizamos precio si cambió
                        if 'precio_aplicado' in s_data:
                            servicios_actuales[sid].precio_aplicado = s_data['precio_aplicado']
                    else:
                        # Create: Nuevo registro
                        precio_aplicado = s_data.get('precio_aplicado', servicio.precio)
                        nuevo_detalle = OrdenDetalleServicio(
                            orden_id=order_id,
                            servicio_id=sid,
                            precio_aplicado=precio_aplicado
                        )
                        db.session.add(nuevo_detalle)

            # ==============================================================================
            # SINCRONIZACIÓN DE REPUESTOS (Lógica Crítica de Inventario)
            # ==============================================================================
            if 'repuestos' in data:
                nuevos_repuestos = data['repuestos']
                
                # Normalización
                nuevos_repuestos_map = {}
                for item in nuevos_repuestos:
                    rid = item.get('repuesto_id') or item.get('id')
                    nuevos_repuestos_map[rid] = item

                repuestos_actuales = {d.repuesto_id: d for d in order.detalles_repuestos}
                nuevos_ids = set(nuevos_repuestos_map.keys())
                
                # PASO A: Eliminar -> Devolución de Stock
                # Si quito un repuesto de la orden, debo devolverlo al estante.
                for rid, detalle in repuestos_actuales.items():
                    if rid not in nuevos_ids:
                        repuesto = Repuesto.query.get(rid)
                        if repuesto:
                            repuesto.stock += detalle.cantidad # Reembolso
                        db.session.delete(detalle)
                
                # PASO B: Agregar/Actualizar
                for rid, r_data in nuevos_repuestos_map.items():
                    nueva_cantidad = r_data.get('cantidad', 1)
                    
                    repuesto = Repuesto.query.filter_by(id=rid, activo=True).first()
                    if not repuesto:
                        raise ValueError(f"Repuesto con ID {rid} no encontrado")
                    
                    if rid in repuestos_actuales:
                        # Update: Ajuste diferencial de stock
                        detalle_actual = repuestos_actuales[rid]
                        cantidad_actual = detalle_actual.cantidad
                        diferencia = nueva_cantidad - cantidad_actual
                        
                        if diferencia != 0:
                            # Validar solo si estoy pidiendo MÁS (diferencia positiva)
                            if diferencia > 0 and repuesto.stock < diferencia:
                                raise ValueError(
                                    f"Stock insuficiente para '{repuesto.nombre}'. "
                                    f"Disponible: {repuesto.stock}, Necesario: {diferencia}"
                                )
                            # Si diferencia es negativa (estoy devolviendo), el stock aumenta (menos por menos da mas)
                            repuesto.stock -= diferencia 
                            detalle_actual.cantidad = nueva_cantidad
                        
                        if 'precio_unitario_aplicado' in r_data:
                            detalle_actual.precio_unitario_aplicado = r_data['precio_unitario_aplicado']
                    
                    else:
                        # Create: Nuevo consumo de stock
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

            # 3. Recálculo de Totales Post-Procesamiento
            # Hacemos flush para que las consultas SQL agregadas 'vean' los cambios pendientes en memoria
            db.session.flush()
            OrderService._recalculate_order_total(order)

            # 4. Confirmación
            db.session.commit()
            
            # 5. Refresco para retornar datos limpios
            db.session.refresh(order)
            return order

        except ValueError as e:
            db.session.rollback()
            raise e
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error en la base de datos: {str(e)}")

    # ==============================================================================
    # MÉTODOS AUXILIARES Y DE CONSULTA
    # ==============================================================================

    @staticmethod
    def _recalculate_order_total(order):
        """
        Recalcula el total estimado de una orden sumando sus servicios y repuestos.
        
        Lógica:
            Ejecuta funciones de agregación SUM() en la BD para la orden dada.
            Actualiza el campo 'total_estimado'. No hace commit.
        """
        # Sumar servicios
        total_servicios = db.session.query(db.func.sum(OrdenDetalleServicio.precio_aplicado))\
            .filter_by(orden_id=order.id).scalar() or 0.0
            
        # Sumar repuestos (precio * cantidad)
        total_repuestos = db.session.query(db.func.sum(OrdenDetalleRepuesto.precio_unitario_aplicado * OrdenDetalleRepuesto.cantidad))\
            .filter_by(orden_id=order.id).scalar() or 0.0
            
        order.total_estimado = float(total_servicios) + float(total_repuestos)

    @staticmethod
    def recalculate_all_totals():
        """
        Utilidad para mantenimiento: Recalcula los totales de TODAS las órdenes activas.
        Útil si se detectan inconsistencias.
        
        Returns:
            dict: Estadísticas {total, corrected}.
        """
        orders = Orden.query.filter_by(activo=True).all()
        count = 0
        corrected = 0
        
        for order in orders:
            old_total = order.total_estimado or 0.0
            
            # Sumar servicios
            total_servicios = db.session.query(func.sum(OrdenDetalleServicio.precio_aplicado))\
                .filter_by(orden_id=order.id).scalar() or 0.0
                
            # Sumar repuestos (precio * cantidad)
            total_repuestos = db.session.query(func.sum(OrdenDetalleRepuesto.precio_unitario_aplicado * OrdenDetalleRepuesto.cantidad))\
                .filter_by(orden_id=order.id).scalar() or 0.0
                
            order.total_estimado = float(total_servicios) + float(total_repuestos)
            
            if abs(old_total - order.total_estimado) > 0.01:
                corrected += 1
                
            count += 1
            
        db.session.commit()
        return {"total": count, "corrected": corrected}

    @staticmethod
    def get_order_by_id(order_id):
        """
        Obtiene una orden por su ID si está activa.
        Returns: Orden o None.
        """
        return Orden.query.filter_by(id=order_id, activo=True).first()

    @staticmethod
    def get_all_orders(page=1, per_page=10, estado_id=None, search=None, client_id=None):
        """
        Obtiene órdenes registradas con paginación, filtros y búsqueda.
        
        Parámetros:
            - search: Busca por placa, marca o modelo (ILIKE).
            - client_id: Filtra por dueño del vehículo.
            
        Returns:
            Pagination: Objeto paginado de Flask-SQLAlchemy.
        """
        query = Orden.query.filter_by(activo=True).join(Auto)

        if estado_id:
            query = query.filter(Orden.estado_id == estado_id)
        
        if client_id:
            query = query.filter(Auto.cliente_id == client_id)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Auto.placa.ilike(search_term)) |
                (Auto.marca.ilike(search_term)) |
                (Auto.modelo.ilike(search_term))
            )
        
        # Ordenar por fecha de ingreso descendente (más recientes primero)
        query = query.order_by(Orden.fecha_ingreso.desc())
        
        return query.paginate(page=page, per_page=per_page, error_out=False)

    @staticmethod
    def update_order_status(order_id, estado_id):
        """
        Actualiza únicamente el estado de una orden (transición de flujo).
        """
        order = Orden.query.filter_by(id=order_id, activo=True).first()
        if not order:
            raise ValueError("Orden no encontrada")

        order.estado_id = estado_id
        db.session.commit()
        return order

    # ==============================================================================
    # MÉTODOS LEGACY (Compatibilidad)
    # ==============================================================================
    # Se mantienen por compatibilidad hacia atrás con controladores antiguos o scripts.

    @staticmethod
    def create_order(auto_id, tecnico_id, estado_id, problema_reportado=''):
        """Wrapper legacy para crear orden sin detalles."""
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
        """Método legacy unitario. Se recomienda usar update_order_with_details."""
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
        """Método legacy unitario. Se recomienda usar update_order_with_details."""
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
        """Método legacy."""
        order = Orden.query.get(order_id)
        if not order:
            return 0.0

        OrderService._recalculate_order_total(order)
        db.session.commit()
        return order.total_estimado
