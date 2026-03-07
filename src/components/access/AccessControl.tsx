import React, { useState } from 'react';
import { Shield, Check, X, Lock, Users } from 'lucide-react';
import { Member, Tab } from '../../types';
import { Card } from '../ui/Card';
import { TAB_LABELS } from '../../constants';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface AccessControlProps {
  members: Member[];
  onUpdatePermissions: (memberId: number, permissions: string[]) => Promise<void>;
}

export const AccessControl = ({ members, onUpdatePermissions }: AccessControlProps) => {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedMember = members.find(m => m.id === selectedMemberId);
  const availableTabs: Tab[] = ['dashboard', 'treasury', 'attendance', 'members', 'settings', 'profile', 'access-control'];

  const handleTogglePermission = async (tab: string) => {
    if (!selectedMember) return;

    const currentPermissions = selectedMember.permissions || [];
    let newPermissions: string[];

    if (currentPermissions.includes(tab)) {
      newPermissions = currentPermissions.filter(p => p !== tab);
    } else {
      newPermissions = [...currentPermissions, tab];
    }

    setLoading(true);
    try {
      await onUpdatePermissions(selectedMember.id, newPermissions);
      toast.success(`Permissões de ${selectedMember.name} atualizadas.`);
    } catch (error) {
      toast.error("Erro ao atualizar permissões.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Member List */}
        <div className="lg:col-span-1">
          <Card title="Obreiros" subtitle="Selecione um obreiro para gerenciar">
            <div className="mt-6 space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {members.map(member => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={cn(
                    "w-full flex-items-center p-4 rounded-2xl transition-all",
                    selectedMemberId === member.id 
                      ? 'bg-zinc-950 text-white shadow-lg shadow-zinc-950/20' 
                      : 'bg-white hover:bg-slate-50 border border-slate-100'
                  )}
                >
                  <div className={cn(
                    "icon-box w-10 h-10 rounded-xl",
                    selectedMemberId === member.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                  )}>
                    <Users size={20} />
                  </div>
                  <div className="ml-4 text-left min-w-0">
                    <p className="text-sm font-bold truncate">{member.name}</p>
                    <p className={cn(
                      "text-xs-bold-uppercase",
                      selectedMemberId === member.id ? 'text-white/70' : 'text-slate-400'
                    )}>
                      {member.role || member.degree}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-2">
          {selectedMember ? (
            <Card 
              title={`Permissões: ${selectedMember.name}`} 
              subtitle="Defina quais abas este obreiro pode acessar"
            >
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {availableTabs.map(tab => {
                  const hasAccess = selectedMember.permissions?.includes(tab);
                  return (
                    <button
                      key={tab}
                      disabled={loading}
                      onClick={() => handleTogglePermission(tab)}
                      className={cn(
                        "flex-between p-5 rounded-2xl border-2 transition-all",
                        hasAccess 
                          ? 'border-zinc-950 bg-zinc-950/5 text-zinc-950' 
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                      )}
                    >
                      <div className="flex-items-center space-x-4">
                        <div className={cn(
                          "icon-box w-10 h-10 rounded-xl",
                          hasAccess ? 'bg-zinc-950 text-white' : 'bg-slate-200 text-slate-500'
                        )}>
                          {hasAccess ? <Check size={20} /> : <Lock size={20} />}
                        </div>
                        <span className="font-bold text-sm">{TAB_LABELS[tab]}</span>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full flex-center",
                        hasAccess ? 'bg-zinc-950 text-white' : 'bg-slate-200 text-slate-500'
                      )}>
                        {hasAccess ? <Check size={14} /> : <X size={14} />}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-10 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex-items-center space-x-4">
                <div className="icon-box bg-blue-100 text-blue-600">
                  <Shield size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Dica de Segurança</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    As alterações são salvas instantaneamente. O obreiro precisará recarregar a página ou fazer login novamente para que as novas permissões entrem em vigor.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full flex-center flex-col p-12 bg-white rounded-[40px] border-2 border-dashed border-slate-200 text-slate-400">
              <Users size={48} className="mb-4 opacity-20" />
              <p className="font-bold">Selecione um obreiro à esquerda</p>
              <p className="text-sm">para gerenciar suas permissões de acesso</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
