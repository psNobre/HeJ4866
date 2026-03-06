import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Member, Session } from '../../types';

export const SessionModal = ({ 
  members, 
  session,
  onClose, 
  onSubmit 
}: { 
  members: Member[]; 
  session?: Session | null;
  onClose: () => void; 
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) => {
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      setLoading(true);
      fetch(`/api/sessions/attendance/${session.id}`)
        .then(res => res.json())
        .then(data => {
          const attMap: Record<number, boolean> = {};
          data.forEach((a: any) => {
            attMap[a.id] = !!a.present;
          });
          setAttendance(attMap);
        })
        .finally(() => setLoading(false));
    } else {
      const attMap: Record<number, boolean> = {};
      members.forEach(m => {
        attMap[m.id] = true;
      });
      setAttendance(attMap);
    }
  }, [session, members]);

  const handleToggleAttendance = (memberId: number) => {
    setAttendance(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  return (
    <div className="modal-container">
      <div className="modal-overlay" onClick={onClose} />
      <Card 
        className="w-full max-w-3xl relative z-10 max-h-full overflow-y-auto" 
        title={session ? "Editar Sessão" : "Nova Sessão"} 
        subtitle={session ? "Atualize os dados e presenças da sessão" : "Registro de presença e ata da sessão"}
      >
        <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-slate-50 rounded-xl transition-all">
          <X size={20} className="text-slate-400" />
        </button>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lodge-green"></div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-8 mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label-base">Tipo de Sessão</label>
                <select 
                  name="type" 
                  required 
                  defaultValue={session?.type || "Ordinária"}
                  className="input-base"
                >
                  <option value="Ordinária">Ordinária</option>
                  <option value="Magna">Magna</option>
                  <option value="Pública">Pública</option>
                  <option value="Administrativa">Administrativa</option>
                </select>
              </div>
              <div>
                <label className="label-base">Grau da Sessão</label>
                <select 
                  name="degree" 
                  required 
                  defaultValue={session?.degree || "Aprendiz"}
                  className="input-base"
                >
                  <option value="Aprendiz">Aprendiz</option>
                  <option value="Companheiro">Companheiro</option>
                  <option value="Mestre">Mestre</option>
                  <option value="Pública">Pública</option>
                </select>
              </div>
              <div>
                <label className="label-base">Data</label>
                <input 
                  name="date" 
                  type="date" 
                  defaultValue={session?.date || new Date().toISOString().split('T')[0]} 
                  required 
                  className="input-base" 
                />
              </div>
              <div>
                <label className="label-base">Descrição (Opcional)</label>
                <input 
                  name="description" 
                  defaultValue={session?.description}
                  placeholder="Contexto adicional..." 
                  className="input-base" 
                />
              </div>
            </div>

            <div>
              <label className="label-base">Lista de Presença</label>
              <div className="max-h-[300px] overflow-y-auto pr-4 space-y-3 custom-scrollbar">
                {members
                  .filter(m => !m.disconnected || (session && attendance[m.id] !== undefined))
                  .map(m => (
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
                    <input 
                      type="checkbox" 
                      name={`attendance_${m.id}`} 
                      checked={!!attendance[m.id]} 
                      onChange={() => handleToggleAttendance(m.id)}
                      className="w-6 h-6 rounded-lg border-slate-300 text-lodge-green focus:ring-lodge-green" 
                    />
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center">
              {session ? "Salvar Alterações" : "Finalizar Sessão e Salvar Ata"}
            </button>
          </form>
        )}
      </Card>
    </div>
  );
};
