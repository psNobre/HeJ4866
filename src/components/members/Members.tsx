import React from 'react';
import { Plus, UserPlus, Search, MoreHorizontal, Shield, UserX, Wallet, CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';
import { Member, Transaction } from '../../types';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

const calculateCompliance = (member: Member, transactions: Transaction[]) => {
  if (!member.paysThroughLodge) return 'Isento';
  const startDateStr = member.paymentStartDate || member.initiationDate;
  if (!startDateStr) return 'Sem Data';

  const startDate = new Date(startDateStr);
  const now = new Date();
  
  const monthsSinceStart = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth()) + 1;
  
  const payments = transactions.filter(t => 
    t.memberId === member.id && 
    t.category === 'Mensalidade' && 
    t.type === 'income'
  ).length;

  return payments >= monthsSinceStart ? 'Adimplente' : 'Inadimplente';
};

export const Members = ({ 
  members, 
  transactions,
  onAddMember, 
  onEditMember,
  onToggleDisconnected, 
  onTogglePays 
}: { 
  members: Member[]; 
  transactions: Transaction[];
  onAddMember: () => void;
  onEditMember: (member: Member) => void;
  onToggleDisconnected: (id: number) => void;
  onTogglePays: (id: number) => void;
}) => (
  <div className="space-y-10">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar obreiro por nome ou CIM..." 
          className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all"
        />
      </div>
      <button 
        onClick={onAddMember}
        className="flex items-center justify-center space-x-3 px-8 py-4 bg-lodge-green text-white rounded-2xl font-bold hover:bg-lodge-dark hover:scale-105 transition-all shadow-lg shadow-lodge-green/20 border-b-4 border-lodge-gold"
      >
        <UserPlus size={20} />
        <span>Novo Obreiro</span>
      </button>
    </div>

    <Card title="Quadro de Obreiros" subtitle={`${members.length} membros cadastrados`}>
      <div className="overflow-x-auto mt-10">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-slate-100">
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Obreiro</th>
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Grau / Cargo</th>
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider">CIM</th>
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Tesouraria</th>
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right pr-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {members.map((m) => {
              const compliance = calculateCompliance(m, transactions);
              return (
                <tr key={m.id} className={cn("group hover:bg-slate-50 transition-colors", m.disconnected ? "opacity-50" : "")}>
                  <td className="py-6 pl-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-lg">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{m.name}</p>
                        <p className="text-xs text-slate-500 font-medium italic">Iniciado em {m.initiationDate || '---'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="space-y-1">
                      <span className="px-3 py-1 bg-lodge-green/10 text-lodge-green rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {m.degree}
                      </span>
                      {m.role && (
                        <p className="text-xs text-slate-500 font-bold ml-1">{m.role}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-6">
                    <span className="text-sm font-mono font-medium text-slate-600">{m.cim}</span>
                  </td>
                  <td className="py-6">
                    <div className="flex flex-col gap-2">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit",
                        compliance === 'Adimplente' ? "bg-emerald-50 text-emerald-600" : 
                        compliance === 'Inadimplente' ? "bg-rose-50 text-rose-600" : 
                        "bg-slate-100 text-slate-500"
                      )}>
                        {compliance === 'Adimplente' && <CheckCircle2 size={10} className="mr-1" />}
                        {compliance === 'Inadimplente' && <AlertCircle size={10} className="mr-1" />}
                        {compliance}
                      </span>
                      <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit", m.paysThroughLodge ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500")}>
                        {m.paysThroughLodge ? "Recolhe pela Loja" : "Isento/Outra Loja"}
                      </span>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit", m.disconnected ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600")}>
                      {m.disconnected ? "Desligado" : "Ativo"}
                    </span>
                  </td>
                  <td className="py-6 text-right pr-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => onTogglePays(m.id)}
                        title={m.paysThroughLodge ? "Marcar como Isento" : "Marcar como Recolhe pela Loja"}
                        className={cn("p-2 rounded-xl transition-all", m.paysThroughLodge ? "text-amber-600 hover:bg-amber-50" : "text-slate-400 hover:bg-slate-100")}
                      >
                        <Wallet size={18} />
                      </button>
                      <button 
                        onClick={() => onToggleDisconnected(m.id)}
                        title={m.disconnected ? "Reativar Membro" : "Desligar Membro"}
                        className={cn("p-2 rounded-xl transition-all", m.disconnected ? "text-emerald-600 hover:bg-emerald-50" : "text-rose-600 hover:bg-rose-50")}
                      >
                        {m.disconnected ? <Shield size={18} /> : <UserX size={18} />}
                      </button>
                      <button 
                        onClick={() => onEditMember(m)}
                        title="Editar Obreiro"
                        className="p-2 text-slate-400 hover:text-lodge-green hover:bg-lodge-green/5 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);
