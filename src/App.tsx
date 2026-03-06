import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { ProtectedRoute } from './components/auth/ProtectedRoute';

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
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchData();
      fetchSettings();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const path = location.pathname.replace('/', '') as Tab;
      const validTabs: Tab[] = ['dashboard', 'treasury', 'attendance', 'members', 'settings', 'profile', 'access-control'];
      if (path && validTabs.includes(path)) {
        setActiveTab(path);
      } else if (location.pathname === '/') {
        setActiveTab('dashboard');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [location, user, navigate]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

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
    const data: any = Object.fromEntries(formData);
    
    // Fix: Checkboxes should be boolean to avoid truthy string '0' issue in backend
    data.paysThroughLodge = formData.get('paysThroughLodge') === 'on';
    data.disconnected = formData.get('disconnected') === 'on';
    data.frequencyExempt = formData.get('frequencyExempt') === 'on';
    
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
      const val = formData.get(`attendance_${m.id}`);
      attendance[m.id] = val === 'on';
    });

    const url = editingSession ? `/api/sessions/${editingSession.id}` : '/api/sessions';
    const method = editingSession ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
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
      setEditingSession(null);
      fetchData();
      toast.success(editingSession ? "Sessão atualizada com sucesso!" : "Sessão registrada com sucesso!");
    } else {
      toast.error(editingSession ? "Erro ao atualizar sessão." : "Erro ao registrar sessão.");
    }
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setShowSessionModal(true);
  };

  const handleDeleteSession = async (id: number) => {
    // Usando toast para confirmação, evitando bloqueios de iframe do window.confirm
    toast("Deseja realmente excluir esta sessão?", {
      description: "Esta ação não pode ser desfeita.",
      action: {
        label: "Confirmar Exclusão",
        onClick: async () => {
          toast.loading("Excluindo sessão...", { id: "delete-session" });
          try {
            const res = await fetch(`/api/sessions/${id}`, { 
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            });
            
            if (res.ok) {
              await fetchData();
              toast.success("Sessão excluída com sucesso!", { id: "delete-session" });
            } else {
              const errorData = await res.json();
              toast.error(errorData.error || "Erro ao excluir sessão.", { id: "delete-session" });
            }
          } catch (error) {
            console.error("Erro ao excluir sessão:", error);
            toast.error("Erro de conexão ao excluir sessão.", { id: "delete-session" });
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => console.log("Exclusão cancelada"),
      },
    });
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

  const handleToggleFrequencyExempt = async (id: number) => {
    const res = await fetch(`/api/members/${id}/toggle-frequency-exempt`, { method: 'PATCH' });
    if (res.ok) {
      fetchData();
      toast.success("Abono de frequência atualizado!");
    } else {
      toast.error("Erro ao atualizar abono.");
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
        setActiveTab={handleTabChange} 
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

        <div className="page-container overflow-y-auto">
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute user={user} permission="dashboard">
                  <Dashboard user={user} transactions={transactions} sessions={sessions} />
                </ProtectedRoute>
              } />
              
              <Route path="/treasury" element={
                <ProtectedRoute user={user} permission="treasury">
                  <Treasury stats={stats} transactions={transactions} onAddTransaction={() => setShowTransactionModal(true)} />
                </ProtectedRoute>
              } />
              
              <Route path="/attendance" element={
                <ProtectedRoute user={user} permission="attendance">
                  <Attendance 
                    sessions={sessions} 
                    onNewSession={() => { setEditingSession(null); setShowSessionModal(true); }} 
                    onEditSession={handleEditSession}
                    onDeleteSession={handleDeleteSession}
                  />
                </ProtectedRoute>
              } />
              
              <Route path="/members" element={
                <ProtectedRoute user={user} permission="members">
                  <Members 
                    members={members} 
                    transactions={transactions} 
                    onAddMember={() => { setEditingMember(null); setShowMemberModal(true); }} 
                    onEditMember={handleEditMember} 
                    onToggleDisconnected={handleToggleDisconnected} 
                    onTogglePays={handleTogglePays}
                    onToggleFrequencyExempt={handleToggleFrequencyExempt}
                  />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute user={user} permission="settings">
                  <Settings palavraSemestral={palavraSemestral} onUpdatePalavra={handleUpdatePalavra} />
                </ProtectedRoute>
              } />
              
              <Route path="/access-control" element={
                <ProtectedRoute user={user} permission="access-control">
                  <AccessControl members={members} onUpdatePermissions={handleUpdatePermissions} />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute user={user} permission="profile">
                  <Profile user={user} onUpdateUser={setUser} />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </main>

      {showTransactionModal && <TransactionModal members={members} onClose={() => setShowTransactionModal(false)} onSubmit={handleAddTransaction} />}
      {showMemberModal && <MemberModal member={editingMember} onClose={() => { setShowMemberModal(false); setEditingMember(null); }} onSubmit={handleAddMember} />}
      {showSessionModal && <SessionModal members={members} session={editingSession} onClose={() => { setShowSessionModal(false); setEditingSession(null); }} onSubmit={handleNewSession} />}
    </div>
  );
}

export default App;
