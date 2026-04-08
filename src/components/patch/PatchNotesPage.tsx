import { useState } from 'react';
import { ChevronDown, ChevronUp, Scroll, Swords, Shield, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getHeroImage } from '@/data/heroes';

type ChangeType = 'buff' | 'nerf' | 'rework';

interface HeroChange {
  name: string;
  internalName: string;
  type: ChangeType;
  changes: string[];
  talents?: string[];
}

const HERO_CHANGES: HeroChange[] = [
  { name: 'Alchemist', internalName: 'alchemist', type: 'nerf', changes: ['Базовая ловкость уменьшена с 22 до 19'], talents: ['Талант 10 ур.: «+1 снижение брони Acid Spray» заменён на «+1% снижение урона и замедление Corrosive Weaponry за стак»', 'Талант 15 ур.: «+1% снижение Corrosive Weaponry за стак» заменён на «+1 снижение брони Acid Spray»'] },
  { name: 'Ancient Apparition', internalName: 'ancient_apparition', type: 'buff', changes: ['Bone Chill: бонус снижения силы с Aghanim\'s Scepter увеличен с 0.3 до 0.8'] },
  { name: 'Anti-Mage', internalName: 'antimage', type: 'buff', changes: ['Mana Break: макс. сжигание маны за удар увеличено с 1.6/2.4/3.2/4% до 1.8/2.7/3.6/4.5%'], talents: ['Талант 20 ур.: дальность Blink уменьшена с 150 до 125'] },
  { name: 'Arc Warden', internalName: 'arc_warden', type: 'nerf', changes: [], talents: ['Талант 20 ур.: КД Magnetic Field уменьшен с 5с до 4с', 'Талант 20 ур.: «+200 урона Spark Wraith» → «+30с длительность Spark Wraith»', 'Талант 25 ур.: «+30с длительность Spark Wraith» → «+240 урона Spark Wraith»', 'Талант 25 ур.: бонус атрибутов Runic Infusion уменьшен с 1.5 до 1'] },
  { name: 'Batrider', internalName: 'batrider', type: 'nerf', changes: ['Базовая броня уменьшена на 1', 'Firefly: КД увеличен с 45/40/35/30 до 48/42/36/30с'], talents: ['Талант 15 ур.: замедление Sticky Napalm за стак увеличено с 0.5% до 0.75%'] },
  { name: 'Beastmaster', internalName: 'beastmaster', type: 'nerf', changes: ['Базовая скорость атаки уменьшена с 100 до 90', 'Wild Axes: длительность дебафа изменена с 12 на 10/11/12/13с'], talents: ['Талант 10 ур.: бонус брони уменьшен с 5 до 4', 'Талант 10 ур.: бонус урона за стак Wild Axes уменьшен с 2% до 1.5%'] },
  { name: 'Bloodseeker', internalName: 'bloodseeker', type: 'nerf', changes: ['Rupture: стоимость маны увеличена с 100/150/200 до 125/175/225'], talents: ['Талант 25 ур.: макс. скорость Thirst за героя уменьшена с 18% до 15%'] },
  { name: 'Broodmother', internalName: 'broodmother', type: 'buff', changes: ['Базовая ловкость увеличена с 18 до 20', 'Базовый урон на 1 ур. увеличен с 45–51 до 47–53'] },
  { name: 'Chaos Knight', internalName: 'chaos_knight', type: 'rework', changes: ['Phantasm: КД увеличен с 75 до 85/80/75с', 'Количество иллюзий изменено с 1/2/3 на 3 на всех уровнях', 'Урон иллюзий уменьшен с 100% до 50/75/100%'] },
  { name: 'Chen', internalName: 'chen', type: 'buff', changes: ['Holy Persuasion: бонус урона увеличен с 0/6/12/18% до 5/10/15/20%'] },
  { name: 'Clinkz', internalName: 'clinkz', type: 'buff', changes: [], talents: ['Талант 10 ур.: длительность Strafe увеличена с 0.75 до 1с'] },
  { name: 'Crystal Maiden', internalName: 'crystal_maiden', type: 'nerf', changes: ['Crystal Clone: КД увеличен с 10 до 12с'] },
  { name: 'Dawnbreaker', internalName: 'dawnbreaker', type: 'nerf', changes: ['Break of Dawn: макс. бонус урона уменьшен с 10% + 1%/ур. до 8% + 1%/ур.'] },
  { name: 'Death Prophet', internalName: 'death_prophet', type: 'buff', changes: ['Exorcism: урон духов увеличен с 64 до 65/68/71'] },
  { name: 'Doom', internalName: 'doom_bringer', type: 'nerf', changes: ['Scorched Earth: урон уменьшен с 20/35/50/65 до 20/30/40/50', 'Doom (ульт): DPS уменьшен с 25/45/66 до 22/44/66'], talents: ['Талант 10 ур.: «Devour даёт +15% сопр. магии» → «+10% сопр. магии»', 'Талант 15 ур.: «+66 урона» → «+1.5% урон Infernal Blade от макс. HP»', 'Талант 20 ур.: «+2.5% Infernal Blade» → «+66 урона»'] },
  { name: 'Drow Ranger', internalName: 'drow_ranger', type: 'buff', changes: ['Базовая ловкость увеличена с 22 до 24', 'Базовый урон увеличен с 49–56 до 51–58', 'Marksmanship: радиус отключения уменьшен с 325 до 300', 'Glacier: больше не предотвращает отключение Marksmanship'], talents: ['Талант 25 ур.: волны Multishot увеличены с +1 до +2'] },
  { name: 'Elder Titan', internalName: 'elder_titan', type: 'buff', changes: ['Momentum: бонус брони от скорости увеличен с 3.6%+0.4%/ур. до 5%+0.5%/ур.'] },
  { name: 'Ember Spirit', internalName: 'ember_spirit', type: 'nerf', changes: ['Базовый урон уменьшен на 3 (55–59 → 52–56)', 'Sleight of Fist: стоимость маны увеличена с 60/65/70/75 до 75'] },
  { name: 'Enigma', internalName: 'enigma', type: 'buff', changes: ['Event Horizon: замедление увеличено с 4%+1%/ур. до 5%+1%/ур.', 'Demonic Summoning: урон Eidolon увеличен с 16/27/38/49 до 16/28/40/52'] },
  { name: 'Gyrocopter', internalName: 'gyrocopter', type: 'buff', changes: ['Flak Cannon: КД изменён с 26/24/22/20 на 25с', 'Call Down: КД уменьшен с 90/75/60 до 75/65/55с'] },
  { name: 'Hoodwink', internalName: 'hoodwink', type: 'nerf', changes: ['Hunter\'s Boomerang: длительность дебафа уменьшена с 7 до 6с'] },
  { name: 'Invoker', internalName: 'invoker', type: 'buff', changes: ['Invoke: доп. очко способности на уровнях 6, 12 и 18'], talents: ['Талант 20 ур.: «+1 уровень сфер» → «+50% снижение брони Forged Spirit»'] },
  { name: 'Jakiro', internalName: 'jakiro', type: 'rework', changes: ['Dual Breath: КД изменён с 10 на 12/11/10/9с', 'Liquid Fire: урон горения изменён с 15/25/35/45 на 12/24/36/48', 'Macropyre: стоимость маны уменьшена с 300/400/500 до 250/350/450'], talents: ['Талант 20 ур.: урон Macropyre увеличен с 20 до 25'] },
  { name: 'Juggernaut', internalName: 'juggernaut', type: 'buff', changes: ['Базовая скорость увеличена с 300 до 305', 'Bladeform: бонус ловкости за стак увеличен с 2.5%+0.05%/ур. до 2.5%+0.1%/ур.'], talents: ['Талант 20 ур.: урон Blade Fury увеличен с 100 до 120'] },
  { name: 'Keeper of the Light', internalName: 'keeper_of_the_light', type: 'nerf', changes: ['Bright Speed: требуемый интеллект для +1 скорости увеличен с 2.5 до 3', 'Spirit Form: бонус дальности уменьшен с 100/200/300 до 100/175/250'], talents: ['Талант 15 ур.: бонус Bright Speed в Spirit Form уменьшен с 30% до 25%'] },
  { name: 'Largo', internalName: 'largo', type: 'buff', changes: ['Encore: бонус длительности увеличен с 9%+1%/ур. до 10%+1%/ур.', 'Croak of Genius: стоимость маны/с изменена с 25/35/45/55 на 40, длительность увеличена с 12/18/24/30 до 15/20/25/30с', 'Bullbelly Blitz (Scepter): бонус урона/стак уменьшен с 6/12/18 до 6/10/14'], talents: ['Талант 20 ур.: урон Catchy Lick увеличен с 170 до 200'] },
  { name: 'Lycan', internalName: 'lycan', type: 'buff', changes: ['Shapeshift: КД уменьшен с 110/100/90 до 105/95/85с'] },
  { name: 'Magnus', internalName: 'magnataur', type: 'buff', changes: ['Рост ловкости увеличен с 2 до 2.2', 'Урон за уровень увеличен с 3.2 до 3.3'] },
  { name: 'Meepo', internalName: 'meepo', type: 'nerf', changes: ['Скорость уменьшена с 315 до 310', 'Рост силы уменьшен с 2.2 до 2', 'Ransack: вампиризм от героев уменьшен с 9/12/15/18 до 7/10/13/16', 'Divided We Stand: бонусы предметов к HP/мане делятся между клонами', 'MegaMeepo: КД увеличен с 60 до 90с, длительность уменьшена с 25 до 20с'], talents: ['Талант 10 ур.: «+40 урона Poof» → «-1.5с КД Earthbind»', 'Талант 15 ур.: «-2.5с КД Earthbind» → «+40 урона Poof»', 'Талант 20 ур.: вампиризм Ransack уменьшен с 7 до 6'] },
  { name: 'Monkey King', internalName: 'monkey_king', type: 'nerf', changes: ['Changing of the Guard: КД увеличен с 3 до 5с'], talents: ['Талант 10 ур.: дальность Tree Dance уменьшена с 350 до 300'] },
  { name: 'Naga Siren', internalName: 'naga_siren', type: 'nerf', changes: ['Базовая скорость атаки уменьшена с 110 до 100', 'Eelskin: уклонение за иллюзию уменьшено с 4.9%+0.1%/ур. до 4%+0.1%/ур.'] },
  { name: 'Nature\'s Prophet', internalName: 'furion', type: 'buff', changes: ['Wrath of Nature: базовый урон увеличен с 90/130/170 до 100/140/180'] },
  { name: 'Necrophos', internalName: 'necrolyte', type: 'nerf', changes: ['Death Seeker: стоимость маны увеличена с 125 до 160'] },
  { name: 'Night Stalker', internalName: 'night_stalker', type: 'nerf', changes: ['Базовая регенерация здоровья уменьшена на 1.25'] },
  { name: 'Nyx Assassin', internalName: 'nyx_assassin', type: 'nerf', changes: ['Vendetta: длительность уменьшена с 60 до 45/50/55с'] },
  { name: 'Omniknight', internalName: 'omniknight', type: 'buff', changes: ['Hammer of Purity: лечение от урона увеличено с 30% до 35%', 'Guardian Angel: длительность увеличена с 4/4.5/5 до 4/4.75/5.5с', 'Guardian Angel (Scepter): бонус регена уменьшен с 100% до 50%'], talents: ['Талант 20 ур.: радиус Degen Aura увеличен с 125 до 150'] },
  { name: 'Pangolier', internalName: 'pangolier', type: 'nerf', changes: ['Lucky Shot: замедление атаки уменьшено с 40/80/120/160 до 35/70/105/140', 'Rolling Thunder: множитель урона от атаки уменьшен с 100% до 80%'] },
  { name: 'Phantom Assassin', internalName: 'phantom_assassin', type: 'buff', changes: ['Рост силы увеличен с 2 до 2.2', 'Phantom Strike: длительность увеличена с 2.5 до 3с, скорость атаки: 80/120/160/200', 'Coup de Grace: крит. урон увеличен с 200/300/400% до 200/325/450%'] },
  { name: 'Phoenix', internalName: 'phoenix', type: 'nerf', changes: ['Дальность атаки уменьшена с 525 до 500', 'Sun Ray (Shard): больше не добавляет 10% замедление'] },
  { name: 'Primal Beast', internalName: 'primal_beast', type: 'nerf', changes: ['Pulverize: КД увеличен с 40/35/30 до 45/40/35с'], talents: ['Талант 10 ур.: бонус урона уменьшен с 30 до 25'] },
  { name: 'Pudge', internalName: 'pudge', type: 'buff', changes: ['Flesh Heap: сила за стак увеличена с 1.6 до 2'] },
  { name: 'Rubick', internalName: 'rubick', type: 'nerf', changes: [], talents: ['Талант 20 ур.: урон Telekinesis уменьшен с 325 до 300'] },
  { name: 'Sand King', internalName: 'sand_king', type: 'nerf', changes: ['Epicenter: замедление атаки уменьшено с 50/55/60 до 30/40/50', 'Stinger (Scepter): урон прока уменьшен с 50% до 40%'] },
  { name: 'Shadow Demon', internalName: 'shadow_demon', type: 'nerf', changes: ['Disruption: длительность иллюзий уменьшена с 11/12/13/14 до 8/10/12/14с'], talents: ['Талант 15 ур.: бонус скорости уменьшен с 25 до 20'] },
  { name: 'Shadow Shaman', internalName: 'shadow_shaman', type: 'nerf', changes: ['Рост интеллекта уменьшен с 3.5 до 3.3'] },
  { name: 'Silencer', internalName: 'silencer', type: 'nerf', changes: [], talents: ['Талант 15 ур.: снижение КД Global Silence уменьшено с 20 до 15с'] },
  { name: 'Skywrath Mage', internalName: 'skywrath_mage', type: 'buff', changes: ['Базовая регенерация маны увеличена на 0.25'] },
  { name: 'Slardar', internalName: 'slardar', type: 'nerf', changes: ['Guardian Sprint: КД увеличен с 29/25/21/17 до 33/28/23/18с'] },
  { name: 'Slark', internalName: 'slark', type: 'nerf', changes: ['Essence Shift: длительность уменьшена с 12.5+2.5/ур. до 10+2.5/ур.'], talents: ['Талант 20 ур.: бонус Essence Shift уменьшен с 25 до 20с'] },
  { name: 'Snapfire', internalName: 'snapfire', type: 'buff', changes: ['Scatterblast: КД уменьшен с 18/15/12/9 до 17/14/11/8с, радиус увеличен с 225 до 250'] },
  { name: 'Spectre', internalName: 'spectre', type: 'nerf', changes: ['Рост силы уменьшен с 2.4 до 2.3', 'Dispersion: макс. радиус уменьшен с 800 до 700'], talents: ['Талант 10 ур.: снижение КД Spectral Dagger уменьшено с 4 до 3с'] },
  { name: 'Techies', internalName: 'techies', type: 'nerf', changes: [], talents: ['Талант 10 ур.: сопр. магии уменьшено с 20% до 15%', 'Талант 15 ур.: урон Blast Off! уменьшен с 200 до 175'] },
  { name: 'Terrorblade', internalName: 'terrorblade', type: 'nerf', changes: [], talents: ['Талант 20 ур.: бонус длительности иллюзий Conjure Image уменьшен с 10 до 8с'] },
  { name: 'Tidehunter', internalName: 'tidehunter', type: 'nerf', changes: ['Базовая сила уменьшена с 26 до 25, урон: 50–56', 'Leviathan\'s Catch: рыба даётся на каждый чётный уровень'], talents: ['Талант 15 ур.: урон Gush уменьшен с 100 до 90', 'Anchor Smash (талант 25 ур.) наносит 50% урона по зданиям'] },
  { name: 'Timbersaw', internalName: 'shredder', type: 'rework', changes: ['Whirling Death: урон: 60/120/180/240 (было 75/120/165/210)', 'Timber Chain: урон: 45/105/165/225 (было 45/100/155/210)', 'Chakram: мгновенный урон: 75/150/225 (было 100/150/200)'] },
  { name: 'Tinker', internalName: 'tinker', type: 'buff', changes: ['Deploy Turrets: скорость ракет увеличена с 1200 до 1350', 'Время установки турели уменьшено с 0.3 до 0с'] },
  { name: 'Tiny', internalName: 'tiny', type: 'rework', changes: ['Рост интеллекта увеличен с 2.2 до 2.4', 'Tree Volley: брошенные деревья больше не активируют cleave'] },
  { name: 'Treant Protector', internalName: 'treant', type: 'nerf', changes: ['Nature\'s Grasp: КД увеличен с 20/19/18/17 до 23/21/19/17с'] },
  { name: 'Tusk', internalName: 'tusk', type: 'nerf', changes: ['Bitter Chill: замедление атаки: 12+3/ур. (было 17+3/ур.)', 'Drinking Buddies: альт. каст убран, бонус брони уменьшен с 10 до 7'] },
  { name: 'Void Spirit', internalName: 'void_spirit', type: 'nerf', changes: ['Dissimilate: урон уменьшен с 120/200/280/360 до 105/185/265/345'] },
  { name: 'Windranger', internalName: 'windrunner', type: 'buff', changes: ['Базовый реген HP увеличен на 0.5', 'Powershot: замедление увеличено с 20/25/30/35% до 22/28/34/40%', 'Gale Force: КД уменьшен с 30 до 25с'] },
];

