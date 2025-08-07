import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';

export default function ConfiguracionPage() {
    const { configuracion, updateConfiguracion } = useData();
    const { userRole } = useAuth();
    const [config, setConfig] = useState({
        bloquesTiempo: [
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
        ],
        aulas: [
            'Aula 1', 'Aula 2', 'Aula 3', 'Aula 4', 'Aula 5',
            'Laboratorio 1', 'Laboratorio 2', 'Laboratorio 3',
            'Sala de Conferencias', 'Auditorio'
        ],
        semanaLaboral: {
            lunes: true,
            martes: true,
            miercoles: true,
            jueves: true,
            viernes: true,
            sabado: false
        },
        configuracionGeneral: {
            horasMaximasPorDia: 8,
            horasMaximasPorSemana: 40,
            tiempoMinimoDescanso: 30,
            permitirHorariosConsecutivos: true,
            generarHorarioAutomatico: true
        }
    });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalType, setModalType] = useState(''); // 'bloque' o 'aula'
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (configuracion && Object.keys(configuracion).length > 0) {
            setConfig({ ...config, ...configuracion });
        }
    }, [configuracion]);

    const handleSaveConfig = async () => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }

        try {
            await updateConfiguracion(config);
            alert('Configuración guardada exitosamente.');
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            alert('Error al guardar la configuración.');
        }
    };

    const handleAddBloque = () => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        setModalType('bloque');
        setEditingItem(null);
        setFormData({
            inicio: '',
            fin: '',
            nombre: ''
        });
        setIsModalOpen(true);
    };

    const handleEditBloque = (bloque) => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        setModalType('bloque');
        setEditingItem(bloque);
        setFormData({
            inicio: bloque.inicio,
            fin: bloque.fin,
            nombre: bloque.nombre
        });
        setIsModalOpen(true);
    };

    const handleDeleteBloque = (id) => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        if (window.confirm('¿Estás seguro de que quieres eliminar este bloque de tiempo?')) {
            setConfig(prev => ({
                ...prev,
                bloquesTiempo: prev.bloquesTiempo.filter(b => b.id !== id)
            }));
        }
    };

    const handleAddAula = () => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        setModalType('aula');
        setEditingItem(null);
        setFormData({ nombre: '' });
        setIsModalOpen(true);
    };

    const handleEditAula = (aula, index) => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        setModalType('aula');
        setEditingItem({ nombre: aula, index });
        setFormData({ nombre: aula });
        setIsModalOpen(true);
    };

    const handleDeleteAula = (index) => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        if (window.confirm('¿Estás seguro de que quieres eliminar esta aula?')) {
            setConfig(prev => ({
                ...prev,
                aulas: prev.aulas.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmitModal = (e) => {
        e.preventDefault();
        
        if (modalType === 'bloque') {
            if (!formData.inicio || !formData.fin || !formData.nombre) {
                alert('Por favor, completa todos los campos.');
                return;
            }

            if (editingItem) {
                setConfig(prev => ({
                    ...prev,
                    bloquesTiempo: prev.bloquesTiempo.map(b => 
                        b.id === editingItem.id ? { ...b, ...formData } : b
                    )
                }));
            } else {
                const newId = Math.max(...config.bloquesTiempo.map(b => b.id), 0) + 1;
                setConfig(prev => ({
                    ...prev,
                    bloquesTiempo: [...prev.bloquesTiempo, { id: newId, ...formData }]
                }));
            }
        } else if (modalType === 'aula') {
            if (!formData.nombre.trim()) {
                alert('Por favor, ingresa el nombre del aula.');
                return;
            }

            if (editingItem) {
                setConfig(prev => ({
                    ...prev,
                    aulas: prev.aulas.map((aula, i) => 
                        i === editingItem.index ? formData.nombre : aula
                    )
                }));
            } else {
                setConfig(prev => ({
                    ...prev,
                    aulas: [...prev.aulas, formData.nombre]
                }));
            }
        }

        setIsModalOpen(false);
    };

    const handleDayChange = (day) => {
        setConfig(prev => ({
            ...prev,
            semanaLaboral: {
                ...prev.semanaLaboral,
                [day]: !prev.semanaLaboral[day]
            }
        }));
    };

    const handleGeneralConfigChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            configuracionGeneral: {
                ...prev.configuracionGeneral,
                [field]: value
            }
        }));
    };

    if (userRole !== 'admin') {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-3xl font-bold text-primary mb-6">Configuración del Sistema</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">No tienes permiso para acceder a la configuración del sistema.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-3xl font-bold text-primary">Configuración del Sistema</h3>
                    <p className="text-gray-600">Configura los parámetros del sistema de horarios</p>
                </div>
                <button
                    onClick={handleSaveConfig}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                    Guardar Configuración
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bloques de Tiempo */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-bold text-gray-800">Bloques de Tiempo</h4>
                        <button
                            onClick={handleAddBloque}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors"
                        >
                            Añadir Bloque
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {config.bloquesTiempo.map((bloque) => (
                            <div key={bloque.id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center">
                                <div>
                                    <div className="font-medium text-gray-800">{bloque.nombre}</div>
                                    <div className="text-sm text-gray-600">{bloque.inicio} - {bloque.fin}</div>
                                </div>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => handleEditBloque(bloque)}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteBloque(bloque.id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Aulas */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-bold text-gray-800">Aulas Disponibles</h4>
                        <button
                            onClick={handleAddAula}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors"
                        >
                            Añadir Aula
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {config.aulas.map((aula, index) => (
                            <div key={index} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center">
                                <div className="font-medium text-gray-800">{aula}</div>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => handleEditAula(aula, index)}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAula(index)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Días Laborales */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-xl font-bold text-gray-800 mb-4">Días Laborales</h4>
                    <div className="space-y-3">
                        {Object.entries(config.semanaLaboral).map(([day, active]) => (
                            <label key={day} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={() => handleDayChange(day)}
                                    className="h-4 w-4 text-primary rounded focus:ring-primary"
                                />
                                <span className="ml-3 text-gray-700 capitalize">
                                    {day === 'miercoles' ? 'Miércoles' : 
                                     day === 'sabado' ? 'Sábado' : day}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Configuración General */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-xl font-bold text-gray-800 mb-4">Configuración General</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Horas máximas por día
                            </label>
                            <input
                                type="number"
                                value={config.configuracionGeneral.horasMaximasPorDia}
                                onChange={(e) => handleGeneralConfigChange('horasMaximasPorDia', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                min="1"
                                max="12"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Horas máximas por semana
                            </label>
                            <input
                                type="number"
                                value={config.configuracionGeneral.horasMaximasPorSemana}
                                onChange={(e) => handleGeneralConfigChange('horasMaximasPorSemana', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                min="1"
                                max="60"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tiempo mínimo de descanso (minutos)
                            </label>
                            <input
                                type="number"
                                value={config.configuracionGeneral.tiempoMinimoDescanso}
                                onChange={(e) => handleGeneralConfigChange('tiempoMinimoDescanso', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                min="0"
                                max="120"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.configuracionGeneral.permitirHorariosConsecutivos}
                                    onChange={(e) => handleGeneralConfigChange('permitirHorariosConsecutivos', e.target.checked)}
                                    className="h-4 w-4 text-primary rounded focus:ring-primary"
                                />
                                <span className="ml-3 text-gray-700">Permitir horarios consecutivos</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.configuracionGeneral.generarHorarioAutomatico}
                                    onChange={(e) => handleGeneralConfigChange('generarHorarioAutomatico', e.target.checked)}
                                    className="h-4 w-4 text-primary rounded focus:ring-primary"
                                />
                                <span className="ml-3 text-gray-700">Generar horario automático</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    modalType === 'bloque' 
                        ? (editingItem ? 'Editar Bloque de Tiempo' : 'Añadir Bloque de Tiempo')
                        : (editingItem ? 'Editar Aula' : 'Añadir Aula')
                }
            >
                <form onSubmit={handleSubmitModal} className="space-y-4">
                    {modalType === 'bloque' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Bloque
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre || ''}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    placeholder="Ej: Bloque 1, Receso, Almuerzo"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hora de Inicio
                                </label>
                                <input
                                    type="time"
                                    value={formData.inicio || ''}
                                    onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hora de Fin
                                </label>
                                <input
                                    type="time"
                                    value={formData.fin || ''}
                                    onChange={(e) => setFormData({ ...formData, fin: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre del Aula
                            </label>
                            <input
                                type="text"
                                value={formData.nombre || ''}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                placeholder="Ej: Aula 1, Laboratorio 2"
                                required
                            />
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-500 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                        >
                            {editingItem ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
