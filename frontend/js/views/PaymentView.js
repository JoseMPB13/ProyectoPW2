import ModalView from './components/ModalView.js';

/**
 * Vista de Pagos - Módulo Profesional
 * Maneja la interfaz de cobro con múltiples métodos de pago (Efectivo, QR, Tarjeta)
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
                                <h2 class="m-0 font-weight-bold text-main">${summary.total_pagos || 0}</h2>
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
                </td>
            </tr>
        `).join('');
    }

    /**
     * Muestra el modal de cobro profesional con 3 pestañas (Efectivo, QR, Tarjeta)
     * @param {Object} order - Orden a cobrar
     */
    showPaymentModal(order) {
        // Validar si la orden puede ser cobrada
        const isFinished = order.estado_nombre === 'Finalizado' || order.estado_nombre === 'Entregado' || order.estado_nombre === 'Completado';
        
        if (!isFinished) {
            this.showErrorMessage('No se puede cobrar', `La orden debe estar en estado "Finalizado" o "Entregado" para poder cobrarla.<br>Estado actual: <strong>${order.estado_nombre}</strong>`);
            return;
        }

        const saldoPendiente = order.saldo_pendiente !== undefined ? parseFloat(order.saldo_pendiente) : parseFloat(order.total_estimado || 0);
        const totalOrden = parseFloat(order.total_estimado || 0);
        const totalPagado = totalOrden - saldoPendiente;
        
        const modalContent = `
            <div class="modal-content modal-large">
                <div class="modal-header bg-light border-bottom">
                    <h3 class="font-weight-bold mb-0 text-dark">Cobrar - Orden #${order.id}</h3>
                    <button class="modal-close text-secondary" style="font-size: 1.5rem;">&times;</button>
                </div>

                <div class="modal-body p-0">
                    <div class="invoice-box p-4" style="max-width: 800px; margin: auto; padding: 30px; border: none; font-size: 16px; line-height: 24px;">
                        
                        <!-- Header con información de la orden -->
                        <div class="border-bottom pb-4 mb-4">
                            <div class="row align-items-center">
                                <div class="col-md-6">
                                    <h2 class="text-primary font-weight-bold mb-1">Orden #${order.id}</h2>
                                    <p class="text-secondary mb-0">
                                        <i class="fas fa-car mr-2"></i> ${order.placa || 'N/A'} - ${order.marca || ''} ${order.modelo || ''}
                                    </p>
                                </div>
                                <div class="col-md-6 text-md-right">
                                    <h2 class="mb-0 text-primary font-weight-bold">Bs. ${this.formatCurrency(totalOrden)}</h2>
                                    <small class="text-secondary text-uppercase font-weight-bold">Total de la orden</small>
                                </div>
                            </div>
                            
                            ${totalPagado > 0 ? `
                            <div class="alert alert-info mt-3 mb-0 rounded-pill px-4 shadow-sm border-0 d-inline-block">
                                <i class="fas fa-info-circle mr-2"></i>
                                Abonado: <strong>Bs. ${this.formatCurrency(totalPagado)}</strong>
                                <span class="mx-2">|</span>
                                Pendiente: <strong>Bs. ${this.formatCurrency(saldoPendiente)}</strong>
                            </div>
                            ` : ''}
                        </div>

                        <!-- Tabs de métodos de pago -->
                        <ul class="nav nav-tabs border-bottom-0 mb-4" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active font-weight-bold pb-3" id="tab-pm-cash" data-toggle="tab" href="#pm-cash" role="tab" style="color: var(--text-main);">
                                    <i class="fas fa-money-bill-wave mr-2"></i> Efectivo
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link font-weight-bold pb-3" id="tab-pm-qr" data-toggle="tab" href="#pm-qr" role="tab" style="color: var(--text-main);">
                                    <i class="fas fa-qrcode mr-2"></i> QR
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link font-weight-bold pb-3" id="tab-pm-card" data-toggle="tab" href="#pm-card" role="tab" style="color: var(--text-main);">
                                    <i class="fas fa-credit-card mr-2"></i> Tarjeta
                                </a>
                            </li>
                        </ul>

                        <!-- Tab content -->
                        <div class="tab-content" style="min-height: 300px;">
                            <!-- Efectivo Tab -->
                            <div class="tab-pane fade show active" id="pm-cash" role="tabpanel">
                                ${this.renderCashPaymentTab(order, saldoPendiente)}
                            </div>

                            <!-- QR Tab -->
                            <div class="tab-pane fade" id="pm-qr" role="tabpanel">
                                ${this.renderQRPaymentTab(order, saldoPendiente)}
                            </div>

                            <!-- Tarjeta Tab -->
                            <div class="tab-pane fade" id="pm-card" role="tabpanel">
                                ${this.renderCardPaymentTab(order, saldoPendiente)}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;

        // Manual rendering to bypass ModalView's default structure and fully control the layout (Invoice Style)
        // We reuse ModalView's existingModal property to ensure close() works elsewhere
        this.modal.close(); // Close any existing

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay open';
        overlay.innerHTML = modalContent;

        document.body.appendChild(overlay);
        this.modal.existingModal = overlay; // Hack: Allow this.modal.close() to work

        // Event listeners for close
        overlay.addEventListener('click', (e) => {
             if (e.target === overlay) this.modal.close();
        });

        const closeBtns = overlay.querySelectorAll('.modal-close');
        closeBtns.forEach(btn => btn.addEventListener('click', () => this.modal.close()));
        
        // Pass the overlay to event attachment to scope selectors
        this.attachPaymentModalEvents(order, saldoPendiente, overlay);
    }

    /**
     * Renderiza la pestaña de pago en Efectivo
     */
    /**
     * Muestra el modal con el detalle de un pago realizado.
     */
    showDetailModal(payment) {
        const modalContent = `
            <div class="p-3">
                <div class="text-center mb-4">
                    <div class="mb-3 mx-auto" style="width: 60px; height: 60px; background: #e8f5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-check-circle text-success fa-2x"></i>
                    </div>
                    <h4 class="mb-1">Comprobante de Pago</h4>
                    <p class="text-secondary">${this.formatDate(payment.fecha_pago)}</p>
                </div>

                <div class="card bg-light mb-4 border-0">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="text-secondary">Monto Pagado:</span>
                            <span class="h4 mb-0 text-success">Bs. ${this.formatCurrency(payment.monto)}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-secondary">Método:</span>
                            <span class="font-weight-bold text-uppercase">${payment.metodo_pago}</span>
                        </div>
                        ${payment.referencia ? `
                        <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                            <span class="text-secondary">Referencia:</span>
                            <span class="font-weight-bold">${payment.referencia}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="row">
                    <div class="col-6 mb-3">
                        <small class="d-block text-secondary">Orden ID</small>
                        <strong class="h6">#${payment.orden_id}</strong>
                    </div>
                    <div class="col-6 mb-3">
                        <small class="d-block text-secondary">Vehículo</small>
                        <strong class="h6">${payment.placa || 'N/A'}</strong>
                    </div>
                    <div class="col-12">
                        <small class="d-block text-secondary">Cliente</small>
                        <strong class="h6">${payment.cliente_nombre || 'N/A'}</strong>
                    </div>
                </div>

                <div class="text-center mt-4 pt-3 border-top">
                   <button class="btn btn-primary px-4" onclick="document.querySelector('.modal-overlay')?.remove()">
                       Cerrar
                   </button>
                </div>
            </div>
        `;

        this.modal.open(`Detalle de Pago #${payment.id}`, modalContent);
    }

    renderCashPaymentTab(order, saldoPendiente) {
        return `
            <div class="cash-payment">
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group mb-4">
                            <label class="font-weight-bold small text-uppercase text-secondary">Monto a Cobrar</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-right-0 font-weight-bold text-muted">Bs.</span>
                                <input type="number" id="cash-amount" class="form-control form-control-lg border-left-0 font-weight-bold text-dark" 
                                       value="${saldoPendiente.toFixed(2)}" step="0.01" min="0" 
                                       max="${saldoPendiente.toFixed(2)}" style="font-size: 1.5rem;">
                            </div>
                            <small class="text-secondary mt-1 d-block">Máximo: Bs. ${this.formatCurrency(saldoPendiente)}</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                         <div class="form-group mb-4">
                            <label class="font-weight-bold small text-uppercase text-secondary">Monto Recibido</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-right-0 font-weight-bold text-muted">Bs.</span>
                                <input type="number" id="cash-received" class="form-control form-control-lg border-left-0 font-weight-bold text-success" 
                                       placeholder="0.00" step="0.01" min="0" style="font-size: 1.5rem;">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="alert alert-light border shadow-sm p-3 mb-4" id="cash-change-display" style="display: none; background: #f8f9fa;">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="d-block text-secondary small font-weight-bold text-uppercase">Cambio a devolver</span>
                             <h2 class="mb-0 text-success font-weight-bold" id="cash-change-amount">Bs. 0.00</h2>
                        </div>
                        <div class="icon-circle bg-success text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 50px; height: 50px;">
                             <i class="fas fa-hand-holding-usd fa-lg"></i>
                        </div>
                    </div>
                </div>

                <button id="cash-pay-btn" class="btn btn-success btn-lg btn-block shadow-sm rounded-pill font-weight-bold text-uppercase" disabled style="letter-spacing: 1px;">
                    <i class="fas fa-check-circle mr-2"></i> Confirmar Pago
                </button>
            </div>
        `;
    }

    /**
     * Renderiza la pestaña de pago con QR
     */
    renderQRPaymentTab(order, saldoPendiente) {
        return `
            <div class="qr-payment text-center">
                <div class="form-group mb-4" style="max-width: 300px; margin: 0 auto;">
                    <label class="font-weight-bold small text-uppercase text-secondary">Monto a Cobrar</label>
                    <div class="input-group">
                         <span class="input-group-text bg-light border-right-0 font-weight-bold text-muted">Bs.</span>
                        <input type="number" id="qr-amount" class="form-control form-control-lg border-left-0 text-center font-weight-bold" 
                               value="${saldoPendiente.toFixed(2)}" step="0.01" min="0" 
                               max="${saldoPendiente.toFixed(2)}" style="font-size: 1.5rem;">
                    </div>
                </div>

                <div class="qr-code-container mb-4 p-4 bg-white shadow-sm border rounded" style="display: inline-block;">
                    <div id="qr-code" class="mb-3"></div>
                    <p class="text-secondary mb-0 small"><i class="fas fa-scan mr-1"></i> Escanea con tu app bancaria</p>
                </div>

                <div class="alert alert-info border-0 shadow-sm bg-light-info text-info mb-4 text-left">
                    <div class="d-flex">
                        <i class="fas fa-info-circle fa-lg mt-1 mr-3"></i>
                        <div>
                            <strong>Instrucciones:</strong>
                            <p class="mb-0 small mt-1">El cliente debe escanear el código QR y confirmar la transacción. Una vez realizada, presione "Verificar".</p>
                        </div>
                    </div>
                </div>

                <button id="qr-verify-btn" class="btn btn-primary btn-lg btn-block shadow-sm rounded-pill font-weight-bold text-uppercase" style="letter-spacing: 1px;">
                    <i class="fas fa-search mr-2"></i> Verificar Transferencia
                </button>
            </div>
        `;
    }

    /**
     * Renderiza la pestaña de pago con Tarjeta
     */
    renderCardPaymentTab(order, saldoPendiente) {
        return `
            <div class="card-payment">
                 <div class="form-group mb-4">
                    <label class="font-weight-bold small text-uppercase text-secondary">Monto a Cobrar</label>
                    <div class="input-group">
                        <span class="input-group-text bg-light border-right-0 font-weight-bold text-muted">Bs.</span>
                        <input type="number" id="card-amount" class="form-control form-control-lg border-left-0 font-weight-bold" 
                               value="${saldoPendiente.toFixed(2)}" step="0.01" min="0" 
                               max="${saldoPendiente.toFixed(2)}" style="font-size: 1.5rem;">
                    </div>
                </div>

                <div class="card-form-container p-4 bg-light rounded border mb-4">
                    <div class="form-group mb-3">
                        <label class="font-weight-bold small text-uppercase text-secondary">Número de Tarjeta</label>
                        <div class="input-group">
                            <span class="input-group-text bg-white border-right-0"><i class="far fa-credit-card text-muted"></i></span>
                            <input type="text" id="card-number" class="form-control form-control-lg border-left-0" 
                                   placeholder="0000 0000 0000 0000" maxlength="19" 
                                   style="font-size: 1.2rem; letter-spacing: 2px;">
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group mb-0">
                                <label class="font-weight-bold small text-uppercase text-secondary">Expiración</label>
                                <input type="text" id="card-expiry" class="form-control text-center" 
                                       placeholder="MM/AA" maxlength="5">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group mb-0">
                                <label class="font-weight-bold small text-uppercase text-secondary">CVV</label>
                                <div class="input-group">
                                    <input type="text" id="card-cvv" class="form-control text-center text-security" 
                                           placeholder="123" maxlength="3">
                                    <span class="input-group-text bg-white"><i class="fas fa-lock text-muted small"></i></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button id="card-pay-btn" class="btn btn-success btn-lg btn-block shadow-sm rounded-pill font-weight-bold text-uppercase" disabled style="letter-spacing: 1px;">
                    <i class="fas fa-credit-card mr-2"></i> Procesar Pago
                </button>
            </div>
        `;
    }

    /**
     * Adjunta eventos al modal de pagos
     */
    /**
     * Adjunta eventos al modal de pagos
     */
    attachPaymentModalEvents(order, saldoPendiente, overlay = document) {
        // === TABS HANDLING (Manual Fix - Scoped to this modal) ===
        const tabLinks = overlay.querySelectorAll('.nav-tabs .nav-link');
        const tabContent = overlay.querySelectorAll('.tab-content .tab-pane');

        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove active from all tabs IN THIS MODAL
                tabLinks.forEach(l => l.classList.remove('active'));
                tabContent.forEach(c => {
                    c.classList.remove('show', 'active');
                });

                // Add active to clicked
                link.classList.add('active');
                const targetId = link.getAttribute('href').substring(1);
                const targetPane = overlay.querySelector(`#${targetId}`); // Select by ID within modal context (IDs should be unique anyway)
                if (targetPane) {
                    targetPane.classList.add('show', 'active');
                }
            });
        });

        // === EFECTIVO ===
        const cashAmount = overlay.querySelector('#cash-amount');
        const cashReceived = overlay.querySelector('#cash-received');
        const cashChangeDisplay = overlay.querySelector('#cash-change-display');
        const cashChangeAmount = overlay.querySelector('#cash-change-amount');
        const cashPayBtn = overlay.querySelector('#cash-pay-btn');

        const updateCashChange = () => {
            const amount = parseFloat(cashAmount.value) || 0;
            const received = parseFloat(cashReceived.value) || 0;
            const maxAmount = parseFloat(cashAmount.getAttribute('max')) || Infinity;
            
            // Allow payment if:
            // 1. Amount is greater than 0
            // 2. Received covers amount
            // 3. Amount does not exceed pending balance (max)
            if (amount > 0 && received >= amount && amount <= maxAmount) {
                const change = received - amount;
                cashChangeAmount.textContent = `Bs. ${this.formatCurrency(change)}`;
                cashChangeDisplay.style.display = 'block';
                cashChangeDisplay.classList.remove('alert-danger');
                cashChangeDisplay.classList.add('alert-light');
                
                // Show warning if user tries to pay more than pending, though input restriction helps, 
                // code-wise validation is safer
                if (amount > maxAmount) {
                     cashPayBtn.disabled = true;
                     return;
                }

                cashPayBtn.disabled = false;
            } else {
                if (amount > maxAmount) {
                    cashChangeDisplay.style.display = 'block';
                    cashChangeDisplay.innerHTML = `<span class="text-danger small font-weight-bold">El monto no puede exceder el saldo pendiente (Bs. ${maxAmount.toFixed(2)})</span>`;
                    cashChangeDisplay.classList.remove('alert-light');
                    cashChangeDisplay.classList.add('alert-danger');
                } else {
                    cashChangeDisplay.style.display = 'none';
                }
                cashPayBtn.disabled = true;
            }
        };

        if (cashAmount && cashReceived) {
            cashAmount.addEventListener('input', updateCashChange);
            cashReceived.addEventListener('input', updateCashChange);
            // Initialize state immediately (in case values are pre-filled)
            updateCashChange();
        }

        // Botón de pago en efectivo
        if (cashPayBtn) {
            cashPayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const amount = parseFloat(cashAmount.value);
                this.processPayment(order.id, amount, 'Efectivo', '');
            });
        }

        // === QR ===
        this.generateQRCode(order.id, saldoPendiente, overlay);

        const qrVerifyBtn = overlay.querySelector('#qr-verify-btn');
        if (qrVerifyBtn) {
            qrVerifyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const amount = parseFloat(overlay.querySelector('#qr-amount').value);
                this.simulateQRVerification(order.id, amount);
            });
        }

        // === TARJETA ===
        this.setupCardValidation(overlay);

        const cardPayBtn = overlay.querySelector('#card-pay-btn');
        if (cardPayBtn) {
            cardPayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const amount = parseFloat(overlay.querySelector('#card-amount').value);
                this.simulateCardPayment(order.id, amount);
            });
        }
    }

    /**
     * Genera un código QR simple
     */
    generateQRCode(orderId, amount, overlay) {
        const qrContainer = overlay ? overlay.querySelector('#qr-code') : document.getElementById('qr-code');
        if (qrContainer) {
            // Simulación simple con placeholder - en producción usar qrcode.js
            qrContainer.innerHTML = `
                <div style="width: 200px; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; margin: 0 auto; border: 2px solid #ddd;">
                    <div style="text-align: center;">
                        <i class="fas fa-qrcode fa-5x text-secondary"></i>
                        <p class="mt-2 mb-0 small text-secondary">QR Simulado</p>
                        <p class="mb-0 small"><strong>Bs. ${this.formatCurrency(amount)}</strong></p>
                    </div>
                </div>
            `;
            
            // En producción, usar qrcode.js:
            // new QRCode(qrContainer, {
            //     text: `taller-payment://order/${orderId}?amount=${amount}`,
            //     width: 200,
            //     height: 200
            // });
        }
    }

    /**
     * Configura la validación de tarjeta en tiempo real
     */
    setupCardValidation(overlay) {
        const context = overlay || document;
        const cardNumber = context.querySelector('#card-number');
        const cardExpiry = context.querySelector('#card-expiry');
        const cardCVV = context.querySelector('#card-cvv');
        const cardPayBtn = context.querySelector('#card-pay-btn');

        // Formatear número de tarjeta con espacios cada 4 dígitos
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
                this.validateCardForm(cardPayBtn, context);
            });
        }

        // FFormatear fecha de expiración MM/AA
        if (cardExpiry) {
            cardExpiry.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
                this.validateCardForm(cardPayBtn, context);
            });
        }

        // CVV solo números
        if (cardCVV) {
            cardCVV.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
                this.validateCardForm(cardPayBtn, context);
            });
        }
    }

    /**
     * Valida el formulario de tarjeta
     */
    validateCardForm(submitBtn, context = document) {
        const cardNumber = context.querySelector('#card-number');
        const cardExpiry = context.querySelector('#card-expiry');
        const cardCVV = context.querySelector('#card-cvv');
        const cardAmount = context.querySelector('#card-amount');
        
        const amount = parseFloat(cardAmount.value) || 0;
        const maxAmount = parseFloat(cardAmount.getAttribute('max')) || Infinity;

        const isValid = 
            cardNumber && cardNumber.value.replace(/\s/g, '').length === 16 &&
            cardExpiry && cardExpiry.value.length === 5 &&
            cardCVV && cardCVV.value.length === 3 &&
            amount > 0 && amount <= maxAmount;

        if (submitBtn) {
            submitBtn.disabled = !isValid;
        }
    }

    /**
     * Simula la verificación de pago QR con spinner y animación de éxito
     */
    async simulateQRVerification(orderId, amount) {
        const qrVerifyBtn = document.getElementById('qr-verify-btn');
        const originalHTML = qrVerifyBtn.innerHTML;

        // Mostrar spinner
        qrVerifyBtn.disabled = true;
        qrVerifyBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm mr-2"></span>
            Verificando transferencia con el banco...
        `;

        // Simular delay de 2 segundos
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Procesar pago
        this.processPayment(orderId, amount, 'QR', `QR-${Date.now()}`);
    }

    /**
     * Simula el procesamiento de pago con tarjeta
     */
    async simulateCardPayment(orderId, amount) {
        const cardPayBtn = document.getElementById('card-pay-btn');
        const originalHTML = cardPayBtn.innerHTML;

        // Mostrar spinner
        cardPayBtn.disabled = true;
        cardPayBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm mr-2"></span>
            Procesando pago con el banco...
        `;

        // Simular delay de 2 segundos
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Procesar pago
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const reference = `CARD-${cardNumber.substring(12)}`;
        this.processPayment(orderId, amount, 'Tarjeta', reference);
    }

    /**
     * Procesa el pago y muestra animación de éxito
     */
    processPayment(orderId, amount, metodo, reference) {
        // Cerrar modal actual
        this.modal.close();

        // Mostrar animación de éxito
        this.showSuccessAnimation(amount, metodo);

        // Llamar al handler si está definido
        if (this.onSubmitPayment) {
            this.onSubmitPayment({
                orden_id: orderId,
                monto: amount,
                metodo_pago: metodo,
                referencia: reference
            });
        }
    }

    /**
     * Muestra animación de éxito con check verde
     */
    showSuccessAnimation(amount, metodo) {
         // Close previous modal first
         this.modal.close();

         const overlay = document.createElement('div');
         overlay.className = 'modal-overlay open';
         
         overlay.innerHTML = `
            <div class="modal-content shadow-lg border-0" style="max-width: 450px; border-radius: 16px; overflow: hidden; animation: slideIn 0.3s ease-out;">
                <div class="payment-success text-center p-5 bg-white">
                    <div class="success-checkmark mb-4">
                        <div class="check-icon">
                            <span class="icon-line line-tip"></span>
                            <span class="icon-line line-long"></span>
                            <div class="icon-circle"></div>
                            <div class="icon-fix"></div>
                        </div>
                    </div>
                    <h2 class="text-success font-weight-bold mb-3">¡Pago Exitoso!</h2>
                    <p class="text-secondary mb-4" style="font-size: 1.1rem;">
                        Se ha registrado el pago de<br>
                        <strong class="text-dark">Bs. ${this.formatCurrency(amount)}</strong> mediante <strong class="text-dark">${metodo}</strong>
                    </p>
                    <button class="btn btn-primary btn-block rounded-pill py-2 shadow-sm font-weight-bold btn-close-success">
                        Cerrar y Finalizar
                    </button>
                </div>
            </div>
            
            <style>
                @keyframes slideIn {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .success-checkmark { width: 80px; height: 80px; margin: 0 auto; }
                .check-icon { width: 80px; height: 80px; position: relative; border-radius: 50%; box-sizing: content-box; border: 4px solid #4CAF50; }
                .icon-line { height: 5px; background-color: #4CAF50; display: block; border-radius: 2px; position: absolute; z-index: 10; }
                .line-tip { top: 46px; left: 14px; width: 25px; transform: rotate(45deg); animation: icon-line-tip 0.75s; }
                .line-long { top: 38px; right: 8px; width: 47px; transform: rotate(-45deg); animation: icon-line-long 0.75s; }
                .icon-circle { top: -4px; left: -4px; z-index: 10; width: 80px; height: 80px; border-radius: 50%; position: absolute; box-sizing: content-box; border: 4px solid rgba(76, 175, 80, .5); }
                .icon-fix { top: 8px; width: 5px; left: 26px; z-index: 1; height: 85px; position: absolute; transform: rotate(-45deg); background-color: #fff; }
                @keyframes icon-line-tip { 0% { width: 0; left: 1px; top: 19px; } 54% { width: 0; left: 1px; top: 19px; } 70% { width: 50px; left: -8px; top: 37px; } 84% { width: 17px; left: 21px; top: 48px; } 100% { width: 25px; left: 14px; top: 46px; } }
                @keyframes icon-line-long { 0% { width: 0; right: 46px; top: 54px; } 65% { width: 0; right: 46px; top: 54px; } 84% { width: 55px; right: 0px; top: 35px; } 100% { width: 47px; right: 8px; top: 38px; } }
            </style>
         `;

         document.body.appendChild(overlay);
         this.modal.existingModal = overlay;

         // Event listeners
        overlay.addEventListener('click', (e) => {
             if (e.target === overlay) this.modal.close();
        });
        overlay.querySelector('.btn-close-success').addEventListener('click', () => this.modal.close());

        // Auto-cerrar después de 4 segundos
        setTimeout(() => {
             if(this.modal.existingModal === overlay) this.modal.close();
        }, 4000);
    }

    /**
     * Muestra mensaje de error
     */
    showErrorMessage(title, message) {
        const errorHTML = `
            <div class="text-center p-4">
                <div class="mb-4">
                    <i class="fas fa-exclamation-triangle fa-4x text-warning"></i>
                </div>
                <h4>${title}</h4>
                <p class="text-secondary">${message}</p>
                <button class="btn btn-secondary mt-3" onclick="document.querySelector('.modal-overlay')?.remove()">
                    Cerrar
                </button>
            </div>
        `;
        this.modal.open(title, errorHTML);
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
            });
        }
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
}
