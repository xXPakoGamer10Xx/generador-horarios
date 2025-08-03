import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
// --- CORRECCIÓN AQUÍ ---
// Se cambió ../firebase por ../firebase.js
import { auth, db } from '../firebase.js';
import { doc, getDoc, setDoc, getDocs, collection, query } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);
    const logout = () => signOut(auth);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserRole(userDoc.data().role);
                } else {
                    // Lógica para asignar rol 'admin' al primer usuario registrado
                    const usersQuery = query(collection(db, "users"));
                    const usersSnapshot = await getDocs(usersQuery);
                    const role = usersSnapshot.empty ? 'admin' : 'user';
                    await setDoc(userDocRef, { email: user.email, role: role });
                    setUserRole(role);
                }
            } else {
                setUserRole(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = { currentUser, userRole, loading, login, register, logout };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};