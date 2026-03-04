import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Member, Transaction, Session, Stats, Tab } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { Treasury } from './components/treasury/Treasury';
import { Attendance } from './components/attendance/Attendance';
import { Members } from './components/members/Members';
import { Settings } from './components/settings/Settings';
import { LoginForm } from './components/auth/LoginForm';
import { ChangePasswordForm } from './components/auth/ChangePasswordForm';
import { TransactionModal } from './components/treasury/TransactionModal';
import { MemberModal } from './components/members/MemberModal';
import { SessionModal } from './components/attendance/SessionModal';
import { Profile } from './components/profile/Profile';
import { AccessControl } from './components/access/AccessControl';

function App() {
  const [user, setUser] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({ balance: 0, income: 0, expense: 0, activeMembers: 0, lastAttendanceRate: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [palavraSemestral, setPalavraSemestral] = useState('');
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchSettings();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, transRes, sessRes, membRes] = await Promise.all([
        fetch('/api/transactions/stats'),
        fetch('/api/transactions'),
        fetch('/api/sessions'),
        fetch('/api/members')
      ]);
      
      setStats(await statsRes.json());
      setTransactions(await transRes.json());
      setSessions(await sessRes.json());
      setMembers(await membRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchSettings = async () => {
    const res = await fetch('/api/settings/palavra');
    const data = await res.json();
    setPalavraSemestral(data.value);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData))
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      toast.success(`Bem-vindo, ${data.user.name}!`);
    } else {
      toast.error(data.error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user?.id, newPassword })
    });
    const data = await res.json();
    if (data.success) {
      setUser({ ...user!, mustChangePassword: 0 });
      toast.success("Senha alterada com sucesso!");
    } else {
      toast.error(data.error || "Erro ao alterar senha.");
    }
  };

  const handleAddTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      setShowTransactionModal(false);
      fetchData();
      toast.success("Transação registrada com sucesso!");
    } else {
      toast.error("Erro ao registrar transação.");
    }
  };

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    data.paysThroughLodge = data.paysThroughLodge === 'on' ? '1' : '0';
    data.disconnected = data.disconnected === 'on' ? '1' : '0';
    
    const url = editingMember ? `/api/members/${editingMember.id}` : '/api/members';
    const method = editingMember ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      setShowMemberModal(false);
      setEditingMember(null);
      fetchData();
      toast.success(editingMember ? "Obreiro atualizado com sucesso!" : "Obreiro cadastrado com sucesso!");
    } else {
      toast.error(editingMember ? "Erro ao atualizar obreiro." : "Erro ao cadastrar obreiro.");
    }
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowMemberModal(true);
  };

  const handleNewSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const attendance: Record<string, boolean> = {};
    
    members.forEach(m => {
      attendance[m.id] = formData.get(`attendance_${m.id}`) === 'on';
    });

    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: formData.get('date'),
        title: formData.get('title'),
        type: formData.get('type'),
        degree: formData.get('degree'),
        description: formData.get('description'),
        attendance
      })
    });
    if (res.ok) {
      setShowSessionModal(false);
      fetchData();
      toast.success("Sessão registrada com sucesso!");
    } else {
      toast.error("Erro ao registrar sessão.");
    }
  };

  const handleToggleDisconnected = async (id: number) => {
    const res = await fetch(`/api/members/${id}/toggle-disconnected`, { method: 'PATCH' });
    if (res.ok) {
      fetchData();
      toast.success("Status do obreiro atualizado!");
    } else {
      toast.error("Erro ao atualizar status.");
    }
  };

  const handleTogglePays = async (id: number) => {
    const res = await fetch(`/api/members/${id}/toggle-pays`, { method: 'PATCH' });
    if (res.ok) {
      fetchData();
      toast.success("Configuração de pagamento atualizada!");
    } else {
      toast.error("Erro ao atualizar configuração.");
    }
  };

  const handleUpdatePalavra = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newValue = formData.get('palavra') as string;
    
    if (newValue === '********') {
      toast.info("Nenhuma alteração detectada na Palavra Semestral.");
      return;
    }

    const res = await fetch('/api/settings/palavra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: newValue })
    });
    if (res.ok) {
      toast.success("Configurações atualizadas com sucesso!");
      fetchSettings();
    } else {
      toast.error("Erro ao atualizar configurações.");
    }
  };

  const handleUpdatePermissions = async (memberId: number, permissions: string[]) => {
    const res = await fetch(`/api/members/${memberId}/permissions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions })
    });
    if (res.ok) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, permissions } : m));
    } else {
      throw new Error("Failed to update permissions");
    }
  };

  if (!user) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginForm onLogin={handleLogin} />
      </>
    );
  }

  if (user.mustChangePassword) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <ChangePasswordForm onChangePassword={handleChangePassword} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <Toaster position="top-right" richColors />
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSidebarOpen={isSidebarOpen} 
        user={user} 
        onLogout={() => setUser(null)} 
      />

      <main className="flex-1 flex flex-col min-w-0">
        <Header 
          activeTab={activeTab} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          user={user} 
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard user={user} transactions={transactions} sessions={sessions} />}
            {activeTab === 'treasury' && <Treasury stats={stats} transactions={transactions} onAddTransaction={() => setShowTransactionModal(true)} />}
            {activeTab === 'attendance' && <Attendance sessions={sessions} onNewSession={() => setShowSessionModal(true)} />}
            {activeTab === 'members' && <Members members={members} transactions={transactions} onAddMember={() => { setEditingMember(null); setShowMemberModal(true); }} onEditMember={handleEditMember} onToggleDisconnected={handleToggleDisconnected} onTogglePays={handleTogglePays} />}
            {activeTab === 'settings' && <Settings palavraSemestral={palavraSemestral} onUpdatePalavra={handleUpdatePalavra} />}
            {activeTab === 'access-control' && <AccessControl members={members} onUpdatePermissions={handleUpdatePermissions} />}
            {activeTab === 'profile' && <Profile user={user} onUpdateUser={setUser} />}
          </div>
        </div>
      </main>

      {showTransactionModal && <TransactionModal members={members} onClose={() => setShowTransactionModal(false)} onSubmit={handleAddTransaction} />}
      {showMemberModal && <MemberModal member={editingMember} onClose={() => { setShowMemberModal(false); setEditingMember(null); }} onSubmit={handleAddMember} />}
      {showSessionModal && <SessionModal members={members} onClose={() => setShowSessionModal(false)} onSubmit={handleNewSession} />}
    </div>
  );
}

export default App;
