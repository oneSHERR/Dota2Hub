import { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, Zap, Loader2, Clock, Droplets, Info, AlertCircle } from 'lucide-react';

const ABILITY_CDN = 'https://cdn.cloudflare.steamstatic.com';

// Sources with fallback
const SOURCES = {
  heroAbilities: [
    'https://api.opendota.com/api/constants/hero_abilities',
    'https://raw.githubusercontent.com/odota/dotaconstants/master/build/hero_abilities.json',
  ],
  abilities: [
    'https://api.opendota.com/api/constants/abilities',
    'https://raw.githubusercontent.com/odota/dotaconstants/master/build/abilities.json',
  ],
};

let cachedHA: any = null;
let cachedAb: any = null;

async function fetchFallback(urls: string[]): Promise<any> {
  for (const url of urls) {
    try { const r = await fetch(url); if (r.ok) { const d = await r.json(); if (d && typeof d === 'object') return d; } }
    catch (e) { console.warn(`Failed: ${url}`, e); }
  }
  throw new Error('All sources failed');
}

async function loadAbilities() {
  if (cachedHA && cachedAb) return { ha: cachedHA, ab: cachedAb };
  const [ha, ab] = await Promise.all([fetchFallback(SOURCES.heroAbilities), fetchFallback(SOURCES.abilities)]);
  cachedHA = ha; cachedAb = ab;
  return { ha, ab };
}

function getAbilities(heroName: string, ha: any, ab: any) {
  const key = `npc_dota_hero_${heroName}`;
  const d = ha[key];
  if (!d?.abilities) return [];
  return d.abilities
    .filter((n: string) => n && !n.includes('generic_hidden') && !n.includes('empty') && ab[n]?.dname)
    .map((n: string) => ({ key: n, data: ab[n] }));
}

interface Props { heroName: string; }

export function HeroSkills({ heroName }: Props) {
  const [abilities, setAbilities] = useState<{ key: string; data: any }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true); setError(false);
    loadAbilities()
      .then(({ ha, ab }) => { setAbilities(getAbilities(heroName, ha, ab)); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [heroName]);

  if (loading) return (
    <div className="flex items-center justify-center py-16 gap-3">
      <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      <span className="font-body text-slate-400">Загрузка способностей...</span>
    </div>
  );

  if (error) return (
    <div className="rounded-2xl bg-red-500/5 border border-red-500/15 p-8 text-center">
      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p className="font-body text-red-400 mb-3">Не удалось загрузить способности</p>
      <button onClick={() => { cachedHA = null; cachedAb = null; setLoading(true); setError(false);
        loadAbilities().then(({ ha, ab }) => { setAbilities(getAbilities(heroName, ha, ab)); setLoading(false); })
          .catch(() => { setError(true); setLoading(false); });
      }} className="px-5 py-2 rounded-xl bg-red-500/15 text-red-400 font-body font-bold hover:bg-red-500/25 transition-all">
        Попробовать снова
      </button>
    </div>
  );

  if (abilities.length === 0) return (
    <div className="rounded-2xl bg-dota-card/40 border border-dota-border/20 p-8 text-center">
      <p className="font-body text-slate-500">Данные о способностях не найдены</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-5 h-5 text-amber-400" />
        <h3 className="font-display text-lg font-bold text-white">Способности</h3>
        <span className="text-xs font-body text-slate-600 ml-auto">OpenDota</span>
      </div>
      {abilities.map((a, i) => <AbilityCard key={a.key} ability={a.data} index={i} />)}
    </div>
  );
}

function AbilityCard({ ability, index }: { ability: any; index: number }) {
  const [open, setOpen] = useState(false);
  const imgUrl = ability.img ? `${ABILITY_CDN}${ability.img}` : '';
  const mana = Array.isArray(ability.mc) ? ability.mc.join(' / ') : '';
  const cd = Array.isArray(ability.cd) ? ability.cd.join(' / ') : '';
  const behavior = Array.isArray(ability.behavior) ? ability.behavior.join(', ') : ability.behavior || '';
  const dmgColor = ability.dmg_type === 'Magical' ? '#00B4F0' : ability.dmg_type === 'Physical' ? '#EC3D06' : ability.dmg_type === 'Pure' ? '#f0c040' : '#9ca3af';
  const dmgLabel = ability.dmg_type === 'Magical' ? 'Магический' : ability.dmg_type === 'Physical' ? 'Физический' : ability.dmg_type === 'Pure' ? 'Чистый' : '';

  return (
    <div className="rounded-2xl bg-dota-card/40 border border-dota-border/20 overflow-hidden hover:border-dota-border/40 transition-all duration-300">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 p-4 text-left">
        <div className="relative flex-shrink-0">
          {imgUrl ? (
            <img src={imgUrl} alt={ability.dname} className="w-14 h-14 rounded-xl border-2 border-dota-border/30 object-cover shadow-lg"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="w-14 h-14 rounded-xl border-2 border-dota-border/30 bg-dota-bg/50 flex items-center justify-center">
              <Zap className="w-6 h-6 text-slate-600" />
            </div>
          )}
          <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-amber-500/90 flex items-center justify-center">
            <span className="text-[10px] font-mono font-bold text-black">{index + 1}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-display text-lg font-bold text-white truncate">{ability.dname}</h4>
          <p className="text-sm font-body text-slate-500 line-clamp-2 leading-relaxed">{ability.desc}</p>
        </div>

        <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
          {mana && <div className="flex items-center gap-1"><Droplets className="w-4 h-4 text-blue-400" /><span className="text-sm font-mono font-bold text-blue-300">{mana}</span></div>}
          {cd && <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-400" /><span className="text-sm font-mono font-bold text-amber-300">{cd}</span></div>}
        </div>

        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-dota-border/15 pt-4 space-y-4 animate-fade-in">
          <div className="flex sm:hidden items-center gap-4">
            {mana && <div className="flex items-center gap-1"><Droplets className="w-4 h-4 text-blue-400" /><span className="text-sm font-mono font-bold text-blue-300">{mana}</span></div>}
            {cd && <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-400" /><span className="text-sm font-mono font-bold text-amber-300">{cd}</span></div>}
          </div>
          <p className="font-body text-slate-300 leading-relaxed">{ability.desc}</p>
          <div className="flex flex-wrap gap-2">
            {behavior && <span className="px-3 py-1 rounded-full bg-dota-bg/50 border border-dota-border/20 text-xs font-body text-slate-400 uppercase tracking-wider">{behavior}</span>}
            {dmgLabel && <span className="px-3 py-1 rounded-full border text-xs font-body font-bold uppercase tracking-wider" style={{ borderColor: dmgColor + '30', color: dmgColor, backgroundColor: dmgColor + '10' }}>{dmgLabel}</span>}
            {ability.bkbpierce === 'Yes' && <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-body text-amber-400 font-bold uppercase tracking-wider">Пробивает BKB</span>}
          </div>
          {ability.attrib?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {ability.attrib.filter((a: any) => a.header && a.value).map((attr: any, j: number) => (
                <div key={j} className="flex items-center justify-between px-3 py-2 rounded-xl bg-dota-bg/30">
                  <span className="text-xs font-body text-slate-500">{attr.header.replace(/:$/, '')}</span>
                  <span className="text-xs font-mono font-bold text-white">{Array.isArray(attr.value) ? attr.value.join(' / ') : attr.value}</span>
                </div>
              ))}
            </div>
          )}
          {ability.lore && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <Info className="w-4 h-4 text-amber-500/50 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-body text-amber-200/50 italic leading-relaxed">{ability.lore}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
