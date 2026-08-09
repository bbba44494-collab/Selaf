import React from 'react';
import { User, Round, SystemConfig } from '../types';
import { Crown, CheckCircle2, Clock, Sparkles, ArrowLeft, Users } from 'lucide-react';

interface QueueTimelineProps {
  users: User[];
  currentRound: Round | null;
  config: SystemConfig;
}

export const QueueTimeline: React.FC<QueueTimelineProps> = ({
  users,
  currentRound,
  config,
}) => {
  // Sort members by their assigned queue order
  const memberUsers = users
    .filter((u) => u.role === 'user')
    .sort((a, b) => a.order - b.order);

  const activeMembersCount = memberUsers.length;
  const currentReceiverId = currentRound?.currentReceiverId;
  const currentRoundNum = currentRound?.roundNumber || 1;
  const totalPoolAmount = memberUsers.reduce((sum, u) => sum + (u.dailyTargetAmount || 10000) * 10, 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm text-right">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <span>تسلسل أدوار تسليم المبلغ (ترتيب الأفراد)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            يستلم كل عضو مبلغ الجمعية الإجمالي الكامل ({totalPoolAmount.toLocaleString('ar-SA')} {config.currency}) دورياً عند مكتمل الـ 10 أيام.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-2xl text-xs font-bold">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>الدورة الحالية: #{currentRoundNum} من {activeMembersCount}</span>
        </div>
      </div>

      {/* Horizontal / Grid Roadmap Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
        {memberUsers.map((member, idx) => {
          const isCurrentReceiver = member.id === currentReceiverId;
          const isPastReceiver = member.order < currentRoundNum;
          const isFutureReceiver = member.order > currentRoundNum;

          return (
            <div
              key={member.id}
              className={`relative rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                isCurrentReceiver
                  ? 'bg-gradient-to-b from-amber-50 via-emerald-50/50 to-white border-2 border-amber-400 shadow-lg shadow-amber-500/10 ring-4 ring-amber-400/20'
                  : isPastReceiver
                  ? 'bg-slate-50 border-slate-200 opacity-80'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              {/* Receiver Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1 ${
                    isCurrentReceiver
                      ? 'bg-amber-400 text-amber-950 shadow-sm'
                      : isPastReceiver
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isCurrentReceiver && <Crown className="w-3.5 h-3.5 fill-amber-950" />}
                  <span>الترتيب #{member.order}</span>
                </span>

                <span className="text-[10px] font-bold text-slate-400">
                  الدورة #{member.order}
                </span>
              </div>

              {/* Member Info */}
              <div className="flex items-center gap-3 my-2">
                <div
                  className={`w-11 h-11 rounded-2xl ${
                    member.avatarBg || 'bg-emerald-600'
                  } text-white font-black text-lg flex items-center justify-center shadow-sm shrink-0`}
                >
                  {member.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <div className="font-black text-sm text-slate-900 truncate">
                    {member.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {member.phone || 'عضو نَشِط'}
                  </div>
                </div>
              </div>

              {/* Payout Status Banner */}
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs font-bold">
                {isCurrentReceiver ? (
                  <div className="text-amber-800 bg-amber-100/80 p-2 rounded-xl text-center flex items-center justify-center gap-1.5 animate-pulse">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>المستلم الحالي للدورة!</span>
                  </div>
                ) : isPastReceiver ? (
                  <div className="text-emerald-700 bg-emerald-50 p-2 rounded-xl text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تم استلام المبلغ سابقاً</span>
                  </div>
                ) : (
                  <div className="text-slate-500 bg-slate-100 p-2 rounded-xl text-center flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>في الانتظار للدورة #{member.order}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
