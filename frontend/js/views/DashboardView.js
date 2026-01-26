/**
 * Vista del Dashboard
 * Renderiza tarjetas de KPIs y gráficos/listas.
 */
export default class DashboardView {
    constructor() {
        this.appContent = document.getElementById('contentArea');
    }

    /**
     * Renderiza el dashboard con los datos suministrados.
     * @param {Object} data - Datos del dashboard (total_orders, estimated_revenue, etc.)
     */
    render(data) {
        // Validación básica de datos para evitar errores de renderizado
        const totalOrders = data?.total_orders ?? 0;
        const revenue = data?.estimated_revenue 
            ? `$${parseFloat(data.estimated_revenue).toLocaleString()}` 
            : '$0.00';
        const statusCounts = data?.orders_by_status || {};

        this.appContent.innerHTML = `
            <div class="view-header">
                <h2>Dashboard Principal</h2>
            </div>

            <div class="dashboard-grid">
                <!-- Card 1: Total Órdenes -->
                <div class="card kpi-card">
                    <div class="kpi-icon bg-primary-light">
                        <i class="icon-file-text text-primary"></i>
                    </div>
                    <div class="kpi-info">
                        <h3>Total Órdenes</h3>
                        <p class="kpi-value">${totalOrders}</p>
                        <span class="text-sm text-muted">Mes actual</span>
                    </div>
                </div>

                <!-- Card 2: Ingresos Estimados -->
                <div class="card kpi-card">
                    <div class="kpi-icon bg-success-light">
                        <i class="icon-dollar-sign text-success"></i>
                    </div>
                    <div class="kpi-info">
                        <h3>Ingresos Est.</h3>
                        <p class="kpi-value">${revenue}</p>
                        <span class="text-sm text-muted">Proyección mensual</span>
                    </div>
                </div>

                <!-- Card 3: Órdenes por Estado -->
                <div class="card kpi-card span-col">
                    <h3>Estado de Órdenes</h3>
                    <div class="status-summary">
                        ${this._renderStatusItem('Pendientes', statusCounts.pending || 0, 'warning')}
                        ${this._renderStatusItem('En Proceso', statusCounts.in_progress || 0, 'info')}
                        ${this._renderStatusItem('Terminadas', statusCounts.completed || 0, 'success')}
                        ${this._renderStatusItem('Entregadas', statusCounts.delivered || 0, 'secondary')}
                    </div>
                </div>
            </div>
            
            <style>
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }
                .kpi-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .kpi-card.span-col {
                    display: block;
                }
                .kpi-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }
                .bg-primary-light { background-color: #ebf5ff; }
                .text-primary { color: #3b82f6; }
                .bg-success-light { background-color: #dcfce7; }
                .text-success { color: #22c55e; }
                
                .kpi-info h3 { margin: 0; font-size: 0.9rem; color: #6b7280; font-weight: 500;}
                .kpi-value { margin: 0; font-size: 1.8rem; font-weight: 700; color: #111827; }
                
                .status-summary {
                    display: flex;
                    justify-content: space-around;
                    margin-top: 1rem;
                    text-align: center;
                }
                .status-item .count {
                    display: block;
                    font-size: 1.25rem;
                    font-weight: bold;
                    margin-bottom: 0.25rem;
                }
                .status-item .label {
                    font-size: 0.8rem;
                    color: #6b7280;
                }
                .badge-dot {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 5px;
                }
                .dot-warning { background-color: #f59e0b; }
                .dot-info { background-color: #3b82f6; }
                .dot-success { background-color: #22c55e; }
                .dot-secondary { background-color: #6b7280; }
            </style>
        `;
    }

    /**
     * Muestra un mensaje de error en el área de contenido.
     * @param {string} message 
     */
    showError(message = 'No se pudo cargar la información del dashboard.') {
        this.appContent.innerHTML = `
            <div class="card border-red-500 text-center p-4">
                <i class="icon-alert-circle text-red-500 text-3xl mb-2"></i>
                <h3 class="text-red-600 font-bold">Error de Carga</h3>
                <p class="text-gray-600">${message}</p>
                <button onclick="window.location.reload()" class="btn-outline mt-3">Reintentar</button>
            </div>
        `;
    }

    _renderStatusItem(label, count, colorClass) {
        return `
            <div class="status-item">
                <span class="badge-dot dot-${colorClass}"></span>
                <span class="count">${count}</span>
                <span class="label">${label}</span>
            </div>
        `;
    }
}
