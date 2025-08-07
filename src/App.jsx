import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CarrerasPage from './pages/CarrerasPage';
import ProfesoresPage from './pages/ProfesoresPage';
import MateriasPage from './pages/MateriasPage';
import GruposPage from './pages/GruposPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import GeneradorPage from './pages/GeneradorPage';

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/login" />;
};

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="carreras" element={<CarrerasPage />} />
                <Route path="profesores" element={<ProfesoresPage />} />
                <Route path="materias" element={<MateriasPage />} />
                <Route path="grupos" element={<GruposPage />} />
                <Route path="configuracion" element={<ConfiguracionPage />} />
                <Route path="generar" element={<GeneradorPage />} />
            </Route>
        </Routes>
    );
}