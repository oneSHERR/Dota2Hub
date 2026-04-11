import { useState, useEffect } from 'react';
import { Package, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { fetchHeroItemBuilds, fetchItemConstants, type HeroItemBuild } from '@/data/stratzApi';

const ITEM_CDN = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items';

interface Props { heroId: number; heroName: string; }

export function HeroBuilds({ heroId, heroName }: Props) {
  const [builds, setBuilds] = useState<any>(null);
  const [items, setItems] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true); setError(false);
    Promise.all([fetchHeroItemBuilds(heroId), fetchItemConstants()])
      .then(([b, i]) => { setBuilds(b); setItems(i); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [heroId]);

  if (loading) return (
    <div className="flex items-center justify-center py-16 gap-3">
      <Loader2 className="w-6 h-6 text-dota-gold animate-spin" />
      <span className="font-body text-slate-400">Загрузка билдов из STRATZ...</span>
    </div>
  );

  if (error || !builds) return (
    <div className="rounded-2xl bg-red-500/5 border border-red-500/15 p-8 text-center">
      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p className="font-body text-red-400 mb-2">Не удалось загрузить билды</p>
      <p className="font-body text-slate-600 text-sm">Проверьте STRATZ API токен или попробуйте позже</p>
    </div>
  );

  const sections = [
    { key: 'starting', label: 'Стартовые предметы', items: builds.starting, color: 'text-slate-300', border: 'border-slate-500/15' },
    { key: 'early', label: 'Ранняя игра', items: builds.early, color: 'text-emerald-400', border: 'border-emerald-500/15' },
    { key: 'core', label: 'Кор предметы', items: builds.core, color: 'text-dota-gold', border: 'border-dota-gold/15' },
    { key: 'late', label: 'Поздняя игра', items: builds.late, color: 'text-purple-400', border: 'border-purple-500/15' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Package className="w-5 h-5 text-dota-gold" />
        <h3 className="font-display text-lg font-bold text-white">Билд предметов</h3>
        <span className="text-xs font-body text-slate-600 ml-auto">STRATZ · Immortal/Divine/Ancient</span>
      </div>

      {sections.map(({ key, label, items: sectionItems, color, border }) => (
        sectionItems && sectionItems.length > 0 && (
          <div key={key} className={`rounded-2xl bg-dota-card/40 border ${border} p-5`}>
            <h4 className={`text-sm font-body font-bold ${color} uppercase tracking-wider mb-4`}>{label}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sectionItems.map((item: HeroItemBuild) => {
                const info = items[item.itemId];
                const imgSrc = info ? `${ITEM_CDN}/${info.name}.png` : '';
                const name = info?.displayName || `Item #${item.itemId}`;
                return (
                  <div key={item.itemId} className="group flex items-center gap-3 p-3 rounded-xl bg-dota-bg/50 border border-dota-border/20 hover:border-dota-gold/20 transition-all duration-300">
                    <div className="w-12 h-9 rounded-lg overflow-hidden border border-dota-border/30 flex-shrink-0 bg-dota-card">
                      {imgSrc && <img src={imgSrc} alt={name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-body text-white font-semibold truncate">{name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-mono font-bold ${item.winRate >= 52 ? 'text-green-400' : item.winRate >= 48 ? 'text-slate-400' : 'text-red-400'}`}>
                          {item.winRate}%
                        </span>
                        <span className="text-[10px] font-body text-slate-600">{item.matchCount.toLocaleString()} игр</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
