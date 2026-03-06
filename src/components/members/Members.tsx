import React, { useState, useMemo } from 'react';
import { Plus, UserPlus, Search, MoreHorizontal, Shield, UserX, Wallet, CheckCircle2, AlertCircle, Edit2, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { Member, Transaction } from '../../types';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

const ITEMS_PER_PAGE = 10;

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
  onTogglePays,
  onToggleFrequencyExempt
}: { 
  members: Member[]; 
  transactions: Transaction[];
  onAddMember: () => void;
  onEditMember: (member: Member) => void;
  onToggleDisconnected: (id: number) => void;
  onTogglePays: (id: number) => void;
  onToggleFrequencyExempt: (id: number) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.cim.includes(searchQuery)
    );
  }, [members, searchQuery]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMembers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMembers, currentPage]);

  // Reset to first page when search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-10">
      <div className="flex-between gap-6 flex-col md:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar obreiro por nome ou CIM..." 
            className="input-base pl-14"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <button 
          onClick={onAddMember}
          className="btn-primary"
        >
          <UserPlus size={20} />
          <span>Novo Obreiro</span>
        </button>
      </div>

      <Card 
        title="Quadro de Obreiros" 
        subtitle={`${filteredMembers.length} membros encontrados`}
      >
        <div className="overflow-x-auto mt-10">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-6 text-xs-bold-uppercase text-slate-400 pl-4">Obreiro</th>
                <th className="pb-6 text-xs-bold-uppercase text-slate-400">Grau / Cargo</th>
                <th className="pb-6 text-xs-bold-uppercase text-slate-400">CIM</th>
                <th className="pb-6 text-xs-bold-uppercase text-slate-400">Tesouraria</th>
                <th className="pb-6 text-xs-bold-uppercase text-slate-400">Frequência</th>
                <th className="pb-6 text-xs-bold-uppercase text-slate-400">Status</th>
                <th className="pb-6 text-xs-bold-uppercase text-slate-400 text-right pr-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedMembers.map((m) => {
                const compliance = calculateCompliance(m, transactions);
                return (
                  <tr key={m.id} className={cn("table-row-hover", m.disconnected ? "opacity-50" : "")}>
                    <td className="py-6 pl-4">
                      <div className="flex-items-center space-x-4">
                        <div className="icon-box bg-slate-100 text-slate-400 font-bold text-lg">
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
                        <span className="badge-base bg-zinc-950/10 text-zinc-950">
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
                          "badge-base",
                          compliance === 'Adimplente' ? "bg-emerald-50 text-emerald-600" : 
                          compliance === 'Inadimplente' ? "bg-rose-50 text-rose-600" : 
                          "bg-slate-100 text-slate-500"
                        )}>
                          {compliance === 'Adimplente' && <CheckCircle2 size={10} className="mr-1" />}
                          {compliance === 'Inadimplente' && <AlertCircle size={10} className="mr-1" />}
                          {compliance}
                        </span>
                        <span className={cn("badge-base", m.paysThroughLodge ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500")}>
                          {m.paysThroughLodge ? "Recolhe pela Loja" : "Isento/Outra Loja"}
                        </span>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className={cn(
                        "badge-base",
                        m.frequencyExempt ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
                      )}>
                        {m.frequencyExempt ? "Abonado" : "Normal"}
                      </span>
                    </td>
                    <td className="py-6">
                      <span className={cn("badge-base", m.disconnected ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600")}>
                        {m.disconnected ? "Desligado" : "Ativo"}
                      </span>
                    </td>
                    <td className="py-6 text-right pr-4">
                      <div className="flex-center justify-end space-x-2">
                        <button 
                          onClick={() => onToggleFrequencyExempt(m.id)}
                          title={m.frequencyExempt ? "Remover Abono de Frequência" : "Abonar Frequência"}
                          className={cn("p-2 rounded-xl transition-all", m.frequencyExempt ? "text-indigo-600 hover:bg-indigo-50" : "text-slate-400 hover:bg-slate-100")}
                        >
                          <History size={18} />
                        </button>
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
                          className="p-2 text-slate-400 hover:text-zinc-950 hover:bg-zinc-950/5 rounded-xl transition-all"
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

        {totalPages > 1 && (
          <div className="flex-between mt-10 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Mostrando <span className="font-bold text-slate-900">{paginatedMembers.length}</span> de <span className="font-bold text-slate-900">{filteredMembers.length}</span> obreiros
            </p>
            <div className="flex-items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-sm font-bold transition-all",
                      currentPage === page 
                        ? "bg-zinc-950 text-white shadow-lg shadow-zinc-950/20" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
