import React from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction, Stats } from '../../types';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

export const Treasury = ({ 
  stats, 
  transactions, 
  onAddTransaction 
}: { 
  stats: Stats; 
  transactions: Transaction[]; 
  onAddTransaction: () => void;
}) => (
  <div className="space-y-10">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-lodge-dark rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-lodge-gold/20">
        <div className="absolute top-0 right-0 w-48 h-48 bg-lodge-gold/5 rounded-full -mr-24 -mt-24 blur-3xl" />
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-8 border border-white/10">
            <Wallet className="text-lodge-gold" size={32} />
          </div>
          <p className="text-lodge-gold/60 text-sm font-bold uppercase tracking-widest mb-2">Saldo Total</p>
          <h3 className="text-4xl font-bold tracking-tight">R$ {stats.balance.toLocaleString()}</h3>
        </div>
      </div>
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-8">
          <TrendingUp size={32} />
        </div>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Entradas</p>
        <h3 className="text-4xl font-bold text-slate-900 tracking-tight">R$ {stats.income.toLocaleString()}</h3>
      </div>
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mb-8">
          <TrendingDown size={32} />
        </div>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Saídas</p>
        <h3 className="text-4xl font-bold text-slate-900 tracking-tight">R$ {stats.expense.toLocaleString()}</h3>
      </div>
    </div>

    <Card 
      title="Movimentações Financeiras" 
      subtitle="Histórico completo de entradas e saídas"
      action={
        <button 
          onClick={onAddTransaction}
          className="flex items-center space-x-3 px-6 py-3 bg-lodge-green text-white rounded-2xl font-bold hover:bg-lodge-dark hover:scale-105 transition-all shadow-lg shadow-lodge-green/20 border-b-4 border-lodge-gold"
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
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Data</th>
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição</th>
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Categoria</th>
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right pr-4">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map((t) => (
              <tr key={t.id} className="group hover:bg-slate-50 transition-colors">
                <td className="py-6 pl-4">
                  <span className="text-sm font-bold text-slate-900">{t.date}</span>
                </td>
                <td className="py-6">
                  <div className="flex items-center space-x-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                      {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{t.description}</span>
                      {t.memberName && <span className="text-[10px] text-lodge-green font-bold uppercase tracking-wider">Obreiro: {t.memberName}</span>}
                    </div>
                  </div>
                </td>
                <td className="py-6">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                    {t.category}
                  </span>
                </td>
                <td className="py-6 text-right pr-4">
                  <span className={cn("text-sm font-bold", t.type === 'income' ? "text-emerald-600" : "text-rose-600")}>
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);
