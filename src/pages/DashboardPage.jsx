import React, { useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import Chart from 'chart.js/auto';

export default function DashboardPage() {
    const { profesores, materias, grupos, horarioGenerado } = useData();
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy(); // Destruir la instancia anterior
            }
            
            const teacherLoads = new Map(profesores.map(p => [p.nombre, 0]));

            Object.values(horarioGenerado).flat(2).forEach(slot => {
                if (slot && teacherLoads.has(slot.profesor)) {
                    teacherLoads.set(slot.profesor, teacherLoads.get(slot.profesor) + 1);
                }
            });

            const sortedTeachers = [...teacherLoads.entries()].sort((a, b) => a[1] - b[1]);
            
            const ctx = chartRef.current.getContext('2d');
            chartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sortedTeachers.map(entry => entry[0]),
                    datasets: [{
                        label: 'Horas Asignadas',
                        data: sortedTeachers.map(entry => entry[1]),
                        backgroundColor: 'rgba(140, 40, 50, 0.7)',
                    }]
                },
                options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
            });
        }
        // Limpieza al desmontar
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [horarioGenerado, profesores]); // Se redibuja si cambia el horario o los profesores

    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-primary-light p-6 rounded-lg"><h4 className="font-bold text-lg text-primary">Profesores</h4><p className="text-4xl font-bold text-primary">{profesores.length}</p></div>
                <div className="bg-primary-light p-6 rounded-lg"><h4 className="font-bold text-lg text-primary">Materias</h4><p className="text-4xl font-bold text-primary">{materias.length}</p></div>
                <div className="bg-primary-light p-6 rounded-lg"><h4 className="font-bold text-lg text-primary">Grupos</h4><p className="text-4xl font-bold text-primary">{grupos.length}</p></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                 <h4 className="text-xl font-bold text-secondary mb-4">Carga Horaria General</h4>
                 <div className="h-96">
                    <canvas ref={chartRef}></canvas>
                 </div>
            </div>
        </div>
    );
}