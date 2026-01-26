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
                <div class="client-avatar">${c.name.charAt(0)}</div>
                <div class="client-info">
                    <h4>${c.name}</h4>
                    <p>${c.email}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Renderiza el detalle del cliente en el panel derecho.
     */
    renderClientDetails(client) {
        const pane = document.getElementById('clientDetailPane');
        pane.innerHTML = `
            <div class="detail-header">
                <div class="client-avatar large">${client.name.charAt(0)}</div>
                <div>
                    <h2>${client.name}</h2>
                    <p class="text-secondary">ID: ${client.id}</p>
                </div>
            </div>

            <div class="tabs">
                <div class="tabs-header">
                    <button class="tab-btn active" data-tab="info">Información</button>
                    <button class="tab-btn" data-tab="vehicles">Vehículos (${client.vehicles_count || 0})</button>
                    <button class="tab-btn" data-tab="history">Historial</button>
                </div>
                <div class="tabs-content">
                    <div id="tab-info" class="tab-pane active">
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Email:</label>
                                <span>${client.email}</span>
                            </div>
                            <div class="info-item">
                                <label>Teléfono:</label>
                                <span>${client.phone || '-'}</span>
                            </div>
                            <div class="info-item">
                                <label>Dirección:</label>
                                <span>${client.address || '-'}</span>
                            </div>
                            <div class="info-item">
                                <label>Última Visita:</label>
                                <span>${client.last_visit || '-'}</span>
                            </div>
                        </div>
                        <div class="mt-4">
                            <button class="btn-primary">Editar Cliente</button>
                        </div>
                    </div>
                    <div id="tab-vehicles" class="tab-pane">
                        <p class="p-4 text-center text-secondary">Listado de vehículos aquí...</p>
                    </div>
                    <div id="tab-history" class="tab-pane">
                        <p class="p-4 text-center text-secondary">Historial de órdenes aquí...</p>
                    </div>
                </div>
            </div>
        `;
        
        this.bindTabEvents();
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
