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
        this.onSaveVehicle = null;
        this.onCreateVehicle = null;
        this.onViewVehicle = null;
        this.onEditVehicle = null;
    }

    render(vehicles, clients = []) {
        this.clients = clients; // Store for modal
        this.appContent.innerHTML = `
            <div class="view-header">
                <h2>Gestión de Autos</h2>
                <button class="btn-primary" id="newVehicleBtn"><i class="fas fa-plus"></i> Nuevo Vehículo</button>
            </div>
            
            <div class="card p-0 shadow-sm border-0" style="border-radius: 12px; overflow: hidden;">
                <table class="table w-100 mb-0" style="border-collapse: separate; border-spacing: 0;">
                    <thead class="bg-light">
                        <tr>
                            <th class="p-3 border-bottom text-secondary font-weight-bold">Placa</th>
                            <th class="p-3 border-bottom text-secondary font-weight-bold">Vehículo</th>
                            <th class="p-3 border-bottom text-secondary font-weight-bold">Cliente</th>
                            <th class="p-3 border-bottom text-secondary font-weight-bold">Estado (Orden)</th>
                            <th class="p-3 border-bottom text-secondary font-weight-bold">Ingreso</th>
                            <th class="p-3 border-bottom text-secondary font-weight-bold text-center">Acciones</th>
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
            return `<tr><td colspan="6" class="text-center p-5 text-secondary">No hay vehículos registrados.</td></tr>`;
        }

        return vehicles.map(v => {
            const clientName = v.client_name || 'N/A';
            const statusBadge = this._getStatusBadge(v.estado_nombre);
            
            return `
                <tr class="hover-bg-light">
                    <td class="p-3 border-bottom font-weight-bold text-primary">${v.placa || '-'}</td>
                    <td class="p-3 border-bottom">
                         <div class="font-weight-bold text-dark">${v.marca} ${v.modelo}</div>
                         <div class="text-secondary small">VIN: ${v.vin || 'N/A'}</div>
                    </td>
                    <td class="p-3 border-bottom">
                        <div class="font-weight-bold text-dark">${clientName}</div>
                        <div class="text-secondary small">CI: ${v.client_ci || 'N/A'}</div>
                    </td>
                    <td class="p-3 border-bottom">${statusBadge}</td>
                    <td class="p-3 border-bottom text-secondary">${v.fecha_ingreso ? new Date(v.fecha_ingreso).toLocaleDateString() : '-'}</td>
                    <td class="p-3 border-bottom text-center">
                        <button class="btn-sm btn-icon btn-secondary view-btn" data-id="${v.id}" title="Ver"><i class="fas fa-eye"></i></button>
                        <button class="btn-sm btn-icon btn-secondary edit-btn" data-id="${v.id}" title="Editar"><i class="fas fa-edit"></i></button>
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
        return `<span class="badge ${config.class} px-3 py-1">${config.label}</span>`;
    }

    bindEvents() {
        const btn = document.getElementById('newVehicleBtn');
        if (btn) {
            btn.addEventListener('click', () => this.showVehicleModal(null));
        }
        
        // ... (View/Edit binds kept identical via delegation or re-bind) ...
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(b => {
             b.addEventListener('click', () => {
                 const id = b.getAttribute('data-id');
                 if (this.onViewVehicle) this.onViewVehicle(id);
            });
        });

        const editBtns = document.querySelectorAll('.edit-btn');
        editBtns.forEach(b => {
             b.addEventListener('click', () => {
                 const id = b.getAttribute('data-id');
                 if (this.onEditVehicle) this.onEditVehicle(id);
            });
        });
    }
    
    bindViewVehicle(handler) {
        this.onViewVehicle = handler;
    }

    bindEditVehicle(handler) {
        this.onEditVehicle = handler;
    }

    bindCreateVehicle(handler) {
        this.onCreateVehicle = handler;
    }

    showVehicleModal(vehicleToEdit, vehicleData = null) {
        const isEdit = !!vehicleToEdit;
        
        // Client Options
        const clientOptions = this.clients.map(c => 
            `<option value="${c.id}" ${vehicleToEdit && vehicleToEdit.client_id === c.id ? 'selected' : ''}>${c.nombre} ${c.apellido_p} (${c.ci})</option>`
        ).join('');

        const formHTML = `
            <form id="vehicleForm" class="modal-form p-4">
                <input type="hidden" name="id" value="${isEdit ? vehicleToEdit.id : ''}">
                <div class="form-grid">
                    ${!isEdit ? `
                    <div class="form-group full-width">
                        <label>Cliente *</label>
                        <select name="cliente_id" class="form-control" required>
                            <option value="">Seleccionar Cliente...</option>
                            ${clientOptions}
                        </select>
                    </div>` : ''}
                    
                    <div class="form-group">
                        <label>Placa *</label>
                        <input type="text" name="plate" class="form-control" value="${isEdit ? vehicleToEdit.placa || '' : ''}" required ${isEdit ? 'readonly' : ''}>
                    </div>
                    <div class="form-group">
                        <label>Marca *</label>
                        <input type="text" name="brand" class="form-control" value="${isEdit ? vehicleToEdit.marca || '' : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Modelo *</label>
                        <input type="text" name="model" class="form-control" value="${isEdit ? vehicleToEdit.modelo || '' : ''}" required>
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
                        <label>VIN</label>
                        <input type="text" name="vin" class="form-control" value="${isEdit ? vehicleToEdit.vin || '' : ''}">
                    </div>
                </div>
                <div class="modal-actions d-flex justify-content-end mt-4">
                     <button type="button" class="btn-secondary mr-2" id="cancelBtn">Cancelar</button>
                    <button type="submit" class="btn-primary">${isEdit ? 'Actualizar' : 'Guardar'}</button>
                </div>
            </form>
        `;

        this.modal.open(isEdit ? 'Editar Vehículo' : 'Nuevo Vehículo', formHTML);

        document.getElementById('cancelBtn').addEventListener('click', () => this.modal.close());

        document.getElementById('vehicleForm').onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            if (isEdit) {
                if (this.onSaveVehicle) this.onSaveVehicle(vehicleToEdit.id, data);
            } else {
                if (this.onCreateVehicle) this.onCreateVehicle(data);
            }
            this.modal.close();
        };
    }

    bindSaveVehicle(handler) {
        this.onSaveVehicle = handler;
    }

    showDetailsModal(vehicle) {
         const content = `
            <div class="p-4">
                <div class="mb-4 text-center">
                    <div style="font-size: 3rem;">🚗</div>
                    <h3>${vehicle.marca} ${vehicle.modelo}</h3>
                    <h5 class="text-secondary">${vehicle.placa}</h5>
                </div>
                <div class="info-grid">
                     <div class="info-item border-bottom py-2 d-flex justify-content-between">
                        <strong>Cliente:</strong> <span>${vehicle.client_name}</span>
                    </div>
                    <div class="info-item border-bottom py-2 d-flex justify-content-between">
                        <strong>Año:</strong> <span>${vehicle.anio || 'N/A'}</span>
                    </div>
                    <div class="info-item border-bottom py-2 d-flex justify-content-between">
                        <strong>Color:</strong> <span>${vehicle.color || 'N/A'}</span>
                    </div>
                     <div class="info-item border-bottom py-2 d-flex justify-content-between">
                        <strong>VIN:</strong> <span>${vehicle.vin || 'N/A'}</span>
                    </div>
                     <div class="info-item border-bottom py-2 d-flex justify-content-between">
                        <strong>Estado Actual:</strong> <span>${vehicle.estado_nombre || 'N/A'}</span>
                    </div>
                </div>
                <div class="text-right mt-4">
                    <button class="btn-secondary" onclick="document.querySelector('.modal-overlay').remove()">Cerrar</button>
                </div>
            </div>
         `;
         // Using custom modal simple implementation here or reusing ModalView
         // ModalView expects HTML content string
         this.modal.open('Detalle de Vehículo', content);
         
         // Re-bind close button logic if not handled by ModalView directly for custom buttons
         const closeBtns = document.querySelectorAll('.modal-overlay button');
         closeBtns.forEach(b => b.addEventListener('click', () => this.modal.close()));
    }
}
