import { useState, useEffect, useCallback } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { HERO_GUIDES } from '@/data/heroGuides';
import { Shield } from 'lucide-react';
import { GameProps, GameWrapper, heroImg, itemImg, shuffle, randInt } from './shared';

const DOTA_ITEMS = [
  { name: 'bfury', label: 'Battle Fury', cost: 4100, type: 'damage' },
  { name: 'manta', label: 'Manta Style', cost: 4600, type: 'agility' },
  { name: 'black_king_bar', label: 'Black King Bar', cost: 4050, type: 'defense' },
  { name: 'blink', label: 'Blink Dagger', cost: 2250, type: 'mobility' },
  { name: 'heart', label: 'Heart of Tarrasque', cost: 5000, type: 'tank' },
  { name: 'butterfly', label: 'Butterfly', cost: 4975, type: 'agility' },
  { name: 'desolator', label: 'Desolator', cost: 3500, type: 'damage' },
  { name: 'monkey_king_bar', label: 'MKB', cost: 4975, type: 'damage' },
  { name: 'satanic', label: 'Satanic', cost: 5050, type: 'lifesteal' },
  { name: 'assault', label: 'Assault Cuirass', cost: 5075, type: 'armor' },
  { name: 'skadi', label: 'Eye of Skadi', cost: 5300, type: 'stats' },
  { name: 'shivas_guard', label: "Shiva's Guard", cost: 4750, type: 'armor' },
  { name: 'dagon_5', label: 'Dagon 5', cost: 7720, type: 'nuke' },
  { name: 'ethereal_blade', label: 'Ethereal Blade', cost: 4650, type: 'nuke' },
  { name: 'orchid', label: 'Orchid Malevolence', cost: 3475, type: 'silence' },
  { name: 'diffusal_blade', label: 'Diffusal Blade', cost: 2500, type: 'agility' },
  { name: 'blade_mail', label: 'Blade Mail', cost: 2100, type: 'defense' },
  { name: 'hood_of_defiance', label: 'Pipe of Insight', cost: 3475, type: 'magic_resist' },
  { name: 'sphere', label: "Linken's Sphere", cost: 4600, type: 'defense' },
  { name: 'radiance', label: 'Radiance', cost: 5050, type: 'damage' },
  { name: 'abyssal_blade', label: 'Abyssal Blade', cost: 6250, type: 'disable' },
  { name: 'refresher', label: 'Refresher Orb', cost: 5200, type: 'utility' },
  { name: 'silver_edge', label: 'Silver Edge', cost: 5450, type: 'invis' },
  { name: 'sange_and_yasha', label: 'Sange & Yasha', cost: 4100, type: 'stats' },
];

