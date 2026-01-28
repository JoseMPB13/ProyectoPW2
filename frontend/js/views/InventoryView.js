export default class InventoryView {
    constructor() {
        this.contentArea = document.getElementById('contentArea');
        this.onAction = null;
        this.onSubmit = null;
        this.modal = null; 
    }

    showLoading() {
        let overlay = document.querySelector('.loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
        document.querySelectorAll('button').forEach(btn => btn.disabled = true);
    }

    hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) overlay.style.display = 'none';
        document.querySelectorAll('button').forEach(btn => btn.disabled = false);
    }

    render(parts = []) {
        this.contentArea.innerHTML = `
            <div class="view-header">
                <div>
                    <h2>Inventario de Repuestos</h2>
                    <p class="text-secondary">Gestión de stock y precios de repuestos</p>
                </div>
                <div class="header-actions" style="display: flex; gap: 10px;">
                    <div class="search-box">
                        <input type="text" id="inventorySearch" placeholder="🔍 Buscar repuesto..." class="search-input">
                    </div>
                    <button id="btnNewPart" class="btn-primary">
                        <span>+</span> Nuevo Repuesto
                    </button>
                </div>
            </div>

            <div class="inventory-container" style="margin-top: 20px;">
                ${this.renderPartsTable(parts)}
            </div>
        `;

        this.attachEvents();
    }

    renderPartsTable(parts) {
        if (!parts.length) {
            return `
                <div class="empty-state">
                    <h3>No hay repuestos en inventario</h3>
                    <p>Agrega items para comenzar a gestionar el stock.</p>
                </div>
            `;
        }

        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Marca</th>
                            <th>Precio Venta</th>
                            <th>Stock</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${parts.map(part => this.renderRow(part)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderRow(part) {
        const stockStatus = part.stock <= part.stock_minimo ? 'critical' : 'normal';
        const statusBadge = stockStatus === 'critical' 
            ? `<span class="badge badge-danger">Bajo Stock (${part.stock})</span>` 
            : `<span class="badge badge-success">En Stock (${part.stock})</span>`;

        return `
            <tr>
                <td><strong>${part.nombre}</strong></td>
                <td>${part.marca || '-'}</td>
                <td>Bs. ${parseFloat(part.precio_venta).toFixed(2)}</td>
                <td>
                    ${statusBadge}
                </td>
                <td>${part.activo ? 'Activo' : 'Inactivo'}</td>
                <td>
                    <button class="btn-icon" data-action="edit" data-id="${part.id}" title="Editar">✏️</button>
                    <button class="btn-icon delete" data-action="delete" data-id="${part.id}" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
    }

    attachEvents() {
        document.getElementById('btnNewPart').addEventListener('click', () => this.showModal());

        this.contentArea.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                if (this.onAction) this.onAction(action, id);
            });
        });

        const searchInput = document.getElementById('inventorySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (this.onSearch) this.onSearch(e.target.value);
            });
        }
    }

    bindSearch(handler) {
        this.onSearch = handler;
    }

    updatePartsList(parts) {
        const tableBody = this.contentArea.querySelector('.data-table tbody');
        if (tableBody) {
            tableBody.innerHTML = parts.map(part => this.renderRow(part)).join('');
        }
    }

    showModal(part = null) {
        const isEdit = !!part;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay open';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEdit ? 'Editar Repuesto' : 'Nuevo Repuesto'}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="inventoryForm" class="modal-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Nombre del Repuesto *</label>
                            <input type="text" name="nombre" class="form-control" 
                                   value="${part ? part.nombre : ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Marca</label>
                            <input type="text" name="marca" class="form-control" 
                                   value="${part ? part.marca || '' : ''}">
                        </div>
                        <div class="form-group">
                            <label>Precio Venta (Bs.) *</label>
                            <input type="number" name="precio_venta" class="form-control" step="0.01" 
                                   value="${part ? part.precio_venta : ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Stock Actual</label>
                            <input type="number" name="stock" class="form-control" 
                                   value="${part ? part.stock : '0'}">
                        </div>
                        <div class="form-group">
                            <label>Stock Mínimo</label>
                            <input type="number" name="stock_minimo" class="form-control" 
                                   value="${part ? part.stock_minimo : '5'}">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary modal-close">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelectorAll('.modal-close').forEach(b => b.onclick = () => modal.remove());

        modal.querySelector('#inventoryForm').onsubmit = (e) => {
            e.preventDefault();
            const formData = {
                nombre: e.target.nombre.value,
                marca: e.target.marca.value,
                precio_venta: parseFloat(e.target.precio_venta.value),
                stock: parseInt(e.target.stock.value),
                stock_minimo: parseInt(e.target.stock_minimo.value)
            };
            if (part) formData.id = part.id;

            if (this.onSubmit) this.onSubmit(formData);
            modal.remove();
        };
    }

    showConfirmDelete(id, onConfirm) {
        if(confirm('¿Seguro de eliminar este repuesto?')) {
            onConfirm(id);
        }
    }

    showSuccess(msg) { alert(msg); }
    showError(msg) { alert(msg); }
}
