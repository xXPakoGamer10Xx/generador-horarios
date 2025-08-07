import React from 'react';

export default function ScheduleGrid({ horario, bloquesTiempo, diasSemana }) {
    if (!horario || Object.keys(horario).length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                No hay horario generado para mostrar.
            </div>
        );
    }

    const dias = diasSemana.map(dia => dia.charAt(0).toUpperCase() + dia.slice(1));

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Hora
                        </th>
                        {dias.map(dia => (
                            <th key={dia} className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                                {dia}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {bloquesTiempo.map((bloque) => (
                        <tr key={bloque.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4 text-sm font-medium text-gray-900 border-r border-gray-200 bg-gray-50 min-w-[120px]">
                                <div className="text-sm font-semibold">{bloque.nombre}</div>
                                <div className="text-xs text-gray-500">{bloque.inicio} - {bloque.fin}</div>
                            </td>
                            {diasSemana.map(dia => {
                                const asignacion = horario[dia]?.[bloque.id];
                                return (
                                    <td key={dia} className="py-2 px-2 text-center border-r border-gray-200 last:border-r-0 min-w-[150px]">
                                        {asignacion ? (
                                            <div className="bg-primary/10 border border-primary/20 rounded-md p-3 h-full min-h-[80px] flex flex-col justify-center">
                                                <div className="font-semibold text-primary text-sm mb-1">
                                                    {asignacion.materia}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {asignacion.grupo}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {asignacion.aula}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-20 flex items-center justify-center text-gray-300">
                                                {['Receso', 'Almuerzo'].includes(bloque.nombre) ? (
                                                    <span className="text-orange-500 font-medium">{bloque.nombre}</span>
                                                ) : (
                                                    '—'
                                                )}
                                            </div>
                                        )}
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
