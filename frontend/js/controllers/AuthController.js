import AuthModel from '../models/AuthModel.js';
import AuthView from '../views/AuthView.js';

/**
 * Controlador de Autenticación
 * Coordina la lógica de inicio de sesión entre vista y modelo.
 */
export default class AuthController {
    /**
     * @param {Function} onLoginSuccess - Callback a ejecutar cuando el login es exitoso.
     */
    constructor(onLoginSuccess) {
        this.model = new AuthModel();
        this.view = new AuthView();
        this.onLoginSuccess = onLoginSuccess;

        // Vincular eventos de la vista
        this.view.bindLogin(this.handleLogin.bind(this));
    }

    /**
     * Maneja el proceso de login iniciado desde la vista.
     * @param {string} email 
     * @param {string} password 
     */
    async handleLogin(email, password) {
        try {
            const response = await this.model.login(email, password);
            
            // Asumiendo que la respuesta exitosa trae { access_token, user, ... }
            if (response && response.access_token) {
                // Guardar en localStorage
                localStorage.setItem('token', response.access_token);
                // Si el backend devuelve info del user, guardarla también
                if (response.user) {
                    localStorage.setItem('user', JSON.stringify(response.user));
                }

                // Ocultar login y notificar éxito a la App principal
                this.view.hideLogin();
                if (this.onLoginSuccess) this.onLoginSuccess();
            } else {
                this.view.showError('Respuesta inesperada del servidor.');
            }
        } catch (error) {
            console.error('Login error:', error);
            // Mostrar error amigable
            const msg = error.message || 'Error al iniciar sesión. Verifique credenciales.';
            this.view.showError(msg);
        }
    }

    /**
     * Verifica el estado inicial. Si no hay token, fuerza el login.
     * @returns {boolean} true si está autenticado, false si mostró login.
     */
    checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            this.view.showLogin();
            return false;
        } else {
            this.view.hideLogin();
            return true;
        }
    }

    /**
     * Cierra la sesión y muestra el login.
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.view.showLogin();
    }
}
