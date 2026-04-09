// ========== HERO ABILITIES DATA ==========
// Скиллы героев Dota 2 с иконками из Steam CDN
// CDN формат: https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/{ability_name}.png

const ABILITY_CDN = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities';

export function getAbilityIcon(abilityName: string): string {
  return `${ABILITY_CDN}/${abilityName}.png`;
}

export interface HeroAbility {
  name: string;         // internal name for CDN
  displayName: string;  // Russian display name
  description: string;  // Russian description
  isUltimate: boolean;
  isPassive: boolean;
  manaCost?: string;
  cooldown?: string;
}

export interface HeroAbilities {
  heroName: string; // internal hero name
  abilities: HeroAbility[];
}

// Ability data for popular heroes
export const HERO_ABILITIES: Record<string, HeroAbility[]> = {
  'antimage': [
    { name: 'antimage_mana_break', displayName: 'Mana Break', description: 'Каждая атака сжигает ману цели и наносит дополнительный урон, равный проценту от сожжённой маны.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'antimage_blink', displayName: 'Blink', description: 'Мгновенно телепортируется на короткое расстояние, позволяя перемещаться внутрь и из боя.', isUltimate: false, isPassive: false, manaCost: '45', cooldown: '15/12/9/6' },
    { name: 'antimage_counterspell', displayName: 'Counterspell', description: 'Пассивно повышает сопротивление магии. Активация создаёт щит, отражающий заклинания.', isUltimate: false, isPassive: false, manaCost: '45/50/55/60', cooldown: '15/11/7/3' },
    { name: 'antimage_mana_void', displayName: 'Mana Void', description: 'Наносит урон в области, основанный на разнице между текущей и максимальной маной главной цели.', isUltimate: true, isPassive: false, manaCost: '100/200/300', cooldown: '70' },
  ],
  'axe': [
    { name: 'axe_berserkers_call', displayName: 'Berserker\'s Call', description: 'Axe провоцирует ближайших врагов атаковать его, получая дополнительную броню на время действия.', isUltimate: false, isPassive: false, manaCost: '110/120/130/140', cooldown: '17/15/13/11' },
    { name: 'axe_battle_hunger', displayName: 'Battle Hunger', description: 'Накладывает дебафф на врага, наносящий урон в секунду. Снимается при убийстве юнита.', isUltimate: false, isPassive: false, manaCost: '50/60/70/80', cooldown: '20/15/10/5' },
    { name: 'axe_counter_helix', displayName: 'Counter Helix', description: 'При получении атаки Axe с шансом наносит чистый урон всем ближайшим врагам.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '0.45/0.4/0.35/0.3' },
    { name: 'axe_culling_blade', displayName: 'Culling Blade', description: 'Мгновенно убивает вражеского героя, если его здоровье ниже порога. Даёт скорость команде.', isUltimate: true, isPassive: false, manaCost: '60/120/180', cooldown: '75/65/55' },
  ],
  'crystal_maiden': [
    { name: 'crystal_maiden_crystal_nova', displayName: 'Crystal Nova', description: 'Взрыв холодной энергии, наносящий урон и замедляющий врагов в области.', isUltimate: false, isPassive: false, manaCost: '100/120/140/160', cooldown: '11/10/9/8' },
    { name: 'crystal_maiden_frostbite', displayName: 'Frostbite', description: 'Заковывает врага в лёд, обездвиживая и нанося урон в течение нескольких секунд.', isUltimate: false, isPassive: false, manaCost: '115/125/140/150', cooldown: '9/8/7/6' },
    { name: 'crystal_maiden_brilliance_aura', displayName: 'Arcane Aura', description: 'Глобально увеличивает регенерацию маны всех союзных героев.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'crystal_maiden_freezing_field', displayName: 'Freezing Field', description: 'Вызывает массовый обстрел ледяными взрывами вокруг Crystal Maiden, замедляя и нанося огромный урон.', isUltimate: true, isPassive: false, manaCost: '200/400/600', cooldown: '110/100/90' },
  ],
  'pudge': [
    { name: 'pudge_meat_hook', displayName: 'Meat Hook', description: 'Бросает крюк, который тащит первого задетого юнита к Pudge, нанося чистый урон врагам.', isUltimate: false, isPassive: false, manaCost: '110/120/130/140', cooldown: '27/22/17/12' },
    { name: 'pudge_rot', displayName: 'Rot', description: 'Переключаемая аура, наносящая урон в секунду ближайшим врагам и замедляющая их. Также ранит самого Pudge.', isUltimate: false, isPassive: false, manaCost: '-', cooldown: '-' },
    { name: 'pudge_flesh_heap', displayName: 'Flesh Heap', description: 'Пассивно даёт сопротивление магии. За каждое убийство героя рядом Pudge навсегда получает дополнительную силу.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'pudge_dismember', displayName: 'Dismember', description: 'Хватает вражеского героя, нанося урон в секунду и восстанавливая здоровье Pudge в течение каста.', isUltimate: true, isPassive: false, manaCost: '100/130/170', cooldown: '30/25/20' },
  ],
  'invoker': [
    { name: 'invoker_quas', displayName: 'Quas', description: 'Манипулирование льдом. Каждый экземпляр Quas повышает регенерацию здоровья.', isUltimate: false, isPassive: false, manaCost: '-', cooldown: '-' },
    { name: 'invoker_wex', displayName: 'Wex', description: 'Манипулирование электричеством. Каждый экземпляр Wex повышает скорость передвижения и атаки.', isUltimate: false, isPassive: false, manaCost: '-', cooldown: '-' },
    { name: 'invoker_exort', displayName: 'Exort', description: 'Манипулирование огнём. Каждый экземпляр Exort повышает урон от атак.', isUltimate: false, isPassive: false, manaCost: '-', cooldown: '-' },
    { name: 'invoker_invoke', displayName: 'Invoke', description: 'Комбинирует сферы Quas, Wex и Exort для создания заклинания, зависящего от комбинации.', isUltimate: true, isPassive: false, manaCost: '0', cooldown: '6' },
  ],
  'phantom_assassin': [
    { name: 'phantom_assassin_stifling_dagger', displayName: 'Stifling Dagger', description: 'Бросает кинжал во врага, нанося урон и замедляя. Может прокнуть критический удар.', isUltimate: false, isPassive: false, manaCost: '30/25/20/15', cooldown: '6' },
    { name: 'phantom_assassin_phantom_strike', displayName: 'Phantom Strike', description: 'Телепортируется к цели, получая дополнительную скорость атаки при прыжке на врага.', isUltimate: false, isPassive: false, manaCost: '35/40/45/50', cooldown: '11/9/7/5' },
    { name: 'phantom_assassin_blur', displayName: 'Blur', description: 'Пассивно даёт шанс уклонения от атак. Активация скрывает PA с миникарты.', isUltimate: false, isPassive: false, manaCost: '50', cooldown: '60/55/50/45' },
    { name: 'phantom_assassin_coup_de_grace', displayName: 'Coup de Grace', description: 'Шанс нанести критический удар с 200%/325%/450% уроном.', isUltimate: true, isPassive: true, manaCost: '-', cooldown: '-' },
  ],
  'juggernaut': [
    { name: 'juggernaut_blade_fury', displayName: 'Blade Fury', description: 'Вращается, нанося магический урон ближайшим врагам. Даёт неуязвимость к магии на время.', isUltimate: false, isPassive: false, manaCost: '120/110/100/90', cooldown: '42/34/26/18' },
    { name: 'juggernaut_healing_ward', displayName: 'Healing Ward', description: 'Призывает варда, лечащего союзников в области на процент от максимального здоровья в секунду.', isUltimate: false, isPassive: false, manaCost: '120/125/130/135', cooldown: '60' },
    { name: 'juggernaut_blade_dance', displayName: 'Blade Dance', description: 'Пассивный шанс нанести критический удар с повышенным уроном.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'juggernaut_omni_slash', displayName: 'Omnislash', description: 'Прыгает между вражескими юнитами, нанося удары с бонусным уроном. Juggernaut неуязвим во время ульта.', isUltimate: true, isPassive: false, manaCost: '200/275/350', cooldown: '140/120/100' },
  ],
  'storm_spirit': [
    { name: 'storm_spirit_static_remnant', displayName: 'Static Remnant', description: 'Создаёт электрическую копию, которая взрывается при приближении врага, нанося урон.', isUltimate: false, isPassive: false, manaCost: '70/80/90/100', cooldown: '3.5' },
    { name: 'storm_spirit_electric_vortex', displayName: 'Electric Vortex', description: 'Притягивает вражеского героя к Storm Spirit, оглушая и нанося урон.', isUltimate: false, isPassive: false, manaCost: '60/70/80/90', cooldown: '21/18/15/12' },
    { name: 'storm_spirit_overload', displayName: 'Overload', description: 'После каждого каста заклинания следующая атака наносит дополнительный урон и замедляет.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'storm_spirit_ball_lightning', displayName: 'Ball Lightning', description: 'Превращается в шаровую молнию и летит в выбранную точку, нанося урон по пути. Расходует ману за дистанцию.', isUltimate: true, isPassive: false, manaCost: '30 + 8% макс. маны', cooldown: '0' },
  ],
  'faceless_void': [
    { name: 'faceless_void_time_walk', displayName: 'Time Walk', description: 'Перемещается в точку, откатывая весь полученный за последние 2 секунды урон.', isUltimate: false, isPassive: false, manaCost: '40', cooldown: '24/18/12/6' },
    { name: 'faceless_void_time_dilation', displayName: 'Time Dilation', description: 'Замедляет всех ближайших врагов и увеличивает кулдауны их способностей.', isUltimate: false, isPassive: false, manaCost: '60/65/70/75', cooldown: '36/30/24/18' },
    { name: 'faceless_void_time_lock', displayName: 'Time Lock', description: 'Шанс при атаке заморозить цель во времени, нанося дополнительный урон.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'faceless_void_chronosphere', displayName: 'Chronosphere', description: 'Создаёт сферу, в которой все юниты (кроме Void) заморожены во времени.', isUltimate: true, isPassive: false, manaCost: '150/225/300', cooldown: '160/150/140' },
  ],
  'earthshaker': [
    { name: 'earthshaker_fissure', displayName: 'Fissure', description: 'Создаёт трещину, оглушая и нанося урон по линии. Трещина блокирует проход.', isUltimate: false, isPassive: false, manaCost: '125/140/155/170', cooldown: '18/17/16/15' },
    { name: 'earthshaker_enchant_totem', displayName: 'Enchant Totem', description: 'Усиливает следующую атаку Earthshaker, нанося многократно увеличенный урон.', isUltimate: false, isPassive: false, manaCost: '20/30/40/50', cooldown: '5' },
    { name: 'earthshaker_aftershock', displayName: 'Aftershock', description: 'После каждого каста способности вызывает землетрясение, оглушая и нанося урон ближайшим врагам.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'earthshaker_echo_slam', displayName: 'Echo Slam', description: 'Создаёт волну, наносящую урон. Каждый враг в зоне создаёт эхо, наносящее дополнительный урон.', isUltimate: true, isPassive: false, manaCost: '145/205/265', cooldown: '110/100/90' },
  ],
  'drow_ranger': [
    { name: 'drow_ranger_frost_arrows', displayName: 'Frost Arrows', description: 'Каждая атака замедляет врага. Можно кастовать вручную для орб-волкинга.', isUltimate: false, isPassive: false, manaCost: '9/10/11/12', cooldown: '-' },
    { name: 'drow_ranger_wave_of_silence', displayName: 'Gust', description: 'Выпускает волну ветра, отбрасывая врагов и накладывая молчание.', isUltimate: false, isPassive: false, manaCost: '70/80/90/100', cooldown: '18/17/16/15' },
    { name: 'drow_ranger_trueshot', displayName: 'Multishot', description: 'Выпускает волну стрел в конусе, нанося урон и замедляя врагов.', isUltimate: false, isPassive: false, manaCost: '50/60/70/80', cooldown: '20/17/14/11' },
    { name: 'drow_ranger_marksmanship', displayName: 'Marksmanship', description: 'Шанс при атаке игнорировать базовую броню цели. Отключается, если враг слишком близко.', isUltimate: true, isPassive: true, manaCost: '-', cooldown: '-' },
  ],
  'lion': [
    { name: 'lion_impale', displayName: 'Earth Spike', description: 'Скальные шипы вырываются из земли по линии, подбрасывая и оглушая врагов.', isUltimate: false, isPassive: false, manaCost: '70/100/130/160', cooldown: '12' },
    { name: 'lion_voodoo', displayName: 'Hex', description: 'Превращает вражеского героя в безобидную жабу, лишая способностей и замедляя.', isUltimate: false, isPassive: false, manaCost: '125/150/175/200', cooldown: '30/24/18/12' },
    { name: 'lion_mana_drain', displayName: 'Mana Drain', description: 'Высасывает ману из вражеского героя, пополняя свою. Убивает иллюзии мгновенно.', isUltimate: false, isPassive: false, manaCost: '20/30/40/50', cooldown: '16/12/8/4' },
    { name: 'lion_finger_of_death', displayName: 'Finger of Death', description: 'Наносит огромный магический урон одной цели. Урон увеличивается с каждым убийством.', isUltimate: true, isPassive: false, manaCost: '200/420/650', cooldown: '160/100/40' },
  ],
  'spectre': [
    { name: 'spectre_spectral_dagger', displayName: 'Spectral Dagger', description: 'Бросает кинжал, нанося урон по пути и оставляя след. Spectre может проходить через препятствия по следу.', isUltimate: false, isPassive: false, manaCost: '100/120/140/160', cooldown: '22' },
    { name: 'spectre_desolate', displayName: 'Desolate', description: 'Пассивно наносит дополнительный чистый урон, если вражеский герой находится без союзников рядом.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'spectre_dispersion', displayName: 'Dispersion', description: 'Пассивно отражает часть полученного урона всем ближайшим врагам.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'spectre_haunt', displayName: 'Haunt', description: 'Создаёт иллюзию рядом с каждым вражеским героем. Spectre может телепортироваться к любой иллюзии.', isUltimate: true, isPassive: false, manaCost: '150', cooldown: '180/150/120' },
  ],
  'sven': [
    { name: 'sven_storm_bolt', displayName: 'Storm Hammer', description: 'Бросает молот, оглушая и нанося урон врагам в области.', isUltimate: false, isPassive: false, manaCost: '110/120/130/140', cooldown: '18/16/14/12' },
    { name: 'sven_great_cleave', displayName: 'Great Cleave', description: 'Пассивный клив-урон — каждая атака наносит процент урона всем ближайшим врагам.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'sven_warcry', displayName: 'Warcry', description: 'Даёт союзникам рядом дополнительную броню и скорость передвижения.', isUltimate: false, isPassive: false, manaCost: '60', cooldown: '36/32/28/24' },
    { name: 'sven_gods_strength', displayName: 'God\'s Strength', description: 'Увеличивает урон Sven на 110%/160%/210% на время действия.', isUltimate: true, isPassive: false, manaCost: '100/150/200', cooldown: '110' },
  ],
  'tinker': [
    { name: 'tinker_laser', displayName: 'Laser', description: 'Луч, наносящий чистый урон и ослепляющий цель, заставляя промахиваться.', isUltimate: false, isPassive: false, manaCost: '95/120/145/170', cooldown: '14' },
    { name: 'tinker_heat_seeking_missile', displayName: 'Heat-Seeking Missile', description: 'Запускает ракеты, которые летят к ближайшим вражеским героям и наносят урон.', isUltimate: false, isPassive: false, manaCost: '80/100/120/140', cooldown: '25' },
    { name: 'tinker_defense_matrix', displayName: 'Defense Matrix', description: 'Накладывает щит на союзника, поглощающий урон и дающий сопротивление статусам.', isUltimate: false, isPassive: false, manaCost: '80/90/100/110', cooldown: '16' },
    { name: 'tinker_rearm', displayName: 'Rearm', description: 'Сбрасывает кулдауны всех способностей Tinker и большинства предметов.', isUltimate: true, isPassive: false, manaCost: '100/200/300', cooldown: '0' },
  ],
  'sniper': [
    { name: 'sniper_shrapnel', displayName: 'Shrapnel', description: 'Обстреливает область шрапнелью, замедляя и нанося урон врагам в зоне.', isUltimate: false, isPassive: false, manaCost: '50', cooldown: '0' },
    { name: 'sniper_headshot', displayName: 'Headshot', description: 'Шанс при атаке нанести дополнительный урон и кратковременно замедлить цель.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'sniper_take_aim', displayName: 'Take Aim', description: 'Пассивно увеличивает дальность атаки. Активация даёт ещё больше дальности на время.', isUltimate: false, isPassive: false, manaCost: '0', cooldown: '20/15/10/5' },
    { name: 'sniper_assassinate', displayName: 'Assassinate', description: 'Прицеливается и стреляет, нанося огромный урон одной цели на большой дальности. Мини-стан при попадании.', isUltimate: true, isPassive: false, manaCost: '175/275/375', cooldown: '20/15/10' },
  ],
  'ursa': [
    { name: 'ursa_earthshock', displayName: 'Earthshock', description: 'Прыгает и ударяет по земле, замедляя и нанося урон врагам в области.', isUltimate: false, isPassive: false, manaCost: '75', cooldown: '14/12/10/8' },
    { name: 'ursa_overpower', displayName: 'Overpower', description: 'Даёт максимальную скорость атаки на определённое количество ударов.', isUltimate: false, isPassive: false, manaCost: '45/55/65/75', cooldown: '10' },
    { name: 'ursa_fury_swipes', displayName: 'Fury Swipes', description: 'Каждая последующая атака по одной цели наносит накапливающийся дополнительный урон.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'ursa_enrage', displayName: 'Enrage', description: 'Увеличивает урон Fury Swipes и даёт мощное сопротивление урону на несколько секунд.', isUltimate: true, isPassive: false, manaCost: '0', cooldown: '70/50/30' },
  ],
  'shadow_shaman': [
    { name: 'shadow_shaman_ether_shock', displayName: 'Ether Shock', description: 'Молния, бьющая несколько целей по цепочке, нанося магический урон.', isUltimate: false, isPassive: false, manaCost: '95/105/135/160', cooldown: '14' },
    { name: 'shadow_shaman_voodoo', displayName: 'Hex', description: 'Превращает вражеского героя в курицу, обездвиживая и лишая способностей.', isUltimate: false, isPassive: false, manaCost: '110/140/170/200', cooldown: '13' },
    { name: 'shadow_shaman_shackles', displayName: 'Shackles', description: 'Привязывает врага, нанося урон в секунду. Shadow Shaman тоже обездвижен на время каста.', isUltimate: false, isPassive: false, manaCost: '140/150/160/170', cooldown: '10' },
    { name: 'shadow_shaman_mass_serpent_ward', displayName: 'Mass Serpent Ward', description: 'Призывает кольцо змеиных вардов, атакующих ближайших врагов и здания.', isUltimate: true, isPassive: false, manaCost: '200/350/600', cooldown: '120' },
  ],
  'tidehunter': [
    { name: 'tidehunter_gush', displayName: 'Gush', description: 'Выстреливает струёй воды, нанося урон, замедляя и снижая броню цели.', isUltimate: false, isPassive: false, manaCost: '90/100/110/120', cooldown: '12' },
    { name: 'tidehunter_kraken_shell', displayName: 'Kraken Shell', description: 'Пассивно блокирует часть входящего урона. При накоплении достаточного урона снимает все дебаффы.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'tidehunter_anchor_smash', displayName: 'Anchor Smash', description: 'Удар якорем по ближайшим врагам, снижая их урон от атак.', isUltimate: false, isPassive: false, manaCost: '30/40/50/60', cooldown: '7/6/5/4' },
    { name: 'tidehunter_ravage', displayName: 'Ravage', description: 'Выпускает щупальца из земли, подбрасывая и оглушая всех врагов в огромной области.', isUltimate: true, isPassive: false, manaCost: '150/225/325', cooldown: '150' },
  ],
  'sand_king': [
    { name: 'sandking_burrowstrike', displayName: 'Burrowstrike', description: 'Подземный рывок по линии, оглушая и нанося урон всем врагам на пути.', isUltimate: false, isPassive: false, manaCost: '110/120/130/140', cooldown: '11' },
    { name: 'sandking_sand_storm', displayName: 'Sand Storm', description: 'Создаёт песчаную бурю, нанося урон врагам рядом. Sand King невидим на время.', isUltimate: false, isPassive: false, manaCost: '60/50/40/30', cooldown: '40/34/28/22' },
    { name: 'sandking_caustic_finale', displayName: 'Caustic Finale', description: 'Атаки накладывают дебафф на врагов. При смерти они взрываются, нанося урон и замедляя рядом.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'sandking_epicenter', displayName: 'Epicenter', description: 'После подготовки создаёт серию мощных импульсов вокруг Sand King, нанося урон и замедляя.', isUltimate: true, isPassive: false, manaCost: '150/225/300', cooldown: '120/110/100' },
  ],
  'spirit_breaker': [
    { name: 'spirit_breaker_charge_of_darkness', displayName: 'Charge of Darkness', description: 'Набирает скорость и несётся к выбранному вражескому герою через всю карту, оглушая при контакте.', isUltimate: false, isPassive: false, manaCost: '100', cooldown: '17/14/11/8' },
    { name: 'spirit_breaker_bulldoze', displayName: 'Bulldoze', description: 'Повышает скорость передвижения и сопротивление статусным эффектам.', isUltimate: false, isPassive: false, manaCost: '25/30/35/40', cooldown: '22/18/14/10' },
    { name: 'spirit_breaker_greater_bash', displayName: 'Greater Bash', description: 'Пассивный шанс при атаке оглушить цель и нанести дополнительный урон, зависящий от скорости.', isUltimate: false, isPassive: true, manaCost: '-', cooldown: '-' },
    { name: 'spirit_breaker_nether_strike', displayName: 'Nether Strike', description: 'Телепортируется за спину врагу и наносит мощный удар с Greater Bash.', isUltimate: true, isPassive: false, manaCost: '125/150/175', cooldown: '100/80/60' },
  ],
  'void_spirit': [
    { name: 'void_spirit_aether_remnant', displayName: 'Aether Remnant', description: 'Создаёт копию, которая тянет и наносит урон первому коснувшемуся врагу.', isUltimate: false, isPassive: false, manaCost: '90/100/110/120', cooldown: '14/12/10/8' },
    { name: 'void_spirit_dissimilate', displayName: 'Dissimilate', description: 'Исчезает и создаёт порталы вокруг. Выбирает портал выхода, нанося урон врагам.', isUltimate: false, isPassive: false, manaCost: '70/75/80/85', cooldown: '24/20/16/12' },
    { name: 'void_spirit_resonant_pulse', displayName: 'Resonant Pulse', description: 'Выпускает импульс, наносящий урон и создающий щит, поглощающий физический урон.', isUltimate: false, isPassive: false, manaCost: '75/85/95/105', cooldown: '16/14/12/10' },
    { name: 'void_spirit_astral_step', displayName: 'Astral Step', description: 'Рывок к точке, нанося урон и замедляя всех врагов на пути.', isUltimate: true, isPassive: false, manaCost: '0', cooldown: '0' },
  ],
};

export function getHeroAbilities(heroName: string): HeroAbility[] | null {
  return HERO_ABILITIES[heroName] || null;
}

export function hasAbilities(heroName: string): boolean {
  return heroName in HERO_ABILITIES;
}
