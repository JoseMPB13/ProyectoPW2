import { useEffect, useState } from 'react';
import api from '../api/axios';

const Dashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await api.get('/reports/dashboard');
                setMetrics(response.data);
            } catch (err) {
                console.error(err);
                if (err.response && err.response.status === 403) {
                    setError('No tienes permisos de administrador para ver este dashboard.');
                } else {
                    setError('Error al cargar las métricas.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) return <div className="text-center mt-10">Cargando métricas...</div>;
    
    // Si hay error, mostramos el mensaje pero intentamos mostrar una UI limpia
    if (error) {
         return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                <p className="font-bold">Error de Acceso</p>
                <p>{error}</p>
            </div>
         )
    }

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Resumen del Mes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Card 1: Total Órdenes */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-lg font-semibold text-gray-700">Total Órdenes</h4>
                            <p className="text-3xl font-bold text-gray-900">{metrics?.total_orders_month || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Card 2: Ingresos Estimados */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                     <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-lg font-semibold text-gray-700">Ingresos Estimados</h4>
                            <p className="text-3xl font-bold text-gray-900">${metrics?.estimated_income?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden w-full md:w-1/2">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800">Órdenes por Estado</h4>
                </div>
                <div className="p-4">
                    {metrics?.orders_by_status && Object.keys(metrics.orders_by_status).length > 0 ? (
                        <ul>
                            {Object.entries(metrics.orders_by_status).map(([status, count]) => (
                                <li key={status} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-100">
                                    <span className="capitalize text-gray-700">{status}</span>
                                    <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{count}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">No hay datos disponibles.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
