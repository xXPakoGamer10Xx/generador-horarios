import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from '../components/common/Modal';

// Modal para Asignar Materias
const AsignarMateriasModal = ({ isOpen, onClose, grupo, materias }) => {
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);

    useEffect(() => {
        if (grupo) setMateriasSeleccionadas(grupo.materias || []);
    }, [grupo]);

    if (!isOpen) return null;

    const materiasDisponibles = materias.filter(
        m => m.carreraId === grupo.carreraId && m.cuatrimestre === grupo.cuatrimestre
    );

    const handleCheck = (materiaId) => {
        setMateriasSeleccionadas(prev =>
            prev.includes(materiaId) ? prev.filter(id => id !== materiaId) : [...prev, materiaId]
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={() => onClose(materiasSeleccionadas)} title={`Asignar Materias a ${grupo.nombre}`}>
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {materiasDisponibles.length > 0 ? materiasDisponibles.map(m => (
                    <div key={m.id} className="flex items-center">
                        <input
                            type="checkbox"
                            id={`m-${m.id}`}
                            checked={materiasSeleccionadas.includes(m.id)}
                            onChange={() => handleCheck(m.id)}
                            className="h-4 w-4"
                        />
                        <label htmlFor={`m-${m.id}`} className="ml-2">{m.nombre}</label>
                    </div>
                )) : <p>No hay materias disponibles para la carrera y cuatrimestre de este grupo.</p>}
            </div>
            <button onClick={() => onClose(materiasSeleccionadas)} className="w-full mt-4 py-2 bg-primary text-white rounded">Guardar Asignaciones</button>
        </Modal>
    );
};

export default function GruposPage() {
    const { cicloActivoId, grupos, materias, carreras, ciclos } = useData();
    const [modal, setModal] = useState({ isOpen: false, data: null, type: '' });

    const ciclo = ciclos.find(c => c.id === cicloActivoId);

    const handleSaveGrupo = async (data) => {
        if (!cicloActivoId) return;
        const collRef = collection(db, `ciclos/${cicloActivoId}/grupos`);
        if (modal.data?.id) {
            await updateDoc(doc(db, collRef.path, modal.data.id), data);
        } else {
            await addDoc(collRef, { ...data, materias: [] });
        }
        setModal({ isOpen: false });
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro?') && cicloActivoId) {
            await deleteDoc(doc(db, `ciclos/${cicloActivoId}/grupos`, id));
        }
    };
    
    const handleSaveAsignacion = async (materiasAsignadas) => {
        if (modal.data?.id && cicloActivoId) {
            const docRef = doc(db, `ciclos/${cicloActivoId}/grupos`, modal.data.id);
            await updateDoc(docRef, { materias: materiasAsignadas });
        }
        setModal({ isOpen: false });
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <AsignarMateriasModal
                isOpen={modal.type === 'asignar'}
                onClose={handleSaveAsignacion}
                grupo={modal.data}
                materias={materias}
            />
            {/* Aquí deberías crear y mostrar un modal para Añadir/Editar Grupo */}

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-primary">Gestión de Grupos</h3>
                <button className="bg-primary text-white px-4 py-2 rounded-lg">Añadir Grupo</button>
            </div>
            
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-3 px-6 text-left">Nombre</th>
                        <th className="py-3 px-6 text-left">Carrera</th>
                        <th className="py-3 px-6 text-left">Cuatri.</th>
                        <th className="py-3 px-6 text-left">Turno</th>
                        <th className="py-3 px-6 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {grupos.map(g => (
                        <tr key={g.id}>
                            <td className="py-4 px-6">{g.nombre}</td>
                            <td className="py-4 px-6">{carreras.find(c => c.id === g.carreraId)?.nombre || 'N/A'}</td>
                            <td className="py-4 px-6">{g.cuatrimestre}</td>
                            <td className="py-4 px-6 capitalize">{g.turno}</td>
                            <td className="py-4 px-6 space-x-2">
                                <button onClick={() => setModal({ isOpen: true, data: g, type: 'asignar' })} className="text-green-600 hover:underline">Materias</button>
                                <button className="text-blue-600 hover:underline">Editar</button>
                                <button onClick={() => handleDelete(g.id)} className="text-red-600 hover:underline">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}