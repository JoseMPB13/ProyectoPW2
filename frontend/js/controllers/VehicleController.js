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
            this.vehicles = await this.model.getAll();
            
            // Fetch clients for the "New Vehicle" modal
            const clientsResponse = await this.model.api.get('/clients?per_page=1000');
            this.clients = clientsResponse.items || clientsResponse || [];

            this.view.render(this.vehicles, this.clients);

            this.view.bindEditVehicle(this.handleEditVehicle.bind(this));
            this.view.bindSaveVehicle(this.handleSaveVehicle.bind(this));
            this.view.bindViewVehicle(this.handleViewVehicle.bind(this));
            this.view.bindCreateVehicle(this.handleCreateVehicle.bind(this));

        } catch (error) {
            console.error('Error inicializando VehicleController:', error);
            this.view.render([], []);
        }
    }

    async handleCreateVehicle(data) {
        try {
            // Requires client_id in data
            if (!data.cliente_id) {
                alert('Debe seleccionar un cliente.');
                return;
            }
            await this.model.api.post(`/clients/${data.cliente_id}/vehicles`, data);
            alert('Vehículo creado exitosamente');
            this.init(); // Reload
        } catch (error) {
            console.error(error);
            alert('Error al crear vehículo');
        }
    }

    handleEditVehicle(id) {
        const vehicle = this.vehicles.find(v => v.id == id);
        if (vehicle) {
            this.view.showVehicleModal(vehicle);
        }
    }

    handleViewVehicle(id) {
        const vehicle = this.vehicles.find(v => v.id == id);
        if (vehicle) {
            this.view.showDetailsModal(vehicle);
        }
    }

    async handleSaveVehicle(id, data) {
        try {
            // Update via API
            await this.model.api.put(`/clients/vehicles/${id}`, data);
            alert('Vehículo actualizado exitosamente');
            
            // Reload
            this.vehicles = await this.model.getAll();
            this.view.render(this.vehicles);
        } catch (error) {
            console.error(error);
            alert('Error al actualizar vehículo: ' + (error.message || 'Error desconocido'));
        }
    }
}
