import OrderModel from '../models/OrderModel.js';
import OrderView from '../views/OrderView.js';
import PaymentView from '../views/PaymentView.js';
import Toast from '../utils/toast.js';
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
        this.paymentView = new PaymentView();
        this.api = new API();
        this.vehicleModel = new VehicleModel(this.api);
        this.clientModel = new ClientModel(); // ClientModel usually instantiates its own API or uses singleton. I'll verify.
        
        // Estado
        this.orders = [];
        this.pagination = {
            page: 1,
            total: 0,
            pages: 1
        };
        
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
    async loadOrders(page = 1, filters = {}) {
        try {
            this.view.showLoading();
            const queryParams = {
                page,
                per_page: 10,
                ...filters
            };
            const response = await this.model.getOrders(queryParams.page, queryParams.per_page);
            
            this.orders = response.items || [];
            this.pagination = {
                page: response.current_page || 1,
                pages: response.pages || 1,
                total: response.total || 0
            };
            
            this.view.render(this.orders, this.pagination);
        } catch (error) {
            console.error('Error cargando órdenes:', error);
            Toast.error('Error al cargar órdenes. Intente nuevamente.');
            this.view.render([], {}); // Render empty list on error
        } finally {
            this.view.hideLoading();
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
            case "edit":
                await this.editOrder(id);
                break;
            case "payment":
                await this.handlePaymentAction(id);
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
            this.view.showLoading();
            const order = await this.model.getOrderById(id);
            if (!order) {
                throw new Error("La orden no devolvió datos");
            }
            this.view.showOrderDetails(order);
        } catch (error) {
            console.error('Error al cargar detalles de la orden:', error);
            Toast.error('Error al cargar detalles de la orden: ' + (error.message || 'Error desconocido'));
        } finally {
            this.view.hideLoading();
        }
    }

    /**
     * Muestra el formulario para editar una orden.
     */
    async editOrder(id) {
        try {
            this.view.showLoading();
            // Cargar la orden
            const order = await this.model.getOrderById(id);
            
            // Cargar datos para los dropdowns. Incluir Clientes y Vehículos para edición completa
            const [tecnicos, estados, servicios, repuestos, clients, vehicles] = await Promise.all([
                this.loadTecnicos(),
                this.loadEstados(),
                this.loadServicios(),
                this.loadRepuestos(),
                this.loadClients(),
                this.loadVehicles()
            ]);

            this.view.showEditModal(order, {
                tecnicos,
                estados,
                servicios,
                repuestos,
                clients,
                vehicles
            });
        } catch (error) {
            console.error('Error al cargar datos para edición:', error);
            Toast.error('No se pudo cargar el formulario de edición: ' + (error.message || 'Error desconocido'));
        } finally {
            this.view.hideLoading();
        }
    }

    /**
     * Maneja el envío del formulario de edición.
     */
    async handleSubmitEdit(orderId, formData) {
        try {
            await this.model.updateOrder(orderId, formData);
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
            const [tecnicos, vehicles, clients, estados, servicios, repuestos] = await Promise.all([
                this.loadTecnicos(),
                this.loadVehicles(),
                this.loadClients(),
                this.loadEstados(),
                this.loadServicios(),
                this.loadRepuestos()
            ]);
            console.log('OrderController: Data loaded', { 
                tecnicos: tecnicos.length, 
                vehicles: vehicles.length, 
                clients: clients.length, 
                estados: estados.length,
                servicios: servicios.length,
                repuestos: repuestos.length
            });

            this.view.showNewOrderModal({
                tecnicos,
                vehicles,
                clients,
                estados,
                servicios,
                repuestos
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
        const searchTerm = query.toLowerCase().trim();
        
        // Si el input está vacío, restaurar lista completa
        if (!searchTerm) {
            this.view.updateOrderList(this.orders);
            return;
        }

        // Filtrar lista local (this.orders tiene la página actual cargada, 
        // idealmente sería sobre TODO el dataset si fuera pequeño, pero el requisito dice "lista local")
        // Nota: Si se requiere buscar en TODAS las órdenes del servidor, se necesitaría llamar a la API.
        // El requisito dice "Si hay texto, filtra la lista local (this.orders, etc.)".
        
        const filtered = this.orders.filter(order => {
            const placa = (order.placa || '').toLowerCase();
            const cliente = (order.cliente_nombre || '').toLowerCase();
            const tecnico = (order.tecnico_nombre || '').toLowerCase();
            const marca = (order.marca || '').toLowerCase();
            const modelo = (order.modelo || '').toLowerCase();
            const id = (order.id || '').toString();

            return placa.includes(searchTerm) ||
                   cliente.includes(searchTerm) ||
                   tecnico.includes(searchTerm) ||
                   marca.includes(searchTerm) ||
                   modelo.includes(searchTerm) ||
                   id.includes(searchTerm);
        });

        this.view.updateOrderList(filtered);
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
            return [];
        }
    }
    /**
     * Carga la lista de servicios.
     */
    async loadServicios() {
        try {
            const response = await this.api.get('/services');
            return response.items || response || [];
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            return [];
        }
    }

    /**
     * Carga la lista de repuestos.
     */
    async loadRepuestos() {
        try {
            const response = await this.api.get('/inventory/parts'); // Verifying route name...
            return response.items || response || [];
        } catch (error) {
            console.error('Error al cargar repuestos:', error);
            return [];
        }
    }

    /**
     * Carga la lista de clientes.
     */
    /**
     * Carga la lista de clientes.
     */
    async loadClients() {
        try {
            const response = await this.api.get('/clients?per_page=1000');
            return response.items || response || [];
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            return [];
        }
    }

    /**
     * Maneja la acción de pago.
     */
    async handlePaymentAction(orderId) {
        try {
            const balance = await this.api.get(`/payments/order/${orderId}/balance`);
            const order = await this.api.get(`/orders/${orderId}`);
            
            const paymentData = {
                ...balance,
                // CRUCIAL: Mapear estado_orden (backend) a estado_nombre (frontend view)
                estado_nombre: balance.estado_orden || order.estado_nombre || '',
                cliente_nombre: order.cliente_nombre || 'Cliente',
                id: orderId,
                total_estimado: balance.total_estimado, // Asegurar compatibilidad
                total_pagado: balance.total_pagado,
                saldo_pendiente: balance.saldo_pendiente,
                pagos: balance.pagos
            };

            this.showPaymentModal(paymentData);
        } catch (error) {
            console.error('Error al preparar pago:', error);
            Toast.error('Error al cargar info de pago');
        }
    }

    showPaymentModal(orderData) {
        if (!this.paymentView) this.paymentView = new PaymentView();
        
        // Enlazar el evento de envío
        this.paymentView.onSubmitPayment = async (paymentDetails) => {
            await this.processPayment(paymentDetails);
        };
        
        // Mostrar el modal
        this.paymentView.showPaymentModal(orderData);
    }

    async processPayment(details) {
        try {
            await this.api.post('/payments/', details);
            Toast.success('Pago registrado exitosamente');
            
            // Verificar si se completó el pago
            const balance = await this.api.get(`/payments/order/${details.orden_id}/balance`);
            
            if (balance.pagado_completamente) {
                // Preguntar si desea cambiar a Entregado
                if (confirm('✅ ¡Pago Completado!\n\nLa orden ha sido pagada en su totalidad.\n¿Desea marcar la orden como "Entregado" y finalizar el proceso?')) {
                    try {
                        // Buscar ID del estado Entregado
                        const estados = await this.api.get('/orders/estados');
                        const estadoEntregado = estados.find(e => e.nombre_estado === 'Entregado');
                        
                        if (estadoEntregado) {
                            await this.api.put(`/orders/${details.orden_id}/status`, { estado_id: estadoEntregado.id });
                            Toast.success('Orden marcada como Entregada');
                        }
                    } catch (err) {
                        console.error('Error al cambiar estado:', err);
                        Toast.error('Pago registrado, pero hubo error al cambiar estado');
                    }
                }
            }
            
            await this.loadOrders(); 
            return { success: true };
        } catch (error) {
            console.error('Error al procesar pago:', error);
            Toast.error(error.message || 'Error al procesar pago');
            throw error;
        }
    }
}
