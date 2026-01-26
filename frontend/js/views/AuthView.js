/**
 * Vista de Autenticación
 * Se encarga de mostrar y ocultar el formulario de login, y capturar interacciones.
 */
export default class AuthView {
    constructor() {
        this.appContainer = document.querySelector('.app-container');
        this.loginContainer = null;
        this.createLoginModal();
    }

    /**
     * Genera e inyecta el HTML del modal de login en el DOM.
     * Inicialmente oculto.
     */
    createLoginModal() {
        // Crear elemento contenedor
        this.loginContainer = document.createElement('div');
        this.loginContainer.id = 'loginContainer';
        this.loginContainer.className = 'login-overlay hidden';
        
        this.loginContainer.innerHTML = `
            <div class="login-card">
                <div class="login-header">
                    <h2>Bienvenido</h2>
                    <p>Inicia sesión para continuar</p>
                </div>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">Correo Electrónico</label>
                        <input type="email" id="email" required placeholder="admin@example.com">
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" required placeholder="••••••">
                    </div>
                    <div id="loginError" class="error-message hidden"></div>
                    <button type="submit" class="btn-primary w-100">Ingresar</button>
                </form>
            </div>
        `;

        document.body.appendChild(this.loginContainer);
    }

    /**
     * Muestra el formulario de login y oculta la app principal.
     */
    showLogin() {
        this.loginContainer.classList.remove('hidden');
        this.appContainer.classList.add('hidden'); // Ocultar layout principal
    }

    /**
     * Oculta el formulario de login y muestra la app principal.
     */
    hideLogin() {
        this.loginContainer.classList.add('hidden');
        this.appContainer.classList.remove('hidden');
    }

    /**
     * Muestra un mensaje de error en el formulario.
     * @param {string} message - Mensaje a mostrar.
     */
    showError(message) {
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    /**
     * Limpia los mensajes de error.
     */
    clearError() {
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = '';
        errorDiv.classList.add('hidden');
    }

    /**
     * Vincula el manejador de eventos para el submit del formulario.
     * @param {Function} handler - Función a ejecutar al enviar (recibe email, password).
     */
    bindLogin(handler) {
        const form = document.getElementById('loginForm');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.clearError();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            handler(email, password);
        });
    }
}
