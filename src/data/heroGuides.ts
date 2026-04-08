// ========== HERO GUIDES DATA ==========
// Гайды по героям: роль, описание, предметы, советы

export interface HeroGuide {
  heroName: string; // localized_name
  difficulty: 1 | 2 | 3; // 1=easy, 2=medium, 3=hard
  description: string;
  playstyle: string;
  positions: number[];
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  earlyGame: string;
  midGame: string;
  lateGame: string;
  coreItems: string[];
  situationalItems: string[];
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
}

export const HERO_GUIDES: Record<string, HeroGuide> = {
  'Anti-Mage': {
    heroName: 'Anti-Mage',
    difficulty: 2,
    description: 'Мобильный carry с высоким потенциалом фарма. Сжигает ману врагов и наносит огромный урон ультой по целям без маны.',
    playstyle: 'Фармящий carry, избегающий ранних драк. Цель — быстро нафармить Battle Fury и доминировать в lategame.',
    positions: [1],
    strengths: ['Быстрый фарм с Battle Fury', 'Отличная мобильность (Blink)', 'Силён против героев с маной', 'Один из лучших lategame carry'],
    weaknesses: ['Слаб в ранней игре', 'Зависим от фарма', 'Уязвим к молчанию и дизейблам', 'Мало урона до ключевых предметов'],
    tips: ['Фармите жёстко первые 20 минут', 'Используйте Blink для побега, а не инициации', 'Mana Void кастуйте на героев с большим пулом маны', 'Всегда имейте TP для телепортации на пустые линии'],
    earlyGame: 'Безопасный фарм на лёгкой линии. Избегайте драк, копите на Battle Fury. Blink помогает уходить от ганков.',
    midGame: 'С Battle Fury начинайте фармить джангл и пустые линии. Разделяйте карту, давите линии. Вступайте в драки только при явном преимуществе.',
    lateGame: 'С полным инвентарём — один из сильнейших carry. Mana Void может перевернуть тимфайт. Фокусируйте героев с большим пулом маны.',
    coreItems: ['Battle Fury', 'Manta Style', 'Abyssal Blade', 'Butterfly'],
    situationalItems: ['Black King Bar', 'Linken\'s Sphere', 'Monkey King Bar', 'Skadi'],
    tier: 'A',
  },
  'Axe': {
    heroName: 'Axe',
    difficulty: 1,
    description: 'Агрессивный инициатор-танк. Прыгает в толпу врагов, тонирует Berserker\'s Call и рубит слабых героев Culling Blade.',
    playstyle: 'Агрессивный offlaner. Блинкуется в команду врага, дизейблит Call\'ом и рубит слабых героев ультой.',
    positions: [3],
    strengths: ['Мощный инициатор', 'Counter Helix — пассивный АОЕ урон', 'Culling Blade — мгновенное добивание', 'Контрит illusion-героев'],
    weaknesses: ['Зависим от Blink Dagger', 'Мало урона без Counter Helix', 'Уязвим к кайтингу', 'Падает в lategame'],
    tips: ['Blink + Call — ваш главный комбо', 'Culling Blade игнорирует всё — используйте для добивания', 'Battle Hunger давит на линии, не давая врагу фармить', 'Режьте вейв между первой и второй вышкой'],
    earlyGame: 'Доминируйте на линии Battle Hunger. Подрезайте вейвы между вышками. Counter Helix даёт фарм в джангле.',
    midGame: 'С Blink Dagger инициируйте драки. Call + Blade Mail = огромный урон. Ищите пики в тумане.',
    lateGame: 'Инициация остаётся важной. Culling Blade — ваш козырь. Без хороших входов команда проиграет.',
    coreItems: ['Blink Dagger', 'Blade Mail', 'Black King Bar', 'Heart of Tarrasque'],
    situationalItems: ['Aghanim\'s Scepter', 'Shiva\'s Guard', 'Lotus Orb', 'Overwhelming Blink'],
    tier: 'S',
  },
  'Crystal Maiden': {
    heroName: 'Crystal Maiden',
    difficulty: 1,
    description: 'Классический саппорт с глобальной аурой маны. Замедляет, морозит и наносит огромный урон ультой в тимфайтах.',
    playstyle: 'Hard support, дающий ману всей команде. Контролирует линию замедлениями и стуном.',
    positions: [5],
    strengths: ['Глобальная аура маны', 'Два дизейбла', 'Сильная на линии', 'Мощный ульт в тимфайтах'],
    weaknesses: ['Очень хрупкая', 'Самая медленная скорость передвижения', 'Ульт легко прервать', 'Уязвима к ганкам'],
    tips: ['Аура маны помогает всей команде — скилльте её рано', 'Freezing Field используйте из тумана или с BKB', 'Стакайте и пуллите лесные лагеря', 'Вардите агрессивно, но не умирайте зря'],
    earlyGame: 'Ставьте варды, пулите крипов. Frostbite и Crystal Nova контролируют линию. Аура маны критична для мид-героя.',
    midGame: 'Smoke-ганки, вардинг. Freezing Field из тумана может перевернуть драку. Купите Glimmer Cape для выживания.',
    lateGame: 'Вардинг и контроль. С Aghanim\'s Shard Frostbite становится мощнее. Позиционируйтесь в тылу.',
    coreItems: ['Tranquil Boots', 'Glimmer Cape', 'Force Staff', 'Black King Bar'],
    situationalItems: ['Aghanim\'s Scepter', 'Aeon Disk', 'Ghost Scepter', 'Lotus Orb'],
    tier: 'A',
  },
  'Pudge': {
    heroName: 'Pudge',
    difficulty: 2,
    description: 'Культовый герой Dota 2. Хукает врагов через половину карты, гниёт их Rot\'ом и поедает Dismember\'ом.',
    playstyle: 'Roamer/Support. Ходит по карте и ищет хуки. Одно удачное попадание = убийство.',
    positions: [4, 5],
    strengths: ['Хук — одна из лучших способностей в игре', 'Dismember — сильный дизейбл', 'Flesh Heap даёт бесконечный рост HP', 'Отличный ганкер'],
    weaknesses: ['Зависим от попадания Hook', 'Медленный без предметов', 'Rot наносит урон себе', 'Контрится Lifestealer и BKB'],
    tips: ['Тренируйте хуки — это ваш хлеб', 'Rot используйте для добивания и замедления', 'Flesh Heap стакается — чем больше убийств, тем вы толще', 'Smoke + Hook = почти гарантированное убийство'],
    earlyGame: 'Роамьте с 3-4 уровня. Ищите хуки из тумана. Rot помогает на линии, но осторожно — он ранит и вас.',
    midGame: 'Smoke-ганки, контроль рун. С Blink Dagger ваш потенциал вырастает кратно. Hook + Dismember = убийство.',
    lateGame: 'С Flesh Heap стаками вы — танк. Хуки остаются решающими. Aghanim\'s Scepter делает Dismember ещё сильнее.',
    coreItems: ['Tranquil Boots', 'Blink Dagger', 'Aghanim\'s Shard', 'Black King Bar'],
    situationalItems: ['Aghanim\'s Scepter', 'Aether Lens', 'Heart of Tarrasque', 'Overwhelming Blink'],
    tier: 'B',
  },
  'Invoker': {
    heroName: 'Invoker',
    difficulty: 3,
    description: 'Самый сложный герой в Dota 2. Комбинирует 3 сферы в 10 разных заклинаний. Может всё — контроль, урон, пуш, спасение.',
    playstyle: 'Мид-герой с огромным потенциалом. Quas-Wex для контроля, Quas-Exort для урона. Требует идеального знания комбо.',
    positions: [2],
    strengths: ['10 уникальных заклинаний', 'Универсален — подходит под любую игру', 'Масштабируется всю игру', 'Tornado + EMP + Meteor = вайп'],
    weaknesses: ['Крайне сложен в освоении', 'Медленный старт (Exort билд)', 'Уязвим к ганкам без Invoke', 'Нужно много практики'],
    tips: ['Выучите комбо: Tornado > EMP > Meteor > Deafening Blast', 'Sun Strike глобален — следите за мини-картой', 'Cold Snap + Forge Spirits доминируют на миде', 'Ghost Walk — ваш основной побег'],
    earlyGame: 'Exort: фармите Midas, давите мид Sun Strike + Cold Snap. Wex: роамьте с EMP + Cold Snap рано.',
    midGame: 'С Aghanim\'s Scepter ваши комбо становятся смертельными. Участвуйте в каждом тимфайте — ваш контроль решает.',
    lateGame: 'Full build Invoker — один из самых страшных героев. Refresher Orb позволяет выкастовать все 10 спеллов дважды.',
    coreItems: ['Hand of Midas', 'Aghanim\'s Scepter', 'Blink Dagger', 'Refresher Orb'],
    situationalItems: ['Black King Bar', 'Scythe of Vyse', 'Octarine Core', 'Linken\'s Sphere'],
    tier: 'A',
  },
  'Phantom Assassin': {
    heroName: 'Phantom Assassin',
    difficulty: 1,
    description: 'Крит-машина. Coup de Grace — один из самых сильных пассивов в игре. Один удар может убить любого героя.',
    playstyle: 'Агрессивный carry. Прыгает на цель Phantom Strike, криты Coup de Grace наносят безумный урон.',
    positions: [1],
    strengths: ['Огромный крит-урон', 'Высокий уклон (Blur)', 'Phantom Strike даёт мобильность и атакспид', 'Stifling Dagger для ластхита и преследования'],
    weaknesses: ['Контрится Silver Edge и MKB', 'Уязвима к магическому урону', 'Нужен BKB почти всегда', 'Зависит от RNG критов'],
    tips: ['Dagger используйте для добивания и замедления', 'Phantom Strike на союзников для побега', 'Blur скрывает вас с миникарты — используйте для ганков', 'BKB — ваш приоритетный предмет'],
    earlyGame: 'Фармите с Dagger, избегайте агрессии. С Ring of Health переживёте линию. Blur помогает против харасса.',
    midGame: 'Battle Fury + Desolator = быстрый фарм и убийства. Ищите одиночных героев. BKB — второй или третий предмет.',
    lateGame: 'С полным билдом — ваш крит решает тимфайты. Один удар с Coup de Grace может убить саппорта мгновенно.',
    coreItems: ['Battle Fury', 'Desolator', 'Black King Bar', 'Satanic'],
    situationalItems: ['Abyssal Blade', 'Monkey King Bar', 'Nullifier', 'Aghanim\'s Scepter'],
    tier: 'A',
  },
  'Storm Spirit': {
    heroName: 'Storm Spirit',
    difficulty: 3,
    description: 'Электрический мобильный мид. Ball Lightning позволяет летать по всей карте, ганкая и добивая врагов.',
    playstyle: 'Агрессивный мидер. С 6 уровня начинает ганкать. Ball Lightning делает его одним из самых мобильных героев.',
    positions: [2],
    strengths: ['Неограниченная мобильность', 'Сильный ганкер с 6 уровня', 'Electric Vortex — мощный дизейбл', 'Отлично масштабируется'],
    weaknesses: ['Контрится Anti-Mage и Silencer', 'Зависим от маны', 'Нужен хороший старт на миде', 'Сложный в исполнении'],
    tips: ['Ball Lightning расходует % от маны — следите за пулом', 'Overload срабатывает после каждого спелла — вплетайте автоатаки', 'Orchid Malevolence — ключевой предмет для соло-убийств', 'Не прыгайте без маны — вы умрёте'],
    earlyGame: 'Доминируйте мид с Static Remnant и Overload. Контролируйте руны. С 6 уровня ганкайте боковые линии.',
    midGame: 'Orchid + Ball Lightning = убийство любого одиночного героя. Давите карту, не давайте врагу фармить.',
    lateGame: 'Bloodstone + Aghanim\'s = бесконечные прыжки. Kaya и Sange или Shiva\'s для выживания.',
    coreItems: ['Power Treads', 'Orchid Malevolence', 'Bloodstone', 'Aghanim\'s Scepter'],
    situationalItems: ['Black King Bar', 'Linken\'s Sphere', 'Scythe of Vyse', 'Shiva\'s Guard'],
    tier: 'A',
  },
  'Juggernaut': {
    heroName: 'Juggernaut',
    difficulty: 1,
    description: 'Универсальный carry с магическим иммунитетом и мощным ультиматом. Blade Fury даёт BKB на 5 секунд.',
    playstyle: 'Сбалансированный carry. Силён на линии, хорошо фармит, убивает Omnislash. Blade Fury даёт выживаемость.',
    positions: [1],
    strengths: ['Blade Fury = встроенный BKB', 'Omnislash — мощная ульта', 'Healing Ward для пуша и лечения', 'Силён на всех стадиях игры'],
    weaknesses: ['Omnislash слабеет в lategame', 'Blade Fury запрещает атаковать', 'Не самый быстрый фармер', 'Средний без ульта'],
    tips: ['Blade Fury + TP = безопасный побег', 'Omnislash бьёт сильнее по одиночным целям', 'Healing Ward прячьте за деревьями', 'На линии Blade Fury + Orb of Venom = килл'],
    earlyGame: 'Сильная линия с Blade Fury. Healing Ward позволяет оставаться на линии. Ищите убийства с саппортом.',
    midGame: 'Battle Fury для фарма или Maelstrom для драк. Omnislash убивает одиночных героев.',
    lateGame: 'С Aghanim\'s и крит-предметами Omnislash масштабируется. Swift Slash (Shard) даёт мини-ульту.',
    coreItems: ['Battle Fury', 'Aghanim\'s Scepter', 'Butterfly', 'Skadi'],
    situationalItems: ['Manta Style', 'Monkey King Bar', 'Abyssal Blade', 'Satanic'],
    tier: 'A',
  },
  'Faceless Void': {
    heroName: 'Faceless Void',
    difficulty: 2,
    description: 'Carry с лучшим ультиматом в игре. Chronosphere останавливает всё — союзников и врагов, кроме самого Void.',
    playstyle: 'Carry-инициатор. Chronosphere — главный козырь команды. Один хороший Chrono = выигранный тимфайт.',
    positions: [1, 3],
    strengths: ['Chronosphere — лучший ультимат для тимфайтов', 'Time Walk откатывает полученный урон', 'Time Lock — мощный баш', 'Отлично масштабируется'],
    weaknesses: ['Chronosphere ловит и союзников', 'Зависим от ульта', 'Нужно идеальное позиционирование', 'Медленный фармер до ключевых предметов'],
    tips: ['Не ловите союзников в Chrono!', 'Time Walk перед Chrono для позиционирования', 'Координируйте ульт с командой', 'Backtrack (Time Walk) — используйте после получения урона'],
    earlyGame: 'Фармите безопасно. Time Walk спасает от ганков. С 6 уровня ищите драки с Chronosphere.',
    midGame: 'Maelstrom + Chrono = убийства. Координируйте ульт с командой. Один хороший Chrono выигрывает драку.',
    lateGame: 'С Refresher можно кастовать два Chrono подряд. Butterfly и Daedalus для максимального урона внутри сферы.',
    coreItems: ['Maelstrom', 'Black King Bar', 'Daedalus', 'Butterfly'],
    situationalItems: ['Refresher Orb', 'Aghanim\'s Scepter', 'Monkey King Bar', 'Satanic'],
    tier: 'S',
  },
  'Earthshaker': {
    heroName: 'Earthshaker',
    difficulty: 2,
    description: 'Легендарный инициатор. Echo Slam наносит тем больше урона, чем больше юнитов рядом. Убивает целые команды.',
    playstyle: 'Инициатор-саппорт. Blink + Echo Slam = вайп вражеской команды. Fissure контролирует позиционирование.',
    positions: [4],
    strengths: ['Echo Slam — лучший АОЕ ультимат', 'Fissure — длинный дизейбл и блок', 'Контрит героев с иллюзиями', 'Один из лучших инициаторов'],
    weaknesses: ['Зависим от Blink Dagger', 'Мало маны', 'Слаб до Blink', 'Одноразовый — после входа мало что может'],
    tips: ['Blink + Echo Slam — ваш главный приём', 'Fissure можно использовать как стену', 'Против PL/Meepo — ваш ульт смертельный', 'Aftershock срабатывает от каждого спелла — вплетайте их'],
    earlyGame: 'Роамьте с Fissure. Стакайте лагеря для фарма. Копите на Blink Dagger любой ценой.',
    midGame: 'Blink + Echo Slam = вы в игре. Ждите момент когда враги соберутся вместе. Одно хорошее комбо решает.',
    lateGame: 'Aghanim\'s Scepter + Refresher = два Echo Slam. Ваш контроль и инициация остаются критичными.',
    coreItems: ['Arcane Boots', 'Blink Dagger', 'Aghanim\'s Scepter', 'Black King Bar'],
    situationalItems: ['Refresher Orb', 'Force Staff', 'Aeon Disk', 'Lotus Orb'],
    tier: 'A',
  },
  'Drow Ranger': {
    heroName: 'Drow Ranger',
    difficulty: 1,
    description: 'Рейнджевый carry с аурой, усиливающей всех дальнобойных союзников. Marksmanship игнорирует армор.',
    playstyle: 'Позиционный carry. Стреляет издалека, замедляет Frost Arrows. Marksmanship даёт огромный урон по армору.',
    positions: [1, 2],
    strengths: ['Marksmanship — мощная пассивка', 'Frost Arrows для кайтинга', 'Аура для всех рейндж-союзников', 'Gust — сильный сайленс и нокбэк'],
    weaknesses: ['Хрупкая — умирает от прыжков', 'Marksmanship отключается вблизи', 'Нет мобильности', 'Контрится gap-closer\'ами'],
    tips: ['Держите дистанцию — Marksmanship отключается вблизи', 'Frost Arrows используйте мануально для орб-волкинга', 'Gust спасает от прыжков', 'Пикайте с другими рейндж-героями для аура-бонуса'],
    earlyGame: 'Фармите безопасно с Frost Arrows. Gust спасает от ганков. Аура усиливает рейнджевого саппорта.',
    midGame: 'С Dragon Lance начинайте участвовать в драках. Позиционирование — ваш главный навык.',
    lateGame: 'С Aghanim\'s и Butterfly — огромный DPS. Marksmanship прокает делают вас машиной для убийств.',
    coreItems: ['Dragon Lance', 'Manta Style', 'Butterfly', 'Aghanim\'s Scepter'],
    situationalItems: ['Black King Bar', 'Silver Edge', 'Monkey King Bar', 'Pike'],
    tier: 'B',
  },
  'Lion': {
    heroName: 'Lion',
    difficulty: 1,
    description: 'Саппорт с двумя дизейблами и мощным нюком. Earth Spike и Hex контролируют, Finger of Death убивает.',
    playstyle: 'Агрессивный саппорт. Два дизейбла + мощный нюк. Идеален для ганков и контроля в драках.',
    positions: [4, 5],
    strengths: ['Два надёжных дизейбла', 'Finger of Death — мощный нюк', 'Mana Drain решает проблему маны', 'Отличный ганкер'],
    weaknesses: ['Хрупкий', 'Медленный без предметов', 'Finger имеет длинный кулдаун', 'Зависим от уровня'],
    tips: ['Earth Spike + Hex = 5+ секунд контроля', 'Mana Drain используйте на вражеских героях и иллюзиях', 'Finger of Death стакается — больше убийств = больше урона', 'Blink Dagger превращает вас в убийцу'],
    earlyGame: 'Агрессивная линия с Earth Spike. Mana Drain решает проблему маны. Роамьте с 3-4 уровня.',
    midGame: 'Blink + Hex + Spike + Finger = мгновенное убийство. Smoke-ганки — ваш основной инструмент.',
    lateGame: 'Ваш контроль остаётся важным. Aghanim\'s Scepter даёт Finger АОЕ и больше стаков.',
    coreItems: ['Tranquil Boots', 'Blink Dagger', 'Aghanim\'s Scepter', 'Aether Lens'],
    situationalItems: ['Ghost Scepter', 'Glimmer Cape', 'Force Staff', 'Aeon Disk'],
    tier: 'A',
  },
  'Spectre': {
    heroName: 'Spectre',
    difficulty: 2,
    description: 'Lategame чудовище. Haunt позволяет появиться рядом со всеми врагами одновременно. Desolate и Dispersion делают её неубиваемой.',
    playstyle: 'Lategame carry. Слабый старт, но с предметами — один из самых страшных героев в игре.',
    positions: [1],
    strengths: ['Один из лучших lategame carry', 'Haunt — глобальный ульт', 'Dispersion отражает урон', 'Desolate — чистый урон по одиночным целям'],
    weaknesses: ['Очень слабая ранняя игра', 'Медленный фарм без предметов', 'Нуждается в защите команды', 'Контрится сильным пушем'],
    tips: ['Haunt используйте для добивания или инициации', 'Radiance ускоряет фарм значительно', 'Dispersion — чем вы толще, тем больше урона отражаете', 'Спектральный кинжал помогает выживать на линии'],
    earlyGame: 'Выживайте. Фармите осторожно. Spectral Dagger помогает убегать. Не умирайте — каждая смерть откладывает ваш лейтгейм.',
    midGame: 'Radiance — точка перелома. С ней вы фармите быстро. Haunt позволяет участвовать в драках с другого края карты.',
    lateGame: 'С полным билдом — практически неубиваемый carry. Dispersion + Heart = отражение тонн урона.',
    coreItems: ['Radiance', 'Manta Style', 'Heart of Tarrasque', 'Butterfly'],
    situationalItems: ['Blade Mail', 'Diffusal Blade', 'Abyssal Blade', 'Skadi'],
    tier: 'S',
  },
  'Tinker': {
    heroName: 'Tinker',
    difficulty: 3,
    description: 'Мидер, контролирующий всю карту. Rearm сбрасывает кулдауны всех предметов и способностей.',
    playstyle: 'Мидер-пушер-нюкер. Rearm позволяет бесконечно кастовать способности и перезаряжать предметы.',
    positions: [2],
    strengths: ['Контроль всей карты Boots of Travel', 'Бесконечные нюки через Rearm', 'Огромный push-потенциал', 'Тяжёло поймать'],
    weaknesses: ['Контрится Spirit Breaker и Spectre', 'Очень сложен в исполнении', 'Зависим от маны', 'Падает в супер-лейте'],
    tips: ['BoT + Rearm = вы везде на карте', 'March of the Machines для фарма и push', 'Laser ослепляет carry — используйте в драках', 'Blink + Rearm + Blink = невозможно поймать'],
    earlyGame: 'Фармите мид, стакайте лагеря March. Soul Ring решает проблему маны. Boots of Travel — первый предмет.',
    midGame: 'TP на все линии, пушьте и убивайте. Blink Dagger делает вас неуловимым. Давите карту нон-стоп.',
    lateGame: 'С Overwhelming Blink и Shiva\'s — контролируйте тимфайты. Rearm позволяет использовать всё дважды.',
    coreItems: ['Boots of Travel', 'Blink Dagger', 'Aghanim\'s Scepter', 'Shiva\'s Guard'],
    situationalItems: ['Scythe of Vyse', 'Overwhelming Blink', 'Black King Bar', 'Aeon Disk'],
    tier: 'B',
  },
  'Sven': {
    heroName: 'Sven',
    difficulty: 1,
    description: 'Carry с клив-уроном и станом. God\'s Strength утраивает урон. Один удар может убить целую команду.',
    playstyle: 'Burst carry. God\'s Strength + клив = АОЕ-разрушение. Storm Hammer — надёжный стан.',
    positions: [1],
    strengths: ['God\'s Strength — огромный burst', 'Встроенный клив', 'Storm Hammer — надёжный стан', 'Быстрый фарм'],
    weaknesses: ['Кайтится рейнджевыми героями', 'Зависим от BKB', 'Предсказуемый', 'Без ульта — обычный крипов'],
    tips: ['BKB + God\'s Strength = ваш вход в тимфайт', 'Great Cleave фармит стаки мгновенно', 'Warcry даёт армор и скорость — используйте для инициации', 'Aghanim\'s Shard даёт Storm Hammer дизпелл'],
    earlyGame: 'Фармите с клив-уроном. Storm Hammer + саппорт = убийство на линии. Стакайте лагеря для God\'s Strength фарма.',
    midGame: 'Echo Sabre + BKB + God\'s Strength = тимфайт. Ищите драки, когда ульт готов.',
    lateGame: 'С Daedalus + God\'s Strength ваш клив критами убивает всю команду. Satanic для выживания.',
    coreItems: ['Echo Sabre', 'Black King Bar', 'Daedalus', 'Satanic'],
    situationalItems: ['Blink Dagger', 'Aghanim\'s Scepter', 'Assault Cuirass', 'Silver Edge'],
    tier: 'B',
  },
};

