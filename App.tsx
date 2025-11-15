import React, { useState, useEffect } from 'react';
import { CustomerView } from './components/CustomerView';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { Product, StoreSettings, ViewState } from './types';
import { DEFAULT_SETTINGS, INITIAL_MENU } from './constants';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';

const App = () => {
  // State for routing
  const [currentView, setCurrentView] = useState<ViewState>('CUSTOMER');

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  
  // Loading States
  // Inicia true para evitar flash de "Loja Fechada" ou conteúdo vazio
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  
  // Combina os estados de carregamento
  const isLoading = isMenuLoading || isSettingsLoading;
  
  // Auth State
  const [user, setUser] = useState<any>(null);

  // 0. Handle URL Routing (Secret Admin Access)
  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '');
    if (path === '/enterprise_bistro_almeidas_admin') {
      setCurrentView('ADMIN_LOGIN');
    }
  }, []);

  // 1. Handle Authentication State
  useEffect(() => {
    if (!auth) return; 

    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          
          const path = window.location.pathname.replace(/\/$/, '');
          if (currentUser && path === '/enterprise_bistro_almeidas_admin') {
            setCurrentView('ADMIN_DASHBOARD');
          }
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Erro na autenticação:", error);
    }
  }, []);

  // 2. Handle Settings Loading (Realtime from Firestore)
  useEffect(() => {
    if (!db) {
      const savedSettings = localStorage.getItem('almeidas_settings');
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }
      setIsSettingsLoading(false);
      return;
    }

    const settingsRef = doc(db, 'storeSettings', 'config');
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...docSnap.data() as StoreSettings });
      }
      setIsSettingsLoading(false);
    }, (error) => {
        console.warn("Erro ao carregar configurações:", error);
        setIsSettingsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. Handle Firestore Realtime Products with Fallback
  useEffect(() => {
    if (!db) {
      console.log("Modo Demo: Carregando menu inicial.");
      setProducts(INITIAL_MENU);
      setIsMenuLoading(false);
      return;
    }

    try {
      const unsubscribe = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
          const loadedProducts: Product[] = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
          } as Product));
          
          setProducts(loadedProducts);
          setIsMenuLoading(false);
      }, (error) => {
          console.warn("Erro ao conectar com Firestore, usando fallback:", error);
          setProducts(INITIAL_MENU);
          setIsMenuLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.warn("Erro crítico Firestore, usando fallback:", error);
      setProducts(INITIAL_MENU);
      setIsMenuLoading(false);
    }
  }, []);


  // --- Handlers ---

  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    // Optimistic Update
    setSettings(newSettings);
    
    if (!db) {
        localStorage.setItem('almeidas_settings', JSON.stringify(newSettings));
        return;
    }

    try {
        const settingsRef = doc(db, 'storeSettings', 'config');
        await setDoc(settingsRef, newSettings, { merge: true });
    } catch (e) {
        console.error("Erro ao salvar configurações no servidor", e);
        alert("Erro de conexão: As configurações podem não ter sido salvas para os clientes.");
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setCurrentView('CUSTOMER');
    window.history.pushState({}, '', '/');
  };

  // --- Firestore CRUD (Com Fallback) ---

  const handleAddProduct = async (product: Omit<Product, 'id'>) => {
    if (!db) {
      const newId = Math.random().toString(36).substr(2, 9);
      const newProduct = { ...product, id: newId };
      setProducts(prev => [...prev, newProduct]);
      return;
    }
    try {
      await addDoc(collection(db, 'menuItems'), product);
    } catch (e) {
      alert("Erro ao salvar: Verifique a configuração do Firebase.");
    }
  };

  const handleEditProduct = async (id: string, product: Partial<Product>) => {
    if (!db) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...product } : p));
      return;
    }
    try {
      const productRef = doc(db, 'menuItems', id);
      await updateDoc(productRef, product);
    } catch (e) {
      alert("Erro ao editar: Verifique a configuração do Firebase.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!db) {
       if (window.confirm('Tem certeza que deseja excluir este produto? (Modo Teste)')) {
          setProducts(prev => prev.filter(p => p.id !== id));
       }
       return;
    }
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteDoc(doc(db, 'menuItems', id));
      } catch (e) {
        alert("Erro ao excluir: Verifique a configuração do Firebase.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] text-[#D93F3E] animate-in fade-in duration-500">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#D93F3E] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#D93F3E] rounded-full"></div>
            </div>
        </div>
        <span className="font-bold mt-4 tracking-wide text-sm uppercase">Carregando Almeidas Bistrô...</span>
      </div>
    );
  }

  return (
    <>
      {currentView === 'CUSTOMER' && (
        <CustomerView 
          products={products} 
          settings={settings} 
          onOpenAdmin={() => setCurrentView('ADMIN_LOGIN')}
        />
      )}

      {currentView === 'ADMIN_LOGIN' && (
        <AdminLogin 
          onLoginSuccess={() => setCurrentView('ADMIN_DASHBOARD')} 
          onCancel={() => {
            setCurrentView('CUSTOMER');
            window.history.pushState({}, '', '/');
          }}
        />
      )}

      {currentView === 'ADMIN_DASHBOARD' && (
        <AdminDashboard
          products={products}
          settings={settings}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateSettings={handleUpdateSettings}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default App;