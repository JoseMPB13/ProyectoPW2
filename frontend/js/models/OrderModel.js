import API from '../utils/api.js';

/**
 * Modelo de Órdenes
 * Gestiona la lógica de datos relacionada con las órdenes de trabajo.
 */
export default class OrderModel {
    constructor() {
        this.api = new API();
    }

    /**
     * Obtiene todas las órdenes con paginación y filtros.
     * @param {number} page - Número de página.
     * @param {number} perPage - Items por página.
     * @param {number} estadoId - ID del estado para filtrar (opcional).
     * @param {string} search - Término de búsqueda (opcional).
     * @returns {Promise<Object>} Promesa con la respuesta del servidor.
     */
    async getOrders(page = 1, perPage = 10, estadoId = null, search = null) {
        let endpoint = `/orders?page=${page}&per_page=${perPage}`;
        if (estadoId) endpoint += `&estado_id=${estadoId}`;
        if (search) endpoint += `&search=${encodeURIComponent(search)}`;
        
        return this.api.get(endpoint);
    }

    /**
     * Obtiene una orden específica por ID.
     * @param {number} orderId - ID de la orden.
     * @returns {Promise<Object>} Promesa con los datos de la orden.
     */
    async getOrderById(orderId) {
        return this.api.get(`/orders/${orderId}`);
    }

    /**
     * Crea una nueva orden de trabajo.
     * @param {Object} orderData - Datos de la orden (auto_id, tecnico_id, estado_id, problema_reportado).
     * @returns {Promise<Object>} Promesa con la orden creada.
     */
    async createOrder(orderData) {
        return this.api.post('/orders', orderData);
    }

    /**
     * Actualiza el estado de una orden.
     * @param {number} orderId - ID de la orden.
     * @param {number} estadoId - Nuevo ID de estado.
     * @returns {Promise<Object>} Promesa con la respuesta.
     */
    async updateOrderStatus(orderId, estadoId) {
        return this.api.put(`/orders/${orderId}/status`, { estado_id: estadoId });
    }

    /**
     * Agrega un servicio a una orden.
     * @param {number} orderId - ID de la orden.
     * @param {number} servicioId - ID del servicio.
     * @returns {Promise<Object>} Promesa con la respuesta.
     */
    async addServiceToOrder(orderId, servicioId) {
        return this.api.post(`/orders/${orderId}/services`, { servicio_id: servicioId });
    }

    /**
     * Agrega un repuesto a una orden.
     * @param {number} orderId - ID de la orden.
     * @param {number} repuestoId - ID del repuesto.
     * @param {number} cantidad - Cantidad del repuesto.
     * @returns {Promise<Object>} Promesa con la respuesta.
     */
    async addPartToOrder(orderId, repuestoId, cantidad = 1) {
        return this.api.post(`/orders/${orderId}/parts`, { repuesto_id: repuestoId, cantidad });
    }
}
