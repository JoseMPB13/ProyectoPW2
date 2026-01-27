/**
 * Vista de Trabajadores
 * Maneja la renderización de la interfaz de gestión de trabajadores.
 */
export default class WorkerView {
    constructor() {
        this.contentArea = document.getElementById('contentArea');
    }

    /**
     * Renderiza la vista principal de trabajadores con la tabla.
     * @param {Array} workers - Array de trabajadores a mostrar.
     */
    render(workers = []) {
        this.contentArea.innerHTML = `
            <div class="workers-container">
                <div class="workers-header">
                    <h2>Gestión de Trabajadores</h2>
                    <button id="newWorkerBtn" class="btn btn-primary">Nuevo Trabajador</button>
                </div>

                <div class="workers-filters">
                    <input type="text" id="searchWorkers" placeholder="Buscar por nombre o correo..." class="search-input">
                    <select id="filterRole" class="filter-select">
                        <option value="">Todos los roles</option>
                        <option value="admin">Administrador</option>
                        <option value="recepcion">Recepción</option>
                        <option value="mecanico">Mecánico</option>
                    </select>
                </div>

                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre Completo</th>
                                <th>Correo</th>
                                <th>Celular</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="workersTableBody">
                            ${this.renderWorkerRows(workers)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza las filas de la tabla de trabajadores.
     * @param {Array} workers - Array de trabajadores.
     * @returns {string} HTML de las filas.
     */
    renderWorkerRows(workers) {
        if (!workers || workers.length === 0) {
            return '<tr><td colspan="6" class="text-center">No hay trabajadores registrados</td></tr>';
        }

        return workers.map(worker => `
            <tr>
                <td>${worker.id}</td>
                <td>${worker.nombre} ${worker.apellido_p || ''} ${worker.apellido_m || ''}</td>
                <td>${worker.correo || 'N/A'}</td>
                <td>${worker.celular || 'N/A'}</td>
                <td><span class="badge badge-${this.getRoleBadge(worker.rol_nombre)}">${worker.rol_nombre || 'N/A'}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" data-action="view" data-id="${worker.id}">Ver</button>
                    <button class="btn btn-sm btn-warning" data-action="edit" data-id="${worker.id}">Editar</button>
                    <button class="btn btn-sm btn-danger" data-action="delete" data-id="${worker.id}">Eliminar</button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Renderiza el modal para crear/editar un trabajador.
     */
    renderWorkerModal(worker = null) {
        const modalHTML = `
            <div class="modal" id="workerModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${worker ? 'Editar Trabajador' : 'Nuevo Trabajador'}</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="workerForm">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="nombre">Nombre*</label>
                                    <input type="text" id="nombre" required value="${worker?.nombre || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="apellidoP">Apellido Paterno*</label>
                                    <input type="text" id="apellidoP" required value="${worker?.apellido_p || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="apellidoM">Apellido Materno</label>
                                    <input type="text" id="apellidoM" value="${worker?.apellido_m || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="correo">Correo Electrónico*</label>
                                    <input type="email" id="correo" required value="${worker?.correo || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="celular">Celular</label>
                                    <input type="tel" id="celular" value="${worker?.celular || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="rolNombre">Rol*</label>
                                    <select id="rolNombre" required>
                                        <option value="recepcion" ${worker?.rol_nombre === 'recepcion' ? 'selected' : ''}>Recepción</option>
                                        <option value="mecanico" ${worker?.rol_nombre === 'mecanico' ? 'selected' : ''}>Mecánico</option>
                                        <option value="admin" ${worker?.rol_nombre === 'admin' ? 'selected' : ''}>Administrador</option>
                                    </select>
                                </div>
                                ${!worker ? `
                                <div class="form-group">
                                    <label for="password">Contraseña*</label>
                                    <input type="password" id="password" required minlength="6">
                                </div>
                                <div class="form-group">
                                    <label for="confirmPassword">Confirmar Contraseña*</label>
                                    <input type="password" id="confirmPassword" required minlength="6">
                                </div>
                                ` : ''}
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary cancel-modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Cierra y elimina el modal.
     */
    closeModal() {
        const modal = document.getElementById('workerModal');
        if (modal) modal.remove();
    }

    /**
     * Muestra un mensaje de error.
     */
    showError(message) {
        alert('Error: ' + message);
    }

    /**
     * Muestra un mensaje de éxito.
     */
    showSuccess(message) {
        alert('Éxito: ' + message);
    }

    /**
     * Obtiene la clase de badge según el rol.
     */
    getRoleBadge(rol) {
        const roleMap = {
            'admin': 'danger',
            'mecanico': 'info',
            'recepcion': 'warning'
        };
        return roleMap[rol] || 'secondary';
    }

    /**
     * Vincula eventos.
     */
    bindNewWorker(handler) {
        this.contentArea.addEventListener('click', (e) => {
            if (e.target.id === 'newWorkerBtn') {
                handler();
            }
        });
    }

    bindSubmitWorker(handler) {
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'workerForm') {
                e.preventDefault();
                const formData = {
                    nombre: document.getElementById('nombre').value,
                    apellido_p: document.getElementById('apellidoP').value,
                    apellido_m: document.getElementById('apellidoM').value,
                    correo: document.getElementById('correo').value,
                    celular: document.getElementById('celular').value,
                    rol_nombre: document.getElementById('rolNombre').value
                };
                
                const passwordField = document.getElementById('password');
                if (passwordField) {
                    const confirmPassword = document.getElementById('confirmPassword').value;
                    if (passwordField.value !== confirmPassword) {
                        alert('Las contraseñas no coinciden');
                        return;
                    }
                    formData.password = passwordField.value;
                }
                
                handler(formData);
            }
        });
    }

    bindCloseModal() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal') || 
                e.target.classList.contains('cancel-modal')) {
                this.closeModal();
            }
        });
    }

    bindWorkerActions(handler) {
        this.contentArea.addEventListener('click', (e) => {
            if (e.target.dataset.action) {
                const action = e.target.dataset.action;
                const id = e.target.dataset.id;
                handler(action, id);
            }
        });
    }

    bindSearch(handler) {
        this.contentArea.addEventListener('input', (e) => {
            if (e.target.id === 'searchWorkers') {
                handler(e.target.value);
            }
        });
    }

    bindFilterRole(handler) {
        this.contentArea.addEventListener('change', (e) => {
            if (e.target.id === 'filterRole') {
                handler(e.target.value);
            }
        });
    }
}