// Tier list data
export type TierRank = 'S' | 'A' | 'B' | 'C' | 'D';

export interface TierHero {
  name: string; // internal name
  localizedName: string;
  position: number;
  tier: TierRank;
  winRate: number;
  pickRate: number;
  trend: 'up' | 'down' | 'stable';
}

export const TIER_LIST: TierHero[] = [
  // S tier
  { name: 'faceless_void', localizedName: 'Faceless Void', position: 1, tier: 'S', winRate: 54.2, pickRate: 18.5, trend: 'up' },
  { name: 'axe', localizedName: 'Axe', position: 3, tier: 'S', winRate: 53.8, pickRate: 22.1, trend: 'stable' },
  { name: 'spectre', localizedName: 'Spectre', position: 1, tier: 'S', winRate: 55.1, pickRate: 12.3, trend: 'up' },
  { name: 'spirit_breaker', localizedName: 'Spirit Breaker', position: 4, tier: 'S', winRate: 54.5, pickRate: 16.8, trend: 'up' },
  { name: 'crystal_maiden', localizedName: 'Crystal Maiden', position: 5, tier: 'S', winRate: 53.2, pickRate: 21.4, trend: 'stable' },
  { name: 'void_spirit', localizedName: 'Void Spirit', position: 2, tier: 'S', winRate: 53.9, pickRate: 17.2, trend: 'stable' },

  // A tier
  { name: 'juggernaut', localizedName: 'Juggernaut', position: 1, tier: 'A', winRate: 52.8, pickRate: 19.3, trend: 'stable' },
  { name: 'phantom_assassin', localizedName: 'Phantom Assassin', position: 1, tier: 'A', winRate: 52.1, pickRate: 24.6, trend: 'down' },
  { name: 'antimage', localizedName: 'Anti-Mage', position: 1, tier: 'A', winRate: 51.5, pickRate: 15.2, trend: 'stable' },
  { name: 'storm_spirit', localizedName: 'Storm Spirit', position: 2, tier: 'A', winRate: 52.4, pickRate: 14.8, trend: 'up' },
  { name: 'invoker', localizedName: 'Invoker', position: 2, tier: 'A', winRate: 51.9, pickRate: 20.1, trend: 'stable' },
  { name: 'nevermore', localizedName: 'Shadow Fiend', position: 2, tier: 'A', winRate: 51.7, pickRate: 16.5, trend: 'down' },
  { name: 'sand_king', localizedName: 'Sand King', position: 3, tier: 'A', winRate: 52.3, pickRate: 15.9, trend: 'stable' },
  { name: 'tidehunter', localizedName: 'Tidehunter', position: 3, tier: 'A', winRate: 52.6, pickRate: 13.4, trend: 'up' },
  { name: 'earthshaker', localizedName: 'Earthshaker', position: 4, tier: 'A', winRate: 52.1, pickRate: 14.2, trend: 'stable' },
  { name: 'lion', localizedName: 'Lion', position: 5, tier: 'A', winRate: 52.0, pickRate: 18.7, trend: 'stable' },
  { name: 'shadow_shaman', localizedName: 'Shadow Shaman', position: 5, tier: 'A', winRate: 52.5, pickRate: 12.8, trend: 'up' },
  { name: 'life_stealer', localizedName: 'Lifestealer', position: 1, tier: 'A', winRate: 52.7, pickRate: 14.1, trend: 'up' },
  { name: 'ursa', localizedName: 'Ursa', position: 1, tier: 'A', winRate: 52.9, pickRate: 13.5, trend: 'stable' },

  // B tier
  { name: 'pudge', localizedName: 'Pudge', position: 4, tier: 'B', winRate: 50.8, pickRate: 28.5, trend: 'stable' },
  { name: 'sniper', localizedName: 'Sniper', position: 1, tier: 'B', winRate: 50.5, pickRate: 22.3, trend: 'down' },
  { name: 'drow_ranger', localizedName: 'Drow Ranger', position: 1, tier: 'B', winRate: 51.2, pickRate: 11.7, trend: 'stable' },
  { name: 'tinker', localizedName: 'Tinker', position: 2, tier: 'B', winRate: 50.1, pickRate: 10.4, trend: 'down' },
  { name: 'sven', localizedName: 'Sven', position: 1, tier: 'B', winRate: 50.9, pickRate: 9.8, trend: 'stable' },
  { name: 'queenofpain', localizedName: 'Queen of Pain', position: 2, tier: 'B', winRate: 50.6, pickRate: 13.2, trend: 'down' },
  { name: 'ember_spirit', localizedName: 'Ember Spirit', position: 2, tier: 'B', winRate: 50.3, pickRate: 11.9, trend: 'stable' },
  { name: 'bristleback', localizedName: 'Bristleback', position: 3, tier: 'B', winRate: 51.1, pickRate: 10.5, trend: 'stable' },
  { name: 'mars', localizedName: 'Mars', position: 3, tier: 'B', winRate: 51.0, pickRate: 12.1, trend: 'down' },
  { name: 'witch_doctor', localizedName: 'Witch Doctor', position: 5, tier: 'B', winRate: 51.4, pickRate: 11.3, trend: 'stable' },
  { name: 'lich', localizedName: 'Lich', position: 5, tier: 'B', winRate: 51.8, pickRate: 10.2, trend: 'up' },
  { name: 'jakiro', localizedName: 'Jakiro', position: 5, tier: 'B', winRate: 51.6, pickRate: 9.1, trend: 'stable' },

  // C tier
  { name: 'phantom_lancer', localizedName: 'Phantom Lancer', position: 1, tier: 'C', winRate: 49.8, pickRate: 8.7, trend: 'down' },
  { name: 'morphling', localizedName: 'Morphling', position: 1, tier: 'C', winRate: 49.5, pickRate: 7.2, trend: 'down' },
  { name: 'terrorblade', localizedName: 'Terrorblade', position: 1, tier: 'C', winRate: 49.2, pickRate: 6.8, trend: 'stable' },
  { name: 'puck', localizedName: 'Puck', position: 2, tier: 'C', winRate: 49.6, pickRate: 10.1, trend: 'down' },
  { name: 'lina', localizedName: 'Lina', position: 2, tier: 'C', winRate: 49.9, pickRate: 11.4, trend: 'stable' },
  { name: 'beastmaster', localizedName: 'Beastmaster', position: 3, tier: 'C', winRate: 49.4, pickRate: 7.5, trend: 'down' },
  { name: 'riki', localizedName: 'Riki', position: 4, tier: 'C', winRate: 50.2, pickRate: 8.9, trend: 'stable' },
  { name: 'warlock', localizedName: 'Warlock', position: 5, tier: 'C', winRate: 50.1, pickRate: 7.3, trend: 'stable' },
  { name: 'venomancer', localizedName: 'Venomancer', position: 5, tier: 'C', winRate: 49.7, pickRate: 6.5, trend: 'down' },

  // D tier
  { name: 'meepo', localizedName: 'Meepo', position: 2, tier: 'D', winRate: 47.5, pickRate: 3.2, trend: 'down' },
  { name: 'broodmother', localizedName: 'Broodmother', position: 2, tier: 'D', winRate: 48.1, pickRate: 2.8, trend: 'down' },
  { name: 'huskar', localizedName: 'Huskar', position: 2, tier: 'D', winRate: 48.5, pickRate: 4.1, trend: 'down' },
  { name: 'necrolyte', localizedName: 'Necrophos', position: 3, tier: 'D', winRate: 48.8, pickRate: 5.2, trend: 'stable' },
];

export function getHeroGuide(localizedName: string): HeroGuide | undefined {
  return HERO_GUIDES[localizedName];
}

export function getHeroTier(heroName: string): TierHero | undefined {
  return TIER_LIST.find(h => h.name === heroName);
}
