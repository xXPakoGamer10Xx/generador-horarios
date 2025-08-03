import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { addDoc, deleteDoc, collection, doc } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from '../components/common/Modal'; // Suponiendo que creas un Modal reutilizable

export default function CiclosPage() {
    const { ciclos, carreras, loading } = useData();
    const [isCicloModalOpen, setCicloModalOpen] = useState(false);
    const [isCarreraModalOpen, setCarreraModalOpen] = useState(false);
    const [nombreCiclo, setNombreCiclo] = useState('');
    const [cuatrimestres, setCuatrimestres] = useState('');
    const [nombreCarrera, setNombreCarrera] = useState('');
    
    const handleAddCiclo = async () => {
        if (!nombreCiclo || !cuatrimestres) return;
        await addDoc(collection(db, 'ciclos'), { 
            nombre: nombreCiclo, 
            cuatrimestres: cuatrimestres.split(',').map(s => s.trim()) 
        });
        setCicloModalOpen(false);
        setNombreCiclo('');
        setCuatrimestres('');
    };

    const handleAddCarrera = async () => {
        if (!nombreCarrera) return;
        await addDoc(collection(db, 'carreras'), { nombre: nombreCarrera });
        setCarreraModalOpen(false);
        setNombreCarrera('');
    };

    const handleDelete = async (collectionName, id) => {
        if (window.confirm('¿Estás seguro? Esta acción es irreversible.')) {
            await deleteDoc(doc(db, collectionName, id));
        }
    };
    
    if (loading) return <div>Cargando datos maestros...</div>

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Modal para Ciclos */}
            <Modal isOpen={isCicloModalOpen} onClose={() => setCicloModalOpen(false)} title="Añadir Ciclo">
                <input value={nombreCiclo} onChange={(e) => setNombreCiclo(e.target.value)} placeholder="Nombre (ej. Sept-Dic 2025)" className="w-full p-2 border rounded mb-2"/>
                <input value={cuatrimestres} onChange={(e) => setCuatrimestres(e.target.value)} placeholder="Cuatrimestres (ej. 1,4,7)" className="w-full p-2 border rounded"/>
                <button onClick={handleAddCiclo} className="w-full mt-4 py-2 bg-primary text-white rounded">Guardar</button>
            </Modal>

            {/* Modal para Carreras */}
            <Modal isOpen={isCarreraModalOpen} onClose={() => setCarreraModalOpen(false)} title="Añadir Carrera">
                <input value={nombreCarrera} onChange={(e) => setNombreCarrera(e.target.value)} placeholder="Nombre de la Carrera" className="w-full p-2 border rounded"/>
                <button onClick={handleAddCarrera} className="w-full mt-4 py-2 bg-primary text-white rounded">Guardar</button>
            </Modal>

            {/* Columna de Ciclos */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-primary">Ciclos Académicos</h3>
                    <button onClick={() => setCicloModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg">Añadir</button>
                </div>
                {ciclos.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                        <span>{c.nombre}</span>
                        <button onClick={() => handleDelete('ciclos', c.id)} className="text-red-500">&times;</button>
                    </div>
                ))}
            </div>

            {/* Columna de Carreras */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-primary">Carreras</h3>
                    <button onClick={() => setCarreraModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg">Añadir</button>
                </div>
                {carreras.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                        <span>{c.nombre}</span>
                        <button onClick={() => handleDelete('carreras', c.id)} className="text-red-500">&times;</button>
                    </div>
                ))}
            </div>
        </div>
    );
}