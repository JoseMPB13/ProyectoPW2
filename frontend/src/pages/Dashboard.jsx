import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const MetricCard = ({ title, value, color, icon, footer }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-200 border-l-4 ${color}`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-').replace('500', '100')}`}>
                {icon}
            </div>
        </div>
        {footer && (
            <div className="mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500">
                {footer}
            </div>
        )}
    </div>
);

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
                setError(err.response?.status === 403 
                    ? 'No tienes permisos de administrador para ver este dashboard.' 
                    : 'Error al cargar las métricas.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
    );
    
    if (error) {
         return (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-sm" role="alert">
                <p className="font-bold flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Error de Acceso
                </p>
                <p className="mt-2">{error}</p>
            </div>
         )
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">Resumen General</h3>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                        Descargar Reporte
                    </button>
                    <Link to="/orders/new" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 shadow-sm flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Nueva Orden
                    </Link>
                </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Total Órdenes" 
                    value={metrics?.total_orders_month || 0} 
                    color="border-brand-500"
                    icon={<svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    footer="Órdenes registradas este mes"
                />
                 <MetricCard 
                    title="Ingresos Estimados" 
                    value={`$${metrics?.estimated_income?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`}
                    color="border-green-500"
                    icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                     footer={<span className="text-green-600 font-medium">+12% vs mes anterior</span>}
                />
                 <MetricCard 
                    title="Órdenes Pendientes" 
                    value={metrics?.orders_by_status?.pendiente || 0}
                    color="border-yellow-500"
                    icon={<svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    footer="Requieren atención inmediata"
                />
                 <MetricCard 
                    title="Órdenes Finalizadas" 
                    value={metrics?.orders_by_status?.finalizado || 0}
                    color="border-purple-500"
                    icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    footer="Completadas con éxito"
                />
            </div>

            {/* Charts/Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Orders by Status Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h4 className="text-lg font-bold text-gray-800">Estado de Órdenes</h4>
                        <button className="text-brand-600 hover:text-brand-800 text-sm font-medium">Ver todas</button>
                    </div>
                    <div className="p-0">
                         {metrics?.orders_by_status && Object.keys(metrics.orders_by_status).length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-6 py-3 text-left tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-right tracking-wider">Cantidad</th>
                                        <th className="px-6 py-3 text-right tracking-wider">% Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {Object.entries(metrics.orders_by_status).map(([status, count]) => {
                                        const total = Object.values(metrics.orders_by_status).reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                                        const statusColors = {
                                            pendiente: 'text-yellow-600 bg-yellow-50',
                                            en_progreso: 'text-blue-600 bg-blue-50',
                                            finalizado: 'text-green-600 bg-green-50',
                                            cancelado: 'text-red-600 bg-red-50'
                                        };
                                        const colorClass = statusColors[status] || 'text-gray-600 bg-gray-50';

                                        return (
                                            <tr key={status} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${colorClass}`}>
                                                        {status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-700">
                                                    {count}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-xs">{percentage}%</span>
                                                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${colorClass.split(' ')[0].replace('text-', 'bg-')}`} style={{ width: `${percentage}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No hay datos disponibles para mostrar.
                            </div>
                        )}
                    </div>
                </div>

                {/* Simulated Recent Activity or Placeholder */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                     <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h4 className="text-lg font-bold text-gray-800">Actividad Reciente</h4>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            {[1, 2, 3].map((_, idx) => (
                                <div key={idx} className="flex gap-4">
                                     <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Nueva orden registrada</p>
                                        <p className="text-sm text-gray-500">Hace {idx * 15 + 5} minutos por <strong>Admin</strong></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
