export interface Member {
  id: number;
  cim: string;
  name: string;
  degree: string;
  role: string;
  initiationDate?: string;
  elevationDate?: string;
  exaltationDate?: string;
  paysThroughLodge: number;
  disconnected: number;
  active: number;
  mustChangePassword: number;
}

export type TransactionCategory = 
  | 'Ágape'
  | 'Aluguel'
  | 'Anuidade'
  | 'Auxílio Funeral'
  | 'Beneficência'
  | 'Campanhas'
  | 'Contador'
  | 'Doação'
  | 'Jóia de Recepção'
  | 'Lojinha'
  | 'Materiais'
  | 'Materiais Perecíveis'
  | 'Mensalidade'
  | 'Multas'
  | 'Outros'
  | 'Pagamento'
  | 'Paramentos'
  | 'Segurança'
  | 'Taxas do GOB Estadual'
  | 'Taxas do GOB Federal'
  | 'Tronco de Beneficência';

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: TransactionCategory;
  memberId?: number;
  memberName?: string; // For UI convenience
}

export interface Session {
  id: number;
  date: string;
  title: string;
  type: 'Ordinária' | 'Magna' | 'Pública' | 'Administrativa';
  degree: 'Aprendiz' | 'Companheiro' | 'Mestre';
  description?: string;
}

export interface Stats {
  balance: number;
  income: number;
  expense: number;
  activeMembers: number;
  lastAttendanceRate: number;
}

export type Tab = 'dashboard' | 'treasury' | 'attendance' | 'members' | 'settings';
