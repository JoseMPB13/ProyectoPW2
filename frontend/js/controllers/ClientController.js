import ClientModel from '../models/ClientModel.js';
import ClientView from '../views/ClientView.js';

export default class ClientController {
    constructor(model) {
        this.model = model;
        this.view = new ClientView();
    }

    async init() {
        try {
            this.clients = await this.model.getAll();
            this.view.render(this.clients);
            
            this.view.bindSelectClient(this.handleSelectClient.bind(this));
            this.view.bindCreateClient(this.handleCreateClient.bind(this));
            this.view.bindEditClient(this.handleEditClient.bind(this));
            this.view.bindUpdateClient(this.handleUpdateClient.bind(this));
            this.view.bindViewOrder(this.handleViewOrder.bind(this));
            
            this.view.bindSaveVehicle(this.handleSaveVehicle.bind(this));
            this.view.bindVehicleAction(this.handleVehicleAction.bind(this));
            
        } catch (error) {
            console.error('Error init ClientController', error);
            this.view.render([]);
        }
    }

    async handleSelectClient(id) {
        const client = this.clients.find(c => c.id == id);
        if (client) {
            this.view.renderClientDetails(client);
            // Cargar historial
            this.loadClientHistory(client.id);
        }
    }

    async loadClientHistory(clientId) {
        try {
            // Usamos parámetro client_id explícito si el backend lo soporta (lo soportará tras mi fix)
            const response = await this.model.api.get(`/orders?client_id=${clientId}`);
            const orders = response.items || [];
            
            this.view.renderClientHistory(orders);

        } catch (error) {
            console.error('Error loading history', error);
            this.view.renderClientHistory([]); 
        }
    }

    async handleCreateClient(data) {
        try {
            await this.model.create(data);
            alert('Cliente creado exitosamente');
            this.clients = await this.model.getAll();
            this.view.render(this.clients);
        } catch (error) {
            console.error(error);
            alert('Error al crear cliente: ' + error.message);
        }
    }

    async handleEditClient(client) {
        // Reutilizamos el modal de creación pero con datos prellenados
        this.view.showCreateModal(client); 
    }

    async handleUpdateClient(id, data) {
        try {
            await this.model.update(id, data);
            alert('Cliente actualizado exitosamente');
            this.clients = await this.model.getAll();
            this.view.render(this.clients);
            // Si el cliente actualizado es el que estaba seleccionado, refrescar detalle
            this.view.renderClientDetails(this.clients.find(c => c.id == id));
        } catch (error) {
            console.error(error);
            alert('Error al actualizar cliente: ' + error.message);
        }
    }

    async handleViewOrder(orderId) {
        try {
            // Reutilizar o duplicar lógica de obtener detalle.
            // Para rapidez, llamamos a la API directamente (a través de model.api) o usamos OrderModel si pudiéramos.
            const order = await this.model.api.get(`/orders/${orderId}`);
            this.view.showOrderDetailsModal(order);
        } catch (error) {
            console.error(error);
            alert('No se pudo cargar la orden');
        }
    }

    handleVehicleAction(action, client, vehicleId) {
        if (action === 'add') {
            this.view.showVehicleModal(client);
        } else if (action === 'edit') {
            const vehicle = client.autos.find(a => a.id == vehicleId);
            if (vehicle) {
                this.view.showVehicleModal(client, vehicle);
            }
        }
    }

    async handleSaveVehicle(clientId, data, vehicleId) {
        try {
            if (vehicleId) {
                // Update Logic
                await this.model.api.put(`/clients/vehicles/${vehicleId}`, data);
                alert('Vehículo actualizado exitosamente');
            } else {
                // Create Logic
                await this.model.api.post(`/clients/${clientId}/vehicles`, data);
                alert('Vehículo agregado exitosamente');
            }
            
            // Refresh
            this.clients = await this.model.getAll();
            this.view.render(this.clients);
            
            const updatedClient = this.clients.find(c => c.id == clientId);
            if (updatedClient) {
                this.view.renderClientDetails(updatedClient);
                // Force switch to vehicles tab
                const tabBtn = document.querySelector('.tab-btn[data-tab="vehicles"]');
                if (tabBtn) tabBtn.click();
            }

        } catch (error) {
            console.error('Error saving vehicle:', error);
            alert('Error al guardar vehículo: ' + (error.message || 'Error desconocido'));
        }
    }
}
