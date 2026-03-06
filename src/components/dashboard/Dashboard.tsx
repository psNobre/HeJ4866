import React, { useEffect, useState, useMemo } from 'react';
import { Wallet, Calendar, AlertCircle, CheckCircle2, Clock, ListChecks, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Member, Transaction, Session } from '../../types';
import { StatCard } from '../ui/StatCard';
import { Card } from '../ui/Card';

const ITEMS_PER_PAGE = 5;

interface MemberStats {
  attendanceRate: number;
  compliance: string;
  missingMonths: string[];
  totalPayments: number;
  requiredPayments: number;
}

export const Dashboard = ({ user, transactions, sessions: allSessions }: { 
  user: Member; 
  transactions: Transaction[]; 
  sessions: Session[];
}) => {
  const [memberStats, setMemberStats] = useState<MemberStats | null>(null);
  const [userSessions, setUserSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [missingPage, setMissingPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, sessionsRes] = await Promise.all([
          fetch(`/api/members/${user.id}/stats`),
          fetch(`/api/members/${user.id}/sessions`)
        ]);
        
        const statsData = await statsRes.json();
        const sessionsData = await sessionsRes.json();
        
        setMemberStats(statsData);
        setUserSessions(sessionsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const totalSessionsPages = Math.ceil(userSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = useMemo(() => {
    const start = (sessionsPage - 1) * ITEMS_PER_PAGE;
    return userSessions.slice(start, start + ITEMS_PER_PAGE);
  }, [userSessions, sessionsPage]);

  const missingMonths = memberStats?.missingMonths || [];
  const totalMissingPages = Math.ceil(missingMonths.length / ITEMS_PER_PAGE);
  const paginatedMissingMonths = useMemo(() => {
    const start = (missingPage - 1) * ITEMS_PER_PAGE;
    return missingMonths.slice(start, start + ITEMS_PER_PAGE);
  }, [missingMonths, missingPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lodge-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="card-base card-content">
        <h1 className="heading-display">Olá, {user.name}</h1>
        <p className="text-muted mt-2">Bem-vindo ao seu painel pessoal. Aqui você pode acompanhar sua situação na Loja.</p>
      </div>

      <div className="grid-cols-3-responsive">
        <StatCard 
          title="Frequência (12 Meses)" 
          value={`${memberStats?.attendanceRate || 0}%`} 
          icon={Calendar} 
          color="bg-amber-50 text-amber-600"
        />
        <StatCard 
          title="Status Tesouraria" 
          value={memberStats?.compliance || '---'} 
          icon={memberStats?.compliance === 'Adimplente' ? CheckCircle2 : AlertCircle} 
          color={memberStats?.compliance === 'Adimplente' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}
        />
        <StatCard 
          title="Mensalidades Pagas" 
          value={`${memberStats?.totalPayments || 0} / ${memberStats?.requiredPayments || 0}`} 
          icon={Wallet} 
          color="bg-indigo-50 text-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card title="Meses em Aberto" subtitle="Mensalidades pendentes de pagamento">
          <div className="mt-8 space-y-4">
            {paginatedMissingMonths.length > 0 ? (
              paginatedMissingMonths.map((month, idx) => (
                <div key={idx} className="list-item-base bg-rose-50 border-rose-100">
                  <div className="flex-items-center space-x-4">
                    <Clock className="text-rose-600" size={20} />
                    <span className="text-sm font-bold text-rose-900">{month}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-center flex-col py-8 text-center">
                <div className="icon-box bg-emerald-50 rounded-full mb-4">
                  <CheckCircle2 className="text-emerald-600" size={32} />
                </div>
                <p className="text-slate-900 font-bold">Tudo em dia!</p>
                <p className="text-slate-500 text-sm mt-1">Você não possui mensalidades pendentes.</p>
              </div>
            )}
          </div>

          {totalMissingPages > 1 && (
            <div className="flex-between mt-6 pt-6 border-t border-slate-100">
              <div className="flex-items-center space-x-2">
                <button 
                  onClick={() => setMissingPage(prev => Math.max(1, prev - 1))}
                  disabled={missingPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {missingPage} / {totalMissingPages}
                </span>
                <button 
                  onClick={() => setMissingPage(prev => Math.min(totalMissingPages, prev + 1))}
                  disabled={missingPage === totalMissingPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>

        <Card title="Minhas Presenças" subtitle="Sessões que você esteve presente">
          <div className="overflow-x-auto mt-8">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100">
                  <th className="pb-4 text-[10px] font-bold uppercase text-slate-400">Data</th>
                  <th className="pb-4 text-[10px] font-bold uppercase text-slate-400">Título</th>
                  <th className="pb-4 text-[10px] font-bold uppercase text-slate-400 text-right">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 text-xs font-bold text-slate-900">{s.date}</td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{s.title}</span>
                        <span className="text-[9px] text-slate-400 uppercase">{s.degree}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className="badge-base bg-slate-100 text-slate-600 text-[10px]">
                        {s.type}
                      </span>
                    </td>
                  </tr>
                ))}
                {userSessions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-sm text-slate-400 italic">
                      Nenhuma presença registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalSessionsPages > 1 && (
            <div className="flex-between mt-6 pt-6 border-t border-slate-100">
              <div className="flex-items-center space-x-2">
                <button 
                  onClick={() => setSessionsPage(prev => Math.max(1, prev - 1))}
                  disabled={sessionsPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {sessionsPage} / {totalSessionsPages}
                </span>
                <button 
                  onClick={() => setSessionsPage(prev => Math.min(totalSessionsPages, prev + 1))}
                  disabled={sessionsPage === totalSessionsPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
