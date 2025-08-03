import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ConfiguracionPage() {
    const { configuracion } = useData();
    const [bloques, setBloques] = useState({ matutino: [], vespertino: [] });
    const [nuevoBloqueM, setNuevoBloqueM] = useState('');
    const [nuevoBloqueV, setNuevoBloqueV] = useState('');

    useEffect(() => {
        if (configuracion?.bloques) {
            setBloques(configuracion.bloques);
        }
    }, [configuracion]);

    const handleSave = async () => {
        await updateDoc(doc(db, 'configuracion', 'main'), { bloques });
        alert('Configuración guardada');
    };

    const addBloque = (turno) => {
        const nuevo = turno === 'matutino' ? nuevoBloqueM : nuevoBloqueV;
        if (!nuevo.match(/^\d{2}:\d{2}-\d{2}:\d{2}$/)) {
            alert('Formato inválido. Use HH:MM-HH:MM');
            return;
        }
        setBloques(prev => ({
            ...prev,
            [turno]: [...prev[turno], nuevo]
        }));
        turno === 'matutino' ? setNuevoBloqueM('') : setNuevoBloqueV('');
    };
    
    const deleteBloque = (turno, index) => {
        setBloques(prev => ({
            ...prev,
            [turno]: prev[turno].filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-3xl font-bold mb-6 text-primary">Configuración de Bloques Horarios</h3>
            <div className="grid md:grid-cols-2 gap-8">
                {['matutino', 'vespertino'].map(turno => (
                    <div key={turno}>
                        <h4 className="text-xl font-semibold mb-4 capitalize">{turno}</h4>
                        <div className="space-y-2 mb-4">
                            {bloques[turno]?.map((b, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                    <span>{b}</span>
                                    <button onClick={() => deleteBloque(turno, i)} className="text-red-500 font-bold">&times;</button>
                                </div>
                            ))}
                        </div>
                        <div className="flex space-x-2">
                             <input 
                                type="text"
                                value={turno === 'matutino' ? nuevoBloqueM : nuevoBloqueV}
                                onChange={(e) => turno === 'matutino' ? setNuevoBloqueM(e.target.value) : setNuevoBloqueV(e.target.value)}
                                placeholder="07:00-08:00"
                                className="w-full p-2 border rounded"
                             />
                             <button onClick={() => addBloque(turno)} className="bg-primary text-white px-4 rounded">Añadir</button>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={handleSave} className="w-full mt-8 py-3 bg-green-600 text-white font-bold rounded-lg">Guardar Toda la Configuración</button>
        </div>
    );
}