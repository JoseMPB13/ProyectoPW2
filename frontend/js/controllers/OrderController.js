import OrderModel from '../models/OrderModel.js';
import OrderView from '../views/OrderView.js';
import PaymentView from '../views/PaymentView.js';
import Toast from '../utils/toast.js';
import VehicleModel from '../models/VehicleModel.js';
import ClientModel from '../models/ClientModel.js';
import API from '../utils/api.js';

/**
 * ============================================================================
 * ENCABEZADO DEL ARCHIVO (Controlador Core)
 * ============================================================================
 * Propósito:
 *   Gobernador central del módulo de gestión de Órdenes de Trabajo.
 *   Maneja el ciclo de vida completo de un servicio: creación, edición,
 *   inventario asociado, asignación de técnicos, facturación y pagos.
 *
 * Flujo Lógico Principal:
 *   1. Inicialización: Carga listado paginado y filtros.
 *   2. CRUD Complejo: Gestiona modales con múltiples dependencias (Autos, Técnicos).
 *   3. Sincronización: Usa `OrderModel` para persistencia.
 *   4. Facturación: Coordina con `PaymentView` para procesar cobros.
 *
 * Interacciones:
 *   - Modelos: OrderModel, VehicleModel, ClientModel (Agregación de datos).
 *   - Vistas: OrderView (UI Principal), PaymentView (Modal de Cobro).
 * ============================================================================
 */

export default class OrderController {
    /**
     * Constructor del Controlador.
     * Inicializa sub-modelos y vistas necesarias para la orquestación.
     */
    constructor() {
        // Capa de Datos
        this.model = new OrderModel();
        this.api = new API();
        this.vehicleModel = new VehicleModel(this.api);
        this.clientModel = new ClientModel();

        // Capa de Presentación
        this.view = new OrderView();
        this.paymentView = new PaymentView();

        // Estado Local (State Management)
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
        
        // ====================================================================
        // Vinchulacion de Eventos (Event Binding)
        // patrón Observer: La vista notifica acciones, el controlador responde.
        // ====================================================================
        this.view.bindAction(this.handleAction.bind(this));
        
        // Formularios
        this.view.bindSubmitEdit(this.handleSubmitEdit.bind(this));
        this.view.bindSubmitNewOrder(this.handleSubmitNewOrder.bind(this));
        
        // Interacciones UI
        this.view.bindNewOrder(this.handleNewOrder.bind(this));
        this.view.bindPagination(this.handlePageChange.bind(this));
        this.view.bindFilter(this.handleFilter.bind(this));
        this.view.bindSearch(this.handleSearch.bind(this));
    }

    /**
     * Punto de entrada de la vista.
     */
    async init() {
        await this.loadOrders();
    }

    /**
     * Carga y renderiza el listado de órdenes.
     * 
     * @param {number} page - Número de página a cargar (default: 1).
     */
    async loadOrders(page = 1) {
        try {
            this.view.showLoading();
            
            // Lógica de Persistencia de Navegación:
            // Si no se especifica página, usar la actual.
            const targetPage = page || this.pagination.page;

            const { search, estadoId } = this.currentFilters;
            const perPage = 10;

            // Petición al Backend
            const response = await this.model.getOrders(targetPage, perPage, estadoId, search);
            
            // Actualización de Estado
            this.orders = response.items || [];
            this.pagination = {
                page: response.current_page || 1,
                pages: response.pages || 1,
                total: response.total || 0
            };
            
            // Renderizado con estado completo para mantener filtros visibles
            this.view.render(this.orders, this.pagination, this.currentFilters);
            
        } catch (error) {
            console.error('Error cargando órdenes:', error);
            Toast.error('Error al cargar órdenes. Intente nuevamente.');
            // Renderizar tabla vacía en caso de error para no romper UI
            this.view.render([], {}, this.currentFilters); 
        } finally {
            this.view.hideLoading();
        }
    }

    /**
     * Método Placeholder para compatibilidad legacy.
     * @deprecated La vista se actualiza vía render().
     */
    restoreFilterUI() {
        // Deprecated
    }

