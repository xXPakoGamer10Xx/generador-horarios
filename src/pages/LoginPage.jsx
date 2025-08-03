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
        <div className="flex min-h-screen bg-gray-100">
            <div className="hidden lg:flex w-full lg:w-1/2 bg-primary items-center justify-center p-12 text-white">
                <img src="https://www.uptex.edu.mx/recursos/2021/logo-uptex-white.png" alt="Logo UPTEX" className="mx-auto w-72 h-72 object-contain" />
            </div>
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-center text-secondary">{isLogin ? 'Bienvenido' : 'Crear una Cuenta'}</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-3 border rounded-lg" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required className="w-full px-4 py-3 border rounded-lg" />
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full py-3 px-4 text-white bg-primary rounded-lg">{isLogin ? 'Iniciar Sesión' : 'Registrarme'}</button>
                    </form>
                    <p className="text-center text-sm">
                        <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-primary hover:text-primary-dark">
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}