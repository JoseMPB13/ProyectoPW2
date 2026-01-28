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
        this.appContent.innerHTML = `
            <div class="view-header">
                <h2>Gestión de Clientes</h2>
                <button class="btn-primary" id="newClientBtn">+ Nuevo Cliente</button>
            </div>
            
            <div class="split-view">
                <!-- Panel Izquierdo: Lista -->
                <div class="split-pane pane-list">
                    <div class="search-bar p-3 border-bottom">
                        <input type="text" placeholder="Buscar cliente..." class="form-control w-100">
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
                            <button class="btn-primary">Editar Cliente</button>
                        </div>
                    </div>
                    <div id="tab-vehicles" class="tab-pane">
                        ${this._renderVehicles(client.autos)}
                    </div>
                    <div id="tab-history" class="tab-pane">
                        <p class="p-4 text-center text-secondary">Historial de órdenes aquí...</p>
                    </div>
                </div>
            </div>
        `;
        
        this.bindTabEvents();
    }

    /**
     * Renderiza la lista de vehículos del cliente.
     */
    _renderVehicles(autos) {
        if (!autos || !Array.isArray(autos) || autos.length === 0) {
            return `
                <div class="p-4 text-center">
                    <p class="text-secondary mb-3">Este cliente no tiene vehículos registrados</p>
                    <button class="btn-primary">+ Agregar Vehículo</button>
                </div>
            `;
        }

        return `
            <div class="p-4">
                <div class="mb-3">
                    <button class="btn-primary">+ Agregar Vehículo</button>
                </div>
                <div class="vehicle-list">
                    ${autos.map(auto => `
                        <div class="vehicle-card">
                            <div class="vehicle-icon">🚗</div>
                            <div class="vehicle-info">
                                <h4>${auto.marca} ${auto.modelo}</h4>
                                <p class="text-secondary">
                                    Placa: ${auto.placa} | 
                                    Año: ${auto.anio || 'N/A'} | 
                                    Color: ${auto.color || 'N/A'}
                                </p>
                            </div>
                            <div class="vehicle-actions">
                                <button class="btn-sm btn-secondary" title="Ver detalles">👁️</button>
                                <button class="btn-sm btn-secondary" title="Editar">✏️</button>
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
