import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [services, setServices] = useState([]);
    
    // Form state
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [addingItem, setAddingItem] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchOrder = useCallback(async () => {
        try {
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching order", error);
            setLoading(false);
        }
    }, [id]);

    const fetchServices = async () => {
        try {
            const response = await api.get('/services');
            setServices(response.data);
        } catch (error) {
            console.error("Error fetching services", error);
        }
    };

    useEffect(() => {
        fetchOrder();
        fetchServices();
    }, [fetchOrder]);

    const handleAddService = async () => {
        if (!selectedServiceId) return;
        setAddingItem(true);
        try {
            await api.post(`/orders/${id}/items`, {
                service_id: selectedServiceId
            });
            // Refresh order to see new item and total
            fetchOrder();
            setSelectedServiceId('');
        } catch (error) {
            console.error("Error adding service", error);
            alert("Error al agregar servicio");
        } finally {
            setAddingItem(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await api.put(`/orders/${id}/status`, { status: newStatus });
            setOrder(prev => ({ ...prev, status: newStatus }));
        } catch (error) {
            console.error("Error updating status", error);
            alert("Error al actualizar estado");
        }
    };

    if (loading) return <div>Cargando orden...</div>;
    if (!order) return <div>Orden no encontrada</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'pendiente': return 'bg-yellow-100 text-yellow-800';
            case 'en_progreso': return 'bg-blue-100 text-blue-800';
            case 'finalizado': return 'bg-green-100 text-green-800';
            case 'cancelado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Orden #{order.id}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Creado el {new Date(order.created_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(order.status)} uppercase`}>
                        {order.status}
                    </span>
                    
                    {/* Status Actions */}
                    <div className="ml-4 space-x-2">
                        {order.status === 'pendiente' && (
                            <button 
                                onClick={() => handleStatusChange('en_progreso')}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded"
                            >
                                Iniciar Trabajo
                            </button>
                        )}
                        {order.status === 'en_progreso' && (
                            <button 
                                onClick={() => handleStatusChange('finalizado')}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded"
                            >
                                Finalizar Orden
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Info Column */}
                <div className="md:col-span-1 space-y-6">
                    {/* Vehicle Info */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-3 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Vehículo</h3>
                        </div>
                        <div className="px-4 py-4 sm:p-6">
                            {order.vehicle_info ? (
                                <div className="space-y-2">
                                    <p><span className="font-semibold">Placa:</span> {order.vehicle_info.plate}</p>
                                    <p><span className="font-semibold">Marca:</span> {order.vehicle_info.brand}</p>
                                    <p><span className="font-semibold">Modelo:</span> {order.vehicle_info.model}</p>
                                    <p><span className="font-semibold">Año:</span> {order.vehicle_info.year}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500">Información del vehículo no disponible.</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Client Info */}
                     <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-3 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Cliente</h3>
                        </div>
                        <div className="px-4 py-4 sm:p-6">
                             {order.client_info ? (
                                <div className="space-y-2">
                                    <p><span className="font-semibold">Nombre:</span> {order.client_info.first_name} {order.client_info.last_name}</p>
                                    <p><span className="font-semibold">Email:</span> {order.client_info.email}</p>
                                    <p><span className="font-semibold">Tel:</span> {order.client_info.phone}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500">Información del cliente no disponible.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items/Services Column */}
                <div className="md:col-span-2">
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Servicios Realizados</h3>
                            <span className="text-2xl font-bold text-gray-800">${order.total_price.toFixed(2)}</span>
                        </div>
                        
                         {/* Add Service Form */}
                        {order.status !== 'finalizado' && order.status !== 'cancelado' && (
                            <div className="p-4 bg-gray-50 border-b border-gray-200 flex gap-2">
                                <select 
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    value={selectedServiceId}
                                    onChange={(e) => setSelectedServiceId(e.target.value)}
                                >
                                    <option value="">Seleccionar servicio...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} - ${s.base_price}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAddService}
                                    disabled={!selectedServiceId || addingItem}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    Agregar
                                </button>
                            </div>
                        )}

                        {/* List Items */}
                        <ul className="divide-y divide-gray-200">
                            {order.items && order.items.length > 0 ? (
                                order.items.map(item => (
                                    <li key={item.id} className="px-4 py-4 sm:px-6 flex justify-between items-center bg-white hover:bg-gray-50">
                                        <div>
                                            <p className="text-sm font-medium text-blue-600 truncate">{item.service_name}</p>
                                            <p className="mt-1 flex items-center text-sm text-gray-500">
                                                Costo al momento
                                            </p>
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            ${item.price_at_moment.toFixed(2)}
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-8 text-center text-gray-500">
                                    No se han agregado servicios a esta orden.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="mt-6">
                <Link to="/orders" className="text-blue-600 hover:text-blue-900 font-medium">
                    &larr; Volver a la Lista de Órdenes
                </Link>
            </div>
        </div>
    );
};

export default OrderDetailPage;
