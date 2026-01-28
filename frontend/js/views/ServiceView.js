export default class ServiceView {
    constructor() {
        this.contentArea = document.getElementById('contentArea');
        this.onAction = null;
        this.onSubmit = null;
    }

    render(services = []) {
        this.contentArea.innerHTML = `
            <div class="view-header">
                <div>
                    <h2>Gestión de Servicios</h2>
                    <p class="text-secondary">Administra los servicios ofrecidos por el taller</p>
                </div>
                <button id="btnNewService" class="btn-primary">
                    <span>+</span> Nuevo Servicio
                </button>
            </div>

            <div class="services-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
                ${this.renderServiceCards(services)}
            </div>
        `;

        this.attachEvents();
    }

    renderServiceCards(services) {
        if (!services.length) {
            return `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🛠️</div>
                    <h3>No hay servicios registrados</h3>
                    <p>Crea el primer servicio para comenzar.</p>
                </div>
            `;
        }

        return services.map(service => `
            <div class="card service-card" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <h3 style="margin: 0; color: var(--text-color);">${service.nombre}</h3>
                        <span class="badge badge-success">Bs. ${parseFloat(service.precio).toFixed(2)}</span>
                    </div>
                    <p class="text-secondary" style="margin-bottom: 15px;">
                        ${service.descripcion || 'Sin descripción'}
                    </p>
                </div>
                <div class="card-actions" style="border-top: 1px solid var(--border-color); padding-top: 15px; margin-top: 10px; display: flex; gap: 10px;">
                    <button class="btn-secondary btn-sm" data-action="edit" data-id="${service.id}" style="flex: 1;">
                        ✏️ Editar
                    </button>
                    <button class="btn-danger btn-sm" data-action="delete" data-id="${service.id}" style="flex: 1;">
                        🗑️ Eliminar
                    </button>
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
                    <button class="modal-close">&times;</button>
                </div>
                <form id="serviceForm" class="modal-body">
                    <div class="form-group">
                        <label for="nombre">Nombre del Servicio *</label>
                        <input type="text" id="nombre" name="nombre" class="form-control" 
                               value="${service ? service.nombre : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="precio">Precio (Bs.) *</label>
                        <input type="number" id="precio" name="precio" class="form-control" step="0.01" 
                               value="${service ? service.precio : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="descripcion">Descripción</label>
                        <textarea id="descripcion" name="descripcion" class="form-control" rows="3">${service ? service.descripcion || '' : ''}</textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary modal-close">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
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
