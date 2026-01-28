import PaymentModel from '../models/PaymentModel.js';
import PaymentView from '../views/PaymentView.js';

/**
 * Controlador de Pagos
 * Coordina la lógica de gestión de pagos entre vista y modelo.
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
        // Bind connections here to ensure view is ready or just update properties
        this.view.bindNewPayment(this.handleNewPayment.bind(this));
        this.view.bindSubmitPayment(this.handleSubmitPayment.bind(this));
        this.view.bindViewPayment(this.handleViewPayment.bind(this));
        this.view.bindApplyFilters(this.handleApplyFilters.bind(this));

        await this.loadPayments();
    }

    /**
     * Carga los pagos desde el servidor.
     */
    async loadPayments() {
        try {
            const [payments, summary] = await Promise.all([
                this.model.getPayments(this.currentFilters),
                this.model.getRevenueSummary(
                    this.currentFilters.fecha_inicio,
                    this.currentFilters.fecha_fin
                )
            ]);

            this.view.render(payments, summary);
        } catch (error) {
            console.error('Error al cargar pagos:', error);
            alert('No se pudieron cargar los pagos');
            this.view.render([], null);
        }
    }

    /**
     * Maneja el registro de un nuevo pago.
     */
    handleNewPayment() {
        this.view.showPaymentModal();
    }

    /**
     * Maneja el envío del formulario de pago.
     * @param {Object} formData - Datos del formulario.
     */
    async handleSubmitPayment(formData) {
        try {
            await this.model.createPayment(formData);
            // Modal closes automatically along with submit handler in view, 
            // but we can enforce logic here or show success
            alert('Pago registrado exitosamente');
            await this.loadPayments();
        } catch (error) {
            console.error('Error al registrar pago:', error);
            alert('No se pudo registrar el pago: ' + (error.message || 'Error desconocido'));
        }
    }

    /**
     * Maneja ver detalles de un pago.
     * @param {string} id - ID del pago.
     */
    async handleViewPayment(id) {
        try {
            // Can fetch details from server if needed, or find in current list
            // Fetching fresh ensures data integrity
            // Currently using API directly via model
            const paymentResponse = await this.model.getPaymentById(id);
            // API might return wrapped object, check structure
            const payment = paymentResponse; 
            
            if (payment) {
                this.view.showDetailModal(payment);
            }
        } catch (error) {
            console.error(error);
            alert('No se pudo cargar el detalle del pago');
        }
    }

    /**
     * Maneja la aplicación de filtros.
     * @param {Object} filters - Filtros a aplicar.
     */
    async handleApplyFilters(filters) {
        this.currentFilters = filters;
        await this.loadPayments();
    }
}
