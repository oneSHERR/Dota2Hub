import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Swords, BookOpen, HelpCircle, LogIn, Menu, X, Home, ScrollText, Crown, Calculator, Target } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/draft', label: 'Draft', icon: Swords },
  { path: '/wiki', label: 'Герои', icon: BookOpen },
  { path: '/tierlist', label: 'Тир-лист', icon: Crown },
  { path: '/calculator', label: 'Калькулятор', icon: Calculator },
  { path: '/counterpick', label: 'Контрпик', icon: Target },
  { path: '/quiz', label: 'Квиз', icon: HelpCircle },
  { path: '/patch', label: '7.41b', icon: ScrollText },
];

export function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-dota-border/50 backdrop-blur-xl bg-dota-bg/80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-dota-accent to-dota-gold flex items-center justify-center shadow-lg shadow-dota-accent/20 group-hover:shadow-dota-accent/40 transition-shadow">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display text-xl font-bold gradient-text tracking-wider">
              DOTA 2 HUB
            </h1>
            <p className="text-[10px] text-slate-500 font-body tracking-widest uppercase -mt-0.5">
              v3 · Полный арсенал
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-body font-semibold transition-all ${
                  active
                    ? 'bg-dota-accent/15 text-dota-accent'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dota-card border border-dota-border hover:border-dota-gold/30 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-dota-gold to-dota-accent flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user.displayName?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <span className="text-sm font-body text-slate-300 hidden sm:block">
                {user.displayName}
              </span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dota-accent/15 text-dota-accent hover:bg-dota-accent/25 transition-colors text-sm font-body font-medium"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:block">Войти</span>
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-dota-border/50 bg-dota-bg/95 backdrop-blur-xl animate-fade-in">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-6 py-3.5 text-base font-body ${
                pathname === path ? 'text-dota-accent bg-dota-accent/10' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
