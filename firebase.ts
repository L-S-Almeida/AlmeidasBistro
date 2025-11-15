// @ts-ignore
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

let app = null;
let auth = null;
let db = null;

// Verifica se a configuração existe antes de tentar inicializar
// Isso previne que o site quebre (tela branca) se o arquivo .env não estiver preenchido
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase conectado com sucesso.");
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
    console.warn("O site rodará em modo offline/demo.");
  }
} else {
  console.warn("⚠️ Configurações do Firebase não encontradas.");
  console.warn("Crie um arquivo .env na raiz do projeto com suas chaves do Firebase.");
  console.warn("O site rodará em modo offline/demo por enquanto.");
}

export { auth, db };