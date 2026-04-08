import type { Hero, DraftSlot, DraftAnalysis, LaneAnalysis, KeyMatchup } from '@/types';

/**
 * Counter matrix: counterMatrix[heroId][vsHeroId] = advantage score (-5 to +5)
 * Positive = hero1 counters hero2
 * This is a simplified but rich model based on role interactions and known Dota 2 counters
 */

// Role-based counter rules
const ROLE_COUNTERS: Record<string, Record<string, number>> = {
  Carry: { Nuker: -1, Disabler: -2, Durable: -1 },
  Nuker: { Durable: -2, Carry: 1 },
  Initiator: { Carry: 2, Nuker: 1, Escape: -1 },
  Disabler: { Carry: 2, Escape: 1, Durable: -1 },
  Escape: { Initiator: 1, Nuker: 1, Disabler: -2 },
  Durable: { Nuker: 2, Carry: 1, Disabler: -1 },
  Support: { Carry: -1 },
  Pusher: { Initiator: -1 },
  Jungler: {},
};

// Specific hero counters (hero name → countered hero names with scores)
const SPECIFIC_COUNTERS: Record<string, Record<string, number>> = {
  'Anti-Mage': { 'Storm Spirit': 4, 'Medusa': 3, 'Invoker': 2, 'Zeus': 3, 'Leshrac': 3, 'Pugna': -3, 'Axe': -3 },
  'Axe': { 'Phantom Lancer': 4, 'Meepo': 4, 'Broodmother': 3, 'Phantom Assassin': 3, 'Terrorblade': 2, 'Necrophos': -3, 'Ursa': -2, 'Timbersaw': -3 },
  'Phantom Assassin': { 'Sniper': 3, 'Drow Ranger': 3, 'Crystal Maiden': 2, 'Zeus': 2, 'Axe': -4, 'Timbersaw': -3, 'Viper': -2 },
  'Pudge': { 'Sniper': 3, 'Crystal Maiden': 2, 'Drow Ranger': 2, 'Lifestealer': -4, 'Juggernaut': -2 },
  'Juggernaut': { 'Crystal Maiden': 2, 'Bane': 2, 'Axe': -2, 'Ursa': -2, 'Phantom Lancer': -2 },
  'Invoker': { 'Broodmother': 3, 'Meepo': 3, 'Phantom Lancer': 2, 'Anti-Mage': -2, 'Nyx Assassin': -3 },
  'Storm Spirit': { 'Sniper': 4, 'Drow Ranger': 3, 'Zeus': 2, 'Anti-Mage': -4, 'Silencer': -3, 'Doom': -3 },
  'Earthshaker': { 'Phantom Lancer': 4, 'Meepo': 4, 'Broodmother': 3, 'Naga Siren': 3, 'Chaos Knight': 3 },
  'Ursa': { 'Phantom Assassin': 3, 'Faceless Void': 2, 'Wraith King': 2, 'Phantom Lancer': -3, 'Viper': -2, 'Venomancer': -2 },
  'Faceless Void': { 'Medusa': 2, 'Spectre': 2, 'Terrorblade': 2, 'Ursa': -2, 'Lifestealer': -3 },
  'Tinker': { 'Spectre': -3, 'Storm Spirit': -3, 'Anti-Mage': -3, 'Nyx Assassin': -4, 'Zeus': -2, 'Nature\'s Prophet': 2 },
  'Spectre': { 'Tinker': 3, 'Sniper': 3, 'Zeus': 2, 'Ancient Apparition': -3, 'Viper': -2 },
  'Broodmother': { 'Earthshaker': -4, 'Axe': -3, 'Legion Commander': -3, 'Timbersaw': -3 },
  'Meepo': { 'Earthshaker': -5, 'Axe': -4, 'Sven': -3, 'Winter Wyvern': -4, 'Elder Titan': -3 },
  'Huskar': { 'Ancient Apparition': -5, 'Viper': -3, 'Necrophos': -2, 'Lifestealer': -3, 'Ursa': -2 },
  'Slark': { 'Ancient Apparition': -3, 'Bloodseeker': -3, 'Disruptor': -3, 'Doom': -3, 'Crystal Maiden': 2 },
  'Drow Ranger': { 'Crystal Maiden': 2, 'Sniper': 1, 'Phantom Assassin': -3, 'Storm Spirit': -3, 'Slark': -3 },
  'Sniper': { 'Storm Spirit': -4, 'Spectre': -3, 'Phantom Assassin': -3, 'Clockwerk': -3, 'Spirit Breaker': -3 },
  'Legion Commander': { 'Broodmother': 3, 'Phantom Lancer': 2, 'Slark': -2, 'Troll Warlord': -2 },
  'Spirit Breaker': { 'Sniper': 3, 'Crystal Maiden': 3, 'Zeus': 2, 'Lifestealer': -2, 'Linken targets': -2 },
  'Silencer': { 'Storm Spirit': 3, 'Enigma': 3, 'Tidehunter': 3, 'Magnus': 3, 'Earthshaker': 2 },
  'Doom': { 'Storm Spirit': 3, 'Slark': 3, 'Huskar': 2, 'Invoker': 2, 'Tinker': 2 },
  'Lifestealer': { 'Pudge': 4, 'Centaur Warrunner': 3, 'Bristleback': 2, 'Huskar': 3, 'Phantom Lancer': -2, 'Terrorblade': -2 },
  'Viper': { 'Huskar': 3, 'Ursa': 2, 'Dragon Knight': 2, 'Phantom Assassin': 2 },
  'Ancient Apparition': { 'Huskar': 5, 'Alchemist': 3, 'Slark': 3, 'Morphling': 3, 'Necrophos': 3 },
  'Necrophos': { 'Axe': 3, 'Huskar': 2, 'Bristleback': 2, 'Spectre': -2, 'Ancient Apparition': -3 },
  'Enigma': { 'Silencer': -3, 'Rubick': -3, 'Phantom Lancer': -2 },
  'Tidehunter': { 'Silencer': -3, 'Rubick': -2 },
  'Magnus': { 'Silencer': -3, 'Rubick': -2, 'Phantom Lancer': 2, 'Medusa': 2 },
  'Wraith King': { 'Anti-Mage': -3, 'Phantom Lancer': -2, 'Invoker': -1 },
  'Terrorblade': { 'Axe': -2, 'Earthshaker': -3, 'Sven': -2 },
  'Monkey King': { 'Timbersaw': -2, 'Axe': -2, 'Viper': -2, 'Nature\'s Prophet': 2, 'Sniper': 2 },
  'Pangolier': { 'Silencer': -2, 'Doom': -3, 'Disruptor': -2 },
  'Void Spirit': { 'Silencer': -2, 'Doom': -3, 'Bloodseeker': -2 },
  'Mars': { 'Lifestealer': -3, 'Phantom Lancer': -2, 'Ursa': -2 },
  'Primal Beast': { 'Lifestealer': -3, 'Viper': -2, 'Venomancer': -2 },
  'Marci': { 'Doom': -3, 'Disruptor': -2 },
  'Dawnbreaker': { 'Ancient Apparition': -3 },
  'Muerta': { 'Faceless Void': -2, 'Spirit Breaker': -2 },
};

