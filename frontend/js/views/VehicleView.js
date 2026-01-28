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
            <div class="card fade-in shadow-sm border-0 rounded-lg p-4">
                <div class="view-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h2 style="font-family: 'Inter', sans-serif; font-weight: 600;">Gestión de Autos</h2>
                        <p class="text-secondary">Administra la flota de vehículos registrados</p>
                    </div>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <button class="btn btn-primary" id="newVehicleBtn">
                            <i class="fas fa-plus mr-2"></i> Nuevo Vehículo
                        </button>
                    </div>
                </div>
            
                <div class="table-responsive">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="bg-light">
                            <tr>
                                <th class="py-3 px-4 border-bottom text-uppercase text-secondary text-xs font-weight-bold">Placa</th>
                                <th class="py-3 px-4 border-bottom text-uppercase text-secondary text-xs font-weight-bold">Vehículo</th>
                                <th class="py-3 px-4 border-bottom text-uppercase text-secondary text-xs font-weight-bold">Cliente</th>
                                <th class="py-3 px-4 border-bottom text-uppercase text-secondary text-xs font-weight-bold text-center">Estado (Orden)</th>
                                <th class="py-3 px-4 border-bottom text-uppercase text-secondary text-xs font-weight-bold">Ingreso</th>
                                <th class="py-3 px-4 border-bottom text-uppercase text-secondary text-xs font-weight-bold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this._generateRows(vehicles)}
                        </tbody>
                    </table>
                </div>
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
                <tr>
                    <td class="py-3 px-4 border-bottom font-weight-bold text-primary">${v.placa || '-'}</td>
                    <td class="py-3 px-4 border-bottom">
                         <div class="font-weight-bold text-dark">${v.marca} ${v.modelo}</div>
                         <div class="text-secondary small">VIN: ${v.vin || 'N/A'}</div>
                    </td>
                    <td class="py-3 px-4 border-bottom">
                        <div class="font-weight-bold text-dark">${clientName}</div>
                        <div class="text-secondary small">CI: ${v.client_ci || 'N/A'}</div>
                    </td>
                    <td class="py-3 px-4 border-bottom text-center">${statusBadge}</td>
                    <td class="py-3 px-4 border-bottom text-secondary">${v.fecha_ingreso ? new Date(v.fecha_ingreso).toLocaleDateString() : '-'}</td>
                    <td class="py-3 px-4 border-bottom text-center">
                        <button class="btn-icon btn-view view-btn" data-id="${v.id}" title="Ver"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon btn-edit edit-btn" data-id="${v.id}" title="Editar"><i class="fas fa-edit"></i></button>
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
            <form id="vehicleForm">
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
            </form>
        `;

        const footerHTML = `
             <button type="button" class="btn-secondary modal-close-btn" id="cancelBtn">Cancelar</button>
             <button type="submit" form="vehicleForm" class="btn-primary">${isEdit ? 'Actualizar' : 'Guardar'}</button>
        `;

        this.modal.open(isEdit ? 'Editar Vehículo' : 'Nuevo Vehículo', formHTML, footerHTML);

        // Cancel button logic is handled by ModalView's close via class delegation? 
        // ModalView binds .modal-close-btn to this.close(). 
        // So adding class 'modal-close-btn' to Cancel button handles it automatically!
        // But let's keep specific ID listener just in case or remove if redundant.
        // ModalView implementation: 
        // const closeBtn = overlay.querySelector('.modal-close-btn'); -> only selects ONE (the header X usually).
        // I should verify ModalView if it selects ALL or just one.
        // Reading ModalView again: `const closeBtn = overlay.querySelector('.modal-close-btn');` -> Single Element.
        // So I must manually bind cancel button logic or update ModalView to selectAll.
        // I'll manually bind for safety here.
        
        const cancelBtn = document.getElementById('cancelBtn');
        if(cancelBtn) cancelBtn.addEventListener('click', () => this.modal.close());

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
                    <div class="text-primary mb-2"><i class="fas fa-car fa-4x"></i></div>
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
