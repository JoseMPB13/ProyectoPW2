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
            // 1. Fetch Clients (to get vehicles and owners)
            const clientsResponse = await this.api.get('/clients?per_page=1000');
            let clients = [];
            if (clientsResponse && clientsResponse.items) {
                clients = clientsResponse.items;
            } else if (Array.isArray(clientsResponse)) {
                clients = clientsResponse;
            }

            // 2. Fetch Orders (to get status info)
            const ordersResponse = await this.api.get('/orders?per_page=1000');
            let orders = [];
            if (ordersResponse && ordersResponse.items) {
                orders = ordersResponse.items;
            } else if (Array.isArray(ordersResponse)) {
                orders = ordersResponse;
            }

            // 3. Map Vehicles
            const vehicles = [];
            clients.forEach(client => {
                if (client.autos && Array.isArray(client.autos)) {
                    client.autos.forEach(auto => {
                        // Find latest active order for this vehicle
                        // Sort orders by id desc (proxy for recent) or date
                        const vehicleOrders = orders.filter(o => o.auto_id === auto.id || (o.placa === auto.placa));
                        const lastOrder = vehicleOrders.sort((a,b) => b.id - a.id)[0];

                        vehicles.push({
                            ...auto,
                            client_id: client.id,
                            client_name: `${client.nombre} ${client.apellido_p}`,
                            client_ci: client.ci,
                            // Status info from last order
                            estado_nombre: lastOrder ? lastOrder.estado_nombre : 'Sin Orden',
                            fecha_ingreso: lastOrder ? lastOrder.fecha_ingreso : null,
                            technician_name: lastOrder ? lastOrder.tecnico_nombre : '-'
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
