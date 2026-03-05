import React, { useEffect, useState } from 'react';
import { Wallet, Calendar, AlertCircle, CheckCircle2, Clock, ListChecks } from 'lucide-react';
import { Member, Transaction, Session } from '../../types';
import { StatCard } from '../ui/StatCard';
import { Card } from '../ui/Card';

interface MemberStats {
  attendanceRate: number;
  compliance: string;
  missingMonths: string[];
  totalPayments: number;
  requiredPayments: number;
}

export const Dashboard = ({ user, transactions, sessions }: { 
  user: Member; 
  transactions: Transaction[]; 
  sessions: Session[];
}) => {
  const [memberStats, setMemberStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberStats = async () => {
      try {
        const res = await fetch(`/api/members/${user.id}/stats`);
        const data = await res.json();
        setMemberStats(data);
      } catch (error) {
        console.error("Error fetching member stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberStats();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lodge-green"></div>
      </div>
    );
  }

  const userTransactions = transactions.filter(t => t.memberId === user.id);

  return (
    <div className="space-y-10">
      <div className="card-base card-content">
        <h1 className="heading-display">Olá, {user.name}</h1>
        <p className="text-muted mt-2">Bem-vindo ao seu painel pessoal. Aqui você pode acompanhar sua situação na Loja.</p>
      </div>

      <div className="grid-cols-3-responsive">
        <StatCard 
          title="Sua Frequência" 
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

      <div className="grid grid-cols-1 gap-10">
        <Card title="Meses em Aberto" subtitle="Mensalidades pendentes de pagamento">
          <div className="mt-8 space-y-4">
            {memberStats?.missingMonths && memberStats.missingMonths.length > 0 ? (
              memberStats.missingMonths.map((month, idx) => (
                <div key={idx} className="list-item-base bg-rose-50 border-rose-100">
                  <div className="flex-items-center space-x-4">
                    <Clock className="text-rose-600" size={20} />
                    <span className="text-sm font-bold text-rose-900">{month}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-center flex-col py-12 text-center">
                <div className="icon-box bg-emerald-50 rounded-full mb-4">
                  <CheckCircle2 className="text-emerald-600" size={32} />
                </div>
                <p className="text-slate-900 font-bold">Tudo em dia!</p>
                <p className="text-slate-500 text-sm mt-1">Você não possui mensalidades pendentes.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
