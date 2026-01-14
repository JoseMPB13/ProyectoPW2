import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, FileText, Calendar, ChevronRight, Car, User } from 'lucide-react';
import api from '../api/axios';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination & Filter
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = { 
                page, 
                per_page: 8, 
                search: searchTerm,
                status: statusFilter !== 'Todos' ? statusFilter : undefined
            };
            const response = await api.get('/orders', { params });
            
            setOrders(response.data.items || []);
            setTotalPages(response.data.pages || 1);
            setTotalItems(response.data.total || 0);
            
            setLoading(false);
        } catch (err) {
            console.error("Error fetching orders", err);
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const params = { 
                per_page: 1000, 
                search: searchTerm,
                status: statusFilter !== 'Todos' ? statusFilter : undefined
            };
            const response = await api.get('/orders', { params });
            const dataToExport = response.data.items || [];

            const headers = ['ID', 'Cliente', 'Vehículo', 'Patente', 'Estado', 'Fecha Base', 'Total', 'Técnico'];
            const csvContent = [
                headers.join(','),
                ...dataToExport.map(o => [
                    o.id,
                    `"${o.client_name || ''}"`,
                    `"${o.vehicle_brand} ${o.vehicle_model}"`,
                    o.vehicle_plate,
                    o.status,
                    o.created_at ? new Date(o.created_at).toLocaleDateString() : '',
                    o.total || 0,
                    `"${o.technician_name || ''}"`
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'ordenes_trabajo.csv';
            link.click();
        } catch (err) {
            console.error("Error exportando:", err);
            alert("Error al exportar datos");
        }
    };

    useEffect(() => {
        fetchOrders();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, statusFilter]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchOrders();
        }, 500);
        return () => clearTimeout(timer);
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const getStatusBadge = (status) => {
        const styles = {
             'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
             'en_progreso': 'bg-blue-100 text-blue-800 border-blue-200',
             'finalizado': 'bg-green-100 text-green-800 border-green-200',
             'entregado': 'bg-gray-100 text-gray-800 border-gray-200',
             'cancelado': 'bg-red-100 text-red-800 border-red-200'
        };
        const labels = {
            'pendiente': 'En Taller',
            'en_progreso': 'En Reparación',
            'finalizado': 'Listo',
            'entregado': 'Entregado',
            'cancelado': 'Cancelado'
        };

        return (
            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800'} uppercase shadow-sm`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Órdenes de Trabajo</h1>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>Inicio</span>
                        <span className="mx-2">/</span>
                        <span className="text-blue-600 font-medium">Órdenes</span>
                    </div>
                </div>
                <Link
                    to="/orders/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    Nueva Orden
                </Link>
            </div>

            {/* Toolbar */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, placa o ID..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <select 
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        value={statusFilter}
                        onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
                    >
                        <option value="Todos">Todos los Estados</option>
                        <option value="pendiente">En Taller</option>
                        <option value="en_progreso">En Reparación</option>
                        <option value="finalizado">Listo</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>

                     <button 
                        onClick={() => { setSearchTerm(''); setStatusFilter('Todos'); setPage(1); }}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 bg-white"
                        title="Limpiar Filtros"
                     >
                        <Filter size={16} /> <span className="hidden sm:inline">Limpiar</span>
                    </button>

                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 bg-white"
                        title="Exportar a CSV"
                    >
                        <FileText size={16} /> <span className="hidden sm:inline">Exportar</span>
                    </button>
                </div>
            </div>

            {/* Orders List / Table */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                <th className="px-6 py-4">Orden</th>
                                <th className="px-6 py-4">Vehículo</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                 <tr><td colSpan="7" className="p-8 text-center text-gray-500">Cargando órdenes...</td></tr>
                            ) : orders.length === 0 ? (
                                 <tr>
                                     <td colSpan="7" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <FileText size={48} className="mb-2 opacity-50" />
                                            <p className="text-gray-500 font-medium">No se encontraron órdenes.</p>
                                        </div>
                                     </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">#{order.id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                    <Car size={18} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{order.vehicle_brand} {order.vehicle_model}</div>
                                                    <div className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5">{order.vehicle_plate}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <User size={14} className="mr-1.5 text-gray-400" />
                                                {order.client_name || 'Desconocido'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                             <div className="flex items-center text-sm text-gray-500">
                                                <Calendar size={14} className="mr-1.5 text-gray-400" />
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="text-sm font-bold text-gray-900">${(order.total || 0).toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/orders/${order.id}`} className="text-gray-400 hover:text-blue-600 transition-colors">
                                                <ChevronRight size={20} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <span className="text-sm text-gray-500">
                        Mostrando {orders.length} de {totalItems} resultados
                    </span>
                    <div className="flex gap-2">
                         <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded-md border bg-white disabled:opacity-50 hover:bg-gray-50 text-sm text-gray-600 transition-colors"
                        >
                            Anterior
                        </button>
                        <span className="px-2 py-1 text-sm text-gray-600 flex items-center">Página {page} de {totalPages}</span>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="px-3 py-1 rounded-md border bg-white disabled:opacity-50 hover:bg-gray-50 text-sm text-gray-600 transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
