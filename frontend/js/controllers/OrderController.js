import OrderModel from '../models/OrderModel.js';
import OrderView from '../views/OrderView.js';
import VehicleModel from '../models/VehicleModel.js';
import ClientModel from '../models/ClientModel.js';
import API from '../utils/api.js';

/**
 * Controlador de Órdenes - Versión Mejorada
 * Gestiona la lógica entre el modelo y la vista de órdenes.
 */
export default class OrderController {
    constructor() {
        this.model = new OrderModel();
        this.view = new OrderView();
        this.api = new API();
        this.vehicleModel = new VehicleModel(this.api);
        this.clientModel = new ClientModel(); // ClientModel usually instantiates its own API or uses singleton. I'll verify.
        
        // Estado
        this.currentPage = 1;
        this.perPage = 20;
        this.orders = [];
        
        // Vincular eventos
        this.view.bindAction(this.handleAction.bind(this));
        this.view.bindSubmitEdit(this.handleSubmitEdit.bind(this));
        this.view.bindSubmitNewOrder(this.handleSubmitNewOrder.bind(this));
        
        this.view.bindNewOrder(this.handleNewOrder.bind(this));
        this.view.bindPagination(this.handlePageChange.bind(this));
        this.view.bindFilter(this.handleFilter.bind(this));
        this.view.bindSearch(this.handleSearch.bind(this));
    }

    /**
     * Inicializa el controlador.
     */
    async init() {
        await this.loadOrders();
    }

    /**
     * Carga las órdenes desde el servidor.
     */
    async loadOrders() {
        try {
            const response = await this.model.getOrders(this.currentPage, this.perPage);
            
            this.orders = response.items || [];
            
            this.view.render(this.orders, {
                current_page: response.current_page || 1,
                pages: response.pages || 1,
                total: response.total || 0
            });
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
            this.view.render([], {});
        }
    }

    /**
     * Maneja las acciones de los botones.
     */
    async handleAction(action, id) {
        switch (action) {
            case 'view':
                await this.viewOrder(id);
                break;
            case 'edit':
                await this.editOrder(id);
                break;
            case 'delete':
                if (confirm('¿Está seguro de eliminar esta orden?')) {
                     // Nota: No implementamos delete en backend todavía para órdenes,
                     // pero si lo hiciéramos, iría aquí.
                     alert('Funcionalidad de eliminar orden no disponible por seguridad.');
                }
                break;
        }
    }

    /**
     * Muestra los detalles de una orden.
     */
    async viewOrder(id) {
        try {
            const order = await this.model.getOrderById(id);
            if (!order) {
                throw new Error("La orden no devolvió datos");
            }
            this.view.showOrderDetails(order);
        } catch (error) {
            console.error('Error al cargar orden:', error);
            alert('Error al cargar detalles de la orden: ' + (error.message || 'Error desconocido'));
        }
    }

    /**
     * Muestra el formulario para editar una orden.
     */
    async editOrder(id) {
        try {
            // Cargar la orden
            const order = await this.model.getOrderById(id);
            
            // Cargar datos para los dropdowns
            const [tecnicos, estados] = await Promise.all([
                this.loadTecnicos(),
                this.loadEstados()
            ]);

            this.view.showEditModal(order, {
                tecnicos,
                estados
            });
        } catch (error) {
            console.error('Error al cargar datos para edición:', error);
            alert('No se pudo cargar el formulario de edición');
        }
    }

    /**
     * Maneja el envío del formulario de edición.
     */
    async handleSubmitEdit(orderId, formData) {
        try {
            await this.model.updateOrder(orderId, formData);
            alert('Orden actualizada exitosamente');
            await this.loadOrders();
        } catch (error) {
            console.error('Error al actualizar orden:', error);
            alert('No se pudo actualizar la orden');
        }
    }

