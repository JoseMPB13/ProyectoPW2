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

        // Vincular eventos
        this.view.bindNewPayment(this.handleNewPayment.bind(this));
        this.view.bindSubmitPayment(this.handleSubmitPayment.bind(this));
        this.view.bindCloseModal();
        this.view.bindPaymentActions(this.handlePaymentAction.bind(this));
        this.view.bindApplyFilters(this.handleApplyFilters.bind(this));
    }

    /**
     * Inicializa la vista cargando los pagos.
     */
    async init() {
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
            this.view.showError('No se pudieron cargar los pagos');
            this.view.render([], null);
        }
    }

    /**
     * Maneja el registro de un nuevo pago.
     */
    handleNewPayment() {
        this.view.renderPaymentModal();
    }

    /**
     * Maneja el envío del formulario de pago.
     * @param {Object} formData - Datos del formulario.
     */
    async handleSubmitPayment(formData) {
        try {
            await this.model.createPayment(formData);
            this.view.closeModal();
            this.view.showSuccess('Pago registrado exitosamente');
            await this.loadPayments();
        } catch (error) {
            console.error('Error al registrar pago:', error);
            this.view.showError('No se pudo registrar el pago: ' + error.message);
        }
    }

    /**
     * Maneja las acciones de la tabla (ver).
     * @param {string} action - Acción a realizar.
     * @param {string} id - ID del pago.
     */
    async handlePaymentAction(action, id) {
        if (action === 'view') {
            try {
                const payment = await this.model.getPaymentById(id);
                alert(JSON.stringify(payment, null, 2)); // Temporal
            } catch (error) {
                this.view.showError('No se pudo cargar el pago');
            }
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
