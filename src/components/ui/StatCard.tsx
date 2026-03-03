import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export const StatCard = ({ title, value, icon: Icon, color, trend }: { 
  title: string; 
  value: string | number; 
  icon: LucideIcon; 
  color: string;
  trend?: { value: string; positive: boolean };
}) => (
  <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
    <div className="flex items-start justify-between mb-6">
      <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110", color)}>
        <Icon size={32} />
      </div>
      {trend && (
        <div className={cn("flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold", trend.positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
    <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
  </div>
);
