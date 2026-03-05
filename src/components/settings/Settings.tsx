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
        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex-items-center space-x-4">
          <div className="icon-box bg-amber-100 text-amber-600">
            <Shield size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">Segurança da Sessão</h4>
            <p className="text-xs text-amber-700 mt-1">A Palavra Semestral é exigida de todos os obreiros no momento do login para garantir que apenas membros regulares acessem o portal.</p>
          </div>
        </div>

        <div>
          <label className="label-base">Palavra Semestral Atual</label>
          <div className="relative">
            <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              name="palavra"
              type="text" 
              defaultValue={palavraSemestral}
              onFocus={(e) => { if (e.target.value === '********') e.target.value = ''; }}
              onBlur={(e) => { if (e.target.value === '') e.target.value = '********'; }}
              className="input-base pl-14 font-bold"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 ml-1">Para manter a palavra atual, deixe o campo como está.</p>
        </div>

        <button type="submit" className="btn-primary w-full justify-center">
          Atualizar Parâmetros
        </button>
      </form>
    </Card>
  </div>
);
