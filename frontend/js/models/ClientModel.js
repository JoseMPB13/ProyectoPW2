import API from '../utils/api.js';

/**
 * Modelo de Clientes
 */
export default class ClientModel {
    constructor() {
        this.api = new API();
    }

    /**
     * Obtiene todos los clientes.
     */
    async getAll() {
        try {
            const clients = await this.api.get('/clients');
            if (!clients) return this._getMockData();
            return clients;
        } catch (error) {
            console.warn('Error fetching clients, using mock data.');
            return this._getMockData();
        }
    }

    /**
     * Obtiene un cliente por ID (simulado filtrando mock o fetch real).
     */
    async getById(id) {
        // Si tuviéramos endpoint detallado: await this.api.get(`/clients/${id}`);
        // Por ahora filtramos de todos
        const clients = await this.getAll();
        return clients.find(c => c.id == id);
    }

    _getMockData() {
        return [
            { 
                id: 1, 
                name: 'Juan Perez', 
                email: 'juan@example.com', 
                phone: '+56 9 1234 5678', 
                address: 'Calle Falsa 123',
                vehicles_count: 2,
                last_visit: '2025-01-20'
            },
            { 
                id: 2, 
                name: 'Maria Gomez', 
                email: 'maria@example.com', 
                phone: '+56 9 8765 4321', 
                address: 'Av. Siempre Viva 742',
                vehicles_count: 1,
                last_visit: '2025-01-15'
            },
            { 
                id: 3, 
                name: 'Empresa Logística S.A.', 
                email: 'contacto@empresa.com', 
                phone: '+56 2 2222 3333', 
                address: 'Parque Industrial Lote 5',
                vehicles_count: 5,
                last_visit: '2025-01-22'
            }
        ];
    }
}
