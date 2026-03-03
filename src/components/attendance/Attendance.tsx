import React from 'react';
import { Plus, Calendar, Users, History } from 'lucide-react';
import { Session } from '../../types';
import { Card } from '../ui/Card';

export const Attendance = ({ 
  sessions, 
  onNewSession 
}: { 
  sessions: Session[]; 
  onNewSession: () => void;
}) => (
  <div className="space-y-10">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-8">
          <Calendar size={32} />
        </div>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Total de Sessões</p>
        <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{sessions.length}</h3>
      </div>
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-8">
          <Users size={32} />
        </div>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Frequência Média</p>
        <h3 className="text-4xl font-bold text-slate-900 tracking-tight">85%</h3>
      </div>
    </div>

    <Card 
      title="Sessões Realizadas" 
      subtitle="Histórico de presenças e atas"
      action={
        <button 
          onClick={onNewSession}
          className="flex items-center space-x-3 px-6 py-3 bg-lodge-green text-white rounded-2xl font-bold hover:bg-lodge-dark hover:scale-105 transition-all shadow-lg shadow-lodge-green/20 border-b-4 border-lodge-gold"
        >
          <Plus size={20} />
          <span>Nova Sessão</span>
        </button>
      }
    >
      <div className="overflow-x-auto mt-10">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-slate-100">
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Data</th>
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Título</th>
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo/Grau</th>
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Presenças</th>
              <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right pr-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sessions.map((s) => (
              <tr key={s.id} className="group hover:bg-slate-50 transition-colors">
                <td className="py-6 pl-4">
                  <span className="text-sm font-bold text-slate-900">{s.date}</span>
                </td>
                <td className="py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{s.title}</span>
                    {s.description && <span className="text-[10px] text-slate-400 italic">{s.description}</span>}
                  </div>
                </td>
                <td className="py-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-lodge-green">{s.type}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.degree}</span>
                  </div>
                </td>
                <td className="py-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-lodge-green rounded-full" />
                    </div>
                    <span className="text-xs font-bold text-slate-500">75%</span>
                  </div>
                </td>
                <td className="py-6 text-right pr-4">
                  <button className="p-2 text-slate-400 hover:text-lodge-green hover:bg-lodge-green/5 rounded-xl transition-all">
                    <History size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);
