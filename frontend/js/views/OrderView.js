/**
 * Vista de Órdenes - Versión Mejorada
 * Gestión completa de órdenes de trabajo con búsqueda, filtros y modales.
 */
export default class OrderView {
  constructor() {
    this.contentArea = document.getElementById("contentArea");
    this.modal = null;
    this.detailModal = null;
    this.currentOrders = [];
    this.filteredOrders = [];
    // Handlers
    this.onAction = null;
    this.onNewOrder = null;
    this.onPageChange = null;
    this.onFilter = null;
    this.onSearch = null;
    this.onSubmitEdit = null;
    this.onSubmitNewOrder = null;
  }

  showLoading() {
    // Create spinner if not exists
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';

    // Disable all buttons
    document.querySelectorAll('button').forEach(btn => btn.disabled = true);
  }

  hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) overlay.style.display = 'none';

    // Enable all buttons
    document.querySelectorAll('button').forEach(btn => btn.disabled = false);
  }

  /**
   * Renderiza la vista principal de órdenes.
   */
  render(orders = [], pagination = {}, filters = {}) {
    this.currentOrders = orders;
    this.filteredOrders = orders;

    // Helper to determine if an option is selected
    const isSelected = (val) => (filters.estadoNombre === val ? 'selected' : '');

    this.contentArea.innerHTML = `
            <div class="card fade-in">
                <!-- Header -->
                <div class="card-header d-flex justify-content-between align-items-center mb-4 border-bottom pb-3" style="background: transparent;">
                    <div>
                        <h2 class="h3 mb-1 font-weight-bold text-main">Gestión de Órdenes</h2>
                        <p class="text-muted small mb-0">Administra y da seguimiento a las órdenes de servicio</p>
                    </div>
                    <div class="d-flex gap-3 align-items-center">
                         <div class="search-wrapper position-relative">
                            <i class="fas fa-search position-absolute text-muted" style="left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.9rem;"></i>
                            <input 
                                type="text" 
                                id="searchOrders" 
                                placeholder="Buscar..." 
                                class="form-control pl-5 bg-input text-main"
                                style="padding-left: 35px; border-radius: 8px;"
                                value="${filters.search || ''}"
                            >
                        </div>
                        <button id="newOrderBtn" class="btn btn-success text-white d-flex align-items-center gap-2 px-4 shadow-sm" style="border-radius: 8px;">
                            <i class="fas fa-plus"></i>
                            <span>Nueva Orden</span>
                        </button>
                    </div>
                </div>

                <!-- Filters Bar (Secondary) -->
                <div class="filters-bar mb-4 bg-card p-3 rounded border">
                    <div class="d-flex align-items-center">
                        <label for="filterEstado" class="mr-3 font-weight-500 text-muted mb-0">Filtrar por Estado:</label>
                        <select id="filterEstado" class="form-control bg-input text-main" style="max-width: 200px;">
                            <option value="" ${isSelected('')}>Todos los estados</option>
                            <option value="Pendiente" ${isSelected('Pendiente')}>Pendiente</option>
                            <option value="En Proceso" ${isSelected('En Proceso')}>En Proceso</option>
                            <option value="Finalizado" ${isSelected('Finalizado')}>Finalizado</option>
                            <option value="Entregado" ${isSelected('Entregado')}>Entregado</option>
                        </select>
                    </div>
                </div>

                <!-- Orders Table -->
                <div class="order-table-container">
                    <table class="order-table data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Vehículo</th>
                                <th>Técnico</th>
                                <th>Fecha Ingreso</th>
                                <th>Total Est.</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="ordersTableBody">
                           ${this.renderOrderTableRows(orders)}
                        </tbody>
                    </table>
                </div>


                <!-- Pagination -->
                <div class="mt-4 border-top pt-3">
                    ${this.renderPagination(pagination)}
                </div>
            </div>
        `;

    // Restore focus if search was active
    if (filters.search) {
        requestAnimationFrame(() => {
            const input = this.contentArea.querySelector("#searchOrders");
            if (input) {
                input.focus();
                input.setSelectionRange(input.value.length, input.value.length);
            }
        });
    }

    // Attach events to the newly created view root
    const viewRoot = this.contentArea.querySelector(".card");
    if (viewRoot) {
      this.attachViewEvents(viewRoot);
    }
  }

  attachViewEvents(viewRoot) {
    // New Order Button
    const newOrderBtn = viewRoot.querySelector("#newOrderBtn");
    if (newOrderBtn) {
      newOrderBtn.addEventListener("click", () => {
        if (this.onNewOrder) this.onNewOrder();
      });
    }

    // Search
    const searchInput = viewRoot.querySelector("#searchOrders");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        if (this.onSearch) this.onSearch(e.target.value);
      });
    }

    // Filters
    const filterSelect = viewRoot.querySelector("#filterEstado");
    if (filterSelect) {
      filterSelect.addEventListener("change", (e) => {
        if (this.onFilter) this.onFilter(e.target.value);
      });
    }

    // Clear Filters logic removed as requested by user

    // Pagination
    const prevBtn = viewRoot.querySelector("#prevPage");
    const nextBtn = viewRoot.querySelector("#nextPage");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (this.onPageChange) this.onPageChange("prev");
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (this.onPageChange) this.onPageChange("next");
      });
    }

    // Table Actions Delegation
    const tableBody = viewRoot.querySelector("#ordersTableBody");
    if (tableBody) {
      tableBody.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (btn && btn.dataset.action) {
          const action = btn.dataset.action;
          const id = btn.dataset.id;
          if (this.onAction) this.onAction(action, id);
        }
      });
    }
  }

  bindNewOrder(handler) {
    this.onNewOrder = handler;
  }

  bindPagination(handler) {
    this.onPageChange = handler;
  }

  bindFilter(handler) {
    this.onFilter = handler;
  }

  bindSearch(handler) {
    this.onSearch = handler;
  }


  /**
   * Renderiza las filas de la tabla de órdenes using logic similar to RenderOrderCards but for table.
   */
  renderOrderTableRows(orders) {
    if (!orders || orders.length === 0) {
      return `
            <tr>
                <td colspan="8">
                    <div class="empty-state-container">
                        <div class="mb-3">
                             <i class="fas fa-clipboard-list text-muted fa-3x"></i>
                        </div>
                        <h4 class="font-weight-bold mb-2 text-main">No hay órdenes registradas</h4>
                        <p class="text-muted mb-4">Comienza creando una nueva orden de servicio</p>
                        <button class="btn btn-primary px-4 py-2 shadow-sm rounded-pill" onclick="document.getElementById('newOrderBtn').click()">
                            <i class="fas fa-plus mr-2"></i> Nueva Orden
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    return orders.map(order => {
      // Status Badge Logic
      let statusClass = 'secondary';
      const s = (order.estado_nombre || '').toLowerCase();
      if (s.includes('pendiente')) statusClass = 'pendiente';
      else if (s.includes('proceso')) statusClass = 'proceso';
      else if (s.includes('finaliz') || s.includes('entregado') || s.includes('completado')) statusClass = 'finalizado';
      else if (s.includes('cancel')) statusClass = 'cancelado';

      return `
            <tr>
                <td class="font-weight-bold text-main">#${order.id}</td>
                <td>
                    <div class="font-weight-500">${order.cliente_nombre || 'Sin Cliente'}</div>
                </td>
                <td>
                    <div class="font-weight-500">${order.placa || 'N/A'}</div>
                    <div class="text-xs text-muted">${order.marca || ''} ${order.modelo || ''}</div>
                </td>
                <td>
                    <div class="font-weight-500 text-secondary">${order.tecnico_nombre || 'Sin Asignar'}</div>
                </td>
                <td>
                    <i class="far fa-calendar-alt text-muted mr-1"></i>
                    ${this.formatDate(order.fecha_ingreso)}
                </td>
                <td class="font-weight-bold">
                    Bs. ${this.formatCurrency(order.total_estimado)}
                </td>
                <td>
                    <span class="badge-status ${statusClass}">
                        ${order.estado_nombre || 'Pendiente'}
                    </span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary mr-1 btn-view" data-action="view" data-id="${order.id}" title="Ver Detalle">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary mr-1 btn-edit" data-action="edit" data-id="${order.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${(s.includes('finaliz') || s.includes('entregado') || s.includes('completado')) ? `
                        <button class="btn btn-sm btn-outline-success btn-pay" data-action="payment" data-id="${order.id}" title="Cobrar">
                            <i class="fas fa-money-bill-wave"></i>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
  }

  /**
   * Renderiza la paginación.
   */
  renderPagination(pagination) {
    if (!pagination || pagination.pages <= 1) return "";

    return `
        <div class="d-flex justify-content-center align-items-center mt-5">
            <nav aria-label="Order pagination">
                <ul class="pagination mb-0 gap-2 align-items-center" style="border: none; background: transparent;">
                    <!-- Previous Button -->
                    <li class="page-item ${pagination.current_page <= 1 ? "disabled" : ""}">
                        <button 
                            id="prevPage" 
                            class="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center" 
                            style="width: 40px; height: 40px; border: 1px solid #e2e8f0;"
                            ${pagination.current_page <= 1 ? "disabled" : ""}
                            title="Anterior"
                        >
                            <i class="fas fa-chevron-left text-secondary" style="font-size: 0.8rem;"></i>
                        </button>
                    </li>

                    <!-- Page Info -->
                    <li class="page-item disabled mx-3">
                        <span class="text-secondary font-weight-500 small">
                            Página <span class="text-dark font-weight-bold">${pagination.current_page || 1}</span> de ${pagination.pages || 1}
                        </span>
                    </li>

                    <!-- Next Button -->
                    <li class="page-item ${pagination.current_page >= pagination.pages ? "disabled" : ""}">
                        <button 
                            id="nextPage" 
                            class="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center" 
                            style="width: 40px; height: 40px; border: 1px solid #e2e8f0;"
                            ${pagination.current_page >= pagination.pages ? "disabled" : ""}
                            title="Siguiente"
                        >
                            <i class="fas fa-chevron-right text-secondary" style="font-size: 0.8rem;"></i>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    `;
  }

  /**
   * Muestra el modal con los detalles completos de la orden.
   */
  showOrderDetails(order) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay open";
    modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>Detalles de la Orden #${order.id}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                
                <div class="modal-body p-0">
                    <div class="invoice-box p-4" style="max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px;">
                        <!-- Invoice Header -->
                        <div class="row mb-4 border-bottom pb-4 align-items-center">
                            <div class="col-8">
                                <h2 class="text-primary font-weight-bold mb-1"><i class="fas fa-wrench mr-2"></i>TALLER APP</h2>
                                <p class="text-secondary small mb-0">Comprobante de Servicio</p>
                            </div>
                            <div class="col-4 text-right">
                                <h4 class="mb-0 text-dark">ORDEN #${order.id}</h4>
                                <div class="text-secondary small">Fecha: ${this.formatDate(order.fecha_ingreso)}</div>
                                <div class="mt-2">
                                     <span class="badge badge-${this.getStatusClass(order.estado_nombre)} px-3 py-1">
                                        ${order.estado_nombre || "Pendiente"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Client & Vehicle Grid -->
                        <div class="row mb-4">
                            <div class="col-6">
                                <h6 class="text-uppercase text-secondary small font-weight-bold border-bottom pb-1 mb-2">Cliente</h6>
                                <h5 class="font-weight-bold mb-1 text-main">${order.cliente_nombre || "Sin cliente"}</h5>
                                <p class="text-secondary small mb-0">CI: ${order.cliente_ci || 'N/A'}</p>
                                <p class="text-secondary small mb-0">${order.cliente_correo || ''}</p>
                                <p class="text-secondary small">${order.cliente_telefono || ''}</p>
                            </div>
                             <div class="col-6">
                                <h6 class="text-uppercase text-secondary small font-weight-bold border-bottom pb-1 mb-2">Vehículo</h6>
                                <h5 class="font-weight-bold mb-1 text-main">${order.placa || "N/A"}</h5>
                                <p class="text-secondary small mb-0">${order.marca || ''} ${order.modelo || ''} ${order.anio || ''}</p>
                                <p class="text-secondary small">VIN: ${order.vin || 'N/A'}</p>
                            </div>
                        </div>

                         <!-- Diagnostic Block -->
                        <div class="mb-4 bg-light p-3 rounded border">
                            <div class="row">
                                <div class="col-md-6 mb-2 mb-md-0">
                                    <label class="small font-weight-bold text-secondary text-uppercase mb-1">Problema Reportado</label>
                                    <div class="text-dark small">${order.problema_reportado || "No especificado"}</div>
                                </div>
                                <div class="col-md-6">
                                    <label class="small font-weight-bold text-secondary text-uppercase mb-1">Diagnóstico Técnico</label>
                                    <div class="text-dark small font-italic">${order.diagnostico || "Pendiente de diagnóstico (Técnico: " + (order.tecnico_nombre || "Sin asignar") + ")"}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Services & Parts Table (Invoice Items) -->
                        <div class="mb-4">
                            <table class="table table-sm table-borderless">
                                <thead class="border-bottom text-uppercase small text-secondary">
                                    <tr>
                                        <th style="width: 50%">Descripción</th>
                                        <th class="text-center" style="width: 15%">Cant.</th>
                                        <th class="text-right" style="width: 15%">P. Unit</th>
                                        <th class="text-right" style="width: 20%">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Servicios Header -->
                                    <tr class="bg-light"><td colspan="4" class="py-1 px-2 small font-weight-bold text-secondary">SERVICIOS</td></tr>
                                    ${(order.detalles_servicios && order.detalles_servicios.length > 0) 
                                        ? order.detalles_servicios.map(s => `
                                            <tr>
                                                <td>${s.servicio_nombre || s.servicio?.nombre || 'Servicio'}</td>
                                                <td class="text-center">1</td>
                                                <td class="text-right">${this.formatCurrency(s.precio_aplicado || s.precio)}</td>
                                                <td class="text-right">${this.formatCurrency(s.precio_aplicado || s.precio)}</td>
                                            </tr>`).join('') 
                                        : '<tr><td colspan="4" class="text-muted small font-italic pl-3">Sin servicios registrados</td></tr>'
                                    }

                                    <!-- Repuestos Header -->
                                    <tr class="bg-light"><td colspan="4" class="py-1 px-2 small font-weight-bold text-secondary mt-2">REPUESTOS</td></tr>
                                    ${(order.detalles_repuestos && order.detalles_repuestos.length > 0)
                                        ? order.detalles_repuestos.map(r => `
                                            <tr>
                                                <td>${r.repuesto_nombre || r.repuesto?.nombre || 'Repuesto'}</td>
                                                <td class="text-center">${r.cantidad}</td>
                                                <td class="text-right">${this.formatCurrency(r.precio_unitario_aplicado || r.precio)}</td>
                                                <td class="text-right">${this.formatCurrency((r.cantidad * (r.precio_unitario_aplicado || r.precio)))}</td>
                                            </tr>`).join('')
                                        : '<tr><td colspan="4" class="text-muted small font-italic pl-3">Sin repuestos registrados</td></tr>'
                                    }
                                </tbody>
                            </table>
                        </div>

                        <!-- Totals -->
                        <div class="row justify-content-end">
                            <div class="col-md-5">
                                <div class="d-flex justify-content-between mb-2 pb-2 border-bottom">
                                    <span class="font-weight-bold">Total Estimado</span>
                                    <span class="font-weight-bold h5 mb-0">Bs. ${this.formatCurrency(order.total_estimado)}</span>
                                </div>
                                <div class="d-flex justify-content-between text-secondary small mb-1">
                                    <span>Pagado</span>
                                    <span>Bs. ${this.formatCurrency(order.total_pagado || 0)}</span>
                                </div>
                                <div class="d-flex justify-content-between text-${(order.saldo_pendiente > 0) ? 'danger' : 'success'} small font-weight-bold">
                                    <span>Saldo Pendiente</span>
                                    <span>Bs. ${this.formatCurrency(order.saldo_pendiente || order.total_estimado)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer bg-light border-top p-3 d-flex justify-content-between align-items-center">
                    <button class="btn btn-danger btn-close-modal px-4 rounded-pill shadow-sm text-white">
                        <i class="fas fa-times me-2"></i> Cerrar
                    </button>
                    <div class="d-flex align-items-center gap-2">
                        ${this._renderInlinePaymentButton(order)}
                        <button class="btn btn-primary px-4 rounded-pill shadow-sm" data-action="edit" data-id="${order.id}">
                            <i class="fas fa-edit me-2"></i> Editar Orden
                        </button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    this.attachModalEvents(modal);
  }

  _renderInlinePaymentButton(order) {
    // Normalizar estado (remover espacios y normalizar mayúsculas/minúsculas si es necesario)
    const status = (order.estado_nombre || '').trim();
    
    // Lista de estados considerados "Finalizados" que permiten cobro
    const finalStates = ['Finalizado', 'Entregado', 'Completado'];
    
    const isFinished = finalStates.includes(status);
    const saldo = order.saldo_pendiente !== undefined ? parseFloat(order.saldo_pendiente) : parseFloat(order.total_estimado || 0);

    // Solo mostrar si está finalizado y tiene saldo pendiente mayor a 0
    if (isFinished && saldo > 0.1) {
        return `
            <button class="btn btn-success px-4 rounded-pill shadow-sm ms-2" data-action="payment" data-id="${order.id}">
                <i class="fas fa-credit-card me-2"></i> Cobrar
            </button>
        `;
    }
    return '';
  }

  /**
   * Renderiza el botón de cobro.
   */
  renderPaymentButton(order) {
    // Normalizar estado
    const status = (order.estado_nombre || '').trim();
    // Permitir estados finales
    const isFinished = ['Finalizado', 'Entregado', 'Completado'].includes(status);
    // Verificar saldo
    const saldo = order.saldo_pendiente !== undefined ? parseFloat(order.saldo_pendiente) : parseFloat(order.total_estimado || 0);
    const hasPendingBalance = saldo > 0.1;

    // SIEMPRE mostrar botón
    if (isFinished && hasPendingBalance) {
      return `
        <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 8px; text-align: center;">
            <button class="btn btn-success" data-action="payment" data-id="${order.id}" 
                    style="width: 100%; justify-content: center; display: flex; align-items: center; padding: 12px; font-size: 1.1em; border-radius: 8px;">
              <i class="fas fa-credit-card mr-2"></i> Cobrar Bs. ${this.formatCurrency(saldo)}
            </button>
        </div>
      `;
    } else if (isFinished && !hasPendingBalance) {
      return `
        <div style="margin-top: 15px; text-align: center;">
            <button disabled style="width: 100%; padding: 10px; background: #e9ecef; border: 1px solid #ced4da; border-radius: 5px; color: #28a745; font-weight: bold; display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-check-circle mr-2"></i> Orden Pagada
            </button>
        </div>
      `;
    } else {
      return `
        <div style="margin-top: 15px; text-align: center;">
            <button disabled style="width: 100%; padding: 10px; background: #e9ecef; border: 1px solid #ced4da; border-radius: 5px; color: #6c757d; display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-exclamation-triangle mr-2"></i> Finalizar orden para cobrar
            </button>
        </div>
      `;
    }
  }

  /**
   * Renderiza la sección de servicios en el modal de detalles.
   */
  renderServicesSection(servicios) {
    const list = servicios || [];

    if (list.length === 0) {
      return `
                <div class="detail-section">
                    <h4>Servicios</h4>
                    <p class="text-secondary">No hay servicios registrados</p>
                </div>
            `;
    }

    return `
            <div class="detail-section">
                <h4>Servicios (${list.length})</h4>
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>Servicio</th>
                            <th>Precio Aplicado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list
        .map((s) => {
          // Backend envía 'servicio_nombre'
          const nombre =
            s.servicio_nombre ||
            (s.servicio
              ? s.servicio.nombre
              : "Servicio Desconocido");
          const precio =
            s.precio_aplicado !== undefined
              ? Number(s.precio_aplicado)
              : Number(s.precio) || 0;
          return `
                                <tr>
                                    <td>${nombre}</td>
                                    <td>Bs. ${this.formatCurrency(precio)}</td>
                                </tr>
                            `;
        })
        .join("")}
                    </tbody>
                </table>
            </div>
        `;
  }

  /**
   * Renderiza la sección de repuestos en el modal de detalles.
   */
  renderPartsSection(repuestos) {
    const list = repuestos || [];

    if (list.length === 0) {
      return `
                <div class="detail-section">
                    <h4>Repuestos</h4>
                    <p class="text-secondary">No hay repuestos registrados</p>
                </div>
            `;
    }

    return `
            <div class="detail-section">
                <h4>Repuestos (${list.length})</h4>
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>Repuesto</th>
                            <th>Cantidad</th>
                            <th>P. Unitario</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list
        .map((r) => {
          // Backend envía 'repuesto_nombre'
          const nombre =
            r.repuesto_nombre ||
            (r.repuesto
              ? r.repuesto.nombre
              : "Repuesto Desconocido");
          const cantidad = Number(r.cantidad) || 0;
          const precio =
            r.precio_unitario_aplicado !== undefined
              ? Number(r.precio_unitario_aplicado)
              : Number(r.precio) || 0;
          const subtotal = cantidad * precio;

          return `
                                <tr>
                                    <td>${nombre}</td>
                                    <td class="text-center">${cantidad}</td>
                                    <td>Bs. ${this.formatCurrency(precio)}</td>
                                    <td>Bs. ${this.formatCurrency(subtotal)}</td>
                                </tr>
                            `;
        })
        .join("")}
                    </tbody>
                </table>
            </div>
        `;
  }

  /**
   * Muestra el modal para editar una orden.
   */
  /**
   * Muestra el modal para editar una orden.
   */
  showEditModal(order, formData) {
    // Encontrar cliente actual basado en el auto de la orden
    const currentAuto = (formData.vehicles || []).find(
      (v) => v.id == order.auto_id,
    );
    const currentClientId = currentAuto ? currentAuto.cliente_id : null;

    const modal = document.createElement("div");
    modal.className = "modal-overlay open";
    modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header bg-light border-bottom">
                    <h3 class="font-weight-bold mb-0 text-dark">Editar Orden #${order.id}</h3>
                    <button class="modal-close text-secondary" style="font-size: 1.5rem;">&times;</button>
                </div>
                
                <div class="modal-body p-0">
                    <form id="editOrderForm" class="invoice-box p-4" style="max-width: 800px; margin: auto; padding: 30px; border: none; font-size: 16px; line-height: 24px;">
                        
                        <!-- Header inside form removed as we have modal header -->
                        <div class="mb-4">
                            <p class="text-secondary small mb-0">Modifique los detalles de la orden existente.</p>
                        </div>

                        <!-- Top Info Grid -->
                        <div class="row">
                             <!-- Left Column: Client & Vehicle -->
                            <div class="col-md-6 border-right">
                                <h6 class="text-uppercase text-secondary small font-weight-bold mb-3">Información del Cliente</h6>
                                <div class="form-group mb-3">
                                    <label for="editOrderClient" class="small font-weight-bold">Cliente *</label>
                                    <select id="editOrderClient" name="client_id" class="form-control form-control-sm" required>
                                        <option value="">Seleccionar cliente...</option>
                                        ${(formData.clients || []).map(c => `<option value="${c.id}" ${c.id == currentClientId ? "selected" : ""}>${c.nombre} ${c.apellido || ""}</option>`).join("")}
                                    </select>
                                </div>
                                <div class="form-group mb-3">
                                    <label for="editOrderAuto" class="small font-weight-bold">Vehículo *</label>
                                    <select id="editOrderAuto" name="auto_id" class="form-control form-control-sm" required>
                                        ${currentClientId 
                                            ? (formData.vehicles || []).filter(v => v.cliente_id == currentClientId).map(v => `<option value="${v.id}" ${v.id == order.auto_id ? "selected" : ""}>${v.marca} ${v.modelo} (${v.placa})</option>`).join("")
                                            : '<option value="">Seleccione un cliente primero</option>'
                                        }
                                    </select>
                                </div>
                            </div>

                            <!-- Right Column: Operational Info -->
                            <div class="col-md-6 pl-md-4">
                                <h6 class="text-uppercase text-secondary small font-weight-bold mb-3">Detalles Operativos</h6>
                                <div class="form-row">
                                    <div class="col-md-6 form-group mb-3">
                                        <label for="editTecnico" class="small font-weight-bold">Técnico *</label>
                                        <select id="editTecnico" name="tecnico_id" class="form-control form-control-sm" required>
                                            <option value="">Seleccionar...</option>
                                            ${(formData.tecnicos || []).map(t => `<option value="${t.id}" ${t.id == order.tecnico_id ? "selected" : ""}>${t.nombre} ${t.apellido_p || ""}</option>`).join("")}
                                        </select>
                                    </div>
                                    <div class="col-md-6 form-group mb-3">
                                        <label for="editEstado" class="small font-weight-bold">Estado *</label>
                                        <select id="editEstado" name="estado_id" class="form-control form-control-sm" required>
                                            ${(formData.estados || []).map(e => `<option value="${e.id}" ${e.id == order.estado_id ? "selected" : ""}>${e.nombre_estado}</option>`).join("")}
                                        </select>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="col-md-6 form-group mb-3">
                                        <label for="editFechaIngreso" class="small font-weight-bold">Ingreso</label>
                                        <input type="datetime-local" id="editFechaIngreso" name="fecha_ingreso" class="form-control form-control-sm" value="${order.fecha_ingreso ? order.fecha_ingreso.slice(0, 16) : ""}">
                                    </div>
                                    <div class="col-md-6 form-group mb-3">
                                        <label for="editFechaEntrega" class="small font-weight-bold">Entrega/Salida</label>
                                        <input type="datetime-local" id="editFechaEntrega" name="fecha_entrega" class="form-control form-control-sm" value="${order.fecha_entrega ? order.fecha_entrega.slice(0, 16) : ""}">
                                    </div>
                                </div>
                            </div>
                        </div>

                         <!-- Problem & Diagnosis Full Width -->
                        <div class="mt-3 pt-3 border-top">
                            <div class="form-group">
                                <label for="editProblema" class="small font-weight-bold text-uppercase">Problema Reportado</label>
                                <textarea id="editProblema" name="problema_reportado" class="form-control" rows="2">${order.problema_reportado || ""}</textarea>
                            </div>
                            <div class="form-group mt-3">
                                <label for="editDiagnostico" class="small font-weight-bold text-uppercase">Diagnóstico y Observaciones</label>
                                <textarea id="editDiagnostico" name="diagnostico" class="form-control" rows="3" placeholder="Diagnóstico técnico...">${order.diagnostico || ""}</textarea>
                            </div>
                        </div>

                        <!-- Dynamic Tables -->
                        <div class="mt-4">
                            <h6 class="text-uppercase text-secondary small font-weight-bold border-bottom pb-2">Servicios y Repuestos</h6>
                            <div class="px-2 pt-2 bg-light rounded border">
                                ${this.renderServicesTable(formData.servicios || [], order.detalles_servicios || [])}
                                ${this.renderPartsTable(formData.repuestos || [], order.detalles_repuestos || [])}
                            </div>
                        </div>

                        <!-- Totals -->
                        <div class="row justify-content-end mt-4">
                            <div class="col-md-5">
                                <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                    <span class="font-weight-bold">Total Estimado</span>
                                    <div class="input-group input-group-sm" style="width: 150px;">
                                        <span class="input-group-text bg-white border-right-0">Bs.</span>
                                        <input type="number" id="editTotal" name="total_estimado" class="form-control font-weight-bold text-right border-left-0" step="0.01" value="${order.total_estimado || 0}" readonly>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div class="modal-footer bg-light border-top p-3 d-flex justify-content-between align-items-center">
                    <button type="button" class="btn btn-danger btn-close-modal px-4 rounded-pill shadow-sm text-white">
                        <i class="fas fa-times me-2"></i> Cancelar
                    </button>
                    <button type="submit" form="editOrderForm" class="btn btn-primary px-4 rounded-pill shadow-sm">
                        <i class="fas fa-save me-2"></i> Guardar Cambios
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    this.attachModalEvents(modal);
    this.attachDetailsLogic(
      modal,
      formData.servicios || [],
      formData.repuestos || [],
    );
    this.attachEditCascade(modal, formData.vehicles || []);
    this.attachFormEvents(modal, order.id);
  }

  /**
   * Muestra el modal para crear una nueva orden.
   */
  showNewOrderModal(data) {
    const { clients, vehicles, tecnicos, estados } = data;

    // Default date: Now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const defaultDate = now.toISOString().slice(0, 16);

    const modal = document.createElement("div");
    modal.className = "modal-overlay open";
    modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header bg-light border-bottom">
                    <h3 class="font-weight-bold mb-0 text-dark">Nueva Orden de Servicio</h3>
                    <button class="modal-close text-secondary" style="font-size: 1.5rem;">&times;</button>
                </div>
                
                <form id="newOrderForm" class="modal-body p-4">
                    <div class="row g-3">
                        <!-- Columna 1: Información Principal -->
                        <div class="col-md-6">
                            <h5 class="mb-3 text-primary border-bottom pb-2">Información del Cliente</h5>
                            
                            <div class="form-group mb-3">
                                <label for="newOrderClient" class="form-label font-weight-bold small text-uppercase">Cliente *</label>
                                <select id="newOrderClient" name="client_id" class="form-control form-select shadow-sm" required>
                                    <option value="">Seleccionar cliente...</option>
                                    ${(clients || []).map(c => `
                                        <option value="${c.id}">${c.nombre} ${c.apellido_p || ''} ${c.ci ? `(${c.ci})` : ''}</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="form-group mb-3">
                                <label for="newOrderAuto" class="form-label font-weight-bold small text-uppercase">Vehículo *</label>
                                <select id="newOrderAuto" name="auto_id" class="form-control form-select shadow-sm" required disabled>
                                    <option value="">Seleccione un cliente primero</option>
                                </select>
                            </div>
                        </div>

                        <!-- Columna 2: Detalles del Trabajo -->
                        <div class="col-md-6">
                            <h5 class="mb-3 text-primary border-bottom pb-2">Detalles del Servicio</h5>

                            <div class="form-group mb-3">
                                <label for="newOrderTecnico" class="form-label font-weight-bold small text-uppercase">Técnico Asignado</label>
                                <select id="newOrderTecnico" name="tecnico_id" class="form-control form-select shadow-sm">
                                    <option value="">Sin asignar</option>
                                    ${(tecnicos || []).map(t => `
                                        <option value="${t.id}">${t.nombre} ${t.apellido_p || ''}</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div class="form-group mb-3">
                                <label for="newOrderFecha" class="form-label font-weight-bold small text-uppercase">Fecha de Ingreso *</label>
                                <input type="datetime-local" id="newOrderFecha" name="fecha_ingreso" class="form-control shadow-sm" value="${defaultDate}" required>
                            </div>
                        </div>

                        <!-- Fila Completa: Problema -->
                        <div class="col-12 mt-3">
                            <label for="newOrderProblema" class="form-label font-weight-bold small text-uppercase">Descripción del Problema *</label>
                            <textarea id="newOrderProblema" name="problema_reportado" class="form-control shadow-sm" rows="3" placeholder="Describa el problema reportado por el cliente..." required></textarea>
                        </div>
                        
                         <!-- Hidden Status (Default Pendiente) -->
                         <input type="hidden" name="estado_id" value="1"> 
                    </div>

                    <!-- Secciones Dinámicas -->
                    <div class="mt-4 pt-3 border-top">
                        ${this.renderServicesTable(data.servicios || [])}
                    </div>
                    
                    <div class="mt-4">
                        ${this.renderPartsTable(data.repuestos || [])}
                    </div>

                    <!-- Total Estimado -->
                    <div class="row justify-content-end mt-4">
                        <div class="col-md-4">
                            <div class="input-group">
                                <span class="input-group-text bg-primary text-white font-weight-bold">Total Estimado (Bs.)</span>
                                <input type="number" id="newOrderTotal" name="total_estimado" class="form-control text-right font-weight-bold" 
                                       value="0.00" min="0" step="0.01" style="font-size: 1.2rem;">
                            </div>
                        </div>
                    </div>
                </form>
                
                <div class="modal-footer bg-light border-top">
                    <button class="btn btn-secondary modal-close px-4">Cancelar</button>
                    <button type="submit" form="newOrderForm" class="btn btn-success px-4 shadow-sm">
                        <i class="fas fa-save mr-2"></i> Crear Orden
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    this.attachModalEvents(modal);

    // Attach Client-Vehicle Cascade Logic
    const clientSelect = modal.querySelector("#newOrderClient");
    const autoSelect = modal.querySelector("#newOrderAuto");

    clientSelect.addEventListener('change', () => {
      const clientId = clientSelect.value;
      autoSelect.innerHTML = '<option value="">Seleccionar vehículo...</option>';
      autoSelect.disabled = true;
      autoSelect.classList.remove('border-danger');

      if (clientId) {
        const clientVehicles = (vehicles || []).filter(v => v.cliente_id == clientId || v.client_id == clientId);

        if (clientVehicles.length > 0) {
          autoSelect.disabled = false;
          clientVehicles.forEach(v => {
            const option = document.createElement('option');
            option.value = v.id;
            option.textContent = `${v.marca} ${v.modelo} - ${v.placa}`;
            autoSelect.appendChild(option);
          });
        } else {
          const option = document.createElement('option');
          option.textContent = "-- Cliente sin vehículos --";
          autoSelect.appendChild(option);
        }
      } else {
        const option = document.createElement('option');
        option.textContent = "Seleccione un cliente primero";
        autoSelect.appendChild(option);
      }
    });

    // Attach Validation Logic on Submit
    const form = modal.querySelector('#newOrderForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      const requiredIds = ['newOrderClient', 'newOrderAuto', 'newOrderProblema', 'newOrderTecnico', 'newOrderEstado'];

      requiredIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
          el.classList.add('is-invalid'); // Bootstrap class
          el.addEventListener('input', () => el.classList.remove('is-invalid'), { once: true });
          isValid = false;
        }
      });

      if (!isValid) return;

      const formData = {
        cliente_id: form.client_id.value,
        auto_id: form.auto_id.value,
        tecnico_id: form.tecnico_id.value || null,
        fecha_ingreso: form.fecha_ingreso.value,
        problema_reportado: form.problema_reportado.value,
        total_estimado: form.total_estimado.value || 0,
        estado_id: 1 // Default ID for Pendiente
      };

      if (this.onSubmitNewOrder) {
        this.onSubmitNewOrder(formData);
        this.closeModal(modal); // Ensure this method exists or use modal.remove()
        modal.remove(); // Fallback
      }
    });
  }

  attachEditCascade(modal, vehicles) {
    const clientSelect = modal.querySelector("#editOrderClient");
    const autoSelect = modal.querySelector("#editOrderAuto");

    if (clientSelect && autoSelect) {
      clientSelect.addEventListener("change", () => {
        const clientId = parseInt(clientSelect.value);

        // Reset select de autos
        autoSelect.innerHTML =
          '<option value="">Seleccionar vehículo...</option>';
        autoSelect.disabled = true;

        if (clientId) {
          // Filtrar vehículos del cliente
          const clientVehicles = vehicles.filter(
            (v) => v.cliente_id === clientId,
          );

          if (clientVehicles.length > 0) {
            clientVehicles.forEach((v) => {
              const option = document.createElement("option");
              option.value = v.id;
              option.textContent = `${v.marca} ${v.modelo} (${v.placa})`;
              autoSelect.appendChild(option);
            });
            autoSelect.disabled = false;
          } else {
            const option = document.createElement("option");
            option.textContent = "-- Sin vehículos registrados --";
            autoSelect.appendChild(option);
          }
        } else {
          autoSelect.innerHTML =
            '<option value="">Seleccione un cliente primero</option>';
        }
      });
    }
  }

  /**
   * Maneja la búsqueda en tiempo real.
   */
  handleSearch(query) {
    if (this.onSearch) this.onSearch(query);
  }

  /**
   * Maneja el filtro por estado.
   */
  handleFilter(estado) {
    if (!estado) {
      this.filteredOrders = this.currentOrders;
    } else {
      this.filteredOrders = this.currentOrders.filter(
        (order) => order.estado_nombre === estado,
      );
    }

    this.updateOrdersGrid();
  }

  /**
   * Limpia todos los filtros.
   */
  clearFilters() {
    document.getElementById("searchOrders").value = "";
    document.getElementById("filterEstado").value = "";
    this.filteredOrders = this.currentOrders;
    this.updateOrdersGrid();
  }

  /**
   * Actualiza la grilla de órdenes con una nueva lista.
   * Método público llamado por el controlador.
   */
  updateOrderList(orders) {
    const grid = document.getElementById("ordersGrid");
    if (grid) {
      grid.innerHTML = this.renderOrderCards(orders);
    }
  }

  /**
   * Maneja las acciones de los botones.
   */
  handleAction(action, id) {
    // Este método será llamado por el controlador
    if (this.onAction) {
      this.onAction(action, id);
    }
  }

  /**
   * Adjunta eventos al modal.
   */
  attachModalEvents(modal) {
    // Cerrar modal
    modal.querySelectorAll(".modal-close, .btn-close-modal").forEach((btn) => {
      btn.addEventListener("click", () => {
        modal.remove();
      });
    });

    // Cerrar al hacer clic fuera
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Botón de editar en el modal de detalles
    const editBtn = modal.querySelector('[data-action="edit"]');
    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        modal.remove();
        this.handleAction("edit", id);
      });
    }

    const paymentBtn = modal.querySelector('[data-action="payment"]');
    if (paymentBtn) {
      paymentBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = e.currentTarget.dataset.id;
        modal.remove();
        this.handleAction("payment", id);
      });
    }
  }

  /**
   * Adjunta eventos al formulario de edición.
   */
  attachFormEvents(modal, orderId) {
    const form = modal.querySelector("#editOrderForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Recolectar Servicios (IDs)
        const servicios = [];
        modal.querySelectorAll("#servicesTableBody tr").forEach((row) => {
          const select = row.querySelector(".service-select");
          if (select && select.value) {
            servicios.push(parseInt(select.value));
          }
        });

        // Recolectar Repuestos ({id, cantidad})
        const repuestos = [];
        modal.querySelectorAll("#partsTableBody tr").forEach((row) => {
          const select = row.querySelector(".part-select");
          const qty = row.querySelector(".part-qty");

          if (select && select.value) {
            repuestos.push({
              id: parseInt(select.value),
              cantidad: parseInt(qty.value),
            });
          }
        });

        const formData = {
          tecnico_id: form.tecnico_id.value,
          estado_id: form.estado_id.value,
          diagnostico: form.diagnostico.value,
          problema_reportado: form.problema_reportado.value,
          fecha_ingreso: form.fecha_ingreso.value || null,
          fecha_entrega: form.fecha_entrega.value || null,
          total_estimado: form.total_estimado.value
            ? parseFloat(form.total_estimado.value)
            : 0,
          servicios: servicios,
          repuestos: repuestos,
        };

        if (this.onSubmitEdit) {
          this.onSubmitEdit(orderId, formData);
        }

        modal.remove();
      });
    }
  }

  /**
   * Métodos de utilidad.
   */
  getStatusClass(status) {
    const statusMap = {
      Pendiente: "warning",
      "En Proceso": "info",
      Finalizado: "success",
      Entregado: "success",
      Cancelado: "danger",
    };
    return statusMap[status] || "secondary";
  }

  formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-BO", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  formatCurrency(amount) {
    if (!amount) return "0.00";
    return parseFloat(amount).toFixed(2);
  }

  /**
   * Métodos para vincular con el controlador.
   */
  bindAction(handler) {
    this.onAction = handler;
  }

  bindSubmitEdit(handler) {
    this.onSubmitEdit = handler;
  }

  bindSubmitNewOrder(handler) {
    this.onSubmitNewOrder = handler;
  }

  /**
   * Muestra el modal para crear una nueva orden.
   */
  showNewOrderModal(data) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay open";
    modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>Nueva Orden de Trabajo</h3>
                    <button class="modal-close">&times;</button>
                </div>
                
                <div class="modal-body p-0">
                    <form id="newOrderForm" class="invoice-box p-4" style="max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px;">
                        
                        <!-- Header -->
                        <div class="border-bottom pb-3 mb-4">
                            <h4 class="text-primary font-weight-bold mb-1"><i class="fas fa-file-invoice mr-2"></i>Nueva Orden de Trabajo</h4>
                            <p class="text-secondary small mb-0">Complete los datos para generar una nueva orden de servicio.</p>
                        </div>

                        <!-- Top Info Grid -->
                        <div class="row">
                            <!-- Left Column: Client & Vehicle -->
                            <div class="col-md-6 border-right">
                                <h6 class="text-uppercase text-secondary small font-weight-bold mb-3">Información del Cliente</h6>
                                <div class="form-group mb-3">
                                    <label for="newOrderClient" class="small font-weight-bold">Cliente *</label>
                                    <select id="newOrderClient" name="client_id" class="form-control form-control-sm" required>
                                        <option value="">Seleccionar cliente...</option>
                                        ${(data.clients || []).map(c => `<option value="${c.id}">${c.nombre} ${c.apellido || ""}</option>`).join("")}
                                    </select>
                                </div>
                                <div class="form-group mb-3">
                                    <label for="newOrderAuto" class="small font-weight-bold">Vehículo *</label>
                                    <select id="newOrderAuto" name="auto_id" class="form-control form-control-sm" disabled required>
                                        <option value="">Seleccione un cliente primero</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Right Column: Operational Info -->
                            <div class="col-md-6 pl-md-4">
                                <h6 class="text-uppercase text-secondary small font-weight-bold mb-3">Detalles Operativos</h6>
                                <div class="form-row">
                                    <div class="col-md-6 form-group mb-3">
                                        <label for="newOrderTecnico" class="small font-weight-bold">Técnico *</label>
                                        <select id="newOrderTecnico" name="tecnico_id" class="form-control form-control-sm" required>
                                            <option value="">Seleccionar...</option>
                                            ${(data.tecnicos || []).map(t => `<option value="${t.id}">${t.nombre} ${t.apellido_p || ""}</option>`).join("")}
                                        </select>
                                    </div>
                                    <div class="col-md-6 form-group mb-3">
                                        <label for="newOrderEstado" class="small font-weight-bold">Estado Inicial *</label>
                                        <select id="newOrderEstado" name="estado_id" class="form-control form-control-sm" required>
                                            ${(data.estados || []).map(e => `<option value="${e.id}">${e.nombre_estado}</option>`).join("")}
                                        </select>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="col-md-6 form-group mb-3">
                                        <label for="newOrderFechaIngreso" class="small font-weight-bold">Ingreso</label>
                                        <input type="datetime-local" id="newOrderFechaIngreso" name="fecha_ingreso" class="form-control form-control-sm" value="${new Date().toISOString().slice(0, 16)}">
                                    </div>
                                    <div class="col-md-6 form-group mb-3">
                                        <label for="newOrderFechaEntrega" class="small font-weight-bold">Entrega Est.</label>
                                        <input type="datetime-local" id="newOrderFechaEntrega" name="fecha_entrega" class="form-control form-control-sm">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Problem & Diagnosis Full Width -->
                        <div class="mt-3 pt-3 border-top">
                            <div class="form-group">
                                <label for="newOrderProblema" class="small font-weight-bold text-uppercase">Problema Reportado *</label>
                                <textarea id="newOrderProblema" name="problema_reportado" class="form-control" rows="2" placeholder="Describa el problema reportado por el cliente..." required></textarea>
                            </div>
                            <div class="form-group mt-3">
                                <label for="newOrderDiagnostico" class="small font-weight-bold text-uppercase">Diagnóstico Inicial</label>
                                <textarea id="newOrderDiagnostico" name="diagnostico" class="form-control" rows="2" placeholder="Observaciones técnicas preliminares..."></textarea>
                            </div>
                        </div>

                        <!-- Dynamic Tables -->
                        <div class="mt-4">
                            <h6 class="text-uppercase text-secondary small font-weight-bold border-bottom pb-2">Servicios y Repuestos</h6>
                            <div class="px-2 pt-2 bg-light rounded border">
                                ${this.renderServicesTable(data.servicios || [])}
                                ${this.renderPartsTable(data.repuestos || [])}
                            </div>
                        </div>

                        <!-- Totals -->
                        <div class="row justify-content-end mt-4">
                            <div class="col-md-5">
                                <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                    <span class="font-weight-bold">Total Estimado</span>
                                    <div class="input-group input-group-sm" style="width: 150px;">
                                        <span class="input-group-text bg-white border-right-0">Bs.</span>
                                        <input type="number" id="newOrderTotal" name="total_estimado" class="form-control font-weight-bold text-right border-left-0" step="0.01" value="0.00" readonly>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <div class="modal-footer bg-light border-top p-3 d-flex justify-content-between align-items-center">
                    <button type="button" class="btn btn-danger btn-close-modal px-4 rounded-pill shadow-sm text-white">
                        <i class="fas fa-times me-2"></i> Cancelar
                    </button>
                    <button type="submit" form="newOrderForm" class="btn btn-primary px-4 rounded-pill shadow-sm">
                        <i class="fas fa-save me-2"></i> Crear Orden
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    this.attachModalEvents(modal);
    this.attachNewOrderFormLogic(modal, data.vehicles);
    this.attachDetailsLogic(modal, data.servicios || [], data.repuestos || []);
  }

  /**
   * Genera el HTML para la sección de servicios dinámicos.
   */
  renderServicesTable(allServices, currentDetails = []) {
    const rows = currentDetails
      .map((detail, index) => {
        return this.getServiceRowHTML(allServices, detail, index);
      })
      .join("");

    return `
            <div class="details-section mt-3">
                <h4>Servicios</h4>
                <div class="table-container">
                    <table class="table table-sm" id="servicesTable">
                        <thead>
                            <tr>
                                <th style="width: 60%">Servicio</th>
                                <th style="width: 30%">Precio</th>
                                <th style="width: 10%">Acción</th>
                            </tr>
                        </thead>
                        <tbody id="servicesTableBody">
                            ${rows}
                        </tbody>
                    </table>
                </div>
                <button type="button" class="btn-small btn-secondary" id="btnAddService">
                    + Agregar Servicio
                </button>
            </div>
        `;
  }

  /**
   * Genera el HTML de una fila de servicio.
   */
  getServiceRowHTML(allServices, detail = null, index = Date.now()) {
    const selectedId = detail ? detail.servicio_id || detail.service_id : "";
    const price = detail ? detail.precio_aplicado || 0 : 0;

    return `
            <tr class="service-row" data-index="${index}">
                <td>
                    <select class="form-control service-select" name="servicios[${index}][servicio_id]" required>
                        <option value="">Seleccionar Servicio...</option>
                        ${allServices
        .map(
          (s) => `
                            <option value="${s.id}" data-price="${s.precio}" ${s.id == selectedId ? "selected" : ""}>
                                ${s.nombre}
                            </option>
                        `,
        )
        .join("")}
                    </select>
                </td>
                <td>
                    <input type="number" class="form-control service-price" name="servicios[${index}][precio_aplicado]" 
                           value="${parseFloat(price).toFixed(2)}" step="0.01" readonly>
                </td>
                <td>
                    <button type="button" class="btn-icon danger remove-row">&times;</button>
                </td>
            </tr>
        `;
  }

  /**
   * Genera el HTML para la sección de repuestos dinámicos.
   */
  renderPartsTable(allParts, currentDetails = []) {
    const rows = currentDetails
      .map((detail, index) => {
        return this.getPartRowHTML(allParts, detail, index);
      })
      .join("");

    return `
            <div class="details-section mt-3">
                <h4>Repuestos</h4>
                <div class="table-container">
                    <table class="table table-sm" id="partsTable">
                        <thead>
                            <tr>
                                <th style="width: 50%">Repuesto</th>
                                <th style="width: 15%">Cant.</th>
                                <th style="width: 25%">Subtotal</th>
                                <th style="width: 10%">Acción</th>
                            </tr>
                        </thead>
                        <tbody id="partsTableBody">
                            ${rows}
                        </tbody>
                    </table>
                </div>
                <button type="button" class="btn-small btn-secondary" id="btnAddPart">
                    + Agregar Repuesto
                </button>
            </div>
        `;
  }

  /**
   * Genera el HTML de una fila de repuesto.
   */
  getPartRowHTML(allParts, detail = null, index = Date.now()) {
    const selectedId = detail ? detail.repuesto_id || detail.part_id : "";
    const quantity = detail ? detail.cantidad || 1 : 1;
    const price = detail ? detail.precio_unitario_aplicado || 0 : 0;
    const subtotal = price * quantity;

    return `
            <tr class="part-row" data-index="${index}">
                <td>
                    <select class="form-control part-select" name="repuestos[${index}][repuesto_id]" required>
                        <option value="">Seleccionar Repuesto...</option>
                        ${allParts
        .map(
          (p) => `
                            <option value="${p.id}" data-price="${p.precio_venta}" data-stock="${p.stock}" ${p.id == selectedId ? "selected" : ""}>
                                ${p.nombre} (Stock: ${p.stock})
                            </option>
                        `,
        )
        .join("")}
                    </select>
                </td>
                <td>
                    <input type="number" class="form-control part-qty" name="repuestos[${index}][cantidad]" 
                           value="${quantity}" min="1" required>
                </td>
                <td>
                    <input type="number" class="form-control part-subtotal" 
                           value="${parseFloat(subtotal).toFixed(2)}" readonly>
                </td>
                <td>
                    <button type="button" class="btn-icon danger remove-row">&times;</button>
                </td>
            </tr>
        `;
  }

  /**
   * Adjunta la lógica dinámica a tablas de servicios y repuestos.
   */
  attachDetailsLogic(modal, allServices, allParts) {
    // SERVICIOS
    const btnAddService = modal.querySelector("#btnAddService");
    const servicesBody = modal.querySelector("#servicesTableBody");

    btnAddService.addEventListener("click", () => {
      const rowHTML = this.getServiceRowHTML(allServices, null, Date.now());
      servicesBody.insertAdjacentHTML("beforeend", rowHTML);
      this.calculateTotal(modal);
    });

    servicesBody.addEventListener("change", (e) => {
      if (e.target.classList.contains("service-select")) {
        const currentSelect = e.target;
        const selectedValue = currentSelect.value;
        const row = currentSelect.closest("tr");
        
        // Validation: Check for duplicates
        let isDuplicate = false;
        modal.querySelectorAll(".service-select").forEach(select => {
            if (select !== currentSelect && select.value === selectedValue && selectedValue !== "") {
                isDuplicate = true;
            }
        });

        if (isDuplicate) {
            alert("Este servicio ya ha sido agregado a la orden.");
            currentSelect.value = ""; // Reset
            row.querySelector(".service-price").value = "0.00";
            this.calculateTotal(modal);
            return;
        }

        const option = currentSelect.options[currentSelect.selectedIndex];
        const price = option.getAttribute("data-price") || 0;
        
        row.querySelector(".service-price").value =
          parseFloat(price).toFixed(2);
        this.calculateTotal(modal);
      }
    });

    servicesBody.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-row")) {
        e.target.closest("tr").remove();
        this.calculateTotal(modal);
      }
    });

    // REPUESTOS
    const btnAddPart = modal.querySelector("#btnAddPart");
    const partsBody = modal.querySelector("#partsTableBody");

    btnAddPart.addEventListener("click", () => {
      const rowHTML = this.getPartRowHTML(allParts, null, Date.now());
      partsBody.insertAdjacentHTML("beforeend", rowHTML);
      this.calculateTotal(modal);
    });

    partsBody.addEventListener("change", (e) => {
      const row = e.target.closest("tr");
      if (!row) return;

      if (
        e.target.classList.contains("part-select") ||
        e.target.classList.contains("part-qty")
      ) {
        const select = row.querySelector(".part-select");
        const qtyInput = row.querySelector(".part-qty");
        const subtotalInput = row.querySelector(".part-subtotal");

        const option = select.options[select.selectedIndex];
        const price =
          parseFloat(option ? option.getAttribute("data-price") : 0) || 0;
        const qty = parseInt(qtyInput.value) || 0;

        subtotalInput.value = (price * qty).toFixed(2);
        this.calculateTotal(modal);
      }
    });

    partsBody.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-row")) {
        e.target.closest("tr").remove();
        this.calculateTotal(modal);
      }
    });
  }

  /**
   * Calcula y actualiza el total estimado en el modal.
   */
  calculateTotal(modal) {
    let total = 0;

    // Sumar servicios
    modal.querySelectorAll(".service-price").forEach((input) => {
      total += parseFloat(input.value) || 0;
    });

    // Sumar repuestos
    modal.querySelectorAll(".part-subtotal").forEach((input) => {
      total += parseFloat(input.value) || 0;
    });

    const totalInput = modal.querySelector('input[name="total_estimado"]');
    if (totalInput) {
      totalInput.value = total.toFixed(2);
    }
  }
  attachNewOrderFormLogic(modal, vehicles) {
    // Lógica de Cascada: Cliente -> Vehículos
    const clientSelect = modal.querySelector("#newOrderClient");
    const autoSelect = modal.querySelector("#newOrderAuto");

    if (clientSelect && autoSelect) {
      clientSelect.addEventListener("change", () => {
        const clientId = parseInt(clientSelect.value);

        // Reset select de autos
        autoSelect.innerHTML =
          '<option value="">Seleccionar vehículo...</option>';
        autoSelect.disabled = true;

        if (clientId) {
          // Filtrar vehículos del cliente seleccionado
          // Asumimos que los vehículos tienen 'cliente_id'
          const clientVehicles = vehicles.filter(
            (v) => v.cliente_id === clientId,
          );

          if (clientVehicles.length > 0) {
            clientVehicles.forEach((v) => {
              const option = document.createElement("option");
              option.value = v.id;
              option.textContent = `${v.marca} ${v.modelo} (${v.placa})`;
              autoSelect.appendChild(option);
            });
            autoSelect.disabled = false;
          } else {
            const option = document.createElement("option");
            option.textContent = "-- Sin vehículos registrados --";
            autoSelect.appendChild(option);
          }
        } else {
          autoSelect.innerHTML =
            '<option value="">Seleccione un cliente primero</option>';
        }
      });
    }

    const form = modal.querySelector("#newOrderForm");

    // Manejar envío
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Recolectar Servicios (IDs)
      const servicios = [];
      modal.querySelectorAll("#servicesTableBody tr").forEach((row) => {
        const select = row.querySelector(".service-select");
        if (select && select.value) {
          servicios.push(parseInt(select.value));
        }
      });

      // Recolectar Repuestos ({id, cantidad})
      const repuestos = [];
      modal.querySelectorAll("#partsTableBody tr").forEach((row) => {
        const select = row.querySelector(".part-select");
        const qty = row.querySelector(".part-qty");

        if (select && select.value) {
          repuestos.push({
            id: parseInt(select.value),
            cantidad: parseInt(qty.value),
          });
        }
      });

      const formData = {
        auto_id: form.auto_id.value,
        tecnico_id: form.tecnico_id.value,
        problema_reportado: form.problema_reportado.value,
        diagnostico: form.diagnostico ? form.diagnostico.value : "",
        estado_id: form.estado_id.value || 1,
        fecha_ingreso: form.fecha_ingreso ? form.fecha_ingreso.value : null,
        fecha_entrega: form.fecha_entrega.value || null,
        total_estimado: form.total_estimado.value
          ? parseFloat(form.total_estimado.value)
          : 0,
        servicios: servicios,
        repuestos: repuestos,
      };

      if (this.onSubmitNewOrder) {
        this.onSubmitNewOrder(formData);
      }

      modal.remove();
    });
  }
}
