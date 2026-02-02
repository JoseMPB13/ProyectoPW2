import API from './utils/api.js';
import AuthController from './controllers/AuthController.js';
import VehicleController from './controllers/VehicleController.js';
import ClientController from './controllers/ClientController.js';
import VehicleModel from './models/VehicleModel.js';
import VehicleView from './views/VehicleView.js';
import DashboardController from './controllers/DashboardController.js';
import DashboardModel from './models/DashboardModel.js';
import DashboardView from './views/DashboardView.js';
import OrderController from './controllers/OrderController.js';
import WorkerController from './controllers/WorkerController.js';

import ServiceController from './controllers/ServiceController.js';
import InventoryController from './controllers/InventoryController.js';
import ServiceModel from './models/ServiceModel.js';
import ServiceView from './views/ServiceView.js';
import InventoryModel from './models/InventoryModel.js';
import InventoryView from './views/InventoryView.js';
import ClientModel from './models/ClientModel.js';

import ChatWidget from './components/ChatWidget.js';

/**
 * ============================================================================
 * ENCABEZADO DEL ARCHIVO (Frontend Entry Point)
 * ============================================================================
 * Propósito:
 *   Punto de entrada principal (Main) de la aplicación Single Page Application (SPA).
 *   Actúa como el Orquestador central (Root Controller) que inicializa y conecta
 *   todos los modelos, vistas y controladores secundarios.
 *
 * Flujo Lógico Central:
 *   1. Inicialización de dependencias base (API, Auth).
 *   2. Inyección de Dependencias (Wiring) de cada módulo (MVC).
 *   3. Verificación de sesión (Auth Check).
 *   4. Renderizado inicial (Dashboard o Login).
 *   5. Gestión del Enrutamiento Simple (Client-side Routing) mediante el Sidebar.
 *
 * Interacciones:
 *   - Instancia todos los controladores (OrderController, DashboardController, etc.).
 *   - Gestiona eventos globales como Navegación y Logout.
 * ============================================================================
 */

class App {
    /**
     * Constructor principal.
     * Configura la arquitectura MVC e inyecta dependencias.
     */
    constructor() {
        this.api = new API();

        // Inicializar Chat Widget (prioridad alta para soporte/debug)
        try {
            this.chatWidget = new ChatWidget();
            console.log('ChatWidget inicializado');
        } catch (e) {
            console.error('Error inicializando ChatWidget:', e);
        }

        // Inicializar AuthController, pasando callback de éxito para recargar la app
        this.authController = new AuthController(() => this.onLoginSuccess());

        // ========================================================================
        // INYECCIÓN DE DEPENDENCIAS (Módulos)
        // ========================================================================
        
        // Módulo: Vehículos
        this.vehicleModel = new VehicleModel(this.api);
        this.vehicleView = new VehicleView();
        this.vehicleController = new VehicleController(this.vehicleModel, this.vehicleView);

        // Módulo: Dashboard (KPIs)
        this.dashboardModel = new DashboardModel(this.api);
        this.dashboardView = new DashboardView();
        this.dashboardController = new DashboardController(this.dashboardModel, this.dashboardView);

        // Módulo: Órdenes (Core)
        this.orderController = new OrderController();

        // Módulo: Recursos Humanos
        this.workerController = new WorkerController();

        // Módulo: Clientes
        this.clientModel = new ClientModel(this.api);
        this.clientController = new ClientController(this.clientModel);

        // Módulo: Servicios (Catálogo)
        this.serviceModel = new ServiceModel(this.api);
        this.serviceView = new ServiceView();
        this.serviceController = new ServiceController(this.serviceModel, this.serviceView);

        // Módulo: Inventario
        this.inventoryModel = new InventoryModel(this.api);
        this.inventoryView = new InventoryView();
        this.inventoryController = new InventoryController(this.inventoryModel, this.inventoryView);

        // Arranque
        this.init();

        // Exponer la instancia globalmente para depuración en consola
        window.activeApp = this;
    }

