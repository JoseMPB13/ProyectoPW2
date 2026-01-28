import ModalView from './components/ModalView.js';

/**
 * Vista de Pagos
 * Maneja la renderización de la interfaz de gestión de pagos.
 */
export default class PaymentView {
    constructor() {
        this.contentArea = document.getElementById('contentArea');
        this.modal = new ModalView();
        
        // Event Handlers placeholders
        this.onNewPayment = null;
        this.onSubmitPayment = null;
        this.onViewPayment = null;
        this.onApplyFilters = null;
    }

    /**
     * Renderiza la vista principal de pagos.
     * @param {Array} payments - Array de pagos a mostrar.
     * @param {Object} summary - Resumen de ingresos.
     */
    render(payments = [], summary = null) {
        this.contentArea.innerHTML = `
            <div class="view-header d-flex justify-content-between align-items-center mb-4">
                <h2><i class="fas fa-money-bill-wave"></i> Gestión de Pagos</h2>
                <button id="newPaymentBtn" class="btn btn-primary"><i class="fas fa-plus"></i> Registrar Pago</button>
            </div>

            ${summary ? this.renderSummaryCards(summary) : ''}

            <div class="card shadow-sm border-0 mb-4" style="border-radius: 12px;">
                <div class="card-body">
                    <div class="row align-items-end">
                        <div class="col-md-4">
                            <label class="text-secondary small">Fecha Inicio</label>
                            <input type="date" id="filterFechaInicio" class="form-control">
                        </div>
                        <div class="col-md-4">
                            <label class="text-secondary small">Fecha Fin</label>
                            <input type="date" id="filterFechaFin" class="form-control">
                        </div>
                        <div class="col-md-4">
                            <button id="applyFilters" class="btn btn-secondary w-100"><i class="fas fa-filter"></i> Aplicar Filtros</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card shadow-sm border-0" style="border-radius: 12px; overflow: hidden;">
                <div class="table-responsive">
                    <table class="table w-100 mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th class="p-3 border-bottom text-secondary font-weight-bold text-center" style="width: 10%;">ID</th>
                                <th class="p-3 border-bottom text-secondary font-weight-bold text-center" style="width: 15%;">Orden</th>
                                <th class="p-3 border-bottom text-secondary font-weight-bold text-center" style="width: 20%;">Monto</th>
                                <th class="p-3 border-bottom text-secondary font-weight-bold text-center" style="width: 20%;">Método</th>
                                <th class="p-3 border-bottom text-secondary font-weight-bold text-center" style="width: 20%;">Fecha</th>
                                <th class="p-3 border-bottom text-secondary font-weight-bold text-center" style="width: 15%;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="paymentsTableBody">
                            ${this.renderPaymentRows(payments)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        this.bindEvents();
    }

    /**
     * Renderiza las tarjetas de resumen.
     */
    renderSummaryCards(summary) {
        return `
            <div class="row mb-4">
                <div class="col-md-6 col-lg-6 mb-3 mb-md-0">
                    <div class="card shadow-sm border-0 bg-primary text-white h-100" style="border-radius: 12px;">
                        <div class="card-body d-flex justify-content-between align-items-center px-4">
                            <div>
                                <h6 class="mb-2 text-white-50 text-uppercase" style="letter-spacing: 1px; font-size: 0.85rem;">Total Ingresos</h6>
                                <h2 class="m-0 font-weight-bold">Bs. ${this.formatCurrency(summary.total_ingresos || 0)}</h2>
                            </div>
                            <div class="icon-circle bg-white-20 rounded-circle d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; background: rgba(255,255,255,0.2);">
                                <i class="fas fa-chart-line fa-2x text-white"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-6">
                    <div class="card shadow-sm border-0 bg-white h-100" style="border-radius: 12px;">
                        <div class="card-body d-flex justify-content-between align-items-center px-4">
                            <div>
                                <h6 class="mb-2 text-secondary text-uppercase" style="letter-spacing: 1px; font-size: 0.85rem;">Pagos Registrados</h6>
                                <h2 class="m-0 text-dark font-weight-bold">${summary.total_pagos || 0}</h2>
                            </div>
                            <div class="icon-circle bg-light rounded-circle d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                                <i class="fas fa-receipt fa-2x text-secondary"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza las filas de la tabla de pagos.
     */
    renderPaymentRows(payments) {
        if (!payments || payments.length === 0) {
            return `<tr><td colspan="6" class="text-center p-5 text-secondary">
                <i class="fas fa-inbox fa-3x mb-3 text-muted"></i><br>
                No hay pagos registrados para este periodo.
            </td></tr>`;
        }

        return payments.map(payment => `
            <tr class="hover-bg-light">
                <td class="p-3 border-bottom text-center text-secondary align-middle">#${payment.id}</td>
                <td class="p-3 border-bottom text-center align-middle">
                    <span class="badge badge-light border px-2 py-1" style="font-size: 0.85rem;">ORD-${payment.orden_id}</span>
                </td>
                <td class="p-3 border-bottom text-center font-weight-bold text-success align-middle" style="font-size: 1.1em;">
                    Bs. ${this.formatCurrency(payment.monto)}
                </td>
                <td class="p-3 border-bottom text-center align-middle">
                    <span class="badge badge-pill badge-info px-3 py-2 shadow-sm" style="background-color: #e3f2fd; color: #0277bd; border: none;">
                        <i class="fas fa-wallet mr-1"></i> ${payment.metodo_pago || 'N/A'}
                    </span>
                </td>
                <td class="p-3 border-bottom text-center text-secondary align-middle">
                    <i class="far fa-calendar-alt mr-1"></i> ${this.formatDate(payment.fecha_pago)}
                </td>
                <td class="p-3 border-bottom text-center align-middle">
                    <button class="btn btn-sm btn-light text-primary view-btn shadow-sm mr-1" data-id="${payment.id}" title="Ver Detalle" style="border-radius: 6px;">
                        <i class="fas fa-eye"></i>
                    </button>
                    <!--
                    <button class="btn btn-sm btn-light text-danger print-btn shadow-sm" data-id="${payment.id}" title="Imprimir Recibo" style="border-radius: 6px;">
                        <i class="fas fa-print"></i>
                    </button>
                    -->
                </td>
            </tr>
        `).join('');
    }

    /**
     * Formatea una fecha.
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-BO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Formatea un valor monetario.
     */
    formatCurrency(amount) {
        return (amount || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    bindEvents() {
        const newPaymentBtn = document.getElementById('newPaymentBtn');
        if (newPaymentBtn) {
            newPaymentBtn.addEventListener('click', () => {
                if (this.onNewPayment) this.onNewPayment();
            });
        }

        const applyFiltersBtn = document.getElementById('applyFilters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                const fechaInicio = document.getElementById('filterFechaInicio').value;
                const fechaFin = document.getElementById('filterFechaFin').value;
                if (this.onApplyFilters) this.onApplyFilters({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
            });
        }

        // Delegación de eventos para botones en la tabla
        const tableBody = document.getElementById('paymentsTableBody');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const viewBtn = e.target.closest('.view-btn');
                if (viewBtn) {
                    const id = viewBtn.dataset.id;
                    if (this.onViewPayment) this.onViewPayment(id);
                }
                
                const printBtn = e.target.closest('.print-btn');
                if (printBtn) {
                   alert('Función de imprimir recibo próximamente.');
                }
            });
        }
    }

