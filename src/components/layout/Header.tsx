import React from 'react';
import { Menu, History } from 'lucide-react';
import { Tab, Member } from '../../types';
import { TAB_LABELS } from '../../constants';

export const Header = ({ 
  activeTab, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  user 
}: { 
  activeTab: Tab; 
  isSidebarOpen: boolean; 
  setIsSidebarOpen: (open: boolean) => void; 
  user: Member;
}) => (
  <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
    <div className="flex items-center space-x-6">
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="p-3 hover:bg-slate-50 rounded-2xl transition-all lg:hidden"
      >
        <Menu size={24} className="text-slate-600" />
      </button>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{TAB_LABELS[activeTab]}</h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Bem-vindo, Ir∴ {user.name}</p>
      </div>
    </div>

    <div className="flex items-center space-x-4">
      <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg relative">
        <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        <History size={20} />
      </button>
      <div className="h-8 w-px bg-slate-200 mx-2" />
      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-lodge-green">A.R.L.S. Humildade e Justiça</p>
          <p className="text-[10px] text-lodge-gold uppercase font-bold tracking-wider">Nº 4866</p>
        </div>
      </div>
    </div>
  </header>
);