export function BuildHeroGame({ onBack, onSave, user, bestScore }: GameProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [round, setRound] = useState(0);
  const [puzzle, setPuzzle] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const totalRounds = 5;

  const generatePuzzle = useCallback(() => {
    const guideKeys = Object.keys(HERO_GUIDES);
    const heroName = guideKeys[randInt(0, guideKeys.length - 1)];
    const guide = HERO_GUIDES[heroName];
    const hero = ALL_HEROES.find(h => h.localized_name === heroName);
    const coreItemNames = guide.coreItems.map((i: string) => {
      const found = DOTA_ITEMS.find(d => d.label.toLowerCase().includes(i.toLowerCase().split(' ')[0]));
      return found?.name;
    }).filter(Boolean);
    const situationalNames = guide.situationalItems.map((i: string) => {
      const found = DOTA_ITEMS.find(d => d.label.toLowerCase().includes(i.toLowerCase().split(' ')[0]));
      return found?.name;
    }).filter(Boolean);
    const wrongItems = shuffle(DOTA_ITEMS.filter(d => !coreItemNames.includes(d.name) && !situationalNames.includes(d.name))).slice(0, 8);
    const allItems = shuffle([
      ...DOTA_ITEMS.filter(d => coreItemNames.includes(d.name)),
      ...DOTA_ITEMS.filter(d => situationalNames.includes(d.name)).slice(0, 2),
      ...wrongItems,
    ].slice(0, 12));
    return { hero, guide, heroName, coreItemNames, situationalNames, allItems };
  }, []);

  useEffect(() => {
    if (round < totalRounds) { setPuzzle(generatePuzzle()); setSelectedItems([]); setSubmitted(false); setRoundScore(0); }
  }, [round]);

  const toggleItem = (name: string) => {
    if (submitted) return;
    if (selectedItems.includes(name)) setSelectedItems(selectedItems.filter(i => i !== name));
    else if (selectedItems.length < 6) setSelectedItems([...selectedItems, name]);
  };

  const submitBuild = () => {
    if (!puzzle || selectedItems.length === 0) return;
    setSubmitted(true);
    let pts = 0;
    selectedItems.forEach(item => { if (puzzle.coreItemNames.includes(item)) pts += 40; else if (puzzle.situationalNames.includes(item)) pts += 20; });
    pts += combo * 5; setRoundScore(pts); setScore(s => s + pts);
    if (pts >= 100) setCombo(c => { const nc = c + 1; setMaxCombo(m => Math.max(m, nc)); return nc; });
    else setCombo(0);
  };

  const nextRound = () => {
    if (round + 1 >= totalRounds && user) onSave('build-hero', score, maxCombo);
    setRound(r => r + 1);
  };

  const restart = () => { setScore(0); setCombo(0); setMaxCombo(0); setRound(0); };

  return (
    <GameWrapper title="Собери билд" icon={Shield} color="from-teal-500 to-emerald-500"
      score={score} combo={combo} bestScore={bestScore} onBack={onBack} onRestart={restart}>
      {round >= totalRounds ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛡️</div>
          <h3 className="font-display text-2xl font-bold text-white mb-2">Все раунды пройдены!</h3>
          <p className="text-slate-400 font-body mb-6">Итого: <span className="text-dota-gold font-bold">{score}</span></p>
          <button onClick={restart} className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-body font-bold hover:scale-105 transition-transform">Снова</button>
        </div>
      ) : puzzle && (
        <div className="space-y-4">
          <span className="text-xs font-body text-slate-500">Раунд {round + 1}/{totalRounds}</span>
          <div className="rounded-xl bg-dota-card border border-dota-border/50 p-4 flex items-center gap-4">
            {puzzle.hero && <img src={heroImg(puzzle.hero.name)} alt="" className="w-20 h-12 rounded-lg object-cover" />}
            <div>
              <h4 className="font-display font-bold text-white">{puzzle.heroName}</h4>
              <p className="text-xs font-body text-slate-400">Позиция: {puzzle.guide.positions.join(', ')} · Выбери до 6 предметов</p>
            </div>
          </div>
          <div className="flex items-center gap-2 min-h-[50px] px-3 py-2 rounded-xl bg-dota-bg/50 border border-dota-border/30">
            {Array.from({ length: 6 }).map((_, i) => {
              const itemName = selectedItems[i];
              const item = itemName ? DOTA_ITEMS.find(d => d.name === itemName) : null;
              return (
                <div key={i} className={`w-12 h-9 rounded-lg border-2 flex items-center justify-center ${item ? 'border-dota-gold/40 bg-dota-card' : 'border-dashed border-slate-700'}`}>
                  {item ? <img src={itemImg(item.name)} alt="" className="w-10 h-7 object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <span className="text-slate-700 text-xs">?</span>}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {puzzle.allItems.map((item: any) => {
              const isSelected = selectedItems.includes(item.name);
              const isCore = submitted && puzzle.coreItemNames.includes(item.name);
              const isSituational = submitted && puzzle.situationalNames.includes(item.name);
              return (
                <button key={item.name} onClick={() => toggleItem(item.name)}
                  className={`relative p-2 rounded-xl border transition-all ${isSelected ? 'border-dota-gold bg-dota-gold/10' : submitted && isCore ? 'border-green-500/50 bg-green-500/10' : submitted && isSituational ? 'border-blue-500/50 bg-blue-500/10' : 'border-dota-border/30 bg-dota-card hover:border-white/10'}`}>
                  <img src={itemImg(item.name)} alt="" className="w-full aspect-[16/12] object-cover rounded-lg mb-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <p className="text-[10px] font-body text-slate-300 truncate">{item.label}</p>
                  {submitted && isCore && <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[8px] text-white">✓</div>}
                  {submitted && isSituational && <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white">~</div>}
                </button>
              );
            })}
          </div>
          {!submitted ? (
            <button onClick={submitBuild} disabled={selectedItems.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-body font-bold disabled:opacity-30 hover:scale-[1.02] transition-transform">
              Подтвердить билд ({selectedItems.length}/6)
            </button>
          ) : (
            <div className="space-y-3">
              <div className="text-center py-2">
                <span className="font-display text-lg font-bold text-dota-gold">+{roundScore} очков</span>
                <p className="text-xs font-body text-slate-500 mt-1">🟢 = ключевой предмет (+40) · 🔵 = ситуативный (+20)</p>
              </div>
              <button onClick={nextRound} className="w-full py-3 rounded-xl bg-dota-card border border-dota-border hover:border-white/20 text-white font-body font-semibold transition-colors">
                {round + 1 < totalRounds ? 'Следующий раунд →' : 'Результат'}
              </button>
            </div>
          )}
        </div>
      )}
    </GameWrapper>
  );
}
