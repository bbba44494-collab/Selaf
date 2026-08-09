import React, { useState } from 'react';
import { User, Round, SystemConfig } from '../types';
import {
  Wallet,
  ShieldAlert,
  UserCheck,
  LogOut,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Users,
  LayoutDashboard,
  FileText,
  Clock,
  Coins,
  Crown,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  users: User[];
  currentRound: Round | null;
  config: SystemConfig;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onQuickSwitchUser: (user: User) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  currentRound,
  config,
  activeTab,
  setActiveTab,
  onLoginClick,
  onLogoutClick,
  onQuickSwitchUser,
  onResetData,
}) => {
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const memberUsers = users.filter((u) => u.role === 'user');
  const currentReceiver = users.find((u) => u.id === currentRound?.currentReceiverId);
  const activeMembersCount = memberUsers.length;
  const totalPoolAmount = memberUsers.reduce((sum, u) => sum + (u.dailyTargetAmount || 10000) * 10, 0);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-900/30 ring-2 ring-emerald-400/20">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {config.associationName}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  سُلفة 10 أيام
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                نظام الجمعيات المالية والسُلف الشخصية التكافلية
              </p>
            </div>
          </div>

          {/* Round Summary Bar (Center) */}
          {currentRound && (
            <div className="hidden lg:flex items-center gap-4 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/60 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>الدورة {currentRound.roundNumber}</span>
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <div className="flex items-center gap-1.5 text-slate-300">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>المستلم: <strong className="text-white font-bold">{currentReceiver?.name || 'غير محدد'}</strong></span>
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <div className="flex items-center gap-1.5 text-slate-300">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>المبلغ المجمع: <strong className="text-emerald-400 font-bold">{totalPoolAmount.toLocaleString('ar-SA')} {config.currency}</strong></span>
              </div>
            </div>
          )}

          {/* User Controls & Quick Switching */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 text-slate-200 px-3.5 py-2 rounded-xl border border-slate-700 transition shadow-sm text-sm"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${currentUser.avatarBg || 'bg-emerald-600'} flex items-center justify-center font-bold text-white text-xs`}
                  >
                    {currentUser.role === 'admin' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : (
                      currentUser.name.charAt(0)
                    )}
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="font-bold text-xs leading-tight text-white">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {currentUser.role === 'admin' ? 'مدير النظام (Admin)' : `عضو (ترتيب #${currentUser.order})`}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Account Actions Dropdown */}
                {showSwitchMenu && (
                  <div className="absolute left-0 mt-2 w-56 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-2 z-50 text-right animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 text-xs font-bold text-slate-300 border-b border-slate-700 mb-1">
                      {currentUser.name} ({currentUser.role === 'admin' ? 'الإدارة' : `مشترك #${currentUser.order}`})
                    </div>

                    <div className="space-y-1 my-1">
                      <button
                        onClick={() => {
                          onLogoutClick();
                          setShowSwitchMenu(false);
                        }}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 transition font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج من الحساب</span>
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            setShowSwitchMenu(false);
                            setShowResetConfirm(true);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-slate-400 hover:bg-slate-700/50 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>إعادة تعيين النظام</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-900/30"
              >
                <UserCheck className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs if logged in */}
        {currentUser && (
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 border-t border-slate-800 text-sm no-scrollbar">
            {currentUser.role === 'admin' ? (
              <>
                <button
                  onClick={() => setActiveTab('admin_dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                    activeTab === 'admin_dashboard'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>لوحة التحكم الإدارية</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin_members')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                    activeTab === 'admin_members'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>إدارة الأفراد والترتيب</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin_reports')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                    activeTab === 'admin_reports'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>التقارير المالية والدورات</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('user_grid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                    activeTab === 'user_grid'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>جدول الـ 10 خانات الخاص بي</span>
                </button>

                <button
                  onClick={() => setActiveTab('association_view')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                    activeTab === 'association_view'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>جدول متابعة الأعضاء</span>
                </button>

                <button
                  onClick={() => setActiveTab('user_history')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                    activeTab === 'user_history'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>سجل الدفعات والاستلام</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-slate-900">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">إعادة تعيين وإفراغ النظام</h3>
                <p className="text-xs text-slate-500">تصفير كافة البيانات وبدء نظام جديد</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              هل أنت متأكد من إعادة تعيين النظام وإفراغ البيانات؟ سيتم مسح كافة البيانات المؤقتة.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetData();
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-rose-600/20"
              >
                <RotateCcw className="w-4 h-4" />
                <span>نعم، إفراغ البيانات الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
