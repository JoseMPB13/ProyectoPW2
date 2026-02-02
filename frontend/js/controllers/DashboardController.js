/**
 * ============================================================================
 * ENCABEZADO DEL ARCHIVO (Controlador)
 * ============================================================================
 * Propósito:
 *   Orquesta la lógica del área de trabajo "Dashboard" (Tablero de Control).
 *   Es el intermediario entre los datos de negocio (Modelo) y la representación visual (Vista).
 *
 * Flujo Lógico Central:
 *   1. Solicitud de métricas (KPIs) al modelo.
 *   2. Manejo de estados de carga y error.
 *   3. Inyección de datos en la vista para renderizado de gráficos y tarjetas.
 *
 * Interacciones:
 *   - Modelo: `DashboardModel` (Obtiene datos del backend).
 *   - Vista: `DashboardView` (Renderiza HTML/Charts).
 * ============================================================================
 */

export default class DashboardController {
    /**
     * @param {DashboardModel} model - Capa de acceso a datos.
     * @param {DashboardView} view - Capa de presentación visual.
     */
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    /**
     * Inicializa el flujo del controlador.
     * Patrón: Fetch-then-Render.
     */
    async init() {
        try {
            // 1. Renderizado Optimista: Feedback instantáneo al usuario
            this.view.appContent.innerHTML = '<p class="text-center p-4">Cargando métricas...</p>';

            // 2. Obtención de Datos (Asíncrono)
            const data = await this.model.getDashboardData();
            
            // 3. Validación de Respuesta
            if (!data) {
                // Estado "Empty": No falló, pero no hay datos relevantes
                console.warn('DashboardController: Datos vacíos, renderizando estado por defecto.');
                this.view.render({}); 
                return;
            }

            // 4. Renderizado Final
            this.view.render(data);

        } catch (error) {
            // Manejo Centralizado de Errores de UI
            console.error('Error crítico en DashboardController:', error);
            this.view.showError('Hubo un problema al conectar con el servidor.');
        }
    }
}
