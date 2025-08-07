import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Menú exacto del HTML original
const menuItems = [
    { to: '/dashboard', text: 'Dashboard' },
    { to: '/carreras', text: 'Carreras' },
    { to: '/profesores', text: 'Profesores' },
    { to: '/materias', text: 'Materias' },
    { to: '/grupos', text: 'Grupos' },
    { to: '/generar', text: 'Generar Horario' },
    { to: '/configuracion', text: 'Configuración' },
];

export default function Sidebar() {
    const { currentUser, userRole, logout } = useAuth();
    const baseStyle = "w-full flex items-center space-x-3 py-3 px-4 rounded-lg text-left font-medium hover:bg-primary-dark transition-colors";
    const activeStyle = `${baseStyle} bg-primary-dark`;

    return (
        <aside className="w-64 bg-primary text-white flex flex-col p-4">
            <div className="text-center py-6 border-b border-white/20">
                <img 
                    src="/logo-uptex-small.svg" 
                    alt="Logo UPTEX" 
                    className="mx-auto w-24 h-24 object-contain"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/96x96/8C2832/FFFFFF?text=UPTEX';
                    }}
                />
                <h1 className="text-lg font-bold mt-2">Generador de Horarios</h1>
                <p className="text-sm text-white/70">UPTEX</p>
            </div>
            <nav className="flex-grow mt-8 space-y-2">
                {menuItems.map(item => (
                    <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? activeStyle : baseStyle}>
                        <span>{item.text}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="mt-auto pt-4 border-t border-white/20">
                <p className="text-sm font-medium truncate">{currentUser?.email}</p>
                <p className="text-xs text-white/70 font-semibold uppercase">{userRole}</p>
                <button onClick={logout} className="w-full text-left mt-4 py-2 px-4 rounded-lg bg-primary-dark/50 hover:bg-primary-dark transition-colors">
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}