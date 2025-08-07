import React, { useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

export default function DashboardPage() {
    const { profesores, materias, grupos, horarioGenerado } = useData();
    const navigate = useNavigate();
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // Calcular estadísticas básicas
    const totalProfesores = profesores.length;
    const totalMaterias = materias.length;
    const totalGrupos = grupos.length;

    // Calcular carga de trabajo de profesores
    const calculateTeacherLoad = () => {
        const teacherLoads = new Map();
        profesores.forEach(p => teacherLoads.set(p.nombre, 0));

        if (horarioGenerado && Object.keys(horarioGenerado).length > 0) {
            Object.values(horarioGenerado).forEach(groupSchedule => {
                if (Array.isArray(groupSchedule)) {
                    groupSchedule.forEach(daySchedule => {
                        if (Array.isArray(daySchedule)) {
                            daySchedule.forEach(slot => {
                                if (slot && slot.profesor && teacherLoads.has(slot.profesor)) {
                                    teacherLoads.set(slot.profesor, teacherLoads.get(slot.profesor) + 1);
                                }
                            });
                        }
                    });
                }
            });
        }

        return Array.from(teacherLoads.entries()).sort((a, b) => a[1] - b[1]);
    };

    // Detectar problemas en la configuración
    const getConfigIssues = () => {
        const issues = [];
        
        // Profesores sin disponibilidad
        const profesoresSinDisponibilidad = profesores.filter(p => 
            !p.disponibilidad || Object.keys(p.disponibilidad).length === 0
        );
        if (profesoresSinDisponibilidad.length > 0) {
            issues.push({
                type: 'warning',
                message: `Hay ${profesoresSinDisponibilidad.length} profesores sin disponibilidad configurada.`,
                action: () => navigate('/profesores')
            });
        }

        // Grupos sin materias
        const gruposSinMaterias = grupos.filter(g => !g.materias || g.materias.length === 0);
        if (gruposSinMaterias.length > 0) {
            issues.push({
                type: 'warning',
                message: `Hay ${gruposSinMaterias.length} grupos sin materias asignadas.`,
                action: () => navigate('/grupos')
            });
        }

        // Materias sin profesores que las puedan impartir
        const allMateriasAsignadas = new Set();
        profesores.forEach(p => {
            if (p.materias) {
                p.materias.forEach(materiaId => allMateriasAsignadas.add(materiaId));
            }
        });
        
        const materiasSinProfesor = materias.filter(m => !allMateriasAsignadas.has(m.id));
        if (materiasSinProfesor.length > 0) {
            issues.push({
                type: 'critical',
                message: `Hay ${materiasSinProfesor.length} materias que ningún profesor puede impartir.`,
                action: () => navigate('/materias')
            });
        }

        return issues;
    };

    // Renderizar gráfico de carga de profesores
    useEffect(() => {
        if (chartRef.current && profesores.length > 0) {
            const ctx = chartRef.current.getContext('2d');
            
            // Destruir gráfico anterior si existe
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const teacherLoads = calculateTeacherLoad();
            const labels = teacherLoads.map(([name]) => name);
            const data = teacherLoads.map(([, hours]) => hours);

            chartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Horas Asignadas',
                        data,
                        backgroundColor: 'rgba(140, 40, 50, 0.7)',
                        borderColor: 'rgba(140, 40, 50, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        // Cleanup
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [profesores, horarioGenerado]);

    const issues = getConfigIssues();

    return (
        <div className="space-y-8">
            {/* Header del Dashboard */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-3xl font-bold mb-2 text-primary">Bienvenido al Sistema</h3>
                <p className="mb-6 text-gray-600">
                    Este es el panel de control. Revisa el estado general y los puntos de atención.
                </p>
                
                {/* Estadísticas principales */}
                <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="bg-blue-50 p-6 rounded-lg">
                        <h4 className="text-2xl font-bold text-blue-600">{totalProfesores}</h4>
                        <p className="text-gray-600">Profesores Registrados</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                        <h4 className="text-2xl font-bold text-green-600">{totalMaterias}</h4>
                        <p className="text-gray-600">Materias en el Sistema</p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg">
                        <h4 className="text-2xl font-bold text-purple-600">{totalGrupos}</h4>
                        <p className="text-gray-600">Grupos Configurados</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Carga de trabajo de profesores */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                    <h4 className="text-xl font-bold text-primary mb-4">Carga de Trabajo</h4>
                    <p className="text-gray-600 mb-4">Horas asignadas por profesor</p>
                    <div className="h-64">
                        <canvas ref={chartRef}></canvas>
                    </div>
                </div>

                {/* Puntos de atención */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                    <h4 className="text-xl font-bold text-primary mb-4">Puntos de Atención</h4>
                    <p className="text-gray-600 mb-4">Configuración pendiente</p>
                    <ul className="space-y-3">
                        {issues.length > 0 ? (
                            issues.map((issue, index) => (
                                <li key={index} className="text-sm">
                                    <span className={`font-semibold ${
                                        issue.type === 'critical' ? 'text-red-600' : 'text-amber-600'
                                    }`}>
                                        {issue.type === 'critical' ? 'CRÍTICO:' : 'ALERTA:'}
                                    </span>{' '}
                                    <span>
                                        {issue.message.includes('disponibilidad') ? (
                                            <>
                                                Hay profesores sin{' '}
                                                <button 
                                                    onClick={issue.action}
                                                    className="text-primary hover:underline font-medium"
                                                >
                                                    disponibilidad
                                                </button>{' '}
                                                configurada.
                                            </>
                                        ) : issue.message.includes('materias asignadas') ? (
                                            <>
                                                Hay grupos sin{' '}
                                                <button 
                                                    onClick={issue.action}
                                                    className="text-primary hover:underline font-medium"
                                                >
                                                    materias asignadas
                                                </button>
                                                .
                                            </>
                                        ) : issue.message.includes('ningún profesor') ? (
                                            <>
                                                Hay materias que{' '}
                                                <button 
                                                    onClick={issue.action}
                                                    className="text-primary hover:underline font-medium"
                                                >
                                                    ningún profesor puede impartir
                                                </button>
                                                .
                                            </>
                                        ) : (
                                            issue.message
                                        )}
                                    </span>
                                </li>
                            ))
                        ) : (
                            <li className="text-sm">
                                <span className="font-semibold text-green-600">¡Todo en orden!</span>{' '}
                                La configuración básica está completa.
                            </li>
                        )}
                    </ul>
                </div>

                {/* Estado del horario */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                    <h4 className="text-xl font-bold text-primary mb-4">Estado del Horario</h4>
                    <p className="text-gray-600 mb-4">Progreso de generación</p>
                    {Object.keys(horarioGenerado).length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Grupos con horario:</span>
                                <span className="font-semibold">{Object.keys(horarioGenerado).length}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ 
                                        width: `${Math.min(100, (Object.keys(horarioGenerado).length / Math.max(totalGrupos, 1)) * 100)}%` 
                                    }}
                                ></div>
                            </div>
                            <button
                                onClick={() => navigate('/generar')}
                                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                Ver Horarios
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-gray-500 mb-4">No hay horarios generados</p>
                            <button
                                onClick={() => navigate('/generar')}
                                className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                Generar Horario
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}