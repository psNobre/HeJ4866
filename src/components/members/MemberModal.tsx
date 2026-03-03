import React from 'react';
import { X } from 'lucide-react';
import { Card } from '../ui/Card';

export const MemberModal = ({ 
  onClose, 
  onSubmit 
}: { 
  onClose: () => void; 
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
    <Card className="w-full max-w-2xl relative z-10" title="Novo Obreiro" subtitle="Cadastrar novo membro no quadro da Loja">
      <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-slate-50 rounded-xl transition-all">
        <X size={20} className="text-slate-400" />
      </button>
      <form onSubmit={onSubmit} className="space-y-6 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nome Completo</label>
            <input name="name" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">CIM</label>
            <input name="cim" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Grau</label>
            <select name="degree" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all">
              <option value="Aprendiz">Aprendiz</option>
              <option value="Companheiro">Companheiro</option>
              <option value="Mestre">Mestre</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Cargo</label>
            <input name="role" placeholder="Ex: Orador, Secretário..." className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Data de Iniciação</label>
            <input name="initiationDate" type="date" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-lodge-green/5 focus:border-lodge-green outline-none transition-all" />
          </div>
          <div className="flex items-center space-x-4 h-full pt-6">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" name="paysThroughLodge" defaultChecked className="w-5 h-5 rounded border-slate-300 text-lodge-green focus:ring-lodge-green" />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Recolhe pela Loja</span>
            </label>
          </div>
        </div>
        <button type="submit" className="w-full py-5 bg-lodge-green text-white rounded-2xl font-bold hover:bg-lodge-dark transition-all shadow-lg shadow-lodge-green/20 border-b-4 border-lodge-gold">
          Cadastrar Obreiro
        </button>
      </form>
    </Card>
  </div>
);
