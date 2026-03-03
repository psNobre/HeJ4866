import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Member, TransactionCategory } from '../../types';

const CATEGORIES: TransactionCategory[] = [
  'Ágape', 'Aluguel', 'Anuidade', 'Auxílio Funeral', 'Beneficência', 'Campanhas', 
  'Contador', 'Doação', 'Jóia de Recepção', 'Lojinha', 'Materiais', 'Materiais Perecíveis', 
  'Mensalidade', 'Multas', 'Outros', 'Pagamento', 'Paramentos', 'Segurança', 
  'Taxas do GOB Estadual', 'Taxas do GOB Federal', 'Tronco de Beneficência'
];

export const TransactionModal = ({ 
  onClose, 
  onSubmit,
  members
}: { 
  onClose: () => void; 
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  members: Member[];
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>('Mensalidade');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <Card className="w-full max-w-lg relative z-10" title="Nova Movimentação" subtitle="Registre uma entrada ou saída de caixa">
        <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-slate-50 rounded-xl transition-all">
          <X size={20} className="text-slate-400" />
        </button>
        <form onSubmit={onSubmit} className="space-y-6 mt-10">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Tipo</label>
              <select name="type" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all">
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Valor (R$)</label>
              <input name="amount" type="number" step="0.01" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Descrição</label>
            <input name="description" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Categoria</label>
              <select 
                name="category" 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TransactionCategory)}
                required 
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Data</label>
              <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all" />
            </div>
          </div>

          {selectedCategory === 'Mensalidade' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Obreiro</label>
              <select name="memberId" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all">
                <option value="">Selecione um obreiro...</option>
                {members.filter(m => m.active && !m.disconnected).map(m => (
                  <option key={m.id} value={m.id}>{m.name} (CIM: {m.cim})</option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="w-full py-5 bg-lodge-green text-white rounded-2xl font-bold hover:bg-lodge-dark transition-all shadow-lg shadow-lodge-green/20 border-b-4 border-lodge-gold">
            Salvar Movimentação
          </button>
        </form>
      </Card>
    </div>
  );
};
