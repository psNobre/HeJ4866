import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, CheckSquare, Square } from 'lucide-react';
import { Card } from '../ui/Card';
import { Member, TransactionCategory } from '../../types';

const CATEGORIES: TransactionCategory[] = [
  'Ágape', 'Aluguel', 'Anuidade', 'Auxílio Funeral', 'Beneficência', 'Campanhas', 
  'Contador', 'Doação', 'Jóia de Recepção', 'Lojinha', 'Materiais', 'Materiais Perecíveis', 
  'Mensalidade', 'Multas', 'Outros', 'Pagamento', 'Paramentos', 'Segurança', 
  'Taxas do GOB Estadual', 'Taxas do GOB Federal', 'Tronco de Beneficência'
];

interface MissingMonth {
  month: number;
  year: number;
  label: string;
}

export const TransactionModal = ({ 
  onClose, 
  onSubmit,
  members,
  transaction
}: { 
  onClose: () => void; 
  onSubmit: (data: any) => void;
  members: Member[];
  transaction?: any | null;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>(transaction?.category || 'Mensalidade');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(transaction?.member_id?.toString() || '');
  const [missingMonths, setMissingMonths] = useState<MissingMonth[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<MissingMonth[]>([]);
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [amount, setAmount] = useState<string>(transaction?.amount?.toString() || '');
  const [description, setDescription] = useState<string>(transaction?.description || '');
  const [date, setDate] = useState<string>(transaction?.date || new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<string>(transaction?.type || 'income');

  useEffect(() => {
    if (selectedCategory === 'Mensalidade' && selectedMemberId) {
      setLoadingMonths(true);
      fetch(`/api/members/${selectedMemberId}/missing-months`)
        .then(res => res.json())
        .then(data => {
          if (transaction && transaction.id && transaction.member_id === parseInt(selectedMemberId)) {
             const paidByThis = transaction.paymentMonths 
               ? transaction.paymentMonths.split(', ').map((m: string) => {
                  const [month, year] = m.split('/');
                  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
                  return {
                    month: parseInt(month),
                    year: parseInt(year),
                    label: d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
                  };
               })
               : [];
             
             const combined = [...paidByThis, ...data].filter((v, i, a) => a.findIndex(t => (t.month === v.month && t.year === v.year)) === i);
             combined.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));
             
             setMissingMonths(combined);
             setSelectedMonths(paidByThis);
          } else {
            setMissingMonths(data);
            setSelectedMonths([]);
          }
        })
        .catch(err => console.error("Error fetching missing months:", err))
        .finally(() => setLoadingMonths(false));
    } else {
      setMissingMonths([]);
      setSelectedMonths([]);
    }
  }, [selectedCategory, selectedMemberId, transaction]);

  const toggleMonth = (month: MissingMonth) => {
    const isSelected = selectedMonths.some(m => m.month === month.month && m.year === month.year);
    if (isSelected) {
      setSelectedMonths(prev => prev.filter(m => !(m.month === month.month && m.year === month.year)));
    } else {
      setSelectedMonths(prev => [...prev, month]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    // Add payments array if it's a Mensalidade
    if (selectedCategory === 'Mensalidade' && selectedMonths.length > 0) {
      (data as any).payments = selectedMonths.map(m => ({ month: m.month, year: m.year }));
      // Use the first selected month as the primary reference for the transaction table
      data.month = selectedMonths[0].month.toString();
      data.year = selectedMonths[0].year.toString();
    }

    onSubmit(data);
  };

  return (
    <div className="modal-container">
      <div className="modal-overlay" onClick={onClose} />
      <Card className="w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto" title={transaction ? "Editar Movimentação" : "Nova Movimentação"} subtitle={transaction ? "Atualize os dados da movimentação" : "Registre uma entrada ou saída de caixa"}>
        <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-slate-50 rounded-xl transition-all">
          <X size={20} className="text-slate-400" />
        </button>
        <form onSubmit={handleFormSubmit} className="space-y-6 mt-10">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label-base">Tipo</label>
              <select 
                name="type" 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-base"
              >
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
            </div>
            <div>
              <label className="label-base">Valor Total (R$)</label>
              <input 
                name="amount" 
                type="number" 
                step="0.01" 
                required 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-base" 
              />
              {selectedCategory === 'Mensalidade' && selectedMonths.length > 0 && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Média por mês: R$ {(parseFloat(amount || '0') / selectedMonths.length).toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="label-base">Descrição</label>
            <input 
              name="description" 
              required 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-base" 
              placeholder="Ex: Mensalidade de Obreiro" 
            />
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
              <label className="label-base">Data do Pagamento</label>
              <input 
                name="date" 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required 
                className="input-base" 
              />
            </div>
          </div>

          {selectedCategory === 'Mensalidade' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="label-base">Obreiro</label>
                <select 
                  name="memberId" 
                  required 
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="input-base"
                >
                  <option value="">Selecione um obreiro...</option>
                  {members.filter(m => m.active && !m.disconnected).map(m => (
                    <option key={m.id} value={m.id}>{m.name} (CIM: {m.cim})</option>
                  ))}
                </select>
              </div>

              {selectedMemberId && (
                <div className="space-y-3">
                  <label className="label-base flex justify-between items-center">
                    <span>Meses em Aberto</span>
                    {selectedMonths.length > 0 && (
                      <span className="text-emerald-600 font-bold">{selectedMonths.length} selecionado(s)</span>
                    )}
                  </label>
                  
                  {loadingMonths ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lodge-green"></div>
                    </div>
                  ) : missingMonths.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {missingMonths.map((m) => {
                        const isSelected = selectedMonths.some(sm => sm.month === m.month && sm.year === m.year);
                        return (
                          <button
                            key={`${m.month}-${m.year}`}
                            type="button"
                            onClick={() => toggleMonth(m)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                              isSelected 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                                : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <CalendarIcon size={16} className={isSelected ? 'text-emerald-500' : 'text-slate-400'} />
                              <span className="text-xs font-bold capitalize">{m.label}</span>
                            </div>
                            {isSelected ? <CheckSquare size={18} className="text-emerald-500" /> : <Square size={18} className="text-slate-300" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                      <p className="text-xs font-bold text-emerald-700">Este obreiro está em dia!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary w-full justify-center"
            disabled={selectedCategory === 'Mensalidade' && selectedMemberId && selectedMonths.length === 0 && missingMonths.length > 0}
          >
            Salvar Movimentação
          </button>
        </form>
      </Card>
    </div>
  );
};
