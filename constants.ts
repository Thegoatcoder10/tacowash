import type { Tool, FoodItem, Job, NPC, FoodCharacter } from './types';

export const MACBOOK_BASE_PRICE = 2499;

export const TOOLS: Record<string, Tool> = {
  washer: {
    id: 'washer',
    name: 'Microfiber Washer',
    emoji: '🧽',
    cost: 0,
    durability: 100,
    maxDurability: 100,
    powerLevel: 1,
    canClean: ['dust', 'pollen'],
    description: 'Basic starter washer. Handles light dust and pollen.',
  },
  squeegee: {
    id: 'squeegee',
    name: 'Pivot Squeegee',
    emoji: '🪟',
    cost: 45,
    durability: 80,
    maxDurability: 80,
    powerLevel: 2,
    canClean: ['dust', 'pollen', 'grime'],
    description: 'The pro standard. Must use at exactly 90° for streak-free results.',
  },
  steelwool: {
    id: 'steelwool',
    name: 'Quad-Zero Steel Wool',
    emoji: '🧹',
    cost: 120,
    durability: 50,
    maxDurability: 50,
    powerLevel: 3,
    canClean: ['dust', 'pollen', 'grime', 'birdpoop', 'hardwater'],
    description: 'For serious grime. Wears down fast but cuts through anything.',
  },
  brassscraper: {
    id: 'brassscraper',
    name: 'Brass Razor Scraper',
    emoji: '🔪',
    cost: 200,
    durability: 60,
    maxDurability: 60,
    powerLevel: 4,
    canClean: ['birdpoop', 'hardwater', 'saltcrust'],
    description: 'Precision tool for stubborn deposits. Technique required.',
  },
  agavescrub: {
    id: 'agavescrub',
    name: 'Agave Natural Scrub',
    emoji: '🌵',
    cost: 350,
    durability: 70,
    maxDurability: 70,
    powerLevel: 3,
    canClean: ['dust', 'pollen', 'grime', 'hardwater', 'saltcrust'],
    description: 'Mexican technique. Natural agave fibers + polish in one pass.',
  },
  waterpole: {
    id: 'waterpole',
    name: 'Carbon Water-Fed Pole',
    emoji: '🚿',
    cost: 800,
    durability: 120,
    maxDurability: 120,
    powerLevel: 5,
    canClean: ['dust', 'pollen', 'grime', 'birdpoop', 'hardwater', 'saltcrust', 'icebuild'],
    description: 'German engineering. High-reach beast. Handles everything.',
  },
};

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: 'taco_snack',
    name: 'Street Taco',
    emoji: '🌮',
    cost: 5,
    healthRestore: 20,
    salsaBoost: 0,
    stabilityBoost: 0,
    description: 'Home comfort. Restores health.',
  },
  {
    id: 'salsa_hot',
    name: 'Blazing Salsa',
    emoji: '🌶️',
    cost: 8,
    healthRestore: 5,
    salsaBoost: 30,
    stabilityBoost: 0,
    description: 'Spicy! Boosts movement speed for the day.',
  },
  {
    id: 'guacamole',
    name: 'Guacamole',
    emoji: '🥑',
    cost: 10,
    healthRestore: 15,
    salsaBoost: 0,
    stabilityBoost: 25,
    description: 'Mild and steady. Boosts scaffold stability.',
  },
  {
    id: 'burrito_wrap',
    name: 'Power Burrito',
    emoji: '🌯',
    cost: 15,
    healthRestore: 40,
    salsaBoost: 10,
    stabilityBoost: 10,
    description: 'Full meal. Big health restore + balanced boosts.',
  },
  {
    id: 'energy_drink',
    name: 'Neon Energy',
    emoji: '🥤',
    cost: 12,
    healthRestore: 0,
    salsaBoost: 50,
    stabilityBoost: 0,
    description: 'MAX speed mode. Very unstable on high-rises.',
  },
  {
    id: 'matcha',
    name: 'Zen Matcha',
    emoji: '🍵',
    cost: 18,
    healthRestore: 10,
    salsaBoost: 0,
    stabilityBoost: 50,
    description: 'Perfect for precision work. Calms the mind.',
  },
];

