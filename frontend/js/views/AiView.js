/**
 * Vista del Asistente IA
 * Renderiza el botón flotante y la ventana de chat.
 */
export default class AiView {
    constructor() {
        this.chatContainer = null;
        this.render();
    }

    /**
     * Renderiza el Botón Flotante y el Contenedor del Chat.
     */
    render() {
        // Floating Action Button
        const fab = document.createElement('button');
        fab.className = 'ai-fab';
        fab.innerHTML = '🤖'; // O un icono SVG
        fab.title = "Asistente Virtual";
        
        // Chat Window Container
        const chatWindow = document.createElement('div');
        chatWindow.className = 'ai-chat-window hidden'; // Oculto por defecto
        
        chatWindow.innerHTML = `
            <div class="ai-header">
                <h3>Asistente Virtual</h3>
                <button class="ai-close-btn">&times;</button>
            </div>
            <div class="ai-messages" id="aiMessages">
                <div class="message ai">
                    <div class="bubble">Hola, ¿en qué puedo ayudarte hoy?</div>
                </div>
            </div>
            <div class="ai-input-area">
                <input type="text" id="aiInput" placeholder="Escribe tu pregunta..." autocomplete="off">
                <button id="aiSendBtn">➤</button>
            </div>
        `;

        document.body.appendChild(fab);
        document.body.appendChild(chatWindow);

        this.fab = fab;
        this.chatWindow = chatWindow;
        this.messagesContainer = chatWindow.querySelector('#aiMessages');
        this.input = chatWindow.querySelector('#aiInput');
        this.sendBtn = chatWindow.querySelector('#aiSendBtn');
        this.closeBtn = chatWindow.querySelector('.ai-close-btn');

        this.bindUiEvents();
    }

    bindUiEvents() {
        // Toggle Chat
        this.fab.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.toggleChat());
    }

    toggleChat() {
        this.chatWindow.classList.toggle('hidden');
        if (!this.chatWindow.classList.contains('hidden')) {
            this.input.focus();
        }
    }

    /**
     * Agrega un mensaje al chat.
     * @param {string} text - Contenido del mensaje.
     * @param {string} sender - 'user' o 'ai'.
     */
    addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        // Convertir saltos de línea a <br> simples para mejorar formato
        const formattedText = text.replace(/\n/g, '<br>');
        
        msgDiv.innerHTML = `<div class="bubble">${formattedText}</div>`;
        this.messagesContainer.appendChild(msgDiv);
        this.scrollToBottom();
    }

    /**
     * Limpia el input del chat.
     */
    clearInput() {
        this.input.value = '';
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    /**
     * Vincula el evento de enviar mensaje.
     * @param {Function} handler - Callback(text)
     */
    bindSendMessage(handler) {
        const send = () => {
            const text = this.input.value.trim();
            if (text) {
                handler(text);
                this.clearInput();
            }
        };

        this.sendBtn.addEventListener('click', send);
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') send();
        });
    }

    showTyping() {
        // Podríamos agregar un indicador de typing temporal
        const indicator = document.createElement('div');
        indicator.id = 'typingIndicator';
        indicator.className = 'message ai typing';
        indicator.innerHTML = '<div class="bubble">...</div>';
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    hideTyping() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }
}
