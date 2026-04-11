import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '@/firebase';
import { Swords, Mail, Lock, User, AlertCircle } from 'lucide-react';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) { setError('Введите имя'); setLoading(false); return; }
        await registerUser(email, password, name);
      } else {
        await loginUser(email, password);
      }
      navigate('/profile');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') setError('Email уже занят');
      else if (code === 'auth/invalid-email') setError('Некорректный email');
      else if (code === 'auth/weak-password') setError('Пароль слишком короткий (мин. 6 символов)');
      else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential')
        setError('Неверный email или пароль');
      else setError('Ошибка: ' + (err?.message || 'попробуйте позже'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dota-accent to-dota-gold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-dota-accent/20">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            {mode === 'login' ? 'Вход' : 'Регистрация'}
          </h1>
          <p className="text-sm font-body text-slate-400">
            {mode === 'login' ? 'Войди чтобы играть с друзьями' : 'Создай аккаунт и начни играть'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl bg-dota-card border border-dota-border p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-body text-slate-400 uppercase tracking-wider mb-1.5">Имя</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Как тебя зовут?"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-dota-bg border border-dota-border text-white font-body text-sm placeholder:text-slate-600 focus:border-dota-accent/50 focus:outline-none transition-all duration-300"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-body text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-dota-bg border border-dota-border text-white font-body text-sm placeholder:text-slate-600 focus:border-dota-accent/50 focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-body text-slate-400 uppercase tracking-wider mb-1.5">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-dota-bg border border-dota-border text-white font-body text-sm placeholder:text-slate-600 focus:border-dota-accent/50 focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm font-body text-red-400">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-dota-accent to-red-700 text-white font-body font-bold text-sm shadow-lg shadow-dota-accent/20 hover:shadow-dota-accent/40 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
          >
            {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-sm font-body text-dota-gold hover:underline"
            >
              {mode === 'login' ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войди'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
