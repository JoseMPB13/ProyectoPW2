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
            // Nota: El endpoint es /ai/ask según requerimiento
            const response = await this.api.post('/ai/ask', { 
                question, 
                context 
            });
            return response;
        } catch (error) {
            console.error('AI Model Error:', error);
            // Retornar respuesta de error amigable para no romper el chat
            return { 
                answer: "Lo siento, no puedo procesar tu solicitud en este momento. Por favor verifica tu conexión o intenta más tarde." 
            };
        }
    }
}
