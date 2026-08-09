import React, { useState } from 'react';
import { User, Round, SystemConfig } from '../types';
import { Crown, Sparkles, CheckCircle2, ArrowRight, Printer, Coins, Award } from 'lucide-react';

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiver: User;
  currentRound: Round;
  config: SystemConfig;
  totalMembersCount: number;
  totalPoolAmount: number;
  onConfirmHandover: (handoverNote: string, advanceToNextRound: boolean) => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  isOpen,
  onClose,
  receiver,
  currentRound,
  config,
  totalMembersCount,
  totalPoolAmount,
  onConfirmHandover,
}) => {
  const [handoverNote, setHandoverNote] = useState('تم التحويل البنكي للمستلم وإرسال إشعار التوثيق');
  const [advanceNext, setAdvanceNext] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl text-right relative border border-slate-200 overflow-hidden">
        
        {/* Celebration Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 -m-6 p-6 mb-6 text-slate-950 relative border-b border-amber-300">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
              <Award className="w-7 h-7 text-slate-950" />
            </div>
            <span className="bg-slate-950/20 font-bold text-xs px-3 py-1 rounded-full text-slate-900 border border-slate-950/10">
              الدورة #{currentRound.roundNumber} مكتملة 100%
            </span>
          </div>

          <h2 className="text-2xl font-black mt-3">تهانينا! المبلغ جاهز للتسليم 🎉</h2>
          <p className="text-xs text-slate-900/80 font-medium mt-1">
            اكتملت كافة الخانات الـ 10 لجميع الأفراد في الجمعية المالية.
          </p>
        </div>

        {/* Recipient Card */}
        <div className="bg-amber-50/80 border-2 border-amber-300/80 p-4 rounded-2xl mb-6">
          <div className="text-xs text-amber-800 font-bold mb-1 flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-600" />
            <span>المستلم المعتمد لمبلغ السُلفة الجماعية:</span>
          </div>

          <div className="flex items-center gap-3 my-2">
            <div
              className={`w-12 h-12 rounded-2xl ${
                receiver.avatarBg || 'bg-amber-600'
              } text-white font-black text-xl flex items-center justify-center shadow-sm`}
            >
              {receiver.name.charAt(0)}
            </div>
            <div>
              <div className="text-lg font-black text-slate-900">{receiver.name}</div>
              <div className="text-xs text-slate-600">
                ترتيب المستلم: <strong className="text-amber-800">المرتبة #{receiver.order}</strong> • الهاتف: {receiver.phone || 'غير مسجل'}
              </div>
            </div>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-amber-200 mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-bold">إجمالي المبلغ المستلم:</span>
            <span className="text-2xl font-black text-emerald-600">
              {totalPoolAmount.toLocaleString('ar-SA')} {config.currency}
            </span>
          </div>
        </div>

        {/* Form Options */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظات عملية التسليم والتحويل
            </label>
            <textarea
              value={handoverNote}
              onChange={(e) => setHandoverNote(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3">
            <input
              type="checkbox"
              id="advanceNext"
              checked={advanceNext}
              onChange={(e) => setAdvanceNext(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="advanceNext" className="text-xs font-bold text-slate-800 cursor-pointer">
              الانتقال مباشرة إلى الدورة التالية (الدورة #{currentRound.roundNumber + 1}) وتعيين المستلم التالي في الترتيب
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={() => onConfirmHandover(handoverNote, advanceNext)}
            className="w-full sm:flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>تأكيد وتسليم المبلغ الآن</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
