import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Car, Check, Search, ChevronRight, ChevronLeft, Calendar, FileText, Plus, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ClientForm from '../components/ClientForm';
import VehicleForm from '../components/VehicleForm';

const CreateOrderPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // Data
    const [clients, setClients] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    
    // Selection
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    
    // UI States
    const [loading, setLoading] = useState(false);
    const [loadingClients, setLoadingClients] = useState(false);
    const [clientSearch, setClientSearch] = useState('');

    // Modal States
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

    // Fetch Clients
    const fetchClients = async () => {
        setLoadingClients(true);
        try {
            const params = { per_page: 20, search: clientSearch };
            const response = await api.get('/clients', { params });
            setClients(response.data.items || []);
        } catch (error) {
            console.error("Error loading clients", error);
            setClients([]);
        } finally {
            setLoadingClients(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchClients();
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientSearch]);

    // Fetch Vehicles when Client is selected
    const fetchVehicles = async (clientId) => {
        setLoading(true);
        try {
            const response = await api.get(`/clients/${clientId}/vehicles`);
            setVehicles(response.data);
        } catch (error) {
            console.error("Error loading vehicles", error);
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedClient) {
            fetchVehicles(selectedClient.id);
        } else {
            setVehicles([]);
        }
    }, [selectedClient]);

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setStep(2);
        setSelectedVehicle(null);
    };

    const handleCreateClient = async (clientData) => {
        try {
            const response = await api.post('/clients', clientData);
            const newClient = response.data.client;
            setIsClientModalOpen(false);
            await fetchClients(); 
            handleClientSelect(newClient);
        } catch (error) {
            console.error("Error creating client", error);
            alert('Error al crear cliente');
        }
    };

    const handleCreateVehicle = async (vehicleData) => {
        if (!selectedClient) return;
        try {
            await api.post(`/clients/${selectedClient.id}/vehicles`, vehicleData);
            setIsVehicleModalOpen(false);
            await fetchVehicles(selectedClient.id);
        } catch (error) {
            console.error("Error creating vehicle", error);
            alert('Error al agregar vehículo');
        }
    };

    const handleGoToConfirmation = () => {
        if (selectedVehicle) {
            setStep(3);
        }
    };

    const handleCreateOrder = async () => {
        if (!selectedVehicle) return;
        setLoading(true);
        try {
            const response = await api.post('/orders', {
                vehicle_id: selectedVehicle.id
            });
            const newOrder = response.data.order;
            navigate(`/orders/${newOrder.id}`);
        } catch (error) {
            console.error("Error creating order", error);
            alert("Error al crear la orden de trabajo");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Nueva Orden de Trabajo</h1>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span>Inicio</span>
                    <span className="mx-2">/</span>
                    <span className="text-blue-600 font-medium">Crear Orden</span>
                </div>
            </div>

            {/* Steps Indicator */}
            <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>1</div>
                    <span>Seleccionar Cliente</span>
                </div>
                <div className="flex-1 mx-4 h-px bg-gray-200 my-auto"></div>
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>2</div>
                    <span>Seleccionar Vehículo</span>
                </div>
                <div className="flex-1 mx-4 h-px bg-gray-200 my-auto"></div>
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${step >= 3 ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>3</div>
                    <span>Confirmación</span>
                </div>
            </div>

            {/* Step 1: Select Client */}
            {step === 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="w-full">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Paso 1: Identificar Cliente</h2>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, apellido o email..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <button
                                    onClick={() => setIsClientModalOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all whitespace-nowrap"
                                >
                                    <Plus size={20} />
                                    Nuevo Cliente
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="max-h-[500px] overflow-y-auto">
                        {loadingClients ? (
                            <div className="p-8 text-center text-gray-500">Buscando clientes...</div>
                        ) : clients.length === 0 ? (
                            <div className="p-12 text-center">
                                <User className="mx-auto text-gray-300 mb-3" size={48} />
                                <p className="text-gray-500 font-medium">No se encontraron clientes.</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Busca con otros términos o crea un nuevo cliente.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {clients.map(client => (
                                    <button 
                                        key={client.id}
                                        onClick={() => handleClientSelect(client)}
                                        className="w-full text-left p-4 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                {client.first_name[0]}{client.last_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 group-hover:text-blue-700">
                                                    {client.first_name} {client.last_name}
                                                </p>
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <span>{client.email}</span>
                                                    <span>•</span>
                                                    <span>{client.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-gray-300 group-hover:text-blue-500" size={20} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 2: Select Vehicle */}
            {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xs uppercase text-gray-400 font-bold mb-4">Cliente Seleccionado</h3>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold mb-4">
                                    {selectedClient.first_name[0]}{selectedClient.last_name[0]}
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">{selectedClient.first_name} {selectedClient.last_name}</h4>
                                <p className="text-gray-500 text-sm mt-1">{selectedClient.email}</p>
                                <p className="text-gray-500 text-sm">{selectedClient.phone}</p>
                                
                                <button 
                                    onClick={() => setStep(1)}
                                    className="mt-6 flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 hover:underline"
                                >
                                    <ChevronLeft size={16} /> Cambiar Cliente
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-800">Paso 2: Seleccionar Vehículo</h2>
                                <button
                                    onClick={() => setIsVehicleModalOpen(true)}
                                    className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 flex items-center gap-1 border border-blue-200"
                                >
                                    <Plus size={16} /> Nuevo Vehículo
                                </button>
                            </div>
                            
                            {loading ? (
                                <div className="text-center py-8 text-gray-500 flex-1">Cargando vehículos...</div>
                            ) : vehicles.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl flex-1 flex flex-col justify-center items-center">
                                    <Car className="mx-auto text-gray-300 mb-3" size={48} />
                                    <p className="text-gray-500">Este cliente no tiene vehículos.</p>
                                    <button 
                                        onClick={() => setIsVehicleModalOpen(true)}
                                        className="text-sm text-blue-600 font-bold mt-2 hover:underline"
                                    >
                                        Agregar el primer vehículo
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[500px]">
                                    {vehicles.map(vehicle => (
                                        <div 
                                            key={vehicle.id}
                                            onClick={() => setSelectedVehicle(vehicle)}
                                            className={`
                                                relative p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4
                                                ${selectedVehicle?.id === vehicle.id 
                                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                                    : 'border-gray-100 hover:border-blue-200 hover:shadow-md'}
                                            `}
                                        >
                                            <div className={`
                                                w-12 h-12 rounded-lg flex items-center justify-center shrink-0
                                                ${selectedVehicle?.id === vehicle.id ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}
                                            `}>
                                                <Car size={24} />
                                            </div>
                                            
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{vehicle.brand} {vehicle.model}</h4>
                                                <p className="text-sm text-gray-500">Año: {vehicle.year}</p>
                                            </div>
                                            
                                            <div className="text-right">
                                                <span className="font-mono text-xs font-medium bg-gray-800 text-white px-2 py-1 rounded">
                                                    {vehicle.plate}
                                                </span>
                                            </div>
                                            
                                            {selectedVehicle?.id === vehicle.id && (
                                                <div className="absolute top-1/2 right-[-10px] transform -translate-y-1/2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm">
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-8 flex justify-end pt-4 border-t border-gray-100">
                                <button
                                    onClick={handleGoToConfirmation}
                                    disabled={!selectedVehicle}
                                    className={`
                                        flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5
                                        ${!selectedVehicle 
                                            ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'}
                                    `}
                                >
                                    Continuar
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-3xl mx-auto">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Confirmar Orden de Trabajo</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Cliente</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                                        {selectedClient.first_name[0]}{selectedClient.last_name[0]}
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">{selectedClient.first_name} {selectedClient.last_name}</p>
                                        <p className="text-gray-600">{selectedClient.email}</p>
                                        <p className="text-gray-600">{selectedClient.phone}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Vehículo</h3>
                                <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                        <Car size={24} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">{selectedVehicle.brand} {selectedVehicle.model}</p>
                                        <p className="text-gray-600">Año: {selectedVehicle.year}</p>
                                        <span className="inline-block mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded font-mono">
                                            {selectedVehicle.plate}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                             <button
                                onClick={() => setStep(2)}
                                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                            >
                                Atrás
                            </button>
                            <button
                                onClick={handleCreateOrder}
                                disabled={loading}
                                className={`
                                    flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold shadow-xl shadow-green-200 transition-all transform hover:-translate-y-1
                                    ${loading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-green-600 hover:bg-green-700'}
                                `}
                            >
                                {loading ? 'Creando Orden...' : 'Confirmar y Crear Orden'}
                                {!loading && <Check size={20} strokeWidth={3} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

             {/* Modal Create Client */}
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

            {/* Modal Create Vehicle */}
            <Modal
                isOpen={isVehicleModalOpen}
                onClose={() => setIsVehicleModalOpen(false)}
                title={`Agregar Vehículo para ${selectedClient?.first_name} ${selectedClient?.last_name}`}
            >
                <VehicleForm 
                    onSubmit={handleCreateVehicle}
                    onCancel={() => setIsVehicleModalOpen(false)}
                />
            </Modal>

        </div>
    );
};

export default CreateOrderPage;
