import Toast from '../utils/toast.js';

/**
 * Vista de Trabajadores
 * Maneja la renderización de la interfaz de gestión de trabajadores.
 */
export default class WorkerView {
    constructor() {
        this.contentArea = document.getElementById('contentArea');
        // Callbacks
        this.onNewWorker = null;
        this.onSubmitWorker = null;
        this.onWorkerAction = null;
        this.onSearch = null;
        this.onFilterRole = null;
    }

    /**
     * Renderiza la vista principal de trabajadores con tarjetas.
     * @param {Array} workers - Array de trabajadores a mostrar.
     */
    render(workers = [], filters = {}) {
        const isSelected = (val) => (filters.role === val ? 'selected' : '');

        this.contentArea.innerHTML = `
            <div class="card fade-in">
                 <!-- Header -->
                <div class="card-header d-flex justify-content-between align-items-center mb-4 border-bottom pb-3" style="background: transparent;">
                    <div>
                        <h2 class="h3 mb-1 font-weight-bold text-main">Gestión de Trabajadores</h2>
                        <p class="text-secondary small mb-0">Administra los usuarios y permisos del sistema</p>
                    </div>
                    <div class="d-flex gap-3 align-items-center">
                         <div class="search-wrapper position-relative">
                            <i class="fas fa-search position-absolute text-muted" style="left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.9rem;"></i>
                            <input 
                                type="text" 
                                id="searchWorkers" 
                                placeholder="Buscar..." 
                                class="form-control pl-5"
                                style="padding-left: 35px; border-radius: 8px; border: 1px solid #e2e8f0;"
                                value="${filters.search || ''}"
                            >
                        </div>
                        <button id="newWorkerBtn" class="btn btn-success text-white d-flex align-items-center gap-2 px-4 shadow-sm" style="border-radius: 8px;">
                            <i class="fas fa-plus"></i>
                            <span>Nuevo Trabajador</span>
                        </button>
                    </div>
                </div>

                <!-- Filters Bar (Secondary) -->
                <div class="filters-bar mb-4 bg-light p-3 rounded border">
                    <div class="d-flex align-items-center">
                        <label for="filterRole" class="mr-3 font-weight-500 text-secondary mb-0">Filtrar por Rol:</label>
                         <select id="filterRole" class="form-control" style="max-width: 200px;">
                            <option value="" ${isSelected('') || isSelected(null)}>Todos los roles</option>
                            <option value="admin" ${isSelected('admin')}>Administrador</option>
                            <option value="recepcionista" ${isSelected('recepcionista')}>Recepción</option>
                            <option value="mecanico" ${isSelected('mecanico')}>Mecánico</option>
                        </select>
                    </div>
                </div>

                <!-- Workers Table -->
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0" style="width: 100%;">
                        <thead class="bg-light border-bottom">
                            <tr>
                                <th class="py-3 px-4 text-uppercase text-secondary text-xs font-weight-bold tracking-wide border-0">Trabajador</th>
                                <th class="py-3 px-4 text-uppercase text-secondary text-xs font-weight-bold tracking-wide border-0">Rol</th>
                                <th class="py-3 px-4 text-uppercase text-secondary text-xs font-weight-bold tracking-wide border-0">Contacto</th>
                                <th class="py-3 px-4 text-uppercase text-secondary text-xs font-weight-bold tracking-wide border-0">ID</th>
                                <th class="py-3 px-4 text-uppercase text-secondary text-xs font-weight-bold tracking-wide border-0 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="workersTableBody">
                            ${this.renderWorkerTable(workers)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Restore focus if search was active
        if (filters.search) {
            requestAnimationFrame(() => {
                const input = document.getElementById("searchWorkers");
                if (input) {
                    input.focus();
                    input.setSelectionRange(input.value.length, input.value.length);
                }
            });
        }

        this.attachEvents();
    }

    /**
     * Renderiza las tarjetas de los trabajadores.
     */
    /**
     * Renderiza las filas de la tabla de trabajadores.
     */
    renderWorkerTable(workers) {
        if (!workers || workers.length === 0) {
            return `
                <tr>
                    <td colspan="5" class="text-center p-5">
                        <div class="d-flex flex-column align-items-center justify-content-center">
                            <div class="text-secondary mb-3"><i class="fas fa-users-slash fa-3x"></i></div>
                            <h4 class="text-dark">No hay trabajadores registrados</h4>
                            <p class="text-secondary mb-3">Intenta ajustar los filtros o agrega un nuevo trabajador.</p>
                        </div>
                    </td>
                </tr>
            `;
        }

        return workers.map(worker => `
            <tr>
                <td class="py-3 px-4 border-bottom">
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle mr-3 bg-white text-primary font-weight-bold d-flex align-items-center justify-content-center rounded-circle shadow-sm" style="width: 36px; height: 36px;">
                            ${worker.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-weight-bold text-main" style="font-size: 0.95rem;">${worker.nombre} ${worker.apellido_p || ''}</div>
                            <div class="small text-secondary">${worker.correo || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td class="py-3 px-4 border-bottom">
                     <span class="badge badge-${this.getRoleBadge(worker.rol_nombre)} px-3 py-1 rounded-pill">
                         ${worker.rol_nombre || 'Sin Rol'}
                    </span>
                </td>
                <td class="py-3 px-4 border-bottom">
                    <div class="small text-main"><i class="fas fa-mobile-alt text-secondary mr-2"></i>${worker.celular || 'No registrado'}</div>
                </td>
                <td class="py-3 px-4 border-bottom text-secondary font-weight-500">
                    ID: ${worker.id}
                </td>
                <td class="py-3 px-4 border-bottom text-center">
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary mr-1" data-action="edit" data-id="${worker.id}" title="Editar">
                             <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${worker.id}" title="Eliminar">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Renderiza el modal para crear/editar un trabajador.
     */
    renderWorkerModal(worker = null) {
        const isEdit = !!worker;
        const modalHTML = `
            <div class="modal-overlay open" id="workerModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Editar Trabajador' : 'Nuevo Trabajador'}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="workerForm">
                            <input type="hidden" id="workerId" value="${worker?.id || ''}">
                            
                            <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label for="nombre" class="form-label text-dark font-weight-bold">Nombre *</label>
                                    <input type="text" id="nombre" class="form-control" required value="${worker?.nombre || ''}" style="width: 100%;">
                                </div>
                                <div class="form-group">
                                    <label for="apellidoP" class="form-label text-dark font-weight-bold">Apellido Paterno *</label>
                                    <input type="text" id="apellidoP" class="form-control" required value="${worker?.apellido_p || ''}" style="width: 100%;">
                                </div>
                                <div class="form-group">
                                    <label for="apellidoM" class="form-label text-dark font-weight-bold">Apellido Materno</label>
                                    <input type="text" id="apellidoM" class="form-control" value="${worker?.apellido_m || ''}" style="width: 100%;">
                                </div>
                                <div class="form-group">
                                    <label for="rolNombre" class="form-label text-dark font-weight-bold">Rol *</label>
                                    <select id="rolNombre" class="form-control" required style="width: 100%;">
                                        <option value="recepcionista" ${worker?.rol_nombre === 'recepcionista' ? 'selected' : ''}>Recepción</option>
                                        <option value="mecanico" ${worker?.rol_nombre === 'mecanico' ? 'selected' : ''}>Mecánico</option>
                                        <option value="admin" ${worker?.rol_nombre === 'admin' ? 'selected' : ''}>Administrador</option>
                                    </select>
                                </div>
                                
                                <div class="form-group full-width" style="grid-column: 1 / -1;">
                                    <label for="correo" class="form-label text-dark font-weight-bold">Correo Electrónico *</label>
                                    <input type="email" id="correo" class="form-control" required value="${worker?.correo || ''}" style="width: 100%;">
                                </div>
                                <div class="form-group full-width" style="grid-column: 1 / -1;">
                                    <label for="celular" class="form-label text-dark font-weight-bold">Celular</label>
                                    <input type="tel" id="celular" class="form-control" value="${worker?.celular || ''}" style="width: 100%;">
                                </div>

                                <div class="form-divider full-width" style="grid-column: 1 / -1; margin: 10px 0; border-bottom: 1px solid #eee;">
                                    <span style="font-size: 0.9rem; color: #888; text-transform: uppercase; font-weight: bold;">Seguridad</span>
                                </div>

                                <div class="form-group">
                                    <label for="password" class="form-label text-dark font-weight-bold">${isEdit ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}</label>
                                    <input type="password" id="password" class="form-control" ${isEdit ? '' : 'required'} minlength="6" style="width: 100%;">
                                    ${isEdit ? '<small class="text-secondary">Dejar en blanco para mantener la actual</small>' : ''}
                                </div>
                                <div class="form-group">
                                    <label for="confirmPassword" class="form-label text-dark font-weight-bold">Confirmar Contraseña</label>
                                    <input type="password" id="confirmPassword" class="form-control" ${isEdit ? '' : 'required'} minlength="6" style="width: 100%;">
                                </div>
                            </div>
                            
                            <div class="modal-footer d-flex justify-content-between align-items-center bg-light border-top-0" style="margin-top: 20px;">
                                <button type="button" class="btn btn-danger rounded-pill px-4 shadow-sm modal-close" style="height: 45px; display: flex; align-items: center; justify-content: center; background-color: #ef4444; border-color: #ef4444; color: white; font-size: 0.95rem; font-weight: 700;">
                                    <i class="fas fa-times me-2"></i> Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary rounded-pill px-4 shadow-sm" style="height: 45px; display: flex; align-items: center; justify-content: center; background-color: #4f46e5; border-color: #4f46e5; font-size: 0.95rem; font-weight: 700;">
                                    <i class="fas fa-save me-2"></i> Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Eliminar modal anterior si existe
        const existingModal = document.getElementById('workerModal');
        if (existingModal) existingModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.attachModalEvents();
    }

    /**
     * Adjunta eventos a la vista principal.
     */
    attachEvents() {
        // Nuevo Trabajador
        const newBtn = document.getElementById('newWorkerBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                if (this.onNewWorker) this.onNewWorker();
            });
        }

        // Búsqueda
        const searchInput = document.getElementById('searchWorkers');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (this.onSearch) this.onSearch(e.target.value);
            });
        }

        // Filtro Rol
        const filterRole = document.getElementById('filterRole');
        if (filterRole) {
            filterRole.addEventListener('change', (e) => {
                if (this.onFilterRole) this.onFilterRole(e.target.value);
            });
        }

        // Acciones en tabla (Delegación)
        const tableBody = document.getElementById('workersTableBody');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-action]');
                if (btn) {
                    const action = btn.dataset.action;
                    const id = btn.dataset.id;
                    if (this.onWorkerAction) this.onWorkerAction(action, id);
                }
            });
        }
    }

    /**
     * Adjunta eventos al modal.
     */
    attachModalEvents() {
        const modal = document.getElementById('workerModal');
        if (!modal) return;

        // Cerrar
        const closeBtns = modal.querySelectorAll('.modal-close, .modal-close-btn');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        // Submit Form
        const form = document.getElementById('workerForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
    }

    /**
     * Maneja el envío del formulario.
     */
    handleFormSubmit() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password && password !== confirmPassword) {
            this.showError('Las contraseñas no coinciden');
            return;
        }

        const formData = {
            id: document.getElementById('workerId').value, // Hidden ID
            nombre: document.getElementById('nombre').value,
            apellido_p: document.getElementById('apellidoP').value,
            apellido_m: document.getElementById('apellidoM').value,
            correo: document.getElementById('correo').value,
            celular: document.getElementById('celular').value,
            rol_nombre: document.getElementById('rolNombre').value,
            password: password // Puede estar vacío si es edición
        };

        if (this.onSubmitWorker) {
            this.onSubmitWorker(formData);
        }
    }

    closeModal() {
        const modal = document.getElementById('workerModal');
        if (modal) modal.remove();
    }

    showError(message) {
        Toast.error(message);
    }

    showSuccess(message) {
        Toast.success(message);
    }

    getRoleBadge(rol) {
        const roleMap = {
            'admin': 'danger',
            'mecanico': 'info',
            'recepcionista': 'warning'
        };
        return roleMap[rol] || 'secondary';
    }

    // Bindings
    bindNewWorker(handler) { this.onNewWorker = handler; }
    bindSubmitWorker(handler) { this.onSubmitWorker = handler; }
    bindWorkerActions(handler) { this.onWorkerAction = handler; }
    bindSearch(handler) { this.onSearch = handler; }
    bindFilterRole(handler) { this.onFilterRole = handler; }

    // Legacy compatible methods (empty to prevent errors if controller calls them)
    bindCloseModal() { }
}
