import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from '../components/common/Modal';

// Componente para el modal de Disponibilidad
const DisponibilidadModal = ({ isOpen, onClose, profesor, config }) => {
    const [disponibilidad, setDisponibilidad] = useState({});

    useEffect(() => {
        if (profesor) setDisponibilidad(profesor.disponibilidad || {});
    }, [profesor]);

    if (!isOpen) return null;

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const bloques = [...(config?.bloques?.matutino || []), ...(config?.bloques?.vespertino || [])];

    const handleCheck = (key) => {
        setDisponibilidad(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        // La función para guardar se pasa como prop desde el componente principal
        onClose(disponibilidad);
    };

    return (
        <Modal isOpen={isOpen} onClose={() => onClose(null)} title={`Disponibilidad de ${profesor.nombre}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full text-center text-sm">
                    <thead>
                        <tr>
                            <th className="p-2 border">Hora</th>
                            {dias.map(d => <th key={d} className="p-2 border">{d}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {bloques.map((bloque, bIdx) => (
                            <tr key={bIdx}>
                                <td className="p-2 border font-medium">{bloque}</td>
                                {dias.map((_, dIdx) => {
                                    const key = `${dIdx}-${bIdx}`;
                                    return (
                                        <td key={key} className="p-2 border">
                                            <input type="checkbox" checked={!!disponibilidad[key]} onChange={() => handleCheck(key)} />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 <button onClick={handleSave} className="w-full mt-4 py-2 bg-primary text-white rounded">Guardar Disponibilidad</button>
            </div>
        </Modal>
    );
};


export default function ProfesoresPage() {
    const { cicloActivoId, profesores, carreras, materias, configuracion } = useData();
    const [modal, setModal] = useState({ isOpen: false, data: null, type: '' });

    const handleSave = async (data) => {
        if (!cicloActivoId) return;
        const collRef = collection(db, `ciclos/${cicloActivoId}/profesores`);
        if (modal.data?.id) { // Actualizar
            await updateDoc(doc(db, collRef.path, modal.data.id), data);
        } else { // Crear
            await addDoc(collRef, { ...data, materias: [], disponibilidad: {} });
        }
        setModal({ isOpen: false, data: null, type: '' });
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro?') && cicloActivoId) {
            await deleteDoc(doc(db, `ciclos/${cicloActivoId}/profesores`, id));
        }
    };

    const handleSaveDisponibilidad = async (disponibilidad) => {
        if (disponibilidad && modal.data?.id) {
            await updateDoc(doc(db, `ciclos/${cicloActivoId}/profesores`, modal.data.id), { disponibilidad });
        }
         setModal({ isOpen: false, data: null, type: '' });
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            {/* Aquí irían los modales. Ejemplo para el de Disponibilidad */}
            <DisponibilidadModal 
                isOpen={modal.type === 'disponibilidad'}
                onClose={handleSaveDisponibilidad}
                profesor={modal.data}
                config={configuracion}
            />
            {/* Deberías crear modales similares para 'Add/Edit' y 'Asignar Materias' */}
            
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-primary">Gestión de Profesores</h3>
                <button onClick={() => setModal({ isOpen: true, data: null, type: 'edit' })} className="bg-primary text-white px-4 py-2 rounded-lg">Añadir Profesor</button>
            </div>
            
            <table className="min-w-full bg-white">
                 <thead className="bg-gray-100">
                    <tr>
                        <th className="py-3 px-6 text-left">Nombre</th>
                        <th className="py-3 px-6 text-left">Tipo</th>
                        <th className="py-3 px-6 text-left">Carrera</th>
                        <th className="py-3 px-6 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {profesores.map(p => {
                        const carrera = carreras.find(c => c.id === p.carreraId)?.nombre || 'N/A';
                        return (
                            <tr key={p.id}>
                                <td className="py-4 px-6">{p.nombre}</td>
                                <td className="py-4 px-6">{p.tipo}</td>
                                <td className="py-4 px-6">{carrera}</td>
                                <td className="py-4 px-6 space-x-2">
                                    <button onClick={() => setModal({ isOpen: true, data: p, type: 'disponibilidad' })} className="text-yellow-600 hover:underline">Disponibilidad</button>
                                    <button className="text-green-600 hover:underline">Materias</button>
                                    <button className="text-blue-600 hover:underline">Editar</button>
                                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Eliminar</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}