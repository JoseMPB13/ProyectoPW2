from app import db
from app.models import Cliente, Auto
from sqlalchemy.exc import IntegrityError

# ==============================================================================
# ENCABEZADO DEL ARCHIVO (Visión Macro)
# ==============================================================================
# Propósito:
#   Servicio central para la gestión de la cartera de Clientes y sus Vehículos.
#   Abstrae las operaciones de base de datos (CRUD) relacionadas con personas y activos.
#
# Flujo Lógico Central:
#   1. Recepción de datos validados.
#   2. Verificación de unicidad (CI, Correo, Placa) para evitar duplicados.
#   3. Persistencia en tablas `clientes` y `autos`.
#   4. Manejo de relaciones (un cliente tiene muchos autos).
#
# Interacciones:
#   - Interactúa con Modelos: `Cliente`, `Auto`.
#   - Llamado por: `routes/clients.py`, `routes/vehicles.py`.
# ==============================================================================

class ClientService:
    """
    Servicio de Dominio: Gestión de Clientes y Vehículos.
    Encapsula lógica de negocio como validación de duplicados y asociación.
    """

    # ==============================================================================
    # GESTIÓN DE CLIENTES
    # ==============================================================================

    @staticmethod
    def create_client(first_name, last_name, ci, email=None, phone=None, address=None):
        """
        Registra un nuevo cliente en el sistema.

        Args:
            first_name (str): Nombre(s) del cliente.
            last_name (str): Apellido Paterno.
            ci (str): Cédula de Identidad (Debe ser única).
            email (str, optional): Correo electrónico (Debe ser único).
            phone (str, optional): Número de celular.
            address (str, optional): Dirección de domicilio.

        Returns:
            Cliente: Instancia persistida del nuevo cliente.
        
        Raises:
            ValueError: Si el email o CI ya están registrados.
        """
        # Mapeo de datos (Adapter Pattern implícito)
        # Adaptamos los argumentos de entrada a la estructura del modelo SQLAlchemy
        new_client = Cliente(
            nombre=first_name,
            apellido_p=last_name,
            ci=ci,
            correo=email,
            celular=phone,
            direccion=address
        )
        try:
            # Lógica Transaccional
            db.session.add(new_client)
            db.session.commit()
            return new_client
        except IntegrityError:
            # Lógica Interna: Manejo de Colisiones
            # Si la BD lanza error de restricción única (UniqueConstraint), hacemos rollback y retornamos error amigable.
            db.session.rollback()
            raise ValueError("El correo o CI ya está registrado (verifique datos únicos)")

    @staticmethod
    def get_all_clients(page=1, per_page=10, search=None):
        """
        Recupera el listado de clientes aplicando paginación y filtros de búsqueda.

        Args:
            page (int): Número de página actual.
            per_page (int): Cantidad de registros por página.
            search (str, optional): Criterio de búsqueda (coincidencia parcial en nombre, apellido o correo).

        Returns:
            Pagination: Objeto de paginación de Flask-SQLAlchemy.
        """
        query = Cliente.query
        
        # Filtro dinámico (SQL LIKE)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Cliente.nombre.ilike(search_term)) |
                (Cliente.apellido_p.ilike(search_term)) |
                (Cliente.correo.ilike(search_term))
            )
            
        # Ordenamiento: Más recientes primero
        return query.order_by(Cliente.creado_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
        
    @staticmethod
    def get_client_by_id(client_id):
        """
        Busca un cliente por su ID primario.

        Returns:
            Cliente | None: Objeto cliente si existe, sino None.
        """
        return Cliente.query.get(client_id)

    @staticmethod
    def update_client(client_id, nombre=None, apellido_p=None, apellido_m=None, ci=None, correo=None, celular=None, direccion=None):
        """
        Actualiza la información de un cliente existente.

        Args:
            client_id (int): ID del cliente a modificar.
            **kwargs: Campos opcionales a actualizar.

        Returns:
            Cliente: El objeto actualizado.
        
        Raises:
            ValueError: Si el cliente no existe o los nuevos datos causan conflicto de unicidad.
        """
        client = Cliente.query.get(client_id)
        if not client:
            raise ValueError("Cliente no encontrado")

        # Actualización condicional (Patch)
        # Solo actualizamos los campos que vienen con valor (no None)
        if nombre: client.nombre = nombre
        if apellido_p: client.apellido_p = apellido_p
        if apellido_m is not None: client.apellido_m = apellido_m 
        if ci: client.ci = ci
        if correo: client.correo = correo
        if celular: client.celular = celular
        if direccion: client.direccion = direccion

        try:
            db.session.commit()
            return client
        except IntegrityError:
            db.session.rollback()
            raise ValueError("El correo o CI ya está registrado en otro cliente")
        except Exception as e:
            db.session.rollback()
            raise e

    # ==============================================================================
    # GESTIÓN DE VEHÍCULOS
    # ==============================================================================

    @staticmethod
    def add_vehicle(client_id, plate, brand, model, year, color=None):
        """
        Registra un nuevo vehículo y lo asocia a un cliente.

        Args:
            client_id (int): ID del propietario.
            plate (str): Placa/Patente (Única en el sistema).
            brand (str): Marca (ej: Toyota).
            model (str): Modelo (ej: Corolla).
            year (int): Año de fabricación.
            color (str, optional): Color del vehículo.

        Returns:
            Auto: El vehículo creado.

        Raises:
            ValueError: Si el cliente no existe o la placa ya está registrada.
        """
        # Validación de integridad relacional
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
            raise ValueError(f"La placa '{plate}' ya existe en el sistema")

    @staticmethod
    def get_client_vehicles(client_id):
        """
        Obtiene la lista de todos los vehículos pertenecientes a un cliente.

        Args:
            client_id (int): ID del cliente.

        Returns:
            List[Auto]: Lista de objetos Auto.
        
        Raises:
            ValueError: Si el cliente no existe.
        """
        client = Cliente.query.get(client_id)
        if not client:
            raise ValueError("Cliente no encontrado")
        
        # Uso de la relación 'backref' definida en el modelo
        return client.autos

    @staticmethod
    def update_vehicle(vehicle_id, plate=None, brand=None, model=None, year=None, color=None):
        """
        Actualiza los datos de un vehículo existente.

        Args:
            vehicle_id (int): ID del vehículo.
            **kwargs: Campos a actualizar.

        Returns:
            Auto: Vehículo actualizado.
            
        Raises:
            ValueError: Si la nueva placa ya existe en otro vehículo.
        """
        vehicle = Auto.query.get(vehicle_id)
        if not vehicle:
            raise ValueError("Vehículo no encontrado")

        # Lógica de Negocio: Validación de unicidad de placa
        # Si se intenta cambiar la placa, verificar que no pertenezca a OTRO auto.
        if plate and plate != vehicle.placa:
            conflict = Auto.query.filter_by(placa=plate).first()
            if conflict:
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
