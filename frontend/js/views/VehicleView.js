import ModalView from './components/ModalView.js';

/**
 * Vista de Vehículos
 * Renderiza la tabla de gestión de vehículos y controles.
 */
export default class VehicleView {
    constructor() {
        this.appContent = document.getElementById('contentArea');
        this.modal = new ModalView();
    }

    /**
     * Renderiza la vista principal de vehículos.
     * @param {Array} vehicles - Lista de vehículos a mostrar.
     */
    render(vehicles) {
        this.appContent.innerHTML = `
            <div class="view-header">
                <h2>Gestión de Autos</h2>
                <button class="btn-primary" id="newVehicleBtn">+ Nuevo Vehículo</button>
            </div>
            
            <div class="card p-0">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Patente</th>
                            <th>Marca/Modelo</th>
                            <th>VIN</th>
                            <th>Cliente</th>
                            <th>Estado</th>
                            <th>Ingreso</th>
                            <th>Técnico</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this._generateRows(vehicles)}
                    </tbody>
                </table>
            </div>
        `;

        this.bindEvents();
    }

    /**
     * Genera el HTML de las filas de la tabla.
     */
    _generateRows(vehicles) {
        if (!vehicles || vehicles.length === 0) {
            return `<tr><td colspan="8" class="text-center">No hay vehículos registrados.</td></tr>`;
        }

        return vehicles.map(v => {
            const clientName = v.client ? v.client.name : 'N/A';
            const techName = v.technician ? v.technician.name : 'Sin asignar';
            const statusBadge = this._getStatusBadge(v.status);
            
            return `
                <tr>
                    <td class="font-bold">${v.vehicle_plate || '-'}</td>
                    <td>${v.brand} ${v.model}</td>
                    <td>${v.vin || '-'}</td>
                    <td>${clientName}</td>
                    <td>${statusBadge}</td>
                    <td>${v.entry_date || '-'}</td>
                    <td>${techName}</td>
                    <td class="actions-cell">
                        <button class="btn-icon" title="Ver"><i class="icon-eye"></i>Ver</button>
                        <button class="btn-icon" title="Editar"><i class="icon-edit"></i>Edit</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Retorna el HTML del badge según estado.
     */
    _getStatusBadge(status) {
        const map = {
            'pending': { label: 'Pendiente', class: 'badge-warning' },
            'in_progress': { label: 'En Proceso', class: 'badge-info' },
            'completed': { label: 'Terminado', class: 'badge-success' },
            'delivered': { label: 'Entregado', class: 'badge-secondary' }
        };

        const config = map[status] || { label: status, class: 'badge-default' };
        return `<span class="badge ${config.class}">${config.label}</span>`;
    }

    bindEvents() {
        const btn = document.getElementById('newVehicleBtn');
        if (btn) {
            btn.addEventListener('click', () => this.openNewVehicleModal());
        }
    }

    openNewVehicleModal() {
        const formHTML = `
            <form id="newVehicleForm" class="modal-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Patente</label>
                        <input type="text" name="vehicle_plate" placeholder="ABCD-12">
                    </div>
                    <div class="form-group">
                        <label>VIN</label>
                        <input type="text" name="vin" placeholder="1234567890ABC..." maxlength="17">
                    </div>
                    <div class="form-group">
                        <label>Marca</label>
                        <select name="brand">
                            <option value="">Seleccionar...</option>
                            <option value="Toyota">Toyota</option>
                            <option value="Ford">Ford</option>
                            <option value="Chevrolet">Chevrolet</option>
                            <option value="Nissan">Nissan</option>
                            <option value="Hyundai">Hyundai</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Modelo</label>
                        <input type="text" name="model" placeholder="Ej: Corolla">
                    </div>
                    <div class="form-group">
                        <label>Año</label>
                        <input type="number" name="year" placeholder="2024" min="1900" max="2100">
                    </div>
                    <div class="form-group">
                        <label>Color</label>
                        <input type="text" name="color" placeholder="Ej: Rojo">
                    </div>
                    <div class="form-group">
                        <label>Kilometraje</label>
                        <input type="number" name="mileage" placeholder="0">
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select name="status">
                            <option value="pending">Pendiente</option>
                            <option value="in_progress">En Proceso</option>
                            <option value="completed">Terminado</option>
                        </select>
                    </div>
                </div>
                <div class="form-group full-width">
                    <label>Observaciones</label>
                    <textarea name="observations" rows="3" placeholder="Detalles iniciales..."></textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-outline" id="cancelBtn">Cancelar</button>
                    <button type="submit" class="btn-primary">Guardar Vehículo</button>
                </div>
            </form>
        `;

        this.modal.open('Nuevo Vehículo', formHTML);

        // Bind cancel button inside modal
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.modal.close());
    }
}