    /**
     * Router de acciones para botones en la grilla (Tabla).
     * Centraliza la lógica de despacho basada en el tipo de acción.
     * 
     * @param {string} action - Tipo de acción ('view', 'edit', 'payment', etc.)
     * @param {number} id - ID de la orden sobre la que se actúa.
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
            case "invoice":
                await this.downloadInvoice(id);
                break;
            case 'delete':
                if (confirm('¿Está seguro de eliminar esta orden?')) {
                     alert('Funcionalidad de eliminar orden no disponible por seguridad.');
                }
                break;
        }
    }

    /**
     * Muestra el modal de SOLO lectura con detalles.
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
            Toast.error('Error al cargar detalles: ' + (error.message || 'Error desconocido'));
        } finally {
            this.view.hideLoading();
        }
    }

    /**
     * Prepara y muestra el Modal de Edición.
     * Requiere cargar TODOS los catálogos (Técnicos, Servicios, Repuestos) para poblar los selects.
     */
    async editOrder(id) {
        try {
            this.view.showLoading();
            
            // Ejecución Paralela para rendimiento óptimo
            const [order, tecnicos, estados, servicios, repuestos, clients, vehicles] = await Promise.all([
                this.model.getOrderById(id),
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
            Toast.error('No se pudo cargar el formulario: ' + (error.message || 'Error desconocido'));
        } finally {
            this.view.hideLoading();
        }
    }

    /**
     * Procesa la actualización de una orden existente.
     */
    async handleSubmitEdit(orderId, formData) {
        try {
            await this.model.updateOrder(orderId, formData);
            // Recargar página actual para reflejar cambios manteniendo contexto
            await this.loadOrders(this.pagination.page); 
        } catch (error) {
            console.error('Error al actualizar orden:', error);
            alert('No se pudo actualizar la orden');
        }
    }

    /**
     * Prepara y muestra el Modal de Creación (Nueva Orden).
     * Similar a Edit, carga todos los catálogos necesarios.
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
     * Procesa la creación de una nueva orden.
     * Realiza validaciones básicas antes de enviar al modelo.
     */
    async handleSubmitNewOrder(formData) {
        try {
            // Validaciones de Integridad
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
            // Volver a la primera página para ver el item reciente
            await this.loadOrders(1); 

        } catch (error) {
            console.error('Error al crear orden:', error);
            Toast.error('Error al crear orden: ' + (error.message || 'Error desconocido'));
        }
    }

    /**
     * Controlador de Paginación.
     */
    async handlePageChange(direction) {
        if (direction === 'prev' && this.pagination.page > 1) {
            await this.loadOrders(this.pagination.page - 1);
        } else if (direction === 'next' && this.pagination.page < this.pagination.pages) {
            await this.loadOrders(this.pagination.page + 1);
        }
    }

    /**
     * Filtra la grilla por Estado.
     * 
     * @param {string} estadoNombre - Nombre legible del estado (ej: 'En Proceso').
     */
    async handleFilter(estadoNombre) {
        // Almacenar el nombre para UI
        this.currentFilters.estadoNombre = estadoNombre || ''; 

        if (!estadoNombre) {
            this.currentFilters.estadoId = null;
        } else {
            try {
                // Resolución inversa: Buscamos el ID a partir del Nombre
                // Idealmente esto debería estar cacheado o venir del dropdown value
                const estados = await this.loadEstados();
                const found = estados.find(e => e.nombre_estado === estadoNombre);
                this.currentFilters.estadoId = found ? found.id : null;
                
                if (!found) console.warn('Filter logic: Estado not found for name:', estadoNombre);
            } catch (e) {
                console.error('Error filtering:', e);
            }
        }
        // Reset a página 1 al filtrar
        await this.loadOrders(1);
    }

    /**
     * Filtra la grilla por Búsqueda de Texto.
     */
    handleSearch(query) {
        this.currentFilters.search = query || '';
        this.loadOrders(1);
    }

    // ========================================================================
    // Helpers de Carga de Datos (Data Loaders)
    // ========================================================================

    async loadTecnicos() {
        try {
            const response = await this.api.get('/auth/users?per_page=100');
            const users = response.items || response || [];
            // Filtro estricto: Solo mostrar 'Mecánico' en el dropdown de asignación
            return users.filter(u => {
                const rol = (u.rol_nombre || '').toLowerCase();
                return rol === 'mecanico';
            });
        } catch (error) {
            console.error('OrderController: Error al cargar técnicos:', error);
            return [];
        }
    }

    async loadVehicles() {
        try {
            // Nota: Podría optimizarse si hay miles de vehículos
            return await this.vehicleModel.getAll();
        } catch (error) {
            console.error('OrderController: Error al cargar vehículos:', error);
            return [];
        }
    }

    async loadEstados() {
        try {
            const response = await this.api.get('/orders/estados');
            return response || [];
        } catch (error) {
            console.error('Error al cargar estados:', error);
            return [];
        }
    }

    async loadServicios() {
        try {
            const response = await this.api.get('/services');
            return response.items || response || [];
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            return [];
        }
    }

    async loadRepuestos() {
        try {
            const response = await this.api.get('/inventory/parts');
            return response.items || response || [];
        } catch (error) {
            console.error('Error al cargar repuestos:', error);
            return [];
        }
    }

    async loadClients() {
        try {
            const response = await this.api.get('/clients?per_page=1000');
            return response.items || response || [];
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            return [];
        }
    }

    // ========================================================================
    // Gestión de Pagos (Billing)
    // ========================================================================

    /**
     * Inicia el flujo de pago para una orden.
     * Verifica saldo pendiente antes de abrir el modal.
     */
    async handlePaymentAction(orderId) {
        try {
            const balance = await this.api.get(`/payments/order/${orderId}/balance`);
            const order = await this.api.get(`/orders/${orderId}`);
            
            // Validación de Negocio
            if (balance.saldo_pendiente <= 0.01) {
                Toast.info('Esta orden ya está pagada completamente.');
                return;
            }

            // Preparación del Contexto de Pago
            const paymentData = {
                ...balance,
                estado_nombre: balance.estado_orden || order.estado_nombre || '',
                cliente_nombre: order.cliente_nombre || 'Cliente',
                id: orderId, // Crucial para la transacción
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

    /**
     * Renderiza el Modal de Pagos delegando a `PaymentView`.
     */
    showPaymentModal(orderData) {
        if (!this.paymentView) this.paymentView = new PaymentView();
        
        // Inyección del Callback de Proceso
        this.paymentView.onSubmitPayment = async (paymentDetails) => {
            await this.processPayment(paymentDetails);
        };
        
        this.paymentView.showPaymentModal(orderData);
    }

    /**
     * Transacción de Pago.
     * Envía el pago al backend y actualiza el estado de la orden si se completa.
     */
    async processPayment(details) {
        try {
            await this.api.post('/payments/', details);
            Toast.success('Pago registrado exitosamente');
            
            // Verificación Post-Pago: ¿Se ha liquidado la deuda?
            const balance = await this.api.get(`/payments/order/${details.orden_id}/balance`);
            
            if (balance.pagado_completamente) {
                try {
                    // Automatización: Marcar como Entregado si se paga todo
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
            
            // Actualizar UI
            await this.loadOrders(this.pagination.page);
            // Evento global para actualizar otros componentes (dashboard, etc)
            window.dispatchEvent(new Event('order-updated'));

            return { success: true };
        } catch (error) {
            console.error('Error al procesar pago:', error);
            Toast.error(error.message || 'Error al procesar pago');
            throw error;
        }
    }

    /**
     * Generación y Descarga de PDF de Factura.
     */
    async downloadInvoice(orderId) {
        try {
            this.view.showLoading();
            // Uso de getBlob para manejar archivos binarios
            const blob = await this.api.getBlob(`/orders/${orderId}/invoice`);
            
            // Truco del elemento <a> oculto para forzar descarga
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Orden_${orderId}.pdf`; 
            document.body.appendChild(a);
            a.click();
            a.remove();
            
            window.URL.revokeObjectURL(url);
            Toast.success('Factura descargada exitosamente');
        } catch (error) {
            console.error('Error descargando factura:', error);
            Toast.error('Error al descargar factura: ' + (error.message || 'Error desconocido'));
        } finally {
            this.view.hideLoading();
        }
    }
}
