import OrderModel from '../models/OrderModel.js';
import OrderView from '../views/OrderView.js';

/**
 * Controlador de Órdenes
 * Coordina la lógica de gestión de órdenes entre vista y modelo.
 */
export default class OrderController {
    constructor() {
        this.model = new OrderModel();
        this.view = new OrderView();
        
        // Estado interno
        this.currentPage = 1;
        this.perPage = 10;
        this.currentEstadoFilter = null;
        this.currentSearch = null;

        // Vincular eventos
        this.view.bindNewOrder(this.handleNewOrder.bind(this));
        this.view.bindSubmitOrder(this.handleSubmitOrder.bind(this));
        this.view.bindCloseModal();
        this.view.bindOrderActions(this.handleOrderAction.bind(this));
        this.view.bindSearch(this.handleSearch.bind(this));
        this.view.bindFilterEstado(this.handleFilterEstado.bind(this));
        this.view.bindPagination(this.handlePagination.bind(this));
    }

    /**
     * Inicializa la vista cargando las órdenes.
     */
    async init() {
        await this.loadOrders();
    }

    /**
     * Carga las órdenes desde el servidor.
     */
    async loadOrders() {
        try {
            const response = await this.model.getOrders(
                this.currentPage,
                this.perPage,
                this.currentEstadoFilter,
                this.currentSearch
            );

            this.view.render(response.items || [], {
                current_page: response.current_page || 1,
                pages: response.pages || 1,
                total: response.total || 0
            });
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
            this.view.showError('No se pudieron cargar las órdenes');
            this.view.render([], {});
        }
    }

    /**
     * Maneja la creación de una nueva orden.
     */
    async handleNewOrder() {
        try {
            // Cargar datos necesarios para el formulario
            const [clientes, autos, tecnicos, servicios, estados] = await Promise.all([
                this.loadClientes(),
                this.loadAutos(),
                this.loadTecnicos(),
                this.loadServicios(),
                this.loadEstados()
            ]);

            this.view.renderOrderModal(null, {
                clientes,
                autos,
                tecnicos,
                servicios,
                estados
            });
        } catch (error) {
            console.error('Error al cargar datos del formulario:', error);
            this.view.showError('No se pudieron cargar los datos del formulario');
        }
    }

    /**
     * Carga la lista de clientes.
     */
    async loadClientes() {
        try {
            // Cargar todos los clientes sin paginación (usar per_page alto)
            const response = await fetch('http://127.0.0.1:5000/clients?per_page=1000', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar clientes');
            const data = await response.json();
            
            // El endpoint devuelve un objeto con 'items', extraer el array
            if (data && data.items && Array.isArray(data.items)) {
                return data.items;
            }
            
            // Si es un array directo, devolverlo
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    /**
     * Carga la lista de autos.
     */
    async loadAutos() {
        try {
            // Obtener todos los clientes con sus autos
            const clientes = await this.loadClientes();
            
            // Verificar que clientes sea un array
            if (!Array.isArray(clientes)) {
                console.error('Clientes no es un array:', clientes);
                return [];
            }
            
            const autos = [];
            
            for (const cliente of clientes) {
                if (cliente.autos && Array.isArray(cliente.autos) && cliente.autos.length > 0) {
                    cliente.autos.forEach(auto => {
                        autos.push({
                            ...auto,
                            cliente_id: cliente.id
                        });
                    });
                }
            }
            
            return autos;
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    /**
     * Carga la lista de técnicos.
     */
    async loadTecnicos() {
        try {
            const response = await fetch('http://127.0.0.1:5000/auth/users?role=mecanico', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar técnicos');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    /**
     * Carga la lista de servicios.
     */
    async loadServicios() {
        try {
            const response = await fetch('http://127.0.0.1:5000/services', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar servicios');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    /**
     * Carga la lista de estados de orden.
     */
    async loadEstados() {
        try {
            const response = await fetch('http://127.0.0.1:5000/orders/estados', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                // Si no existe el endpoint, retornar estados por defecto
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    /**
     * Maneja el envío del formulario de orden.
     * @param {Object} formData - Datos del formulario.
     */
    async handleSubmitOrder(formData) {
        try {
            // Crear la orden
            const orderResponse = await this.model.createOrder(formData);
            
            // Si hay servicios seleccionados, agregarlos a la orden
            if (formData.servicios_iniciales && formData.servicios_iniciales.length > 0) {
                for (const servicioId of formData.servicios_iniciales) {
                    try {
                        await this.model.addServiceToOrder(orderResponse.id, servicioId);
                    } catch (error) {
                        console.error(`Error al agregar servicio ${servicioId}:`, error);
                    }
                }
            }
            
            this.view.closeModal();
            this.view.showSuccess('Orden creada exitosamente');
            await this.loadOrders();
        } catch (error) {
            console.error('Error al crear orden:', error);
            this.view.showError('No se pudo crear la orden: ' + error.message);
        }
    }

    /**
     * Maneja las acciones de la tabla (ver, editar).
     * @param {string} action - Acción a realizar.
     * @param {string} id - ID de la orden.
     */
    async handleOrderAction(action, id) {
        if (action === 'view') {
            try {
                const order = await this.model.getOrderById(id);
                alert(JSON.stringify(order, null, 2)); // Temporal: mostrar en alert
            } catch (error) {
                this.view.showError('No se pudo cargar la orden');
            }
        } else if (action === 'edit') {
            try {
                const order = await this.model.getOrderById(id);
                this.view.renderOrderModal(order);
            } catch (error) {
                this.view.showError('No se pudo cargar la orden para editar');
            }
        }
    }

    /**
     * Maneja la búsqueda de órdenes.
     * @param {string} searchTerm - Término de búsqueda.
     */
    handleSearch(searchTerm) {
        this.currentSearch = searchTerm || null;
        this.currentPage = 1;
        this.loadOrders();
    }

    /**
     * Maneja el filtro por estado.
     * @param {string} estadoId - ID del estado.
     */
    handleFilterEstado(estadoId) {
        this.currentEstadoFilter = estadoId || null;
        this.currentPage = 1;
        this.loadOrders();
    }

    /**
     * Maneja la paginación.
     * @param {number} direction - Dirección (1 = siguiente, -1 = anterior).
     */
    handlePagination(direction) {
        this.currentPage += direction;
        this.loadOrders();
    }
}
