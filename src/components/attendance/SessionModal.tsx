import React from 'react';
import { X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Member } from '../../types';

export const SessionModal = ({ 
  members, 
  onClose, 
  onSubmit 
}: { 
  members: Member[]; 
  onClose: () => void; 
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
    <Card className="w-full max-w-3xl relative z-10" title="Nova Sessão" subtitle="Registro de presença e ata da sessão">
      <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-slate-50 rounded-xl transition-all">
        <X size={20} className="text-slate-400" />
      </button>
      <form onSubmit={onSubmit} className="space-y-8 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Título da Sessão</label>
            <input name="title" required placeholder="Ex: Sessão de Instrução" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Tipo de Sessão</label>
            <select name="type" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all appearance-none">
              <option value="Ordinária">Ordinária</option>
              <option value="Magna">Magna</option>
              <option value="Pública">Pública</option>
              <option value="Administrativa">Administrativa</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Grau da Sessão</label>
            <select name="degree" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all appearance-none">
              <option value="Aprendiz">Aprendiz</option>
              <option value="Companheiro">Companheiro</option>
              <option value="Mestre">Mestre</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Data</label>
            <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Descrição (Opcional)</label>
            <input name="description" placeholder="Contexto adicional..." className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 ml-1">Lista de Presença</label>
          <div className="max-h-[300px] overflow-y-auto pr-4 space-y-3 custom-scrollbar">
            {members.filter(m => !m.disconnected).map(m => (
              <label key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white hover:border-lodge-green/20 transition-all group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 font-bold group-hover:text-lodge-green transition-colors">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{m.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{m.degree}</p>
                  </div>
                </div>
                <input type="checkbox" name={`attendance_${m.id}`} defaultChecked className="w-6 h-6 rounded-lg border-slate-300 text-lodge-green focus:ring-lodge-green" />
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full py-5 bg-lodge-green text-white rounded-2xl font-bold hover:bg-lodge-dark transition-all shadow-lg shadow-lodge-green/20 border-b-4 border-lodge-gold">
          Finalizar Sessão e Salvar Ata
        </button>
      </form>
    </Card>
  </div>
);
