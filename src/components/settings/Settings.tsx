import React from 'react';
import { Shield, Key } from 'lucide-react';
import { Card } from '../ui/Card';

export const Settings = ({ 
  palavraSemestral, 
  onUpdatePalavra 
}: { 
  palavraSemestral: string; 
  onUpdatePalavra: (e: React.FormEvent<HTMLFormElement>) => void;
}) => (
  <div className="max-w-2xl space-y-10">
    <Card title="Configurações do Sistema" subtitle="Administração de parâmetros da Loja">
      <form onSubmit={onUpdatePalavra} className="space-y-8 mt-10">
        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start space-x-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <Shield size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">Segurança da Sessão</h4>
            <p className="text-xs text-amber-700 mt-1">A Palavra Semestral é exigida de todos os obreiros no momento do login para garantir que apenas membros regulares acessem o portal.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Palavra Semestral Atual</label>
          <div className="relative">
            <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              name="palavra"
              type="text" 
              defaultValue={palavraSemestral}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all font-bold text-slate-900"
            />
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-lodge-green text-white rounded-2xl font-bold hover:bg-lodge-dark hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-lodge-green/20 border-b-4 border-lodge-gold">
          Atualizar Parâmetros
        </button>
      </form>
    </Card>
  </div>
);
