import { useState, useEffect } from "react";
import { Search, Plus, User, Wrench, Mail, Calendar } from "lucide-react";
import api from "../api/axios";
import Modal from "../components/Modal";

const TechniciansPage = () => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal state for adding new technician
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTech, setNewTech] = useState({ username: '', email: '', password: '' });

    const fetchTechnicians = async () => {
        setLoading(true);
        try {
            const response = await api.get("/auth/users", { params: { role: 'mecanico' } });
            setTechnicians(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching technicians:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTechnicians();
    }, []);

    const handleCreateTechnician = async (e) => {
        e.preventDefault();
        try {
            await api.post("/auth/register", { ...newTech, role: 'mecanico' });
            setIsModalOpen(false);
            setNewTech({ username: '', email: '', password: '' });
            fetchTechnicians(); // Refresh list
        } catch (error) {
            console.error(error);
            alert("Error al registrar técnico");
        }
    };

    // Filter
    const filteredTechnicians = technicians.filter(t => 
        t.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Equipo Técnico</h1>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>Inicio</span>
                        <span className="mx-2">/</span>
                        <span className="text-blue-600 font-medium">Técnicos</span>
                    </div>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus size={18} />
                    Nuevo Técnico
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar técnico..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid of Cards for Technicians (Better visual for people than table) */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Cargando equipo...</div>
            ) : filteredTechnicians.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No hay técnicos registrados.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTechnicians.map((tech) => (
                        <div key={tech.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center hover:shadow-md transition card-hover-effect">
                            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold mb-4">
                                {tech.username.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{tech.username}</h3>
                            <p className="text-sm text-gray-500 mb-4">Mecánico Especialista</p>
                            
                            <div className="w-full space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail size={16} className="text-gray-400" />
                                    <span className="truncate">{tech.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span>Registrado: {new Date(tech.created_at).toLocaleDateString()}</span>
                                </div>
                                 <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Wrench size={16} className="text-gray-400" />
                                    <span className="text-green-600 font-medium">Disponible</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Registro */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registrar Nuevo Técnico"
            >
                <form onSubmit={handleCreateTechnician} className="space-y-4 p-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={newTech.username}
                            onChange={e => setNewTech({...newTech, username: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Corporativo</label>
                        <input 
                            type="email" 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={newTech.email}
                            onChange={e => setNewTech({...newTech, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Inicial</label>
                        <input 
                            type="password" 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={newTech.password}
                            onChange={e => setNewTech({...newTech, password: e.target.value})}
                        />
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md"
                        >
                            Registrar Técnico
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TechniciansPage;
