import React from 'react';
import { User, DayPayment, Round, SystemConfig, MemberRoundProgress } from '../types';
import { TenDayGrid } from './TenDayGrid';
import { QueueTimeline } from './QueueTimeline';
import {
  Wallet,
  Crown,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Coins,
  Receipt,
  Users,
} from 'lucide-react';

interface UserPanelProps {
  currentUser: User;
  users: User[];
  currentRound: Round | null;
  userProgress: MemberRoundProgress;
  allProgress: MemberRoundProgress[];
  config: SystemConfig;
  onTogglePayment: (dayNumber: number, paid: boolean, amount?: number, note?: string) => void;
  onShowReceipt: (dayNumber: number) => void;
  setActiveTab: (tab: string) => void;
}

export const UserPanel: React.FC<UserPanelProps> = ({
  currentUser,
  users,
  currentRound,
  userProgress,
  allProgress,
  config,
  onTogglePayment,
  onShowReceipt,
  setActiveTab,
}) => {
  const memberUsers = users.filter((u) => u.role === 'user');
  const currentReceiver = users.find((u) => u.id === currentRound?.currentReceiverId);
  const isCurrentReceiverMe = currentReceiver?.id === currentUser.id;

  const paidSlots = userProgress.payments.filter((p) => p.paid);
  const paidCount = paidSlots.length;
  const totalPaidAmount = paidSlots.reduce((sum, p) => sum + p.amount, 0);
  const totalRequiredAmount = 10 * (currentUser.dailyTargetAmount || 10000);
  const totalPoolAmount = memberUsers.reduce((sum, u) => sum + (u.dailyTargetAmount || 10000) * 10, 0);

  // Calculate association wide total completed slots
  let associationTotalSlotsPaid = 0;
  const associationTotalSlotsRequired = memberUsers.length * 10;
  allProgress.forEach((prog) => {
    associationTotalSlotsPaid += prog.payments.filter((p) => p.paid).length;
  });
  const associationCompletionPercent = Math.round(
    (associationTotalSlotsPaid / (associationTotalSlotsRequired || 1)) * 100
  );

  return (
    <div className="space-y-6 text-right">
      
      {/* Personalized Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        
        {/* Subtle decorative background circles */}
        <div className="absolute left-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 font-bold text-xs px-3 py-1 rounded-full border border-emerald-500/30">
                لوحة العضو الشخصية
              </span>
              <span className="bg-slate-800 text-slate-300 font-bold text-xs px-3 py-1 rounded-full">
                الدورة #{currentRound?.roundNumber || 1}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              مرحباً بك، {currentUser.name} 👋
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              جدول الدفعات اليومية الخاص بك لـ 10 أيام (وضع المشاهدة). يتم تسديد الخانات وتوثيق المدفوعات بواسطة إدارة الجمعية (الأدمن) فقط.
            </p>
          </div>

          {/* Receiver Status Box */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 min-w-[260px] shadow-inner">
            <div className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>مستلم الدورة الحالية:</span>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div
                className={`w-10 h-10 rounded-xl ${
                  currentReceiver?.avatarBg || 'bg-amber-600'
                } text-white font-bold flex items-center justify-center text-base`}
              >
                {currentReceiver?.name.charAt(0) || '?'}
              </div>
              <div>
                <div className="text-sm font-black text-white">
                  {currentReceiver?.name || 'غير محدد'}
                </div>
                <div className="text-[11px] text-amber-300 font-bold">
                  {isCurrentReceiverMe ? '🎉 أنت المستلم لهذه الدورة!' : `ترتيب الاستلام: #${currentReceiver?.order}`}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">المبلغ عند المكتمل:</span>
              <span className="text-emerald-400 font-black text-sm">
                {totalPoolAmount.toLocaleString('ar-SA')} {config.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400">ترتيب استلامك</div>
            <div className="text-base font-black text-amber-400 mt-1">
              المرتبة #{currentUser.order}
            </div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400">الخانات المكتملة لك</div>
            <div className="text-base font-black text-emerald-400 mt-1">
              {paidCount} من 10 خانات ({Math.round((paidCount / 10) * 100)}%)
            </div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400">مجموع مدفوعاتك</div>
            <div className="text-base font-black text-white mt-1">
              {totalPaidAmount.toLocaleString('ar-SA')} {config.currency}
            </div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400">نسبة جمعية الجميع</div>
            <div className="text-base font-black text-teal-300 mt-1">
              {associationCompletionPercent}% ({associationTotalSlotsPaid}/{associationTotalSlotsRequired})
            </div>
          </div>
        </div>
      </div>

      {/* Primary 10-Day Grid Component */}
      <TenDayGrid
        member={currentUser}
        payments={userProgress.payments}
        config={config}
        onTogglePayment={onTogglePayment}
        onShowReceipt={onShowReceipt}
        isEditable={false}
      />

      {/* Queue Sequence Visualization */}
      <QueueTimeline users={users} currentRound={currentRound} config={config} />

      {/* Association-wide Members Fast Tracker */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm text-right">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>متابعة حالة بقية الأعضاء في الجمعية</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              رؤية شفافة لجميع الأعضاء والتأكد من إكمال الخانات الـ 10 للجميع
            </p>
          </div>

          <button
            onClick={() => setActiveTab('association_view')}
            className="text-xs text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition"
          >
            عرض الجدول الشامل
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {memberUsers.map((m) => {
            const mProg = allProgress.find((p) => p.userId === m.id);
            const mPaidCount = mProg?.payments.filter((p) => p.paid).length || 0;
            const isDone = mPaidCount === 10;

            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500">
                    #{m.order} {m.name}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <div className="text-sm font-black text-slate-900">
                  {mPaidCount} / 10 خانات
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${(mPaidCount / 10) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
