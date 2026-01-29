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
        this.loginContainer.style.zIndex = '9999'; // Force top
        
        this.loginContainer.innerHTML = `
            <div class="login-card" style="pointer-events: auto;">
                <div class="login-header">
                    <h2>Bienvenido</h2>
                    <p>Inicia sesión para continuar</p>
                </div>
                <form id="loginForm" onsubmit="event.preventDefault();">
                    <div class="form-group">
                        <label for="login_email">Correo Electrónico</label>
                        <input type="email" id="login_email" required placeholder="admin@example.com" autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label for="login_password">Contraseña</label>
                        <input type="password" id="login_password" required placeholder="••••••" autocomplete="current-password">
                    </div>
                    <div id="loginError" class="error-message hidden"></div>
                    <button type="submit" class="btn-primary w-100 mb-2">Ingresar</button>
                    <button type="button" id="testConnectionA" class="btn-secondary w-100" style="background-color: #6c757d; margin-top: 10px;">Test Conexión</button>
                </form>
            </div>
        `;

        document.body.appendChild(this.loginContainer);
        
        // Bind Test Connection
        setTimeout(() => {
            const btn = document.getElementById('testConnectionA');
            if(btn) {
                btn.onclick = async () => {
                    btn.textContent = 'Probando...';
                    try {
                        const res = await fetch('http://127.0.0.1:5000/health');
                        const data = await res.json();
                        alert('CONEXIÓN EXITOSA:\n' + JSON.stringify(data));
                    } catch (e) {
                        alert('FALLO CONEXIÓN:\n' + e.message + '\n\nAsegúrate que el backend corre en http://127.0.0.1:5000');
                    } finally {
                        btn.textContent = 'Test Conexión';
                    }
                };
            }
        }, 500);
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
        // Usar el botón directamente para evitar recargas accidentales del form
        const btn = this.loginContainer.querySelector('button[type="submit"]');
        if (btn) {
            btn.type = 'button'; // Cambiar a button normal
            btn.onclick = async (e) => {
                e.preventDefault(); // Por si acaso
                this.clearError();
                
                const email = document.getElementById('login_email').value;
                const password = document.getElementById('login_password').value;

                if (!email || !password) {
                    alert('Por favor ingrese correo y contraseña.');
                    return;
                }

                // UI Feedback
                const originalText = btn.textContent;
                btn.textContent = 'Enviando...';
                btn.disabled = true;

                try {
                    await handler(email, password);
                } catch (err) {
                    console.error(err);
                    alert('Error en handler: ' + err.message);
                } finally {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            };
        }
    }
}
