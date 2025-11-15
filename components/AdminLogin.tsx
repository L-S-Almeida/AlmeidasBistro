import React, { useState } from 'react';
import { Lock, Mail, AlertTriangle, UserPlus, LogIn } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    // MODO TESTE (Sem Firebase)
    if (!auth) {
      setTimeout(() => {
        if (email === 'admin@admin.com' && password === 'admin') {
           onLoginSuccess();
        } else {
           setError('Firebase não conectado. Cole suas chaves no arquivo firebase.ts');
        }
        setIsLoading(false);
      }, 800);
      return;
    }

    // MODO REAL (Com Firebase)
    try {
      if (isRegistering) {
        // Criar conta
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMsg('Conta criada com sucesso! Você já pode entrar.');
        setIsRegistering(false); // Volta para tela de login
      } else {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error(err);
      let msg = 'Ocorreu um erro.';
      
      // Tratamento de erros comuns do Firebase
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Email ou senha incorretos.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Este email já está cadastrado.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Formato de email inválido.';
      }
      
      setError(msg);
    } finally {
      if (auth) setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full transition-all duration-500">
                {isRegistering ? (
                  <UserPlus className="w-8 h-8 text-primary" />
                ) : (
                  <Lock className="w-8 h-8 text-primary" />
                )}
            </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {isRegistering ? 'Criar Conta Lojista' : 'Área do Lojista'}
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          {isRegistering ? 'Cadastre-se para gerenciar seu cardápio' : 'Entre para editar produtos e configurações'}
        </p>
        
        {!auth && (
            <div className="mb-6 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg text-sm flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold mb-1">Falta Configurar</p>
                    <p className="opacity-90">
                        Para entrar, você precisa configurar o Firebase corretamente no arquivo <code className="bg-orange-100 px-1 rounded">firebase.ts</code>.
                    </p>
                </div>
            </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center font-medium animate-in fade-in">
            {successMsg}
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
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                placeholder="seu@email.com"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
              placeholder={isRegistering ? "Crie uma senha forte" : "Sua senha"}
              required
            />
            {error && <p className="text-red-500 text-sm mt-2 font-medium animate-pulse">{error}</p>}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-primary text-white font-bold py-3 rounded-lg transition flex justify-center items-center gap-2
                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'}`}
          >
            {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <>
                  {isRegistering ? 'Cadastrar' : 'Entrar'}
                  {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
                </>
            )}
          </button>
          
          {/* Toggle Login/Register */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setSuccessMsg('');
              }}
              className="text-sm text-primary hover:text-red-800 font-medium transition"
            >
              {isRegistering ? 'Já tem uma conta? Faça Login' : 'Primeiro acesso? Crie sua conta'}
            </button>
          </div>

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