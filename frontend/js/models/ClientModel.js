import API from '../utils/api.js';

/**
 * Modelo de Clientes
 */
export default class ClientModel {
    constructor(api) {
        this.api = api;
        this.endpoint = '/clients';
    }

    async getAll() {
        try {
            const response = await this.api.get(`${this.endpoint}?per_page=1000`);
            // Backend devuelve { items: [...], ... }
            if (response && response.items) return response.items;
            return [];
        } catch (error) {
            console.error('Error fetching clients:', error);
            return [];
        }
    }

    async getById(id) {
        // Obtenemos todos y filtramos, o podríamos hacer GET /clients/id si existiera endpoint detalle
        const clients = await this.getAll();
        return clients.find(c => c.id == id);
    }
    
    async create(data) {
        return await this.api.post(this.endpoint, data);
    }

    async update(id, data) {
        return await this.api.put(`${this.endpoint}/${id}`, data);
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
