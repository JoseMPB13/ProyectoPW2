import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ClientForm from '../components/ClientForm';
import VehicleForm from '../components/VehicleForm';

const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    
    // State for viewing/adding vehicles
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientVehicles, setClientVehicles] = useState([]);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [isAddVehicleFormOpen, setIsAddVehicleFormOpen] = useState(false);

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients');
            setClients(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching clients:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleCreateClient = async (clientData) => {
        try {
            await api.post('/clients', clientData);
            fetchClients();
            setIsClientModalOpen(false);
        } catch (error) {
            console.error('Error creating client:', error);
            alert('Error al crear cliente');
        }
    };

    const handleViewVehicles = async (client) => {
        setSelectedClient(client);
        setIsVehicleModalOpen(true);
        // Reset sub-modal state
        setIsAddVehicleFormOpen(false);
        fetchVehicles(client.id);
    };

    const fetchVehicles = async (clientId) => {
        try {
            const response = await api.get(`/clients/${clientId}/vehicles`);
            setClientVehicles(response.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            setClientVehicles([]);
        }
    };

    const handleAddVehicle = async (vehicleData) => {
        if (!selectedClient) return;
        try {
            await api.post(`/clients/${selectedClient.id}/vehicles`, vehicleData);
            fetchVehicles(selectedClient.id);
            setIsAddVehicleFormOpen(false); // Return to list view within modal
        } catch (error) {
            console.error('Error adding vehicle:', error);
            alert('Error al agregar vehículo');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h2>
                <button
                    onClick={() => setIsClientModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition duration-150"
                >
                    + Nuevo Cliente
                </button>
            </div>

            {/* Clients Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Ubicación
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                        Cargando...
                                    </td>
                                </tr>
                            ) : clients.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                        No hay clientes registrados.
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client) => (
                                    <tr key={client.id}>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap font-semibold">
                                                {client.first_name} {client.last_name}
                                            </p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{client.email}</p>
                                            <p className="text-gray-500 text-xs">{client.phone}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{client.address || '-'}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <button
                                                onClick={() => handleViewVehicles(client)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Vehículos
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Client Modal */}
            <Modal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                title="Registrar Nuevo Cliente"
            >
                <ClientForm
                    onSubmit={handleCreateClient}
                    onCancel={() => setIsClientModalOpen(false)}
                />
            </Modal>

            {/* View/Manage Vehicles Modal */}
            <Modal
                isOpen={isVehicleModalOpen}
                onClose={() => setIsVehicleModalOpen(false)}
                title={selectedClient ? `Vehículos de ${selectedClient.first_name} ${selectedClient.last_name}` : 'Vehículos'}
            >
                {!isAddVehicleFormOpen ? (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setIsAddVehicleFormOpen(true)}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded transition"
                            >
                                + Agregar Vehículo
                            </button>
                        </div>
                        
                        {clientVehicles.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {clientVehicles.map(v => (
                                    <li key={v.id} className="py-3 flex justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-800">{v.brand} {v.model} ({v.year})</p>
                                            <p className="text-sm text-gray-500">Placa: {v.plate}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-center py-4">Este cliente no tiene vehículos registrados.</p>
                        )}
                        
                        <div className="mt-4 border-t pt-4 flex justify-end">
                             <button
                                onClick={() => setIsVehicleModalOpen(false)}
                                className="text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                ) : (
                    <VehicleForm
                        onSubmit={handleAddVehicle}
                        onCancel={() => setIsAddVehicleFormOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default ClientsPage;
