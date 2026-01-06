
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login para o MVP
    if (email === 'admin@tree.com' && password === 'admin') {
      onLogin({ id: '1', name: 'Administrador', email, role: 'ADMIN' });
    } else {
      alert("Credenciais de teste: admin@tree.com / admin");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -ml-48 -mb-48"></div>

      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 md:p-12 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-block bg-slate-900 text-white p-4 rounded-3xl mb-6 shadow-xl border border-slate-700">
             <span className="text-3xl font-black tracking-tighter">TREE <span className="text-blue-400">BJJ</span></span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Acesso Restrito</h1>
          <p className="text-slate-400 mt-2 font-medium">Gestão de Tatame</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-mail</label>
              <input 
                type="email" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-semibold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                placeholder="admin@tree.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Senha</label>
              <input 
                type="password" 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-semibold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98]"
          >
            ENTRAR NO SISTEMA
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400 font-bold uppercase tracking-widest opacity-50">
          © 2024 TREE BRAZILIAN JIU JITSU
        </p>
      </div>
    </div>
  );
};

export default Login;
