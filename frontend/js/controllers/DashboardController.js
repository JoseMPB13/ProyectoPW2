/**
 * Controlador del Dashboard
 * Coordina la obtención de datos y el renderizado de la vista principal.
 */
export default class DashboardController {
    /**
     * @param {DashboardModel} model
     * @param {DashboardView} view
     */
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    /**
     * Inicializa el dashboard: carga datos y renderiza.
     */
    async init() {
        try {
            // Mostrar estado de carga (opcional, podría delegarse a la vista)
            this.view.appContent.innerHTML = '<p class="text-center p-4">Cargando métricas...</p>';

            const data = await this.model.getDashboardData();
            
            // Validar si la respuesta es vacía (null o undefined)
            if (!data) {
                // Renderizar con ceros si no hay datos pero no falló
                this.view.render({}); 
                return;
            }

            this.view.render(data);

            // Listen for updates from other controllers (e.g. OrderController)
            window.addEventListener('order-updated', () => {
                console.log('DashboardController: Refreshing data due to external update...');
                this.init(); // Reload data
            });
        } catch (error) {
            console.error('Error inicializando DashboardController:', error);
            this.view.showError('Hubo un problema al conectar con el servidor.');
        }
    }
}
