import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar, Users, History, Trash2, Edit2, ChevronLeft, ChevronRight, Filter, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Session, MemberAttendanceStats } from '../../types';
import { Card } from '../ui/Card';
import { ViewAttendanceModal } from './ViewAttendanceModal';
import { cn } from '../../lib/utils';

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
  const [showOnlyNonExempt, setShowOnlyNonExempt] = useState(false);
  
  const filteredMemberStats = useMemo(() => {
    return showOnlyNonExempt 
      ? memberStats.filter(stat => !stat.frequencyExempt) 
      : memberStats;
  }, [memberStats, showOnlyNonExempt]);

  // Pagination state for Sessions
  const [sessionsPage, setSessionsPage] = useState(1);
  const itemsPerPage = 10;
  const totalSessionsPages = Math.ceil(sessions.length / itemsPerPage);
  
  const paginatedSessions = useMemo(() => {
    const start = (sessionsPage - 1) * itemsPerPage;
    return sessions.slice(start, start + itemsPerPage);
  }, [sessions, sessionsPage]);

  // Pagination state for Member Stats
  const [statsPage, setStatsPage] = useState(1);
  const totalStatsPages = Math.ceil(filteredMemberStats.length / itemsPerPage);

  const paginatedMemberStats = useMemo(() => {
    const start = (statsPage - 1) * itemsPerPage;
    return filteredMemberStats.slice(start, start + itemsPerPage);
  }, [filteredMemberStats, statsPage]);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await fetch(`/api/sessions/stats/members?filter=${statsFilter}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setMemberStats(data);
          setStatsPage(1); // Reset to first page when filter changes
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
      <div className="grid-cols-1 gap-8">
        <div className="card-base p-10">
          <div className="icon-box bg-amber-50 text-amber-600 rounded-3xl mb-8">
            <Calendar size={32} />
          </div>
          <p className="text-muted text-xs-bold-uppercase mb-2">Total de Sessões</p>
          <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{sessions.length}</h3>
        </div>
      </div>

      <Card 
        title="Frequência por Obreiro" 
        subtitle="Relação de presenças e faltas"
        action={
          <div className="flex-items-center space-x-4">
            <button 
              onClick={() => setShowOnlyNonExempt(!showOnlyNonExempt)}
              className={cn(
                "flex-items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                showOnlyNonExempt 
                  ? "bg-zinc-950 text-white border-zinc-950" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              <Filter size={14} />
              <span>{showOnlyNonExempt ? "Mostrando Apenas Ativos" : "Filtrar Abonados"}</span>
            </button>

            <div className="flex-items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button 
                onClick={() => setStatsFilter('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statsFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Tudo
              </button>
              <button 
                onClick={() => setStatsFilter('12months')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statsFilter === '12months' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                12 Meses
              </button>
              <button 
                onClick={() => setStatsFilter('year')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statsFilter === 'year' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Este Ano
              </button>
            </div>
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
                  <th className="pb-6 text-xs-bold-uppercase text-slate-400 pl-4">Obreiro</th>
                  <th className="pb-6 text-xs-bold-uppercase text-slate-400">Grau</th>
                  <th className="pb-6 text-xs-bold-uppercase text-slate-400 text-center">Presenças</th>
                  <th className="pb-6 text-xs-bold-uppercase text-slate-400 text-center">Faltas</th>
                  <th className="pb-6 text-xs-bold-uppercase text-slate-400 text-right pr-4">% Frequência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedMemberStats.map((stat) => {
                  const isExempt = stat.frequencyExempt === 1;
                  const rate = stat.totalSessions > 0 ? Math.round((stat.presences / stat.totalSessions) * 100) : 0;
                  return (
                    <tr key={stat.id} className="table-row-hover">
                      <td className="py-4 pl-4">
                        <span className="text-sm font-bold text-slate-900">{stat.name}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.degree}</span>
                      </td>
                      <td className="py-4 text-center">
                        {isExempt ? (
                          <span className="badge-base bg-indigo-50 text-indigo-600">Isento</span>
                        ) : (
                          <span className="text-sm font-bold text-emerald-600">{stat.presences}</span>
                        )}
                      </td>
                      <td className="py-4 text-center">
                        {isExempt ? (
                          <span className="badge-base bg-indigo-50 text-indigo-600">Isento</span>
                        ) : (
                          <span className="text-sm font-bold text-rose-600">{stat.absences}</span>
                        )}
                      </td>
                      <td className="py-4 text-right pr-4">
                        {isExempt ? (
                          <span className="badge-base bg-indigo-50 text-indigo-600">Isento</span>
                        ) : (
                          <div className="flex-items-center justify-end space-x-3">
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
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalStatsPages > 1 && (
          <div className="flex-between mt-10 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Mostrando <span className="font-bold text-slate-900">{paginatedMemberStats.length}</span> de <span className="font-bold text-slate-900">{filteredMemberStats.length}</span> obreiros
            </p>
            <div className="flex-items-center space-x-2">
              <button 
                onClick={() => setStatsPage(prev => Math.max(1, prev - 1))}
                disabled={statsPage === 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalStatsPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setStatsPage(page)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-sm font-bold transition-all",
                      statsPage === page 
                        ? "bg-zinc-950 text-white shadow-lg shadow-zinc-950/20" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setStatsPage(prev => Math.min(totalStatsPages, prev + 1))}
                disabled={statsPage === totalStatsPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card 
        title="Sessões Realizadas" 
        subtitle="Histórico de presenças e atas"
        action={
          <button 
            onClick={onNewSession}
            className="btn-primary"
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
                <th className="pb-6 text-xs-bold-uppercase text-slate-400 pl-4">Data</th>
                <th className="pb-6 text-xs-bold-uppercase text-slate-400">Título</th>
                <th className="pb-6 text-xs-bold-uppercase text-slate-400">Tipo/Grau</th>
                <th className="pb-6 text-xs-bold-uppercase text-slate-400 text-right pr-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedSessions.map((s) => (
                <tr key={s.id} className="table-row-hover">
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
                        <span className="text-xs font-bold text-zinc-950">{s.type}</span>
                        <span className="text-xs-bold-uppercase text-slate-400">{s.degree}</span>
                      </div>
                    </td>
                    <td className="py-6 text-right pr-4">
                      <div className="flex-center justify-end space-x-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setViewingSession(s);
                          }}
                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                          title="Ver Presenças"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            onEditSession(s);
                          }}
                          className="p-2 text-slate-400 hover:text-zinc-950 hover:bg-zinc-950/5 rounded-xl transition-all"
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

        {totalSessionsPages > 1 && (
          <div className="flex-between mt-10 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Mostrando <span className="font-bold text-slate-900">{paginatedSessions.length}</span> de <span className="font-bold text-slate-900">{sessions.length}</span> sessões
            </p>
            <div className="flex-items-center space-x-2">
              <button 
                onClick={() => setSessionsPage(prev => Math.max(1, prev - 1))}
                disabled={sessionsPage === 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalSessionsPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setSessionsPage(page)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-sm font-bold transition-all",
                      sessionsPage === page 
                        ? "bg-zinc-950 text-white shadow-lg shadow-zinc-950/20" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setSessionsPage(prev => Math.min(totalSessionsPages, prev + 1))}
                disabled={sessionsPage === totalSessionsPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
