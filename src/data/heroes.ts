import type { Hero } from '@/types';

const HERO_CDN = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes';

export function getHeroImage(name: string): string {
  return `${HERO_CDN}/${name}.png`;
}

export function getHeroIcon(name: string): string {
  return `${HERO_CDN}/icons/${name}.png`;
}

export function getHeroCropImage(name: string): string {
  return `${HERO_CDN}/crops/${name}.png`;
}

// Auto-generated from OpenDota API — 128 heroes, patch 7.41b
// All primary_attr values are OFFICIAL from the API
export const ALL_HEROES: Hero[] = [
  { id: 1, name: 'antimage', localized_name: 'Anti-Mage', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Escape','Nuker'], legs: 2, img: getHeroImage('antimage'), icon: getHeroIcon('antimage') },
  { id: 2, name: 'axe', localized_name: 'Axe', primary_attr: 'str', attack_type: 'Melee', roles: ['Initiator','Durable','Disabler','Carry'], legs: 2, img: getHeroImage('axe'), icon: getHeroIcon('axe') },
  { id: 3, name: 'bane', localized_name: 'Bane', primary_attr: 'all', attack_type: 'Ranged', roles: ['Support','Disabler','Nuker','Durable'], legs: 4, img: getHeroImage('bane'), icon: getHeroIcon('bane') },
  { id: 4, name: 'bloodseeker', localized_name: 'Bloodseeker', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Disabler','Nuker','Initiator'], legs: 2, img: getHeroImage('bloodseeker'), icon: getHeroIcon('bloodseeker') },
  { id: 5, name: 'crystal_maiden', localized_name: 'Crystal Maiden', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Disabler','Nuker'], legs: 2, img: getHeroImage('crystal_maiden'), icon: getHeroIcon('crystal_maiden') },
  { id: 6, name: 'drow_ranger', localized_name: 'Drow Ranger', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Disabler','Pusher'], legs: 2, img: getHeroImage('drow_ranger'), icon: getHeroIcon('drow_ranger') },
  { id: 7, name: 'earthshaker', localized_name: 'Earthshaker', primary_attr: 'str', attack_type: 'Melee', roles: ['Support','Initiator','Disabler','Nuker'], legs: 2, img: getHeroImage('earthshaker'), icon: getHeroIcon('earthshaker') },
  { id: 8, name: 'juggernaut', localized_name: 'Juggernaut', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Pusher','Escape'], legs: 2, img: getHeroImage('juggernaut'), icon: getHeroIcon('juggernaut') },
  { id: 9, name: 'mirana', localized_name: 'Mirana', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Support','Escape','Nuker','Disabler'], legs: 2, img: getHeroImage('mirana'), icon: getHeroIcon('mirana') },
  { id: 10, name: 'morphling', localized_name: 'Morphling', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Escape','Durable','Nuker','Disabler'], legs: 0, img: getHeroImage('morphling'), icon: getHeroIcon('morphling') },
  { id: 11, name: 'nevermore', localized_name: 'Shadow Fiend', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Nuker'], legs: 0, img: getHeroImage('nevermore'), icon: getHeroIcon('nevermore') },
  { id: 12, name: 'phantom_lancer', localized_name: 'Phantom Lancer', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Escape','Pusher','Nuker'], legs: 2, img: getHeroImage('phantom_lancer'), icon: getHeroIcon('phantom_lancer') },
  { id: 13, name: 'puck', localized_name: 'Puck', primary_attr: 'int', attack_type: 'Ranged', roles: ['Initiator','Disabler','Escape','Nuker'], legs: 2, img: getHeroImage('puck'), icon: getHeroIcon('puck') },
  { id: 14, name: 'pudge', localized_name: 'Pudge', primary_attr: 'str', attack_type: 'Melee', roles: ['Disabler','Initiator','Durable','Nuker'], legs: 2, img: getHeroImage('pudge'), icon: getHeroIcon('pudge') },
  { id: 15, name: 'razor', localized_name: 'Razor', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Durable','Nuker','Pusher'], legs: 0, img: getHeroImage('razor'), icon: getHeroIcon('razor') },
  { id: 16, name: 'sand_king', localized_name: 'Sand King', primary_attr: 'all', attack_type: 'Melee', roles: ['Initiator','Disabler','Support','Nuker','Escape'], legs: 6, img: getHeroImage('sand_king'), icon: getHeroIcon('sand_king') },
  { id: 17, name: 'storm_spirit', localized_name: 'Storm Spirit', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry','Escape','Nuker','Initiator','Disabler'], legs: 2, img: getHeroImage('storm_spirit'), icon: getHeroIcon('storm_spirit') },
  { id: 18, name: 'sven', localized_name: 'Sven', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Disabler','Initiator','Durable','Nuker'], legs: 2, img: getHeroImage('sven'), icon: getHeroIcon('sven') },
  { id: 19, name: 'tiny', localized_name: 'Tiny', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Nuker','Pusher','Initiator','Durable','Disabler'], legs: 2, img: getHeroImage('tiny'), icon: getHeroIcon('tiny') },
  { id: 20, name: 'vengefulspirit', localized_name: 'Vengeful Spirit', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Support','Initiator','Disabler','Nuker','Escape'], legs: 2, img: getHeroImage('vengefulspirit'), icon: getHeroIcon('vengefulspirit') },
  { id: 21, name: 'windrunner', localized_name: 'Windranger', primary_attr: 'all', attack_type: 'Ranged', roles: ['Carry','Support','Disabler','Escape','Nuker'], legs: 2, img: getHeroImage('windrunner'), icon: getHeroIcon('windrunner') },
  { id: 22, name: 'zuus', localized_name: 'Zeus', primary_attr: 'int', attack_type: 'Ranged', roles: ['Nuker','Carry'], legs: 2, img: getHeroImage('zuus'), icon: getHeroIcon('zuus') },
  { id: 23, name: 'kunkka', localized_name: 'Kunkka', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Support','Disabler','Initiator','Durable','Nuker'], legs: 2, img: getHeroImage('kunkka'), icon: getHeroIcon('kunkka') },
  { id: 25, name: 'lina', localized_name: 'Lina', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Carry','Nuker','Disabler'], legs: 2, img: getHeroImage('lina'), icon: getHeroIcon('lina') },
  { id: 26, name: 'lion', localized_name: 'Lion', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Disabler','Nuker','Initiator'], legs: 2, img: getHeroImage('lion'), icon: getHeroIcon('lion') },
  { id: 27, name: 'shadow_shaman', localized_name: 'Shadow Shaman', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Pusher','Disabler','Nuker','Initiator'], legs: 2, img: getHeroImage('shadow_shaman'), icon: getHeroIcon('shadow_shaman') },
  { id: 28, name: 'slardar', localized_name: 'Slardar', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Durable','Initiator','Disabler','Escape'], legs: 0, img: getHeroImage('slardar'), icon: getHeroIcon('slardar') },
  { id: 29, name: 'tidehunter', localized_name: 'Tidehunter', primary_attr: 'str', attack_type: 'Melee', roles: ['Initiator','Durable','Disabler','Nuker','Carry'], legs: 2, img: getHeroImage('tidehunter'), icon: getHeroIcon('tidehunter') },
  { id: 30, name: 'witch_doctor', localized_name: 'Witch Doctor', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Nuker','Disabler'], legs: 2, img: getHeroImage('witch_doctor'), icon: getHeroIcon('witch_doctor') },
  { id: 31, name: 'lich', localized_name: 'Lich', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Nuker'], legs: 2, img: getHeroImage('lich'), icon: getHeroIcon('lich') },
  { id: 32, name: 'riki', localized_name: 'Riki', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Escape','Disabler'], legs: 2, img: getHeroImage('riki'), icon: getHeroIcon('riki') },
  { id: 33, name: 'enigma', localized_name: 'Enigma', primary_attr: 'all', attack_type: 'Ranged', roles: ['Disabler','Initiator','Pusher'], legs: 0, img: getHeroImage('enigma'), icon: getHeroIcon('enigma') },
  { id: 34, name: 'tinker', localized_name: 'Tinker', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry','Nuker','Pusher'], legs: 2, img: getHeroImage('tinker'), icon: getHeroIcon('tinker') },
  { id: 35, name: 'sniper', localized_name: 'Sniper', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Nuker'], legs: 2, img: getHeroImage('sniper'), icon: getHeroIcon('sniper') },
  { id: 36, name: 'necrolyte', localized_name: 'Necrophos', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry','Nuker','Durable','Disabler'], legs: 2, img: getHeroImage('necrolyte'), icon: getHeroIcon('necrolyte') },
  { id: 37, name: 'warlock', localized_name: 'Warlock', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Initiator','Disabler'], legs: 2, img: getHeroImage('warlock'), icon: getHeroIcon('warlock') },
  { id: 38, name: 'beastmaster', localized_name: 'Beastmaster', primary_attr: 'all', attack_type: 'Melee', roles: ['Initiator','Disabler','Durable','Nuker'], legs: 2, img: getHeroImage('beastmaster'), icon: getHeroIcon('beastmaster') },
  { id: 39, name: 'queenofpain', localized_name: 'Queen of Pain', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry','Nuker','Escape'], legs: 2, img: getHeroImage('queenofpain'), icon: getHeroIcon('queenofpain') },
  { id: 40, name: 'venomancer', localized_name: 'Venomancer', primary_attr: 'all', attack_type: 'Ranged', roles: ['Support','Nuker','Initiator','Pusher','Disabler'], legs: 0, img: getHeroImage('venomancer'), icon: getHeroIcon('venomancer') },
  { id: 41, name: 'faceless_void', localized_name: 'Faceless Void', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Initiator','Disabler','Escape','Durable'], legs: 2, img: getHeroImage('faceless_void'), icon: getHeroIcon('faceless_void') },
  { id: 42, name: 'skeleton_king', localized_name: 'Wraith King', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Support','Durable','Disabler','Initiator'], legs: 2, img: getHeroImage('skeleton_king'), icon: getHeroIcon('skeleton_king') },
  { id: 43, name: 'death_prophet', localized_name: 'Death Prophet', primary_attr: 'all', attack_type: 'Ranged', roles: ['Carry','Pusher','Nuker','Disabler'], legs: 2, img: getHeroImage('death_prophet'), icon: getHeroIcon('death_prophet') },
  { id: 44, name: 'phantom_assassin', localized_name: 'Phantom Assassin', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Escape'], legs: 2, img: getHeroImage('phantom_assassin'), icon: getHeroIcon('phantom_assassin') },
  { id: 45, name: 'pugna', localized_name: 'Pugna', primary_attr: 'int', attack_type: 'Ranged', roles: ['Nuker','Pusher'], legs: 2, img: getHeroImage('pugna'), icon: getHeroIcon('pugna') },
  { id: 46, name: 'templar_assassin', localized_name: 'Templar Assassin', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Escape'], legs: 2, img: getHeroImage('templar_assassin'), icon: getHeroIcon('templar_assassin') },
  { id: 47, name: 'viper', localized_name: 'Viper', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Durable','Initiator','Disabler'], legs: 0, img: getHeroImage('viper'), icon: getHeroIcon('viper') },
  { id: 48, name: 'luna', localized_name: 'Luna', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Nuker','Pusher'], legs: 2, img: getHeroImage('luna'), icon: getHeroIcon('luna') },
  { id: 49, name: 'dragon_knight', localized_name: 'Dragon Knight', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Pusher','Durable','Disabler','Initiator','Nuker'], legs: 2, img: getHeroImage('dragon_knight'), icon: getHeroIcon('dragon_knight') },
  { id: 50, name: 'dazzle', localized_name: 'Dazzle', primary_attr: 'all', attack_type: 'Ranged', roles: ['Support','Nuker','Disabler'], legs: 2, img: getHeroImage('dazzle'), icon: getHeroIcon('dazzle') },
  { id: 51, name: 'rattletrap', localized_name: 'Clockwerk', primary_attr: 'str', attack_type: 'Melee', roles: ['Initiator','Disabler','Durable','Nuker'], legs: 2, img: getHeroImage('rattletrap'), icon: getHeroIcon('rattletrap') },
  { id: 52, name: 'leshrac', localized_name: 'Leshrac', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry','Support','Nuker','Pusher','Disabler'], legs: 4, img: getHeroImage('leshrac'), icon: getHeroIcon('leshrac') },
  { id: 53, name: 'furion', localized_name: "Nature's Prophet", primary_attr: 'all', attack_type: 'Ranged', roles: ['Carry','Pusher','Escape','Nuker'], legs: 2, img: getHeroImage('furion'), icon: getHeroIcon('furion') },
  { id: 54, name: 'life_stealer', localized_name: 'Lifestealer', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Durable','Escape','Disabler'], legs: 2, img: getHeroImage('life_stealer'), icon: getHeroIcon('life_stealer') },
  { id: 55, name: 'dark_seer', localized_name: 'Dark Seer', primary_attr: 'int', attack_type: 'Melee', roles: ['Initiator','Escape','Disabler'], legs: 2, img: getHeroImage('dark_seer'), icon: getHeroIcon('dark_seer') },
  { id: 56, name: 'clinkz', localized_name: 'Clinkz', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Escape','Pusher'], legs: 2, img: getHeroImage('clinkz'), icon: getHeroIcon('clinkz') },
  { id: 57, name: 'omniknight', localized_name: 'Omniknight', primary_attr: 'str', attack_type: 'Melee', roles: ['Support','Durable','Nuker'], legs: 2, img: getHeroImage('omniknight'), icon: getHeroIcon('omniknight') },
  { id: 58, name: 'enchantress', localized_name: 'Enchantress', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Pusher','Durable','Disabler'], legs: 4, img: getHeroImage('enchantress'), icon: getHeroIcon('enchantress') },
  { id: 59, name: 'huskar', localized_name: 'Huskar', primary_attr: 'str', attack_type: 'Ranged', roles: ['Carry','Durable','Initiator'], legs: 2, img: getHeroImage('huskar'), icon: getHeroIcon('huskar') },
  { id: 60, name: 'night_stalker', localized_name: 'Night Stalker', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Initiator','Durable','Disabler','Nuker'], legs: 2, img: getHeroImage('night_stalker'), icon: getHeroIcon('night_stalker') },
  { id: 61, name: 'broodmother', localized_name: 'Broodmother', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Pusher','Escape','Nuker'], legs: 8, img: getHeroImage('broodmother'), icon: getHeroIcon('broodmother') },
  { id: 62, name: 'bounty_hunter', localized_name: 'Bounty Hunter', primary_attr: 'agi', attack_type: 'Melee', roles: ['Escape','Nuker'], legs: 2, img: getHeroImage('bounty_hunter'), icon: getHeroIcon('bounty_hunter') },
  { id: 63, name: 'weaver', localized_name: 'Weaver', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Escape'], legs: 4, img: getHeroImage('weaver'), icon: getHeroIcon('weaver') },
  { id: 64, name: 'jakiro', localized_name: 'Jakiro', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Nuker','Pusher','Disabler'], legs: 2, img: getHeroImage('jakiro'), icon: getHeroIcon('jakiro') },
  { id: 65, name: 'batrider', localized_name: 'Batrider', primary_attr: 'all', attack_type: 'Ranged', roles: ['Initiator','Disabler','Escape'], legs: 2, img: getHeroImage('batrider'), icon: getHeroIcon('batrider') },
  { id: 66, name: 'chen', localized_name: 'Chen', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Pusher'], legs: 2, img: getHeroImage('chen'), icon: getHeroIcon('chen') },
  { id: 67, name: 'spectre', localized_name: 'Spectre', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Durable','Escape'], legs: 0, img: getHeroImage('spectre'), icon: getHeroIcon('spectre') },
  { id: 68, name: 'ancient_apparition', localized_name: 'Ancient Apparition', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Disabler','Nuker'], legs: 0, img: getHeroImage('ancient_apparition'), icon: getHeroIcon('ancient_apparition') },
  { id: 69, name: 'doom_bringer', localized_name: 'Doom', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Disabler','Initiator','Durable','Nuker'], legs: 2, img: getHeroImage('doom_bringer'), icon: getHeroIcon('doom_bringer') },
  { id: 70, name: 'ursa', localized_name: 'Ursa', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Durable','Disabler'], legs: 2, img: getHeroImage('ursa'), icon: getHeroIcon('ursa') },
  { id: 71, name: 'spirit_breaker', localized_name: 'Spirit Breaker', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Initiator','Disabler','Durable','Escape'], legs: 2, img: getHeroImage('spirit_breaker'), icon: getHeroIcon('spirit_breaker') },
  { id: 72, name: 'gyrocopter', localized_name: 'Gyrocopter', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Nuker','Disabler'], legs: 2, img: getHeroImage('gyrocopter'), icon: getHeroIcon('gyrocopter') },
  { id: 73, name: 'alchemist', localized_name: 'Alchemist', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Support','Durable','Disabler','Initiator','Nuker'], legs: 2, img: getHeroImage('alchemist'), icon: getHeroIcon('alchemist') },
  { id: 74, name: 'invoker', localized_name: 'Invoker', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry','Nuker','Disabler','Escape','Pusher'], legs: 2, img: getHeroImage('invoker'), icon: getHeroIcon('invoker') },
  { id: 75, name: 'silencer', localized_name: 'Silencer', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry','Support','Disabler','Initiator','Nuker'], legs: 2, img: getHeroImage('silencer'), icon: getHeroIcon('silencer') },
  { id: 76, name: 'obsidian_destroyer', localized_name: 'Outworld Devourer', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry','Nuker','Disabler'], legs: 4, img: getHeroImage('obsidian_destroyer'), icon: getHeroIcon('obsidian_destroyer') },
  { id: 77, name: 'lycan', localized_name: 'Lycan', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Pusher','Durable','Escape'], legs: 2, img: getHeroImage('lycan'), icon: getHeroIcon('lycan') },
  { id: 78, name: 'brewmaster', localized_name: 'Brewmaster', primary_attr: 'all', attack_type: 'Melee', roles: ['Carry','Initiator','Durable','Disabler','Nuker'], legs: 2, img: getHeroImage('brewmaster'), icon: getHeroIcon('brewmaster') },
  { id: 79, name: 'shadow_demon', localized_name: 'Shadow Demon', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Disabler','Initiator','Nuker'], legs: 2, img: getHeroImage('shadow_demon'), icon: getHeroIcon('shadow_demon') },
  { id: 80, name: 'lone_druid', localized_name: 'Lone Druid', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Pusher','Durable'], legs: 2, img: getHeroImage('lone_druid'), icon: getHeroIcon('lone_druid') },
  { id: 81, name: 'chaos_knight', localized_name: 'Chaos Knight', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Disabler','Durable','Pusher','Initiator'], legs: 2, img: getHeroImage('chaos_knight'), icon: getHeroIcon('chaos_knight') },
  { id: 82, name: 'meepo', localized_name: 'Meepo', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Escape','Nuker','Disabler','Initiator','Pusher'], legs: 2, img: getHeroImage('meepo'), icon: getHeroIcon('meepo') },
  { id: 83, name: 'treant', localized_name: 'Treant Protector', primary_attr: 'str', attack_type: 'Melee', roles: ['Support','Initiator','Durable','Disabler','Escape'], legs: 2, img: getHeroImage('treant'), icon: getHeroIcon('treant') },
  { id: 84, name: 'ogre_magi', localized_name: 'Ogre Magi', primary_attr: 'str', attack_type: 'Melee', roles: ['Support','Nuker','Disabler','Durable','Initiator'], legs: 2, img: getHeroImage('ogre_magi'), icon: getHeroIcon('ogre_magi') },
  { id: 85, name: 'undying', localized_name: 'Undying', primary_attr: 'str', attack_type: 'Melee', roles: ['Support','Durable','Disabler','Nuker'], legs: 2, img: getHeroImage('undying'), icon: getHeroIcon('undying') },
  { id: 86, name: 'rubick', localized_name: 'Rubick', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Disabler','Nuker'], legs: 2, img: getHeroImage('rubick'), icon: getHeroIcon('rubick') },
  { id: 87, name: 'disruptor', localized_name: 'Disruptor', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Disabler','Nuker','Initiator'], legs: 2, img: getHeroImage('disruptor'), icon: getHeroIcon('disruptor') },
  { id: 88, name: 'nyx_assassin', localized_name: 'Nyx Assassin', primary_attr: 'all', attack_type: 'Melee', roles: ['Disabler','Nuker','Initiator','Escape'], legs: 6, img: getHeroImage('nyx_assassin'), icon: getHeroIcon('nyx_assassin') },
  { id: 89, name: 'naga_siren', localized_name: 'Naga Siren', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Support','Pusher','Disabler','Initiator','Escape'], legs: 0, img: getHeroImage('naga_siren'), icon: getHeroIcon('naga_siren') },
  { id: 90, name: 'keeper_of_the_light', localized_name: 'Keeper of the Light', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Nuker','Disabler'], legs: 2, img: getHeroImage('keeper_of_the_light'), icon: getHeroIcon('keeper_of_the_light') },
  { id: 91, name: 'wisp', localized_name: 'Io', primary_attr: 'all', attack_type: 'Ranged', roles: ['Support','Escape','Nuker'], legs: 0, img: getHeroImage('wisp'), icon: getHeroIcon('wisp') },
  { id: 92, name: 'visage', localized_name: 'Visage', primary_attr: 'all', attack_type: 'Ranged', roles: ['Support','Nuker','Durable','Disabler','Pusher'], legs: 2, img: getHeroImage('visage'), icon: getHeroIcon('visage') },
  { id: 93, name: 'slark', localized_name: 'Slark', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Escape','Disabler','Nuker'], legs: 2, img: getHeroImage('slark'), icon: getHeroIcon('slark') },
  { id: 94, name: 'medusa', localized_name: 'Medusa', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Disabler','Durable'], legs: 0, img: getHeroImage('medusa'), icon: getHeroIcon('medusa') },
  { id: 95, name: 'troll_warlord', localized_name: 'Troll Warlord', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Carry','Pusher','Disabler','Durable'], legs: 2, img: getHeroImage('troll_warlord'), icon: getHeroIcon('troll_warlord') },
  { id: 96, name: 'centaur', localized_name: 'Centaur Warrunner', primary_attr: 'str', attack_type: 'Melee', roles: ['Durable','Initiator','Disabler','Nuker','Escape'], legs: 4, img: getHeroImage('centaur'), icon: getHeroIcon('centaur') },
  { id: 97, name: 'magnataur', localized_name: 'Magnus', primary_attr: 'all', attack_type: 'Melee', roles: ['Initiator','Disabler','Nuker','Escape'], legs: 4, img: getHeroImage('magnataur'), icon: getHeroIcon('magnataur') },
  { id: 98, name: 'shredder', localized_name: 'Timbersaw', primary_attr: 'str', attack_type: 'Melee', roles: ['Nuker','Durable','Escape'], legs: 2, img: getHeroImage('shredder'), icon: getHeroIcon('shredder') },
  { id: 99, name: 'bristleback', localized_name: 'Bristleback', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Durable','Initiator','Nuker'], legs: 2, img: getHeroImage('bristleback'), icon: getHeroIcon('bristleback') },
  { id: 100, name: 'tusk', localized_name: 'Tusk', primary_attr: 'str', attack_type: 'Melee', roles: ['Initiator','Disabler','Nuker'], legs: 2, img: getHeroImage('tusk'), icon: getHeroIcon('tusk') },
  { id: 101, name: 'skywrath_mage', localized_name: 'Skywrath Mage', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Nuker','Disabler'], legs: 2, img: getHeroImage('skywrath_mage'), icon: getHeroIcon('skywrath_mage') },
  { id: 102, name: 'abaddon', localized_name: 'Abaddon', primary_attr: 'all', attack_type: 'Melee', roles: ['Support','Carry','Durable'], legs: 2, img: getHeroImage('abaddon'), icon: getHeroIcon('abaddon') },
  { id: 103, name: 'elder_titan', localized_name: 'Elder Titan', primary_attr: 'str', attack_type: 'Melee', roles: ['Initiator','Disabler','Nuker','Durable'], legs: 2, img: getHeroImage('elder_titan'), icon: getHeroIcon('elder_titan') },
  { id: 104, name: 'legion_commander', localized_name: 'Legion Commander', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Disabler','Initiator','Durable','Nuker'], legs: 2, img: getHeroImage('legion_commander'), icon: getHeroIcon('legion_commander') },
  { id: 105, name: 'techies', localized_name: 'Techies', primary_attr: 'all', attack_type: 'Ranged', roles: ['Nuker','Disabler'], legs: 6, img: getHeroImage('techies'), icon: getHeroIcon('techies') },
  { id: 106, name: 'ember_spirit', localized_name: 'Ember Spirit', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Escape','Nuker','Disabler','Initiator'], legs: 2, img: getHeroImage('ember_spirit'), icon: getHeroIcon('ember_spirit') },
  { id: 107, name: 'earth_spirit', localized_name: 'Earth Spirit', primary_attr: 'str', attack_type: 'Melee', roles: ['Nuker','Escape','Disabler','Initiator','Durable'], legs: 2, img: getHeroImage('earth_spirit'), icon: getHeroIcon('earth_spirit') },
  { id: 108, name: 'abyssal_underlord', localized_name: 'Underlord', primary_attr: 'str', attack_type: 'Melee', roles: ['Support','Nuker','Disabler','Durable','Escape'], legs: 2, img: getHeroImage('abyssal_underlord'), icon: getHeroIcon('abyssal_underlord') },
  { id: 109, name: 'terrorblade', localized_name: 'Terrorblade', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Pusher','Nuker'], legs: 2, img: getHeroImage('terrorblade'), icon: getHeroIcon('terrorblade') },
  { id: 110, name: 'phoenix', localized_name: 'Phoenix', primary_attr: 'str', attack_type: 'Ranged', roles: ['Support','Nuker','Initiator','Escape','Disabler'], legs: 2, img: getHeroImage('phoenix'), icon: getHeroIcon('phoenix') },
  { id: 111, name: 'oracle', localized_name: 'Oracle', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Nuker','Disabler','Escape'], legs: 2, img: getHeroImage('oracle'), icon: getHeroIcon('oracle') },
  { id: 112, name: 'winter_wyvern', localized_name: 'Winter Wyvern', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Disabler','Nuker'], legs: 2, img: getHeroImage('winter_wyvern'), icon: getHeroIcon('winter_wyvern') },
  { id: 113, name: 'arc_warden', localized_name: 'Arc Warden', primary_attr: 'all', attack_type: 'Ranged', roles: ['Carry','Escape','Nuker'], legs: 2, img: getHeroImage('arc_warden'), icon: getHeroIcon('arc_warden') },
  { id: 114, name: 'monkey_king', localized_name: 'Monkey King', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Escape','Disabler','Initiator'], legs: 2, img: getHeroImage('monkey_king'), icon: getHeroIcon('monkey_king') },
  { id: 119, name: 'dark_willow', localized_name: 'Dark Willow', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Nuker','Disabler','Escape'], legs: 2, img: getHeroImage('dark_willow'), icon: getHeroIcon('dark_willow') },
  { id: 120, name: 'pangolier', localized_name: 'Pangolier', primary_attr: 'all', attack_type: 'Melee', roles: ['Carry','Nuker','Disabler','Durable','Escape','Initiator'], legs: 2, img: getHeroImage('pangolier'), icon: getHeroIcon('pangolier') },
  { id: 121, name: 'grimstroke', localized_name: 'Grimstroke', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Nuker','Disabler','Escape'], legs: 0, img: getHeroImage('grimstroke'), icon: getHeroIcon('grimstroke') },
  { id: 123, name: 'hoodwink', localized_name: 'Hoodwink', primary_attr: 'agi', attack_type: 'Ranged', roles: ['Support','Nuker','Escape','Disabler'], legs: 4, img: getHeroImage('hoodwink'), icon: getHeroIcon('hoodwink') },
  { id: 126, name: 'void_spirit', localized_name: 'Void Spirit', primary_attr: 'all', attack_type: 'Melee', roles: ['Carry','Escape','Nuker','Disabler'], legs: 2, img: getHeroImage('void_spirit'), icon: getHeroIcon('void_spirit') },
  { id: 128, name: 'snapfire', localized_name: 'Snapfire', primary_attr: 'all', attack_type: 'Ranged', roles: ['Support','Nuker','Disabler','Escape'], legs: 2, img: getHeroImage('snapfire'), icon: getHeroIcon('snapfire') },
  { id: 129, name: 'mars', localized_name: 'Mars', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Initiator','Disabler','Durable'], legs: 2, img: getHeroImage('mars'), icon: getHeroIcon('mars') },
  { id: 131, name: 'ringmaster', localized_name: 'Ring Master', primary_attr: 'int', attack_type: 'Ranged', roles: ['Support','Nuker','Escape','Disabler'], legs: 2, img: getHeroImage('ringmaster'), icon: getHeroIcon('ringmaster') },
  { id: 135, name: 'dawnbreaker', localized_name: 'Dawnbreaker', primary_attr: 'str', attack_type: 'Melee', roles: ['Carry','Durable'], legs: 2, img: getHeroImage('dawnbreaker'), icon: getHeroIcon('dawnbreaker') },
  { id: 136, name: 'marci', localized_name: 'Marci', primary_attr: 'all', attack_type: 'Melee', roles: ['Support','Carry','Initiator','Disabler','Escape'], legs: 2, img: getHeroImage('marci'), icon: getHeroIcon('marci') },
  { id: 137, name: 'primal_beast', localized_name: 'Primal Beast', primary_attr: 'str', attack_type: 'Melee', roles: ['Initiator','Durable','Disabler'], legs: 2, img: getHeroImage('primal_beast'), icon: getHeroIcon('primal_beast') },
  { id: 138, name: 'muerta', localized_name: 'Muerta', primary_attr: 'int', attack_type: 'Ranged', roles: ['Carry','Nuker','Disabler'], legs: 2, img: getHeroImage('muerta'), icon: getHeroIcon('muerta') },
  { id: 145, name: 'kez', localized_name: 'Kez', primary_attr: 'agi', attack_type: 'Melee', roles: ['Carry','Escape','Disabler'], legs: 2, img: getHeroImage('kez'), icon: getHeroIcon('kez') },
  { id: 155, name: 'largo', localized_name: 'Largo', primary_attr: 'str', attack_type: 'Melee', roles: ['Durable','Disabler','Support'], legs: 2, img: getHeroImage('largo'), icon: getHeroIcon('largo') },
];

// Meta heroes 7.41b — top winrate/pickrate by position
export const META_HEROES = {
  carry: ['ursa', 'life_stealer', 'spectre', 'juggernaut', 'phantom_assassin', 'terrorblade'],
  mid: ['void_spirit', 'nevermore', 'queenofpain', 'storm_spirit', 'ember_spirit', 'invoker'],
  offlane: ['axe', 'beastmaster', 'sand_king', 'tidehunter', 'bristleback', 'mars'],
  support4: ['spirit_breaker', 'hoodwink', 'nyx_assassin', 'tusk', 'earth_spirit', 'pangolier'],
  support5: ['crystal_maiden', 'lion', 'shadow_shaman', 'jakiro', 'lich', 'venomancer'],
};

export function getHeroById(id: number): Hero | undefined {
  return ALL_HEROES.find(h => h.id === id);
}

export function getHeroByName(name: string): Hero | undefined {
  return ALL_HEROES.find(h => h.name === name || h.localized_name === name);
}

export function getHeroesByAttr(attr: string): Hero[] {
  return ALL_HEROES.filter(h => h.primary_attr === attr);
}

export function getHeroesByRole(role: string): Hero[] {
  return ALL_HEROES.filter(h => h.roles.includes(role));
}
