import ClientModel from '../models/ClientModel.js';
import ClientView from '../views/ClientView.js';

export default class ClientController {
    constructor() {
        this.model = new ClientModel();
        this.view = new ClientView();
    }

    async init() {
        try {
            const clients = await this.model.getAll();
            this.view.render(clients);
            
            // Vincular evento de selección
            this.view.bindSelectClient(this.handleSelectClient.bind(this));
            
        } catch (error) {
            console.error('Error init ClientController', error);
            this.view.render([]);
        }
    }

    async handleSelectClient(id) {
        try {
            const client = await this.model.getById(id);
            if (client) {
                this.view.renderClientDetails(client);
            }
        } catch (error) {
            console.error('Error selecting client', error);
        }
    }
}
