
import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('fpro_users') || '[]');

    if (isLogin) {
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
        onClose();
      } else {
        setError('Credenziali non valide');
      }
    } else {
      if (users.some((u: any) => u.email === email)) {
        setError('Email già registrata');
        return;
      }
      const newUser = { id: Date.now().toString(), email, password, name };
      users.push(newUser);
      localStorage.setItem('fpro_users', JSON.stringify(users));
      onLogin(newUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300 border-4 border-slate-900">
        <div className="p-8 flex justify-between items-center border-b-2 border-slate-100 bg-slate-50/80">
          <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">{isLogin ? 'Bentornato' : 'Nuovo Account'}</h2>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-200 rounded-full transition-all active:scale-90">
            <X className="w-6 h-6 text-slate-950" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-4 bg-red-100 text-red-900 text-sm rounded-2xl border-2 border-red-200 font-black flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5 uppercase tracking-widest">Nome Completo</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none text-slate-950 font-black placeholder:text-slate-400 transition-all"
                  placeholder="Esempio: Mario Rossi"
                />
                <UserIcon className="absolute left-4 top-4.5 w-5 h-5 text-indigo-600" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5 uppercase tracking-widest">Email di Lavoro</label>
            <div className="relative">
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none text-slate-950 font-black placeholder:text-slate-400 transition-all"
                placeholder="mario@esempio.it"
              />
              <Mail className="absolute left-4 top-4.5 w-5 h-5 text-indigo-600" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5 uppercase tracking-widest">Password</label>
            <div className="relative">
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none text-slate-950 font-black placeholder:text-slate-400 transition-all"
                placeholder="••••••••"
              />
              <Lock className="absolute left-4 top-4.5 w-5 h-5 text-indigo-600" />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 mt-6 active:scale-95"
          >
            {isLogin ? 'Accedi Ora' : 'Registrati Gratis'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="p-8 bg-slate-50 text-center text-sm text-slate-700 border-t-2 border-slate-100">
          {isLogin ? (
            <p className="font-bold">Non hai un account? <button onClick={() => setIsLogin(false)} className="text-indigo-600 font-black hover:underline ml-1 uppercase text-xs tracking-tighter">Iscriviti</button></p>
          ) : (
            <p className="font-bold">Sei già dei nostri? <button onClick={() => setIsLogin(true)} className="text-indigo-600 font-black hover:underline ml-1 uppercase text-xs tracking-tighter">Fai Login</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
