import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

/**
 * Vista del Asistente IA
 * Inicializa el widget oficial de n8n.
 */
export default class AiView {
    constructor() {
        this.render();
    }

    /**
     * Inicializa el chat de n8n.
     */
    render() {
        // 1. Crear el contenedor objetivo si no existe
        let chatTarget = document.getElementById('n8n-chat');
        if (!chatTarget) {
            chatTarget = document.createElement('div');
            chatTarget.id = 'n8n-chat';
            document.body.appendChild(chatTarget);
        }

        // 2. Inicializar el widget con la configuración proporcionada
        createChat({
            webhookUrl: 'https://paneln8n.ciberuniverso.space/webhook/1c1b2b3c-230b-49d2-9352-e85a573cd1b7/chat',
            webhookConfig: {
                method: 'POST',
                headers: {}
            },
            target: '#n8n-chat',
            mode: 'window',
            chatInputKey: 'chatInput',
            chatSessionKey: 'sessionId',
            loadPreviousSession: true,
            metadata: {},
            showWelcomeScreen: false,
            defaultLanguage: 'es', // Cambiado a 'es' para coincidir con la UI en español
            initialMessages: [
                '¡Hola! 👋',
                'Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
            ],
            i18n: {
                en: {
                    title: 'Hi there! 👋',
                    subtitle: "Start a chat. We're here to help you 24/7.",
                    footer: '',
                    getStarted: 'New Conversation',
                    inputPlaceholder: 'Type your question..',
                },
                es: { // Agregado soporte explícito para español
                    title: '¡Hola! 👋',
                    subtitle: "Inicia un chat. Estamos aquí para ayudarte 24/7.",
                    footer: '',
                    getStarted: 'Nueva Conversación',
                    inputPlaceholder: 'Escribe tu pregunta...',
                }
            },
        });
    }

    // Métodos antiguos eliminados ya que el widget maneja su propia UI
}
