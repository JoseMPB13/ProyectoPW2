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
        this.clientModel = new ClientModel();
        
        // Estado
        this.orders = [];
        this.pagination = {
            page: 1,
            total: 0,
            pages: 1
        };
        this.currentFilters = {
            search: '',
            estadoId: null
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
    async loadOrders(page = 1) {
        try {
            this.view.showLoading();
            // Mantener página actual si no se especifica, pero si cambiaron filtros (usualmente se llama con 1)
            const targetPage = page || this.pagination.page;

            const { search, estadoId } = this.currentFilters;
            const perPage = 10;

            const response = await this.model.getOrders(targetPage, perPage, estadoId, search);
            
            this.orders = response.items || [];
            this.pagination = {
                page: response.current_page || 1,
                pages: response.pages || 1,
                total: response.total || 0
            };
            
            // Pass current filters to render to persist UI state
            this.view.render(this.orders, this.pagination, this.currentFilters);
            
        } catch (error) {
            console.error('Error cargando órdenes:', error);
            Toast.error('Error al cargar órdenes. Intente nuevamente.');
            this.view.render([], {}, this.currentFilters); 
        } finally {
            this.view.hideLoading();
            // restoreFilterUI is no longer needed as render handles it
        }
    }

    restoreFilterUI() {
        // Deprecated by render update
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
            const order = await this.model.getOrderById(id);
            
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
            await this.loadOrders(this.pagination.page); // Reload current page
        } catch (error) {
            console.error('Error al actualizar orden:', error);
            alert('No se pudo actualizar la orden');
        }
    }

    /**
     * Muestra el formulario para crear una nueva orden.
     */
    async handleNewOrder() {
        try {
            const [tecnicos, vehicles, clients, estados, servicios, repuestos] = await Promise.all([
                this.loadTecnicos(),
                this.loadVehicles(),
                this.loadClients(),
                this.loadEstados(),
                this.loadServicios(),
                this.loadRepuestos()
            ]);

            this.view.showNewOrderModal({
                tecnicos,
                vehicles,
                clients,
                estados,
                servicios,
                repuestos
            });
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
            if (!formData.cliente_id || !formData.auto_id) {
                Toast.error('Cliente y Vehículo son obligatorios');
                return;
            }

            const orderData = {
                ...formData,
                cliente_id: parseInt(formData.cliente_id),
                auto_id: parseInt(formData.auto_id),
                tecnico_id: formData.tecnico_id ? parseInt(formData.tecnico_id) : null,
                estado_id: formData.estado_id ? parseInt(formData.estado_id) : null,
                total_estimado: parseFloat(formData.total_estimado) || 0
            };

            if (!orderData.estado_id) {
                Toast.error('Error: Debe seleccionarse un estado válido.');
                return;
            }

            await this.model.createOrder(orderData);
            Toast.success('Orden creada correctamente');
            await this.loadOrders(1); // Go to first page

        } catch (error) {
            console.error('Error al crear orden:', error);
            Toast.error('Error al crear orden: ' + (error.message || 'Error desconocido'));
        }
    }

    /**
     * Maneja el cambio de página.
     */
    async handlePageChange(direction) {
        if (direction === 'prev' && this.pagination.page > 1) {
            await this.loadOrders(this.pagination.page - 1);
        } else if (direction === 'next' && this.pagination.page < this.pagination.pages) {
            await this.loadOrders(this.pagination.page + 1);
        }
    }

    /**
     * Maneja el filtro por estado.
     */
    async handleFilter(estadoNombre) {
        // Convert Name to ID
        this.currentFilters.estadoNombre = estadoNombre || ''; // Store name for UI restoration

        if (!estadoNombre) {
            this.currentFilters.estadoId = null;
        } else {
            try {
                // We need the ID. We'll fetch statuses to find it.
                // Ideally we should cache this list.
                const estados = await this.loadEstados();
                const found = estados.find(e => e.nombre_estado === estadoNombre);
                this.currentFilters.estadoId = found ? found.id : null;
                
                if (!found) console.warn('Filter logic: Estado not found for name:', estadoNombre);
            } catch (e) {
                console.error('Error filtering:', e);
            }
        }
        await this.loadOrders(1);
    }

    /**
     * Maneja la búsqueda.
     */
    handleSearch(query) {
        // Debounce could be added here
        this.currentFilters.search = query || '';
        this.loadOrders(1);
    }

    /**
     * Carga la lista de técnicos.
     */
    async loadTecnicos() {
        try {
            const response = await this.api.get('/auth/users?per_page=100');
            const users = response.items            // Filtrar solo mecánicos (estrictamente rol de técnico)
                || response || [];
            return users.filter(u => {
                const rol = (u.rol_nombre || '').toLowerCase();
                return rol === 'mecanico';
            });
        } catch (error) {
            console.error('OrderController: Error al cargar técnicos:', error);
            return [];
        }
    }

    /**
     * Carga la lista de vehículos.
     */
    async loadVehicles() {
        try {
            const result = await this.vehicleModel.getAll();
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
            const response = await this.api.get('/inventory/parts');
            return response.items || response || [];
        } catch (error) {
            console.error('Error al cargar repuestos:', error);
            return [];
        }
    }

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
                estado_nombre: balance.estado_orden || order.estado_nombre || '',
                cliente_nombre: order.cliente_nombre || 'Cliente',
                id: orderId,
                total_estimado: balance.total_estimado,
                total_pagado: balance.total_pagado,
                saldo_pendiente: balance.saldo_pendiente,
                pagos: balance.pagos,
                placa: order.placa,
                marca: order.marca,
                modelo: order.modelo
            };

            this.showPaymentModal(paymentData);
        } catch (error) {
            console.error('Error al preparar pago:', error);
            Toast.error('Error al cargar info de pago');
        }
    }

    showPaymentModal(orderData) {
        if (!this.paymentView) this.paymentView = new PaymentView();
        
        this.paymentView.onSubmitPayment = async (paymentDetails) => {
            await this.processPayment(paymentDetails);
        };
        
        this.paymentView.showPaymentModal(orderData);
    }

    async processPayment(details) {
        try {
            await this.api.post('/payments/', details);
            Toast.success('Pago registrado exitosamente');
            
            const balance = await this.api.get(`/payments/order/${details.orden_id}/balance`);
            
            if (balance.pagado_completamente) {
                try {
                    const estados = await this.api.get('/orders/estados');
                    const estadoEntregado = estados.find(e => e.nombre_estado === 'Entregado') ||
                                          estados.find(e => e.nombre_estado === 'Finalizado');
                    
                    if (estadoEntregado) {
                        await this.api.put(`/orders/${details.orden_id}/status`, { estado_id: estadoEntregado.id });
                        Toast.success('Orden marcada como Entregada automáticamente');
                    }
                } catch (err) {
                    console.error('Error al cambiar estado automáticamente:', err);
                }
            }
            
            await this.loadOrders(this.pagination.page);
            window.dispatchEvent(new Event('order-updated'));

            return { success: true };
        } catch (error) {
            console.error('Error al procesar pago:', error);
            Toast.error(error.message || 'Error al procesar pago');
            throw error;
        }
    }
}
