import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, UserCheck, Key, User as UserIcon, X, Check, ArrowRight, Info, Sparkles, Copy, Lock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'user'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [copiedText, setCopiedText] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanInput = username.trim().toLowerCase();

    // Flexible match: by username, name, or phone
    const targetUser = users.find(
      (u) =>
        u.username?.toLowerCase() === cleanInput ||
        u.name?.toLowerCase() === cleanInput ||
        u.phone?.trim() === cleanInput ||
        u.name?.toLowerCase().includes(cleanInput)
    );

    if (!targetUser) {
      setError(`لم يتم العثور على اسم المستخدم أو العضو "${username}". يرجى اختيار اسمك من القائمة أدناه أو طلب إضافتك من الأدمن.`);
      return;
    }

    const expectedPassword = targetUser.password || '123';
    if (password && password !== expectedPassword && targetUser.password) {
      setError(`كلمة المرور غير صحيحة للحساب (${targetUser.name}). (كلمة المرور الافتراضية: ${expectedPassword})`);
      return;
    }

    onLoginSuccess(targetUser);
    onClose();
  };

  const autofillAdmin = () => {
    setActiveTab('admin');
    setUsername('');
    setPassword('');
    setError('');
  };

  const autofillUser = () => {
    setActiveTab('user');
    const firstMember = users.find((u) => u.role === 'user');
    if (firstMember) {
      setUsername(firstMember.username);
      setPassword(firstMember.password || '123');
    } else {
      setUsername('ahmed');
      setPassword('123');
    }
    setError('');
  };

  const copyCredentials = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedText(txt);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const memberUsers = users.filter((u) => u.role === 'user');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden text-white relative">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 p-6 text-center relative border-b border-emerald-800/40">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            {activeTab === 'admin' ? (
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            ) : (
              <UserCheck className="w-8 h-8 text-emerald-400" />
            )}
          </div>

          <h2 className="text-xl font-black text-white">تسجيل الدخول إلى النظام</h2>
          <p className="text-xs text-emerald-200/80 mt-1">
            سلف شخصية (سُلفة 10 أيام)
          </p>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1.5 rounded-2xl mt-4 border border-slate-800">
            <button
              type="button"
              onClick={autofillAdmin}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30 ring-1 ring-amber-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>دخول الأدمن (الإدارة)</span>
            </button>

            <button
              type="button"
              onClick={autofillUser}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'user'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>دخول الأعضاء / المشاهدة</span>
            </button>
          </div>
        </div>

        {/* Credentials Info Badge */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800/80 text-right">
          <div className="flex items-start gap-3 bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3 text-xs">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-black text-emerald-300 text-xs mb-1">
                🔑 بيانات الدخول للمشاهدة والأعضاء:
              </div>
              
              <div className="mt-2">
                {/* Member credentials box */}
                <div
                  onClick={() => copyCredentials(`${memberUsers[0]?.username || 'اسم العضو'} / 123`)}
                  className="bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-xl text-[11px] cursor-pointer hover:border-emerald-500/60 transition group"
                >
                  <div className="font-bold text-emerald-300 flex items-center justify-between">
                    <span>👤 المشتركين / الأعضاء (وضع المشاهدة):</span>
                    <Copy className="w-3.5 h-3.5 text-emerald-400/60 group-hover:text-emerald-300" />
                  </div>
                  <div className="text-slate-200 font-mono mt-1">
                    اسم المستخدم: <span className="font-bold text-white">{memberUsers[0]?.username || 'اسم العضو'}</span>
                  </div>
                  <div className="text-slate-200 font-mono">
                    كلمة المرور الافتراضية: <span className="font-bold text-white">123</span>
                  </div>
                </div>
              </div>

              {copiedText && (
                <div className="text-[10px] text-emerald-400 mt-1.5 font-bold">
                  ✓ تم نسخ البيانات الحافظة!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl text-right">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-right">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                اسم المستخدم (Username)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeTab === 'admin' ? 'اسم مستخدم الإدارة' : 'اسم المستخدم'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                كلمة المرور (Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={activeTab === 'admin' ? 'كلمة المرور' : '123'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  required
                />
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition flex items-center justify-center gap-2 shadow-lg ${
                  activeTab === 'admin'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                }`}
              >
                <span>دخول {activeTab === 'admin' ? 'كـ أدمن' : 'كـ عضو'}</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </form>

          {/* User Quick Click List if Member Tab */}
          {activeTab === 'user' && memberUsers.length > 0 && (
            <div className="mt-5 border-t border-slate-800 pt-4">
              <div className="text-center text-[11px] font-bold text-slate-400 mb-2">
                اختر حِساب عضو مضاف سريعاً:
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                {memberUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onLoginSuccess(u);
                      onClose();
                    }}
                    className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 p-2 rounded-xl text-right transition"
                  >
                    <div
                      className={`w-6 h-6 rounded-md ${u.avatarBg || 'bg-emerald-600'} flex items-center justify-center font-bold text-xs text-white`}
                    >
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 truncate text-xs text-slate-200">
                      {u.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
