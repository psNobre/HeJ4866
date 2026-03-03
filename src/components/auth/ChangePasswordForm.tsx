import React from 'react';
import { UserCheck } from 'lucide-react';

export const ChangePasswordForm = ({ onChangePassword }: { onChangePassword: (e: React.FormEvent<HTMLFormElement>) => void }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
    <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserCheck size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Primeiro Acesso</h2>
        <p className="text-slate-500 text-sm mt-2">Para sua segurança, você deve cadastrar uma nova senha pessoal.</p>
      </div>
      <form onSubmit={onChangePassword} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nova Senha</label>
          <input 
            name="newPassword" 
            type="password" 
            required 
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Confirmar Nova Senha</label>
          <input 
            name="confirmPassword" 
            type="password" 
            required 
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" 
          />
        </div>
        <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
          Atualizar Senha
        </button>
      </form>
    </div>
  </div>
);
