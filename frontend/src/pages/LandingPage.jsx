import { Link } from 'react-router-dom';
import workshopBg from '../assets/workshop_bg.jpg'; // We'll save the generated image here

const LandingPage = () => {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden">
            {/* Background Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${workshopBg})` }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-blue-400 to-indigo-200 bg-clip-text text-transparent drop-shadow-lg">
                    Taller Mecánico Pro
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 mb-10 font-light tracking-wide max-w-2xl mx-auto">
                    Mantenimiento de clase mundial para tu vehículo.
                    Gestión integral, servicio experto y tecnología de punta.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-md mx-auto">
                    <Link
                        to="/login"
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-blue-500/50 flex items-center justify-center"
                    >
                        Iniciar Sesión
                    </Link>
                    <Link
                        to="/register"
                        className="px-8 py-4 bg-transparent border-2 border-white/80 hover:bg-white/10 text-white text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-md flex items-center justify-center"
                    >
                        Registrarse
                    </Link>
                </div>
            </div>

            {/* Footer / Decor elements */}
            <div className="absolute bottom-8 text-gray-400 text-sm font-light">
                &copy; {new Date().getFullYear()} Taller Mecánico Pro. Todos los derechos reservados.
            </div>
        </div>
    );
};

export default LandingPage;
