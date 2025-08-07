import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password);
                alert('¡Registro exitoso! Por favor, inicia sesión.');
                setIsLogin(true);
            }
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans text-secondary">
            {/* Lado izquierdo con logo */}
            <div className="hidden lg:flex w-full lg:w-1/2 bg-primary items-center justify-center p-12 text-white text-center shadow-2xl">
                <img
                    src="/logo-uptex.svg"
                    alt="Logo UPTEX"
                    className="mx-auto w-72 h-72 object-contain"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/288x288/8C2832/FFFFFF?text=UPTEX';
                    }}
                />
            </div>

            {/* Lado derecho con formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full space-y-8 animate-slide-in-bottom">
                    <div>
                        <h2 className="text-3xl font-bold text-center mb-2">
                            {isLogin ? 'Bienvenido' : 'Crear una Cuenta'}
                        </h2>
                        <p className="text-center text-gray-500">
                            {isLogin ? 'Inicia sesión para continuar' : 'Ingresa tus datos para registrarte'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="correo@ejemplo.com"
                                required
                                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                                required
                                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            className="w-full py-3 px-4 text-lg font-medium text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-all duration-300 transform hover:scale-105"
                        >
                            {isLogin ? 'Iniciar Sesión' : 'Registrarme'}
                        </button>
                    </form>

                    <p className="text-center text-sm">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-medium text-primary hover:text-primary-dark transition-colors"
                        >
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}