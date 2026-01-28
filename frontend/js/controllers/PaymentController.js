import PaymentModel from '../models/PaymentModel.js';
import PaymentView from '../views/PaymentView.js';
import Toast from '../utils/toast.js';

/**
 * Controlador de Pagos - Versión Mejorada
 * Coordina la lógica de gestión de pagos entre vista y modelo.
 * Integrado con backend real y manejo robusto de errores.
 */
export default class PaymentController {
    constructor() {
        this.model = new PaymentModel();
        this.view = new PaymentView();
        
        // Estado interno
        this.currentFilters = {};
    }

    /**
     * Inicializa la vista cargando los pagos.
     */
    async init() {
        // Vincular eventos de la vista
        this.view.bindNewPayment(this.handleNewPayment.bind(this));
        this.view.bindSubmitPayment(this.handleSubmitPayment.bind(this));
        this.view.bindViewPayment(this.handleViewPayment.bind(this));
        this.view.bindApplyFilters(this.handleApplyFilters.bind(this));

        await this.loadPayments();
    }

    /**
     * Carga los pagos desde el servidor con información detallada.
     */
    async loadPayments() {
        try {
            // Mostrar indicador de carga si es necesario
            // this.view.showLoading();

            const [paymentsData, summary] = await Promise.all([
                this.model.getPayments(this.currentFilters),
                this.model.getRevenueSummary(
                    this.currentFilters.fecha_inicio,
                    this.currentFilters.fecha_fin
                )
            ]);

            // Los pagos vienen del backend con toda la información necesaria
            // Estructura: { id, orden_id, monto, metodo_pago, fecha_pago, cliente_nombre, placa }
            this.view.render(paymentsData, summary);
            
            // this.view.hideLoading();
        } catch (error) {
            console.error('Error al cargar pagos:', error);
            
            // Determinar tipo de error
            if (error.message.includes('Network') || error.message.includes('fetch')) {
                Toast.show('No se pudo conectar con el servidor. Verifica tu conexión.', 'error');
            } else if (error.status === 401) {
                Toast.show('Sesión expirada. Por favor inicia sesión nuevamente.', 'warning');
                // Redirigir a login si es necesario
                setTimeout(() => {
                    window.location.hash = '#/login';
                }, 2000);
            } else {
                Toast.show('Error al cargar pagos. Intenta recargar la página.', 'error');
            }
            
            // Renderizar vista vacía
            this.view.render([], null);
        }
    }

    /**
     * Maneja el registro de un nuevo pago desde la sección de pagos.
     * (Normalmente los pagos se crean desde OrderController)
     */
    handleNewPayment() {
        // Mostrar mensaje informativo
        Toast.show('Los pagos se registran desde la Gestión de Órdenes usando el botón "Cobrar"', 'info');
        
        // Opcionalmente, podrías mostrar un modal simple para buscar una orden
        // this.view.showPaymentModal();
    }

    /**
     * Maneja el envío del formulario de pago.
     * @param {Object} formData - Datos del formulario.
     */
    async handleSubmitPayment(formData) {
        try {
            const result = await this.model.createPayment(formData);
            
            console.log('Pago registrado:', result);
            
            // Mostrar notificación de éxito
            Toast.show(`Pago de Bs. ${formData.monto} registrado exitosamente`, 'success');
            
            // Recargar pagos para mostrar el nuevo registro
            await this.loadPayments();
            
            return result;
        } catch (error) {
            console.error('Error al registrar pago:', error);
            
            // Manejo detallado de errores del backend
            let errorMessage = 'No se pudo registrar el pago';
            
            if (error.response) {
                // Error del backend con respuesta estructurada
                const errorData = error.response;
                
                if (errorData.msg) {
                    errorMessage = errorData.msg;
                    
                    // Errores específicos del backend
                    if (errorData.msg.includes('no ha sido finalizada')) {
                        Toast.show(
                            `No se puede cobrar: La orden debe estar en estado "Finalizado" o "Entregado". Estado actual: ${errorData.estado_actual || 'Desconocido'}`,
                            'warning',
                            5000
                        );
                    } else if (errorData.msg.includes('excede el saldo')) {
                        Toast.show(
                            `Monto excede el saldo pendiente. Saldo disponible: Bs. ${errorData.saldo_pendiente || 0}`,
                            'warning',
                            5000
                        );
                    } else {
                        Toast.show(errorMessage, 'error');
                    }
                }
            } else if (error.message.includes('Network')) {
                Toast.show('Error de conexión. Verifica que el backend esté corriendo.', 'error');
            } else {
                Toast.show(errorMessage + ': ' + (error.message || 'Error desconocido'), 'error');
            }
            
            throw error; // Re-lanzar para que el caller pueda manejarlo
        }
    }

    /**
     * Maneja ver detalles de un pago.
     * @param {string} id - ID del pago.
     */
    async handleViewPayment(id) {
        try {
            // Obtener detalles del pago desde el backend
            const payment = await this.model.getPaymentById(id);
            
            if (payment) {
                this.view.showDetailModal(payment);
            } else {
                Toast.show('No se encontró el pago solicitado', 'warning');
            }
        } catch (error) {
            console.error('Error al cargar detalle del pago:', error);
            Toast.show('No se pudo cargar el detalle del pago', 'error');
        }
    }

    /**
     * Maneja la aplicación de filtros de fechas.
     * @param {Object} filters - Filtros a aplicar.
     */
    async handleApplyFilters(filters) {
        // Validar fechas
        if (filters.fecha_inicio && filters.fecha_fin) {
            const inicio = new Date(filters.fecha_inicio);
            const fin = new Date(filters.fecha_fin);
            
            if (inicio > fin) {
                Toast.show('La fecha de inicio no puede ser mayor a la fecha de fin', 'warning');
                return;
            }
        }
        
        this.currentFilters = filters;
        
        // Mostrar mensaje informativo mientras carga
        if (filters.fecha_inicio || filters.fecha_fin) {
            Toast.show('Aplicando filtros...', 'info', 1500);
        }
        
        await this.loadPayments();
    }

    /**
     * Método público para recargar pagos desde otros controladores.
     * Útil cuando OrderController registra un pago y quiere actualizar PaymentController.
     */
    async refresh() {
        await this.loadPayments();
    }
}
