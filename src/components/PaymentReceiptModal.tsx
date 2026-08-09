import React from 'react';
import { User, DayPayment, SystemConfig } from '../types';
import { Printer, CheckCircle2, X, ShieldCheck, Coins, Building } from 'lucide-react';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: User;
  payment: DayPayment;
  config: SystemConfig;
  roundNumber: number;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  member,
  payment,
  config,
  roundNumber,
}) => {
  if (!isOpen) return null;

  const receiptNumber = `JAM-${roundNumber}-${member.id.substring(0, 4)}-${payment.dayNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-right relative border border-slate-200">
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl text-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الإيصال</span>
          </button>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Voucher Area */}
        <div id="printable-receipt" className="p-4 border-2 border-emerald-500/30 rounded-2xl bg-gradient-to-b from-emerald-50/40 to-white relative overflow-hidden">
          {/* Watermark Seal */}
          <div className="absolute -left-6 -bottom-6 opacity-5 pointer-events-none">
            <ShieldCheck className="w-48 h-48 text-emerald-900" />
          </div>

          <div className="text-center pb-4 border-b border-slate-200">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm font-black">
              <Building className="w-5 h-5" />
            </div>
            <h2 className="font-black text-slate-900 text-base">{config.associationName}</h2>
            <p className="text-xs text-slate-500 mt-0.5">سند تسديد دفعة يومية في الجمعية المالية</p>
            <span className="inline-block mt-2 font-mono text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-600 border border-slate-200">
              رقم الإيصال: {receiptNumber}
            </span>
          </div>

          <div className="py-4 space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">اسم العضو:</span>
              <span className="font-black text-slate-900">{member.name}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">رقم الدورة الحالية:</span>
              <span className="font-bold text-slate-800">الدورة #{roundNumber}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">الخانة اليومية:</span>
              <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                الخانة رقم #{payment.dayNumber} من 10
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">المبلغ المدفوع:</span>
              <span className="font-black text-emerald-600 text-base">
                {payment.amount} {config.currency}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">تاريخ ووقت التسديد:</span>
              <span className="font-bold text-slate-700">
                {payment.paidAt
                  ? new Date(payment.paidAt).toLocaleString('ar-SA')
                  : new Date().toLocaleString('ar-SA')}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">طريقة الدفع والملاحظات:</span>
              <span className="font-medium text-slate-700">
                {payment.note || 'تحويل بنكي مباشر'}
              </span>
            </div>
          </div>

          {/* Stamp Seal */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              <div>اعتماد الإدارة المالية</div>
              <div className="font-bold text-emerald-800 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>تم التحقق والتوثيق الإلكتروني</span>
              </div>
            </div>

            <div className="w-14 h-14 border-2 border-dashed border-emerald-600 rounded-full flex items-center justify-center text-[9px] font-black text-emerald-700 rotate-12">
              ختم الجمعية
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
        >
          إغلاق النافذة
        </button>
      </div>
    </div>
  );
};
