import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Calendar, ArrowUpRight, ArrowDownRight, Printer, Download, Search, Filter } from 'lucide-react';
import api from '../api/axios';

const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [revenue, setRevenue] = useState({ total_revenue: 0, by_method: {} });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            // Fetch History
            const historyRes = await api.get('/payments/history', { params: { page, per_page: 8 } });
            setPayments(historyRes.data.items);
            setTotalPages(historyRes.data.pages);
            setTotalItems(historyRes.data.total);

            // Fetch Stats
            const revenueRes = await api.get('/payments/revenue');
            setRevenue(revenueRes.data);
            
            setLoading(false);
        } catch (error) {
            console.error("Error fetching payments data", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Finanzas y Pagos</h1>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span>Inicio</span>
                    <span className="mx-2">/</span>
                    <span className="text-blue-600 font-medium">Pagos</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Ingresos Totales</p>
                            <h3 className="text-3xl font-bold mt-2">${revenue.total_revenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <DollarSign className="text-white" size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-green-100 bg-white/10 w-fit px-2 py-1 rounded">
                        <ArrowUpRight size={14} className="mr-1" />
                        <span>Actualizado hoy</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Efectivo</p>
                            <h3 className="text-2xl font-bold mt-2 text-gray-800">${(revenue.by_method.efectivo || 0).toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 mt-4 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: `${(revenue.by_method.efectivo / revenue.total_revenue) * 100 || 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Tarjeta / Transferencia</p>
                            <h3 className="text-2xl font-bold mt-2 text-gray-800">${((revenue.by_method.tarjeta || 0) + (revenue.by_method.transferencia || 0)).toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <CreditCard size={24} />
                        </div>
                    </div>
                     <div className="w-full bg-gray-100 h-1.5 mt-4 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(((revenue.by_method.tarjeta || 0) + (revenue.by_method.transferencia || 0)) / revenue.total_revenue) * 100 || 0}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-800">Historial de Transacciones</h2>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                            <Filter size={16} /> Filtrar
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                            <Download size={16} /> Exportar
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">ID Pago</th>
                                <th className="px-6 py-4">Orden #</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Método</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Monto</th>
                                <th className="px-6 py-4 text-center">Recibo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Cargando transacciones...</td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No hay pagos registrados.</td></tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">#{payment.id}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-blue-600">#{payment.work_order_id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(payment.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm capitalize text-gray-700">
                                            {payment.payment_method === 'efectivo' && <span className="flex items-center gap-1"><DollarSign size={14} className="text-green-500"/> Efectivo</span>}
                                            {payment.payment_method === 'tarjeta' && <span className="flex items-center gap-1"><CreditCard size={14} className="text-blue-500"/> Tarjeta</span>}
                                            {payment.payment_method === 'transferencia' && <span className="flex items-center gap-1"><ArrowDownRight size={14} className="text-purple-500"/> Transferencia</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                payment.status === 'pagado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            ${payment.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                <Printer size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                 {/* Pagination - Simplified reused from Clients */}
                 <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Página {page} de {totalPages || 1}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 text-sm"
                        >
                            Anterior
                        </button>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 text-sm"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentsPage;
