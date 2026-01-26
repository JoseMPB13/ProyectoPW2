/**
 * Modelo del Dashboard
 * Gestiona la obtención de indicadores y métricas.
 */
export default class DashboardModel {
    /**
     * @param {API} api - Instancia de la clase API.
     */
    constructor(api) {
        this.api = api;
    }

    /**
     * Obtiene los datos del dashboard desde el backend.
     * @returns {Promise<Object>} Datos del reporte.
     */
    async getDashboardData() {
        try {
            return await this.api.get('/reports/dashboard');
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }
}
