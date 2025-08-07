import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/common/Modal';
import * as XLSX from 'xlsx';

// Componente para el modal de añadir/editar profesor
const ProfesorModal = ({ isOpen, onClose, profesor, onSave }) => {
    const { carreras } = useData();
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: 'Tiempo Completo',
        carreraId: '',
        email: '',
        telefono: ''
    });

    useEffect(() => {
        if (profesor) {
            setFormData(profesor);
        } else {
            setFormData({
                nombre: '',
                tipo: 'Tiempo Completo',
                carreraId: '',
                email: '',
                telefono: ''
            });
        }
    }, [profesor]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nombre.trim()) {
            alert('El nombre es requerido');
            return;
        }
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={profesor ? 'Editar Profesor' : 'Añadir Profesor'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                        value={formData.tipo}
                        onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="Tiempo Completo">Tiempo Completo</option>
                        <option value="Medio Tiempo">Medio Tiempo</option>
                        <option value="Por Asignatura">Por Asignatura</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
                    <select
                        value={formData.carreraId}
                        onChange={(e) => setFormData({...formData, carreraId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Seleccionar carrera...</option>
                        {carreras.map(carrera => (
                            <option key={carrera.id} value={carrera.id}>{carrera.nombre}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary-dark"
                    >
                        {profesor ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// Componente para el modal de disponibilidad
const DisponibilidadModal = ({ isOpen, onClose, profesor, onSave }) => {
    const { configuracion } = useData();
    const [disponibilidad, setDisponibilidad] = useState({});

    useEffect(() => {
        if (profesor) {
            setDisponibilidad(profesor.disponibilidad || {});
        }
    }, [profesor]);

    const handleCheck = (key) => {
        setDisponibilidad(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = () => {
        onSave(profesor.id, disponibilidad);
        onClose();
    };

    if (!isOpen || !profesor) return null;

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const bloques = [
        ...configuracion.bloques.matutino,
        ...configuracion.bloques.vespertino
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Disponibilidad - ${profesor.nombre}`}>
            <div className="space-y-4">
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="p-2 border bg-gray-100">Horario</th>
                            {dias.map(dia => (
                                <th key={dia} className="p-2 border bg-gray-100">{dia}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {bloques.map((bloque, bIdx) => (
                            <tr key={bIdx}>
                                <td className="p-2 border font-medium">{bloque}</td>
                                {dias.map((_, dIdx) => {
                                    const key = `${dIdx}-${bIdx}`;
                                    return (
                                        <td key={key} className="p-2 border text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={!!disponibilidad[key]} 
                                                onChange={() => handleCheck(key)}
                                                className="w-4 h-4"
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary-dark"
                    >
                        Guardar Disponibilidad
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default function ProfesoresPage() {
    const { profesores, carreras, addProfesor, updateProfesor, deleteProfesor, clearProfesores } = useData();
    const [modal, setModal] = useState({ isOpen: false, data: null, type: '' });
    const fileInputRef = useRef(null);

    const handleSaveProfesor = async (data) => {
        try {
            if (modal.data?.id) {
                await updateProfesor(modal.data.id, data);
            } else {
                await addProfesor(data);
            }
            setModal({ isOpen: false, data: null, type: '' });
        } catch (error) {
            console.error('Error al guardar profesor:', error);
            alert('Error al guardar el profesor');
        }
    };

    const handleSaveDisponibilidad = async (profesorId, disponibilidad) => {
        try {
            await updateProfesor(profesorId, { disponibilidad });
        } catch (error) {
            console.error('Error al guardar disponibilidad:', error);
            alert('Error al guardar la disponibilidad');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este profesor?')) {
            try {
                await deleteProfesor(id);
            } catch (error) {
                console.error('Error al eliminar profesor:', error);
                alert('Error al eliminar el profesor');
            }
        }
    };

    const handleImportCSV = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const profesoresData = jsonData.map(row => ({
                    nombre: row.Nombre || row.nombre || '',
                    tipo: row.Tipo || row.tipo || 'Tiempo Completo',
                    carreraId: row.CarreraId || row.carreraId || '',
                    email: row.Email || row.email || '',
                    telefono: row.Telefono || row.telefono || '',
                    disponibilidad: {}
                }));

                if (profesoresData.length > 0) {
                    profesoresData.forEach(profesor => {
                        if (profesor.nombre) {
                            addProfesor(profesor);
                        }
                    });
                    alert(`Se importaron ${profesoresData.length} profesores exitosamente`);
                } else {
                    alert('No se encontraron datos válidos en el archivo');
                }
            } catch (error) {
                console.error('Error al importar:', error);
                alert('Error al procesar el archivo CSV/Excel');
            }
        };

        reader.readAsArrayBuffer(file);
        e.target.value = '';
    };

    const handleExportCSV = () => {
        if (profesores.length === 0) {
            alert('No hay profesores para exportar');
            return;
        }

        const exportData = profesores.map(profesor => {
            const carrera = carreras.find(c => c.id === profesor.carreraId);
            return {
                Nombre: profesor.nombre,
                Tipo: profesor.tipo,
                Carrera: carrera?.nombre || '',
                Email: profesor.email || '',
                Telefono: profesor.telefono || ''
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Profesores');
        XLSX.writeFile(wb, 'profesores.xlsx');
    };

    const handleClearAll = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar todos los profesores? Esta acción no se puede deshacer.')) {
            clearProfesores();
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            {/* Modal de Añadir/Editar Profesor */}
            <ProfesorModal
                isOpen={modal.type === 'edit'}
                onClose={() => setModal({ isOpen: false, data: null, type: '' })}
                profesor={modal.data}
                onSave={handleSaveProfesor}
            />

            {/* Modal de Disponibilidad */}
            <DisponibilidadModal 
                isOpen={modal.type === 'disponibilidad'}
                onClose={() => setModal({ isOpen: false, data: null, type: '' })}
                profesor={modal.data}
                onSave={handleSaveDisponibilidad}
            />
            
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-primary">Gestión de Profesores</h3>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => setModal({ isOpen: true, data: null, type: 'edit' })} 
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                    >
                        Añadir Profesor
                    </button>
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        Importar CSV/Excel
                    </button>
                    <button 
                        onClick={handleExportCSV} 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Exportar Excel
                    </button>
                    <button 
                        onClick={handleClearAll} 
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        Limpiar Todo
                    </button>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleImportCSV}
                style={{ display: 'none' }}
            />
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-6 text-left border-b">Nombre</th>
                            <th className="py-3 px-6 text-left border-b">Tipo</th>
                            <th className="py-3 px-6 text-left border-b">Carrera</th>
                            <th className="py-3 px-6 text-left border-b">Email</th>
                            <th className="py-3 px-6 text-left border-b">Teléfono</th>
                            <th className="py-3 px-6 text-left border-b">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {profesores.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-gray-500">
                                    No hay profesores registrados. Añade uno nuevo o importa desde un archivo CSV/Excel.
                                </td>
                            </tr>
                        ) : (
                            profesores.map(profesor => {
                                const carrera = carreras.find(c => c.id === profesor.carreraId);
                                return (
                                    <tr key={profesor.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-6 border-b">{profesor.nombre}</td>
                                        <td className="py-4 px-6 border-b">{profesor.tipo}</td>
                                        <td className="py-4 px-6 border-b">{carrera?.nombre || 'Sin asignar'}</td>
                                        <td className="py-4 px-6 border-b">{profesor.email || '-'}</td>
                                        <td className="py-4 px-6 border-b">{profesor.telefono || '-'}</td>
                                        <td className="py-4 px-6 border-b">
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => setModal({ isOpen: true, data: profesor, type: 'disponibilidad' })} 
                                                    className="text-yellow-600 hover:underline text-sm"
                                                >
                                                    Disponibilidad
                                                </button>
                                                <button 
                                                    onClick={() => setModal({ isOpen: true, data: profesor, type: 'edit' })} 
                                                    className="text-blue-600 hover:underline text-sm"
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(profesor.id)} 
                                                    className="text-red-600 hover:underline text-sm"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
