import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';

export default function CarrerasPage() {
    const { carreras, addCarrera, updateCarrera, deleteCarrera } = useData();
    const { userRole } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCarrera, setEditingCarrera] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        abreviatura: '',
        nivel: ''
    });

    const handleAddClick = () => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        setEditingCarrera(null);
        setFormData({ nombre: '', abreviatura: '', nivel: '' });
        setIsModalOpen(true);
    };

    const handleEditClick = (carrera) => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        setEditingCarrera(carrera);
        setFormData({
            nombre: carrera.nombre || '',
            abreviatura: carrera.abreviatura || '',
            nivel: carrera.nivel || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        if (window.confirm('¿Estás seguro de que quieres eliminar esta carrera?')) {
            try {
                await deleteCarrera(id);
            } catch (error) {
                console.error('Error al eliminar carrera:', error);
                alert('Error al eliminar la carrera.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre || !formData.nivel) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        try {
            if (editingCarrera) {
                await updateCarrera(editingCarrera.id, formData);
            } else {
                await addCarrera(formData);
            }
            setIsModalOpen(false);
            setFormData({ nombre: '', abreviatura: '', nivel: '' });
        } catch (error) {
            console.error('Error al guardar carrera:', error);
            alert('Error al guardar la carrera.');
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h3 className="text-3xl font-bold text-primary">Gestión de Carreras</h3>
                    <p className="text-gray-600">Administra las carreras de la institución</p>
                </div>
                {userRole === 'admin' && (
                    <button
                        onClick={handleAddClick}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                    >
                        Añadir Carrera
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Abreviatura
                            </th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nivel
                            </th>
                            {userRole === 'admin' && (
                                <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {carreras.length > 0 ? (
                            carreras.map((carrera) => (
                                <tr key={carrera.id} className="hover:bg-gray-50">
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                        {carrera.nombre}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500">
                                        {carrera.abreviatura || '-'}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {carrera.nivel}
                                        </span>
                                    </td>
                                    {userRole === 'admin' && (
                                        <td className="py-4 px-6 text-sm text-center space-x-2">
                                            <button
                                                onClick={() => handleEditClick(carrera)}
                                                className="text-blue-600 hover:text-blue-900 font-medium"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(carrera.id)}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={userRole === 'admin' ? 4 : 3} className="text-center py-8 text-gray-500">
                                    No hay carreras registradas
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCarrera ? 'Editar Carrera' : 'Añadir Carrera'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de la Carrera *
                        </label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            placeholder="Ej: Ingeniería en Sistemas Computacionales"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Abreviatura
                        </label>
                        <input
                            type="text"
                            value={formData.abreviatura}
                            onChange={(e) => setFormData({ ...formData, abreviatura: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            placeholder="Ej: ISC"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nivel *
                        </label>
                        <select
                            value={formData.nivel}
                            onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            required
                        >
                            <option value="">Seleccionar nivel</option>
                            <option value="Licenciatura">Licenciatura</option>
                            <option value="Ingeniería">Ingeniería</option>
                            <option value="Técnico Superior Universitario">Técnico Superior Universitario</option>
                            <option value="Maestría">Maestría</option>
                            <option value="Doctorado">Doctorado</option>
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
                            {editingCarrera ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
