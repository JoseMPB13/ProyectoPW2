import VehicleModel from '../models/VehicleModel.js';
import VehicleView from '../views/VehicleView.js';

/**
 * Controlador de Vehículos
 */
export default class VehicleController {
    /**
     * @param {VehicleModel} model
     * @param {VehicleView} view
     */
    constructor(model, view) {
        this.model = model;
        this.view = view;
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
