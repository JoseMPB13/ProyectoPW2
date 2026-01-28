/**
 * Componente Modal Genérico
 */
export default class ModalView {
    constructor() {
        this.existingModal = null;
    }

    /**
     * Abre un modal con el título y contenido HTML especificado.
     * @param {string} title - Título del modal.
     * @param {string} contentHTML - Contenido HTML del cuerpo del modal.
     */
    open(title, contentHTML, footerHTML = null) {
        // Cerrar modal previo si existe
        this.close();

        // Crear estructura
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        overlay.innerHTML = `
            <div class="modal-box">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close-btn" title="Cerrar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${contentHTML}
                </div>
                ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
            </div>
        `;

        // Event listeners
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });

        const closeBtn = overlay.querySelector('.modal-close-btn');
        closeBtn.addEventListener('click', () => this.close());

        // Añadir al DOM
        document.body.appendChild(overlay);
        this.existingModal = overlay;

        // Animación simple (opcional CSS transition handled via class)
        setTimeout(() => overlay.classList.add('open'), 10);
    }

    /**
     * Cierra el modal actual.
     */
    close() {
        if (this.existingModal) {
            this.existingModal.classList.remove('open');
            setTimeout(() => {
                if (this.existingModal && this.existingModal.parentNode) {
                    this.existingModal.parentNode.removeChild(this.existingModal);
                }
                this.existingModal = null;
            }, 300); // Wait for transition
        }
    }
}
