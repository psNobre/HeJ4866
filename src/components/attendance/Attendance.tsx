import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, History, Trash2, Edit2, ChevronLeft, ChevronRight, Filter, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Session, MemberAttendanceStats } from '../../types';
import { Card } from '../ui/Card';
import { ViewAttendanceModal } from './ViewAttendanceModal';

export const Attendance = ({ 
  sessions, 
  onNewSession,
  onEditSession,
  onDeleteSession
}: { 
  sessions: Session[]; 
  onNewSession: () => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (id: number) => void;
}) => {
  const [memberStats, setMemberStats] = useState<MemberAttendanceStats[]>([]);
  const [statsFilter, setStatsFilter] = useState<'year' | '12months' | 'all'>('all');
  const [statsLoading, setStatsLoading] = useState(true);
  const [viewingSession, setViewingSession] = useState<Session | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sessions.length / itemsPerPage);
  
  const paginatedSessions = sessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await fetch(`/api/sessions/stats/members?filter=${statsFilter}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setMemberStats(data);
        } else {
          console.error("Member stats data is not an array:", data);
          setMemberStats([]);
          toast.error("Erro ao carregar estatísticas de frequência.");
        }
      } catch (error) {
        console.error("Error fetching member stats:", error);
        setMemberStats([]);
        toast.error("Erro de conexão ao carregar estatísticas.");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [statsFilter]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-8">
            <Calendar size={32} />
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Total de Sessões</p>
          <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{sessions.length}</h3>
        </div>
      </div>

      <Card 
        title="Frequência por Obreiro" 
        subtitle="Relação de presenças e faltas"
        action={
          <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button 
              onClick={() => setStatsFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statsFilter === 'all' ? 'bg-white text-lodge-green shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Tudo
            </button>
            <button 
              onClick={() => setStatsFilter('12months')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statsFilter === '12months' ? 'bg-white text-lodge-green shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              12 Meses
            </button>
            <button 
              onClick={() => setStatsFilter('year')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statsFilter === 'year' ? 'bg-white text-lodge-green shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Este Ano
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto mt-10">
          {statsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lodge-green"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100">
                  <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider pl-4">Obreiro</th>
                  <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Grau</th>
                  <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Presenças</th>
                  <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Faltas</th>
                  <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right pr-4">% Frequência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {memberStats.map((stat) => {
                  const rate = stat.totalSessions > 0 ? Math.round((stat.presences / stat.totalSessions) * 100) : 0;
                  return (
                    <tr key={stat.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4 pl-4">
                        <span className="text-sm font-bold text-slate-900">{stat.name}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.degree}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className="text-sm font-bold text-emerald-600">{stat.presences}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className="text-sm font-bold text-rose-600">{stat.absences}</span>
                      </td>
                      <td className="py-4 text-right pr-4">
                        <div className="flex items-center justify-end space-x-3">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${rate >= 75 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                              style={{ width: `${rate}%` }} 
                            />
                          </div>
                          <span className={`text-xs font-bold ${rate >= 75 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

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
                <th className="pb-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right pr-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedSessions.map((s) => (
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
                    <td className="py-6 text-right pr-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setViewingSession(s);
                          }}
                          className="p-2 text-slate-400 hover:text-lodge-gold hover:bg-lodge-gold/5 rounded-xl transition-all"
                          title="Ver Presenças"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            onEditSession(s);
                          }}
                          className="p-2 text-slate-400 hover:text-lodge-green hover:bg-lodge-green/5 rounded-xl transition-all"
                          title="Editar Sessão"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            console.log("Delete button clicked for session ID:", s.id);
                            toast.info(`Processando exclusão da sessão...`);
                            onDeleteSession(s.id);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Excluir Sessão"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {viewingSession && (
        <ViewAttendanceModal 
          session={viewingSession} 
          onClose={() => setViewingSession(null)} 
        />
      )}
    </div>
  );
};
