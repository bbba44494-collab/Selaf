import {
  User,
  Round,
  MemberRoundProgress,
  SystemConfig,
  ActivityLog,
} from '../types';
import {
  initialConfig,
  initialUsers,
  initialRounds,
  initialProgressMap,
  initialActivityLogs,
} from '../data/initialData';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const KEYS = {
  CONFIG: 'jamia_config_v1',
  USERS: 'jamia_users_v1',
  ROUNDS: 'jamia_rounds_v1',
  PROGRESS: 'jamia_progress_v1',
  LOGS: 'jamia_logs_v1',
  CURRENT_USER: 'jamia_current_user_v1',
};

// Firestore document references
const configDocRef = doc(db, 'system', 'config');
const usersDocRef = doc(db, 'system', 'users');
const roundsDocRef = doc(db, 'system', 'rounds');
const progressDocRef = doc(db, 'system', 'progress');
const logsDocRef = doc(db, 'system', 'logs');

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
  setDoc(configDocRef, config).catch((err) => console.error('Error saving config to Firestore:', err));
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
  setDoc(usersDocRef, { list: users }).catch((err) => console.error('Error saving users to Firestore:', err));
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
  setDoc(roundsDocRef, { list: rounds }).catch((err) => console.error('Error saving rounds to Firestore:', err));
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
  setDoc(progressDocRef, { map: progress }).catch((err) => console.error('Error saving progress to Firestore:', err));
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
  setDoc(logsDocRef, { list: logs }).catch((err) => console.error('Error saving logs to Firestore:', err));
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

export const updateLastActiveTime = (): void => {
  try {
    localStorage.setItem('al_jamiah_last_active', Date.now().toString());
  } catch {
    // Ignore storage errors
  }
};

export const getStoredCurrentUser = (): User | null => {
  try {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    if (!data) return null;

    const lastActive = localStorage.getItem('al_jamiah_last_active');
    if (lastActive) {
      const diff = Date.now() - parseInt(lastActive, 10);
      const THIRTY_MINUTES = 30 * 60 * 1000;
      if (diff > THIRTY_MINUTES) {
        // Session expired due to 30 mins of inactivity
        localStorage.removeItem(KEYS.CURRENT_USER);
        localStorage.removeItem('al_jamiah_last_active');
        return null;
      }
    }

    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const saveStoredCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem('al_jamiah_last_active', Date.now().toString());
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
    localStorage.removeItem('al_jamiah_last_active');
  }
};

export const resetAllData = (): void => {
  saveStoredConfig(initialConfig);
  saveStoredUsers(initialUsers);
  saveStoredRounds(initialRounds);
  saveStoredProgress(initialProgressMap);
  saveStoredLogs(initialActivityLogs);
  localStorage.removeItem(KEYS.CURRENT_USER);
};

export interface SyncData {
  config?: SystemConfig;
  users?: User[];
  rounds?: Round[];
  progressMap?: Record<string, MemberRoundProgress[]>;
  logs?: ActivityLog[];
}

export const subscribeToFirestoreStore = (onSync: (data: SyncData) => void): (() => void) => {
  const unsubConfig = onSnapshot(configDocRef, (snapshot) => {
    if (snapshot.exists()) {
      const cfg = snapshot.data() as SystemConfig;
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(cfg));
      onSync({ config: cfg });
    } else {
      // Seed initial config
      saveStoredConfig(getStoredConfig());
    }
  });

  const unsubUsers = onSnapshot(usersDocRef, (snapshot) => {
    if (snapshot.exists()) {
      const users = (snapshot.data()?.list || []) as User[];
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      onSync({ users });
    } else {
      // Seed initial users
      saveStoredUsers(getStoredUsers());
    }
  });

  const unsubRounds = onSnapshot(roundsDocRef, (snapshot) => {
    if (snapshot.exists()) {
      const rounds = (snapshot.data()?.list || []) as Round[];
      localStorage.setItem(KEYS.ROUNDS, JSON.stringify(rounds));
      onSync({ rounds });
    } else {
      // Seed initial rounds
      saveStoredRounds(getStoredRounds());
    }
  });

  const unsubProgress = onSnapshot(progressDocRef, (snapshot) => {
    if (snapshot.exists()) {
      const progressMap = (snapshot.data()?.map || {}) as Record<string, MemberRoundProgress[]>;
      localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progressMap));
      onSync({ progressMap });
    } else {
      // Seed initial progress
      saveStoredProgress(getStoredProgress());
    }
  });

  const unsubLogs = onSnapshot(logsDocRef, (snapshot) => {
    if (snapshot.exists()) {
      const logs = (snapshot.data()?.list || []) as ActivityLog[];
      localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
      onSync({ logs });
    } else {
      // Seed initial logs
      saveStoredLogs(getStoredLogs());
    }
  });

  return () => {
    unsubConfig();
    unsubUsers();
    unsubRounds();
    unsubProgress();
    unsubLogs();
  };
};
