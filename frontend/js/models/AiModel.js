import API from '../utils/api.js';

/**
 * Modelo de IA
 * Gestiona la comunicación con el endpoint de asistencia inteligente.
 */
export default class AiModel {
    constructor() {
        this.api = new API();
    }

    /**
     * Envía una pregunta al asistente.
     * @param {string} question - Pregunta del usuario.
     * @param {Object} context - Contexto opcional (ej: página actual).
     * @returns {Promise<Object>} Respuesta estructurada de la IA.
     */
    async ask(question, context = {}) {
        try {
            // URL del Webhook de n8n proporcionado por el usuario
            const webhookUrl = 'https://paneln8n.ciberuniverso.space/webhook/1c1b2b3c-230b-49d2-9352-e85a573cd1b7/chat';

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatInput: question,
                    context: context
                })
            });

            if (!response.ok) throw new Error('Error en el servicio de IA');

            const data = await response.json();

            // Adaptar respuesta si n8n retorna { output: "..." } o similar
            // Asumiremos que retorna JSON con campo 'output' o 'answer'
            return {
                answer: data.output || data.answer || data.text || "Respuesta recibida"
            };

        } catch (error) {
            console.error('AI Model Error:', error);
            // Retornar respuesta de error amigable
            return {
                answer: "Lo siento, hubo un problema al conectar con el asistente. Intenta nuevamente."
            };
        }
    }
}
