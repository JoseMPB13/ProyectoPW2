import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import RegisterPage from './pages/RegisterPage'; // New Route
import LandingPage from './pages/LandingPage';   // New Route
import ClientsPage from './pages/ClientsPage';
import OrdersPage from './pages/OrdersPage';
import CreateOrderPage from './pages/CreateOrderPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ServicesPage from './pages/ServicesPage';
import PaymentsPage from './pages/PaymentsPage';
import TechniciansPage from './pages/TechniciansPage';
import WorkersPage from './pages/WorkersPage';
import MainLayout from './layouts/MainLayout';
import ChatWidget from './components/ChatWidget'; // Import ChatWidget
// import PropTypes from 'prop-types'; // Unused in this file currently

const PrivateRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Cargando...</div>;
    return user ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <ChatWidget />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected Routes */}
                    <Route element={<PrivateRoute />}>
                        <Route element={<MainLayout />}>


                            <Route path="/clients" element={<ClientsPage />} />
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/orders/new" element={<CreateOrderPage />} />
                            <Route path="/orders/:id" element={<OrderDetailPage />} />
                            <Route path="/services" element={<ServicesPage />} />
                            <Route path="/payments" element={<PaymentsPage />} />
                            <Route path="/technicians" element={<TechniciansPage />} />
                            <Route path="/workers" element={<WorkersPage />} />
                        </Route>
                    </Route>

                    {/* Fallback for unknown routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
