import API from './utils/api.js';
import AuthController from './controllers/AuthController.js';
import VehicleController from './controllers/VehicleController.js';
import ClientController from './controllers/ClientController.js';
// import AiController from './controllers/AiController.js'; // Removed
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
 * Controlador Principal de la Aplicación (App)
 * Inicia la aplicación y coordina los componentes globales.
 */
class App {
    constructor() {
        this.api = new API();

        // Inicializar Chat Widget (prioridad alta para debug)
        try {
            this.chatWidget = new ChatWidget();
            console.log('ChatWidget inicializado');
        } catch (e) {
            console.error('Error inicializando ChatWidget:', e);
        }

        // Inicializar AuthController, pasando callback de éxito
        this.authController = new AuthController(() => this.onLoginSuccess());

        // Inyección de Dependencias
        this.vehicleModel = new VehicleModel(this.api);
        this.vehicleView = new VehicleView();
        this.vehicleController = new VehicleController(this.vehicleModel, this.vehicleView);

        this.dashboardModel = new DashboardModel(this.api);
        this.dashboardView = new DashboardView();
        this.dashboardController = new DashboardController(this.dashboardModel, this.dashboardView);

        this.orderController = new OrderController();
        this.workerController = new WorkerController();

        this.clientModel = new ClientModel(this.api);
        this.clientController = new ClientController(this.clientModel);
        // this.aiController = new AiController(); // Removed

        // Nuevos Controladores (Inyección de Dependencias)
        this.serviceModel = new ServiceModel(this.api);
        this.serviceView = new ServiceView();
        this.serviceController = new ServiceController(this.serviceModel, this.serviceView);

        this.inventoryModel = new InventoryModel(this.api);
        this.inventoryView = new InventoryView();
        this.inventoryController = new InventoryController(this.inventoryModel, this.inventoryView);

        this.init();

        // Exponer la instancia para depuración
        window.activeApp = this;
    }

    /**
     * Inicializa la aplicación, event listeners y estado inicial.
     */
    init() {
        console.log('Aplicación iniciando...');

        // Verificar autenticación antes de cargar nada más
        const isAuthenticated = this.authController.checkAuth();

        if (isAuthenticated) {
            this.startApp();
        }
    }

    /**
     * Método llamado cuando el usuario se autentica correctamente (o tiene sesión válida).
     * Carga la interfaz principal.
     */
    onLoginSuccess() {
        this.startApp();
    }

    /**
     * Inicia la lógica principal de la app (listeners, vista inicial).
     */
    startApp() {
        console.log('Sesión válida. Cargando dashboard...');
        this.setupEventListeners();

        // Cargar vista por defecto 'dashboard' (Dashboard principal)
        this.loadView('dashboard');

        // Actualizar info de usuario en header si existe
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const userNameEl = document.getElementById('userName');
                if (userNameEl) userNameEl.textContent = user.username || user.email || 'Usuario';
            } catch (e) {
                console.error('Error parseando user data', e);
            }
        }
    }

    /**
     * Configura los escuchadores de eventos globales (navegación, logout, etc).
     */
    setupEventListeners() {
        // Manejo de navegación sidebar usando Event Delegation
        const sidebar = document.getElementById('sidebar-wrapper');
        if (sidebar) {
            // Clonar nodo para limpiar listeners previos si se reinicia app
            // Nota: Clonar el sidebar entero podría romper otros bindings si los hubiera, 
            // pero en este caso simplifica el reset. Mejor solo asignar onclick.

            sidebar.addEventListener('click', (e) => {
                const link = e.target.closest('a[data-view]');
                if (link) {
                    e.preventDefault();
                    this.handleNavigation(link);
                }
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            // Limpiar listeners previos (clonando)
            const newLogout = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogout, logoutBtn);

            newLogout.addEventListener('click', () => {
                this.authController.logout();
            });
        }
    }

    /**
     * Maneja la navegación lógica entre vistas.
     * @param {HTMLElement} targetLink - El enlace clickeado.
     */
    handleNavigation(targetLink) {
        if (!targetLink) return;

        // Remover clase active de todos en el sidebar
        document.querySelectorAll('#sidebar-wrapper .list-group-item').forEach(a => a.classList.remove('active'));

        // Agregar a actual
        targetLink.classList.add('active');

        const viewName = targetLink.getAttribute('data-view');
        if (viewName) {
            this.loadView(viewName);
        }
    }

    /**
     * Carga el contenido de la vista seleccionada.
     * @param {string} viewName - Nombre de la vista a cargar.
     */
    loadView(viewName) {
        const contentArea = document.getElementById('contentArea');
        // Usar getElementById para ser más robusto con el nuevo layout
        const headerTitle = document.getElementById('pageTitle');

        console.log(`Cargando vista: ${viewName}`);

        // Actualizar título
        let title = 'Dashboard';
        if (viewName === 'dashboard') title = 'Dashboard';
        else if (viewName === 'orders') title = 'Gestión de Órdenes';
        else if (viewName === 'services') title = 'Gestión de Servicios';
        else if (viewName === 'inventory') title = 'Inventario de Repuestos';
        else if (viewName === 'vehicles') title = 'Gestión de Vehículos';
        else if (viewName === 'clientes') title = 'Clientes';
        else if (viewName === 'trabajadores') title = 'Trabajadores';

        else title = viewName.charAt(0).toUpperCase() + viewName.slice(1);

        headerTitle.textContent = title;

        headerTitle.textContent = title;

        // Limpiar contenido previo y estado global
        this.cleanup();

        contentArea.innerHTML = '<p class="text-center p-4">Cargando...</p>';

        // Enrutamiento
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
                    <div class="card">
                        <h3>Vista ${title}</h3>
                        <p>Esta sección está en construcción.</p>
                    </div>`;
        }
    }

    /**
     * Limpia el DOM antes de cambiar de vista.
     * Elimina modales, backdrops y limpia el área de contenido.
     */
    cleanup() {
        console.log('App: Cleaning up DOM...');

        // 1. Eliminar modales (overlay con clase .modal-overlay)
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(m => m.remove());

        // 2. Eliminar backdrops residuales (si hubiera bootstrap u otros)
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(b => b.remove());

        // 3. Limpiar área de contenido principal
        const contentArea = document.getElementById('contentArea');
        if (contentArea) {
            contentArea.innerHTML = '';
        }

        // 4. Cerrar chat de IA si está abierto (opcional, por limpieza visual)
        // const aiWindow = document.querySelector('.ai-chat-window');
        // if (aiWindow && !aiWindow.classList.contains('hidden')) {
        //    aiWindow.classList.add('hidden');
        // }
    }
}

// Instanciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
