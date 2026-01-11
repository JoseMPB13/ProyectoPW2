import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CreateOrderPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // Data
    const [clients, setClients] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    
    // Selection
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    
    const [loading, setLoading] = useState(false);

    // Fetch Clients on mount
    useEffect(() => {
        const loadClients = async () => {
            try {
                const response = await api.get('/clients');
                setClients(response.data);
            } catch (error) {
                console.error("Error loading clients", error);
            }
        };
        loadClients();
    }, []);

    // Fetch Vehicles when Client is selected
    useEffect(() => {
        if (selectedClient) {
            const loadVehicles = async () => {
                try {
                    const response = await api.get(`/clients/${selectedClient.id}/vehicles`);
                    setVehicles(response.data);
                } catch (error) {
                    console.error("Error loading vehicles", error);
                    setVehicles([]);
                }
            };
            loadVehicles();
        }
    }, [selectedClient]);

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setStep(2);
    };

    const handleCreateOrder = async () => {
        if (!selectedVehicle) return;
        setLoading(true);
        try {
            const response = await api.post('/orders', {
                vehicle_id: selectedVehicle.id
            });
            const newOrder = response.data.order;
            // Redirect to the Order Detail page
            navigate(`/orders/${newOrder.id}`);
        } catch (error) {
            console.error("Error creating order", error);
            alert("Error al crear la orden de trabajo");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nueva Orden de Trabajo</h2>

            {/* Progress Bar */}
            <div className="flex items-center mb-8">
                <div className={`flex-1 text-center py-2 border-b-4 ${step >= 1 ? 'border-blue-600 text-blue-600 font-bold' : 'border-gray-200 text-gray-400'}`}>
                    1. Seleccionar Cliente
                </div>
                <div className={`flex-1 text-center py-2 border-b-4 ${step >= 2 ? 'border-blue-600 text-blue-600 font-bold' : 'border-gray-200 text-gray-400'}`}>
                    2. Seleccionar Vehículo
                </div>
            </div>

            {/* Step 1: Select Client */}
            {step === 1 && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Busque y seleccione un cliente</h3>
                    {/* Simple search could be added here, for now list all */}
                    <div className="overflow-y-auto max-h-96">
                        <ul className="divide-y divide-gray-200">
                            {clients.map(client => (
                                <li 
                                    key={client.id} 
                                    className="py-3 px-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                                    onClick={() => handleClientSelect(client)}
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800">{client.first_name} {client.last_name}</p>
                                        <p className="text-sm text-gray-500">{client.email} | {client.phone}</p>
                                    </div>
                                    <span className="text-blue-600 text-sm">Seleccionar &rarr;</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Step 2: Select Vehicle */}
            {step === 2 && (
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Vehículos de {selectedClient.first_name} {selectedClient.last_name}
                        </h3>
                        <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700">
                            Cambiar Cliente
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vehicles.length === 0 ? (
                            <p className="text-gray-500 col-span-2">Este cliente no tiene vehículos registrados.</p>
                        ) : (
                            vehicles.map(vehicle => (
                                <div 
                                    key={vehicle.id}
                                    className={`border rounded-lg p-4 cursor-pointer transition ${selectedVehicle?.id === vehicle.id ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                    onClick={() => setSelectedVehicle(vehicle)}
                                >
                                    <p className="font-bold text-gray-800">{vehicle.brand} {vehicle.model}</p>
                                    <p className="text-sm text-gray-600">Año: {vehicle.year}</p>
                                    <div className="mt-2 text-xs bg-gray-200 inline-block px-2 py-1 rounded">
                                        {vehicle.plate}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleCreateOrder}
                            disabled={!selectedVehicle || loading}
                            className={`px-6 py-2 rounded text-white font-bold transition ${!selectedVehicle || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {loading ? 'Creando...' : 'Crear Orden de Trabajo'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateOrderPage;
