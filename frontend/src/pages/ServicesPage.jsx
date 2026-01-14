import { useState, useEffect } from "react";
import { Search, Plus, Filter, Edit2, Trash2, Tag, DollarSign, FileText } from 'lucide-react';
import api from "../api/axios";
import Modal from "../components/Modal";
import ServiceForm from "../components/ServiceForm";

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await api.get("/services");
            setServices(response.data);
        } catch (error) {
            console.error("Error fetching services", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleCreate = async (formData) => {
        try {
            await api.post('/services', formData);
            setIsModalOpen(false);
            fetchServices();
        } catch (error) {
            console.error("Error creating service", error);
            alert("Error al crear servicio");
        }
    };

    const handleUpdate = async (formData) => {
        if (!currentService) return;
        try {
            await api.put(`/services/${currentService.id}`, formData);
            setIsModalOpen(false);
            fetchServices();
        } catch (error) {
            console.error("Error updating service", error);
            alert("Error al actualizar servicio");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este servicio?")) return;
        try {
            await api.delete(`/services/${id}`);
            fetchServices();
        } catch (error) {
            console.error("Error deleting service", error);
            alert("Error al eliminar servicio");
        }
    };

    const openCreateModal = () => {
        setCurrentService(null);
        setIsModalOpen(true);
    };

    const openEditModal = (service) => {
        setCurrentService(service);
        setIsModalOpen(true);
    };

    // Filter services locally since backend might not support search yet or dataset is small
    const filteredServices = services.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Catálogo de Servicios</h1>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>Inicio</span>
                        <span className="mx-2">/</span>
                        <span className="text-blue-600 font-medium">Servicios</span>
                    </div>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    Nuevo Servicio
                </button>
            </div>

            {/* Toolbar */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar servicio..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-500 font-medium">
                    Total: {filteredServices.length} servicios
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Descripción
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Precio Base
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Cargando servicios...</td></tr>
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Tag size={48} className="mb-2 opacity-50" />
                                            <p className="text-gray-500 font-medium">No se encontraron servicios.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map((service) => (
                                    <tr key={service.id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-3">
                                                    <Tag size={16} />
                                                </div>
                                                <div className="text-sm font-bold text-gray-900">{service.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 max-w-md truncate" title={service.description}>
                                                {service.description || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded w-fit">
                                                <DollarSign size={14} className="mr-1" />
                                                {service.base_price.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openEditModal(service)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(service.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentService ? "Editar Servicio" : "Nuevo Servicio"}
            >
                <ServiceForm 
                    service={currentService}
                    onSubmit={currentService ? handleUpdate : handleCreate}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default ServicesPage;
