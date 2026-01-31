export default class ServiceController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        this.allServices = [];
        this.currentSearch = '';
    }

    async init() {
        this.bindEvents();
        await this.loadServices();
    }

    bindEvents() {
        this.view.onAction = (action, id) => this.handleAction(action, id);
        this.view.onSubmit = (data) => this.handleSubmit(data);
        this.view.onSearch = (query) => this.handleSearch(query);
    }

    async loadServices() {
        try {
            this.allServices = await this.model.getServices();
            this.filterAndRender();
        } catch (error) {
            console.error(error);
            this.view.showError('Error al cargar servicios');
        }
    }

    handleSearch(query) {
        this.currentSearch = query;
        this.filterAndRender();
    }

    filterAndRender() {
        let filtered = this.allServices;
        if (this.currentSearch) {
            const q = this.currentSearch.toLowerCase();
            filtered = filtered.filter(s => 
                s.nombre.toLowerCase().includes(q) || 
                (s.descripcion && s.descripcion.toLowerCase().includes(q))
            );
        }
        this.view.render(filtered, this.currentSearch);
    }

    async handleAction(action, id) {
        const service = this.allServices.find(s => s.id == id);
        if (!service) return;

        if (action === 'edit') {
            this.view.openModal(service);
        } else if (action === 'delete') {
            this.view.showConfirmDelete(id, async (idToDelete) => {
                try {
                    await this.model.deleteService(idToDelete);
                    this.view.showSuccess('Servicio eliminado');
                    this.loadServices();
                } catch (error) {
                    console.error(error);
                    this.view.showError('Error al eliminar servicio');
                }
            });
        }
    }

    async handleSubmit(data) {
        try {
            if (data.id) {
                // Update
                await this.model.updateService(data.id, data);
            } else {
                // Create
                await this.model.createService(data);
            }
            this.view.showSuccess('Operación exitosa');
            this.loadServices();
        } catch (error) {
            console.error(error);
            this.view.showError(error.message);
        }
    }
}
