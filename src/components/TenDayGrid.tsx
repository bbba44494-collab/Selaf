import React, { useState } from 'react';
import { DayPayment, User, SystemConfig } from '../types';
import {
  CheckCircle2,
  Clock,
  Coins,
  Receipt,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface TenDayGridProps {
  member: User;
  payments: DayPayment[];
  config: SystemConfig;
  onTogglePayment: (
    dayNumber: number,
    paid: boolean,
    amount?: number,
    note?: string
  ) => void;
  onShowReceipt?: (dayNumber: number) => void;
  isEditable?: boolean;
  canEditAnySlot?: boolean; // Admin can edit any slot
}

export const TenDayGrid: React.FC<TenDayGridProps> = ({
  member,
  payments,
  config,
  onTogglePayment,
  onShowReceipt,
  isEditable = true,
  canEditAnySlot = false,
}) => {
  const [selectedDayModal, setSelectedDayModal] = useState<DayPayment | null>(null);
  const [customAmount, setCustomAmount] = useState<number>(member.dailyTargetAmount || 10000);
  const [paymentNote, setPaymentNote] = useState<string>('تحويل بنكي / تسديد يومي');

  const paidCount = payments.filter((p) => p.paid).length;
  const totalPaidAmount = payments
    .filter((p) => p.paid)
    .reduce((sum, p) => sum + p.amount, 0);
  const totalRequiredAmount = 10 * (member.dailyTargetAmount || 10000);
  const progressPercent = Math.round((paidCount / 10) * 100);

  const handleOpenSlotModal = (slot: DayPayment) => {
    setSelectedDayModal(slot);
    setCustomAmount(slot.amount || member.dailyTargetAmount || 10000);
    setPaymentNote(slot.note || 'تسديد يومي نقدي / تحويل');
  };

  const handleConfirmPay = () => {
    if (!selectedDayModal) return;
    onTogglePayment(
      selectedDayModal.dayNumber,
      true,
      customAmount,
      paymentNote
    );
    setSelectedDayModal(null);
  };

  const handleConfirmUnpay = () => {
    if (!selectedDayModal) return;
    onTogglePayment(selectedDayModal.dayNumber, false);
    setSelectedDayModal(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 text-right">
      
      {/* Grid Header & Personal Progress Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl ${
                member.avatarBg || 'bg-emerald-600'
              } text-white font-bold flex items-center justify-center text-lg shadow-sm`}
            >
              {member.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{member.name}</h3>
              <p className="text-xs text-slate-500">
                ترتيب الاستلام: <strong className="text-emerald-700 font-bold">المرتبة #{member.order}</strong> • المبلغ اليومي المطلوبة: {member.dailyTargetAmount} {config.currency}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Gauge Pill */}
        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-500 font-bold">إجمالي المدفوع حتى الآن</div>
            <div className="text-base font-black text-emerald-600">
              {totalPaidAmount.toLocaleString('ar-SA')} / {totalRequiredAmount.toLocaleString('ar-SA')} {config.currency}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-slate-200"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  dasharray={`${(progressPercent / 100) * 125} 125`}
                  className="text-emerald-500 stroke-current transition-all duration-500"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-slate-800">
                {paidCount}/10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 mb-6">
        <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5 font-bold">
          <span>التقدم الإجمالي لخانات السُلفة</span>
          <span>
            {progressPercent}% مكتمل {paidCount === 10 && '🎉 (مكتمل بالكامل)'}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              paidCount === 10
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 10-Slot Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>جدول الـ 10 خانات (الدفعات اليومية)</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            انقر على أي خانة لتسديدها أو عرض تفاصيل الإيصال
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {payments.map((slot) => {
            const isPaid = slot.paid;
            return (
              <div
                key={slot.dayNumber}
                onClick={() => handleOpenSlotModal(slot)}
                className={`relative group rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                  isPaid
                    ? 'bg-emerald-50/80 border-emerald-300 hover:border-emerald-500 hover:shadow-md shadow-emerald-50/50'
                    : 'bg-slate-50 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/30'
                }`}
              >
                {/* Header of Slot Card */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                      isPaid
                        ? 'bg-emerald-200/80 text-emerald-800'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    الخانة #{slot.dayNumber}
                  </span>

                  {isPaid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {/* Content Body of Slot */}
                <div className="my-2">
                  <div
                    className={`text-base font-black ${
                      isPaid ? 'text-emerald-900' : 'text-slate-400'
                    }`}
                  >
                    {slot.amount} {config.currency}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate">
                    {isPaid ? (
                      slot.paidAt
                        ? new Date(slot.paidAt).toLocaleDateString('ar-SA', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : 'تم التسديد'
                    ) : (
                      'بانتظار التسديد'
                    )}
                  </div>
                </div>

                {/* Footer Action Tag */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  {isPaid ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 group-hover:underline">
                      <Receipt className="w-3 h-3" />
                      <span>تم الدفع</span>
                    </span>
                  ) : (isEditable || canEditAnySlot) ? (
                    <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition flex items-center gap-1">
                      <span>تسديد الآن</span>
                      <Coins className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="text-slate-500 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>بانتظار التسديد</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slot Payment Modal Dialog */}
      {selectedDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-right relative border border-slate-100">
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  #{selectedDayModal.dayNumber}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    تفاصيل الخانة #{selectedDayModal.dayNumber}
                  </h3>
                  <p className="text-xs text-slate-500">العضو: {member.name}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDayModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {selectedDayModal.paid ? (
              /* If Slot Already Paid */
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-900">
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>تم تسديد هذه الخانة بنجاح</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-700 mt-2">
                    {selectedDayModal.amount} {config.currency}
                  </div>
                  {selectedDayModal.paidAt && (
                    <div className="text-xs text-emerald-800/80 mt-1">
                      تاريخ التسديد: {new Date(selectedDayModal.paidAt).toLocaleString('ar-SA')}
                    </div>
                  )}
                  {selectedDayModal.note && (
                    <div className="text-xs text-emerald-700 mt-1 italic">
                      ملاحظة: {selectedDayModal.note}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  {onShowReceipt && (
                    <button
                      onClick={() => {
                        const dayNum = selectedDayModal.dayNumber;
                        setSelectedDayModal(null);
                        onShowReceipt(dayNum);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>عرض وتعديل إيصال الدفع</span>
                    </button>
                  )}

                  {(isEditable || canEditAnySlot) && (
                    <button
                      onClick={handleConfirmUnpay}
                      className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold rounded-xl text-xs transition border border-slate-200"
                    >
                      إلغاء دفع الخانة (إعادة فتح الخانة)
                    </button>
                  )}
                </div>
              </div>
            ) : !isEditable && !canEditAnySlot ? (
              /* Member View Mode - Read Only */
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-800 text-xs">
                  <div className="flex items-center gap-2 font-bold text-sm mb-1.5 text-slate-900">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    <span>وضع المشاهدة فقط (للأعضاء)</span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    هذه الخانة بانتظار التسديد. إدخال وتوثيق الدفعات يتم من خلال إدارة الجمعية (الأدمن) فقط.
                  </p>
                  <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200/60 rounded-xl text-amber-900 font-bold">
                    المبلغ المطلوب: {selectedDayModal.amount} {config.currency}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDayModal(null)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                >
                  حسناً، إغلاق
                </button>
              </div>
            ) : (
              /* Admin Edit Mode */
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-amber-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>هذه الخانة بانتظار التسديد اليومي</span>
                  </div>
                  سيتم تسجيل المبلغ وتحديث نسبة الإكمال مباشرة لدى كافة الأعضاء والإدارة.
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المبلغ المدفوع ({config.currency})
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ملاحظة أو طريقة الدفع
                  </label>
                  <input
                    type="text"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="تحويل بنكي / نقداً..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleConfirmPay}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    <Coins className="w-4 h-4" />
                    <span>تأكيد وتسديد الخانة #{selectedDayModal.dayNumber}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
