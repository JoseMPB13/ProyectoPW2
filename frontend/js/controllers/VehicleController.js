import VehicleModel from '../models/VehicleModel.js';
import VehicleView from '../views/VehicleView.js';

/**
 * Controlador de Vehículos
 */
export default class VehicleController {
    constructor() {
        this.model = new VehicleModel();
        this.view = new VehicleView();
    }

    /**
     * Inicializa el controlador: carga datos y renderiza vista.
     */
    async init() {
        try {
            const data = await this.model.getAll();
            this.view.render(data);
        } catch (error) {
            console.error('Error inicializando VehicleController:', error);
            // Renderiza array vacío o error visual
            this.view.render([]);
        }
    }
}