export const JOBS: Job[] = [
  // SLUMS
  {
    id: 'grubby_diner',
    clientName: 'Pancake Pete',
    clientCharacter: 'pancake' as FoodCharacter,
    neighborhood: 'slums',
    buildingName: "Pete's All-Night Diner",
    windowCount: 2,
    basePay: 25,
    stainTypes: ['dust', 'pollen'],
    description: 'Basic diner windows. Easy starter job.',
    unlocked: true,
  },
  {
    id: 'corner_store',
    clientName: 'Hotdog Stan',
    clientCharacter: 'hotdog' as FoodCharacter,
    neighborhood: 'slums',
    buildingName: 'Stan\'s Corner Mart',
    windowCount: 3,
    basePay: 40,
    stainTypes: ['dust', 'grime'],
    requiredTool: 'squeegee',
    description: 'Greasy store front. Needs a squeegee.',
    unlocked: true,
  },
  {
    id: 'fish_n_chips',
    clientName: 'Fish McDip',
    clientCharacter: 'fish' as FoodCharacter,
    neighborhood: 'slums',
    buildingName: 'McDip\'s Fish & Chips',
    windowCount: 3,
    basePay: 55,
    stainTypes: ['grime', 'birdpoop'],
    requiredTool: 'steelwool',
    description: 'Bird situation is... considerable.',
    unlocked: false,
  },
  // SUBURBS
  {
    id: 'suburb_mansion',
    clientName: 'Caviar Claudette',
    clientCharacter: 'caviar' as FoodCharacter,
    neighborhood: 'suburbs',
    buildingName: 'Chez Claudette',
    windowCount: 5,
    basePay: 120,
    stainTypes: ['hardwater', 'grime'],
    requiredTool: 'brassscraper',
    description: 'High-end client. She WILL use a flashlight to inspect.',
    unlocked: false,
  },
  {
    id: 'suburb_bakery',
    clientName: 'Croissant Celeste',
    clientCharacter: 'croissant' as FoodCharacter,
    neighborhood: 'suburbs',
    buildingName: 'Celeste Patisserie',
    windowCount: 4,
    basePay: 90,
    stainTypes: ['pollen', 'grime', 'hardwater'],
    description: 'Fancy bakery. Steam cleaning optional but rewarded.',
    unlocked: false,
  },
  // HIGH-RISE
  {
    id: 'skyscraper_1',
    clientName: 'Sushi Sensei',
    clientCharacter: 'sushi' as FoodCharacter,
    neighborhood: 'highrise',
    buildingName: 'Zen Tower',
    windowCount: 8,
    basePay: 350,
    stainTypes: ['grime', 'hardwater', 'birdpoop'],
    requiredTool: 'agavescrub',
    description: 'Tall building. Master technique required. Zen score bonus.',
    unlocked: false,
  },
  {
    id: 'burrito_tower',
    clientName: 'Burrito King',
    clientCharacter: 'burrito' as FoodCharacter,
    neighborhood: 'highrise',
    buildingName: 'Burrito Industries HQ',
    windowCount: 10,
    basePay: 0,
    stainTypes: ['grime', 'hardwater', 'birdpoop', 'saltcrust'],
    description: 'THE confrontation. He cheats. You lose first time.',
    unlocked: false,
  },
];

