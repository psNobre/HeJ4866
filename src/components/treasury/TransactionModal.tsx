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
    <div className="modal-container">
      <div className="modal-overlay" onClick={onClose} />
      <Card className="w-full max-w-lg relative z-10 max-h-full overflow-y-auto" title="Nova Movimentação" subtitle="Registre uma entrada ou saída de caixa">
        <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-slate-50 rounded-xl transition-all">
          <X size={20} className="text-slate-400" />
        </button>
        <form onSubmit={onSubmit} className="space-y-6 mt-10">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label-base">Tipo</label>
              <select name="type" className="input-base">
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
            </div>
            <div>
              <label className="label-base">Valor (R$)</label>
              <input name="amount" type="number" step="0.01" required className="input-base" />
            </div>
          </div>
          <div>
            <label className="label-base">Descrição</label>
            <input name="description" required className="input-base" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label-base">Categoria</label>
              <select 
                name="category" 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TransactionCategory)}
                required 
                className="input-base"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="label-base">Data</label>
              <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="input-base" />
            </div>
          </div>

          {selectedCategory === 'Mensalidade' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="label-base">Obreiro</label>
                <select name="memberId" required className="input-base">
                  <option value="">Selecione um obreiro...</option>
                  {members.filter(m => m.active && !m.disconnected).map(m => (
                    <option key={m.id} value={m.id}>{m.name} (CIM: {m.cim})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="label-base">Mês Referente</label>
                  <select 
                    name="month" 
                    required 
                    defaultValue={new Date().getMonth() + 1}
                    className="input-base"
                  >
                    <option value="1">Janeiro</option>
                    <option value="2">Fevereiro</option>
                    <option value="3">Março</option>
                    <option value="4">Abril</option>
                    <option value="5">Maio</option>
                    <option value="6">Junho</option>
                    <option value="7">Julho</option>
                    <option value="8">Agosto</option>
                    <option value="9">Setembro</option>
                    <option value="10">Outubro</option>
                    <option value="11">Novembro</option>
                    <option value="12">Dezembro</option>
                  </select>
                </div>
                <div>
                  <label className="label-base">Ano Referente</label>
                  <select 
                    name="year" 
                    required 
                    defaultValue={new Date().getFullYear()}
                    className="input-base"
                  >
                    {[2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center">
            Salvar Movimentação
          </button>
        </form>
      </Card>
    </div>
  );
};
