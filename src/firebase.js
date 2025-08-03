// Importa las funciones que necesitas de los SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
// No necesitamos getAnalytics por ahora, pero puedes añadirlo si lo usas en el futuro

// Tu configuración web de Firebase (esta es la tuya)
const firebaseConfig = {
  apiKey: "AIzaSyAq2nPWqB5qv2bYa6p7j9Ng4RQLGJiBvlU",
  authDomain: "horarios-80e75.firebaseapp.com",
  projectId: "horarios-80e75",
  storageBucket: "horarios-80e75.appspot.com",
  messagingSenderId: "388049700689",
  appId: "1:388049700689:web:f575d4db7697bea6c37570",
  measurementId: "G-FL4FLEX5KB"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// --- LÍNEAS AÑADIDAS ---
// Inicializamos cada servicio de Firebase que usaremos y lo exportamos
// para que otros archivos (como AuthContext) puedan importarlos.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);