export const NPCS: NPC[] = [
  {
    id: 'pancake_pete',
    name: 'Pancake Pete',
    character: 'pancake',
    neighborhood: 'slums',
    isJobGiver: true,
    isShopkeeper: false,
    dialogues: [
      {
        id: 'pete_first',
        trigger: 'first_meet',
        lines: [
          { speaker: 'Pancake Pete', text: "Well well well... a taco with a squeegee. Haven't seen THAT before.", portrait: 'pancake' },
          { speaker: 'Pancake Pete', text: "My diner windows are a DISASTER. Bird situation got outta hand last Tuesday.", portrait: 'pancake' },
          { speaker: 'You (Taco)', text: "I can handle it. Just need to earn enough for my MacBook Pro.", portrait: 'taco' },
          { speaker: 'Pancake Pete', text: "Ha! A taco with DREAMS. I like that. $25 for the front windows. Deal?", portrait: 'pancake' },
        ],
        reward: { flag: 'met_pete' },
      },
      {
        id: 'pete_random_1',
        trigger: 'random',
        lines: [
          { speaker: 'Pancake Pete', text: "Word on the street is the Burrito syndicate's buying up property in the Suburbs.", portrait: 'pancake' },
          { speaker: 'Pancake Pete', text: "Those pyromaniac freaks. They burned down three taco trucks last year.", portrait: 'pancake' },
          { speaker: 'You (Taco)', text: "...that's what they did to my family.", portrait: 'taco' },
          { speaker: 'Pancake Pete', text: "Oh kid... I'm sorry. You gotta be careful. The Burrito King is dangerous.", portrait: 'pancake' },
        ],
        storyFlag: 'met_pete',
      },
    ],
  },
  {
    id: 'hotdog_stan',
    name: 'Hotdog Stan',
    character: 'hotdog',
    neighborhood: 'slums',
    isJobGiver: true,
    dialogues: [
      {
        id: 'stan_first',
        trigger: 'first_meet',
        lines: [
          { speaker: 'Hotdog Stan', text: "Hey! New cleaner! You got a squeegee license?", portrait: 'hotdog' },
          { speaker: 'You (Taco)', text: "A... squeegee license?", portrait: 'taco' },
          { speaker: 'Hotdog Stan', text: "Ha! Relax, just messin'. Nobody needs a license here in the slums.", portrait: 'hotdog' },
          { speaker: 'Hotdog Stan', text: "But I got grime on my windows thick as mustard. You up for it?", portrait: 'hotdog' },
        ],
        reward: { flag: 'met_stan' },
      },
    ],
  },
  {
    id: 'caviar_claudette',
    name: 'Caviar Claudette',
    character: 'caviar',
    neighborhood: 'suburbs',
    isJobGiver: true,
    dialogues: [
      {
        id: 'claudette_first',
        trigger: 'first_meet',
        lines: [
          { speaker: 'Caviar Claudette', text: "You must be the new window person. Let me be... direct.", portrait: 'caviar' },
          { speaker: 'Caviar Claudette', text: "I will inspect every pane with my LED flashlight at three different angles.", portrait: 'caviar' },
          { speaker: 'Caviar Claudette', text: "One streak. ONE. And you don't get a single cent. Are we clear?", portrait: 'taco' },
          { speaker: 'You (Taco)', text: "*deep breath* Crystal clear.", portrait: 'taco' },
        ],
        reward: { flag: 'met_claudette' },
      },
    ],
  },
  {
    id: 'burrito_king',
    name: 'Burrito King',
    character: 'burrito',
    neighborhood: 'highrise',
    dialogues: [
      {
        id: 'burrito_confrontation',
        trigger: 'story',
        storyFlag: 'reached_highrise',
        lines: [
          { speaker: 'Burrito King', text: "Well. The little taco actually made it up here.", portrait: 'burrito' },
          { speaker: 'Burrito King', text: "I heard about your family's truck. Shame what happened to it.", portrait: 'burrito' },
          { speaker: 'You (Taco)', text: "YOU happened to it. You BURNED IT DOWN!", portrait: 'taco' },
          { speaker: 'Burrito King', text: "Prove it. Or better yet — beat me in a wash-off. You can't.", portrait: 'burrito' },
          { speaker: 'Burrito King', text: "If you win, I'll confess everything. If you LOSE... you leave this city forever.", portrait: 'burrito' },
        ],
        reward: { flag: 'challenged_by_burrito' },
      },
      {
        id: 'burrito_after_loss',
        trigger: 'story',
        storyFlag: 'lost_to_burrito',
        lines: [
          { speaker: 'Burrito King', text: "Hahaha. That's what I thought. See you never, little taco.", portrait: 'burrito' },
          { speaker: 'You (Taco)', text: "This isn't over. I'm going to train. I'll come back.", portrait: 'taco' },
          { speaker: 'Burrito King', text: "Sure you will. Take a cruise. Clear your head. You'll need it.", portrait: 'burrito' },
        ],
        reward: { flag: 'cruise_unlocked' },
      },
    ],
  },
  {
    id: 'pizza_pete_italy',
    name: 'Pizza Maestro',
    character: 'pizza',
    neighborhood: 'world',
    dialogues: [
      {
        id: 'italy_training',
        trigger: 'first_meet',
        lines: [
          { speaker: 'Pizza Maestro', text: "Ah, the young taco seeks wisdom! In Italia, we wash with PASSION!", portrait: 'pizza' },
          { speaker: 'Pizza Maestro', text: "The fan method — you do not push the water. You GUIDE it. Like pizza dough.", portrait: 'pizza' },
          { speaker: 'Pizza Maestro', text: "Watch my hand. The arc must be smooth. Never stop mid-stroke. NEVER!", portrait: 'pizza' },
          { speaker: 'You (Taco)', text: "The fan technique... I think I'm starting to understand.", portrait: 'taco' },
          { speaker: 'Pizza Maestro', text: "Bravissimo! The Fan Master perk is yours. Buona fortuna, piccolo taco!", portrait: 'pizza' },
        ],
        reward: { flag: 'trained_italy', money: 50 },
      },
    ],
  },
  {
    id: 'sushi_sensei_japan',
    name: 'Sushi Sensei',
    character: 'sushi',
    neighborhood: 'world',
    dialogues: [
      {
        id: 'japan_training',
        trigger: 'first_meet',
        lines: [
          { speaker: 'Sushi Sensei', text: "The taco comes to Japan. Good. Sit.", portrait: 'sushi' },
          { speaker: 'Sushi Sensei', text: "The window does not fight you. You and the window are one.", portrait: 'sushi' },
          { speaker: 'Sushi Sensei', text: "Breathe. Time slows. The corner... is only an obstacle in your mind.", portrait: 'sushi' },
          { speaker: 'You (Taco)', text: "...I can feel it. Everything slowed down. I can see every stain clearly.", portrait: 'taco' },
          { speaker: 'Sushi Sensei', text: "ZEN FOCUS unlocked. Use it wisely.", portrait: 'sushi' },
        ],
        reward: { flag: 'trained_japan', money: 50 },
      },
    ],
  },
];

