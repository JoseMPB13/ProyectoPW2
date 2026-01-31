import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

export default class ChatWidget {
    constructor() {
        this.init();
    }

    init() {
        // Asegurarse de que el contenedor existe, si no, crearlo dinámicamente
        if (!document.getElementById('n8n-chat')) {
            const div = document.createElement('div');
            div.id = 'n8n-chat';
            document.body.appendChild(div);
        }

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
            defaultLanguage: 'es', // Cambiado a español
            initialMessages: [
                '¡Hola! 👋',
                'Soy tu Asistente Virtual. ¿En qué puedo ayudarte hoy?'
            ],
            i18n: {
                es: {
                    title: '¡Hola! 👋',
                    subtitle: "Inicia un chat. Estamos aquí para ayudarte.",
                    footer: '',
                    getStarted: 'Nueva Conversación',
                    inputPlaceholder: 'Escribe tu pregunta...',
                },
                en: {
                    title: 'Hi there! 👋',
                    subtitle: "Start a chat. We're here to help you 24/7.",
                    footer: '',
                    getStarted: 'New Conversation',
                    inputPlaceholder: 'Type your question..',
                },
            },
            enableStreaming: false,
            style: {
                default: {
                    background: '#ffffff',
                    color: '#333333',
                },
                primary: {
                    background: '#4f46e5', // Coincide con el tema principal
                    color: '#ffffff',
                }
            }
        });

        console.log('n8n Chat initialized');
    }
}
