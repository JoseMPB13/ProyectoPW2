import { ORDER_STATES_LABELS } from '../utils/constants.js';

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
        const totalOrders = data?.total_orders_month ?? 0;
        const revenue = data?.estimated_income 
            ? `Bs. ${parseFloat(data.estimated_income).toLocaleString('es-BO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
            : 'Bs. 0.00';
        const statusCounts = data?.orders_by_status || {};

        // Calcular totales por estado
        const pendientes = statusCounts['Pendiente'] || 0;
        const enProceso = statusCounts['En Proceso'] || 0;
        const finalizadas = statusCounts['Finalizado'] || statusCounts['Entregado'] || 0;

        this.appContent.innerHTML = `
            <div class="dashboard-container">
                <div class="view-header">
                    <h2>Dashboard Principal</h2>
                    <p class="text-secondary">Resumen de actividad del taller</p>
                </div>

                <div class="dashboard-grid">
                    <!-- Card 1: Total Órdenes del Mes -->
                    <div class="card kpi-card">
                        <div class="kpi-icon bg-blue">
                            <span class="icon"><i class="fas fa-clipboard-list text-white"></i></span>
                        </div>
                        <div class="kpi-info">
                            <h3>Órdenes del Mes</h3>
                            <p class="kpi-value">${totalOrders}</p>
                            <span class="text-sm text-muted">Total registradas</span>
                        </div>
                    </div>

                    <!-- Card 2: Ingresos Estimados -->
                    <div class="card kpi-card">
                        <div class="kpi-icon bg-green">
                            <span class="icon"><i class="fas fa-coins text-white"></i></span>
                        </div>
                        <div class="kpi-info">
                            <h3>Ingresos Estimados</h3>
                            <p class="kpi-value">${revenue}</p>
                            <span class="text-sm text-muted">Órdenes finalizadas</span>
                        </div>
                    </div>

                    <!-- Card 3: Órdenes Pendientes -->
                    <div class="card kpi-card">
                        <div class="kpi-icon bg-yellow">
                            <span class="icon"><i class="fas fa-hourglass-half text-white"></i></span>
                        </div>
                        <div class="kpi-info">
                            <h3>Pendientes</h3>
                            <p class="kpi-value">${pendientes}</p>
                            <span class="text-sm text-muted">Por iniciar</span>
                        </div>
                    </div>

                    <!-- Card 4: En Proceso -->
                    <div class="card kpi-card">
                        <div class="kpi-icon bg-purple">
                            <span class="icon"><i class="fas fa-tools text-white"></i></span>
                        </div>
                        <div class="kpi-info">
                            <h3>En Proceso</h3>
                            <p class="kpi-value">${enProceso}</p>
                            <span class="text-sm text-muted">En reparación</span>
                        </div>
                    </div>
                </div>

                <!-- Sección de Estado de Órdenes -->
                <div class="card status-card">
                    <h3>Distribución de Órdenes por Estado</h3>
                    <div class="status-summary">
                        ${this._renderStatusBar(statusCounts, totalOrders)}
                    </div>
                    <div class="status-legend">
                        ${this._renderStatusLegend(statusCounts)}
                    </div>
                </div>

                <!-- Sección de Acciones Rápidas -->
                <div class="quick-actions">
                    <h3>Acciones Rápidas</h3>
                    <div class="actions-grid">
                        <button class="action-btn" data-view="orders">
                            <span class="action-icon"><i class="fas fa-plus"></i></span>
                            <span>Nueva Orden</span>
                        </button>
                        <button class="action-btn" data-view="clientes">
                            <span class="action-icon"><i class="fas fa-user-plus"></i></span>
                            <span>Nuevo Cliente</span>
                        </button>
                        <button class="action-btn" data-view="vehicles">
                            <span class="action-icon"><i class="fas fa-car"></i></span>
                            <span>Nuevo Auto</span>
                        </button>
                        <button class="action-btn" data-view="pagos">
                            <span class="action-icon"><i class="fas fa-credit-card"></i></span>
                            <span>Registrar Pago</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <style>
                .dashboard-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }
                
                .view-header {
                    margin-bottom: 2rem;
                }
                
                .view-header h2 {
                    margin: 0;
                    font-size: 1.875rem;
                    color: var(--text-color);
                }
                
                .view-header p {
                    margin: 0.5rem 0 0 0;
                    font-size: 1rem;
                }
                
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                
                .kpi-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.5rem !important;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .kpi-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }
                
                .kpi-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    flex-shrink: 0;
                }
                
                .bg-blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                .bg-green { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
                .bg-yellow { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
                .bg-purple { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
                
                .kpi-icon .icon {
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
                }
                
                .kpi-info {
                    flex: 1;
                }
                
                .kpi-info h3 { 
                    margin: 0; 
                    font-size: 0.875rem; 
                    color: #6b7280; 
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .kpi-value { 
                    margin: 0.5rem 0 0.25rem 0; 
                    font-size: 2rem; 
                    font-weight: 700; 
                    color: #111827; 
                    line-height: 1;
                }
                
                .text-sm { font-size: 0.875rem; }
                .text-muted { color: #9ca3af; }
                
                .status-card {
                    margin-bottom: 2rem;
                    padding: 1.5rem !important;
                }
                
                .status-card h3 {
                    margin: 0 0 1.5rem 0;
                    font-size: 1.25rem;
                    color: var(--text-color);
                }
                
                .status-summary {
                    height: 40px;
                    background-color: #f3f4f6;
                    border-radius: 8px;
                    overflow: hidden;
                    display: flex;
                    margin-bottom: 1rem;
                }
                
                .status-bar {
                    height: 100%;
                    transition: width 0.5s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 0.875rem;
                }
                
                .status-legend {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                    margin-top: 1rem;
                }
                
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .legend-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }
                
                .legend-label {
                    font-size: 0.875rem;
                    color: #6b7280;
                }
                
                .legend-count {
                    font-weight: 600;
                    color: #111827;
                }
                
                .quick-actions {
                    background-color: var(--card-bg);
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                }
                
                .quick-actions h3 {
                    margin: 0 0 1rem 0;
                    font-size: 1.25rem;
                    color: var(--text-color);
                }
                
                .actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }
                
                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.5rem;
                    background-color: #f9fafb;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 1rem;
                    font-weight: 500;
                    color: var(--text-color);
                }
                
                .action-btn:hover {
                    background-color: var(--primary-color);
                    border-color: var(--primary-color);
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }
                
                .action-icon {
                    font-size: 1.5rem;
                }
            </style>
        `;

        // Agregar event listeners para acciones rápidas
        this.bindQuickActions();
    }

    /**
     * Muestra un mensaje de error en el área de contenido.
     * @param {string} message 
     */
    showError(message = 'No se pudo cargar la información del dashboard.') {
        this.appContent.innerHTML = `
            <div class="card border-red-500 text-center p-4">
                <h3 class="text-red-600 font-bold">Error de Carga</h3>
                <p class="text-gray-600">${message}</p>
                <button onclick="window.location.reload()" class="btn-outline mt-3">Reintentar</button>
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
            return '<div style="text-align: center; padding: 1rem; color: #9ca3af;">No hay órdenes registradas</div>';
        }

        const states = [
            { name: 'Pendiente', color: '#f59e0b' },
            { name: 'En Proceso', color: '#3b82f6' },
            { name: 'Finalizado', color: '#22c55e' },
            { name: 'Entregado', color: '#10b981' }
        ];

        return states.map(state => {
            const count = statusCounts[state.name] || 0;
            const percentage = (count / total) * 100;
            
            if (percentage === 0) return '';
            
            return `
                <div class="status-bar" style="width: ${percentage}%; background-color: ${state.color};">
                    ${count > 0 ? count : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * Renderiza la leyenda de estados.
     * @param {Object} statusCounts - Conteo de órdenes por estado.
     * @returns {string} HTML de la leyenda.
     */
    _renderStatusLegend(statusCounts) {
        const states = [
            { name: 'Pendiente', color: '#f59e0b' },
            { name: 'En Proceso', color: '#3b82f6' },
            { name: 'Finalizado', color: '#22c55e' },
            { name: 'Entregado', color: '#10b981' }
        ];

        return states.map(state => {
            const count = statusCounts[state.name] || 0;
            return `
                <div class="legend-item">
                    <div class="legend-dot" style="background-color: ${state.color};"></div>
                    <span class="legend-label">${state.name}:</span>
                    <span class="legend-count">${count}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * Vincula los event listeners para las acciones rápidas.
     */
    bindQuickActions() {
        const actionButtons = this.appContent.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                if (view && window.app) {
                    // Actualizar navegación activa
                    document.querySelectorAll('.sidebar-nav a').forEach(link => {
                        link.classList.remove('active');
                        if (link.dataset.view === view) {
                            link.classList.add('active');
                        }
                    });
                    // Cargar vista
                    window.app.loadView(view);
                }
            });
        });
    }
}
