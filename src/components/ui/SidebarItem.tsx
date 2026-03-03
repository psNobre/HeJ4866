import React from 'react';
import { LucideIcon } from 'lucide-react';

export const SidebarItem = ({ icon: Icon, label, active, onClick }: { 
  icon: LucideIcon; 
  label: string; 
  active?: boolean; 
  onClick: () => void;
}) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
      active 
        ? 'bg-lodge-green text-white shadow-lg shadow-lodge-green/20' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon size={20} className={active ? 'text-lodge-gold' : 'group-hover:text-lodge-gold transition-colors'} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);
