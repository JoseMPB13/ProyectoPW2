import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import OrdersPage from './pages/OrdersPage';
import CreateOrderPage from './pages/CreateOrderPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ServicesPage from './pages/ServicesPage';
import PaymentsPage from './pages/PaymentsPage';
import MainLayout from './layouts/MainLayout';
import PropTypes from 'prop-types';

const PrivateRoute = () => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Cargando...</div>;
    return user ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
        <Router>
        <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Rutas Protegidas */}
            <Route element={<PrivateRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    {/* Placeholder routes for future implementation */}
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/new" element={<CreateOrderPage />} />
                    <Route path="/orders/:id" element={<OrderDetailPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/payments" element={<PaymentsPage />} />
                </Route>
            </Route>
        </Routes>
        </Router>
    </AuthProvider>
  );
}

export default App;
