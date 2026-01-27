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
                nombre: 'Juan',
                apellido_p: 'Perez',
                correo: 'juan@example.com', 
                celular: '+56 9 1234 5678', 
                direccion: 'Calle Falsa 123',
                vehicles_count: 2,
                last_visit: '2025-01-20'
            },
            { 
                id: 2, 
                nombre: 'Maria',
                apellido_p: 'Gomez',
                correo: 'maria@example.com', 
                celular: '+56 9 8765 4321', 
                direccion: 'Av. Siempre Viva 742',
                vehicles_count: 1,
                last_visit: '2025-01-15'
            },
            { 
                id: 3, 
                nombre: 'Empresa',
                apellido_p: 'Logística S.A.',
                correo: 'contacto@empresa.com', 
                celular: '+56 2 2222 3333', 
                direccion: 'Parque Industrial Lote 5',
                vehicles_count: 5,
                last_visit: '2025-01-22'
            }
        ];
    }
}
