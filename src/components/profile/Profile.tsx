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
      <div className="flex-items-center space-x-4 mb-8">
        <div className="icon-box bg-slate-100 text-zinc-950">
          <User size={32} />
        </div>
        <div>
          <h1 className="heading-display">Meu Perfil</h1>
          <p className="text-muted">Gerencie suas informações pessoais</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Informações Pessoais">
          <div className="space-y-4 mt-6">
            <div>
              <label className="label-base">CIM (Não alterável)</label>
              <input 
                type="text" 
                value={user.cim} 
                disabled 
                className="input-base bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="label-base">Nome Completo</label>
              <div className="input-icon-wrapper">
                <User className="input-icon" size={18} />
                <input 
                   type="text" 
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   required
                   className="input-with-icon"
                 />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Segurança">
          <div className="space-y-4 mt-6">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex-items-center space-x-3">
              <AlertCircle className="text-amber-600 shrink-0" size={18} />
              <p className="text-sm text-amber-800">
                Deixe os campos de senha em branco se não desejar alterá-la.
              </p>
            </div>
            
            <div>
              <label className="label-base">Nova Senha</label>
              <div className="input-icon-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="input-with-icon"
                />
              </div>
            </div>
            
            <div>
              <label className="label-base">Confirmar Nova Senha</label>
              <div className="input-icon-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-with-icon"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={isUpdating}
            className="btn-primary"
          >
            <Save size={20} />
            <span>{isUpdating ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
