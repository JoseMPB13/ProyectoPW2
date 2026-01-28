export default class ServiceController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        this.services = [];
    }

    async init() {
        this.bindEvents();
        await this.loadServices();
    }

    bindEvents() {
        this.view.onAction = (action, id) => this.handleAction(action, id);
        this.view.onSubmit = (data) => this.handleSubmit(data);
    }

    async loadServices() {
        try {
            this.services = await this.model.getServices();
            this.view.render(this.services);
        } catch (error) {
            console.error(error);
            this.view.showError('Error al cargar servicios');
        }
    }

    async handleAction(action, id) {
        const service = this.services.find(s => s.id == id);
        if (!service) return;

        if (action === 'edit') {
            this.view.showModal(service);
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
