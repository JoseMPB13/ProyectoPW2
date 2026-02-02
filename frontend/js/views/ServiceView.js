import Toast from '../utils/toast.js';

export default class ServiceView {
    constructor() {
        this.contentArea = document.getElementById('contentArea');
        this.onAction = null;
        this.onSubmit = null;
        this.onSearch = null;
    }

    render(services = [], searchTerm = '') {
        this.contentArea.innerHTML = `
            <div class="card fade-in">
                <div class="card-header d-flex justify-content-between align-items-center mb-4 border-bottom pb-3" style="background: transparent;">
                    <div>
                        <h2 class="h3 mb-1 font-weight-bold text-main">Gestión de Servicios</h2>
                        <p class="text-secondary small mb-0">Administra los servicios ofrecidos por el taller</p>
                    </div>
                    <div class="d-flex gap-3 align-items-center">
                        <div class="search-wrapper position-relative">
                            <i class="fas fa-search position-absolute text-muted" style="left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.9rem;"></i>
                            <input 
                                type="text" 
                                id="searchServices" 
                                placeholder="Buscar servicio..." 
                                class="form-control pl-5 bg-input text-main"
                                style="padding-left: 35px; border-radius: 8px;"
                                value="${searchTerm}"
                            >
                        </div>
                        <button id="btnNewService" class="btn btn-success text-white d-flex align-items-center gap-2 px-4 shadow-sm" style="border-radius: 8px;">
                            <i class="fas fa-plus"></i>
                            <span>Nuevo Servicio</span>
                        </button>
                    </div>
                </div>

                <div class="row g-4 view-content p-3">
                    ${this.renderServiceCards(services)}
                </div>
            </div>
        `;

        // Restore focus if search was active
        if (searchTerm) {
            requestAnimationFrame(() => {
                const input = document.getElementById("searchServices");
                if (input) {
                    input.focus();
                    input.setSelectionRange(input.value.length, input.value.length);
                }
            });
        }

        this.attachEvents();
    }

    renderServiceCards(services) {
        console.log('Rendering cards for:', services);
        if (!services || services.length === 0) {
            return `
                <div class="col-12 text-center py-5">
                    <div class="mb-3 text-muted opacity-25">
                        <i class="fas fa-tools fa-4x"></i>
                    </div>
                    <h4 class="text-muted">No hay servicios registrados</h4>
                    <p class="text-secondary small">Crea el primer servicio para comenzar a gestionar.</p>
                </div>
            `;
        }

        return services.map(service => {
            const precioFormatted = parseFloat(service.precio).toLocaleString('es-BO', { minimumFractionDigits: 2 });
            return `
            <div class="col-12 col-md-6 col-xl-4">
                <div class="card border-0 shadow-sm h-100 hover-card transition-transform">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="d-flex align-items-center">
                                <div class="rounded-circle p-3 me-3 bg-info bg-opacity-10 text-info">
                                    <i class="fas fa-tools fa-lg"></i>
                                </div>
                                <div>
                                    <h5 class="fw-bold mb-0 text-dark">${service.nombre}</h5>
                                    <span class="badge bg-info text-white rounded-pill small" style="font-size: 0.7rem;">Servicio</span>
                                </div>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-link text-secondary p-1 text-decoration-none" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                                    <li><a class="dropdown-item small" href="#" data-action="edit" data-id="${service.id}"><i class="fas fa-edit me-2 text-warning"></i> Editar</a></li>
                                    <li><a class="dropdown-item small text-danger" href="#" data-action="delete" data-id="${service.id}"><i class="fas fa-trash-alt me-2"></i> Eliminar</a></li>
                                </ul>
                            </div>
                        </div>
                        
                        <p class="text-muted small mb-4" style="min-height: 40px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${service.descripcion || 'Sin descripción disponible.'}
                        </p>
                        
                        <div class="d-flex justify-content-between align-items-center pt-3 border-top border-light">
                            <span class="h5 fw-bold text-primary mb-0">Bs. ${precioFormatted}</span>
                            <small class="text-muted">Precio Base</small>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    attachEvents() {
        const btnNew = document.getElementById('btnNewService');
        if (btnNew) {
            btnNew.addEventListener('click', () => {
                this.openModal();
            });
        }

        const searchInput = document.getElementById('searchServices');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (this.onSearch) this.onSearch(e.target.value);
            });
        }

        const viewContent = this.contentArea.querySelector('.view-content');
        if (viewContent) {
            viewContent.addEventListener('click', (e) => {
                const target = e.target.closest('a[data-action]');
                if (target) {
                    e.preventDefault();
                    const action = target.dataset.action;
                    const id = target.dataset.id;
                    if (this.onAction) this.onAction(action, id);
                }
            });
        }
    }

    openModal(service = null) {
        const isEdit = !!service;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay open';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; width: 90%;">
                <div class="modal-header">
                    <h3>${isEdit ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="serviceForm">
                        <input type="hidden" name="id" value="${service ? service.id : ''}">
                        
                        <div class="form-group mb-3">
                            <label class="form-label text-dark font-weight-bold">Nombre del Servicio <span class="text-danger">*</span></label>
                            <input type="text" name="nombre" class="form-control" value="${service ? service.nombre : ''}" required placeholder="Ej. Cambio de Aceite">
                        </div>

                        <div class="form-group mb-3">
                            <label class="form-label text-dark font-weight-bold">Precio Base (Bs.) <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text border-0 bg-light">Bs.</span>
                                <input type="number" name="precio" class="form-control" value="${service ? service.precio : ''}" step="0.01" required placeholder="0.00">
                            </div>
                        </div>

                        <div class="form-group mb-3">
                            <label class="form-label text-dark font-weight-bold">Descripción</label>
                            <textarea name="descripcion" class="form-control" rows="4" placeholder="Detalles del servicio...">${service ? service.descripcion || '' : ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer d-flex justify-content-between align-items-center bg-light border-top-0">
                    <button type="button" class="btn btn-danger rounded-pill px-4 shadow-sm modal-close" style="height: 45px; display: flex; align-items: center; justify-content: center; background-color: #ef4444; border-color: #ef4444; color: white; font-size: 0.95rem; font-weight: 700;">
                        <i class="fas fa-times me-2"></i> Cancelar
                    </button>
                    <button type="submit" form="serviceForm" class="btn btn-primary rounded-pill px-4 shadow-sm" style="height: 45px; display: flex; align-items: center; justify-content: center; background-color: #4f46e5; border-color: #4f46e5; font-size: 0.95rem; font-weight: 700;">
                        <i class="fas fa-save me-2"></i> ${isEdit ? 'Actualizar' : 'Guardar Servicio'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close logic
        modal.querySelectorAll('.modal-close').forEach(b => b.onclick = () => modal.remove());

        // Submit logic
        const form = modal.querySelector('#serviceForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {
                id: formData.get('id'),
                nombre: formData.get('nombre'),
                precio: parseFloat(formData.get('precio')),
                descripcion: formData.get('descripcion')
            };

            if (this.onSubmit) this.onSubmit(data);
            modal.remove();
        };
    }

    showConfirmDelete(id, onConfirm) {
        if (confirm('¿Estás seguro de eliminar este servicio?')) {
            onConfirm(id);
        }
    }

    showSuccess(msg) {
        Toast.success(msg);
    }

    showError(msg) {
        Toast.error(msg);
    }
}
