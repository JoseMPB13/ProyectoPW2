import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { LayoutDashboard, Users, Wrench, Briefcase, CreditCard, LogOut, CarFront, Tag } from 'lucide-react';

const SidebarItem = ({ to, label, icon }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex items-center py-3 px-6 transition-all duration-200 group relative
                ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
            }
        >
            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-300 rounded-r-md"></div>}
            <span className={`mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{icon}</span>
            <span className="font-medium tracking-wide">{label}</span>
        </Link>
    );
};

SidebarItem.propTypes = {
    to: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.node
};

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-[#0f172a] flex flex-col shadow-2xl z-20">
                <div className="h-20 flex items-center px-6 border-b border-gray-800">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-white tracking-wide">Taller AutoPro</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Sistema de Gestión</span>
                    </div>
                </div>

                <nav className="flex-1 py-8 space-y-1">
                    {/* Updated items based on User Image */}
                    <div className="px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Principal</div>
                    <SidebarItem
                        to="/orders"
                        label="Órdenes de Trabajo"
                        icon={<LayoutDashboard size={20} />}
                    />

                    <div className="px-6 mt-8 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Personal</div>
                    <SidebarItem
                        to="/technicians"
                        label="Técnicos"
                        icon={<Wrench size={20} />}
                    />
                    <SidebarItem
                        to="/workers"
                        label="Trabajadores"
                        icon={<Briefcase size={20} />}
                    />

                    <div className="px-6 mt-8 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Negocio</div>
                    <SidebarItem
                        to="/clients"
                        label="Clientes"
                        icon={<Users size={20} />}
                    />
                    <SidebarItem
                        to="/payments"
                        label="Pagos"
                        icon={<CreditCard size={20} />}
                    />
                    <SidebarItem
                        to="/services"
                        label="Servicios"
                        icon={<Tag size={20} />}
                    />
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-gray-800 bg-[#0f172a]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-blue-500/30">
                            {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.username || 'Admin'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@taller.com'}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                {/* Header can be inside specific pages or global. Image shows content header, not global header. */}
                {/* We keep a minimal global container */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
