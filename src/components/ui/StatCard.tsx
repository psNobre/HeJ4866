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
  <div className="card-base card-content group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
    <div className="flex-between mb-6">
      <div className={cn("icon-box rounded-3xl transition-transform duration-500 group-hover:scale-110", color)}>
        <Icon size={32} />
      </div>
      {trend && (
        <div className={cn("badge-base", trend.positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
    <p className="text-muted text-sm font-medium mb-1">{title}</p>
    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
  </div>
);
