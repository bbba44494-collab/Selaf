import React, { useState } from 'react';
import { User, SystemConfig } from '../types';
import { UserPlus, Trash2, ArrowUp, ArrowDown, Edit3, X, Check, ShieldAlert, Key } from 'lucide-react';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  config: SystemConfig;
  onAddMember: (memberData: Omit<User, 'id'>) => void;
  onUpdateMember: (user: User) => void;
  onDeleteMember: (userId: string) => void;
  onReorderMembers: (users: User[]) => void;
}

export const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  config,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onReorderMembers,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [phone, setPhone] = useState('');
  const [dailyAmount, setDailyAmount] = useState<number>(10000);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<{ id: string; name: string } | null>(null);

  if (!isOpen) return null;

  const memberUsers = users
    .filter((u) => u.role === 'user')
    .sort((a, b) => a.order - b.order);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;

    const maxOrder = memberUsers.length > 0 ? Math.max(...memberUsers.map((u) => u.order)) : 0;

    const bgOptions = [
      'bg-indigo-600',
      'bg-blue-600',
      'bg-purple-600',
      'bg-teal-600',
      'bg-amber-600',
      'bg-emerald-600',
      'bg-rose-600',
    ];
    const randomBg = bgOptions[Math.floor(Math.random() * bgOptions.length)];

    onAddMember({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password: password.trim() || '123',
      role: 'user',
      order: maxOrder + 1,
      phone: phone.trim() || '0500000000',
      avatarBg: randomBg,
      dailyTargetAmount: Number(dailyAmount) || 10000,
    });

    setName('');
    setUsername('');
    setPassword('123');
    setPhone('');
    setShowAddForm(false);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newMembers = [...memberUsers];
    const temp = newMembers[index].order;
    newMembers[index].order = newMembers[index - 1].order;
    newMembers[index - 1].order = temp;

    const admin = users.find((u) => u.role === 'admin');
    const all = admin ? [admin, ...newMembers] : newMembers;
    onReorderMembers(all);
  };

  const handleMoveDown = (index: number) => {
    if (index >= memberUsers.length - 1) return;
    const newMembers = [...memberUsers];
    const temp = newMembers[index].order;
    newMembers[index].order = newMembers[index + 1].order;
    newMembers[index + 1].order = temp;

    const admin = users.find((u) => u.role === 'admin');
    const all = admin ? [admin, ...newMembers] : newMembers;
    onReorderMembers(all);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-right relative border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">إدارة الأفراد وترتيب الجمعية</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              إضافة أعضاء جدد، تعديل البيانت، وتحديد ترتيب تسليم المبلغ.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-4 pr-1 pl-1 flex-1">
          
          {/* Action Bar */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-md shadow-emerald-600/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة فرد جديد للجمعية</span>
            </button>

            <span className="text-xs text-slate-500 font-bold">
              إجمالي الأفراد النشطين: {memberUsers.length}
            </span>
          </div>

          {/* Add New Member Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateMember}
              className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-2xl space-y-3 animate-in fade-in zoom-in-95"
            >
              <div className="font-bold text-xs text-emerald-900 mb-1">
                بيانات الفرد الجديد:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    الاسم الثلاثي
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثل: خالد العتيبي"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    اسم المستخدم (للدخول)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="khaled"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    كلمة المرور
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="123"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    رقم الجوال
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="050xxxxxxx"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                >
                  حفظ إضافة الفرد
                </button>
              </div>
            </form>
          )}

          {/* Members Queue Table List */}
          <div className="space-y-2">
            {memberUsers.map((member, idx) => (
              <div
                key={member.id}
                className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === memberUsers.length - 1}
                      className="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="w-7 h-7 bg-emerald-100 text-emerald-800 rounded-xl font-bold flex items-center justify-center text-xs">
                    #{member.order}
                  </span>

                  <div
                    className={`w-9 h-9 rounded-xl ${
                      member.avatarBg || 'bg-emerald-600'
                    } text-white font-bold flex items-center justify-center text-xs`}
                  >
                    {member.name.charAt(0)}
                  </div>

                  <div>
                    <div className="font-bold text-slate-900 text-sm">{member.name}</div>
                    <div className="text-[10px] text-slate-500">
                      اسم المستخدم: <span className="font-mono">{member.username}</span> • كلمة المرور: <span className="font-mono">{member.password || '123'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDeleteConfirmMember({ id: member.id, name: member.name })}
                    className="p-2 text-rose-500 hover:bg-rose-100/60 rounded-xl transition"
                    title="حذف العضو"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delete Confirm Overlay */}
        {deleteConfirmMember && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl text-right border border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-2">تأكيد حذف الفرد</h4>
              <p className="text-xs text-slate-500 mb-4">
                هل أنت تأكد من حذف الفرد (<span className="font-bold text-slate-800">{deleteConfirmMember.name}</span>) من الجمعية؟
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirmMember(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    onDeleteMember(deleteConfirmMember.id);
                    setDeleteConfirmMember(null);
                  }}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition"
                >
                  حذف الآن
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 mt-4 text-left shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
