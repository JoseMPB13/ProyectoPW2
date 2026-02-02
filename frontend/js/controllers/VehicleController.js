import VehicleModel from '../models/VehicleModel.js';
import VehicleView from '../views/VehicleView.js';

/**
 * ============================================================================
 * ENCABEZADO DEL ARCHIVO (Controlador de Vehículos)
 * ============================================================================
 * Propósito:
 *   Gestiona el inventario de vehículos registrados en el sistema.
 *
 * Flujo Lógico:
 *   1. CRUD directo de la tabla `Autos`.
 *   2. Vinculación obligatoria con `Cliente`.
 *   3. Búsqueda multicampo (Placa, Marca, Modelo, Dueño).
 *
 * Interacciones:
 *   - VehicleModel: Acceso a datos.
 *   - VehicleView: Renderizado de grilla y formularios.
 * ============================================================================
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
     * Inicialización del controlador.
     */
    async init() {
        try {
            // Carga paralela de Vehículos y Lista Maestra de Clientes (para creación)
            this.vehicles = await this.model.getAll();
            
            const clientsResponse = await this.model.api.get('/clients?per_page=1000');
            this.clients = clientsResponse.items || clientsResponse || [];

            this.view.render(this.vehicles, this.clients);

            // Binding
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

    /**
     * Búsqueda en tiempo real (Client-side).
     */
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

    /**
     * Creación de Vehículo desde el módulo de Vehículos.
     */
    async handleCreateVehicle(data) {
        try {
            // Validación de integridad
            if (!data.cliente_id) {
                alert('Debe seleccionar un cliente.');
                return;
            }
            
            // Mapeo seguro de campos (Frontend -> Backend DTO)
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
            this.init(); // Recargar todo
        } catch (error) {
            console.error(error);
            alert('Error al crear vehículo: ' + (error.message || 'Error desconocido'));
        }
    }

    /**
     * Abre modal de edición.
     */
    handleEditVehicle(id) {
        const vehicle = this.vehicles.find(v => v.id == id);
        if (vehicle) {
            this.view.showVehicleModal(vehicle);
        }
    }

    /**
     * Abre modal de detalles.
     */
    handleViewVehicle(id) {
        const vehicle = this.vehicles.find(v => v.id == id);
        if (vehicle) {
            this.view.showDetailsModal(vehicle);
        }
    }

    /**
     * Persistencia de cambios (Edición).
     */
    async handleSaveVehicle(id, data) {
        try {
            await this.model.api.put(`/clients/vehicles/${id}`, data);
            alert('Vehículo actualizado exitosamente');
            
            this.vehicles = await this.model.getAll();
            this.view.render(this.vehicles);
        } catch (error) {
            console.error(error);
            alert('Error al actualizar vehículo: ' + (error.message || 'Error desconocido'));
        }
    }
}
