import React, { useState } from 'react';
import { User, Round, ActivityLog, SystemConfig, MemberRoundProgress } from '../types';
import {
  FileText,
  Printer,
  Download,
  Clock,
  Coins,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Filter,
} from 'lucide-react';

interface ReportsPanelProps {
  users: User[];
  rounds: Round[];
  logs: ActivityLog[];
  allProgress: MemberRoundProgress[];
  config: SystemConfig;
}

export const ReportsPanel: React.FC<ReportsPanelProps> = ({
  users,
  rounds,
  logs,
  allProgress,
  config,
}) => {
  const [logFilter, setLogFilter] = useState<string>('all');

  const memberUsers = users.filter((u) => u.role === 'user');
  
  // Financial metrics
  let totalCollectedAllTime = 0;
  let totalCompletedSlotsAllTime = 0;

  allProgress.forEach((prog) => {
    prog.payments.forEach((p) => {
      if (p.paid) {
        totalCompletedSlotsAllTime++;
        totalCollectedAllTime += p.amount;
      }
    });
  });

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'all') return true;
    return log.type === logFilter;
  });

  return (
    <div className="space-y-6 text-right">
      
      {/* Header Actions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>التقارير المالية والمدفوعات الدورية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            كشوفات الحسابات، السجلات الدورية لعمليات الدفع، وتوثيق تسليم السُلف.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md shadow-emerald-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير المالي</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="text-slate-500 text-xs font-bold mb-1">
            إجمالي الأموال المجمعة في النظام
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {totalCollectedAllTime.toLocaleString('ar-SA')} {config.currency}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            مجموع الخانات المدفوعة: {totalCompletedSlotsAllTime} خانة
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="text-slate-500 text-xs font-bold mb-1">
            عدد الدورات المنجزة
          </div>
          <div className="text-2xl font-black text-slate-900">
            {rounds.length} دورات
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            إجمالي الأعضاء المكتتبين: {memberUsers.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="text-slate-500 text-xs font-bold mb-1">
            متوسط الالتزام المالي بالدفع
          </div>
          <div className="text-2xl font-black text-teal-600">
            {Math.round((totalCompletedSlotsAllTime / (memberUsers.length * 10 || 1)) * 100)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            معدل سداد الخانات الـ 10 للأعضاء
          </div>
        </div>
      </div>

      {/* Member Performance & Compliance Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
        <h3 className="font-black text-slate-900 text-base mb-4 pb-2 border-b border-slate-100">
          تقرير التزام الأعضاء بسداد الخانات الـ 10
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                <th className="p-3">ترتيب الاستلام</th>
                <th className="p-3">اسم العضو</th>
                <th className="p-3">الخانات المدفوعة</th>
                <th className="p-3">إجمالي المبلغ المدفوع</th>
                <th className="p-3">حالة الالتزام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberUsers.map((m) => {
                const prog = allProgress.find((p) => p.userId === m.id);
                const paidCount = prog?.payments.filter((p) => p.paid).length || 0;
                const paidSum = prog?.payments
                  .filter((p) => p.paid)
                  .reduce((sum, p) => sum + p.amount, 0) || 0;
                const isComplete = paidCount === 10;

                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-500">#{m.order}</td>
                    <td className="p-3 font-bold text-slate-900">{m.name}</td>
                    <td className="p-3 font-bold">
                      {paidCount} من 10 خانات ({paidCount * 10}%)
                    </td>
                    <td className="p-3 font-black text-emerald-600">
                      {paidSum.toLocaleString('ar-SA')} {config.currency}
                    </td>
                    <td className="p-3">
                      {isComplete ? (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>مكتمل 100%</span>
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-lg text-[11px]">
                          قيد السداد ({10 - paidCount} متبقية)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Activity Logs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>سجل الحركات والتسديدات المباشرة</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تتبع زمني لكافة عمليات تسديد الخانات وبدء الدورات وتسليم السُلف.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setLogFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${
                logFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setLogFilter('payment')}
              className={`px-3 py-1 rounded-lg transition ${
                logFilter === 'payment' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              الدفعات
            </button>
            <button
              onClick={() => setLogFilter('round')}
              className={`px-3 py-1 rounded-lg transition ${
                logFilter === 'round' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              الدورات
            </button>
          </div>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    log.type === 'payment'
                      ? 'bg-emerald-500'
                      : log.type === 'round'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                />
                <div>
                  <div className="font-bold text-slate-900">{log.action}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{log.details}</div>
                </div>
              </div>

              <div className="text-left shrink-0">
                <div className="text-[11px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="text-[10px] text-slate-500">{log.userName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
