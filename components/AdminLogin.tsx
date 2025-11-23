import React, { useState } from 'react';
import { Lock, Mail, AlertTriangle, LogIn } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // MODO TESTE (Sem Firebase)
    if (!auth) {
      console.log("Firebase Auth não configurado - Modo Demo");
      setTimeout(() => {
        if (email === 'admin@almeidasbistro.com' && password === 'admin123') {
          onLoginSuccess();
        } else {
          setError('Email ou senha incorretos. Use: admin@almeidasbistro.com / admin123');
        }
        setIsLoading(false);
      }, 800);
      return;
    }

    // MODO REAL (Com Firebase)
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      let msg = 'Ocorreu um erro.';
      
      // Tratamento de erros comuns do Firebase
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Email ou senha incorretos.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Formato de email inválido.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Erro de conexão. Verifique sua internet.';
      }
      
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
                <Lock className="w-8 h-8 text-[#D93F3E]" />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Área do Lojista
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Entre para editar produtos e configurações
        </p>
        
        {!auth && (
            <div className="mb-6 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg text-sm flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold mb-1">Modo Demo Ativo</p>
                    <p className="opacity-90">
                        Use: <strong>admin@almeidasbistro.com</strong> / <strong>admin123</strong>
                    </p>
                </div>
            </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center font-medium animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D93F3E] focus:border-[#D93F3E] outline-none transition"
                placeholder="admin@almeidasbistro.com"
                required
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D93F3E] focus:border-[#D93F3E] outline-none transition"
              placeholder="Sua senha"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#D93F3E] text-white font-bold py-3 rounded-lg transition flex justify-center items-center gap-2
                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'}`}
          >
            {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <>
                  Entrar
                  <LogIn size={18} />
                </>
            )}
          </button>

          <div className="border-t border-gray-100 pt-2">
            <button
                type="button"
                onClick={onCancel}
                className="w-full text-gray-500 font-medium py-2 hover:text-gray-700 transition text-sm"
            >
                Voltar ao Cardápio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};