import React from 'react';
import { LayoutDashboard, Wallet, Calendar, Users, Settings as SettingsIcon, LogOut, UserCircle, ShieldCheck, X } from 'lucide-react';
import { SidebarItem } from '../ui/SidebarItem';
import { Tab, Member } from '../../types';
import { TAB_LABELS } from '../../constants';
import { cn } from '../../lib/utils';

export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  isSidebarOpen, 
  setIsSidebarOpen,
  user, 
  onLogout 
}: { 
  activeTab: Tab; 
  setActiveTab: (tab: Tab) => void; 
  isSidebarOpen: boolean; 
  setIsSidebarOpen: (open: boolean) => void;
  user: Member;
  onLogout: () => void;
}) => {
  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-white transition-transform duration-300 lg:relative lg:translate-x-0 border-r border-white/5",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                 <img 
                  src="/images/HeJ.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://picsum.photos/seed/masonic/100/100";
                  }}
                />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight leading-tight">Humildade e Justiça</h1>
                <p className="text-[9px] text-amber-400 uppercase tracking-widest font-bold">Nº 4866</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors lg:hidden text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {user.permissions?.includes('dashboard') && (
              <SidebarItem 
                icon={LayoutDashboard} 
                label={TAB_LABELS.dashboard} 
                active={activeTab === 'dashboard'} 
                onClick={() => handleTabClick('dashboard')} 
              />
            )}
            {user.permissions?.includes('treasury') && (
              <SidebarItem 
                icon={Wallet} 
                label={TAB_LABELS.treasury} 
                active={activeTab === 'treasury'} 
                onClick={() => handleTabClick('treasury')} 
              />
            )}
            {user.permissions?.includes('attendance') && (
              <SidebarItem 
                icon={Calendar} 
                label={TAB_LABELS.attendance} 
                active={activeTab === 'attendance'} 
                onClick={() => handleTabClick('attendance')} 
              />
            )}
            {user.permissions?.includes('members') && (
              <SidebarItem 
                icon={Users} 
                label={TAB_LABELS.members} 
                active={activeTab === 'members'} 
                onClick={() => handleTabClick('members')} 
              />
            )}
            {user.permissions?.includes('settings') && (
              <SidebarItem 
                icon={SettingsIcon} 
                label={TAB_LABELS.settings} 
                active={activeTab === 'settings'} 
                onClick={() => handleTabClick('settings')} 
              />
            )}
            {user.permissions?.includes('access-control') && (
              <SidebarItem 
                icon={ShieldCheck} 
                label={TAB_LABELS['access-control']} 
                active={activeTab === 'access-control'} 
                onClick={() => handleTabClick('access-control')} 
              />
            )}
          </nav>

          <div className="pt-6 border-t border-white/10 space-y-2">
            <button 
              onClick={() => handleTabClick('profile')}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-200",
                activeTab === 'profile' ? "bg-amber-400 text-black font-bold" : "text-slate-400 hover:bg-white/5"
              )}
            >
              <UserCircle size={20} />
              <span className="text-sm">Meu Perfil</span>
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium text-sm">Sair do Portal</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