// Synergy pairs (hero names → synergy bonus)
const SYNERGY_PAIRS: Record<string, Record<string, number>> = {
  'Faceless Void': { 'Witch Doctor': 4, 'Invoker': 3, 'Skywrath Mage': 3, 'Crystal Maiden': 3, 'Phoenix': 3 },
  'Magnus': { 'Phantom Assassin': 4, 'Juggernaut': 3, 'Sven': 3, 'Medusa': 3, 'Terrorblade': 3 },
  'Dark Seer': { 'Sven': 3, 'Phantom Assassin': 3, 'Faceless Void': 2 },
  'Io': { 'Tiny': 5, 'Ursa': 4, 'Chaos Knight': 3, 'Sven': 3, 'Gyrocopter': 3 },
  'Enigma': { 'Faceless Void': 2 },
  'Drow Ranger': { 'Vengeful Spirit': 3, 'Visage': 3, 'Luna': 2 },
  'Huskar': { 'Dazzle': 4, 'Oracle': 4, 'Omniknight': 3 },
  'Ursa': { 'Io': 4, 'Crystal Maiden': 2 },
  'Phantom Assassin': { 'Magnus': 4, 'Empower': 3 },
  'Juggernaut': { 'Crystal Maiden': 3, 'Shadow Shaman': 2, 'Grimstroke': 3 },
  'Tiny': { 'Io': 5, 'Centaur Warrunner': 2 },
  'Chaos Knight': { 'Io': 3, 'Shadow Demon': 3 },
  'Medusa': { 'Magnus': 3, 'Dark Seer': 2 },
  'Sven': { 'Magnus': 3, 'Dark Seer': 3, 'Io': 3 },
  'Gyrocopter': { 'Io': 3, 'Shadow Demon': 2 },
  'Luna': { 'Shadow Demon': 3, 'Drow Ranger': 2 },
  'Lifestealer': { 'Spirit Breaker': 3, 'Storm Spirit': 3, 'Mars': 2 },
  'Grimstroke': { 'Juggernaut': 3, 'Lion': 3, 'Spirit Breaker': 2 },
  'Phoenix': { 'Faceless Void': 3, 'Enigma': 2, 'Treant Protector': 2 },
  'Winter Wyvern': { 'Faceless Void': 2 },
};

