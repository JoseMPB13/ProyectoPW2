/**
 * Vista de Pagos
 * Maneja la renderización de la interfaz de gestión de pagos.
 */
export default class PaymentView {
    constructor() {
        this.contentArea = document.getElementById('contentArea');
    }

    /**
     * Renderiza la vista principal de pagos.
     * @param {Array} payments - Array de pagos a mostrar.
     * @param {Object} summary - Resumen de ingresos.
     */
    render(payments = [], summary = null) {
        this.contentArea.innerHTML = `
            <div class="payments-container">
                <div class="payments-header">
                    <h2>Gestión de Pagos</h2>
                    <button id="newPaymentBtn" class="btn btn-primary">Registrar Pago</button>
                </div>

                ${summary ? this.renderSummaryCards(summary) : ''}

                <div class="payments-filters">
                    <input type="date" id="filterFechaInicio" class="filter-input" placeholder="Fecha Inicio">
                    <input type="date" id="filterFechaFin" class="filter-input" placeholder="Fecha Fin">
                    <button id="applyFilters" class="btn btn-secondary">Aplicar Filtros</button>
                </div>

                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Orden ID</th>
                                <th>Monto</th>
                                <th>Método de Pago</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="paymentsTableBody">
                            ${this.renderPaymentRows(payments)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza las tarjetas de resumen.
     */
    renderSummaryCards(summary) {
        return `
            <div class="summary-cards">
                <div class="card summary-card">
                    <h4>Total Ingresos</h4>
                    <p class="summary-value">Bs. ${this.formatCurrency(summary.total_ingresos || 0)}</p>
                </div>
                <div class="card summary-card">
                    <h4>Pagos del Mes</h4>
                    <p class="summary-value">${summary.total_pagos || 0}</p>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza las filas de la tabla de pagos.
     */
    renderPaymentRows(payments) {
        if (!payments || payments.length === 0) {
            return '<tr><td colspan="6" class="text-center">No hay pagos registrados</td></tr>';
        }

        return payments.map(payment => `
            <tr>
                <td>${payment.id}</td>
                <td>${payment.orden_id}</td>
                <td>Bs. ${this.formatCurrency(payment.monto)}</td>
                <td><span class="badge badge-info">${payment.metodo_pago || 'N/A'}</span></td>
                <td>${this.formatDate(payment.fecha_pago)}</td>
                <td>
                    <button class="btn btn-sm btn-info" data-action="view" data-id="${payment.id}">Ver</button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Renderiza el modal para registrar un pago.
     */
    renderPaymentModal() {
        const modalHTML = `
            <div class="modal" id="paymentModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Registrar Pago</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="paymentForm">
                            <div class="form-group">
                                <label for="ordenId">ID de Orden*</label>
                                <input type="number" id="ordenId" required>
                            </div>
                            <div class="form-group">
                                <label for="monto">Monto (Bs.)*</label>
                                <input type="number" id="monto" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label for="metodoPago">Método de Pago*</label>
                                <select id="metodoPago" required>
                                    <option value="">Seleccione...</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="QR">QR</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary cancel-modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Cierra y elimina el modal.
     */
    closeModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) modal.remove();
    }

    /**
     * Muestra un mensaje de error.
     */
    showError(message) {
        alert('Error: ' + message);
    }

    /**
     * Muestra un mensaje de éxito.
     */
    showSuccess(message) {
        alert('Éxito: ' + message);
    }

    /**
     * Formatea una fecha.
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-BO');
    }

    /**
     * Formatea un valor monetario.
     */
    formatCurrency(amount) {
        return (amount || 0).toFixed(2);
    }

    /**
     * Vincula eventos.
     */
    bindNewPayment(handler) {
        this.contentArea.addEventListener('click', (e) => {
            if (e.target.id === 'newPaymentBtn') {
                handler();
            }
        });
    }

    bindSubmitPayment(handler) {
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'paymentForm') {
                e.preventDefault();
                const formData = {
                    orden_id: parseInt(document.getElementById('ordenId').value),
                    monto: parseFloat(document.getElementById('monto').value),
                    metodo_pago: document.getElementById('metodoPago').value
                };
                handler(formData);
            }
        });
    }

    bindCloseModal() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal') || 
                e.target.classList.contains('cancel-modal')) {
                this.closeModal();
            }
        });
    }

    bindPaymentActions(handler) {
        this.contentArea.addEventListener('click', (e) => {
            if (e.target.dataset.action) {
                const action = e.target.dataset.action;
                const id = e.target.dataset.id;
                handler(action, id);
            }
        });
    }

    bindApplyFilters(handler) {
        this.contentArea.addEventListener('click', (e) => {
            if (e.target.id === 'applyFilters') {
                const fechaInicio = document.getElementById('filterFechaInicio').value;
                const fechaFin = document.getElementById('filterFechaFin').value;
                handler({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
            }
        });
    }
}
