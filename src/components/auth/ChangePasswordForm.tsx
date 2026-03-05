import React from 'react';
import { UserCheck } from 'lucide-react';

export const ChangePasswordForm = ({ onChangePassword }: { onChangePassword: (e: React.FormEvent<HTMLFormElement>) => void }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
    <div className="card-base w-full max-w-md p-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserCheck size={32} />
        </div>
        <h2 className="heading-display text-2xl">Primeiro Acesso</h2>
        <p className="text-muted text-sm mt-2">Para sua segurança, você deve cadastrar uma nova senha pessoal.</p>
      </div>
      <form onSubmit={onChangePassword} className="space-y-6">
        <div>
          <label className="label-base">Nova Senha</label>
          <input 
            name="newPassword" 
            type="password" 
            required 
            className="input-base" 
          />
        </div>
        <div>
          <label className="label-base">Confirmar Nova Senha</label>
          <input 
            name="confirmPassword" 
            type="password" 
            required 
            className="input-base" 
          />
        </div>
        <button type="submit" className="btn-primary w-full justify-center">
          Atualizar Senha
        </button>
      </form>
    </div>
  </div>
);
