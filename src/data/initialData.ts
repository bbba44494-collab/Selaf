import { User, Round, MemberRoundProgress, SystemConfig, ActivityLog } from '../types';

export const initialConfig: SystemConfig = {
  associationName: 'سلف شخصية',
  currency: 'د.ع',
  totalDays: 10,
  autoAdvanceRound: false,
};

// Clean initial setup: Only Admin account exists by default
export const initialUsers: User[] = [
  {
    id: 'admin_1',
    name: 'مدير الجمعية (الإدارة)',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    order: 0,
    phone: '0500000000',
    avatarBg: 'bg-emerald-700',
    dailyTargetAmount: 10000,
  },
];

// Completely empty rounds and mock data
export const initialRounds: Round[] = [];

export const initialProgressMap: Record<string, MemberRoundProgress[]> = {};

export const initialActivityLogs: ActivityLog[] = [];