    showPaymentModal() {
        // Formulario simple en el modal
        const formHTML = `
            <form id="paymentForm" class="p-3">
                <div class="form-group mb-3">
                    <label class="font-weight-bold">ID de Orden *</label>
                    <input type="number" name="orden_id" class="form-control" placeholder="Ej: 1024" required>
                    <small class="text-secondary">Ingrese el ID de la orden que se está pagando.</small>
                </div>
                <div class="form-group mb-3">
                    <label class="font-weight-bold">Monto (Bs) *</label>
                    <input type="number" name="monto" class="form-control" step="0.01" placeholder="0.00" required>
                </div>
                <div class="form-group mb-3">
                    <label class="font-weight-bold">Método de Pago *</label>
                    <select name="metodo_pago" class="form-control" required>
                        <option value="">Seleccione...</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                        <option value="Transferencia">Transferencia Bancaria</option>
                        <option value="QR">QR Simple</option>
                    </select>
                </div>
                <div class="d-flex justify-content-end mt-4">
                     <button type="button" class="btn btn-secondary mr-2" id="cancelPaymentBtn">Cancelar</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Guardar Pago</button>
                </div>
            </form>
        `;

        this.modal.open('Registrar Nuevo Pago', formHTML);
        
        // Bind closes
        document.getElementById('cancelPaymentBtn').addEventListener('click', () => this.modal.close());
        
        // Bind submit
        document.getElementById('paymentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            if (this.onSubmitPayment) {
                // Convert types if needed
                data.orden_id = parseInt(data.orden_id);
                data.monto = parseFloat(data.monto);
                this.onSubmitPayment(data);
            }
            this.modal.close();
        });
    }
    
    showDetailModal(payment) {
         const content = `
            <div class="p-4">
                <div class="text-center mb-4">
                    <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 60px; height: 60px;">
                        <i class="fas fa-check fa-2x"></i>
                    </div>
                    <h3 class="text-success">Pago Confirmado</h3>
                    <p class="text-secondary">Referencia #${payment.id}</p>
                </div>
                
                <div class="card border-0 bg-light mb-3">
                    <div class="card-body">
                         <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
                            <span class="text-secondary">Fecha:</span>
                            <span class="font-weight-bold text-dark">${this.formatDate(payment.fecha_pago)}</span>
                         </div>
                         <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
                            <span class="text-secondary">Orden:</span>
                            <span class="font-weight-bold text-primary">#${payment.orden_id}</span>
                         </div>
                         <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
                            <span class="text-secondary">Método:</span>
                            <span class="font-weight-bold text-dark">${payment.metodo_pago}</span>
                         </div>
                         <div class="d-flex justify-content-between pt-2">
                            <span class="text-secondary font-weight-bold pt-1">Total Pagado:</span>
                            <span class="font-weight-bold text-success h4 m-0">Bs. ${this.formatCurrency(payment.monto)}</span>
                         </div>
                    </div>
                </div>
                
                <div class="text-center mt-4">
                    <button class="btn btn-outline-secondary" onclick="document.querySelector('.modal-overlay').remove()">Cerrar</button>
                </div>
            </div>
         `;
         this.modal.open('Detalle del Pago', content);
         
         const closeBtns = document.querySelectorAll('.modal-overlay button');
         closeBtns.forEach(b => b.addEventListener('click', () => this.modal.close()));
    }

    bindNewPayment(handler) {
        this.onNewPayment = handler;
    }

    bindSubmitPayment(handler) {
        this.onSubmitPayment = handler;
    }
    
    bindViewPayment(handler) {
        this.onViewPayment = handler;
    }

    bindApplyFilters(handler) {
        this.onApplyFilters = handler;
    }
    
    // Stub for controller compatibility if needed, or remove calls from controller
    bindPaymentActions(handler) { /* Replaced by specific binders */ } 
    bindCloseModal() { /* Handled internally */ }
}
