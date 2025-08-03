import React from 'react';
import { useData } from '../../context/DataContext';

export default function Header() {
    const { ciclos, cicloActivoId, setCicloActivoId, loading } = useData();

    if (loading) {
        return <div className="p-4 bg-white border-b">Cargando...</div>;
    }

    return (
        <header className="p-4 bg-white border-b border-gray-200 flex items-center gap-4 sticky top-0 z-10">
            <label htmlFor="ciclo-activo-selector" className="text-sm font-medium text-gray-700">Ciclo Activo:</label>
            <select
                id="ciclo-activo-selector"
                value={cicloActivoId || ''}
                onChange={(e) => setCicloActivoId(e.target.value)}
                className="w-72 block pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"
            >
                {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
        </header>
    );
}