    /**
     * Ciclo de Vida: Inicialización.
     * Verifica credenciales antes de montar la UI protegida.
     */
    init() {
        console.log('Aplicación iniciando...');

        // Verificar autenticación (JWT en LocalStorage)
        const isAuthenticated = this.authController.checkAuth();

        if (isAuthenticated) {
            this.startApp();
        }
        // Si no está autenticado, AuthController redirige o muestra login automáticamente.
    }

    /**
     * Callback ejecutado tras un Login exitoso.
     * Reinicia el flujo de carga de la aplicación protegida.
     */
    onLoginSuccess() {
        this.startApp();
    }

    /**
     * Montaje de la Aplicación Protegida.
     * Configura la UI basada en el ROL del usuario (RBAC) y carga la vista por defecto.
     */
    startApp() {
        console.log('Sesión válida. Cargando dashboard...');
        this.setupEventListeners();

        let user = null;
        let defaultView = 'dashboard';

        // Recuperar contexto de usuario y aplicar personalización de UI
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                user = JSON.parse(userStr);
                
                // Actualizar Header
                const userNameEl = document.getElementById('userName');
                if (userNameEl) userNameEl.textContent = user.nombre || user.email || 'Usuario';
                
                // Aplicar RBAC al Sidebar (Ocultar opciones no permitidas)
                this.updateSidebarByRole(user);

                // Determinar Home Page según Rol
                if (user.rol_nombre) {
                    const role = user.rol_nombre.toLowerCase().trim();
                    if (role === 'mecanico') {
                        defaultView = 'orders'; // Mecánicos van directo a su trabajo
                    }
                }

            } catch (e) {
                console.error('Error parseando user data', e);
            }
        }

        // Renderizar vista inicial
        this.loadView(defaultView);
    }

    /**
     * RBAC (Role-Based Access Control) para el Menú Lateral.
     * Muestra u oculta enlaces de navegación según el perfil del usuario.
     * 
     * @param {Object} user - Objeto de usuario con propiedad `rol_nombre`.
     */
    updateSidebarByRole(user) {
        if (!user || !user.rol_nombre) {
            console.warn('updateSidebarByRole: Usuario inválido o sin rol', user);
            return;
        }

        const role = user.rol_nombre.toLowerCase().trim();
        console.log(`[RBAC] Validando permisos para rol: '${role}'`, user);
        
        // Helper local para manipular DOM
        const setVisibility = (viewName, visible) => {
            const link = document.querySelector(`#sidebar-wrapper a[data-view="${viewName}"]`);
            if (link) {
                if (visible) {
                    link.classList.remove('d-none');
                    link.style.display = ''; 
                } else {
                    link.classList.add('d-none');
                }
            } else {
                console.warn(`[RBAC] No se encontró el link del sidebar para: ${viewName}`);
            }
        };

        // Paso 1: Reset (Mostrar todo por defecto, enfoque "Deny by Exception")
        const allLinks = document.querySelectorAll('#sidebar-wrapper a[data-view]');
        allLinks.forEach(link => {
            link.classList.remove('d-none');
            link.style.display = '';
        });

        // Paso 2: Aplicar Restricciones
        if (role === 'admin' || role === 'administrador') {
            // Admin tiene acceso total
            return;
        }

        if (role === 'recepcionista' || role === 'recepcion') {
            // Recepción: Frontend (Clientes, Autos, Ordenes, Dashboard)
            // No ve: Backend Operativo (Servicios, Inventario, HR)
            setVisibility('services', false);
            setVisibility('inventory', false);
            setVisibility('trabajadores', false);
        } 
        else if (role === 'mecanico') {
            // Mecánico: Operativo puro
            // Solo ve: Ordenes, Clientes, Autos
            setVisibility('dashboard', false); // No necesita KPIs financieros
            setVisibility('services', false);
            setVisibility('inventory', false); // Puede consumir, pero no gestionar catálogo
            setVisibility('trabajadores', false);
        } else {
            console.warn(`[RBAC] Rol no reconocido: ${role}. Se muestran todas las opciones por defecto.`);
        }
    }

    /**
     * Configuración de Listeners Globales.
     * Centraliza el manejo de clicks en navegación para evitar múltiples listeners.
     */
    setupEventListeners() {
        // Navegación Sidebar (Event Delegation)
        const sidebar = document.getElementById('sidebar-wrapper');
        if (sidebar) {
            // Reset de listener para evitar duplicados en re-logins
            sidebar.onclick = (e) => {
                const link = e.target.closest('a[data-view]');
                if (link) {
                    e.preventDefault();
                    this.handleNavigation(link);
                }
            };
        }

        // Botón Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            // Clonación para limpiar listeners previos (hack limpio)
            const newLogout = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogout, logoutBtn);

            newLogout.addEventListener('click', () => {
                this.authController.logout();
            });
        }
    }

    /**
     * Lógica de Enrutamiento (Router).
     * Gestiona el cambio visual de "pestaña" o vista.
     * 
     * @param {HTMLElement} targetLink - Elemento del DOM clickeado.
     */
    handleNavigation(targetLink) {
        if (!targetLink) return;

        // Gestión de estado "Active" visual
        document.querySelectorAll('#sidebar-wrapper .list-group-item').forEach(a => a.classList.remove('active'));
        targetLink.classList.add('active');

        // Extracción de la ruta destino
        const viewName = targetLink.getAttribute('data-view');
        if (viewName) {
            this.loadView(viewName);
        }
    }

    /**
     * Carga y Renderiza una Vista Específica.
     * Orquesta la limpieza de la anterior y la inicialización del controlador nuevo.
     * 
     * @param {string} viewName - Identificador de la vista (ej: 'orders', 'dashboard').
     */
    loadView(viewName) {
        const contentArea = document.getElementById('contentArea');
        const headerTitle = document.getElementById('pageTitle');

        console.log(`[Router] Navegando a: ${viewName}`);

        // 1. Definir Título de Página
        let title = 'Dashboard';
        const titles = {
            'dashboard': 'Dashboard',
            'orders': 'Gestión de Órdenes',
            'services': 'Gestión de Servicios',
            'inventory': 'Inventario de Repuestos',
            'vehicles': 'Gestión de Vehículos',
            'clientes': 'Cartera de Clientes',
            'trabajadores': 'Recursos Humanos'
        };
        
        // Fallback title formatting
        title = titles[viewName] || (viewName.charAt(0).toUpperCase() + viewName.slice(1));
        headerTitle.textContent = title;

        // 2. Limpieza (Garbage Collection visual)
        this.cleanup();

        // 3. Feedback visual inmediato
        contentArea.innerHTML = '<div class="d-flex justify-content-center p-5"><div class="spinner-border text-primary" role="status"></div></div>'; // Spinner bootstrap

        // 4. Inicialización del Controlador correspondiente
        // setTimeout para permitir que el DOM se refresque con el spinner
        setTimeout(() => {
            switch (viewName) {
                case 'dashboard':
                    this.dashboardController.init();
                    break;
                case 'orders':
                    this.orderController.init();
                    break;
                case 'services':
                    this.serviceController.init();
                    break;
                case 'inventory':
                    this.inventoryController.init();
                    break;
                case 'vehicles':
                    this.vehicleController.init();
                    break;
                case 'clientes':
                    this.clientController.init();
                    break;
                case 'trabajadores':
                    this.workerController.init();
                    break;
                default:
                    contentArea.innerHTML = `
                        <div class="card p-4 text-center">
                            <h3>Vista ${title}</h3>
                            <p class="text-muted">Esta sección está en construcción o no existe.</p>
                        </div>`;
            }
        }, 50);
    }

    /**
     * Limpieza o "Teardown" entre vistas.
     * Crítico para SPAs: Elimina residuos de la vista anterior (modales abiertos, backdrops, tooltips).
     */
    cleanup() {
        console.log('App: Limpiando DOM...');

        // 1. Eliminar modales persistentes (overlay con clase .modal-overlay o bootstrap)
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(m => m.remove());

        // 2. Eliminar backdrops oscuros (si quedan huérfanos)
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(b => b.remove());

        // 3. Limpiar contenedor principal
        const contentArea = document.getElementById('contentArea');
        if (contentArea) {
            contentArea.innerHTML = '';
        }
    }
}

// Bootstrap de la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
