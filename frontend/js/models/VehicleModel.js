import API from '../utils/api.js';

/**
 * Modelo de Vehículos
 * Gestiona la obtención de datos de vehículos.
 * Nota: Por ahora utilizamos el endpoint de órdenes ya que contiene información de vehículos.
 */
export default class VehicleModel {
    constructor(api) {
        this.api = api;
    }

    /**
     * Obtiene todos los vehículos (extraídos de las órdenes por ahora).
     * @returns {Promise<Array>} Lista de objetos con información de vehículo.
     */
    async getAll() {
        try {
            // Consumimos /orders para obtener info de vehículos
            const orders = await this.api.get('/orders');
            
            // Si el backend fallara o devolviera null, devolvemos mock para pruebas visuales
            if (!orders) return this._getMockData();

            // Transformar/Normalizar datos si es necesario
            // Asumimos que orders es un array de objetos con brand, model, plate, etc.
            return orders;
        } catch (error) {
            console.warn('Error fetching orders/vehicles, using mock data for UI test.');
            return this._getMockData();
        }
    }

    /**
     * Datos mockeados para pruebas visuales cuando no hay backend.
     */
    _getMockData() {
        return [
            {
                id: 1,
                vehicle_plate: 'ABCD-123',
                brand: 'Toyota',
                model: 'Corolla',
                vin: '1N4AL...',
                client: { name: 'Juan Perez' },
                status: 'pending',
                entry_date: '2025-01-20',
                technician: { name: 'Carlos Mecánico' }
            },
            {
                id: 2,
                vehicle_plate: 'XYZ-987',
                brand: 'Ford',
                model: 'Ranger',
                vin: '2FMPK...',
                client: { name: 'Empresa S.A.' },
                status: 'in_progress',
                entry_date: '2025-01-22',
                technician: { name: 'Ana Técnica' }
            },
            {
                id: 3,
                vehicle_plate: 'JKL-456',
                brand: 'Honda',
                model: 'Civic',
                vin: 'JHM...',
                client: { name: 'Maria Gomez' },
                status: 'completed',
                entry_date: '2025-01-15',
                technician: { name: 'Carlos Mecánico' }
            }
        ];
    }
}
