import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import AIChatbot from '../components/AIChatbot';

const SidebarItem = ({ to, label }) => (
    <Link to={to} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white">
        {label}
    </Link>
);

SidebarItem.propTypes = {
    to: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
};

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-gray-300 flex flex-col">
                <div className="h-16 flex items-center justify-center bg-gray-900 shadow-md">
                    <h1 className="text-xl font-bold text-white tracking-wider">TALLER APP</h1>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    <SidebarItem to="/" label="Dashboard" />
                    <SidebarItem to="/clients" label="Clientes" />
                    <SidebarItem to="/orders" label="Órdenes de Trabajo" />
                    <SidebarItem to="/services" label="Servicios" />
                </nav>
                <div className="p-4 bg-gray-900 border-t border-gray-700">
                     <p className="text-xs text-gray-500 text-center">&copy; 2026 Taller Mecánico</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex justify-between items-center py-4 px-6 bg-white border-b border-gray-200 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800">Panel de Control</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600 font-medium">Hola, {user?.username}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition duration-150"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
            <AIChatbot />
        </div>
    );
};

export default MainLayout;
