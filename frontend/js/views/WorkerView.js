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
    render(workers = []) {
        this.contentArea.innerHTML = `
            <div class="workers-view">
                <!-- Header -->
                <div class="view-header">
                    <div>
                        <h2>Gestión de Trabajadores</h2>
                        <p class="text-secondary">Administra los usuarios y permisos del sistema</p>
                    </div>
                    <button id="newWorkerBtn" class="btn-primary">
                        <span>+</span> Nuevo Trabajador
                    </button>
                </div>

                <!-- Filters Bar -->
                <div class="filters-bar">
                    <div class="search-box">
                        <input 
                            type="text" 
                            id="searchWorkers" 
                            placeholder="🔍 Buscar por nombre, correo..." 
                            class="search-input"
                        >
                    </div>
                    <div class="filter-group">
                        <select id="filterRole" class="filter-select">
                            <option value="">Todos los roles</option>
                            <option value="admin">Administrador</option>
                            <option value="recepcion">Recepción</option>
                            <option value="mecanico">Mecánico</option>
                        </select>
                    </div>
                </div>

                <!-- Workers Grid -->
                <div class="workers-grid">
                    ${this.renderWorkerCards(workers)}
                </div>
            </div>
        `;

        this.attachEvents();
    }

    /**
     * Renderiza las tarjetas de los trabajadores.
     */
    renderWorkerCards(workers) {
        if (!workers || workers.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3>No hay trabajadores registrados</h3>
                    <p>Intenta ajustar los filtros o agrega un nuevo trabajador.</p>
                </div>
            `;
        }

        return workers.map(worker => `
            <div class="worker-card" data-id="${worker.id}">
                <div class="worker-card-header">
                    <div class="worker-avatar">
                        ${worker.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div class="worker-role">
                         <span class="badge badge-${this.getRoleBadge(worker.rol_nombre)}">
                            ${worker.rol_nombre || 'Sin Rol'}
                        </span>
                    </div>
                </div>
                
                <div class="worker-card-body">
                    <h3 class="worker-name">${worker.nombre} ${worker.apellido_p || ''}</h3>
                    <p class="worker-email">${worker.correo || 'N/A'}</p>
                    
                    <div class="worker-details">
                        <div class="detail-item">
                            <span class="icon">📱</span>
                            <span>${worker.celular || 'No registrado'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="icon">🆔</span>
                            <span>ID: ${worker.id}</span>
                        </div>
                    </div>
                </div>
                
                <div class="worker-card-footer">
                    <button class="btn-primary-sm" data-action="edit" data-id="${worker.id}">
                        ✏️ Editar
                    </button>
                    <button class="btn-outline-danger btn-sm" data-action="delete" data-id="${worker.id}">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
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
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="nombre">Nombre *</label>
                                    <input type="text" id="nombre" class="form-control" required value="${worker?.nombre || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="apellidoP">Apellido Paterno *</label>
                                    <input type="text" id="apellidoP" class="form-control" required value="${worker?.apellido_p || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="apellidoM">Apellido Materno</label>
                                    <input type="text" id="apellidoM" class="form-control" value="${worker?.apellido_m || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="rolNombre">Rol *</label>
                                    <select id="rolNombre" class="form-control" required>
                                        <option value="recepcion" ${worker?.rol_nombre === 'recepcion' ? 'selected' : ''}>Recepción</option>
                                        <option value="mecanico" ${worker?.rol_nombre === 'mecanico' ? 'selected' : ''}>Mecánico</option>
                                        <option value="admin" ${worker?.rol_nombre === 'admin' ? 'selected' : ''}>Administrador</option>
                                    </select>
                                </div>
                                
                                <div class="form-group full-width">
                                    <label for="correo">Correo Electrónico *</label>
                                    <input type="email" id="correo" class="form-control" required value="${worker?.correo || ''}">
                                </div>
                                <div class="form-group full-width">
                                    <label for="celular">Celular</label>
                                    <input type="tel" id="celular" class="form-control" value="${worker?.celular || ''}">
                                </div>

                                <div class="form-divider full-width">
                                    <span>Seguridad</span>
                                </div>

                                <div class="form-group">
                                    <label for="password">${isEdit ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}</label>
                                    <input type="password" id="password" class="form-control" ${isEdit ? '' : 'required'} minlength="6">
                                    ${isEdit ? '<small class="text-secondary">Dejar en blanco para mantener la actual</small>' : ''}
                                </div>
                                <div class="form-group">
                                    <label for="confirmPassword">Confirmar Contraseña</label>
                                    <input type="password" id="confirmPassword" class="form-control" ${isEdit ? '' : 'required'} minlength="6">
                                </div>
                            </div>
                            
                            <div class="modal-footer" style="margin-top: 20px;">
                                <button type="button" class="btn-secondary modal-close-btn">Cancelar</button>
                                <button type="submit" class="btn-primary">Guardar</button>
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

        // Acciones en tarjetas (Delegación)
        const grid = document.querySelector('.workers-grid');
        if (grid) {
            grid.addEventListener('click', (e) => {
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
        alert('Error: ' + message);
    }

    showSuccess(message) {
        alert('Éxito: ' + message);
    }

    getRoleBadge(rol) {
        const roleMap = {
            'admin': 'danger',
            'mecanico': 'info',
            'recepcion': 'warning'
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
    bindCloseModal() {} 
}