/**
 * Get advantage score between two heroes
 * Returns positive if hero1 counters hero2
 */
export function getHeroAdvantage(hero1: Hero, hero2: Hero): number {
  let score = 0;

  // Check specific counters
  const specific1 = SPECIFIC_COUNTERS[hero1.localized_name];
  if (specific1 && specific1[hero2.localized_name]) {
    score += specific1[hero2.localized_name];
  }

  const specific2 = SPECIFIC_COUNTERS[hero2.localized_name];
  if (specific2 && specific2[hero1.localized_name]) {
    score -= specific2[hero1.localized_name];
  }

  // If no specific data, use role-based
  if (score === 0) {
    for (const role1 of hero1.roles) {
      for (const role2 of hero2.roles) {
        const counter = ROLE_COUNTERS[role1]?.[role2];
        if (counter) score += counter * 0.3;
      }
    }
  }

  // Attack type advantage
  if (hero1.attack_type === 'Ranged' && hero2.attack_type === 'Melee') {
    score += 0.3;
  }

  return Math.max(-5, Math.min(5, score));
}

/**
 * Get synergy score between two heroes on the same team
 */
export function getHeroSynergy(hero1: Hero, hero2: Hero): number {
  let score = 0;

  const syn1 = SYNERGY_PAIRS[hero1.localized_name];
  if (syn1 && syn1[hero2.localized_name]) score += syn1[hero2.localized_name];

  const syn2 = SYNERGY_PAIRS[hero2.localized_name];
  if (syn2 && syn2[hero1.localized_name]) score += syn2[hero1.localized_name];

  // Role synergy bonus
  const roles1 = new Set(hero1.roles);
  const roles2 = new Set(hero2.roles);

  if (roles1.has('Carry') && roles2.has('Support')) score += 0.5;
  if (roles1.has('Initiator') && roles2.has('Nuker')) score += 0.5;
  if (roles1.has('Disabler') && roles2.has('Carry')) score += 0.5;
  if (roles1.has('Durable') && roles2.has('Nuker')) score += 0.3;

  return score;
}

/**
 * Calculate team synergy
 */
function calcTeamSynergy(heroes: Hero[]): number {
  let total = 0;
  for (let i = 0; i < heroes.length; i++) {
    for (let j = i + 1; j < heroes.length; j++) {
      total += getHeroSynergy(heroes[i], heroes[j]);
    }
  }
  return total;
}

