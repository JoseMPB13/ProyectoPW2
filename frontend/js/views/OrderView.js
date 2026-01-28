/**
 * Vista de Órdenes - Versión Mejorada
 * Gestión completa de órdenes de trabajo con búsqueda, filtros y modales.
 */
export default class OrderView {
    constructor() {
        this.contentArea = document.getElementById('contentArea');
        this.currentOrders = [];
        this.filteredOrders = [];
        // Handlers
        this.onAction = null;
        this.onNewOrder = null;
        this.onPageChange = null;
        this.onFilter = null;
        this.onSearch = null;
        this.onSubmitEdit = null;
        this.onSubmitNewOrder = null;
    }

    /**
     * Renderiza la vista principal de órdenes.
     */
    render(orders = [], pagination = {}) {
        this.currentOrders = orders;
        this.filteredOrders = orders;
        
        this.contentArea.innerHTML = `
            <div class="orders-view">
                <!-- Header -->
                <div class="view-header">
                    <div>
                        <h2>Gestión de Órdenes de Trabajo</h2>
                        <p class="text-secondary">Administra y da seguimiento a las órdenes de servicio</p>
                    </div>
                    <button id="newOrderBtn" class="btn-primary">
                        <span>+</span> Nueva Orden
                    </button>
                </div>

                <!-- Filters Bar -->
                <div class="filters-bar">
                    <div class="search-box">
                        <input 
                            type="text" 
                            id="searchOrders" 
                            placeholder="🔍 Buscar por placa, cliente o técnico..." 
                            class="search-input"
                        >
                    </div>
                    <div class="filter-group">
                        <select id="filterEstado" class="filter-select">
                            <option value="">Todos los estados</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Finalizado">Finalizado</option>
                            <option value="Entregado">Entregado</option>
                        </select>
                        <button id="clearFilters" class="btn-secondary">Limpiar</button>
                    </div>
                </div>

                <!-- Orders Grid -->
                <div class="orders-grid" id="ordersGrid">
                    ${this.renderOrderCards(orders)}
                </div>

                <!-- Pagination -->
                ${this.renderPagination(pagination)}
            </div>
        `;

        // Attach events to the newly created view root
        const viewRoot = this.contentArea.querySelector('.orders-view');
        if (viewRoot) {
            this.attachViewEvents(viewRoot);
        }
    }

    /**
     * Adjunta eventos a la raíz de la vista usando delegación.
     */
    attachViewEvents(viewRoot) {
        console.log('OrderView: Attaching view events to', viewRoot);
        // Delegación de clicks (Acciones, Nueva Orden, Paginación, Limpiar Filtros)
        viewRoot.addEventListener('click', (e) => {
            console.log('OrderView: Click detected on', e.target);
            // 1. Botones de acción (Ver, Editar, etc.)
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                console.log('OrderView: Action button clicked', actionBtn.dataset.action);
                const action = actionBtn.dataset.action;
                const id = actionBtn.dataset.id;
                if (this.onAction) {
                     this.onAction(action, id);
                } else {
                     console.error('OrderView: No onAction handler bound');
                }
                return;
            }

            // 2. Nueva Orden
            const newOrderBtn = e.target.closest('#newOrderBtn');
            if (newOrderBtn) {
                console.log('OrderView: New Order button clicked');
                if (this.onNewOrder) {
                    this.onNewOrder();
                } else {
                    console.error('OrderView: No onNewOrder handler bound');
                }
                return;
            }
            // ... (rest of the code)

            // 3. Paginación
            const prevBtn = e.target.closest('#prevPage');
            if (prevBtn && !prevBtn.disabled) {
                if (this.onPageChange) this.onPageChange('prev');
                return;
            }

            const nextBtn = e.target.closest('#nextPage');
            if (nextBtn && !nextBtn.disabled) {
                if (this.onPageChange) this.onPageChange('next');
                return;
            }

            // 4. Limpiar Filtros
            const clearBtn = e.target.closest('#clearFilters');
            if (clearBtn) {
                this.clearFilters();
                return;
            }
        });

