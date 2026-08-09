export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  order: number; // Order in the payout sequence (1 = 1st round receiver, 2 = 2nd round, etc.)
  phone?: string;
  avatarBg?: string;
  dailyTargetAmount: number; // e.g., 10000 IQD per slot
}

export interface DayPayment {
  dayNumber: number; // 1 to 10
  paid: boolean;
  amount: number;
  paidAt?: string; // ISO date string
  note?: string;
  paymentMethod?: 'cash' | 'bank_transfer' | 'digital_wallet';
}

export interface MemberRoundProgress {
  userId: string;
  payments: DayPayment[]; // Exactly 10 items
}

export interface Round {
  id: string;
  roundNumber: number;
  currentReceiverId: string;
  defaultDailyAmount: number; // default amount per slot
  status: 'active' | 'completed' | 'handover_pending';
  startDate: string;
  completedAt?: string;
  handoverConfirmedAt?: string;
  handoverNote?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  type: 'payment' | 'round' | 'user' | 'system';
}

export interface SystemConfig {
  associationName: string;
  currency: string;
  totalDays: number; // default 10
  autoAdvanceRound: boolean;
}