export const NEIGHBORHOODS = {
  slums: {
    name: 'The Slums',
    subtitle: 'Where every taco starts',
    color: '#ff8c00',
    unlocked: true,
    minPay: 25,
    maxPay: 80,
  },
  suburbs: {
    name: 'The Suburbs',
    subtitle: 'Better clients, bigger windows',
    color: '#00aaff',
    unlocked: false,
    minPay: 80,
    maxPay: 200,
  },
  highrise: {
    name: 'The High-Rise District',
    subtitle: 'Skyscrapers & your destiny',
    color: '#bf5fff',
    unlocked: false,
    minPay: 200,
    maxPay: 500,
  },
};

export const TRAINING_COUNTRIES = [
  { name: 'Italy', flag: '🇮🇹', emoji: '🍕', teacher: 'Pizza Maestro', skill: 'Fan Technique', perk: 'Fan Master — arc strokes deal 2x clean', color: '#009246', npcId: 'pizza_pete_italy', flag_key: 'trained_italy' },
  { name: 'France', flag: '🇫🇷', emoji: '🥐', teacher: 'Croissant Celeste', skill: 'Steam Cleaning', perk: 'Steam Surge — heat cleans hardwater 3x faster', color: '#002395', npcId: 'croissant_france', flag_key: 'trained_france' },
  { name: 'Japan', flag: '🇯🇵', emoji: '🍣', teacher: 'Sushi Sensei', skill: 'Zen Squeegee', perk: 'Zen Focus — time slows for precise corners', color: '#BC002D', npcId: 'sushi_sensei_japan', flag_key: 'trained_japan' },
  { name: 'Mexico', flag: '🇲🇽', emoji: '🌵', teacher: 'Agave Elder', skill: 'Natural Polish', perk: 'Heat Resist — no stamina loss in blazing heat', color: '#006847', npcId: 'agave_mexico', flag_key: 'trained_mexico' },
  { name: 'Germany', flag: '🇩🇪', emoji: '🥨', teacher: 'Pretzel Fritz', skill: 'Telescopic Poles', perk: 'Pole Expert — water-fed pole moves 50% faster', color: '#000000', npcId: 'pretzel_germany', flag_key: 'trained_germany' },
  { name: 'Greece', flag: '🇬🇷', emoji: '🫒', teacher: 'Olive the Greek', skill: 'Olive Oil Buff', perk: 'Streak Shield — 20% chance to auto-fix streaks', color: '#0D5EAF', npcId: 'olive_greece', flag_key: 'trained_greece' },
  { name: 'Canada', flag: '🇨🇦', emoji: '🍁', teacher: 'Maple McFreeze', skill: 'Ice Water Poles', perk: 'Cryo Master — works in freezing temps with no slowdown', color: '#FF0000', npcId: 'maple_canada', flag_key: 'trained_canada' },
];

export const CHAMPIONSHIP_COMPETITORS = [
  { name: 'Hamburger Hans', emoji: '🍔', rank: 4, specialty: 'Speed' },
  { name: 'Hotdog Heather', emoji: '🌭', rank: 3, specialty: 'Precision' },
  { name: 'French Fry François', emoji: '🍟', rank: 2, specialty: 'Technique' },
  { name: 'Burrito King', emoji: '🌯', rank: 1, specialty: 'Everything' },
];

export const STAIN_COLORS: Record<string, string> = {
  dust: 'rgba(180,160,100,0.6)',
  grime: 'rgba(100,80,40,0.75)',
  birdpoop: 'rgba(200,200,180,0.85)',
  hardwater: 'rgba(150,200,220,0.7)',
  pollen: 'rgba(230,200,50,0.65)',
  saltcrust: 'rgba(220,220,240,0.8)',
  icebuild: 'rgba(160,220,255,0.75)',
};

export const CLEAN_COLOR = 'rgba(180,220,255,0.08)';
export const GLASS_COLOR = 'rgba(100,160,200,0.12)';

export const DAILY_COSTS = {
  box: 0,
  shared_room: 15,
  apartment: 40,
};

export const SQUEEGEE_PERFECT_ANGLE = 90;
export const SQUEEGEE_TOLERANCE = 15;
