import AiModel from '../models/AiModel.js';
import AiView from '../views/AiView.js';

export default class AiController {
    constructor() {
        this.model = new AiModel();
        this.view = new AiView();
        
        this.view.bindSendMessage(this.handleQuestion.bind(this));
    }

    async handleQuestion(text) {
        // 1. Mostrar mensaje de usuario
        this.view.addMessage(text, 'user');

        // 2. Mostrar indicador de carga
        this.view.showTyping();

        try {
            // 3. Consultar al modelo
            // Podríamos pasar contexto de la página actual si fuera necesario
            const context = {
                currentView: document.querySelector('.sidebar-nav .active')?.getAttribute('data-view') || 'unknown'
            };
            
            const response = await this.model.ask(text, context);
            
            // 4. Remover indicador y mostrar respuesta
            this.view.hideTyping();
            
            const answer = response.answer || response.text || "No entendí la respuesta del servidor.";
            this.view.addMessage(answer, 'ai');

        } catch (error) {
            this.view.hideTyping();
            this.view.addMessage("Ocurrió un error al contactar al asistente.", 'ai');
        }
    }
}
