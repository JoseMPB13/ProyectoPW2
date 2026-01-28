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
     * Obtiene todos los vehículos desde los clientes.
     * @returns {Promise<Array>} Lista de objetos con información de vehículo.
     */
    async getAll() {
        try {
            // Obtener clientes con sus autos
            const response = await this.api.get('/clients?per_page=1000');
            
            // El backend devuelve {items: [], total, pages}
            let clients = [];
            if (response && response.items) {
                clients = response.items;
            } else if (Array.isArray(response)) {
                clients = response;
            }
            
            // Extraer todos los autos de todos los clientes
            const vehicles = [];
            clients.forEach(client => {
                if (client.autos && Array.isArray(client.autos)) {
                    client.autos.forEach(auto => {
                        vehicles.push({
                            ...auto,
                            client_id: client.id,
                            client_name: `${client.nombre} ${client.apellido_p}`,
                            client_ci: client.ci
                        });
                    });
                }
            });
            
            return vehicles;
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            return [];
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
