import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from '../components/common/Modal';

export default function MateriasPage() {
    const { cicloActivoId, materias, carreras, ciclos } = useData();
    const [isModalOpen, setModalOpen] = useState(false);
    const [materiaActual, setMateriaActual] = useState(null);

    const ciclo = ciclos.find(c => c.id === cicloActivoId);

    const handleSave = async (data) => {
        if (!cicloActivoId) return;
        const collRef = collection(db, `ciclos/${cicloActivoId}/materias`);
        if (materiaActual?.id) {
            await updateDoc(doc(db, collRef.path, materiaActual.id), data);
        } else {
            await addDoc(collRef, data);
        }
        setModalOpen(false);
        setMateriaActual(null);
    };

    const handleDelete = async (id) => {
        if(window.confirm('¿Seguro?') && cicloActivoId) {
            await deleteDoc(doc(db, `ciclos/${cicloActivoId}/materias`, id));
        }
    };
    
    // Formulario para el Modal
    const FormularioMateria = ({ onSave, materia }) => {
        const [formData, setFormData] = useState(materia || { nombre: '', carreraId: '', cuatrimestre: '', horas: 0 });
        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };
        return (
            <div>
                <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" className="w-full p-2 border rounded mb-2"/>
                <select name="carreraId" value={formData.carreraId} onChange={handleChange} className="w-full p-2 border rounded mb-2">
                    <option value="">Selecciona Carrera</option>
                    {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <select name="cuatrimestre" value={formData.cuatrimestre} onChange={handleChange} className="w-full p-2 border rounded mb-2">
                     <option value="">Selecciona Cuatrimestre</option>
                    {ciclo?.cuatrimestres?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input name="horas" type="number" value={formData.horas} onChange={handleChange} placeholder="Horas" className="w-full p-2 border rounded mb-2"/>
                <button onClick={() => onSave(formData)} className="w-full mt-4 py-2 bg-primary text-white rounded">Guardar</button>
            </div>
        );
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <Modal isOpen={isModalOpen} onClose={() => { setModalOpen(false); setMateriaActual(null); }} title={materiaActual ? "Editar Materia" : "Añadir Materia"}>
                <FormularioMateria onSave={handleSave} materia={materiaActual}/>
            </Modal>
            
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-primary">Gestión de Materias</h3>
                <button onClick={() => setModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg">Añadir Materia</button>
            </div>
            
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-3 px-6 text-left">Nombre</th>
                        <th className="py-3 px-6 text-left">Carrera</th>
                        <th className="py-3 px-6 text-left">Cuatri.</th>
                        <th className="py-3 px-6 text-left">Horas</th>
                        <th className="py-3 px-6 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {materias.map(m => (
                        <tr key={m.id}>
                            <td className="py-4 px-6">{m.nombre}</td>
                            <td className="py-4 px-6">{carreras.find(c => c.id === m.carreraId)?.nombre || 'N/A'}</td>
                            <td className="py-4 px-6">{m.cuatrimestre}</td>
                            <td className="py-4 px-6">{m.horas}</td>
                            <td className="py-4 px-6 space-x-2">
                                <button onClick={() => { setMateriaActual(m); setModalOpen(true); }} className="text-blue-600 hover:underline">Editar</button>
                                <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:underline">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}