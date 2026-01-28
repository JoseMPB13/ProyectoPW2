/**
 * Vista de Clientes
 * Layout de dos columnas: Lista y Detalle.
 */
export default class ClientView {
    constructor() {
        this.appContent = document.getElementById('contentArea');
        this.onSelectClient = null;
    }

    /**
     * Renderiza el layout principal de clientes.
     */
    render(clients) {
        this.allClients = clients || [];
        this.appContent.innerHTML = `
            <div class="card fade-in">
                <!-- Header -->
                <div class="card-header d-flex justify-content-between align-items-center mb-4 border-bottom pb-3" style="background: transparent;">
                    <div>
                        <h2 class="h3 mb-1" style="font-family: 'Inter', sans-serif; font-weight: 700; color: #1e293b;">Gestión de Clientes</h2>
                        <p class="text-secondary small mb-0">Administra la información de tus clientes y sus vehículos</p>
                    </div>
                    <div class="d-flex gap-3 align-items-center">
                         <div class="search-wrapper position-relative">
                            <i class="fas fa-search position-absolute text-muted" style="left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.9rem;"></i>
                            <input 
                                type="text" 
                                id="clientSearchInput" 
                                placeholder="Buscar cliente..." 
                                class="form-control pl-5"
                                style="padding-left: 35px; border-radius: 8px; border: 1px solid #e2e8f0;"
                            >
                        </div>
                        <button id="newClientBtn" class="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm" style="border-radius: 8px;">
                            <i class="fas fa-plus"></i>
                            <span>Nuevo Cliente</span>
                        </button>
                    </div>
                </div>

                <!-- Clients Table -->
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0" style="width: 100%;">
                        <thead style="background-color: #F8FAFC; border-bottom: 2px solid #e2e8f0;">
                            <tr>
                                <th class="py-3 px-4 text-uppercase text-secondary text-xs font-weight-bold tracking-wide border-0">Cliente</th>
                                <th class="py-3 px-4 text-uppercase text-secondary text-xs font-weight-bold tracking-wide border-0">CI / Identificación</th>
                                <th class="py-3 px-4 text-uppercase text-secondary text-xs font-weight-bold tracking-wide border-0">Contacto</th>
                                <th class="py-3 px-4 text-uppercase text-secondary text-xs font-weight-bold tracking-wide border-0 text-center">Vehículos</th>
                                <th class="py-3 px-4 text-uppercase text-secondary text-xs font-weight-bold tracking-wide border-0 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="clientTableBody">
                            ${this._generateTableRows(clients)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.bindListEvents();
        this.bindListEvents();
        // this.bindSearchEvent(); // Removed internal binding calls from render if they are to be called by controller, 
        // but wait, render calls it internally. I should probably leave the call in render but rename it or separate it.
        // Actually, the controller `init` calls `bindSearch` usually.
        // Let's look at `ClientController.init`. It calls `view.bind...` methods.
        // But `ClientView.render` was calling `bindSearchEvent` internally.
        // I will REMOVE `this.bindSearchEvent()` from `render` and let Controller call `bindSearch`.

        
        document.getElementById('newClientBtn').addEventListener('click', () => this.showCreateModal());
    }

    bindSearch(handler) {
        const searchInput = document.getElementById('clientSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                handler(e.target.value);
            });
        }
    }
    
    showCreateModal(clientToEdit = null) {
        const isEdit = !!clientToEdit;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay open';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="createClientForm">
                        ${isEdit ? `<input type="hidden" name="id" value="${clientToEdit.id}">` : ''}
                        <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-family: 'Inter', sans-serif;">Nombre *</label>
                                <input type="text" name="first_name" class="form-control" value="${isEdit ? clientToEdit.nombre || '' : ''}" required style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-family: 'Inter', sans-serif;">Apellido Paterno *</label>
                                <input type="text" name="last_name" class="form-control" value="${isEdit ? clientToEdit.apellido_p || '' : ''}" required style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-family: 'Inter', sans-serif;">Apellido Materno</label>
                                <input type="text" name="apellido_m" class="form-control" value="${isEdit ? clientToEdit.apellido_m || '' : ''}" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-family: 'Inter', sans-serif;">CI (Cédula) *</label>
                                <input type="text" name="ci" class="form-control" value="${isEdit ? clientToEdit.ci || '' : ''}" required style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-family: 'Inter', sans-serif;">Email</label>
                                <input type="email" name="email" class="form-control" value="${isEdit ? clientToEdit.correo || '' : ''}" style="width: 100%;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-family: 'Inter', sans-serif;">Celular</label>
                                <input type="text" name="phone" class="form-control" value="${isEdit ? clientToEdit.celular || '' : ''}" style="width: 100%;">
                            </div>
                            <div class="form-group full-width" style="grid-column: 1 / -1;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-family: 'Inter', sans-serif;">Dirección</label>
                                <input type="text" name="address" class="form-control" value="${isEdit ? clientToEdit.direccion || '' : ''}" style="width: 100%;">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" class="btn-secondary modal-close" style="margin-right: 0;">Cancelar</button>
                    <button type="submit" form="createClientForm" class="btn-primary">
                        <i class="fas fa-save mr-2"></i> ${isEdit ? 'Actualizar' : 'Guardar Cliente'}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close
        modal.querySelectorAll('.modal-close').forEach(b => b.onclick = () => modal.remove());

        // Submit
        modal.querySelector('#createClientForm').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            if (isEdit) {
                if (this.onUpdateClient) this.onUpdateClient(data.id, data);
            } else {
                if (this.onCreateClient) this.onCreateClient(data);
            }
            modal.remove();
        };
    }

    bindUpdateClient(handler) {
        this.onUpdateClient = handler;
    }

    bindCreateClient(handler) {
        this.onCreateClient = handler;
    }

    updateClientList(clients) {
        document.getElementById('clientTableBody').innerHTML = this._generateTableRows(clients);
        // Events are delegated in bindEvents, so no need to rebind per row
    }

    _generateTableRows(clients) {
        if (!clients || clients.length === 0) return '<tr><td colspan="5" class="text-center p-4 text-secondary">No hay clientes registrados.</td></tr>';
        
        return clients.map(c => {
             const vehicleCount = (c.autos && Array.isArray(c.autos)) ? c.autos.length : 0;
            return `
            <tr>
                <td class="py-3 px-4 border-bottom">
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle mr-3 bg-light text-primary font-weight-bold d-flex align-items-center justify-content-center rounded-circle" style="width: 36px; height: 36px;">
                             ${(c.nombre || '').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-weight-bold text-dark" style="font-size: 0.95rem;">${c.nombre} ${c.apellido_p}</div>
                            <div class="small text-secondary">ID: ${c.id}</div>
                        </div>
                    </div>
                </td>
                <td class="py-3 px-4 border-bottom text-dark font-weight-500">${c.ci || 'N/A'}</td>
                <td class="py-3 px-4 border-bottom">
                    <div class="d-flex flex-column">
                        ${c.correo ? `<div class="small text-dark mb-1"><i class="far fa-envelope text-secondary mr-1"></i>${c.correo}</div>` : ''}
                        ${c.celular ? `<div class="small text-dark"><i class="fas fa-phone-alt text-secondary mr-1"></i>${c.celular}</div>` : '<span class="text-muted">-</span>'}
                    </div>
                </td>
                <td class="py-3 px-4 border-bottom text-center">
                    <span class="badge badge-secondary rounded-pill px-3" style="background-color: #f1f5f9; color: #475569;">${vehicleCount} registrados</span>
                </td>
                 <td class="py-3 px-4 border-bottom text-center">
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary mr-1 btn-view" data-id="${c.id}" title="Ver Detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary mr-1 btn-edit" data-id="${c.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `}).join('');
    }

    /**
     * Renderiza el detalle del cliente en el panel derecho.
     */
    /**
     * Replaces the split-pane detail view with a Modal.
     * Called by Controller when a client is selected.
     */
    renderClientDetails(client) {
        const nombreCompleto = `${client.nombre} ${client.apellido_p} ${client.apellido_m || ''}`;
        const vehicleCount = (client.autos && Array.isArray(client.autos)) ? client.autos.length : 0;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay open';
        modal.id = 'clientDetailModal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; width: 90%;">
                <div class="modal-header border-bottom">
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle mr-3 bg-primary text-white font-weight-bold d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 20px;">
                             ${(client.nombre || '').charAt(0)}
                        </div>
                        <div>
                            <h3 class="m-0">${nombreCompleto}</h3>
                            <span class="text-secondary small">ID: ${client.id} | CI: ${client.ci || 'N/A'}</span>
                        </div>
                    </div>
                    <button class="modal-close">&times;</button>
                </div>

                <div class="modal-body p-0">
                    <div class="tabs px-4 border-bottom bg-light">
                        <div class="tabs-header d-flex gap-4">
                            <button class="tab-btn active py-3 bg-transparent border-0 font-weight-bold text-primary border-bottom-2 border-primary" data-tab="info" style="border-bottom: 2px solid var(--primary-color);">Información</button>
                            <button class="tab-btn py-3 bg-transparent border-0 text-secondary" data-tab="vehicles">Vehículos (${vehicleCount})</button>
                            <button class="tab-btn py-3 bg-transparent border-0 text-secondary" data-tab="history">Historial</button>
                        </div>
                    </div>

                    <div class="tabs-content p-4" style="min-height: 300px;">
                        <!-- INFO TAB -->
                        <div id="tab-info" class="tab-pane active">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="text-secondary small text-uppercase font-weight-bold">Email</label>
                                    <div class="text-dark font-weight-500">${client.correo || '-'}</div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="text-secondary small text-uppercase font-weight-bold">Celular</label>
                                    <div class="text-dark font-weight-500">${client.celular || '-'}</div>
                                </div>
                                <div class="col-md-12 mb-3">
                                    <label class="text-secondary small text-uppercase font-weight-bold">Dirección</label>
                                    <div class="text-dark font-weight-500">${client.direccion || '-'}</div>
                                </div>
                                <div class="col-md-6 mb-3">
                                   <label class="text-secondary small text-uppercase font-weight-bold">Cédula de Identidad</label>
                                    <div class="text-dark font-weight-500">${client.ci || '-'}</div>
                                </div>
                            </div>
                            <div class="mt-4 pt-4 border-top">
                                <button class="btn btn-primary" id="btnEditClientFromModal" data-id="${client.id}">
                                    <i class="fas fa-edit mr-2"></i> Editar Cliente
                                </button>
                            </div>
                        </div>

                        <!-- VEHICLES TAB -->
                        <div id="tab-vehicles" class="tab-pane hidden" style="display: none;">
                            ${this._renderVehicles(client.autos)}
                        </div>

                        <!-- HISTORY TAB -->
                        <div id="tab-history" class="tab-pane hidden" style="display: none;">
                            <div id="clientHistoryContainer">
                                <p class="text-center text-secondary py-4"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando historial...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any (though unlikely to overlap unless fast user)
        const existing = document.getElementById('clientDetailModal');
        if (existing) existing.remove();

        document.body.appendChild(modal);
        
        // Bind Events
        this.bindTabEvents(modal);
        modal.querySelector('.modal-close').onclick = () => modal.remove();

        const editBtn = modal.querySelector('#btnEditClientFromModal');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                modal.remove(); // Close detail modal to show edit modal
                if (this.onEditClient) this.onEditClient(client); // Or use showCreateModal direct? Better delegate.
                // Wait, typically onEditClient calls the edit logic. 
                // But in `render` I called `showCreateModal(client)`.
                // I'll call `showCreateModal` directly here as well to save round trip if controller relies on view.
                this.showCreateModal(client);
            });
        }
        
        this.bindVehicleEvents((action, id) => {
            if (this.onVehicleAction) this.onVehicleAction(action, client, id);
        }, modal); // Pass modal context to search inside it

    }

    bindVehicleAction(handler) {
        this.onVehicleAction = handler;
    }

    renderClientHistory(orders) {
        const container = document.getElementById('clientHistoryContainer');
        if (!container) return;

        if (!orders || orders.length === 0) {
            container.innerHTML = '<p class="p-4 text-center text-secondary">No hay órdenes registradas para este cliente.</p>';
            return;
        }

        container.innerHTML = `
            <div class="p-4">
                <table class="table w-100" style="border-collapse: separate; border-spacing: 0 8px;">
                    <thead>
                        <tr>
                            <th class="p-3 text-secondary text-center" style="width: 80px;">ID</th>
                            <th class="p-3 text-secondary text-left">Vehículo</th>
                            <th class="p-3 text-secondary text-center">Estado</th>
                            <th class="p-3 text-secondary text-center">Fecha</th>
                            <th class="p-3 text-secondary text-center">Total</th>
                            <th class="p-3 text-secondary text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => `
                            <tr class="bg-white shadow-sm" style="border-radius: 8px;">
                                <td class="p-3 font-weight-bold text-primary text-center">#${o.id}</td>
                                <td class="p-3 text-left">
                                    <div class="font-weight-bold">${o.marca || ''} ${o.modelo || ''}</div>
                                    <div class="text-secondary small">${o.placa || 'Sin Placa'}</div>
                                </td>
                                <td class="p-3 text-center"><span class="badge ${this._getStatusClass(o.estado_nombre)} px-3 py-2">${o.estado_nombre || 'Desconocido'}</span></td>
                                <td class="p-3 text-center">${o.fecha_ingreso ? new Date(o.fecha_ingreso).toLocaleDateString() : '-'}</td>
                                <td class="p-3 font-weight-bold text-center">$${(o.total_estimado || 0).toFixed(2)}</td>
                                <td class="p-3 text-center">
                                    <button class="btn-sm btn-secondary view-order-btn" data-id="${o.id}">Ver</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Bind View Order Buttons
        const viewBtns = container.querySelectorAll('.view-order-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (this.onViewOrder) this.onViewOrder(id);
            });
        });
    }

    bindViewOrder(handler) {
        this.onViewOrder = handler;
    }

    showOrderDetailsModal(order) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay open';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; border-radius: 12px; overflow: hidden;">
                <div class="modal-header bg-primary text-white p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 class="m-0 text-white">Orden #${order.id}</h3>
                        <span class="badge ${this._getStatusClass(order.estado_nombre)} mt-2 px-3">${order.estado_nombre}</span>
                    </div>
                    <button class="modal-close text-white" style="font-size: 1.5rem; background: none; border: none; cursor: pointer;">&times;</button>
                </div>
                <div class="modal-body p-4 bg-light">
                    <div class="card mb-4 shadow-sm border-0">
                        <div class="card-body">
                            <h4 class="text-secondary mb-3 border-bottom pb-2">Información del Vehículo</h4>
                            <div class="d-flex justify-content-between">
                                <div>
                                    <p class="mb-1"><strong>Vehículo:</strong> ${order.marca} ${order.modelo}</p>
                                    <p class="mb-0 text-secondary"><strong>Placa:</strong> ${order.placa}</p>
                                </div>
                                <div class="text-right">
                                     <p class="mb-1"><strong>Fecha Ingreso:</strong> ${order.fecha_ingreso ? new Date(order.fecha_ingreso).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                         <div class="col-md-6">
                            <div class="card mb-4 shadow-sm border-0 h-100">
                                <div class="card-body">
                                    <h5 class="text-primary mb-3">Reporte</h5>
                                    <p class="text-secondary">${order.problema_reportado || 'Sin reporte'}</p>
                                </div>
                            </div>
                         </div>
                         <div class="col-md-6">
                            <div class="card mb-4 shadow-sm border-0 h-100">
                                <div class="card-body">
                                    <h5 class="text-info mb-3">Diagnóstico</h5>
                                    <p class="text-secondary">${order.diagnostico || 'Pendiente'}</p>
                                </div>
                            </div>
                         </div>
                    </div>

                    <div class="card shadow-sm border-0">
                        <div class="card-body p-0">
                             <table class="table w-100 mb-0">
                                <thead class="bg-secondary text-white">
                                    <tr>
                                        <th class="p-3 border-0">Detalle</th>
                                        <th class="p-3 border-0 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${(order.detalles_servicios || []).map(s => `
                                        <tr>
                                            <td class="p-3 border-bottom-light">
                                                <span class="badge badge-info mr-2">Servicio</span> ${s.servicio_nombre}
                                            </td>
                                            <td class="p-3 border-bottom-light text-right text-dark font-weight-bold">
                                                $${parseFloat(s.precio_aplicado).toFixed(2)}
                                            </td>
                                        </tr>
                                    `).join('')}
                                    
                                     ${(order.detalles_repuestos || []).map(r => `
                                        <tr>
                                            <td class="p-3 border-bottom-light">
                                                <span class="badge badge-warning mr-2">Repuesto</span> ${r.repuesto_nombre} <span class="text-secondary small">(x${r.cantidad})</span>
                                            </td>
                                            <td class="p-3 border-bottom-light text-right text-dark font-weight-bold">
                                                $${(parseFloat(r.precio_unitario_aplicado) * r.cantidad).toFixed(2)}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot class="bg-light">
                                    <tr>
                                        <td class="p-3 text-right"><strong>TOTAL ESTIMADO</strong></td>
                                        <td class="p-3 text-right"><h3 class="m-0 text-primary">$${(order.total_estimado || 0).toFixed(2)}</h3></td>
                                    </tr>
                                </tfoot>
                             </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelectorAll('.modal-close').forEach(b => b.onclick = () => modal.remove());
    }

    _getStatusClass(status) {
        if (!status) return 'badge-secondary';
        switch (status.toLowerCase()) {
            case 'pendiente': return 'badge-warning';
            case 'en progreso': return 'badge-info';
            case 'completado': return 'badge-success';
            case 'cancelado': return 'badge-danger';
            default: return 'badge-secondary';
        }
    }

    bindEditClient(handler) {
        this.onEditClient = handler;
    }

    /**
     * Renderiza la lista de vehículos del cliente.
     */
    showVehicleModal(client, vehicleToEdit = null) {
        const isEdit = !!vehicleToEdit;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay open';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEdit ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="vehicleForm" class="modal-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Marca *</label>
                            <input type="text" name="brand" class="form-control" value="${isEdit ? vehicleToEdit.marca || '' : ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Modelo *</label>
                            <input type="text" name="model" class="form-control" value="${isEdit ? vehicleToEdit.modelo || '' : ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Placa *</label>
                            <input type="text" name="plate" class="form-control" value="${isEdit ? vehicleToEdit.placa || '' : ''}" required ${isEdit ? 'readonly' : ''}>
                        </div>
                        <div class="form-group">
                            <label>Año *</label>
                            <input type="number" name="year" class="form-control" value="${isEdit ? vehicleToEdit.anio || '' : ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Color</label>
                            <input type="text" name="color" class="form-control" value="${isEdit ? vehicleToEdit.color || '' : ''}">
                        </div>
                        <div class="form-group">
                            <label>VIN (Opcional)</label>
                            <input type="text" name="vin" class="form-control" value="${isEdit ? vehicleToEdit.vin || '' : ''}">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary modal-close">Cancelar</button>
                        <button type="submit" class="btn-primary">${isEdit ? 'Actualizar' : 'Guardar Vehículo'}</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelectorAll('.modal-close').forEach(b => b.onclick = () => modal.remove());

        modal.querySelector('#vehicleForm').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            if (this.onSaveVehicle) {
                this.onSaveVehicle(client.id, data, vehicleToEdit ? vehicleToEdit.id : null);
            }
            modal.remove();
        };
    }

    bindSaveVehicle(handler) {
        this.onSaveVehicle = handler;
    }

    bindVehicleEvents(handler) {
         // Add Vehicle Buttons (Empty state and List state)
         const addBtns = document.querySelectorAll('.btn-add-vehicle');
         addBtns.forEach(btn => {
             btn.addEventListener('click', () => {
                 // Trigger logic to show modal. Data for client is needed? 
                 // We handled renderClientDetails passing 'client'. We need to know which client.
                 // The view state might not be ideal here. Better to pass handler that triggers controller.
                 handler('add');
             });
         });

         // Edit Vehicle Buttons
         const editBtns = document.querySelectorAll('.btn-edit-vehicle');
         editBtns.forEach(btn => {
             btn.addEventListener('click', (e) => {
                 const id = btn.getAttribute('data-id');
                 handler('edit', id);
             });
         });
    }

    /**
     * Renderiza la lista de vehículos del cliente.
     */
    _renderVehicles(autos) {
        if (!autos || !Array.isArray(autos) || autos.length === 0) {
            return `
                <div class="p-4 text-center">
                    <p class="text-secondary mb-3">Este cliente no tiene vehículos registrados</p>
                    <button class="btn-primary btn-add-vehicle">+ Agregar Vehículo</button>
                </div>
            `;
        }

        return `
            <div class="p-4">
                <div class="mb-3">
                    <button class="btn-primary btn-add-vehicle">+ Agregar Vehículo</button>
                </div>
                <div class="vehicle-list">
                    ${autos.map(auto => `
                        <div class="vehicle-card d-flex align-items-center p-3 border rounded mb-2 shadow-sm">
                            <div class="vehicle-icon mr-3" style="font-size: 1.5rem;"><i class="fas fa-car text-primary"></i></div>
                            <div class="vehicle-info flex-grow-1">
                                <h4 class="mb-1">${auto.marca} ${auto.modelo}</h4>
                                <p class="text-secondary mb-0 small">
                                    <span class="badge badge-light border">Placa: ${auto.placa}</span> | 
                                    Año: ${auto.anio || 'N/A'} | 
                                    Color: ${auto.color || 'N/A'}
                                </p>
                            </div>
                            <div class="vehicle-actions">
                                <button class="btn-sm btn-secondary btn-edit-vehicle" data-id="${auto.id}" title="Editar"><i class="fas fa-edit"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }


    bindListEvents() {
        // Updated to handle Table events (Delegate)
        const tableBody = document.getElementById('clientTableBody');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                // View Details
                const viewBtn = e.target.closest('.btn-view');
                if (viewBtn) {
                    const id = viewBtn.dataset.id;
                    if (this.onSelectClient) this.onSelectClient(id);
                    return;
                }

                // Edit Client
                const editBtn = e.target.closest('.btn-edit');
                if (editBtn) {
                    const id = editBtn.dataset.id;
                    // Find client data to pass to handler if needed, or just ID.
                    // Controller 'handleEditClient' usually needs the ID, or View might need to call internal show.
                    // Let's assume onEditClient expects client object or ID. 
                    // To be safe and consistent with OrderView pattern (action, id), we might need to adjust.
                    // But ClientController likely expects `onEditClient` to trigger edit.
                    // For now, let's find the client object from `this.allClients` to pass it, 
                    // as `bindEditClient` in Line 279 inside modal uses `this.onEditClient(client)`.
                    const client = this.allClients.find(c => c.id == id);
                    if (this.onEditClient && client) this.onEditClient(client);
                    else if (this.onEditClient) this.onEditClient(id); // Fallback
                    return;
                }
            });
        }
    }

    bindTabEvents(context = document) {
        const buttons = context.querySelectorAll('.tab-btn');
        const panes = context.querySelectorAll('.tab-pane');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update Buttons
                buttons.forEach(b => {
                    b.classList.remove('active', 'border-primary', 'font-weight-bold', 'text-primary'); 
                    b.classList.add('text-secondary');
                    b.style.borderBottom = 'none';
                });
                
                btn.classList.add('active', 'font-weight-bold', 'text-primary');
                btn.classList.remove('text-secondary');
                btn.style.borderBottom = '2px solid var(--primary-color)';

                // Update Content
                const target = btn.getAttribute('data-tab');
                panes.forEach(pane => {
                    if(pane.id === `tab-${target}`) {
                        pane.style.display = 'block';
                        pane.classList.remove('hidden');
                        pane.classList.add('active');
                    } else {
                        pane.style.display = 'none';
                        pane.classList.add('hidden');
                        pane.classList.remove('active');
                    }
                });
            });
        });
    }

    bindSelectClient(handler) {
        this.onSelectClient = handler;
    }
}
