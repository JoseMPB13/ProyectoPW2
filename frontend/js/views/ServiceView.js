export default class ServiceView {
    constructor() {
        this.contentArea = document.getElementById('contentArea');
        this.onAction = null;
        this.onSubmit = null;
    }

    render(services = []) {
        this.contentArea.innerHTML = `
            <div class="card fade-in shadow-sm border-0 rounded-lg p-4">
                <div class="view-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h2 style="font-family: 'Inter', sans-serif; font-weight: 600;">Gestión de Servicios</h2>
                        <p class="text-secondary">Administra los servicios ofrecidos por el taller</p>
                    </div>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <button id="btnNewService" class="btn btn-primary">
                            <i class="fas fa-plus mr-2"></i> Nuevo Servicio
                        </button>
                    </div>
                </div>

                <div class="services-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem;">
                    ${this.renderServiceCards(services)}
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderServiceCards(services) {
        if (!services.length) {
            return `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 10px;"><i class="fas fa-tools text-secondary"></i></div>
                    <h3>No hay servicios registrados</h3>
                    <p>Crea el primer servicio para comenzar.</p>
                </div>
            `;
        }

        return services.map(service => `
            <div class="card border rounded-lg overflow-hidden h-100 shadow-sm hover-shadow transition-all">
                <div class="p-4">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                         <div class="icon-circle bg-light text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                            <i class="fas fa-cogs"></i>
                        </div>
                        <span class="badge badge-success px-3 py-1 rounded-pill">Bs. ${parseFloat(service.precio).toFixed(2)}</span>
                    </div>
                    <h3 class="h5 font-weight-bold mb-2 text-dark">${service.nombre}</h3>
                    <p class="text-secondary small mb-4" style="min-height: 40px;">
                        ${service.descripcion || 'Sin descripción'}
                    </p>
                    
                    <div class="d-flex gap-2 border-top pt-3">
                        <button class="btn-icon btn-edit flex-fill" data-action="edit" data-id="${service.id}" title="Editar">
                             <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete flex-fill text-danger" data-action="delete" data-id="${service.id}" title="Eliminar">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    attachEvents() {
        const btnNew = document.getElementById('btnNewService');
        if (btnNew) {
            btnNew.addEventListener('click', () => this.showModal());
        }

        this.contentArea.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                if (this.onAction) this.onAction(action, id);
            });
        });
    }

    showModal(service = null) {
        const isEdit = !!service;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay open';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEdit ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="serviceForm">
                        <div class="form-grid">
                            <div class="form-group full-width">
                                <label for="nombre">Nombre del Servicio *</label>
                                <input type="text" id="nombre" name="nombre" class="form-control" 
                                       value="${service ? service.nombre : ''}" required>
                            </div>
                            <div class="form-group full-width">
                                <label for="precio">Precio Base (Bs.) *</label>
                                <input type="number" id="precio" name="precio" class="form-control" step="0.01" 
                                       value="${service ? service.precio : ''}" required>
                            </div>
                            <div class="form-group full-width">
                                <label for="descripcion">Descripción</label>
                                <textarea id="descripcion" name="descripcion" class="form-control" rows="3">${service ? service.descripcion || '' : ''}</textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary modal-close">Cancelar</button>
                    <button type="submit" form="serviceForm" class="btn-primary">Guardar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close events
        modal.querySelectorAll('.modal-close').forEach(b => b.onclick = () => modal.remove());
        
        // Submit
        modal.querySelector('#serviceForm').onsubmit = (e) => {
            e.preventDefault();
            const formData = {
                nombre: e.target.nombre.value,
                precio: parseFloat(e.target.precio.value),
                descripcion: e.target.descripcion.value
            };
            if (service) formData.id = service.id; // Pass ID for edit
            
            if (this.onSubmit) this.onSubmit(formData);
            modal.remove();
        };
    }

    showConfirmDelete(id, onConfirm) {
        if(confirm('¿Estás seguro de eliminar este servicio?')) {
            onConfirm(id);
        }
    }

    showSuccess(msg) {
        // Simple toast or alert
        alert(msg); // Replace with better UI later if needed
    }

    showError(msg) {
        alert(msg);
    }
}
