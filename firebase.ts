import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// Configurações do seu projeto Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicializa o Firebase apenas se as configurações existirem
let app = null;
let auth = null;
let db = null;
let storage = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app); // ← STORAGE ADICIONADO AQUI
    console.log("✅ Firebase conectado com sucesso - Auth, Firestore e Storage");
  } catch (error) {
    console.error("❌ Erro ao inicializar Firebase:", error);
    console.warn("O site rodará em modo offline/demo.");
  }
} else {
  console.warn("⚠️ Configurações do Firebase não encontradas.");
  console.warn("Crie um arquivo .env na raiz do projeto com suas chaves do Firebase.");
  console.warn("O site rodará em modo offline/demo por enquanto.");
}

// Exportações
export { app, auth, db, storage };