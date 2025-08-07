import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    collection, 
    onSnapshot, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    setDoc, 
    getDoc,
    getDocs,
    query,
    where
} from 'firebase/firestore';
import { db } from '../firebase.js';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [carreras, setCarreras] = useState([]);
    const [configuracion, setConfiguracion] = useState({ 
        bloques: { 
            matutino: ['07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00'], 
            vespertino: ['14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'] 
        } 
    });
    
    // Datos principales (sin ciclos para simplificar como el HTML original)
    const [profesores, setProfesores] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [horarioGenerado, setHorarioGenerado] = useState({});

    const [loading, setLoading] = useState(true);

    // Inicializar configuración por defecto si no existe
    const initializeConfig = async () => {
        const configRef = doc(db, 'configuracion', 'main');
        const configSnap = await getDoc(configRef);
        
        if (!configSnap.exists()) {
            await setDoc(configRef, {
                bloques: {
                    matutino: ['07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00'],
                    vespertino: ['14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00']
                }
            });
        }
    };

    // Efecto para cargar todos los datos
    useEffect(() => {
        setLoading(true);
        initializeConfig();

        // Listener para carreras
        const unsubCarreras = onSnapshot(collection(db, 'carreras'), (snapshot) => {
            setCarreras(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Listener para configuración
        const unsubConfig = onSnapshot(doc(db, 'configuracion', 'main'), (docSnap) => {
            if (docSnap.exists()) {
                setConfiguracion(docSnap.data());
            }
            setLoading(false);
        });

        // Listeners para datos principales
        const unsubProfesores = onSnapshot(collection(db, 'profesores'), (snap) => {
            setProfesores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        
        const unsubMaterias = onSnapshot(collection(db, 'materias'), (snap) => {
            setMaterias(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        
        const unsubGrupos = onSnapshot(collection(db, 'grupos'), (snap) => {
            setGrupos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        
        const unsubHorario = onSnapshot(doc(db, 'horarios', 'horarioGenerado'), (docSnap) => {
            setHorarioGenerado(docSnap.exists() ? docSnap.data() : {});
        });

        return () => {
            unsubCarreras();
            unsubConfig();
            unsubProfesores();
            unsubMaterias();
            unsubGrupos();
            unsubHorario();
        };
    }, []);

    // CRUD Functions
    const addCarrera = async (carreraData) => {
        return await addDoc(collection(db, 'carreras'), carreraData);
    };

    const updateCarrera = async (id, carreraData) => {
        await updateDoc(doc(db, 'carreras', id), carreraData);
    };

    const deleteCarrera = async (id) => {
        await deleteDoc(doc(db, 'carreras', id));
    };

    const addProfesor = async (profesorData) => {
        return await addDoc(collection(db, 'profesores'), profesorData);
    };

    const updateProfesor = async (id, profesorData) => {
        await updateDoc(doc(db, 'profesores', id), profesorData);
    };

    const deleteProfesor = async (id) => {
        await deleteDoc(doc(db, 'profesores', id));
    };

    const clearProfesores = async () => {
        const snapshot = await getDocs(collection(db, 'profesores'));
        const batch = [];
        snapshot.docs.forEach(doc => {
            batch.push(deleteDoc(doc.ref));
        });
        await Promise.all(batch);
    };

    const addMateria = async (materiaData) => {
        return await addDoc(collection(db, 'materias'), materiaData);
    };

    const updateMateria = async (id, materiaData) => {
        await updateDoc(doc(db, 'materias', id), materiaData);
    };

    const deleteMateria = async (id) => {
        await deleteDoc(doc(db, 'materias', id));
    };

    const clearMaterias = async () => {
        const snapshot = await getDocs(collection(db, 'materias'));
        const batch = [];
        snapshot.docs.forEach(doc => {
            batch.push(deleteDoc(doc.ref));
        });
        await Promise.all(batch);
    };

    const addGrupo = async (grupoData) => {
        return await addDoc(collection(db, 'grupos'), grupoData);
    };

    const updateGrupo = async (id, grupoData) => {
        await updateDoc(doc(db, 'grupos', id), grupoData);
    };

    const deleteGrupo = async (id) => {
        await deleteDoc(doc(db, 'grupos', id));
    };

    const saveSchedule = async (schedule) => {
        await setDoc(doc(db, 'horarios', 'horarioGenerado'), schedule);
    };

    const updateConfig = async (configData) => {
        await updateDoc(doc(db, 'configuracion', 'main'), configData);
    };

    const value = {
        loading,
        carreras,
        configuracion,
        profesores,
        materias,
        grupos,
        horarioGenerado,
        // CRUD functions
        addCarrera,
        updateCarrera,
        deleteCarrera,
        addProfesor,
        updateProfesor,
        deleteProfesor,
        clearProfesores,
        addMateria,
        updateMateria,
        deleteMateria,
        clearMaterias,
        addGrupo,
        updateGrupo,
        deleteGrupo,
        saveSchedule,
        updateConfig,
        updateConfiguracion: updateConfig,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};