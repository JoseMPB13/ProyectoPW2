/**
 * Vista de Órdenes
 * Maneja la renderización de la interfaz de gestión de órdenes.
 */
export default class OrderView {
    constructor() {
        this.contentArea = document.getElementById('contentArea');
    }

    /**
     * Renderiza la vista principal de órdenes con la tabla.
     * @param {Array} orders - Array de órdenes a mostrar.
     * @param {Object} pagination - Información de paginación.
     */
    render(orders = [], pagination = {}) {
        this.contentArea.innerHTML = `
            <div class="orders-container">
                <div class="orders-header">
                    <h2>Gestión de Órdenes de Trabajo</h2>
                    <button id="newOrderBtn" class="btn btn-primary">Nueva Orden</button>
                </div>

                <div class="orders-filters">
                    <input type="text" id="searchOrders" placeholder="Buscar por placa, marca o modelo..." class="search-input">
                    <select id="filterEstado" class="filter-select">
                        <option value="">Todos los estados</option>
                        <option value="1">Pendiente</option>
                        <option value="2">En Proceso</option>
                        <option value="3">Finalizado</option>
                    </select>
                </div>

                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Placa</th>
                                <th>Técnico</th>
                                <th>Estado</th>
                                <th>Fecha Ingreso</th>
                                <th>Total Estimado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="ordersTableBody">
                            ${this.renderOrderRows(orders)}
                        </tbody>
                    </table>
                </div>

                <div class="pagination">
                    <button id="prevPage" ${pagination.current_page <= 1 ? 'disabled' : ''}>Anterior</button>
                    <span>Página ${pagination.current_page || 1} de ${pagination.pages || 1}</span>
                    <button id="nextPage" ${pagination.current_page >= pagination.pages ? 'disabled' : ''}>Siguiente</button>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza las filas de la tabla de órdenes.
     * @param {Array} orders - Array de órdenes.
     * @returns {string} HTML de las filas.
     */
    renderOrderRows(orders) {
        if (!orders || orders.length === 0) {
            return '<tr><td colspan="7" class="text-center">No hay órdenes registradas</td></tr>';
        }

        return orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.placa || 'N/A'}</td>
                <td>${order.tecnico_nombre || 'Sin asignar'}</td>
                <td><span class="badge badge-${this.getStatusClass(order.estado_nombre)}">${order.estado_nombre || 'N/A'}</span></td>
                <td>${this.formatDate(order.fecha_ingreso)}</td>
                <td>Bs. ${this.formatCurrency(order.total_estimado)}</td>
                <td>
                    <button class="btn btn-sm btn-info" data-action="view" data-id="${order.id}">Ver</button>
                    <button class="btn btn-sm btn-warning" data-action="edit" data-id="${order.id}">Editar</button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Renderiza el modal para crear/editar una orden.
     * @param {Object} order - Orden a editar (null para nueva).
     * @param {Object} formData - Datos para los dropdowns (clientes, autos, tecnicos, servicios).
     */
    renderOrderModal(order = null, formData = {}) {
        const { clientes = [], autos = [], tecnicos = [], servicios = [], estados = [] } = formData;
        
        const modalHTML = `
            <div class="modal" id="orderModal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h3>${order ? 'Editar Orden' : 'Nueva Orden de Trabajo'}</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="orderForm">
                            <div class="form-section">
                                <h4>Información del Cliente y Vehículo</h4>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="clienteId">Cliente*</label>
                                        <select id="clienteId" required>
                                            <option value="">Seleccione un cliente...</option>
                                            ${clientes.map(c => `
                                                <option value="${c.id}" ${order?.cliente_id === c.id ? 'selected' : ''}>
                                                    ${c.nombre} ${c.apellido_p || ''} - ${c.correo || c.celular || ''}
                                                </option>
                                            `).join('')}
                                        </select>
                                        <small class="form-hint">Seleccione el cliente propietario del vehículo</small>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="autoId">Vehículo*</label>
                                        <select id="autoId" required ${!order ? 'disabled' : ''}>
                                            <option value="">Primero seleccione un cliente...</option>
                                            ${autos.map(a => `
                                                <option value="${a.id}" data-cliente="${a.cliente_id}" ${order?.auto_id === a.id ? 'selected' : ''}>
                                                    ${a.placa} - ${a.marca} ${a.modelo} (${a.anio || 'N/A'})
                                                </option>
                                            `).join('')}
                                        </select>
                                        <small class="form-hint">Vehículo a reparar</small>
                                    </div>
                                </div>
                            </div>

                            <div class="form-section">
                                <h4>Asignación y Estado</h4>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="tecnicoId">Técnico Asignado*</label>
                                        <select id="tecnicoId" required>
                                            <option value="">Seleccione un técnico...</option>
                                            ${tecnicos.map(t => `
                                                <option value="${t.id}" ${order?.tecnico_id === t.id ? 'selected' : ''}>
                                                    ${t.nombre} ${t.apellido_p || ''} ${t.apellido_m || ''}
                                                </option>
                                            `).join('')}
                                        </select>
                                        <small class="form-hint">Mecánico responsable de la reparación</small>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="estadoId">Estado*</label>
                                        <select id="estadoId" required>
                                            ${estados.length > 0 ? estados.map(e => `
                                                <option value="${e.id}" ${order?.estado_id === e.id ? 'selected' : ''}>
                                                    ${e.nombre_estado}
                                                </option>
                                            `).join('') : `
                                                <option value="1" ${!order || order?.estado_id === 1 ? 'selected' : ''}>Pendiente</option>
                                                <option value="2" ${order?.estado_id === 2 ? 'selected' : ''}>En Proceso</option>
                                                <option value="3" ${order?.estado_id === 3 ? 'selected' : ''}>Finalizado</option>
                                            `}
                                        </select>
                                        <small class="form-hint">Estado actual de la orden</small>
                                    </div>
                                </div>
                            </div>

                            <div class="form-section">
                                <h4>Detalles del Trabajo</h4>
                                <div class="form-group full-width">
                                    <label for="problemaReportado">Problema Reportado*</label>
                                    <textarea id="problemaReportado" rows="4" required placeholder="Describa el problema reportado por el cliente...">${order?.problema_reportado || ''}</textarea>
                                    <small class="form-hint">Descripción detallada del problema</small>
                                </div>

                                <div class="form-group full-width">
                                    <label for="diagnostico">Diagnóstico</label>
                                    <textarea id="diagnostico" rows="3" placeholder="Diagnóstico técnico (opcional)...">${order?.diagnostico || ''}</textarea>
                                    <small class="form-hint">Diagnóstico realizado por el técnico</small>
                                </div>
                            </div>

                            ${!order ? `
                            <div class="form-section">
                                <h4>Servicios Iniciales (Opcional)</h4>
                                <div class="form-group full-width">
                                    <label for="serviciosIniciales">Servicios a Realizar</label>
                                    <select id="serviciosIniciales" multiple size="5">
                                        ${servicios.map(s => `
                                            <option value="${s.id}">
                                                ${s.nombre_servicio} - Bs. ${this.formatCurrency(s.precio_base || 0)}
                                            </option>
                                        `).join('')}
                                    </select>
                                    <small class="form-hint">Mantenga presionado Ctrl para seleccionar múltiples servicios</small>
                                </div>
                            </div>
                            ` : ''}

                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary cancel-modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary">
                                    ${order ? 'Actualizar Orden' : 'Crear Orden'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Agregar event listener para filtrar autos por cliente
        this.setupClienteAutoFilter();
    }

    /**
     * Configura el filtro de autos según el cliente seleccionado.
     */
    setupClienteAutoFilter() {
        const clienteSelect = document.getElementById('clienteId');
        const autoSelect = document.getElementById('autoId');
        
        if (!clienteSelect || !autoSelect) return;
        
        clienteSelect.addEventListener('change', (e) => {
            const clienteId = e.target.value;
            const allOptions = autoSelect.querySelectorAll('option');
            
            if (!clienteId) {
                autoSelect.disabled = true;
                autoSelect.value = '';
                allOptions.forEach(opt => {
                    if (opt.value) opt.style.display = 'none';
                });
                allOptions[0].textContent = 'Primero seleccione un cliente...';
            } else {
                autoSelect.disabled = false;
                let hasVehicles = false;
                
                allOptions.forEach(opt => {
                    if (!opt.value) {
                        opt.textContent = 'Seleccione un vehículo...';
                        opt.style.display = 'block';
                    } else if (opt.dataset.cliente === clienteId) {
                        opt.style.display = 'block';
                        hasVehicles = true;
                    } else {
                        opt.style.display = 'none';
                    }
                });
                
                if (!hasVehicles) {
                    allOptions[0].textContent = 'Este cliente no tiene vehículos registrados';
                }
            }
        });
    }

    /**
     * Cierra y elimina el modal.
     */
    closeModal() {
        const modal = document.getElementById('orderModal');
        if (modal) modal.remove();
    }

    /**
     * Muestra un mensaje de error.
     * @param {string} message - Mensaje de error.
     */
    showError(message) {
        alert('Error: ' + message);
    }

    /**
     * Muestra un mensaje de éxito.
     * @param {string} message - Mensaje de éxito.
     */
    showSuccess(message) {
        alert('Éxito: ' + message);
    }

    /**
     * Obtiene la clase CSS según el estado.
     * @param {string} estado - Nombre del estado.
     * @returns {string} Clase CSS.
     */
    getStatusClass(estado) {
        const statusMap = {
            'Pendiente': 'warning',
            'En Proceso': 'info',
            'Finalizado': 'success',
            'Entregado': 'success'
        };
        return statusMap[estado] || 'secondary';
    }

    /**
     * Formatea una fecha.
     * @param {string} dateString - Fecha en formato ISO.
     * @returns {string} Fecha formateada.
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-BO');
    }

    /**
     * Formatea un valor monetario.
     * @param {number} amount - Monto.
     * @returns {string} Monto formateado.
     */
    formatCurrency(amount) {
        return (amount || 0).toFixed(2);
    }

    /**
     * Vincula el evento de crear nueva orden.
     * @param {Function} handler - Función manejadora.
     */
    bindNewOrder(handler) {
        this.contentArea.addEventListener('click', (e) => {
            if (e.target.id === 'newOrderBtn') {
                handler();
            }
        });
    }

    /**
     * Vincula el evento de envío del formulario.
     * @param {Function} handler - Función manejadora.
     */
    bindSubmitOrder(handler) {
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'orderForm') {
                e.preventDefault();
                
                const autoId = document.getElementById('autoId').value;
                const tecnicoId = document.getElementById('tecnicoId').value;
                const estadoId = document.getElementById('estadoId').value;
                const problemaReportado = document.getElementById('problemaReportado').value;
                const diagnostico = document.getElementById('diagnostico')?.value || '';
                
                // Validar campos obligatorios
                if (!autoId || !tecnicoId || !estadoId || !problemaReportado) {
                    alert('Por favor complete todos los campos obligatorios');
                    return;
                }
                
                const formData = {
                    auto_id: parseInt(autoId),
                    tecnico_id: parseInt(tecnicoId),
                    estado_id: parseInt(estadoId),
                    problema_reportado: problemaReportado
                };
                
                // Agregar diagnóstico si existe
                if (diagnostico) {
                    formData.diagnostico = diagnostico;
                }
                
                // Capturar servicios iniciales si existen
                const serviciosSelect = document.getElementById('serviciosIniciales');
                if (serviciosSelect) {
                    const selectedOptions = Array.from(serviciosSelect.selectedOptions);
                    if (selectedOptions.length > 0) {
                        formData.servicios_iniciales = selectedOptions.map(opt => parseInt(opt.value));
                    }
                }
                
                handler(formData);
            }
        });
    }

    /**
     * Vincula el evento de cerrar modal.
     */
    bindCloseModal() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal') || 
                e.target.classList.contains('cancel-modal')) {
                this.closeModal();
            }
        });
    }

    /**
     * Vincula eventos de acciones en la tabla.
     * @param {Function} handler - Función manejadora.
     */
    bindOrderActions(handler) {
        this.contentArea.addEventListener('click', (e) => {
            if (e.target.dataset.action) {
                const action = e.target.dataset.action;
                const id = e.target.dataset.id;
                handler(action, id);
            }
        });
    }

    /**
     * Vincula el evento de búsqueda.
     * @param {Function} handler - Función manejadora.
     */
    bindSearch(handler) {
        this.contentArea.addEventListener('input', (e) => {
            if (e.target.id === 'searchOrders') {
                handler(e.target.value);
            }
        });
    }

    /**
     * Vincula el evento de filtro por estado.
     * @param {Function} handler - Función manejadora.
     */
    bindFilterEstado(handler) {
        this.contentArea.addEventListener('change', (e) => {
            if (e.target.id === 'filterEstado') {
                handler(e.target.value);
            }
        });
    }

    /**
     * Vincula eventos de paginación.
     * @param {Function} handler - Función manejadora.
     */
    bindPagination(handler) {
        this.contentArea.addEventListener('click', (e) => {
            if (e.target.id === 'prevPage' || e.target.id === 'nextPage') {
                const direction = e.target.id === 'nextPage' ? 1 : -1;
                handler(direction);
            }
        });
    }
}
