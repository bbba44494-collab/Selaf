import {
  User,
  Round,
  MemberRoundProgress,
  SystemConfig,
  ActivityLog,
  DayPayment,
} from '../types';
import {
  initialConfig,
  initialUsers,
  initialRounds,
  initialProgressMap,
  initialActivityLogs,
} from '../data/initialData';

const KEYS = {
  CONFIG: 'jamia_config_v1',
  USERS: 'jamia_users_v1',
  ROUNDS: 'jamia_rounds_v1',
  PROGRESS: 'jamia_progress_v1',
  LOGS: 'jamia_logs_v1',
  CURRENT_USER: 'jamia_current_user_v1',
};

export const getStoredConfig = (): SystemConfig => {
  try {
    const data = localStorage.getItem(KEYS.CONFIG);
    if (!data) return initialConfig;
    const parsed = JSON.parse(data);
    let updated = false;
    if (parsed.associationName === 'جمعية التكافل والتعاون المالية' || parsed.associationName === 'نظام الجمعية المالية') {
      parsed.associationName = 'سلف شخصية';
      updated = true;
    }
    if (parsed.currency === 'ر.س') {
      parsed.currency = 'د.ع';
      updated = true;
    }
    if (updated) {
      saveStoredConfig(parsed);
    }
    return parsed;
  } catch {
    return initialConfig;
  }
};

export const saveStoredConfig = (config: SystemConfig): void => {
  localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
};

export const getStoredUsers = (): User[] => {
  try {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : initialUsers;
  } catch {
    return initialUsers;
  }
};

export const saveStoredUsers = (users: User[]): void => {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const getStoredRounds = (): Round[] => {
  try {
    const data = localStorage.getItem(KEYS.ROUNDS);
    return data ? JSON.parse(data) : initialRounds;
  } catch {
    return initialRounds;
  }
};

export const saveStoredRounds = (rounds: Round[]): void => {
  localStorage.setItem(KEYS.ROUNDS, JSON.stringify(rounds));
};

export const getStoredProgress = (): Record<string, MemberRoundProgress[]> => {
  try {
    const data = localStorage.getItem(KEYS.PROGRESS);
    return data ? JSON.parse(data) : initialProgressMap;
  } catch {
    return initialProgressMap;
  }
};

export const saveStoredProgress = (progress: Record<string, MemberRoundProgress[]>): void => {
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
};

export const getStoredLogs = (): ActivityLog[] => {
  try {
    const data = localStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : initialActivityLogs;
  } catch {
    return initialActivityLogs;
  }
};

export const saveStoredLogs = (logs: ActivityLog[]): void => {
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
};

export const addActivityLog = (
  userId: string,
  userName: string,
  action: string,
  details: string,
  type: ActivityLog['type'] = 'payment'
): ActivityLog[] => {
  const currentLogs = getStoredLogs();
  const newLog: ActivityLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    userId,
    userName,
    action,
    details,
    type,
  };
  const updatedLogs = [newLog, ...currentLogs];
  saveStoredLogs(updatedLogs);
  return updatedLogs;
};

export const getStoredCurrentUser = (): User | null => {
  try {
    // Clear any stale persistent user session from localStorage to force login on new link visits
    localStorage.removeItem(KEYS.CURRENT_USER);
    const data = sessionStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveStoredCurrentUser = (user: User | null): void => {
  localStorage.removeItem(KEYS.CURRENT_USER);
  if (user) {
    sessionStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(KEYS.CURRENT_USER);
  }
};

export const resetAllData = (): void => {
  localStorage.setItem(KEYS.CONFIG, JSON.stringify(initialConfig));
  localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
  localStorage.setItem(KEYS.ROUNDS, JSON.stringify(initialRounds));
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(initialProgressMap));
  localStorage.setItem(KEYS.LOGS, JSON.stringify(initialActivityLogs));
  localStorage.removeItem(KEYS.CURRENT_USER);
};