/**
 * Analyze lane matchups based on positions
 */
function analyzeLanes(team1Slots: DraftSlot[], team2Slots: DraftSlot[]): LaneAnalysis[] {
  const lanes: LaneAnalysis[] = [];

  // Safe Lane: Pos 1+5 vs Pos 3+4
  const t1Safe = team1Slots.filter(s => s.position === 1 || s.position === 5).map(s => s.hero!).filter(Boolean);
  const t2Off = team2Slots.filter(s => s.position === 3 || s.position === 4).map(s => s.hero!).filter(Boolean);

  if (t1Safe.length && t2Off.length) {
    let laneScore = 0;
    for (const h1 of t1Safe) {
      for (const h2 of t2Off) {
        laneScore += getHeroAdvantage(h1, h2);
      }
    }
    lanes.push({
      lane: 'Лёгкая линия (Radiant)',
      team1Heroes: t1Safe.map(h => h.localized_name),
      team2Heroes: t2Off.map(h => h.localized_name),
      advantage: laneScore > 1 ? 'team1' : laneScore < -1 ? 'team2' : 'even',
      reason: laneScore > 1
        ? `${t1Safe[0]?.localized_name} доминирует на линии`
        : laneScore < -1
        ? `${t2Off[0]?.localized_name} давит линию`
        : 'Равная линия',
    });
  }

  // Mid: Pos 2 vs Pos 2
  const t1Mid = team1Slots.find(s => s.position === 2)?.hero;
  const t2Mid = team2Slots.find(s => s.position === 2)?.hero;

  if (t1Mid && t2Mid) {
    const midScore = getHeroAdvantage(t1Mid, t2Mid);
    lanes.push({
      lane: 'Мид',
      team1Heroes: [t1Mid.localized_name],
      team2Heroes: [t2Mid.localized_name],
      advantage: midScore > 1 ? 'team1' : midScore < -1 ? 'team2' : 'even',
      reason: midScore > 1
        ? `${t1Mid.localized_name} контрит ${t2Mid.localized_name}`
        : midScore < -1
        ? `${t2Mid.localized_name} контрит ${t1Mid.localized_name}`
        : 'Равный матчап',
    });
  }

  // Off Lane: Pos 3+4 vs Pos 1+5
  const t1Off = team1Slots.filter(s => s.position === 3 || s.position === 4).map(s => s.hero!).filter(Boolean);
  const t2Safe = team2Slots.filter(s => s.position === 1 || s.position === 5).map(s => s.hero!).filter(Boolean);

  if (t1Off.length && t2Safe.length) {
    let laneScore = 0;
    for (const h1 of t1Off) {
      for (const h2 of t2Safe) {
        laneScore += getHeroAdvantage(h1, h2);
      }
    }
    lanes.push({
      lane: 'Сложная линия (Radiant)',
      team1Heroes: t1Off.map(h => h.localized_name),
      team2Heroes: t2Safe.map(h => h.localized_name),
      advantage: laneScore > 1 ? 'team1' : laneScore < -1 ? 'team2' : 'even',
      reason: laneScore > 1
        ? `${t1Off[0]?.localized_name} давит линию`
        : laneScore < -1
        ? `${t2Safe[0]?.localized_name} доминирует`
        : 'Равная линия',
    });
  }

  return lanes;
}

/**
 * Full draft analysis
 */
