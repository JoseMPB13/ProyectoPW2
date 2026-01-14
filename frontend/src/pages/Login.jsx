import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('registered') === 'true') {
            setSuccessMsg('¡Registro exitoso! Por favor inicia sesión.');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            await login(email, password);
            navigate('/orders');
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al iniciar sesión. Verifica tus credenciales.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Bienvenido</h2>
                    <p className="text-gray-400">Accede a tu panel de control</p>
                </div>

                {successMsg && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6 text-sm">
                        {successMsg}
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Correo Electrónico</label>
                        <input
                            className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            id="email"
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Contraseña</label>
                        <input
                            className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                        type="submit"
                    >
                        Ingresar
                    </button>
                </form>

                <div className="mt-8 text-center text-gray-400 text-sm">
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline">
                        Regístrate aquí
                    </Link>
                </div>
                <div className="mt-4 text-center">
                    <Link to="/" className="text-gray-500 hover:text-gray-300 text-xs hover:underline">
                        &larr; Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
