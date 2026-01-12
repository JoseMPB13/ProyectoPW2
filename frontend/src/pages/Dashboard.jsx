import { useState } from 'react';
import { Search, Filter, Download, Plus, Eye, Edit2, Trash2 } from 'lucide-react';

// Mock data based on the image provided
const MOCK_VEHICLES = [
    { id: 1, patente: "ABC-123", marca: "Toyota Corolla 2020", vin: "1HGBH41JXMN109186", cliente: "Juan Pérez", estado: "En reparación", fecha: "08/01/2026", tecnico: "Carlos Ruiz" },
    { id: 2, patente: "XYZ-789", marca: "Honda Civic 2019", vin: "2HGFG12878H543210", cliente: "Maria González", estado: "Listo", fecha: "05/01/2026", tecnico: "Roberto Silva" },
    { id: 3, patente: "DEF-456", marca: "Ford Ranger 2021", vin: "3FADP4EJ9FM123456", cliente: "Pedro Martínez", estado: "En taller", fecha: "10/01/2026", tecnico: "Luis Vargas" },
    { id: 4, patente: "GHI-321", marca: "Chevrolet Cruze 2018", vin: "1G1BE5SM8J7654321", cliente: "Ana López", estado: "En reparación", fecha: "07/01/2026", tecnico: "Carlos Ruiz" },
    { id: 5, patente: "JKL-654", marca: "Nissan Sentra 2022", vin: "3N1AB7AP8KY987654", cliente: "Roberto Sánchez", estado: "Entregado", fecha: "03/01/2026", tecnico: "Roberto Silva" }
];

const StatusBadge = ({ status }) => {
    const styles = {
        'En reparación': 'bg-orange-100 text-orange-700 border-orange-200',
        'Listo': 'bg-green-100 text-green-700 border-green-200',
        'En taller': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Entregado': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    const defaultStyle = 'bg-gray-100 text-gray-600';

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || defaultStyle}`}>
            {status}
        </span>
    );
};

const Dashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Vehículos</h1>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>Inicio</span>
                        <span className="mx-2">/</span>
                        <span className="text-blue-600 font-medium">Autos</span>
                    </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all">
                    <Plus size={18} />
                    Nuevo Vehículo
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 w-full md:max-w-lg">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por patente, marca o modelo..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Todos</option>
                        <option>En reparación</option>
                        <option>Listo</option>
                        <option>Entregado</option>
                    </select>

                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                        <Filter size={16} />
                        Más filtros
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patente</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">VIN</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Ingreso</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Técnico</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {MOCK_VEHICLES.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer">{vehicle.patente}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{vehicle.marca.split(' ').slice(0, 1).join(' ')}</div>
                                        <div className="text-xs text-gray-500">{vehicle.marca.split(' ').slice(1).join(' ')}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                                        {vehicle.vin}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-blue-600 hover:underline cursor-pointer">
                                        {vehicle.cliente}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={vehicle.estado} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {vehicle.fecha}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200">
                                                {vehicle.tecnico.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-sm text-gray-700">{vehicle.tecnico}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Eye size={18} /></button>
                                            <button className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"><Edit2 size={18} /></button>
                                            <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Mostrando 1-5 de 156 registros</span>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50">Anterior</button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">1</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50">2</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50">3</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50">Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
