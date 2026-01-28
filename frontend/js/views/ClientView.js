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
            <div class="view-header">
                <h2>Gestión de Clientes</h2>
                <button class="btn-primary" id="newClientBtn">+ Nuevo Cliente</button>
            </div>
            
            <div class="split-view">
                <!-- Panel Izquierdo: Lista -->
                <div class="split-pane pane-list">
                    <div class="search-bar p-3 border-bottom">
                        <input type="text" id="clientSearchInput" placeholder="Buscar cliente..." class="form-control w-100">
                    </div>
                    <div class="client-list" id="clientList">
                        ${this._generateList(clients)}
                    </div>
                </div>

                <!-- Panel Derecho: Detalle -->
                <div class="split-pane pane-detail" id="clientDetailPane">
                    <div class="empty-state">
                        <p class="text-secondary">Selecciona un cliente para ver sus detalles</p>
                    </div>
                </div>
            </div>
        `;

        this.bindListEvents();
        this.bindSearchEvent();
        
        document.getElementById('newClientBtn').addEventListener('click', () => this.showCreateModal());
    }

    bindSearchEvent() {
        const searchInput = document.getElementById('clientSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = this.allClients.filter(c => 
                    (c.nombre && c.nombre.toLowerCase().includes(term)) || 
                    (c.apellido_p && c.apellido_p.toLowerCase().includes(term)) ||
                    (c.ci && c.ci.toLowerCase().includes(term))
                );
                document.getElementById('clientList').innerHTML = this._generateList(filtered);
                this.bindListEvents(); // Re-bind click on new items
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
                    <button class="modal-close">&times;</button>
                </div>
                <form id="createClientForm" class="modal-body">
                    ${isEdit ? `<input type="hidden" name="id" value="${clientToEdit.id}">` : ''}
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" name="first_name" class="form-control" value="${isEdit ? clientToEdit.nombre || '' : ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Apellido Paterno *</label>
                            <input type="text" name="last_name" class="form-control" value="${isEdit ? clientToEdit.apellido_p || '' : ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Apellido Materno</label>
                            <input type="text" name="apellido_m" class="form-control" value="${isEdit ? clientToEdit.apellido_m || '' : ''}">
                        </div>
                        <div class="form-group">
                            <label>CI (Cédula) *</label>
                            <input type="text" name="ci" class="form-control" value="${isEdit ? clientToEdit.ci || '' : ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" class="form-control" value="${isEdit ? clientToEdit.correo || '' : ''}">
                        </div>
                        <div class="form-group">
                            <label>Celular</label>
                            <input type="text" name="phone" class="form-control" value="${isEdit ? clientToEdit.celular || '' : ''}">
                        </div>
                        <div class="form-group full-width">
                            <label>Dirección</label>
                            <input type="text" name="address" class="form-control" value="${isEdit ? clientToEdit.direccion || '' : ''}">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary modal-close">Cancelar</button>
                        <button type="submit" class="btn-primary">${isEdit ? 'Actualizar' : 'Guardar Cliente'}</button>
                    </div>
                </form>
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

    _generateList(clients) {
        if (!clients || clients.length === 0) return '<div class="p-3">No hay clientes.</div>';
        
        return clients.map(c => `
            <div class="client-card" data-id="${c.id}">
                <div class="client-avatar">${(c.nombre || '').charAt(0)}</div>
                <div class="client-info">
                    <h4>${c.nombre} ${c.apellido_p}</h4>
                    <p>${c.correo}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Renderiza el detalle del cliente en el panel derecho.
     */
    renderClientDetails(client) {
        const pane = document.getElementById('clientDetailPane');
        const nombreCompleto = `${client.nombre} ${client.apellido_p} ${client.apellido_m || ''}`;
        
        // Contar vehículos del array autos
        const vehicleCount = (client.autos && Array.isArray(client.autos)) ? client.autos.length : 0;
        
        pane.innerHTML = `
            <div class="detail-header">
                <div class="client-avatar large">${(client.nombre || '').charAt(0)}</div>
                <div>
                    <h2>${nombreCompleto}</h2>
                    <p class="text-secondary">ID: ${client.id} | CI: ${client.ci || 'N/A'}</p>
                </div>
            </div>

            <div class="tabs">
                <div class="tabs-header">
                    <button class="tab-btn active" data-tab="info">Información</button>
                    <button class="tab-btn" data-tab="vehicles">Vehículos (${vehicleCount})</button>
                    <button class="tab-btn" data-tab="history">Historial</button>
                </div>
                <div class="tabs-content">
                    <div id="tab-info" class="tab-pane active">
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Email:</label>
                                <span>${client.correo || '-'}</span>
                            </div>
                            <div class="info-item">
                                <label>Celular:</label>
                                <span>${client.celular || '-'}</span>
                            </div>
                            <div class="info-item">
                                <label>Dirección:</label>
                                <span>${client.direccion || '-'}</span>
                            </div>
                            <div class="info-item">
                                <label>CI:</label>
                                <span>${client.ci || '-'}</span>
                            </div>
                        </div>
                        <div class="mt-4">
                            <button class="btn-primary" id="btnEditClient" data-id="${client.id}">Editar Cliente</button>
                        </div>
                    </div>
                    <div id="tab-vehicles" class="tab-pane">
                        ${this._renderVehicles(client.autos)}
                    </div>
                    <div id="tab-history" class="tab-pane">
                        <div id="clientHistoryContainer">
                            <p class="p-4 text-center text-secondary">Cargando historial...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.bindTabEvents();

        // Bind Edit Button
        const editBtn = document.getElementById('btnEditClient');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                if (this.onEditClient) this.onEditClient(client);
            });
        }
        
        // Bind Vehicle Events
        this.bindVehicleEvents((action, id) => {
            if (this.onVehicleAction) this.onVehicleAction(action, client, id);
        });
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
                            <div class="vehicle-icon mr-3" style="font-size: 1.5rem;">🚗</div>
                            <div class="vehicle-info flex-grow-1">
                                <h4 class="mb-1">${auto.marca} ${auto.modelo}</h4>
                                <p class="text-secondary mb-0 small">
                                    <span class="badge badge-light border">Placa: ${auto.placa}</span> | 
                                    Año: ${auto.anio || 'N/A'} | 
                                    Color: ${auto.color || 'N/A'}
                                </p>
                            </div>
                            <div class="vehicle-actions">
                                <button class="btn-sm btn-secondary btn-edit-vehicle" data-id="${auto.id}" title="Editar">✏️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }


    bindListEvents() {
        const cards = document.querySelectorAll('.client-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove active from others
                cards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                const id = card.getAttribute('data-id');
                if (this.onSelectClient) this.onSelectClient(id);
            });
        });
    }

    bindTabEvents() {
        const buttons = document.querySelectorAll('.tab-btn');
        const panes = document.querySelectorAll('.tabs-content .tab-pane');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Tabs
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Content
                const target = btn.getAttribute('data-tab');
                panes.forEach(pane => {
                    pane.id === `tab-${target}` ? pane.classList.add('active') : pane.classList.remove('active');
                });
            });
        });
    }

    bindSelectClient(handler) {
        this.onSelectClient = handler;
    }
}
