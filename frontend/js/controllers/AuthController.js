import AuthModel from '../models/AuthModel.js';
import AuthView from '../views/AuthView.js';

/**
 * ============================================================================
 * ENCABEZADO DEL ARCHIVO (Controlador de Seguridad)
 * ============================================================================
 * Propósito:
 *   Gestiona el flujo de Autenticación (Login/Logout) y la persistencia de sesión.
 *   Actúa como guardián de la seguridad en el frontend.
 *
 * Flujo Lógico Central:
 *   1. Intercepta credenciales desde la Vista.
 *   2. Solicita token JWT al Backend vía Modelo.
 *   3. Almacena Token y Contexto de Usuario en LocalStorage.
 *   4. Notifica a la App principal para transición de estado.
 *
 * Interacciones:
 *   - Modelo: `AuthModel` (Comunicación con /auth/login).
 *   - Vista: `AuthView` (Formulario de Login).
 *   - Storage: Gestión directa de `localStorage`.
 * ============================================================================
 */

export default class AuthController {
    /**
     * @param {Function} onLoginSuccess - Callback a ejecutar cuando la sesión se establece.
     *                                    Usualmente recarga la SPA o monta el Dashboard.
     */
    constructor(onLoginSuccess) {
        this.model = new AuthModel();
        this.view = new AuthView();
        this.onLoginSuccess = onLoginSuccess;

        // Binding de eventos UI
        this.view.bindLogin(this.handleLogin.bind(this));
    }

    /**
     * Procesa la solicitud de inicio de sesión.
     * 
     * @param {string} email
     * @param {string} password
     */
    async handleLogin(email, password) {
        try {
            const response = await this.model.login(email, password);
            
            // Validación de la estructura de respuesta JWT
            if (response && response.access_token) {
                console.log('Login exitoso. Iniciando sesión...');
                
                // 1. Persistencia de Sesión
                localStorage.setItem('token', response.access_token);
                
                // Verificación de escritura (Critical Path)
                if (!localStorage.getItem('token')) {
                     alert('ERROR CRÍTICO: No se pudo guardar el token localmente.');
                     return;
                }

                // 2. Persistencia de Contexto de Usuario
                if (response.user) {
                    localStorage.setItem('user', JSON.stringify(response.user));
                }

                alert('Login Exitoso! Redirigiendo...');

                // 3. Transición de UI
                this.view.hideLogin();
                
                // 4. Notificación a App Principal
                if (this.onLoginSuccess) this.onLoginSuccess();
            } else {
                console.error('Respuesta de login inválida:', response);
                this.view.showError('Respuesta inesperada del servidor.');
            }
        } catch (error) {
            console.error('Error durante el login:', error);
            const msg = error.message || 'Error desconocido';
            // Feedback dual: Alert para bloqueo inmediato y mensaje en vista
            alert('Error de Conexión/Login:\n' + msg);
            this.view.showError(msg);
        }
    }

    /**
     * Verifica la validez de la sesión actual.
     * Si no existe token, fuerza la vista de login.
     * 
     * @returns {boolean} true si existe sesión activa.
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
     * Cierra la sesión del usuario.
     * Destruye credenciales locales y reinicia la interfaz.
     */
    logout() {
        // Limpieza segura
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirección forzada
        this.view.showLogin();
    }
}
