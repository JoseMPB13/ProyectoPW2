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
                placa: 'ABCD-12',
                marca: 'Toyota',
                modelo: 'Corolla',
                vin: '1N4AL...',
                client_name: 'Juan Perez',
                estado_nombre: 'Pendiente',
                fecha_ingreso: '2025-01-20',
                technician_name: 'Carlos Mecánico'
            },
            {
                id: 2,
                placa: 'XYZ-987',
                marca: 'Ford',
                modelo: 'Ranger',
                vin: '2FMPK...',
                client_name: 'Empresa S.A.',
                estado_nombre: 'En Diagnostico',
                fecha_ingreso: '2025-01-22',
                technician_name: 'Ana Técnica'
            },
            {
                id: 3,
                placa: 'JKL-456',
                marca: 'Honda',
                modelo: 'Civic',
                vin: 'JHM...',
                client_name: 'Maria Gomez',
                estado_nombre: 'Entregado',
                fecha_ingreso: '2025-01-15',
                technician_name: 'Carlos Mecánico'
            }
        ];
    }
}
