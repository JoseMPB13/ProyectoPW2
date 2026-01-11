import { useAuth } from '../context/AuthContext';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import AIChatbot from '../components/AIChatbot';

const SidebarItem = ({ to, label, icon }) => (
    <Link to={to} className="flex items-center py-3 px-6 text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-colors duration-200">
        {icon && <span className="mr-3">{icon}</span>}
        <span className="font-medium">{label}</span>
    </Link>
);

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
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-sidebar-bg flex flex-col shadow-xl z-10">
                <div className="h-20 flex items-center justify-center border-b border-gray-700">
                    <div className="flex items-center gap-2 text-white">
                         {/* Logo Icon Placeholder */}
                        <div className="bg-brand-600 p-1.5 rounded-lg">
                             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight">TALLER PRO</span>
                    </div>
                </div>
                
                <nav className="flex-1 py-6 space-y-1">
                    <SidebarItem 
                        to="/" 
                        label="Dashboard" 
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                    />
                    <SidebarItem 
                        to="/clients" 
                        label="Clientes" 
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    />
                    <SidebarItem 
                        to="/orders" 
                        label="Órdenes" 
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                    />
                     <SidebarItem 
                        to="/services" 
                        label="Servicios" 
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    />
                     <SidebarItem 
                        to="/payments" 
                        label="Pagos y Facturas" 
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                </nav>
                <div className="p-4 bg-gray-900 border-t border-gray-800">
                     <p className="text-xs text-gray-500 text-center">&copy; 2026 Taller Pro</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex justify-between items-center h-20 px-8 bg-white border-b border-gray-200 shadow-sm z-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
                        <p className="text-sm text-gray-500">Bienvenido de nuevo, {user?.username}</p>
                    </div>
                    <div className="flex items-center space-x-6">
                         {/* Notification Bell Placeholder */}
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                        
                        <div className="h-8 w-px bg-gray-200"></div>

                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold border-2 border-brand-200">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
                    <Outlet />
                </main>
            </div>
            <AIChatbot />
        </div>
    );
};

export default MainLayout;
