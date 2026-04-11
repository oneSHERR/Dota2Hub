import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Swords, BookOpen, HelpCircle, LogIn, Menu, X, Home, ScrollText, Crown, Calculator, Target, Eye, Gamepad2 } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/draft', label: 'Draft', icon: Swords },
  { path: '/wiki', label: 'Герои', icon: BookOpen },
  { path: '/tierlist', label: 'Тир-лист', icon: Crown },
  { path: '/calculator', label: 'Калькулятор', icon: Calculator },
  { path: '/counterpick', label: 'Контрпик', icon: Target },
  { path: '/scout', label: 'Разведка', icon: Eye },
  { path: '/minigames', label: 'Мини-игры', icon: Gamepad2 },
  { path: '/quiz', label: 'Квиз', icon: HelpCircle },
  { path: '/patch', label: '7.41b', icon: ScrollText },
];

export function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-dota-bg/90 backdrop-blur-xl border-b border-dota-border/40 shadow-lg shadow-black/20'
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dota-accent to-dota-gold flex items-center justify-center shadow-lg group-hover:shadow-dota-accent/30 transition-all duration-300">
              <Swords className="w-5 h-5 text-white" />
            </div>
            {/* Pulse ring on hover */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-dota-accent to-dota-gold opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display text-xl font-bold tracking-wider">
              <span className="gradient-text">DOTA 2</span>{' '}
              <span className="text-white">HUB</span>
            </h1>
            <p className="text-[9px] text-slate-600 font-body tracking-[0.2em] uppercase -mt-0.5">v3 · Полный арсенал</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = pathname === path;
            return (
              <Link key={path} to={path}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-body font-semibold transition-all duration-200 ${
                  active
                    ? 'text-dota-gold'
                    : 'text-slate-500 hover:text-slate-200'
                }`}>
                <Icon className={`w-4 h-4 transition-colors ${active ? 'text-dota-gold' : ''}`} />
                {label}
                {/* Active indicator — glowing underline */}
                {active && (
                  <span className="absolute -bottom-0.5 left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-dota-gold to-transparent rounded-full" />
                )}
                {/* Hover glow */}
                {!active && (
                  <span className="absolute inset-0 rounded-lg bg-white/0 hover:bg-white/[0.03] transition-colors" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/profile" className="group flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-dota-border/30 hover:border-dota-gold/20 transition-all duration-300">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dota-gold to-dota-accent flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{user.displayName?.[0]?.toUpperCase() || '?'}</span>
                </div>
                {/* Online dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-dota-bg" />
              </div>
              <span className="text-sm font-body text-slate-300 hidden sm:block group-hover:text-white transition-colors">{user.displayName}</span>
            </Link>
          ) : (
            <Link to="/auth" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-dota-accent/20 to-dota-accent/10 border border-dota-accent/20 text-dota-accent hover:from-dota-accent/30 hover:border-dota-accent/30 transition-all duration-300 text-sm font-body font-medium">
              <LogIn className="w-4 h-4" /><span className="hidden sm:block">Войти</span>
            </Link>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-dota-border/30 bg-dota-bg/95 backdrop-blur-2xl animate-slide-down">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-6 py-3.5 text-base font-body transition-all ${
                pathname === path
                  ? 'text-dota-gold bg-dota-gold/5 border-l-2 border-dota-gold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.02] border-l-2 border-transparent'
              }`}>
              <Icon className="w-5 h-5" />{label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
