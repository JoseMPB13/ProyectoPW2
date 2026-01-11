import { useState, useEffect } from 'react';
import api from '../api/axios';

const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await api.get('/payments/history');
                setPayments(response.data);
            } catch (error) {
                console.error("Error fetching payments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    if (loading) return <div className="p-4">Cargando pagos...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Historial de Pagos y Facturas</h1>
            
            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID Pago
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Orden #
                            </th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Método
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Monto
                            </th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map((payment) => (
                            <tr key={payment.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {payment.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {payment.work_order_id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                    {payment.payment_method}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                    ${payment.amount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        payment.status === 'pagado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {payment.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(payment.created_at).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {payments.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                        No hay pagos registrados.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentsPage;
