/**
 * Vista de Autenticación
 * Se encarga de mostrar y ocultar el formulario de login, y capturar interacciones.
 */
export default class AuthView {
    constructor() {
        this.appContainer = document.getElementById('wrapper');
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
        // Usamos position relative para contener el background absoluto
        this.loginContainer.className = 'login-overlay hidden position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3 overflow-hidden';

        // Estilos inline para el background con blur (para no ensuciar styles.css dinámicamente)
        const bgStyle = `
            position: absolute;
            top: -10px; left: -10px; right: -10px; bottom: -10px;
            background: linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.7)), url('recursos/portada.png');
            background-size: cover;
            background-position: center;
            filter: blur(8px);
            z-index: -1;
        `;

        this.loginContainer.innerHTML = `
            <div style="${bgStyle}"></div>
            
            			<div class="card login-card border-0 animate__animated animate__fadeInDown" style="max-width: 400px; width: 90%; background-color: rgba(15, 23, 42, 0.95); border-radius: 20px;"> 
				<div class="card-body p-5">
					<div class="text-center mb-4">
						<!-- Logo Image con Truco CSS v3: Contraste agresivo para limpiar fondo -->
						<div class="mb-3 bg-transparent" style="background-color: transparent !important; padding: 10px;">
							<!-- contrast(500%) fuerza grises a B/N puro. Luego Invert hace el fondo Negro Puro. Screen lo hace transparente. -->
							<img src="recursos/logo.png" alt="Taller App Logo" style="height: 130px; object-fit: contain; background-color: transparent; filter: grayscale(1) contrast(500%) invert(1) brightness(1.1); mix-blend-mode: screen;">
						</div>
						<h3 class="fw-bold text-white font-display">Bienvenido</h3>
						<p class="text-white-50 small">Ingresa tus credenciales para acceder al sistema.</p>
					</div>

					<form id="loginForm" onsubmit="event.preventDefault();">
						<div class="form-floating mb-3">
							<input type="email" class="form-control text-white" id="login_email" placeholder="nombre@ejemplo.com" required autocomplete="email" style="background-color: rgba(255, 255, 255, 0.05); border: none;">
							<label for="login_email" class="text-white-50">Correo Electrónico</label>
						</div>
						<div class="form-floating mb-4">
							<input type="password" class="form-control text-white" id="login_password" placeholder="Contraseña" required autocomplete="current-password" style="background-color: rgba(255, 255, 255, 0.05); border: none;">
							<label for="login_password" class="text-white-50">Contraseña</label>
						</div>

						<div id="loginError" class="alert alert-danger py-2 small text-center hidden mb-3 rounded-3 border-0" role="alert">
							<i class="fas fa-exclamation-circle me-1"></i> <span id="errorText"></span>
						</div>

						<button type="submit" class="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm transition-transform">
							Ingresar <i class="fas fa-arrow-right ms-2"></i>
						</button>
					</form>
				</div>
				<div class="card-footer bg-transparent border-0 py-3 text-center rounded-bottom">
					<small class="text-white-50">¿Olvidaste tu contraseña? <a href="#" class="text-white text-decoration-none fw-bold">Recuperar</a></small>
				</div>
			</div>
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
        const btn = form.querySelector('button[type="submit"]');

        form.onsubmit = async (e) => {
            e.preventDefault();
            this.clearError();

            const email = document.getElementById('login_email').value;
            const password = document.getElementById('login_password').value;

            if (!email || !password) {
                // Podríamos usar showError aquí también
                alert('Por favor ingrese correo y contraseña.');
                return;
            }

            // UI Feedback
            const originalText = btn.textContent;
            btn.textContent = 'Ingresando...';
            btn.disabled = true;

            try {
                await handler(email, password);
            } catch (err) {
                console.error(err);
                this.showError('Error: ' + err.message);
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        };
    }
}
