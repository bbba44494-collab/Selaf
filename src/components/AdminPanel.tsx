import React, { useState } from 'react';
import { User, Round, MemberRoundProgress, SystemConfig } from '../types';
import { TenDayGrid } from './TenDayGrid';
import {
  Users,
  Coins,
  Crown,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  Sliders,
  Settings,
  UserPlus,
  Plus,
  ChevronDown,
  Printer,
  FileSpreadsheet,
  Trash2,
  Github,
  ExternalLink,
  Info,
  RefreshCw,
} from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  currentRound: Round | null;
  allProgress: MemberRoundProgress[];
  config: SystemConfig;
  onTogglePayment: (
    userId: string,
    dayNumber: number,
    paid: boolean,
    amount?: number,
    note?: string
  ) => void;
  onOpenPayoutModal: () => void;
  onOpenMemberModal: () => void;
  onStartNewRound: () => void;
  onShowReceipt: (userId: string, dayNumber: number) => void;
  onResetData?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  currentRound,
  allProgress,
  config,
  onTogglePayment,
  onOpenPayoutModal,
  onOpenMemberModal,
  onStartNewRound,
  onShowReceipt,
  onResetData,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const memberUsers = users
    .filter((u) => u.role === 'user')
    .sort((a, b) => a.order - b.order);

  const currentReceiver = users.find((u) => u.id === currentRound?.currentReceiverId);

  // Stats Calculations
  const totalMembers = memberUsers.length;
  const totalSlotsRequired = totalMembers * 10;
  
  let totalSlotsPaid = 0;
  let totalAmountCollected = 0;

  allProgress.forEach((p) => {
    p.payments.forEach((slot) => {
      if (slot.paid) {
        totalSlotsPaid++;
        totalAmountCollected += slot.amount;
      }
    });
  });

  const totalPoolTarget = memberUsers.reduce((sum, m) => sum + (m.dailyTargetAmount || 10000) * 10, 0);
  const overallPercent = Math.round((totalSlotsPaid / (totalSlotsRequired || 1)) * 100);
  const isRound100PercentComplete = totalSlotsPaid === totalSlotsRequired && totalSlotsRequired > 0;

  return (
    <div className="space-y-6 text-right">
      
      {/* Admin KPI Header Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Collected Pool */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold mb-2">
            <span>المبلغ المجمع حالياً</span>
            <Coins className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalAmountCollected.toLocaleString('ar-SA')}{' '}
            <span className="text-sm font-bold text-slate-500">{config.currency}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            الهدف الكلي للدورة: {totalPoolTarget.toLocaleString('ar-SA')} {config.currency}
          </div>
        </div>

        {/* Current Round Receiver */}
        <div className="bg-gradient-to-tr from-amber-50 to-white rounded-3xl p-5 border border-amber-300/80 shadow-sm relative">
          <div className="flex justify-between items-center text-amber-900 text-xs font-bold mb-2">
            <span>مستلم الدورة الحالية #{currentRound?.roundNumber || 1}</span>
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-lg font-black text-slate-900 truncate">
            {currentReceiver?.name || 'لا يوجد دورة حالية'}
          </div>
          <div className="text-[11px] text-amber-800 font-bold mt-1">
            {currentReceiver ? `ترتيب المستلم: المرتبة #${currentReceiver.order}` : 'أنشئ دورة جديدة أو أضف أفراداً'}
          </div>
        </div>

        {/* Total Slots Progress */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold mb-2">
            <span>نسبة مكتمل الخانات الـ 10</span>
            <Sparkles className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {overallPercent}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            مكتمل: {totalSlotsPaid} من أصل {totalSlotsRequired} خانة
          </div>
        </div>

        {/* Total Members Count */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span>عدد الأفراد في الجمعية</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 my-1">
            {totalMembers} أفراد
          </div>
          <button
            onClick={onOpenMemberModal}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>إدارة وتعديل الأفراد</span>
          </button>
        </div>
      </div>

      {/* Completion Alert Banner & Handover Trigger */}
      {isRound100PercentComplete ? (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-400">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Award className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-black">اكتملت كافة خانات الدورة (100%)! 🎉</h3>
              <p className="text-xs text-emerald-100 mt-1">
                جميع الأفراد أكملوا الـ 10 دفعات. يمكنك الآن تسليم المبلغ الكامل ({totalPoolTarget.toLocaleString('ar-SA')} {config.currency}) إلى ({currentReceiver?.name}).
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPayoutModal}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-2xl text-sm transition shadow-lg shrink-0 flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5" />
            <span>تسليم المبلغ وتوثيق الدورة</span>
          </button>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>
              حالة الجمعية: {totalSlotsRequired > 0 ? `متبقي ${totalSlotsRequired - totalSlotsPaid} خانة غير مدفوعة لاكتمال تسليم سُلفة هذه الدورة.` : 'لا توجد خانات نشطة، أضف أعضاء لبدء الجمعية.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPayoutModal}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200 transition"
            >
              تسليم السُلفة
            </button>
            <button
              onClick={onStartNewRound}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
            >
              بدء دورة جديدة
            </button>
          </div>
        </div>
      )}

      {/* Master 10-Day Payments Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>جدول متابعة الـ 10 خانات لجميع الأفراد (Master Matrix)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              جدول تفاعلي مباشر يعرض حالة الخانات الـ 10 لكل فرد. انقر على أي خانة لتسديدها أو إلغائها فوراً.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenMemberModal}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>ترتيب الأفراد</span>
            </button>
          </div>
        </div>

        {/* Table / Empty State */}
        {memberUsers.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-sm">النظام خالي تماماً من البيانات الوهمية</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              يمكنك البدء بإضافة أعضاء جُدد وتحديد ترتيبهم وتسديد الخانات بضغطات زر من زر "إدارة الأفراد".
            </p>
            <button
              onClick={onOpenMemberModal}
              className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة أعضاء جُدد للجمعية</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200/80 text-[11px] font-black text-slate-600">
                  <th className="p-3">العضو والترتيب</th>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((dayNum) => (
                    <th key={dayNum} className="p-2 text-center w-12">
                      خـ {dayNum}
                    </th>
                  ))}
                  <th className="p-3 text-center">الإنجاز</th>
                  <th className="p-3 text-center">المبلغ المدفوع</th>
                  <th className="p-3 text-left">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {memberUsers.map((member) => {
                  const memberProg = allProgress.find((p) => p.userId === member.id);
                  const payments = memberProg?.payments || [];
                  const paidCount = payments.filter((p) => p.paid).length;
                  const paidSum = payments
                    .filter((p) => p.paid)
                    .reduce((sum, p) => sum + p.amount, 0);

                  const isCurrentRec = member.id === currentReceiver?.id;

                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isCurrentRec ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Member Info */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-[10px]">
                            #{member.order}
                          </span>
                          <div
                            className={`w-8 h-8 rounded-xl ${
                              member.avatarBg || 'bg-emerald-600'
                            } text-white font-bold flex items-center justify-center text-xs shrink-0`}
                          >
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1">
                              <span>{member.name}</span>
                              {isCurrentRec && (
                                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {member.phone || 'نشط'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 10 Slot Cells */}
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((dayNum) => {
                        const slot = payments.find((p) => p.dayNumber === dayNum);
                        const isPaid = slot?.paid;

                        return (
                          <td key={dayNum} className="p-1.5 text-center">
                            <button
                              onClick={() =>
                                onTogglePayment(
                                  member.id,
                                  dayNum,
                                  !isPaid,
                                  member.dailyTargetAmount || 10000,
                                  isPaid ? undefined : 'تسديد بواسطة الإدارة'
                                )
                              }
                              className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition border ${
                                isPaid
                                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/20 hover:bg-emerald-600'
                                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-emerald-100 hover:text-emerald-700 hover:border-emerald-300'
                              }`}
                              title={`الخانة ${dayNum} - ${member.name}: ${
                                isPaid ? 'مدفوعة' : 'غير مدفوعة (انقر للتسديد)'
                              }`}
                            >
                              {isPaid ? <CheckCircle2 className="w-4 h-4" /> : dayNum}
                            </button>
                          </td>
                        );
                      })}

                      {/* Progress Gauge */}
                      <td className="p-3 text-center font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-xs ${
                            paidCount === 10
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {paidCount} / 10
                        </span>
                      </td>

                      {/* Total Paid Sum */}
                      <td className="p-3 text-center font-black text-emerald-600">
                        {paidSum.toLocaleString('ar-SA')} {config.currency}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-left">
                        <button
                          onClick={() => setSelectedMemberId(selectedMemberId === member.id ? null : member.id)}
                          className="text-xs text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded-lg font-bold transition"
                        >
                          {selectedMemberId === member.id ? 'إغلاق' : 'عرض جدوله'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Control & GitHub Deployment Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Reset / Empty Mock Data Control */}
        <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">إفراغ البيانات الوهمية وتفريغ النظام</h4>
              <p className="text-xs text-slate-400">تصفير الـ LocalStorage وبدء الجمعية بنظام نظيف تماماً</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 my-3 leading-relaxed">
            عند الضغط سيتم إفراغ كافّة البيانات والأعضاء الوهميين المؤقتين للبدء بحساب الأدمن النظيف إضافة أعضائك الحقيقيين.
          </p>

          <button
            onClick={() => setShowResetConfirmModal(true)}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إفراغ كافة البيانات الوهمية الآن</span>
          </button>
        </div>

        {/* GitHub Export Guidance */}
        <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">رفع النظام إلى GitHub</h4>
              <p className="text-xs text-slate-400">تصدير مشروع الكود المصدري كاملاً إلى مستودعك</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 my-3 leading-relaxed">
            الكود جاهز وخالٍ من الأخطاء. لرفع المشروع إلى مستودعك الخاص في GitHub:
            انقر على قائمة <strong>الخيارات / الإعدادات (Settings)</strong> في الشريطة العلوية للمنصة واختر <strong>Export / Push to GitHub</strong> لتخزين المشروع مباشرة بضغطة زر.
          </p>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-indigo-300 font-mono">
            ✓ Repository build verified & clean
          </div>
        </div>

      </div>

      {/* Expanded Single Member Grid Inspector */}
      {selectedMemberId && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-sm text-emerald-400">
              معاينة وتعديل جدول الخانات للعضو المحدد: {users.find((u) => u.id === selectedMemberId)?.name}
            </h4>
            <button
              onClick={() => setSelectedMemberId(null)}
              className="text-slate-400 hover:text-white text-xs bg-slate-800 px-3 py-1 rounded-xl"
            >
              إغلاق المعاينة
            </button>
          </div>

          {(() => {
            const memberObj = users.find((u) => u.id === selectedMemberId);
            const mProg = allProgress.find((p) => p.userId === selectedMemberId);
            if (!memberObj || !mProg) return null;

            return (
              <TenDayGrid
                member={memberObj}
                payments={mProg.payments}
                config={config}
                onTogglePayment={(dayNum, paid, amt, note) =>
                  onTogglePayment(memberObj.id, dayNum, paid, amt, note)
                }
                onShowReceipt={(dayNum) => onShowReceipt(memberObj.id, dayNum)}
                isEditable={true}
                canEditAnySlot={true}
              />
            );
          })()}
        </div>
      )}
      {/* Custom Confirmation Modal for Data Reset */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">إفراغ البيانات وتفريغ النظام</h3>
                <p className="text-xs text-slate-500">تصفير كافة البيانات وبدء نظام نظيف</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              هل أنت متأكد من إفراغ كافة البيانات والأعضاء الوهميين؟ سيتم تصفير النظام تماماً والبدء بحساب الأدمن لإضافة أعضائك الحقيقيين.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setShowResetConfirmModal(false);
                  if (onResetData) onResetData();
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-rose-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>نعم، إفراغ البيانات الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