    /**
     * Muestra el formulario para crear una nueva orden.
     */
    async handleNewOrder() {
        console.log('OrderController: handleNewOrder started');
        try {
            console.log('OrderController: Loading data...');
            const [tecnicos, vehicles, clients, estados] = await Promise.all([
                this.loadTecnicos(),
                this.loadVehicles(),
                this.loadClients(),
                this.loadEstados()
            ]);
            console.log('OrderController: Data loaded', { 
                tecnicos: tecnicos.length, 
                vehicles: vehicles.length, 
                clients: clients.length,
                estados: estados.length
            });

            this.view.showNewOrderModal({
                tecnicos,
                vehicles,
                clients,
                estados
            });
            console.log('OrderController: Modal shown');
        } catch (error) {
            console.error('OrderController: Error in handleNewOrder:', error);
            alert('No se pudo cargar el formulario: ' + error.message);
        }
    }

    /**
     * Maneja el envío del formulario de nueva orden.
     */
    async handleSubmitNewOrder(formData) {
        try {
            await this.model.createOrder(formData);
            alert('Orden creada exitosamente');
            await this.loadOrders();
        } catch (error) {
            console.error('Error al crear orden:', error);
            alert('No se pudo crear la orden: ' + (error.message || 'Error desconocido'));
        }
    }

    /**
     * Maneja el cambio de página.
     */
    async handlePageChange(direction) {
        if (direction === 'prev' && this.currentPage > 1) {
            this.currentPage--;
            await this.loadOrders();
        } else if (direction === 'next') {
            this.currentPage++;
            await this.loadOrders();
        }
    }

    /**
     * Maneja el filtro por estado.
     */
    handleFilter(estado) {
        // Por ahora el filtrado es local en la vista,
        // pero aquí podríamos implementar filtrado en servidor.
        console.log('Filtro estado:', estado);
    }

    /**
     * Maneja la búsqueda.
     */
    handleSearch(query) {
        // Búsqueda local en vista, o implementar servidor.
        console.log('Búsqueda:', query);
    }

    /**
     * Carga la lista de técnicos.
     */
    async loadTecnicos() {
        console.log('OrderController: loadTecnicos started');
        try {
            const response = await this.api.get('/auth/users?per_page=100');
            console.log('OrderController: loadTecnicos response', response);
            const users = response.items || response || [];
            
            // Filtrar solo mecánicos
            return users.filter(u => u.rol_nombre === 'mecanico' || u.rol_nombre === 'admin');
        } catch (error) {
            console.error('OrderController: Error al cargar técnicos:', error);
            return [];
        }
    }

    /**
     * Carga la lista de vehículos.
     */
    async loadVehicles() {
        console.log('OrderController: loadVehicles started');
        try {
            const result = await this.vehicleModel.getAll();
            console.log('OrderController: loadVehicles result', result);
            return result;
        } catch (error) {
            console.error('OrderController: Error al cargar vehículos:', error);
            return [];
        }
    }

    /**
     * Carga la lista de estados.
     */
    async loadEstados() {
        try {
            const response = await this.api.get('/orders/estados');
            return response || [];
        } catch (error) {
            console.error('Error al cargar estados:', error);
            return [
                { id: 1, nombre_estado: 'Pendiente' },
                { id: 2, nombre_estado: 'En Proceso' },
                { id: 3, nombre_estado: 'Finalizado' },
                { id: 4, nombre_estado: 'Entregado' }
            ];
        }
    }

    /**
     * Carga la lista de clientes.
     */
    async loadClients() {
        try {
            // Check if clientModel has getAll, otherwise fallback
            if (this.clientModel && typeof this.clientModel.getAll === 'function') {
                 const response = await this.clientModel.getAll();
                 // ClientModel.getAll usually returns { items: [...], ... }
                 return response.items || response || [];
            }
            
            const response = await this.api.get('/clients?per_page=1000');
            return response.items || response || [];
        } catch (error) {
            console.error('OrderController: Error al cargar clientes:', error);
            return [];
        }
    }
}
