export default class InventoryController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        this.parts = [];
    }

    async init() {
        this.bindEvents();
        await this.loadParts();
    }

    bindEvents() {
        this.view.onAction = (action, id) => this.handleAction(action, id);
        this.view.onSubmit = (data) => this.handleSubmit(data);
    }

    async loadParts() {
        try {
            this.parts = await this.model.getParts();
            this.view.render(this.parts);
        } catch (error) {
            console.error(error);
            this.view.showError('Error al cargar inventario');
        }
    }

    async handleAction(action, id) {
        const part = this.parts.find(p => p.id == id);
        if (!part) return;

        if (action === 'edit') {
            this.view.showModal(part);
        } else if (action === 'delete') {
            this.view.showConfirmDelete(id, async (idToDelete) => {
                try {
                    await this.model.deletePart(idToDelete);
                    this.view.showSuccess('Repuesto eliminado');
                    this.loadParts();
                } catch (error) {
                    console.error(error);
                    this.view.showError('Error al eliminar repuesto');
                }
            });
        }
    }

    async handleSubmit(data) {
        try {
            if (data.id) {
                await this.model.updatePart(data.id, data);
            } else {
                await this.model.createPart(data);
            }
            this.view.showSuccess('Operación exitosa');
            this.loadParts();
        } catch (error) {
            console.error(error);
            this.view.showError(error.message);
        }
    }
}
