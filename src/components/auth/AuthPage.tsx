import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '@/firebase';
import { Swords, Mail, Lock, User, AlertCircle, Shield, Zap, Crown } from 'lucide-react';
import { ALL_HEROES } from '@/data/heroes';

const HERO_CDN = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes';
const BG_HEROES = [...ALL_HEROES].sort(() => Math.random() - 0.5).slice(0, 30);

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
    <div className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center px-4 py-12 overflow-hidden">

      {/* ===== ANIMATED BACKGROUND ===== */}
      <div className="absolute inset-0">
        {/* Hero mosaic — slowly scrolling up */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-0.5 opacity-[0.06]" style={{ animation: 'bgDrift 80s linear infinite' }}>
            {[...BG_HEROES, ...BG_HEROES].map((hero, i) => (
              <div key={`${hero.id}-${i}`} className="aspect-[16/9] overflow-hidden">
                <img src={`${HERO_CDN}/${hero.name}.png`} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-dota-bg via-dota-bg/70 to-dota-bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-dota-bg via-transparent to-dota-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#060911_75%)]" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-dota-accent/[0.04] rounded-full blur-[200px] animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-dota-gold/[0.03] rounded-full blur-[180px] animate-float-delayed" />
        <div className="absolute top-1/2 left-2/3 w-[300px] h-[300px] bg-blue-500/[0.03] rounded-full blur-[150px] animate-float" />
      </div>

      {/* ===== FORM ===== */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-5">
            <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-dota-accent/20 to-dota-gold/20 blur-xl animate-pulse-soft" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-dota-accent to-dota-gold flex items-center justify-center shadow-2xl shadow-dota-accent/30">
              <Swords className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight mb-2">
            <span className="gradient-text">{mode === 'login' ? 'ВХОД' : 'РЕГИСТРАЦИЯ'}</span>
          </h1>
          <p className="text-sm font-body text-slate-500">
            {mode === 'login' ? 'Войди в арену и сражайся с друзьями' : 'Создай аккаунт и покоряй рейтинг'}
          </p>
        </div>

        {/* Glass card */}
        <div className="relative">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-dota-accent/15 via-transparent to-dota-gold/10 opacity-60" />

          <form onSubmit={handleSubmit}
            className="relative rounded-2xl bg-dota-card/50 backdrop-blur-2xl border border-dota-border/25 p-7 space-y-5">

            {mode === 'register' && (
              <div className="animate-slide-down">
                <label className="block text-[10px] font-body text-slate-500 uppercase tracking-[0.15em] mb-1.5 font-semibold">Никнейм</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-dota-gold transition-colors duration-300" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Как тебя зовут в Dota?"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-dota-bg/50 border border-dota-border/25 text-white font-body text-sm placeholder:text-slate-700 focus:border-dota-gold/25 focus:bg-dota-bg/70 focus:outline-none focus:shadow-[0_0_20px_rgba(218,165,32,0.06)] transition-all duration-300" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-body text-slate-500 uppercase tracking-[0.15em] mb-1.5 font-semibold">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-dota-gold transition-colors duration-300" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-dota-bg/50 border border-dota-border/25 text-white font-body text-sm placeholder:text-slate-700 focus:border-dota-gold/25 focus:bg-dota-bg/70 focus:outline-none focus:shadow-[0_0_20px_rgba(218,165,32,0.06)] transition-all duration-300" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-body text-slate-500 uppercase tracking-[0.15em] mb-1.5 font-semibold">Пароль</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-dota-gold transition-colors duration-300" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-dota-bg/50 border border-dota-border/25 text-white font-body text-sm placeholder:text-slate-700 focus:border-dota-gold/25 focus:bg-dota-bg/70 focus:outline-none focus:shadow-[0_0_20px_rgba(218,165,32,0.06)] transition-all duration-300" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/15 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-sm font-body text-red-400">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="group relative w-full py-3.5 rounded-xl bg-gradient-to-r from-dota-accent to-red-700 text-white font-body font-bold text-sm shadow-xl shadow-dota-accent/20 hover:shadow-dota-accent/40 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Swords className="w-4 h-4" />{mode === 'login' ? 'Войти в арену' : 'Создать аккаунт'}</>
                )}
              </span>
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dota-border/10" /></div>
              <div className="relative flex justify-center"><span className="bg-dota-card/50 px-4 text-[9px] font-body text-slate-700 uppercase tracking-widest">или</span></div>
            </div>

            <button type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="w-full py-3 rounded-xl bg-dota-bg/30 border border-dota-border/15 text-sm font-body text-slate-500 hover:text-white hover:border-dota-gold/15 transition-all duration-300">
              {mode === 'login' ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войди'}
            </button>
          </form>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-8">
          {[
            { icon: Shield, label: 'Безопасно' },
            { icon: Zap, label: 'Мгновенно' },
            { icon: Crown, label: 'Бесплатно' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-slate-700">
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-body uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bgDrift {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  );
}
