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
            <div class="card fade-in shadow-sm border-0 rounded-lg p-4">
                <div class="view-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h2 style="font-family: 'Inter', sans-serif; font-weight: 600;">Inventario de Repuestos</h2>
                        <p class="text-secondary">Gestión de stock y precios de repuestos</p>
                    </div>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                         <div class="search-wrapper" style="position: relative;">
                            <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary);"></i>
                            <input type="text" id="inventorySearch" placeholder="Buscar..." class="form-control" style="padding-left: 35px;">
                        </div>
                        <button id="btnNewPart" class="btn btn-primary">
                            <i class="fas fa-plus mr-2"></i> Nuevo Repuesto
                        </button>
                    </div>
                </div>

                <div class="inventory-container">
                    ${this.renderPartsTable(parts)}
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderPartsTable(parts) {
        if (!parts.length) {
            return `
                <div class="empty-state text-center p-5">
                     <div class="mb-3 text-secondary"><i class="fas fa-boxes fa-3x"></i></div>
                    <h3>No hay repuestos en inventario</h3>
                    <p class="text-secondary">Agrega items para comenzar a gestionar el stock.</p>
                </div>
            `;
        }

        return `
            <div class="table-responsive">
                <table class="table table-hover mb-0 align-middle">
                    <thead class="bg-light">
                        <tr>
                            <th class="py-3 px-4 border-bottom text-uppercase text-secondary text-xs font-weight-bold">Nombre</th>
                            <th class="py-3 px-4 border-bottom text-uppercase text-secondary text-xs font-weight-bold">Marca</th>
                            <th class="py-3 px-4 border-bottom text-uppercase text-secondary text-xs font-weight-bold text-right">Precio Venta</th>
                            <th class="py-3 px-4 border-bottom text-uppercase text-secondary text-xs font-weight-bold text-center">Stock</th>
                            <th class="py-3 px-4 border-bottom text-uppercase text-secondary text-xs font-weight-bold text-center">Estado</th>
                            <th class="py-3 px-4 border-bottom text-uppercase text-secondary text-xs font-weight-bold text-center">Acciones</th>
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
            ? `<span class="badge badge-danger px-3 py-1 rounded-pill">Bajo Stock (${part.stock})</span>` 
            : `<span class="badge badge-success px-3 py-1 rounded-pill">En Stock (${part.stock})</span>`;

        return `
            <tr>
                <td class="py-3 px-4 border-bottom font-weight-bold text-dark">${part.nombre}</td>
                <td class="py-3 px-4 border-bottom text-secondary">${part.marca || '-'}</td>
                <td class="py-3 px-4 border-bottom text-right font-weight-bold text-success">Bs. ${parseFloat(part.precio_venta).toFixed(2)}</td>
                <td class="py-3 px-4 border-bottom text-center">
                    ${statusBadge}
                </td>
                <td class="py-3 px-4 border-bottom text-center">${part.activo ? '<span class="text-success"><i class="fas fa-check-circle"></i> Activo</span>' : '<span class="text-secondary">Inactivo</span>'}</td>
                <td class="py-3 px-4 border-bottom text-center">
                    <button class="btn-icon btn-edit" data-action="edit" data-id="${part.id}" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-delete" data-action="delete" data-id="${part.id}" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
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
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="inventoryForm">
                        <div class="form-grid">
                            <div class="form-group full-width">
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
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary modal-close">Cancelar</button>
                    <button type="submit" form="inventoryForm" class="btn-primary">Guardar</button>
                </div>
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
