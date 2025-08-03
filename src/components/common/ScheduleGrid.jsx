import React, { forwardRef } from 'react';

// Usamos forwardRef para poder pasar la 'ref' desde el componente padre
const ScheduleGrid = forwardRef(({ viewType, selectedItemId, horario, grupos, profesores, config }, ref) => {
    
    if (!selectedItemId) {
        return <div className="text-center py-12 text-gray-500">Selecciona un {viewType} de la lista para ver su horario.</div>;
    }

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const { bloques } = config;

    if (!bloques || !bloques.matutino || !bloques.vespertino) {
        return <div className="text-center py-12 text-red-500">Error: La configuración de bloques no está definida.</div>;
    }

    // LÓGICA PARA MOSTRAR HORARIO POR GRUPO
    if (viewType === 'grupo') {
        const grupo = grupos.find(g => g.id === selectedItemId);
        if (!grupo) return <div className="text-center py-12">Grupo no encontrado.</div>;

        const horarioGrupo = horario?.[selectedItemId];
        const bloquesTurno = bloques[grupo.turno] || [];
        
        return (
            <div ref={ref} className="bg-white p-4">
                <h4 className="text-2xl font-bold mb-4 text-center text-secondary">Horario para {grupo.nombre}</h4>
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-3 border border-gray-300">Hora</th>
                            {dias.map(d => <th key={d} className="py-2 px-3 border border-gray-300">{d}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {bloquesTurno.map((bloque, bIdx) => (
                            <tr key={bIdx}>
                                <td className="py-2 px-3 border border-gray-300 font-medium bg-gray-50">{bloque}</td>
                                {dias.map((_, dIdx) => {
                                    const cellData = horarioGrupo?.[dIdx]?.[bIdx];
                                    return (
                                        <td key={dIdx} className="p-1 border border-gray-300 text-center align-middle">
                                            {cellData ? (
                                                <div className="bg-primary-light p-2 rounded-md h-full flex flex-col justify-center">
                                                    <p className="font-semibold text-primary text-sm">{cellData.materia}</p>
                                                    <p className="text-xs text-gray-600 mt-1">{cellData.profesor}</p>
                                                </div>
                                            ) : <div className="h-16"></div>}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
    
    // LÓGICA PARA MOSTRAR HORARIO POR PROFESOR
    if (viewType === 'profesor') {
        const profesor = profesores.find(p => p.id === selectedItemId);
        if (!profesor) return <div className="text-center py-12">Profesor no encontrado.</div>;
        
        const todosLosBloques = [...bloques.matutino, ...bloques.vespertino];
        const horarioProfesor = Array(todosLosBloques.length).fill(null).map(() => Array(dias.length).fill(null));
        let totalHoras = 0;

        Object.entries(horario || {}).forEach(([grupoId, horarioGrupo]) => {
            const grupo = grupos.find(g => g.id === grupoId);
            if (!grupo) return;
            
            horarioGrupo.forEach((dia, diaIdx) => {
                dia.forEach((slot, bloqueTurnoIdx) => {
                    if (slot?.profesor === profesor.nombre) {
                        const bloqueGlobalIdx = grupo.turno === 'matutino' ? bloqueTurnoIdx : bloques.matutino.length + bloqueTurnoIdx;
                        if(horarioProfesor[bloqueGlobalIdx]) {
                           horarioProfesor[bloqueGlobalIdx][diaIdx] = { ...slot, grupo: grupo.nombre };
                           totalHoras++;
                        }
                    }
                });
            });
        });

        return (
            <div ref={ref} className="bg-white p-4">
                <h4 className="text-2xl font-bold mb-4 text-center text-secondary">Horario para {profesor.nombre} ({totalHoras} horas)</h4>
                <table className="min-w-full border-collapse border border-gray-300">
                     <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-3 border border-gray-300">Hora</th>
                            {dias.map(d => <th key={d} className="py-2 px-3 border border-gray-300">{d}</th>)}
                        </tr>
                    </thead>
                     <tbody>
                        {todosLosBloques.map((bloque, bIdx) => (
                            <tr key={bIdx}>
                                <td className="py-2 px-3 border border-gray-300 font-medium bg-gray-50">{bloque}</td>
                                {dias.map((_, dIdx) => {
                                    const cellData = horarioProfesor[bIdx]?.[dIdx];
                                    return (
                                        <td key={dIdx} className="p-1 border border-gray-300 text-center align-middle">
                                            {cellData ? (
                                                <div className="bg-primary-light p-2 rounded-md h-full flex flex-col justify-center">
                                                    <p className="font-semibold text-primary text-sm">{cellData.materia}</p>
                                                    <p className="text-xs text-gray-600 mt-1">{cellData.grupo}</p>
                                                </div>
                                            ) : <div className="h-16"></div>}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
    
    return null;
});

export default ScheduleGrid;