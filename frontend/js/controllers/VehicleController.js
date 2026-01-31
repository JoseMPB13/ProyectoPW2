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
            this.view.bindSearch(this.handleSearch.bind(this));
            this.view.bindCreateVehicle(this.handleCreateVehicle.bind(this));

        } catch (error) {
            console.error('Error inicializando VehicleController:', error);
            this.view.render([], []);
        }
    }

    handleSearch(query) {
        const term = query.toLowerCase().trim();
        if (!term) {
            this.view.updateVehicleList(this.vehicles);
            return;
        }

        const filtered = this.vehicles.filter(v => 
            (v.placa && v.placa.toLowerCase().includes(term)) || 
            (v.marca && v.marca.toLowerCase().includes(term)) ||
            (v.modelo && v.modelo.toLowerCase().includes(term)) ||
            (v.client_name && v.client_name.toLowerCase().includes(term)) ||
            (v.client_ci && v.client_ci.toLowerCase().includes(term))
        );
        this.view.updateVehicleList(filtered);
    }

    async handleCreateVehicle(data) {
        try {
            // Requires client_id in data
            if (!data.cliente_id) {
                alert('Debe seleccionar un cliente.');
                return;
            }
            // Map frontend fields to backend expected fields
            const payload = {
                plate: data.plate || data.placa,
                brand: data.brand || data.marca,
                model: data.model || data.modelo,
                year: Number(data.year || data.anio),
                color: data.color,
                vin: data.vin
            };
            await this.model.api.post(`/clients/${data.cliente_id}/vehicles`, payload);
            alert('Vehículo creado exitosamente');
            this.init(); // Reload
        } catch (error) {
            console.error(error);
            alert('Error al crear vehículo: ' + (error.message || 'Error desconocido'));
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
