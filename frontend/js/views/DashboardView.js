import { ORDER_STATES_LABELS } from "../utils/constants.js";

/**
 * Vista del Dashboard
 * Renderiza tarjetas de KPIs y gráficos/listas.
 */
export default class DashboardView {
  constructor() {
    this.appContent = document.getElementById("contentArea");
  }

  /**
   * Renderiza el dashboard con los datos suministrados.
   * @param {Object} data - Datos del dashboard (total_orders, estimated_revenue, etc.)
   */
  render(data) {
    // Validación básica de datos para evitar errores de renderizado
    const totalOrders = data?.total_orders_month ?? 0;
    const revenue = data?.estimated_income
      ? `Bs. ${parseFloat(data.estimated_income).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "Bs. 0.00";
    const statusCounts = data?.orders_by_status || {};

    // Calcular totales por estado
    const pendientes = statusCounts["Pendiente"] || 0;
    const enProceso = statusCounts["En Proceso"] || 0;
    const finalizadas =
      statusCounts["Finalizado"] || statusCounts["Entregado"] || 0;

    this.appContent.innerHTML = `
            <div class="row mb-4">
                <div class="col-12">
                     <h2 class="mb-1">Dashboard Principal</h2>
                     <p class="text-muted">Resumen de actividad del taller</p>
                </div>
            </div>

            <div class="row g-4 mb-4">
                <!-- Card 1: Total Órdenes del Mes -->
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body d-flex align-items-center">
                            <div class="rounded-3 p-3 bg-primary bg-opacity-10 text-primary me-3">
                                <i class="fas fa-clipboard-list fa-2x"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-1 text-uppercase small fw-bold">Órdenes del Mes</h6>
                                <h3 class="mb-0 fw-bold">${totalOrders}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card 2: Ingresos Estimados -->
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="card border-0 shadow-sm h-100">
                         <div class="card-body d-flex align-items-center">
                            <div class="rounded-3 p-3 bg-success bg-opacity-10 text-success me-3">
                                <i class="fas fa-coins fa-2x"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-1 text-uppercase small fw-bold">Ingresos Estimados</h6>
                                <h3 class="mb-0 fw-bold">${revenue}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card 3: Órdenes Pendientes -->
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="card border-0 shadow-sm h-100">
                         <div class="card-body d-flex align-items-center">
                            <div class="rounded-3 p-3 bg-warning bg-opacity-10 text-warning me-3">
                                <i class="fas fa-hourglass-half fa-2x"></i>
                            </div>
                             <div>
                                <h6 class="text-muted mb-1 text-uppercase small fw-bold">Pendientes</h6>
                                <h3 class="mb-0 fw-bold">${pendientes}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card 4: En Proceso -->
                <div class="col-12 col-sm-6 col-xl-3">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body d-flex align-items-center">
                            <div class="rounded-3 p-3 bg-info bg-opacity-10 text-info me-3">
                                <i class="fas fa-tools fa-2x"></i>
                            </div>
                             <div>
                                <h6 class="text-muted mb-1 text-uppercase small fw-bold">En Proceso</h6>
                                <h3 class="mb-0 fw-bold">${enProceso}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-4">
                 <!-- Sección de Estado de Órdenes -->
                <div class="col-12">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title mb-3">Distribución de Órdenes</h5>
                            <div class="progress" style="height: 25px;">
                                ${(() => {
                                    const totalActive = Object.values(statusCounts).reduce((a, b) => a + b, 0);
                                    return this._renderStatusBar(statusCounts, totalActive);
                                })()}
                            </div>
                            <div class="mt-3 d-flex flex-wrap gap-3 justify-content-center justify-content-md-start">
                                 ${this._renderStatusLegend(statusCounts)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sección de Acciones Rápidas -->
            <div class="row">
                 <div class="col-12">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                             <h5 class="card-title mb-3">Acciones Rápidas</h5>
                             <div class="row g-3">
                                <div class="col-6 col-md-4">
                                    <button class="btn btn-outline-secondary border shadow-sm w-100 py-3 action-btn" data-view="orders">
                                        <i class="fas fa-clipboard-list text-primary d-block mb-2 fa-2x"></i> Nueva Orden
                                    </button>
                                </div>
                                <div class="col-6 col-md-4">
                                     <button class="btn btn-outline-secondary border shadow-sm w-100 py-3 action-btn" data-view="services">
                                        <i class="fas fa-tools text-info d-block mb-2 fa-2x"></i> Nuevo Servicio
                                    </button>
                                </div>
                                <div class="col-6 col-md-4">
                                     <button class="btn btn-outline-secondary border shadow-sm w-100 py-3 action-btn" data-view="inventory">
                                        <i class="fas fa-boxes text-warning d-block mb-2 fa-2x"></i> Nuevo Repuesto
                                    </button>
                                </div>
                                <div class="col-6 col-md-4">
                                     <button class="btn btn-outline-secondary border shadow-sm w-100 py-3 action-btn" data-view="trabajadores">
                                        <i class="fas fa-users-cog text-secondary d-block mb-2 fa-2x"></i> Nuevo Trabajador
                                    </button>
                                </div>
                                <div class="col-6 col-md-4">
                                     <button class="btn btn-outline-secondary border shadow-sm w-100 py-3 action-btn" data-view="clientes">
                                        <i class="fas fa-user-plus text-success d-block mb-2 fa-2x"></i> Nuevo Cliente
                                    </button>
                                </div>
                                <div class="col-6 col-md-4">
                                     <button class="btn btn-outline-secondary border shadow-sm w-100 py-3 action-btn" data-view="vehicles">
                                        <i class="fas fa-car text-danger d-block mb-2 fa-2x"></i> Nuevo Auto
                                    </button>
                                </div>
                             </div>
                        </div>
                    </div>
                 </div>
            </div>

        `;

    // Agregar event listeners para acciones rápidas
    this.bindQuickActions();

    // Reinicializar animaciones AOS si la librería está cargada
    if (window.AOS) {
      setTimeout(() => {
        window.AOS.refresh();
      }, 100); // Pequeño delay para asegurar que el DOM se pintó
    }
  }

  /**
   * Muestra un mensaje de error en el área de contenido.
   * @param {string} message
   */
  showError(message = "No se pudo cargar la información del dashboard.") {
    this.appContent.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                <h4 class="alert-heading">Error de Carga</h4>
                <p>${message}</p>
                <hr>
                <button onclick="window.location.reload()" class="btn btn-outline-danger btn-sm">Reintentar</button>
            </div>
        `;
  }

  /**
   * Renderiza la barra de progreso de estados.
   * @param {Object} statusCounts - Conteo de órdenes por estado.
   * @param {number} total - Total de órdenes.
   * @returns {string} HTML de la barra.
   */
  _renderStatusBar(statusCounts, total) {
    if (total === 0) {
      return '<div class="w-100 text-center text-muted small py-1">No hay datos</div>';
    }

    const states = [
      { name: "Pendiente", class: "bg-warning" },
      { name: "En Proceso", class: "bg-info" },
      { name: "Finalizado", class: "bg-success" },
      { name: "Entregado", class: "bg-primary" },
    ];

    return states
      .map((state) => {
        const count = statusCounts[state.name] || 0;
        const percentage = (count / total) * 100;

        if (percentage === 0) return "";

        return `
                <div class="progress-bar ${state.class}" role="progressbar" style="width: ${percentage}%" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                    ${percentage > 5 ? count : ""}
                </div>
            `;
      })
      .join("");
  }

  /**
   * Renderiza la leyenda de estados.
   * @param {Object} statusCounts - Conteo de órdenes por estado.
   * @returns {string} HTML de la leyenda.
   */
  _renderStatusLegend(statusCounts) {
    const states = [
      { name: "Pendiente", class: "text-warning" },
      { name: "En Proceso", class: "text-info" },
      { name: "Finalizado", class: "text-success" },
      { name: "Entregado", class: "text-primary" },
    ];

    return states
      .map((state) => {
        const count = statusCounts[state.name] || 0;
        return `
                <div class="d-flex align-items-center small">
                    <i class="fas fa-circle me-1 ${state.class}"></i>
                    <span class="text-muted me-1">${state.name}:</span>
                    <span class="fw-bold">${count}</span>
                </div>
            `;
      })
      .join("");
  }

  /**
   * Vincula los event listeners para las acciones rápidas.
   */
  bindQuickActions() {
    const actionButtons = this.appContent.querySelectorAll(".action-btn");
    console.log(
      "DashboardView: Binding quick actions for",
      actionButtons.length,
      "buttons",
    );

    actionButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent accidental commits or navigation
        // Use currentTarget to ensure we get the button, not the icon inside
        const btnElement = e.currentTarget;
        const view = btnElement.dataset.view;

        console.log("DashboardView: Clicked button", view);

        if (view && window.app) {
          console.log("DashboardView: Navigating to", view);

          // Actualizar navegación activa en el sidebar
          // Selector debe coincidir con el del sidebar nuevo (#sidebar-wrapper .list-group-item)
          const sidebarLinks = document.querySelectorAll(
            "#sidebar-wrapper .list-group-item",
          );
          sidebarLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("data-view") === view) {
              link.classList.add("active");
            }
          });

          // Cargar vista
          window.app.loadView(view);
        } else {
          console.error(
            "DashboardView: window.app not found or view undefined",
            { view, app: !!window.app },
          );
        }
      });
    });
  }
}
