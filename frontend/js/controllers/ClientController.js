import ClientModel from '../models/ClientModel.js';
import ClientView from '../views/ClientView.js';

/**
 * ============================================================================
 * ENCABEZADO DEL ARCHIVO (Controlador de Clientes)
 * ============================================================================
 * Propósito:
 *   Gestiona la Cartera de Clientes y la asociación de Vehículos.
 *   
 * Flujo Lógico:
 *   1. Inicialización: Carga listado maestro.
 *   2. Búsqueda: Filtrado local por nombre/CI.
 *   3. Gestión de Vehículos: Permite agregar/editar autos desde la ficha del cliente.
 *   4. Historial: Visualización rápida de órdenes previas.
 *
 * Interacciones:
 *   - ClientModel: CRUD de Clientes.
 *   - ClientView: Vista principal y modales.
 * ============================================================================
 */

export default class ClientController {
    /**
     * @param {ClientModel} model
     */
    constructor(model) {
        this.model = model;
        this.view = new ClientView();
    }

    /**
     * Inicialización del módulo.
     */
    async init() {
        try {
            // Carga inicial de datos
            this.clients = await this.model.getAll();
            this.view.render(this.clients);
            
            // Binding de eventos UI
            this.view.bindSelectClient(this.handleSelectClient.bind(this));
            this.view.bindCreateClient(this.handleCreateClient.bind(this));
            this.view.bindEditClient(this.handleEditClient.bind(this));
            this.view.bindUpdateClient(this.handleUpdateClient.bind(this));
            this.view.bindViewOrder(this.handleViewOrder.bind(this));
            this.view.bindSearch(this.handleSearch.bind(this));
            
            // Eventos específicos de Vehículos (Sub-módulo)
            this.view.bindSaveVehicle(this.handleSaveVehicle.bind(this));
            this.view.bindVehicleAction(this.handleVehicleAction.bind(this));
            
        } catch (error) {
            console.error('Error init ClientController', error);
            // Fallback UI
            this.view.render([]);
        }
    }

    /**
     * Filtrado en cliente (Client-side Search).
     * Optimizado para velocidad en listas medianas.
     */
    handleSearch(query) {
        const term = query.toLowerCase().trim();
        if (!term) {
            this.view.updateClientList(this.clients);
            return;
        }

        const filtered = this.clients.filter(c => 
            (c.nombre && c.nombre.toLowerCase().includes(term)) || 
            (c.apellido_p && c.apellido_p.toLowerCase().includes(term)) ||
            (c.apellido_m && c.apellido_m.toLowerCase().includes(term)) ||
            (c.ci && c.ci.toLowerCase().includes(term))
        );
        this.view.updateClientList(filtered);
    }

    /**
     * Selección de Cliente para ver detalles/historial.
     */
    async handleSelectClient(id) {
        const client = this.clients.find(c => c.id == id);
        if (client) {
            this.view.renderClientDetails(client);
            // Lazy loading del historial
            this.loadClientHistory(client.id);
        }
    }

    /**
     * Carga asíncrona del historial de órdenes.
     */
    async loadClientHistory(clientId) {
        try {
            const response = await this.model.api.get(`/orders?client_id=${clientId}`);
            const orders = response.items || [];
            this.view.renderClientHistory(orders);
        } catch (error) {
            console.error('Error loading history', error);
            this.view.renderClientHistory([]); 
        }
    }

    /**
     * Creación de un nuevo cliente.
     */
    async handleCreateClient(data) {
        try {
            await this.model.create(data);
            alert('Cliente creado exitosamente');
            
            // Recarga completa para garantizar consistencia
            this.clients = await this.model.getAll();
            this.view.render(this.clients);
        } catch (error) {
            console.error(error);
            alert('Error al crear cliente: ' + error.message);
        }
    }

    /**
     * Prepara el modal de edición.
     */
    async handleEditClient(client) {
        this.view.showCreateModal(client); 
    }

    /**
     * Actualización de datos del cliente.
     */
    async handleUpdateClient(id, data) {
        try {
            await this.model.update(id, data);
            alert('Cliente actualizado exitosamente');
            
            this.clients = await this.model.getAll();
            this.view.render(this.clients);
        } catch (error) {
            console.error(error);
            alert('Error al actualizar cliente: ' + error.message);
        }
    }

    /**
     * Visualización rápida de una orden histórica.
     */
    async handleViewOrder(orderId) {
        try {
            const order = await this.model.api.get(`/orders/${orderId}`);
            this.view.showOrderDetailsModal(order);
        } catch (error) {
            console.error(error);
            alert('No se pudo cargar la orden');
        }
    }

    /**
     * Router de acciones para vehículos (Agregar/Editar).
     */
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

    /**
     * Persistencia de Vehículo (Hijo de Cliente).
     * Maneja tanto creación como actualización.
     */
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
            
            // Restaurar vista de detalle si estaba abierta
            const updatedClient = this.clients.find(c => c.id == clientId);
            if (updatedClient) {
                this.view.renderClientDetails(updatedClient);
                // UX: Volver a pestaña de vehículos automáticamente
                const tabBtn = document.querySelector('.tab-btn[data-tab="vehicles"]');
                if (tabBtn) tabBtn.click();
            }

        } catch (error) {
            console.error('Error saving vehicle:', error);
            alert('Error al guardar vehículo: ' + (error.message || 'Error desconocido'));
        }
    }
}
