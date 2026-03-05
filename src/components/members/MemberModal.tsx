import React from 'react';
import { X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Member } from '../../types';

export const MemberModal = ({ 
  onClose, 
  onSubmit,
  member
}: { 
  onClose: () => void; 
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  member?: Member | null;
}) => (
  <div className="modal-container">
    <div className="modal-overlay" onClick={onClose} />
    <Card 
      className="w-full max-w-2xl relative z-10 max-h-full overflow-y-auto" 
      title={member ? "Editar Obreiro" : "Novo Obreiro"} 
      subtitle={member ? `Editando informações de ${member.name}` : "Cadastrar novo membro no quadro da Loja"}
    >
      <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-slate-50 rounded-xl transition-all">
        <X size={20} className="text-slate-400" />
      </button>
      <form onSubmit={onSubmit} className="space-y-6 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label-base">Nome Completo</label>
            <input 
              name="name" 
              required 
              defaultValue={member?.name}
              className="input-base" 
            />
          </div>
          <div>
            <label className="label-base">CIM</label>
            <input 
              name="cim" 
              required 
              defaultValue={member?.cim}
              className="input-base" 
            />
          </div>
          <div>
            <label className="label-base">Grau</label>
            <select 
              name="degree" 
              defaultValue={member?.degree || "Aprendiz"}
              className="input-base"
            >
              <option value="Aprendiz">Aprendiz</option>
              <option value="Companheiro">Companheiro</option>
              <option value="Mestre">Mestre</option>
              <option value="Mestre Instalado">Mestre Instalado</option>
            </select>
          </div>
          <div>
            <label className="label-base">Cargo</label>
            <input 
              name="role" 
              defaultValue={member?.role || ""}
              placeholder="Ex: Orador, Secretário..." 
              className="input-base" 
            />
          </div>
          <div>
            <label className="label-base">Data de Iniciação</label>
            <input 
              name="initiationDate" 
              type="date" 
              defaultValue={member?.initiationDate || ""}
              className="input-base" 
            />
          </div>
          <div>
            <label className="label-base">Data de Elevação</label>
            <input 
              name="elevationDate" 
              type="date" 
              defaultValue={member?.elevationDate || ""}
              className="input-base" 
            />
          </div>
          <div>
            <label className="label-base">Data de Exaltação</label>
            <input 
              name="exaltationDate" 
              type="date" 
              defaultValue={member?.exaltationDate || ""}
              className="input-base" 
            />
          </div>
          <div>
            <label className="label-base">Início de Recolhimento</label>
            <input 
              name="paymentStartDate" 
              type="date" 
              defaultValue={member?.paymentStartDate || ""}
              className="input-base" 
            />
          </div>
          <div className="flex items-center space-x-4 h-full pt-6">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                name="paysThroughLodge" 
                defaultChecked={member ? !!member.paysThroughLodge : true} 
                className="w-5 h-5 rounded border-slate-300 text-lodge-green focus:ring-lodge-green" 
              />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Recolhe pela Loja</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                name="disconnected" 
                defaultChecked={!!member?.disconnected} 
                className="w-5 h-5 rounded border-slate-300 text-rose-600 focus:ring-rose-600" 
              />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Desligado</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                name="frequencyExempt" 
                defaultChecked={!!member?.frequencyExempt} 
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" 
              />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Abonado (Freq. 100%)</span>
            </label>
          </div>
        </div>
        <button type="submit" className="btn-primary w-full justify-center">
          {member ? "Salvar Alterações" : "Cadastrar Obreiro"}
        </button>
      </form>
    </Card>
  </div>
);
