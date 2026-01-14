import { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Car, User, MapPin, Phone, Mail } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ClientForm from '../components/ClientForm';
import VehicleForm from '../components/VehicleForm';

const ClientsPage = () => {
    // Main Data States
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter & Pagination States
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(8);

    // Modal States
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientVehicles, setClientVehicles] = useState([]);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [isAddVehicleFormOpen, setIsAddVehicleFormOpen] = useState(false);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const params = { page, per_page: limit, search: searchTerm };
            const response = await api.get('/clients', { params });
            setClients(response.data.items);
            setTotalPages(response.data.pages);
            setTotalItems(response.data.total);
            setLoading(false);
        } catch (err) {
            console.error('Error details:', err);
            setError('Error al cargar clientes');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchClients();
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // Handlers
    const handleCreateClient = async (clientData) => {
        try {
            await api.post('/clients', clientData);
            fetchClients();
            setIsClientModalOpen(false);
        } catch (error) {
            alert('Error al crear cliente');
        }
    };

    const handleViewVehicles = async (client) => {
        setSelectedClient(client);
        setClientVehicles([]); // Clear previous
        setIsVehicleModalOpen(true);
        setIsAddVehicleFormOpen(false);
        
        try {
            const response = await api.get(`/clients/${client.id}/vehicles`);
            setClientVehicles(response.data);
        } catch (error) {
            console.error('Error fetching vehicles', error);
        }
    };

    const handleAddVehicle = async (vehicleData) => {
        if (!selectedClient) return;
        try {
            await api.post(`/clients/${selectedClient.id}/vehicles`, vehicleData);
            // Refresh list
            const response = await api.get(`/clients/${selectedClient.id}/vehicles`);
            setClientVehicles(response.data);
            setIsAddVehicleFormOpen(false);
        } catch (error) {
            alert('Error al agregar vehículo');
        }
    };

    // Export Handler
    const handleExport = () => {
        const headers = ['Nombre', 'Apellido', 'Email', 'Teléfono', 'Dirección'];
        const csvContent = [
            headers.join(','),
            ...clients.map(c => [c.first_name, c.last_name, c.email, c.phone, `"${c.address||''}"`].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'clientes.csv';
        link.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>Inicio</span>
                        <span className="mx-2">/</span>
                        <span className="text-blue-600 font-medium">Clientes</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsClientModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus size={18} />
                    Nuevo Cliente
                </button>
            </div>

            {/* Stats/Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 w-full md:max-w-lg">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                        <Filter size={16} />
                        Filtros
                    </button>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700"
                    >
                        <Download size={16} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-4">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Cargando...</td></tr>
                            ) : clients.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No se encontraron clientes.</td></tr>
                            ) : (
                                clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-blue-50/50 transition-colors">
                                       <td className="px-6 py-4">
                                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {client.first_name[0]}{client.last_name[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{client.first_name} {client.last_name}</div>
                                                    <div className="text-xs text-gray-500">ID: #{client.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail size={14} className="text-gray-400" /> {client.email || 'Sin email'}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone size={14} className="text-gray-400" /> {client.phone || 'Sin teléfono'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin size={14} className="text-gray-400" />
                                                <span className="truncate max-w-xs">{client.address || 'Sin dirección'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleViewVehicles(client)}
                                                    className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors"
                                                    title="Ver Vehículos"
                                                >
                                                    <Car size={18} />
                                                </button>
                                                <button className="p-1.5 text-gray-400 hover:text-green-600 transition-colors">
                                                    <Edit2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Mostrando {clients.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, totalItems)} de {totalItems}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                title="Registrar Nuevo Cliente"
            >
                <div className="p-1">
                     <ClientForm
                        onSubmit={handleCreateClient}
                        onCancel={() => setIsClientModalOpen(false)}
                    />
                </div>
            </Modal>

            <Modal
                isOpen={isVehicleModalOpen}
                onClose={() => setIsVehicleModalOpen(false)}
                title={selectedClient ? `Garaje de ${selectedClient.first_name}` : 'Vehículos'}
            >
                {!isAddVehicleFormOpen ? (
                    <div className="p-1">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Vehículos Registrados</h3>
                            <button
                                onClick={() => setIsAddVehicleFormOpen(true)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition"
                            >
                                <Plus size={14} /> Agregar Auto
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {clientVehicles.length > 0 ? clientVehicles.map(v => (
                                <div key={v.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center group hover:border-blue-200 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 text-gray-400">
                                            <Car size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{v.brand} {v.model}</p>
                                            <p className="text-xs text-gray-500 font-mono tracking-wider">{v.plate}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">{v.year}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <Car size={32} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Sin vehículos asociados</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-1">
                        <button 
                            onClick={() => setIsAddVehicleFormOpen(false)}
                            className="mb-4 text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
                        >
                            <ChevronLeft size={12} /> Volver a lista
                        </button>
                        <VehicleForm
                            onSubmit={handleAddVehicle}
                            onCancel={() => setIsAddVehicleFormOpen(false)}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ClientsPage;
