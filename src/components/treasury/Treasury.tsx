import React, { useState, useMemo } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { Transaction, Stats } from '../../types';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

const ITEMS_PER_PAGE = 10;

export const Treasury = ({ 
  stats, 
  transactions, 
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction
}: { 
  stats: Stats; 
  transactions: Transaction[]; 
  onAddTransaction: () => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: number) => void;
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return transactions.slice(start, start + ITEMS_PER_PAGE);
  }, [transactions, currentPage]);

  return (
    <div className="space-y-10">
      <div className="grid-cols-3-responsive">
        <div className="card-base p-10 bg-zinc-950 text-white shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
          <div className="relative z-10">
            <div className="icon-box bg-white/10 rounded-3xl mb-8 border border-white/10">
              <Wallet className="text-amber-400" size={32} />
            </div>
            <p className="text-white/60 text-xs-bold-uppercase mb-2">Saldo Total</p>
            <h3 className="text-4xl font-bold tracking-tight">R$ {stats.balance.toLocaleString()}</h3>
          </div>
        </div>
        <div className="card-base p-10">
          <div className="icon-box bg-emerald-50 text-emerald-600 rounded-3xl mb-8">
            <TrendingUp size={32} />
          </div>
          <p className="text-muted text-xs-bold-uppercase mb-2">Entradas</p>
          <h3 className="text-4xl font-bold text-slate-900 tracking-tight">R$ {stats.income.toLocaleString()}</h3>
        </div>
        <div className="card-base p-10">
          <div className="icon-box bg-rose-50 text-rose-600 rounded-3xl mb-8">
            <TrendingDown size={32} />
          </div>
          <p className="text-muted text-xs-bold-uppercase mb-2">Saídas</p>
          <h3 className="text-4xl font-bold text-slate-900 tracking-tight">R$ {stats.expense.toLocaleString()}</h3>
        </div>
      </div>

      <Card 
        title="Movimentações Financeiras" 
        subtitle="Histórico completo de entradas e saídas"
        action={
          <button 
            onClick={onAddTransaction}
            className="btn-primary"
          >
            <Plus size={20} />
            <span>Nova Movimentação</span>
          </button>
        }
      >
        <div className="overflow-x-auto mt-10">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-6 text-xs-bold-uppercase text-slate-400 pl-4">Data</th>
                <th className="pb-6 text-xs-bold-uppercase text-slate-400">Descrição</th>
                <th className="pb-6 text-xs-bold-uppercase text-slate-400">Categoria</th>
                <th className="pb-6 text-xs-bold-uppercase text-slate-400 text-right pr-4">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedTransactions.map((t) => (
                <tr key={t.id} className="table-row-hover">
                  <td className="py-6 pl-4">
                    <span className="text-sm font-bold text-slate-900">{t.date}</span>
                  </td>
                  <td className="py-6">
                    <div className="flex-items-center space-x-3">
                      <div className={cn("icon-box w-10 h-10 rounded-xl", t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                        {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{t.description}</span>
                        <div className="flex-items-center flex-wrap gap-2 mt-0.5">
                          {t.memberName && <span className="text-[10px] text-zinc-950 font-bold uppercase tracking-wider">Obreiro: {t.memberName}</span>}
                          {(t as any).paymentMonths ? (
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                              Ref: {(t as any).paymentMonths}
                            </span>
                          ) : t.month && t.year && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                              Ref: {t.month}/{t.year}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className="badge-base bg-slate-100 text-slate-600">
                      {t.category}
                    </span>
                  </td>
                  <td className="py-6 text-right pr-4">
                    <div className="flex-center justify-end space-x-2">
                      <span className={cn("text-sm font-bold mr-4", t.type === 'income' ? "text-emerald-600" : "text-rose-600")}>
                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString()}
                      </span>
                      <button 
                        onClick={() => onEditTransaction(t)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Editar Transação"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => onDeleteTransaction(t.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Excluir Transação"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex-between mt-10 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Mostrando <span className="font-bold text-slate-900">{paginatedTransactions.length}</span> de <span className="font-bold text-slate-900">{transactions.length}</span> movimentações
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
