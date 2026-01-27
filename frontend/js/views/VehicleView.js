import ModalView from './components/ModalView.js';
import { getStatusConfig, ORDER_STATES_LABELS } from '../utils/constants.js';

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
                            <th>Placa</th>
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
            // Nota: El backend ahora retorna nombres planos como 'client_name', 'technician_name'
            const clientName = v.client_name || 'N/A';
            const techName = v.technician_name || 'Sin asignar';
            const statusBadge = this._getStatusBadge(v.estado_nombre);
            
            return `
                <tr>
                    <td class="font-bold">${v.placa || '-'}</td>
                    <td>${v.marca} ${v.modelo}</td>
                    <td>${v.vin || '-'}</td>
                    <td>${clientName}</td>
                    <td>${statusBadge}</td>
                    <td>${v.fecha_ingreso || '-'}</td>
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
        const config = getStatusConfig(status);
        return `<span class="badge ${config.class}">${config.label}</span>`;
    }

    bindEvents() {
        const btn = document.getElementById('newVehicleBtn');
        if (btn) {
            btn.addEventListener('click', () => this.openNewVehicleModal());
        }
    }

    openNewVehicleModal() {
        // Obtenemos opciones de estado desde constantes
        const statusOptions = Object.keys(ORDER_STATES_LABELS).map(key => 
            `<option value="${key}">${ORDER_STATES_LABELS[key].label}</option>`
        ).join('');

        const formHTML = `
            <form id="newVehicleForm" class="modal-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Placa</label>
                        <input type="text" name="placa" placeholder="ABCD-12">
                    </div>
                    <div class="form-group">
                        <label>VIN (Opcional)</label>
                        <input type="text" name="vin" placeholder="..." maxlength="17">
                    </div>
                    <div class="form-group">
                        <label>Marca</label>
                        <select name="marca">
                            <option value="">Seleccionar...</option>
                            <option value="Toyota">Toyota</option>
                            <option value="Ford">Ford</option>
                            <option value="Nissan">Nissan</option>
                            <option value="Hyundai">Hyundai</option>
                            <option value="Kia">Kia</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Modelo</label>
                        <input type="text" name="modelo" placeholder="Ej: Corolla">
                    </div>
                    <div class="form-group">
                        <label>Año</label>
                        <input type="number" name="anio" placeholder="2024" min="1900" max="2100">
                    </div>
                    <div class="form-group">
                        <label>Color</label>
                        <input type="text" name="color" placeholder="Ej: Rojo">
                    </div>
                    <div class="form-group">
                        <label>Estado Inicial</label>
                        <select name="estado_nombre">
                           ${statusOptions}
                        </select>
                    </div>
                </div>
                <div class="form-group full-width">
                    <label>Problema Reportado</label>
                    <textarea name="problema_reportado" rows="3" placeholder="Detalles..."></textarea>
                </div>
                <!-- Nota: Se requiere seleccionar cliente, en una app real sería un select dinámico -->
                <div class="form-group">
                    <label>ID Cliente (Temporal)</label>
                    <input type="number" name="cliente_id" placeholder="ID del cliente">
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
