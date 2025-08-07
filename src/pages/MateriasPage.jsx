import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import * as XLSX from 'xlsx';

export default function MateriasPage() {
    const { materias, carreras, addMateria, updateMateria, deleteMateria, clearMaterias } = useData();
    const { userRole } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMateria, setEditingMateria] = useState(null);
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        carrera: '',
        cuatrimestre: '',
        horas: ''
    });
    const [filterCarrera, setFilterCarrera] = useState('');
    const [filterCuatrimestre, setFilterCuatrimestre] = useState('');
    const fileInputRef = useRef(null);

    // Obtener cuatrimestres únicos
    const uniqueCuatrimestres = [...new Set(materias.map(m => m.cuatrimestre).filter(Boolean))].sort((a, b) => a - b);

    const handleAddClick = () => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        setEditingMateria(null);
        setFormData({ codigo: '', nombre: '', carrera: '', cuatrimestre: '', horas: '' });
        setIsModalOpen(true);
    };

    const handleEditClick = (materia) => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        setEditingMateria(materia);
        setFormData({
            codigo: materia.codigo || '',
            nombre: materia.nombre || '',
            carrera: materia.carrera || '',
            cuatrimestre: materia.cuatrimestre || '',
            horas: materia.horas || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        if (window.confirm('¿Estás seguro de que quieres eliminar esta materia?')) {
            try {
                await deleteMateria(id);
            } catch (error) {
                console.error('Error al eliminar materia:', error);
                alert('Error al eliminar la materia.');
            }
        }
    };

    const handleDeleteAll = async () => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }
        if (window.confirm('¿Estás seguro de que quieres eliminar TODAS las materias? Esta acción no se puede deshacer.')) {
            try {
                await clearMaterias();
                alert('Todas las materias han sido eliminadas.');
            } catch (error) {
                console.error('Error al eliminar materias:', error);
                alert('Error al eliminar las materias.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre || !formData.carrera || !formData.horas) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        try {
            const dataToSave = {
                ...formData,
                horas: parseInt(formData.horas),
                cuatrimestre: parseInt(formData.cuatrimestre) || null
            };

            if (editingMateria) {
                await updateMateria(editingMateria.id, dataToSave);
            } else {
                await addMateria(dataToSave);
            }
            setIsModalOpen(false);
            setFormData({ codigo: '', nombre: '', carrera: '', cuatrimestre: '', horas: '' });
        } catch (error) {
            console.error('Error al guardar materia:', error);
            alert('Error al guardar la materia.');
        }
    };

    const handleFileUpload = (event) => {
        if (userRole !== 'admin') {
            alert('No tienes permiso para realizar esta acción.');
            return;
        }

        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                let totalImported = 0;
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    
                    json.forEach(item => {
                        const horasValue = item['Horas por semana'] || item['Horas teóricas'] || item['Total de horas'] || item.horas;
                        const newItem = {
                            codigo: item.Codigo || item.codigo || '',
                            nombre: item.Nombre || item.nombre || item.Materia || '',
                            carrera: item.Carrera || item.carrera || sheetName,
                            cuatrimestre: parseInt(item.Cuatrimestre || item.cuatrimestre) || null,
                            horas: parseInt(horasValue) || 0
                        };

                        if (newItem.nombre && newItem.carrera && newItem.horas > 0) {
                            addMateria(newItem);
                            totalImported++;
                        }
                    });
                });
                
                alert(`${totalImported} registros de materias importados.`);
            } catch (error) {
                console.error("Error processing file:", error);
                alert('Error al procesar el archivo. Asegúrate que el formato es correcto.');
            }
        };
        reader.readAsArrayBuffer(file);
        event.target.value = '';
    };

    // Filtrar materias
    const filteredMaterias = materias.filter(m => {
        const carreraMatch = !filterCarrera || m.carrera === filterCarrera;
        const cuatrimestreMatch = !filterCuatrimestre || m.cuatrimestre?.toString() === filterCuatrimestre;
        return carreraMatch && cuatrimestreMatch;
    });

    const resetFilters = () => {
        setFilterCarrera('');
        setFilterCuatrimestre('');
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h3 className="text-3xl font-bold text-primary">Gestión de Materias</h3>
                    <p className="text-gray-600">Administra las materias del sistema</p>
                </div>
                {userRole === 'admin' && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddClick}
                            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                        >
                            Añadir Materia
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Importar Excel
                        </button>
                        <button
                            onClick={handleDeleteAll}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                            Eliminar Todas
                        </button>
                    </div>
                )}
            </div>

            {/* Filtros */}
            <div className="grid md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
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
                        {carreras.map(carrera => (
                            <option key={carrera.id} value={carrera.nombre}>
                                {carrera.nombre}
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
                <div className="flex items-end">
                    <button
                        onClick={resetFilters}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Limpiar Filtros
                    </button>
                </div>
                <div className="flex items-end">
                    <div className="text-sm text-gray-600">
                        <div>Total: {materias.length} materias</div>
                        <div>Filtradas: {filteredMaterias.length}</div>
                    </div>
                </div>
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
                                Carrera
                            </th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cuatrimestre
                            </th>
                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Horas
                            </th>
                            {userRole === 'admin' && (
                                <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredMaterias.length > 0 ? (
                            filteredMaterias.map((materia) => (
                                <tr key={materia.id} className="hover:bg-gray-50">
                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                        {materia.codigo || '-'}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-900">
                                        {materia.nombre}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500">
                                        {materia.carrera}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500">
                                        {materia.cuatrimestre ? `${materia.cuatrimestre}°` : '-'}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {materia.horas}h
                                        </span>
                                    </td>
                                    {userRole === 'admin' && (
                                        <td className="py-4 px-6 text-sm text-center space-x-2">
                                            <button
                                                onClick={() => handleEditClick(materia)}
                                                className="text-blue-600 hover:text-blue-900 font-medium"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(materia.id)}
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
                                <td colSpan={userRole === 'admin' ? 6 : 5} className="text-center py-8 text-gray-500">
                                    No hay materias que coincidan con los filtros
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingMateria ? 'Editar Materia' : 'Añadir Materia'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código
                        </label>
                        <input
                            type="text"
                            value={formData.codigo}
                            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            placeholder="Código de la materia"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de la Materia *
                        </label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            placeholder="Nombre de la materia"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Carrera *
                        </label>
                        <select
                            value={formData.carrera}
                            onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            required
                        >
                            <option value="">Seleccionar carrera</option>
                            {carreras.map(carrera => (
                                <option key={carrera.id} value={carrera.nombre}>
                                    {carrera.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cuatrimestre
                        </label>
                        <select
                            value={formData.cuatrimestre}
                            onChange={(e) => setFormData({ ...formData, cuatrimestre: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        >
                            <option value="">Seleccionar cuatrimestre</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
                                <option key={num} value={num}>
                                    {num}° Cuatrimestre
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Horas Semanales *
                        </label>
                        <input
                            type="number"
                            value={formData.horas}
                            onChange={(e) => setFormData({ ...formData, horas: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            placeholder="Número de horas por semana"
                            min="1"
                            required
                        />
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
                            {editingMateria ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
// Archivo corregido