import { useState, useEffect } from 'react';
import { Package, Loader2, AlertCircle } from 'lucide-react';

interface Props { heroId: number; heroName: string; }
interface ItemEntry { id: string; name: string; img: string; count: number; }

let itemNamesCache: Record<string, { dname: string; img: string }> | null = null;

async function loadItemNames() {
  if (itemNamesCache) return itemNamesCache;
  try {
    const res = await fetch('https://api.opendota.com/api/constants/items');
    if (!res.ok) return {};
    const data = await res.json();
    const map: Record<string, { dname: string; img: string }> = {};
    for (const [key, val] of Object.entries(data) as any[]) {
      if (val.id !== undefined) {
        map[String(val.id)] = {
          dname: val.dname || key,
          img: val.img ? `https://cdn.cloudflare.steamstatic.com${val.img}` : '',
        };
      }
    }
    itemNamesCache = map;
    return map;
  } catch { return {}; }
}

export function HeroBuilds({ heroId, heroName }: Props) {
  const [sections, setSections] = useState<{ label: string; color: string; border: string; items: ItemEntry[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true); setError(false);
    Promise.all([
      fetch(`https://api.opendota.com/api/heroes/${heroId}/itemPopularity`).then(r => r.ok ? r.json() : null),
      loadItemNames(),
    ]).then(([pop, names]) => {
      if (!pop) { setError(true); setLoading(false); return; }

      const mapSection = (obj: Record<string, number>): ItemEntry[] =>
        Object.entries(obj || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([id, count]) => ({
            id,
            name: names[id]?.dname || `#${id}`,
            img: names[id]?.img || '',
            count,
          }));

      setSections([
        { label: 'Стартовые предметы', color: 'text-slate-300', border: 'border-slate-500/15', items: mapSection(pop.start_game_items) },
        { label: 'Ранняя игра', color: 'text-emerald-400', border: 'border-emerald-500/15', items: mapSection(pop.early_game_items) },
        { label: 'Кор предметы', color: 'text-dota-gold', border: 'border-dota-gold/15', items: mapSection(pop.mid_game_items) },
        { label: 'Поздняя игра', color: 'text-purple-400', border: 'border-purple-500/15', items: mapSection(pop.late_game_items) },
      ]);
      setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  }, [heroId]);

  if (loading) return (
    <div className="flex items-center justify-center py-16 gap-3">
      <Loader2 className="w-6 h-6 text-dota-gold animate-spin" />
      <span className="font-body text-slate-400">Загрузка билдов...</span>
    </div>
  );

  if (error) return (
    <div className="rounded-2xl bg-red-500/5 border border-red-500/15 p-8 text-center">
      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p className="font-body text-red-400">Не удалось загрузить билды</p>
    </div>
  );

  const maxCount = Math.max(...sections.flatMap(s => s.items.map(i => i.count)), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Package className="w-5 h-5 text-dota-gold" />
        <h3 className="font-display text-lg font-bold text-white">Популярные предметы</h3>
        <span className="text-xs font-body text-slate-600 ml-auto">OpenDota · Все ранги</span>
      </div>

      {sections.map(({ label, color, border, items }) => (
        items.length > 0 && (
          <div key={label} className={`rounded-2xl bg-dota-card/30 border ${border} p-5`}>
            <h4 className={`text-sm font-body font-bold ${color} uppercase tracking-wider mb-4`}>{label}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {items.map(item => {
                const pct = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={item.id} className="group relative flex items-center gap-2.5 p-2.5 rounded-xl bg-dota-bg/40 border border-dota-border/10 hover:border-dota-gold/15 transition-all duration-300">
                    <div className="w-10 h-7 rounded-lg overflow-hidden border border-dota-border/20 flex-shrink-0 bg-dota-card/50">
                      {item.img && <img src={item.img} alt={item.name} className="w-full h-full object-cover" loading="lazy"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-body text-white font-semibold truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1 rounded-full bg-dota-border/20 overflow-hidden">
                          <div className="h-full rounded-full bg-dota-gold/40" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] font-mono text-slate-500">{item.count.toLocaleString()}</span>
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