export function analyzeDraft(
  team1Slots: DraftSlot[],
  team2Slots: DraftSlot[],
  player1Name: string,
  player2Name: string
): DraftAnalysis {
  const team1Heroes = team1Slots.map(s => s.hero!).filter(Boolean);
  const team2Heroes = team2Slots.map(s => s.hero!).filter(Boolean);

  // 1. Calculate all matchup advantages
  let matchupTotal = 0;
  const keyMatchups: KeyMatchup[] = [];

  for (const h1 of team1Heroes) {
    for (const h2 of team2Heroes) {
      const adv = getHeroAdvantage(h1, h2);
      matchupTotal += adv;

      if (Math.abs(adv) >= 2) {
        keyMatchups.push({
          hero1: h1.localized_name,
          hero2: h2.localized_name,
          advantage: adv,
          reason: adv > 0
            ? `${h1.localized_name} контрит ${h2.localized_name}`
            : `${h2.localized_name} контрит ${h1.localized_name}`,
        });
      }
    }
  }

  keyMatchups.sort((a, b) => Math.abs(b.advantage) - Math.abs(a.advantage));

  // 2. Calculate synergies
  const syn1 = calcTeamSynergy(team1Heroes);
  const syn2 = calcTeamSynergy(team2Heroes);

  // 3. Lane analysis
  const laneBreakdown = analyzeLanes(team1Slots, team2Slots);
  const lanesWon1 = laneBreakdown.filter(l => l.advantage === 'team1').length;
  const lanesWon2 = laneBreakdown.filter(l => l.advantage === 'team2').length;

  // 4. Role coverage
  const roles1 = new Set(team1Heroes.flatMap(h => h.roles));
  const roles2 = new Set(team2Heroes.flatMap(h => h.roles));

  // 5. Calculate final scores
  const matchupWeight = 3;
  const synergyWeight = 2;
  const laneWeight = 2.5;

  const rawScore1 = (matchupTotal * matchupWeight) + (syn1 * synergyWeight) + (lanesWon1 * laneWeight);
  const rawScore2 = (-matchupTotal * matchupWeight) + (syn2 * synergyWeight) + (lanesWon2 * laneWeight);

  const total = Math.abs(rawScore1) + Math.abs(rawScore2) + 1;
  const player1Score = Math.round(50 + (rawScore1 - rawScore2) / total * 30);
  const player2Score = 100 - player1Score;

  // 6. Advantages text
  const player1Advantages: string[] = [];
  const player2Advantages: string[] = [];

  if (syn1 > syn2 + 2) player1Advantages.push('Лучшая синергия героев');
  if (syn2 > syn1 + 2) player2Advantages.push('Лучшая синергия героев');
  if (lanesWon1 > lanesWon2) player1Advantages.push(`Выигрывает ${lanesWon1} из ${laneBreakdown.length} линий`);
  if (lanesWon2 > lanesWon1) player2Advantages.push(`Выигрывает ${lanesWon2} из ${laneBreakdown.length} линий`);

  if (roles1.has('Initiator') && !roles2.has('Initiator')) player1Advantages.push('Лучшая инициация');
  if (roles2.has('Initiator') && !roles1.has('Initiator')) player2Advantages.push('Лучшая инициация');

  for (const m of keyMatchups.slice(0, 3)) {
    if (m.advantage > 0) player1Advantages.push(m.reason);
    else player2Advantages.push(m.reason);
  }

  const predictedWinner = player1Score > player2Score ? 'player1' : player2Score > player1Score ? 'player2' : 'draw';
  const confidence = Math.abs(player1Score - player2Score);

  const winnerName = predictedWinner === 'player1' ? player1Name : predictedWinner === 'player2' ? player2Name : 'Ничья';
  const summary = confidence > 15
    ? `${winnerName} имеет значительное преимущество в драфте`
    : confidence > 5
    ? `${winnerName} имеет небольшое преимущество`
    : 'Драфты практически равны, всё решит исполнение';

  return {
    player1Score: Math.max(5, Math.min(95, player1Score)),
    player2Score: Math.max(5, Math.min(95, player2Score)),
    player1Advantages,
    player2Advantages,
    laneBreakdown,
    synergyScore: { team1: Math.round(syn1 * 10), team2: Math.round(syn2 * 10) },
    keyMatchups: keyMatchups.slice(0, 5),
    predictedWinner,
    confidence,
    summary,
  };
}