        // Eventos de input/change (Búsqueda, Filtro Estado)
        const searchInput = viewRoot.querySelector('#searchOrders');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
                // También notificar al controlador si es necesario, pero aquí manejamos el filtro localmente primero
                if (this.onSearch) this.onSearch(e.target.value);
            });
        }

        const filterEstado = viewRoot.querySelector('#filterEstado');
        if (filterEstado) {
            filterEstado.addEventListener('change', (e) => {
                this.handleFilter(e.target.value);
                if (this.onFilter) this.onFilter(e.target.value);
            });
        }
    }

    // ... (renderOrderCards, renderPagination methods remain unchanged)

    /**
     * Métodos Binding
     */
    bindAction(handler) {
        this.onAction = handler;
    }

    bindNewOrder(handler) {
        this.onNewOrder = handler;
    }

    bindPagination(handler) {
        this.onPageChange = handler;
    }

    bindFilter(handler) {
        this.onFilter = handler;
    }

    bindSearch(handler) {
        this.onSearch = handler;
    }

    // ... existing bindSubmitEdit, bindSubmitNewOrder ...

    /**
     * Limpia todos los filtros.
     */
    clearFilters() {
        const searchInput = document.getElementById('searchOrders');
        const filterSelect = document.getElementById('filterEstado');
        
        if (searchInput) searchInput.value = '';
        if (filterSelect) filterSelect.value = '';
        
        this.filteredOrders = this.currentOrders;
        this.updateOrdersGrid();
        
        // Notificar reset si el controlador necesita recargar datos originales
        if (this.onSearch) this.onSearch('');
    }

    // ... existing updateOrdersGrid ...


    /**
     * Renderiza las tarjetas de órdenes.
     */
    renderOrderCards(orders) {
        if (!orders || orders.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>No hay órdenes registradas</h3>
                    <p>Crea una nueva orden para comenzar</p>
                    <button class="btn-primary" onclick="document.getElementById('newOrderBtn').click()">
                        + Nueva Orden
                    </button>
                </div>
            `;
        }

        return orders.map(order => `
            <div class="order-card" data-id="${order.id}">
                <div class="order-card-header">
                    <div class="order-id">#${order.id}</div>
                    <span class="badge badge-${this.getStatusClass(order.estado_nombre)}">
                        ${order.estado_nombre || 'Pendiente'}
                    </span>
                </div>
                
                <div class="order-card-body">
                    <div class="order-info">
                        <div class="info-row">
                            <span class="icon">🚗</span>
                            <div>
                                <strong>${order.placa || 'N/A'}</strong>
                                <p class="text-secondary">${order.marca || ''} ${order.modelo || ''}</p>
                            </div>
                        </div>
                        
                        <div class="info-row">
                            <span class="icon">👤</span>
                            <div>
                                <strong>${order.cliente_nombre || 'Sin cliente'}</strong>
                                <p class="text-secondary">Cliente</p>
                            </div>
                        </div>
                        
                        <div class="info-row">
                            <span class="icon">🔧</span>
                            <div>
                                <strong>${order.tecnico_nombre || 'Sin asignar'}</strong>
                                <p class="text-secondary">Técnico</p>
                            </div>
                        </div>
                        
                        <div class="info-row">
                            <span class="icon">📅</span>
                            <div>
                                <strong>${this.formatDate(order.fecha_ingreso)}</strong>
                                <p class="text-secondary">Fecha de ingreso</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-total">
                        <span class="total-label">Total Estimado</span>
                        <span class="total-amount">Bs. ${this.formatCurrency(order.total_estimado)}</span>
                    </div>
                </div>
                
                <div class="order-card-footer">
                    <button class="btn-outline" data-action="view" data-id="${order.id}">
                        👁️ Ver Detalles
                    </button>
                    <button class="btn-primary-sm" data-action="edit" data-id="${order.id}">
                        ✏️ Editar
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Renderiza la paginación.
     */
    renderPagination(pagination) {
        if (!pagination || pagination.pages <= 1) return '';

        return `
            <div class="pagination">
                <button 
                    id="prevPage" 
                    class="btn-secondary" 
                    ${pagination.current_page <= 1 ? 'disabled' : ''}
                >
                    ← Anterior
                </button>
                <span class="page-info">
                    Página ${pagination.current_page || 1} de ${pagination.pages || 1}
                </span>
                <button 
                    id="nextPage" 
                    class="btn-secondary"
                    ${pagination.current_page >= pagination.pages ? 'disabled' : ''}
                >
                    Siguiente →
                </button>
            </div>
        `;
    }

    /**
     * Muestra el modal con los detalles completos de la orden.
     */
    showOrderDetails(order) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay open';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>Detalles de la Orden #${order.id}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                
                <div class="modal-body">
                    <!-- Estado y Fechas -->
                    <div class="detail-section">
                        <h4>Estado y Fechas</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Estado:</label>
                                <span class="badge badge-${this.getStatusClass(order.estado_nombre)}">
                                    ${order.estado_nombre || 'Pendiente'}
                                </span>
                            </div>
                            <div class="detail-item">
                                <label>Fecha de Ingreso:</label>
                                <span>${this.formatDate(order.fecha_ingreso)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Fecha Estimada:</label>
                                <span>${this.formatDate(order.fecha_estimada_salida) || 'No definida'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Fecha de Salida:</label>
                                <span>${this.formatDate(order.fecha_salida) || 'Pendiente'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Vehículo -->
                    <div class="detail-section">
                        <h4>Información del Vehículo</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Placa:</label>
                                <span>${order.placa || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Marca:</label>
                                <span>${order.marca || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Modelo:</label>
                                <span>${order.modelo || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Año:</label>
                                <span>${order.anio || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Cliente y Técnico -->
                    <div class="detail-section">
                        <h4>Cliente y Técnico</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Cliente:</label>
                                <span>${order.cliente_nombre || 'Sin cliente'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Técnico Asignado:</label>
                                <span>${order.tecnico_nombre || 'Sin asignar'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Problema y Diagnóstico -->
                    <div class="detail-section">
                        <h4>Problema y Diagnóstico</h4>
                        <div class="detail-item full-width">
                            <label>Problema Reportado:</label>
                            <p class="detail-text">${order.problema_reportado || 'No especificado'}</p>
                        </div>
                        <div class="detail-item full-width">
                            <label>Diagnóstico:</label>
                            <p class="detail-text">${order.diagnostico || 'Pendiente de diagnóstico'}</p>
                        </div>
                    </div>

                    <!-- Servicios -->
                    ${this.renderServicesSection(order.servicios)}

                    <!-- Repuestos -->
                    ${this.renderPartsSection(order.repuestos)}

                    <!-- Totales -->
                    <div class="detail-section totals-section">
                        <h4>Resumen de Costos</h4>
                        <div class="totals-grid">
                            <div class="total-row">
                                <span>Total Estimado:</span>
                                <strong>Bs. ${this.formatCurrency(order.total_estimado)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary modal-close">Cerrar</button>
                    <button class="btn-primary" data-action="edit" data-id="${order.id}">
                        ✏️ Editar Orden
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.attachModalEvents(modal);
    }

    /**
     * Renderiza la sección de servicios en el modal de detalles.
     */
    renderServicesSection(servicios) {
        if (!servicios || servicios.length === 0) {
            return `
                <div class="detail-section">
                    <h4>Servicios</h4>
                    <p class="text-secondary">No hay servicios registrados</p>
                </div>
            `;
        }

        return `
            <div class="detail-section">
                <h4>Servicios (${servicios.length})</h4>
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>Servicio</th>
                            <th>Precio</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${servicios.map(s => `
                            <tr>
                                <td>${s.nombre || 'Servicio'}</td>
                                <td>Bs. ${this.formatCurrency(s.precio_aplicado || s.precio)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Renderiza la sección de repuestos en el modal de detalles.
     */
    renderPartsSection(repuestos) {
        if (!repuestos || repuestos.length === 0) {
            return `
                <div class="detail-section">
                    <h4>Repuestos</h4>
                    <p class="text-secondary">No hay repuestos registrados</p>
                </div>
            `;
        }

        return `
            <div class="detail-section">
                <h4>Repuestos (${repuestos.length})</h4>
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>Repuesto</th>
                            <th>Cantidad</th>
                            <th>Precio Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${repuestos.map(r => {
                            const cantidad = r.cantidad || 1;
                            const precio = r.precio_unitario_aplicado || r.precio_venta || 0;
                            const subtotal = cantidad * precio;
                            return `
                                <tr>
                                    <td>${r.nombre || 'Repuesto'}</td>
                                    <td>${cantidad}</td>
                                    <td>Bs. ${this.formatCurrency(precio)}</td>
                                    <td>Bs. ${this.formatCurrency(subtotal)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Muestra el modal para editar una orden.
     */
    showEditModal(order, formData) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay open';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>Editar Orden #${order.id}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                
                <form id="editOrderForm" class="modal-body">
                    <div class="form-grid">
                        <!-- Técnico Asignado -->
                        <div class="form-group">
                            <label for="editTecnico">Técnico Asignado *</label>
                            <select id="editTecnico" name="tecnico_id" class="form-control" required>
                                <option value="">Seleccionar técnico...</option>
                                ${(formData.tecnicos || []).map(t => `
                                    <option value="${t.id}" ${t.id == order.tecnico_id ? 'selected' : ''}>
                                        ${t.nombre} ${t.apellido_p || ''}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Estado -->
                        <div class="form-group">
                            <label for="editEstado">Estado *</label>
                            <select id="editEstado" name="estado_id" class="form-control" required>
                                ${(formData.estados || []).map(e => `
                                    <option value="${e.id}" ${e.id == order.estado_id ? 'selected' : ''}>
                                        ${e.nombre_estado}
                                    </option>
                                `).join('')}
                            </select>
                        </div>


                        <!-- Fechas -->
                        <div class="form-group">
                            <label for="editFechaIngreso">Fecha de Ingreso</label>
                            <input 
                                type="datetime-local" 
                                id="editFechaIngreso" 
                                name="fecha_ingreso" 
                                class="form-control"
                                value="${order.fecha_ingreso ? order.fecha_ingreso.slice(0, 16) : ''}"
                            >
                        </div>

                        <div class="form-group">
                            <label for="editFechaEntrega">Fecha de Entrega/Salida</label>
                            <input 
                                type="datetime-local" 
                                id="editFechaEntrega" 
                                name="fecha_entrega" 
                                class="form-control"
                                value="${order.fecha_entrega ? order.fecha_entrega.slice(0, 16) : ''}"
                            >
                        </div>

                        <!-- Total Estimado -->
                        <div class="form-group">
                            <label for="editTotal">Total Estimado</label>
                            <input 
                                type="number" 
                                id="editTotal" 
                                name="total_estimado" 
                                class="form-control"
                                step="0.01"
                                value="${order.total_estimado || 0}"
                            >
                        </div>
                    </div>

                    <!-- Problema Reportado -->
                    <div class="form-section" style="margin-top: 20px;">
                        <div class="form-group full-width">
                            <label for="editProblema">Problema Reportado</label>
                            <textarea 
                                id="editProblema" 
                                name="problema_reportado" 
                                class="form-control" 
                                rows="3"
                                style="width: 100%;"
                            >${order.problema_reportado || ''}</textarea>
                        </div>
                    </div>

                    <!-- Diagnóstico -->
                    <div class="form-section" style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 15px;">
                        <div class="form-group full-width">
                            <label for="editDiagnostico">Diagnóstico y Observaciones</label>
                            <textarea 
                                id="editDiagnostico" 
                                name="diagnostico" 
                                class="form-control" 
                                rows="4"
                                placeholder="Ingrese el diagnóstico técnico del vehículo..."
                                style="width: 100%; min-height: 100px;"
                            >${order.diagnostico || ''}</textarea>
                        </div>
                    </div>
                </form>
                
                <div class="modal-footer">
                    <button type="button" class="btn-secondary modal-close">Cancelar</button>
                    <button type="submit" form="editOrderForm" class="btn-primary">
                        💾 Guardar Cambios
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.attachModalEvents(modal);
        this.attachFormEvents(modal, order.id);
    }



    /**
     * Maneja la búsqueda en tiempo real.
     */
    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredOrders = this.currentOrders;
        } else {
            this.filteredOrders = this.currentOrders.filter(order => {
                const placa = (order.placa || '').toLowerCase();
                const cliente = (order.cliente_nombre || '').toLowerCase();
                const tecnico = (order.tecnico_nombre || '').toLowerCase();
                const marca = (order.marca || '').toLowerCase();
                const modelo = (order.modelo || '').toLowerCase();
                
                return placa.includes(searchTerm) ||
                       cliente.includes(searchTerm) ||
                       tecnico.includes(searchTerm) ||
                       marca.includes(searchTerm) ||
                       modelo.includes(searchTerm);
            });
        }
        
        this.updateOrdersGrid();
    }

    /**
     * Maneja el filtro por estado.
     */
    handleFilter(estado) {
        if (!estado) {
            this.filteredOrders = this.currentOrders;
        } else {
            this.filteredOrders = this.currentOrders.filter(order => 
                order.estado_nombre === estado
            );
        }
        
        this.updateOrdersGrid();
    }

    /**
     * Limpia todos los filtros.
     */
    clearFilters() {
        document.getElementById('searchOrders').value = '';
        document.getElementById('filterEstado').value = '';
        this.filteredOrders = this.currentOrders;
        this.updateOrdersGrid();
    }

    /**
     * Actualiza la grilla de órdenes sin recargar toda la página.
     */
    updateOrdersGrid() {
        const grid = document.getElementById('ordersGrid');
        if (grid) {
            grid.innerHTML = this.renderOrderCards(this.filteredOrders);
        }
    }

    /**
     * Maneja las acciones de los botones.
     */
    handleAction(action, id) {
        // Este método será llamado por el controlador
        if (this.onAction) {
            this.onAction(action, id);
        }
    }

    /**
     * Adjunta eventos al modal.
     */
    attachModalEvents(modal) {
        // Cerrar modal
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });

        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Botón de editar en el modal de detalles
        const editBtn = modal.querySelector('[data-action="edit"]');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                modal.remove();
                this.handleAction('edit', id);
            });
        }
    }

    /**
     * Adjunta eventos al formulario de edición.
     */
    attachFormEvents(modal, orderId) {
        const form = modal.querySelector('#editOrderForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const formData = {
                    tecnico_id: form.tecnico_id.value,
                    estado_id: form.estado_id.value,
                    diagnostico: form.diagnostico.value,
                    problema_reportado: form.problema_reportado.value,
                    fecha_ingreso: form.fecha_ingreso.value || null,
                    fecha_entrega: form.fecha_entrega.value || null,
                    total_estimado: form.total_estimado.value ? parseFloat(form.total_estimado.value) : 0
                };

                if (this.onSubmitEdit) {
                    this.onSubmitEdit(orderId, formData);
                }

                modal.remove();
            });
        }
    }

    /**
     * Métodos de utilidad.
     */
    getStatusClass(status) {
        const statusMap = {
            'Pendiente': 'warning',
            'En Proceso': 'info',
            'Finalizado': 'success',
            'Entregado': 'success',
            'Cancelado': 'danger'
        };
        return statusMap[status] || 'secondary';
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-BO', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    formatCurrency(amount) {
        if (!amount) return '0.00';
        return parseFloat(amount).toFixed(2);
    }

    /**
     * Métodos para vincular con el controlador.
     */
    bindAction(handler) {
        this.onAction = handler;
    }

    bindSubmitEdit(handler) {
        this.onSubmitEdit = handler;
    }

    bindSubmitNewOrder(handler) {
        this.onSubmitNewOrder = handler;
    }

    /**
     * Muestra el modal para crear una nueva orden.
     */
    showNewOrderModal(data) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay open';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>Nueva Orden de Trabajo</h3>
                    <button class="modal-close">&times;</button>
                </div>
                
                <form id="newOrderForm" class="modal-body">
                    <div class="form-grid">
                        <!-- Selección de Cliente -->
                        <div class="form-group">
                            <label for="newOrderClient">Cliente *</label>
                            <select id="newOrderClient" name="client_id" class="form-control" required>
                                <option value="">Seleccionar cliente...</option>
                                ${(data.clients || []).map(c => `
                                    <option value="${c.id}">${c.nombre} ${c.apellido || ''}</option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Selección de Vehículo (Dependiente) -->
                        <div class="form-group">
                            <label for="newOrderAuto">Vehículo *</label>
                            <select id="newOrderAuto" name="auto_id" class="form-control" disabled required>
                                <option value="">Seleccione un cliente primero</option>
                            </select>
                        </div>

                        <!-- Técnico Asignado -->
                        <div class="form-group">
                            <label for="newOrderTecnico">Técnico Asignado *</label>
                            <select id="newOrderTecnico" name="tecnico_id" class="form-control" required>
                                <option value="">Seleccionar técnico...</option>
                                ${(data.tecnicos || []).map(t => `
                                    <option value="${t.id}">
                                        ${t.nombre} ${t.apellido_p || ''}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Estado Inicial -->
                        <div class="form-group">
                            <label for="newOrderEstado">Estado Inicial *</label>
                            <select id="newOrderEstado" name="estado_id" class="form-control" required>
                                ${(data.estados || []).map(e => `
                                    <option value="${e.id}">${e.nombre_estado}</option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Fecha Estimada -->
                        <div class="form-group">
                            <label for="newOrderFechaEntrega">Fecha Estimada de Entrega</label>
                            <input type="date" id="newOrderFechaEntrega" name="fecha_entrega" class="form-control">
                        </div>

                        <!-- Total Estimado -->
                        <div class="form-group">
                            <label for="newOrderTotal">Total Estimado (Ref.)</label>
                            <input type="number" id="newOrderTotal" name="total_estimado" class="form-control" step="0.01" placeholder="0.00">
                        </div>
                    </div>

                    <!-- Problema -->
                    <div class="form-section" style="margin-top: 20px;">
                        <div class="form-group full-width">
                            <label for="newOrderProblema">Problema Reportado *</label>
                            <textarea 
                                id="newOrderProblema" 
                                name="problema_reportado" 
                                class="form-control" 
                                rows="4"
                                placeholder="Describa detalladamente el problema reportado por el cliente..."
                                required
                                style="width: 100%; min-height: 100px;"
                            ></textarea>
                        </div>
                    </div>
                </form>
                
                <div class="modal-footer">
                    <button type="button" class="btn-secondary modal-close">Cancelar</button>
                    <button type="submit" form="newOrderForm" class="btn-primary">
                        💾 Crear Orden
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.attachModalEvents(modal);
        this.attachNewOrderFormLogic(modal, data.vehicles);
    }

    /**
     * Adjunta la lógica dinámica al formulario de nueva orden.
     */
    attachNewOrderFormLogic(modal, vehicles) {
        const form = modal.querySelector('#newOrderForm');
        const clientSelect = form.querySelector('#newOrderClient');
        const autoSelect = form.querySelector('#newOrderAuto');

        // Manejar cambio de cliente
        clientSelect.addEventListener('change', (e) => {
            const clientId = e.target.value;
            
            // Resetear select de autos
            autoSelect.innerHTML = '<option value="">Seleccionar vehículo...</option>';
            autoSelect.disabled = !clientId;

            if (clientId) {
                // Filtrar vehículos del cliente
                // Nota: Asumimos que data.vehicles tiene client_id o cliente_id.
                // Revisando VehicleModel/Backend: suelen tener 'cliente_id' o 'client_id'.
                // Si vehicles viene de VehicleModel.getAll(), tiene 'cliente_id'.
                const clientVehicles = vehicles.filter(v => v.cliente_id == clientId || v.client_id == clientId);
                
                if (clientVehicles.length > 0) {
                    clientVehicles.forEach(v => {
                        const option = document.createElement('option');
                        option.value = v.id;
                        option.textContent = `${v.placa} - ${v.marca} ${v.modelo}`;
                        autoSelect.appendChild(option);
                    });
                } else {
                    const option = document.createElement('option');
                    option.value = "";
                    option.textContent = "Este cliente no tiene vehículos registrados";
                    autoSelect.appendChild(option);
                }
            } else {
                 autoSelect.innerHTML = '<option value="">Seleccione un cliente primero</option>';
            }
        });

        // Manejar envío
         form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                auto_id: form.auto_id.value,
                tecnico_id: form.tecnico_id.value,
                problema_reportado: form.problema_reportado.value,
                estado_id: form.estado_id.value || 1,
                fecha_entrega: form.fecha_entrega.value || null,
                total_estimado: form.total_estimado.value ? parseFloat(form.total_estimado.value) : 0
            };

            if (this.onSubmitNewOrder) {
                this.onSubmitNewOrder(formData);
            }

            modal.remove();
        });
    }
}
