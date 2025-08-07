import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';

// Modal para Asignar Materias
const AsignarMateriasModal = ({ isOpen, onClose, grupo, materias, carreras, onSave }) => {
    const [selectedMaterias, setSelectedMaterias] = useState(grupo?.materias || []);
    const [filterCarrera, setFilterCarrera] = useState('');
    const [filterCuatrimestre, setFilterCuatrimestre] = useState('');

    const uniqueCarreras = [...new Set(materias.map(m => m.carrera).filter(Boolean))];
    const uniqueCuatrimestres = [...new Set(materias.map(m => m.cuatrimestre).filter(Boolean))].sort((a, b) => a - b);

    const handleToggleMateria = (materiaId) => {
        setSelectedMaterias(prev => 
            prev.includes(materiaId) 
                ? prev.filter(id => id !== materiaId)
                : [...prev, materiaId]
        );
    };

    const handleSave = () => {
        onSave(selectedMaterias);
        onClose();
    };

    // Filtrar materias
    const filteredMaterias = materias.filter(m => {
        const carreraMatch = !filterCarrera || m.carrera === filterCarrera;
        const cuatrimestreMatch = !filterCuatrimestre || m.cuatrimestre?.toString() === filterCuatrimestre;
        return carreraMatch && cuatrimestreMatch;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-primary">Asignar Materias a {grupo?.nombre}</h3>
                    <button onClick={onClose} className="text-2xl font-bold">&times;</button>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filtrar por Carrera
                        </label>
                        <select
                            value={filterCarrera}
                            onChange={(e) => setFilterCarrera(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        >
                            <option value="">Todas las carreras</option>
                            {uniqueCarreras.map(carrera => (
                                <option key={carrera} value={carrera}>
                                    {carrera}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filtrar por Cuatrimestre
                        </label>
                        <select
                            value={filterCuatrimestre}
                            onChange={(e) => setFilterCuatrimestre(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        >
                            <option value="">Todos los cuatrimestres</option>
                            {uniqueCuatrimestres.map(cuatri => (
                                <option key={cuatri} value={cuatri}>
                                    {cuatri}° Cuatrimestre
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Lista de materias */}
                <div className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded-md mb-6">
                    {filteredMaterias.length > 0 ? (
                        filteredMaterias.map(materia => (
                            <div key={materia.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                                <input
                                    type="checkbox"
                                    id={`materia-${materia.id}`}
                                    checked={selectedMaterias.includes(materia.id)}
                                    onChange={() => handleToggleMateria(materia.id)}
                                    className="h-4 w-4 text-primary rounded focus:ring-primary"
                                />
                                <label htmlFor={`materia-${materia.id}`} className="ml-3 text-sm cursor-pointer flex-1">
                                    <div className="font-medium text-gray-900">{materia.nombre}</div>
                                    <div className="text-gray-500 text-xs">
                                        {materia.carrera} - {materia.cuatrimestre ? `${materia.cuatrimestre}° Cuatrimestre` : 'Sin cuatrimestre'} - {materia.horas}h
                                    </div>
                                </label>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">No hay materias disponibles con los filtros seleccionados</p>
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-500 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                        Guardar Asignaciones
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function GruposPage() {
    const { grupos, materias, carreras, addGrupo, updateGrupo, deleteGrupo } = useData();
    const { userRole } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGrupo, setEditingGrupo] = useState(null);
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        turno: 'matutino',
        materias: []
    });
    const [materiasModalOpen, setMateriasModalOpen] = useState(false);
    const [selectedGrupo, setSelectedGrupo] = useState(null);

    const handleAddClick = () => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        setEditingGrupo(null);
        setFormData({ codigo: '', nombre: '', turno: 'matutino', materias: [] });
        setIsModalOpen(true);
    };

    const handleEditClick = (grupo) => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        setEditingGrupo(grupo);
        setFormData({
            codigo: grupo.codigo || '',
            nombre: grupo.nombre || '',
            turno: grupo.turno || 'matutino',
            materias: grupo.materias || []
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        if (window.confirm('¿Estás seguro de que quieres eliminar este grupo?')) {
            try {
                await deleteGrupo(id);
            } catch (error) {
                console.error('Error al eliminar grupo:', error);
                alert('Error al eliminar el grupo.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.codigo || !formData.nombre || !formData.turno) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        try {
            if (editingGrupo) {
                await updateGrupo(editingGrupo.id, formData);
            } else {
                await addGrupo(formData);
            }
            setIsModalOpen(false);
            setFormData({ codigo: '', nombre: '', turno: 'matutino', materias: [] });
        } catch (error) {
            console.error('Error al guardar grupo:', error);
            alert('Error al guardar el grupo.');
        }
    };

    const handleMateriasClick = (grupo) => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        setSelectedGrupo(grupo);
        setMateriasModalOpen(true);
    };

    const handleSaveMaterias = async (materias) => {
        if (selectedGrupo) {
            try {
                await updateGrupo(selectedGrupo.id, { materias });
                setMateriasModalOpen(false);
                setSelectedGrupo(null);
            } catch (error) {
                console.error('Error al guardar materias:', error);
                alert('Error al guardar las materias.');
            }
        }
    };

    const getMateriaNombre = (materiaId) => {
        const materia = materias.find(m => m.id === materiaId);
        return materia ? materia.nombre : 'Materia no encontrada';
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h3 className="text-3xl font-bold text-primary">Gestión de Grupos</h3>
                    <p className="text-gray-600">Administra los grupos y sus materias asignadas</p>
                </div>
                {userRole === 'admin' && (
                    <button
                        onClick={handleAddClick}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                    >
                        Añadir Grupo
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Código
                            </th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Turno
                            </th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Materias Asignadas
                            </th>
                            <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {grupos.length > 0 ? (
                            grupos.map((grupo) => (
                                <tr key={grupo.id} className="hover:bg-gray-50">
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                        {grupo.codigo}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-900">
                                        {grupo.nombre}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            grupo.turno === 'matutino' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                        }`}>
                                            {grupo.turno === 'matutino' ? 'Matutino' : 'Vespertino'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500">
                                        {grupo.materias && grupo.materias.length > 0 
                                            ? `${grupo.materias.length} materias`
                                            : 'Sin materias asignadas'
                                        }
                                    </td>
                                    <td className="py-4 px-6 text-sm text-center space-x-2">
                                        <button
                                            onClick={() => handleMateriasClick(grupo)}
                                            className="text-green-600 hover:text-green-900 font-medium"
                                        >
                                            Asignar Materias
                                        </button>
                                        {userRole === 'admin' && (
                                            <>
                                                <button
                                                    onClick={() => handleEditClick(grupo)}
                                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(grupo.id)}
                                                    className="text-red-600 hover:text-red-900 font-medium"
                                                >
                                                    Eliminar
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">
                                    No hay grupos registrados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingGrupo ? 'Editar Grupo' : 'Añadir Grupo'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código del Grupo *
                        </label>
                        <input
                            type="text"
                            value={formData.codigo}
                            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            placeholder="Ej: ISC-101"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del Grupo *
                        </label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            placeholder="Ej: Primer Cuatrimestre ISC"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Turno *
                        </label>
                        <select
                            value={formData.turno}
                            onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            required
                        >
                            <option value="matutino">Matutino</option>
                            <option value="vespertino">Vespertino</option>
                        </select>
                    </div>

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
                            {editingGrupo ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </Modal>

            <AsignarMateriasModal
                isOpen={materiasModalOpen}
                onClose={() => setMateriasModalOpen(false)}
                grupo={selectedGrupo}
                materias={materias}
                carreras={carreras}
                onSave={handleSaveMaterias}
            />
        </div>
    );
}
