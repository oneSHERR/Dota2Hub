import { useState, useEffect } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { Crown } from 'lucide-react';
import { GameProps, GameWrapper, heroImg, heroCrop, shuffle, randInt } from './shared';

export function AttributeBattleGame({ onBack, onSave, user, bestScore }: GameProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [playerDeck, setPlayerDeck] = useState<any[]>([]);
  const [aiDeck, setAiDeck] = useState<any[]>([]);
  const [aiCard, setAiCard] = useState<any>(null);
  const [selectedAttr, setSelectedAttr] = useState<string | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const makeCard = (hero: any) => ({
    hero,
    stats: {
      'Сила': randInt(40, 120), 'Ловкость': randInt(20, 100), 'Интеллект': randInt(30, 110),
      'Скорость': randInt(280, 370), 'Броня': randInt(1, 30), 'Урон': randInt(40, 120),
    }
  });

  useEffect(() => {
    const heroes = shuffle(ALL_HEROES).slice(0, 12);
    setPlayerDeck(heroes.slice(0, 6).map(makeCard));
    setAiDeck(heroes.slice(6, 12).map(makeCard));
  }, []);

  const playRound = (attr: string) => {
    if (result || playerDeck.length === 0 || aiDeck.length === 0) return;
    const pCard = playerDeck[0]; const aCard = aiDeck[0];
    setAiCard(aCard); setSelectedAttr(attr);
    const pVal = pCard.stats[attr]; const aVal = aCard.stats[attr];
    let roundResult: 'win' | 'lose' | 'draw';
    if (pVal > aVal) { roundResult = 'win'; setScore(s => s + 100 + combo * 5); setCombo(c => { const nc = c + 1; setMaxCombo(m => Math.max(m, nc)); return nc; }); }
    else if (pVal < aVal) { roundResult = 'lose'; setCombo(0); }
    else { roundResult = 'draw'; }
    setResult(roundResult);
    setTimeout(() => {
      const newPlayer = [...playerDeck.slice(1)]; const newAi = [...aiDeck.slice(1)];
      if (roundResult === 'win') newPlayer.push(aCard); else if (roundResult === 'lose') newAi.push(pCard);
      if (newPlayer.length === 0 || newAi.length === 0) { setGameOver(true); if (user) onSave('attribute-battle', score + (roundResult === 'win' ? 100 : 0), maxCombo); }
      setPlayerDeck(newPlayer); setAiDeck(newAi); setAiCard(null); setSelectedAttr(null); setResult(null);
    }, 2000);
  };

  const restart = () => {
    setScore(0); setCombo(0); setMaxCombo(0); setGameOver(false); setAiCard(null); setSelectedAttr(null); setResult(null);
    const heroes = shuffle(ALL_HEROES).slice(0, 12);
    setPlayerDeck(heroes.slice(0, 6).map(makeCard)); setAiDeck(heroes.slice(6, 12).map(makeCard));
  };

  const currentCard = playerDeck[0];

  return (
    <GameWrapper title="Козырная карта" icon={Crown} color="from-amber-500 to-yellow-600"
      score={score} combo={combo} bestScore={bestScore} onBack={onBack} onRestart={restart}>
      {gameOver ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">{playerDeck.length > aiDeck.length ? '👑' : '💀'}</div>
          <h3 className="font-display text-2xl font-bold text-white mb-2">{playerDeck.length > aiDeck.length ? 'Победа!' : 'Поражение'}</h3>
          <p className="text-slate-400 font-body mb-6">Счёт: <span className="text-dota-gold font-bold">{score}</span></p>
          <button onClick={restart} className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-body font-bold hover:scale-105 transition-transform">Снова</button>
        </div>
      ) : currentCard && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-body text-slate-500">
            <span>Ваши карты: {playerDeck.length}</span><span>Карты AI: {aiDeck.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-dota-card border border-dota-gold/30 overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden relative">
                <img src={heroCrop(currentCard.hero.name)} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = heroImg(currentCard.hero.name); }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <p className="absolute bottom-2 left-3 font-display text-sm font-bold text-white">{currentCard.hero.localized_name}</p>
              </div>
              <div className="p-3 space-y-1.5">
                {Object.entries(currentCard.stats).map(([attr, val]) => (
                  <button key={attr} onClick={() => playRound(attr)} disabled={!!result}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-body transition-all ${selectedAttr === attr ? (result === 'win' ? 'bg-green-500/20 text-green-400' : result === 'lose' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400') : 'bg-dota-bg/50 text-slate-300 hover:bg-dota-bg'}`}>
                    <span>{attr}</span><span className="font-bold">{val as number}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-dota-card border border-red-500/30 overflow-hidden">
              {aiCard ? (
                <>
                  <div className="aspect-[16/10] overflow-hidden relative animate-fade-in">
                    <img src={heroCrop(aiCard.hero.name)} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = heroImg(aiCard.hero.name); }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <p className="absolute bottom-2 left-3 font-display text-sm font-bold text-white">{aiCard.hero.localized_name}</p>
                  </div>
                  <div className="p-3 space-y-1.5">
                    {Object.entries(aiCard.stats).map(([attr, val]) => (
                      <div key={attr} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-body ${selectedAttr === attr ? (result === 'lose' ? 'bg-green-500/20 text-green-400' : result === 'win' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400') : 'bg-dota-bg/50 text-slate-300'}`}>
                        <span>{attr}</span><span className="font-bold">{val as number}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <div className="aspect-[16/10] flex items-center justify-center bg-dota-bg/50"><span className="text-4xl">❓</span></div>}
            </div>
          </div>
          {result && (
            <div className={`text-center py-2 rounded-xl font-display font-bold text-lg animate-fade-in ${result === 'win' ? 'text-green-400' : result === 'lose' ? 'text-red-400' : 'text-yellow-400'}`}>
              {result === 'win' ? '🎉 Победа!' : result === 'lose' ? '💥 Проигрыш' : '🤝 Ничья'}
            </div>
          )}
        </div>
      )}
    </GameWrapper>
  );
}