export function PatchNotesPage() {
  const [filter, setFilter] = useState<'all' | ChangeType>('all');
  const [expandedHeroes, setExpandedHeroes] = useState<Set<string>>(new Set());

  const toggleHero = (name: string) => {
    setExpandedHeroes(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const filtered = filter === 'all' ? HERO_CHANGES : HERO_CHANGES.filter(h => h.type === filter);
  const counts = { all: HERO_CHANGES.length, buff: HERO_CHANGES.filter(h => h.type === 'buff').length, nerf: HERO_CHANGES.filter(h => h.type === 'nerf').length, rework: HERO_CHANGES.filter(h => h.type === 'rework').length };

  const expandAll = () => {
    if (expandedHeroes.size === filtered.length) setExpandedHeroes(new Set());
    else setExpandedHeroes(new Set(filtered.map(h => h.name)));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dota-accent to-dota-gold flex items-center justify-center">
            <Scroll className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black text-white">Патч 7.41b</h1>
            <p className="text-xs font-body text-slate-500">8 апреля 2026</p>
          </div>
        </div>
        <p className="font-body text-sm text-slate-400">Балансный патч: правки героев, предметов и нейтральных крипов. {HERO_CHANGES.length} героев затронуто.</p>
      </div>

      {/* Item summary */}
      <div className="rounded-2xl bg-dota-card border border-dota-border p-5 mb-6">
        <div className="flex items-center gap-2 mb-3"><Shield className="w-5 h-5 text-blue-400" /><h2 className="font-display text-lg font-bold text-white">Ключевые изменения предметов</h2></div>
        <div className="space-y-2 text-sm font-body text-slate-300">
          <div className="flex items-start gap-2"><TrendingDown className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /><span><b className="text-white">Sange</b> и все сборки — усиление регена HP: 20% → 16%</span></div>
          <div className="flex items-start gap-2"><TrendingDown className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /><span><b className="text-white">BKB</b> — бонусы длительности больше не влияют на длительность заклинания</span></div>
          <div className="flex items-start gap-2"><Minus className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" /><span><b className="text-white">Holy Locket</b> — входящее лечение 15%, исходящее 10%</span></div>
          <div className="flex items-start gap-2"><TrendingDown className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /><span><b className="text-white">Mage Slayer</b> — реген 5.5, сопр. магии 18%</span></div>
          <div className="flex items-start gap-2"><TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /><span><b className="text-white">Gleipnir</b> — радиус Eternal Chains: 275 → 325</span></div>
          <div className="flex items-start gap-2"><TrendingDown className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /><span><b className="text-white">Торментор</b> — отражённый урон/мин.: 2% → 1.5%</span></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          {([{ key: 'all' as const, label: `Все (${counts.all})`, color: 'white' }, { key: 'buff' as const, label: `Баффы (${counts.buff})`, color: '#4ade80' }, { key: 'nerf' as const, label: `Нерфы (${counts.nerf})`, color: '#f87171' }, { key: 'rework' as const, label: `Реворки (${counts.rework})`, color: '#facc15' }]).map(({ key, label, color }) => (
            <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded-lg text-xs font-body font-bold transition-all ${filter === key ? 'shadow-lg' : 'bg-dota-card text-slate-500 hover:text-slate-300'}`} style={filter === key ? { backgroundColor: color + '20', color } : {}}>{label}</button>
          ))}
        </div>
        <button onClick={expandAll} className="text-xs font-body text-slate-500 hover:text-white">{expandedHeroes.size === filtered.length ? 'Свернуть' : 'Развернуть'}</button>
      </div>

      {/* Hero list */}
      <div className="space-y-2">
        {filtered.map(hero => {
          const expanded = expandedHeroes.has(hero.name);
          const cfg = { buff: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'БАФФ' }, nerf: { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'НЕРФ' }, rework: { icon: Swords, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'РЕВОРК' } }[hero.type];
          const TypeIcon = cfg.icon;
          return (
            <div key={hero.name} className={`rounded-xl bg-dota-card border ${cfg.border} overflow-hidden`}>
              <button onClick={() => toggleHero(hero.name)} className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.02] transition-colors">
                <img src={getHeroImage(hero.internalName)} alt="" className="w-12 h-7 rounded object-cover flex-shrink-0" />
                <span className="font-body text-sm font-bold text-white flex-1 text-left">{hero.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-body font-bold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              {expanded && (
                <div className="px-4 pb-4 pt-1 border-t border-dota-border/30 animate-fade-in">
                  {hero.changes.length > 0 && <div className="space-y-1.5 mb-2">{hero.changes.map((c, i) => (<div key={i} className="flex items-start gap-2"><TypeIcon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${cfg.color}`} /><span className="text-xs font-body text-slate-300">{c}</span></div>))}</div>}
                  {hero.talents && hero.talents.length > 0 && (<div className="mt-2 pt-2 border-t border-dota-border/20"><span className="text-[10px] font-body text-slate-500 uppercase tracking-wider">Таланты</span><div className="space-y-1 mt-1">{hero.talents.map((t, i) => (<div key={i} className="flex items-start gap-2"><Zap className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-500/60" /><span className="text-[11px] font-body text-slate-400">{t}</span></div>))}</div></div>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
