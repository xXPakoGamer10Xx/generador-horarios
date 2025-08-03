import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ScheduleGrid from '../components/common/ScheduleGrid'; // Importamos el componente de la tabla

// Nota: Debes crear esta Cloud Function en tu proyecto de Firebase.
const generateScheduleFunction = httpsCallable(functions, 'generateSchedule');

export default function GeneradorPage() {
    const { cicloActivoId, grupos, profesores, horarioGenerado, configuracion } = useData();
    const [viewType, setViewType] = useState('grupo');
    const [selectedItem, setSelectedItem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scheduleRef = useRef(null); // Ref para el div que se va a exportar

    const handleGenerate = async () => {
        if (!cicloActivoId) {
            alert('Por favor, selecciona un ciclo activo primero.');
            return;
        }
        setIsLoading(true);
        try {
            // Llamamos a la Cloud Function pasándole el ID del ciclo a procesar.
            await generateScheduleFunction({ cicloId: cicloActivoId });
            alert('¡Proceso de generación iniciado! El horario se actualizará en breve.');
        } catch (error) {
            console.error("Error al invocar la Cloud Function:", error);
            alert(`Error: ${error.message}`);
        }
        setIsLoading(false);
    };

    const handleExport = (format) => {
        if (!scheduleRef.current) {
            alert('No hay horario visible para exportar.');
            return;
        }
        html2canvas(scheduleRef.current, { scale: 2 }).then(canvas => {
            if (format === 'png') {
                const link = document.createElement('a');
                link.download = `horario-${viewType}-${selectedItem}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } else if (format === 'pdf') {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'l', unit: 'px', format: [canvas.width, canvas.height] });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`horario-${viewType}-${selectedItem}.pdf`);
            }
        });
    };
    
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg space-y-8">
            <div className="text-center">
                <h3 className="text-3xl font-bold text-primary">Generar y Visualizar Horarios</h3>
                <p className="text-gray-600 mt-2">Usa el botón para generar el horario del ciclo activo.</p>
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !cicloActivoId} 
                    className="mt-4 bg-primary text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Generando...' : '✨ Generar Horario Global'}
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-end p-6 bg-gray-50 rounded-lg">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visualizar por:</label>
                    <select value={viewType} onChange={(e) => { setViewType(e.target.value); setSelectedItem(''); }} className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="grupo">Grupo</option>
                        <option value="profesor">Profesor</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar:</label>
                    <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">-- Elige una opción --</option>
                        {(viewType === 'grupo' ? grupos : profesores).map(item => (
                            <option key={item.id} value={item.id}>{item.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="space-x-2 flex justify-end">
                    <button onClick={() => handleExport('png')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Exportar PNG</button>
                    <button onClick={() => handleExport('pdf')} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Exportar PDF</button>
                </div>
            </div>

            <div className="mt-6">
                <ScheduleGrid
                    ref={scheduleRef} // Pasamos la ref para la exportación
                    viewType={viewType}
                    selectedItemId={selectedItem}
                    horario={horarioGenerado}
                    grupos={grupos}
                    profesores={profesores}
                    config={configuracion}
                />
            </div>
        </div>
    );
}