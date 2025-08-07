import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import ScheduleGrid from '../components/common/ScheduleGrid';
import * as XLSX from 'xlsx';

export default function GeneradorPage() {
    const { profesores, materias, grupos, configuracion } = useData();
    const [horarios, setHorarios] = useState({});
    const [selectedProfesor, setSelectedProfesor] = useState('');
    const [selectedGrupo, setSelectedGrupo] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [viewMode, setViewMode] = useState('profesor'); // 'profesor' o 'grupo'
    
    const bloquesTiempo = configuracion?.bloquesTiempo || [
        { id: 1, inicio: '07:00', fin: '07:50', nombre: 'Bloque 1' },
        { id: 2, inicio: '07:50', fin: '08:40', nombre: 'Bloque 2' },
        { id: 3, inicio: '08:40', fin: '09:30', nombre: 'Bloque 3' },
        { id: 4, inicio: '09:30', fin: '09:50', nombre: 'Receso' },
        { id: 5, inicio: '09:50', fin: '10:40', nombre: 'Bloque 4' },
        { id: 6, inicio: '10:40', fin: '11:30', nombre: 'Bloque 5' },
        { id: 7, inicio: '11:30', fin: '12:20', nombre: 'Bloque 6' },
        { id: 8, inicio: '12:20', fin: '13:10', nombre: 'Bloque 7' },
        { id: 9, inicio: '13:10', fin: '14:00', nombre: 'Almuerzo' },
        { id: 10, inicio: '14:00', fin: '14:50', nombre: 'Bloque 8' },
        { id: 11, inicio: '14:50', fin: '15:40', nombre: 'Bloque 9' },
        { id: 12, inicio: '15:40', fin: '16:30', nombre: 'Bloque 10' },
        { id: 13, inicio: '16:30', fin: '17:20', nombre: 'Bloque 11' },
        { id: 14, inicio: '17:20', fin: '18:10', nombre: 'Bloque 12' }
    ];

    const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

    const generarHorarioAutomatico = () => {
        setIsGenerating(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const horariosGenerados = {};
            
            // Generar horarios para cada profesor
            profesores.forEach(profesor => {
                horariosGenerados[profesor.id] = generarHorarioProfesor(profesor);
            });

            setHorarios(horariosGenerados);
            setSuccessMessage('Horarios generados exitosamente.');
        } catch (error) {
            console.error('Error al generar horarios:', error);
            setErrorMessage('Error al generar los horarios: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const generarHorarioProfesor = (profesor) => {
        const horario = {};
        const disponibilidad = profesor.disponibilidad || {};
        const materiasProfesor = profesor.materias || [];

        // Inicializar horario vacío
        diasSemana.forEach(dia => {
            horario[dia] = {};
            bloquesTiempo.forEach(bloque => {
                horario[dia][bloque.id] = null;
            });
        });

        // Asignar materias considerando disponibilidad
        materiasProfesor.forEach(materiaId => {
            const materia = materias.find(m => m.id === materiaId);
            if (!materia) return;

            const horasNecesarias = materia.horas || 4;
            let horasAsignadas = 0;

            diasSemana.forEach(dia => {
                if (horasAsignadas >= horasNecesarias) return;

                const disponibleDia = disponibilidad[dia] || [];
                const bloquesDisponibles = bloquesTiempo.filter(bloque => 
                    disponibleDia.includes(bloque.id) && 
                    !horario[dia][bloque.id] &&
                    !['Receso', 'Almuerzo'].includes(bloque.nombre)
                );

                // Asignar bloques hasta completar las horas necesarias
                let bloquesParaEseDia = Math.min(
                    bloquesDisponibles.length,
                    horasNecesarias - horasAsignadas,
                    2 // Máximo 2 horas por día por materia
                );

                for (let i = 0; i < bloquesParaEseDia; i++) {
                    if (bloquesDisponibles[i]) {
                        horario[dia][bloquesDisponibles[i].id] = {
                            materia: materia.nombre,
                            materiaId: materia.id,
                            grupo: getGrupoForMateria(materia.id),
                            aula: getAulaAsignada()
                        };
                        horasAsignadas++;
                    }
                }
            });
        });

        return horario;
    };

    const getGrupoForMateria = (materiaId) => {
        const grupo = grupos.find(g => g.materias?.includes(materiaId));
        return grupo?.nombre || 'Sin asignar';
    };

    const getAulaAsignada = () => {
        const aulas = configuracion?.aulas || ['Aula 1', 'Aula 2', 'Aula 3'];
        return aulas[Math.floor(Math.random() * aulas.length)];
    };

    const exportarAExcel = () => {
        try {
            const workbook = XLSX.utils.book_new();

            if (viewMode === 'profesor' && selectedProfesor) {
                // Exportar horario de profesor específico
                const profesor = profesores.find(p => p.id === selectedProfesor);
                if (profesor && horarios[selectedProfesor]) {
                    const data = crearDataParaExcel(horarios[selectedProfesor], profesor.nombre);
                    const worksheet = XLSX.utils.aoa_to_sheet(data);
                    XLSX.utils.book_append_sheet(workbook, worksheet, profesor.nombre.substring(0, 31));
                }
            } else {
                // Exportar todos los horarios
                profesores.forEach(profesor => {
                    if (horarios[profesor.id]) {
                        const data = crearDataParaExcel(horarios[profesor.id], profesor.nombre);
                        const worksheet = XLSX.utils.aoa_to_sheet(data);
                        XLSX.utils.book_append_sheet(workbook, worksheet, profesor.nombre.substring(0, 31));
                    }
                });
            }

            XLSX.writeFile(workbook, 'Horarios_Profesores.xlsx');
            setSuccessMessage('Horarios exportados exitosamente a Excel.');
        } catch (error) {
            console.error('Error al exportar:', error);
            setErrorMessage('Error al exportar los horarios.');
        }
    };

    const crearDataParaExcel = (horario, nombreProfesor) => {
        const data = [];
        
        // Encabezado
        data.push(['HORARIO - ' + nombreProfesor]);
        data.push([]);
        
        // Días de la semana
        const header = ['Hora', ...diasSemana.map(dia => dia.charAt(0).toUpperCase() + dia.slice(1))];
        data.push(header);

        // Filas de bloques
        bloquesTiempo.forEach(bloque => {
            const fila = [`${bloque.inicio} - ${bloque.fin} (${bloque.nombre})`];
            
            diasSemana.forEach(dia => {
                const asignacion = horario[dia]?.[bloque.id];
                if (asignacion) {
                    fila.push(`${asignacion.materia}\n${asignacion.grupo}\n${asignacion.aula}`);
                } else {
                    fila.push('');
                }
            });
            
            data.push(fila);
        });

        return data;
    };

    const limpiarHorarios = () => {
        if (window.confirm('¿Estás seguro de que quieres limpiar todos los horarios generados?')) {
            setHorarios({});
            setSuccessMessage('Horarios limpiados.');
        }
    };

    const obtenerHorarioMostrar = () => {
        if (viewMode === 'profesor' && selectedProfesor) {
            return horarios[selectedProfesor] || {};
        } else if (viewMode === 'grupo' && selectedGrupo) {
            return generarHorarioGrupo(selectedGrupo);
        }
        return {};
    };

    const generarHorarioGrupo = (grupoId) => {
        const grupo = grupos.find(g => g.id === grupoId);
        if (!grupo) return {};

        const horarioGrupo = {};
        diasSemana.forEach(dia => {
            horarioGrupo[dia] = {};
            bloquesTiempo.forEach(bloque => {
                horarioGrupo[dia][bloque.id] = null;
            });
        });

        // Buscar asignaciones en todos los horarios de profesores
        Object.values(horarios).forEach(horarioProfesor => {
            diasSemana.forEach(dia => {
                bloquesTiempo.forEach(bloque => {
                    const asignacion = horarioProfesor[dia]?.[bloque.id];
                    if (asignacion && asignacion.grupo === grupo.nombre) {
                        horarioGrupo[dia][bloque.id] = asignacion;
                    }
                });
            });
        });

        return horarioGrupo;
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div>
                    <h3 className="text-3xl font-bold text-primary">Generador de Horarios</h3>
                    <p className="text-gray-600">Genera y visualiza horarios automáticamente</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={generarHorarioAutomatico}
                        disabled={isGenerating}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                        {isGenerating ? 'Generando...' : 'Generar Horarios'}
                    </button>
                    
                    <button
                        onClick={exportarAExcel}
                        disabled={Object.keys(horarios).length === 0}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        Exportar a Excel
                    </button>
                    
                    <button
                        onClick={limpiarHorarios}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                        Limpiar Horarios
                    </button>
                </div>
            </div>

            {/* Mensajes */}
            {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {errorMessage}
                </div>
            )}
            
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                    {successMessage}
                </div>
            )}

            {/* Controles de vista */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Modo de Vista
                    </label>
                    <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                        <option value="profesor">Por Profesor</option>
                        <option value="grupo">Por Grupo</option>
                    </select>
                </div>

                {viewMode === 'profesor' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Profesor
                        </label>
                        <select
                            value={selectedProfesor}
                            onChange={(e) => setSelectedProfesor(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        >
                            <option value="">-- Seleccionar profesor --</option>
                            {profesores.map(profesor => (
                                <option key={profesor.id} value={profesor.id}>
                                    {profesor.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {viewMode === 'grupo' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Grupo
                        </label>
                        <select
                            value={selectedGrupo}
                            onChange={(e) => setSelectedGrupo(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        >
                            <option value="">-- Seleccionar grupo --</option>
                            {grupos.map(grupo => (
                                <option key={grupo.id} value={grupo.id}>
                                    {grupo.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{profesores.length}</div>
                    <div className="text-sm text-blue-600">Profesores</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{materias.length}</div>
                    <div className="text-sm text-green-600">Materias</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{grupos.length}</div>
                    <div className="text-sm text-purple-600">Grupos</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{Object.keys(horarios).length}</div>
                    <div className="text-sm text-orange-600">Horarios Generados</div>
                </div>
            </div>

            {/* Visualización del horario */}
            {(selectedProfesor || selectedGrupo) && (
                <div className="mt-8">
                    <h4 className="text-xl font-bold text-gray-800 mb-4">
                        {viewMode === 'profesor' 
                            ? `Horario de ${profesores.find(p => p.id === selectedProfesor)?.nombre || 'Profesor'}` 
                            : `Horario del Grupo ${grupos.find(g => g.id === selectedGrupo)?.nombre || 'Grupo'}`
                        }
                    </h4>
                    <ScheduleGrid 
                        horario={obtenerHorarioMostrar()}
                        bloquesTiempo={bloquesTiempo}
                        diasSemana={diasSemana}
                    />
                </div>
            )}

            {/* Instrucciones */}
            <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-bold text-gray-800 mb-3">Instrucciones de Uso</h4>
                <ul className="space-y-2 text-gray-600">
                    <li>• Asegúrate de tener profesores, materias y grupos configurados antes de generar horarios.</li>
                    <li>• Los profesores deben tener disponibilidad configurada para que el algoritmo funcione correctamente.</li>
                    <li>• Las materias deben estar asignadas a los profesores correspondientes.</li>
                    <li>• Los grupos deben tener materias asignadas.</li>
                    <li>• Puedes exportar los horarios generados a Excel para uso externo.</li>
                    <li>• Usa el modo "Por Profesor" para ver horarios individuales o "Por Grupo" para horarios de grupos.</li>
                </ul>
            </div>
        </div>
    );
}
