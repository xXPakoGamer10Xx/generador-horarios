import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
// --- CORRECCIÓN AQUÍ ---
// Se cambió ../firebase por ../firebase.js
import { db } from '../firebase.js';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [ciclos, setCiclos] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [configuracion, setConfiguracion] = useState({ bloques: {} });
    
    const [cicloActivoId, setCicloActivoId] = useState(null);
    
    // Datos que dependen del ciclo activo
    const [profesores, setProfesores] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [horarioGenerado, setHorarioGenerado] = useState({});

    const [loading, setLoading] = useState(true);

    // Efecto para cargar datos globales (ciclos, carreras, config)
    useEffect(() => {
        setLoading(true);
        const unsubCiclos = onSnapshot(collection(db, 'ciclos'), (snapshot) => {
            const ciclosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCiclos(ciclosData);
            // Si no hay ciclo activo, selecciona el primero
            if (!cicloActivoId && ciclosData.length > 0) {
                setCicloActivoId(ciclosData[0].id);
            }
            setLoading(false);
        });

        // Listener para carreras
        const unsubCarreras = onSnapshot(collection(db, 'carreras'), (snapshot) => {
            setCarreras(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Listener para configuración
        const unsubConfig = onSnapshot(doc(db, 'configuracion', 'main'), (docSnap) => {
            if (docSnap.exists()) {
                setConfiguracion(docSnap.data());
            }
        });

        return () => { // Función de limpieza
            unsubCiclos();
            unsubCarreras();
            unsubConfig();
        };
    }, []); // Se ejecuta solo una vez

    // Efecto para cargar los datos DEL CICLO ACTIVO
    useEffect(() => {
        if (!cicloActivoId) return;

        // Listeners para las subcolecciones del ciclo activo
        const unsubProfesores = onSnapshot(collection(db, `ciclos/${cicloActivoId}/profesores`), (snap) => {
            setProfesores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        const unsubMaterias = onSnapshot(collection(db, `ciclos/${cicloActivoId}/materias`), (snap) => {
            setMaterias(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        const unsubGrupos = onSnapshot(collection(db, `ciclos/${cicloActivoId}/grupos`), (snap) => {
            setGrupos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        const unsubHorario = onSnapshot(doc(db, `ciclos/${cicloActivoId}/horarios/horarioGenerado`), (docSnap) => {
            setHorarioGenerado(docSnap.exists() ? docSnap.data() : {});
        });

        // Limpiamos los listeners cuando el ciclo cambie o el componente se desmonte
        return () => {
            unsubProfesores();
            unsubMaterias();
            unsubGrupos();
            unsubHorario();
        };
    }, [cicloActivoId]); // Se re-ejecuta cada vez que cicloActivoId cambia

    const value = {
        loading,
        ciclos,
        carreras,
        configuracion,
        cicloActivoId,
        setCicloActivoId,
        profesores,
        materias,
        grupos,
        horarioGenerado,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};