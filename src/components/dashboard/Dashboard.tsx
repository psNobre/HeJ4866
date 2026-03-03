import React from 'react';
import { Wallet, Users, Calendar, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Stats, Transaction, Session } from '../../types';
import { StatCard } from '../ui/StatCard';
import { Card } from '../ui/Card';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Fev', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Abr', value: 2780 },
  { name: 'Mai', value: 1890 },
  { name: 'Jun', value: 2390 },
];

export const Dashboard = ({ stats, transactions, sessions }: { 
  stats: Stats; 
  transactions: Transaction[]; 
  sessions: Session[];
}) => (
  <div className="space-y-10">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <StatCard 
        title="Saldo em Caixa" 
        value={`R$ ${stats.balance.toLocaleString()}`} 
        icon={Wallet} 
        color="bg-emerald-50 text-emerald-600"
        trend={{ value: "+12%", positive: true }}
      />
      <StatCard 
        title="Obreiros Ativos" 
        value={stats.activeMembers} 
        icon={Users} 
        color="bg-indigo-50 text-indigo-600"
      />
      <StatCard 
        title="Frequência Média" 
        value={`${stats.lastAttendanceRate}%`} 
        icon={Calendar} 
        color="bg-amber-50 text-amber-600"
        trend={{ value: "-2%", positive: false }}
      />
      <StatCard 
        title="Receita Mensal" 
        value={`R$ ${stats.income.toLocaleString()}`} 
        icon={TrendingUp} 
        color="bg-rose-50 text-rose-600"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <Card className="lg:col-span-2" title="Fluxo de Caixa" subtitle="Movimentação financeira dos últimos 6 meses">
        <div className="h-[400px] w-full mt-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Últimas Atividades" subtitle="Movimentações recentes">
        <div className="space-y-6 mt-10">
          {transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-3 rounded-2xl transition-colors">
              <div className="flex items-center space-x-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                  {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.description}</p>
                  <p className="text-xs text-slate-500 font-medium">{t.date}</p>
                </div>
              </div>
              <span className={cn("text-sm font-bold", t.type === 'income' ? "text-emerald-600" : "text-rose-600")}>
                {t.type === 'income' ? '+' : '-'} R$ {t.amount}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
