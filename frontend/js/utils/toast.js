/**
 * Utility for Toast Notifications (Professional Edition)
 * Sistema de alertas moderno con animaciones, iconos y barra de progreso.
 */
export default class Toast {
    static container = null;

    static init() {
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    /**
     * Muestra una notificación Toast.
     * @param {string} message - Mensaje a mostrar.
     * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'.
     * @param {string} title - Título opcional (se genera automático si se omite).
     */
    static show(message, type = 'info', title = null) {
        this.init();

        const config = {
            success: { icon: 'fa-check-circle', title: '¡Éxito!' },
            error: { icon: 'fa-exclamation-circle', title: 'Error' },
            warning: { icon: 'fa-exclamation-triangle', title: 'Atención' },
            info: { icon: 'fa-info-circle', title: 'Información' }
        };

        const typeConfig = config[type] || config.info;
        const iconClass = typeConfig.icon;
        const displayTitle = title || typeConfig.title;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${displayTitle}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" type="button">
                <i class="fas fa-times"></i>
            </button>
            <div class="toast-progress"></div>
        `;

        // Close button handler
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.close(toast);
        });

        this.container.appendChild(toast);

        // Auto remove triggers
        // Animation duration of progress bar is 3s (in CSS)
        // We add a bit of buffer (3100ms) to ensure animation finishes
        const autoCloseTimer = setTimeout(() => {
            if (document.body.contains(toast)) {
                this.close(toast);
            }
        }, 3000);

        // Pause on hover (Opcional - requiere mas logica de JS para pausar animation)
        // Por simplicidad, mantenemos el timer fijo por ahora.
    }

    static close(toast) {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', (e) => {
            // Wait for fadeOut animation
            if (e.animationName === 'fadeOut' && document.body.contains(toast)) {
                toast.remove();
            }
        });
    }

    static success(message, title = null) {
        this.show(message, 'success', title);
    }

    static error(message, title = null) {
        this.show(message, 'error', title);
    }

    static warning(message, title = null) {
        this.show(message, 'warning', title);
    }
    
    static info(message, title = null) {
        this.show(message, 'info', title);
    }
}
