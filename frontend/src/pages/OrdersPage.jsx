import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // I am assuming this endpoint exists based on standard CRUD practices.
                // If it creates a 404, I will advise the user to implement it in the backend.
                const response = await api.get('/orders');
                setOrders(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching orders", err);
                // Fallback or nice error
                if (err.response && err.response.status === 404) {
                    setError("El endpoint GET /orders no está implementado en el backend. Lista no disponible.");
                } else {
                    setError("No se pudieron cargar las órdenes.");
                }
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusBadge = (status) => {
        const styles = {
             'pendiente': 'bg-yellow-100 text-yellow-800',
             'en_progreso': 'bg-blue-100 text-blue-800',
             'finalizado': 'bg-green-100 text-green-800',
             'cancelado': 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'} uppercase`}>
                {status}
            </span>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Órdenes de Trabajo</h2>
                <Link
                    to="/orders/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition duration-150"
                >
                    + Nueva Orden
                </Link>
            </div>

            {error && (
                <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-4" role="alert">
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehículo</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr><td colSpan="6" className="p-4 text-center">Cargando...</td></tr>
                        ) : orders.length === 0 && !error ? (
                             <tr><td colSpan="6" className="p-4 text-center text-gray-500">No hay órdenes registradas.</td></tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-bold">#{order.id}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {/* Assuming helper returns vehicle_id in standard list, might need basic join or just ID if not populated */}
                                        {/* Since backend snippets didn't show the List serializer, I'll be safe */}
                                        {order.vehicle_plate || `Vehículo ${order.vehicle_id}`}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">${order.total_price.toFixed(2)}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {getStatusBadge(order.status)}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <Link to={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                                            Ver Detalle
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdersPage;
