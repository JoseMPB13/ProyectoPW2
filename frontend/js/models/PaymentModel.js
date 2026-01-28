import API from '../utils/api.js';

/**
 * Modelo de Pagos
 * Gestiona la lógica de datos relacionada con los pagos.
 */
export default class PaymentModel {
    constructor() {
        this.api = new API();
    }

    /**
     * Obtiene todos los pagos con filtros opcionales.
     * @param {Object} filters - Filtros (orden_id, fecha_inicio, fecha_fin).
     * @returns {Promise<Array>} Promesa con la lista de pagos.
     */
    async getPayments(filters = {}) {
        try {
            let endpoint = '/payments/history';
            const params = new URLSearchParams();
            
            // Agregar paginación para obtener todos los registros
            params.append('per_page', '1000');
            
            if (filters.orden_id) params.append('orden_id', filters.orden_id);
            if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
            if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
            
            const queryString = params.toString();
            if (queryString) endpoint += `?${queryString}`;
            
            const response = await this.api.get(endpoint);
            
            // El backend devuelve {items: [], total, pages, current_page}
            if (response && response.items) {
                return response.items;
            }
            
            // Si la respuesta es un array directo (por compatibilidad)
            if (Array.isArray(response)) {
                return response;
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching payments:', error);
            return [];
        }
    }


    /**
     * Obtiene un pago específico por ID.
     * @param {number} paymentId - ID del pago.
     * @returns {Promise<Object>} Promesa con los datos del pago.
     */
    async getPaymentById(paymentId) {
        return this.api.get(`/payments/${paymentId}`);
    }

    /**
     * Crea un nuevo pago.
     * @param {Object} paymentData - Datos del pago (orden_id, monto, metodo_pago).
     * @returns {Promise<Object>} Promesa con el pago creado.
     */
    async createPayment(paymentData) {
        return this.api.post('/payments', paymentData);
    }

    /**
     * Obtiene el resumen de ingresos.
     * @param {string} fechaInicio - Fecha de inicio (opcional).
     * @param {string} fechaFin - Fecha de fin (opcional).
     * @returns {Promise<Object>} Promesa con el resumen de ingresos.
     */
    async getRevenueSummary(fechaInicio = null, fechaFin = null) {
        let endpoint = '/payments/revenue';
        const params = new URLSearchParams();
        
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        
        const queryString = params.toString();
        if (queryString) endpoint += `?${queryString}`;
        
        return this.api.get(endpoint);
    }

    /**
     * Obtiene el historial de pagos de una orden.
     * @param {number} ordenId - ID de la orden.
     * @returns {Promise<Array>} Promesa con el historial de pagos.
     */
    async getOrderPaymentHistory(ordenId) {
        return this.api.get(`/payments/order/${ordenId}`);
    }
}
