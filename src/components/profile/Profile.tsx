import React, { useState } from 'react';
import { User, Lock, Save, AlertCircle } from 'lucide-react';
import { Member } from '../../types';
import { Card } from '../ui/Card';
import { toast } from 'sonner';

interface ProfileProps {
  user: Member;
  onUpdateUser: (user: Member) => void;
}

export const Profile = ({ user, onUpdateUser }: ProfileProps) => {
  const [name, setName] = useState(user.name);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch('/api/members/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name,
          password: newPassword || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        onUpdateUser(data.user);
        toast.success('Perfil atualizado com sucesso!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error || 'Erro ao atualizar perfil.');
      }
    } catch (error) {
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 bg-lodge-green/10 rounded-2xl flex items-center justify-center text-lodge-green">
          <User size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>
          <p className="text-slate-500">Gerencie suas informações pessoais</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Informações Pessoais">
          <div className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">CIM (Não alterável)</label>
              <input 
                type="text" 
                value={user.cim} 
                disabled 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Segurança">
          <div className="space-y-4 mt-6">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start space-x-3">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-amber-800">
                Deixe os campos de senha em branco se não desejar alterá-la.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={isUpdating}
            className="flex items-center space-x-2 px-8 py-4 bg-lodge-green text-white rounded-2xl font-bold hover:bg-lodge-dark hover:scale-105 transition-all shadow-lg shadow-lodge-green/20 border-b-4 border-lodge-gold disabled:opacity-50 disabled:scale-100"
          >
            <Save size={20} />
            <span>{isUpdating ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
