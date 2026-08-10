import React, { useState, useEffect } from 'react';
import {
  User,
  Round,
  MemberRoundProgress,
  SystemConfig,
  ActivityLog,
  DayPayment,
} from './types';
import {
  getStoredConfig,
  getStoredUsers,
  getStoredRounds,
  getStoredProgress,
  getStoredLogs,
  getStoredCurrentUser,
  saveStoredConfig,
  saveStoredUsers,
  saveStoredRounds,
  saveStoredProgress,
  saveStoredLogs,
  saveStoredCurrentUser,
  addActivityLog,
  resetAllData,
  updateLastActiveTime,
} from './lib/storage';

// Components
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { UserPanel } from './components/UserPanel';
import { AdminPanel } from './components/AdminPanel';
import { QueueTimeline } from './components/QueueTimeline';
import { PayoutModal } from './components/PayoutModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { MemberManagementModal } from './components/MemberManagementModal';
import { ReportsPanel } from './components/ReportsPanel';

import {
  Coins,
  Crown,
  Users,
  ShieldAlert,
  Wallet,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<SystemConfig>(getStoredConfig());
  const [users, setUsers] = useState<User[]>(getStoredUsers());
  const [rounds, setRounds] = useState<Round[]>(getStoredRounds());
  const [progressMap, setProgressMap] = useState<Record<string, MemberRoundProgress[]>>(
    getStoredProgress()
  );
  const [logs, setLogs] = useState<ActivityLog[]>(getStoredLogs());
  
  // Retrieve logged in user from storage (valid within 30 mins of activity)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return getStoredCurrentUser();
  });

  const [activeTab, setActiveTab] = useState<string>('user_grid');
  
  // Open login modal automatically if no active session
  const [isLoginOpen, setIsLoginOpen] = useState(() => !getStoredCurrentUser());
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<{
    userId: string;
    dayNumber: number;
  } | null>(null);

  // Sync tab on role change
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      if (!activeTab.startsWith('admin_')) {
        setActiveTab('admin_dashboard');
      }
    } else if (currentUser?.role === 'user') {
      if (activeTab.startsWith('admin_')) {
        setActiveTab('user_grid');
      }
    }
  }, [currentUser]);

  // 30-Minute Inactivity Auto-Logout Handler
  useEffect(() => {
    if (!currentUser) return;

    updateLastActiveTime();

    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    const handleUserActivity = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          updateLastActiveTime();
          throttleTimer = null;
        }, 3000);
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    const interval = setInterval(() => {
      const lastActiveStr = localStorage.getItem('al_jamiah_last_active');
      if (lastActiveStr) {
        const inactiveMs = Date.now() - parseInt(lastActiveStr, 10);
        const THIRTY_MINUTES = 30 * 60 * 1000;
        if (inactiveMs >= THIRTY_MINUTES) {
          handleLogout();
        }
      }
    }, 10000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (throttleTimer) clearTimeout(throttleTimer);
      clearInterval(interval);
    };
  }, [currentUser]);

  // Current active round
  const currentRound = rounds.find((r) => r.status === 'active') || rounds[0] || null;
  const currentRoundProgress = currentRound ? progressMap[currentRound.id] || [] : [];

  // Helper to ensure current user progress exists
  const getCurrentUserProgress = (userId: string): MemberRoundProgress => {
    const found = currentRoundProgress.find((p) => p.userId === userId);
    if (found) return found;

    // Create default 10 payments if missing
    const defaultPayments: DayPayment[] = Array.from({ length: 10 }, (_, i) => ({
      dayNumber: i + 1,
      paid: false,
      amount: config.totalDays ? 10000 : 10000,
    }));

    return {
      userId,
      payments: defaultPayments,
    };
  };

  // Toggle or edit a payment for a member (Admin Only)
  const handleTogglePayment = (
    userId: string,
    dayNumber: number,
    paid: boolean,
    amount?: number,
    note?: string
  ) => {
    if (!currentRound) return;
    if (currentUser?.role !== 'admin') return;

    const roundId = currentRound.id;
    const currentProgressList = [...(progressMap[roundId] || [])];
    const userIndex = currentProgressList.findIndex((p) => p.userId === userId);

    let updatedPayments: DayPayment[] = [];

    if (userIndex >= 0) {
      updatedPayments = currentProgressList[userIndex].payments.map((p) => {
        if (p.dayNumber === dayNumber) {
          return {
            ...p,
            paid,
            amount: amount || p.amount || 10000,
            paidAt: paid ? new Date().toISOString() : undefined,
            note: paid ? note || 'تسديد يومي' : undefined,
          };
        }
        return p;
      });
      currentProgressList[userIndex] = {
        ...currentProgressList[userIndex],
        payments: updatedPayments,
      };
    } else {
      // User wasn't in round progress list yet
      const basePayments: DayPayment[] = Array.from({ length: 10 }, (_, i) => ({
        dayNumber: i + 1,
        paid: i + 1 === dayNumber ? paid : false,
        amount: 10000,
        paidAt: i + 1 === dayNumber && paid ? new Date().toISOString() : undefined,
      }));
      currentProgressList.push({
        userId,
        payments: basePayments,
      });
    }

    const updatedMap = {
      ...progressMap,
      [roundId]: currentProgressList,
    };

    setProgressMap(updatedMap);
    saveStoredProgress(updatedMap);

    // Activity Log
    const memberObj = users.find((u) => u.id === userId);
    const memberName = memberObj?.name || 'عضو';

    const actionText = paid
      ? `تسديد الخانة #${dayNumber} (${amount || 10000} ${config.currency})`
      : `إلغاء الخانة #${dayNumber}`;

    const newLogs = addActivityLog(
      currentUser?.id || 'system',
      currentUser?.name || 'النظام',
      actionText,
      `تم ${paid ? 'سداد' : 'إلغاء'} الخانة رقم ${dayNumber} للعضو ${memberName} في الدورة #${currentRound.roundNumber}`,
      'payment'
    );
    setLogs(newLogs);
  };

  // Login Handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);

    if (user.role === 'admin') {
      setActiveTab('admin_dashboard');
    } else {
      setActiveTab('user_grid');
    }

    const newLogs = addActivityLog(
      user.id,
      user.name,
      'تسجيل دخول للنظام',
      `دخول بصفة ${user.role === 'admin' ? 'مدير النظام' : 'عضو'}`,
      'system'
    );
    setLogs(newLogs);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredCurrentUser(null);
    setIsLoginOpen(true);
  };

  // Handover & Round Completion
  const handleConfirmHandover = (handoverNote: string, advanceNext: boolean) => {
    if (!currentRound) return;

    const currentReceiver = users.find((u) => u.id === currentRound.currentReceiverId);

    // 1. Mark current round as completed
    const updatedRounds = rounds.map((r) => {
      if (r.id === currentRound.id) {
        return {
          ...r,
          status: 'completed' as const,
          completedAt: new Date().toISOString(),
          handoverConfirmedAt: new Date().toISOString(),
          handoverNote,
        };
      }
      return r;
    });

    let newRoundObj: Round | null = null;
    let newMap = { ...progressMap };

    // 2. Advance to next round if requested
    if (advanceNext) {
      const memberUsers = users
        .filter((u) => u.role === 'user')
        .sort((a, b) => a.order - b.order);

      const nextRoundNum = currentRound.roundNumber + 1;
      
      // Calculate next receiver by queue order
      const nextReceiverIndex = (nextRoundNum - 1) % (memberUsers.length || 1);
      const nextReceiver = memberUsers[nextReceiverIndex] || memberUsers[0];

      newRoundObj = {
        id: `round_${nextRoundNum}_${Date.now()}`,
        roundNumber: nextRoundNum,
        currentReceiverId: nextReceiver.id,
        defaultDailyAmount: currentRound.defaultDailyAmount,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
      };

      updatedRounds.push(newRoundObj);

      // Initialize 10 empty slots for all members in new round
      const newRoundProgress: MemberRoundProgress[] = memberUsers.map((m) => ({
        userId: m.id,
        payments: Array.from({ length: 10 }, (_, i) => ({
          dayNumber: i + 1,
          paid: false,
          amount: m.dailyTargetAmount || 10000,
        })),
      }));

      newMap[newRoundObj.id] = newRoundProgress;
    }

    setRounds(updatedRounds);
    saveStoredRounds(updatedRounds);

    setProgressMap(newMap);
    saveStoredProgress(newMap);

    setIsPayoutModalOpen(false);

    const logText = `تم تسليم سُلفة الدورة #${currentRound.roundNumber} إلى (${currentReceiver?.name})`;
    const newLogs = addActivityLog(
      currentUser?.id || 'admin',
      currentUser?.name || 'الإدارة',
      'تسليم المبلغ وبدء دورة جديدة',
      `${logText} - ${handoverNote}`,
      'round'
    );
    setLogs(newLogs);
  };

  // Admin: Start New Round manually
  const handleStartNewRound = () => {
    const memberUsers = users
      .filter((u) => u.role === 'user')
      .sort((a, b) => a.order - b.order);

    const nextRoundNum = currentRound ? currentRound.roundNumber + 1 : (rounds.length + 1);
    const nextReceiverIndex = (nextRoundNum - 1) % (memberUsers.length || 1);
    const nextReceiver = memberUsers[nextReceiverIndex] || memberUsers[0] || null;

    const updatedRounds = rounds.map((r) =>
      r.status === 'active' ? { ...r, status: 'completed' as const } : r
    );

    const newRoundObj: Round = {
      id: `round_${nextRoundNum}_${Date.now()}`,
      roundNumber: nextRoundNum,
      currentReceiverId: nextReceiver ? nextReceiver.id : '',
      defaultDailyAmount: 10000,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
    };

    updatedRounds.push(newRoundObj);

    const newRoundProgress: MemberRoundProgress[] = memberUsers.map((m) => ({
      userId: m.id,
      payments: Array.from({ length: 10 }, (_, i) => ({
        dayNumber: i + 1,
        paid: false,
        amount: m.dailyTargetAmount || 10000,
      })),
    }));

    const newMap = {
      ...progressMap,
      [newRoundObj.id]: newRoundProgress,
    };

    setRounds(updatedRounds);
    saveStoredRounds(updatedRounds);

    setProgressMap(newMap);
    saveStoredProgress(newMap);

    const newLogs = addActivityLog(
      currentUser?.id || 'admin',
      currentUser?.name || 'الإدارة',
      `بدء الدورة رقم #${nextRoundNum}`,
      `تم إطلاق الدورة ومستلمها المعتمد: ${nextReceiver ? nextReceiver.name : 'لا يوجد أعضاء بعد'}`,
      'round'
    );
    setLogs(newLogs);
  };

  // Member Management Actions
  const handleAddMember = (memberData: Omit<User, 'id'>) => {
    const newId = `usr_${Date.now()}`;
    const newUser: User = { ...memberData, id: newId };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);

    // Get active round or auto-create Round 1 if none exists
    let activeR = currentRound;
    let updatedRounds = [...rounds];
    let updatedMap = { ...progressMap };

    if (!activeR) {
      activeR = {
        id: `round_1_${Date.now()}`,
        roundNumber: 1,
        currentReceiverId: newId,
        defaultDailyAmount: 10000,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
      };
      updatedRounds.push(activeR);
      setRounds(updatedRounds);
      saveStoredRounds(updatedRounds);
    }

    const currentList = [...(updatedMap[activeR.id] || [])];
    currentList.push({
      userId: newId,
      payments: Array.from({ length: 10 }, (_, i) => ({
        dayNumber: i + 1,
        paid: false,
        amount: newUser.dailyTargetAmount || 10000,
      })),
    });

    updatedMap[activeR.id] = currentList;
    setProgressMap(updatedMap);
    saveStoredProgress(updatedMap);

    const newLogs = addActivityLog(
      currentUser?.id || 'admin',
      currentUser?.name || 'الإدارة',
      `إضافة عضو جديد: ${newUser.name}`,
      `تمت إضافة ${newUser.name} بترتيب #${newUser.order}`,
      'user'
    );
    setLogs(newLogs);
  };

  const handleDeleteMember = (userId: string) => {
    const updatedUsers = users.filter((u) => u.id !== userId);
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);

    const newLogs = addActivityLog(
      currentUser?.id || 'admin',
      currentUser?.name || 'الإدارة',
      'حذف عضو',
      `تم إزالة الفرد صاحب الرقم ${userId}`,
      'user'
    );
    setLogs(newLogs);
  };

  const handleReorderMembers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);
  };

  const handleResetData = () => {
    resetAllData();
    setConfig(getStoredConfig());
    const freshUsers = getStoredUsers();
    setUsers(freshUsers);
    setRounds(getStoredRounds());
    setProgressMap(getStoredProgress());
    setLogs(getStoredLogs());
    const adminUser = freshUsers.find((u) => u.role === 'admin') || freshUsers[0] || null;
    setCurrentUser(adminUser);
    saveStoredCurrentUser(adminUser);
    if (adminUser) {
      setActiveTab('admin_dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Cairo',sans-serif]">
      
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        users={users}
        currentRound={currentRound}
        config={config}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogoutClick={handleLogout}
        onQuickSwitchUser={(u) => handleLoginSuccess(u)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 0: Logged Out Landing Page */}
        {!currentUser && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center max-w-xl mx-auto my-12 space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <UserCheck className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">مرحباً بك في نظام {config.associationName}</h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                يرجى تسجيل الدخول للوصول إلى لوحة التحكم الخاصة بك ومتابعة حالة الدفعات والسُلف.
              </p>
            </div>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl text-sm transition shadow-lg shadow-emerald-600/20 inline-flex items-center gap-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>تسجيل الدخول الآن</span>
            </button>
          </div>
        )}
        
        {/* VIEW 1: User Panel (جدول العضو الشخصي) */}
        {activeTab === 'user_grid' && currentUser && currentUser.role === 'user' && (
          <UserPanel
            currentUser={currentUser}
            users={users}
            currentRound={currentRound}
            userProgress={getCurrentUserProgress(currentUser.id)}
            allProgress={currentRoundProgress}
            config={config}
            onTogglePayment={(dayNum, paid, amt, note) =>
              handleTogglePayment(currentUser.id, dayNum, paid, amt, note)
            }
            onShowReceipt={(dayNum) =>
              setSelectedReceipt({ userId: currentUser.id, dayNumber: dayNum })
            }
            setActiveTab={setActiveTab}
          />
        )}

        {/* VIEW 2: Association Wide Table for Users (متابعة حالة بقية الأعضاء) */}
        {activeTab === 'association_view' && currentUser && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-right">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-2">
                <Users className="w-6 h-6 text-emerald-600" />
                <span>جدول متابعة كشوفات جميع الأعضاء</span>
              </h2>
              <p className="text-xs text-slate-500">
                جدول يبين إنجاز الـ 10 خانات لكافة أفراد الجمعية لضمان الشفافية واشتمال الدفعات.
              </p>
            </div>

            <QueueTimeline users={users} currentRound={currentRound} config={config} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {users
                .filter((u) => u.role === 'user')
                .map((m) => {
                  const mProg = getCurrentUserProgress(m.id);
                  return (
                    <div key={m.id}>
                      <UserPanel
                        currentUser={m}
                        users={users}
                        currentRound={currentRound}
                        userProgress={mProg}
                        allProgress={currentRoundProgress}
                        config={config}
                        onTogglePayment={(dayNum, paid, amt, note) =>
                          handleTogglePayment(m.id, dayNum, paid, amt, note)
                        }
                        onShowReceipt={(dayNum) =>
                          setSelectedReceipt({ userId: m.id, dayNumber: dayNum })
                        }
                        setActiveTab={setActiveTab}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* VIEW 3: User History Log */}
        {activeTab === 'user_history' && currentUser && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-right space-y-4">
            <h2 className="text-xl font-black text-slate-900">سجل دفعاتك واستلاماتك</h2>
            <div className="divide-y divide-slate-100 text-xs">
              {logs
                .filter((l) => l.userId === currentUser.id)
                .map((log) => (
                  <div key={log.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{log.action}</div>
                      <div className="text-slate-500">{log.details}</div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString('ar-SA')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW 4: Admin Dashboard (لوحة الإدارة) */}
        {activeTab === 'admin_dashboard' && currentUser?.role === 'admin' && (
          <AdminPanel
            users={users}
            currentRound={currentRound}
            allProgress={currentRoundProgress}
            config={config}
            onTogglePayment={handleTogglePayment}
            onOpenPayoutModal={() => setIsPayoutModalOpen(true)}
            onOpenMemberModal={() => setIsMemberModalOpen(true)}
            onStartNewRound={handleStartNewRound}
            onShowReceipt={(userId, dayNum) =>
              setSelectedReceipt({ userId, dayNumber: dayNum })
            }
            onResetData={handleResetData}
          />
        )}

        {/* VIEW 5: Admin Member Management */}
        {activeTab === 'admin_members' && currentUser?.role === 'admin' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-right space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">قائمة وإدارة الأفراد والترتيب</h2>
                <p className="text-xs text-slate-500">
                  إعادة تنظيم وترتيب تسليم المبالغ إضافة وحذف أفراد في الجمعية
                </p>
              </div>

              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                فتح نافذة إدارة الأفراد
              </button>
            </div>

            <QueueTimeline users={users} currentRound={currentRound} config={config} />
          </div>
        )}

        {/* VIEW 6: Financial Reports */}
        {activeTab === 'admin_reports' && currentUser?.role === 'admin' && (
          <ReportsPanel
            users={users}
            rounds={rounds}
            logs={logs}
            allProgress={currentRoundProgress}
            config={config}
          />
        )}
      </main>

      {/* Login Dialog Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        users={users}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Payout Handover Celebration Modal */}
      {currentRound && (
        <PayoutModal
          isOpen={isPayoutModalOpen}
          onClose={() => setIsPayoutModalOpen(false)}
          receiver={
            users.find((u) => u.id === currentRound.currentReceiverId) || users[1]
          }
          currentRound={currentRound}
          config={config}
          totalMembersCount={users.filter((u) => u.role === 'user').length}
          totalPoolAmount={users
            .filter((u) => u.role === 'user')
            .reduce((sum, u) => sum + (u.dailyTargetAmount || 10000) * 10, 0)}
          onConfirmHandover={handleConfirmHandover}
        />
      )}

      {/* Member Management Modal */}
      <MemberManagementModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        users={users}
        config={config}
        onAddMember={handleAddMember}
        onUpdateMember={(u) => {
          const updated = users.map((usr) => (usr.id === u.id ? u : usr));
          setUsers(updated);
          saveStoredUsers(updated);
        }}
        onDeleteMember={handleDeleteMember}
        onReorderMembers={handleReorderMembers}
      />

      {/* Individual Payment Voucher Receipt Modal */}
      {selectedReceipt && (
        <PaymentReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          member={
            users.find((u) => u.id === selectedReceipt.userId) || users[1]
          }
          payment={
            getCurrentUserProgress(selectedReceipt.userId).payments.find(
              (p) => p.dayNumber === selectedReceipt.dayNumber
            ) || {
              dayNumber: selectedReceipt.dayNumber,
              paid: true,
              amount: 10000,
            }
          }
          config={config}
          roundNumber={currentRound?.roundNumber || 1}
        />
      )}
    </div>
  );
}
