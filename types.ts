export type GameScreen =
  | 'title'
  | 'backstory'
  | 'street'
  | 'washing'
  | 'dialogue'
  | 'shop'
  | 'dayend'
  | 'worldmap'
  | 'cruise'
  | 'championship'
  | 'ending';

export type Neighborhood = 'slums' | 'suburbs' | 'highrise';
export type WeatherType = 'clear' | 'rain' | 'snow' | 'blazing';
export type ToolType = 'washer' | 'squeegee' | 'steelwool' | 'brassscraper' | 'agavescrub' | 'waterpole';

export type StainType = 'dust' | 'grime' | 'birdpoop' | 'hardwater' | 'pollen' | 'saltcrust' | 'icebuild';

export type FoodCharacter =
  | 'taco'
  | 'burrito'
  | 'pizza'
  | 'croissant'
  | 'sushi'
  | 'pretzel'
  | 'agave'
  | 'pancake'
  | 'caviar'
  | 'hotdog'
  | 'fries'
  | 'hamburger'
  | 'fish';

export interface Tool {
  id: ToolType;
  name: string;
  emoji: string;
  cost: number;
  durability: number;
  maxDurability: number;
  powerLevel: number;
  canClean: StainType[];
  description: string;
}

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  healthRestore: number;
  salsaBoost: number;
  stabilityBoost: number;
  description: string;
}

export interface NPC {
  id: string;
  name: string;
  character: FoodCharacter;
  neighborhood: Neighborhood | 'cruise' | 'world';
  dialogues: DialogueTree[];
  isJobGiver?: boolean;
  isShopkeeper?: boolean;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  portrait: FoodCharacter;
}

export interface DialogueTree {
  id: string;
  trigger: 'first_meet' | 'job_offer' | 'post_job' | 'story' | 'random';
  storyFlag?: string;
  lines: DialogueLine[];
  reward?: { money?: number; item?: string; flag?: string };
  choices?: { text: string; next: string }[];
}

export interface Job {
  id: string;
  clientName: string;
  clientCharacter: FoodCharacter;
  neighborhood: Neighborhood;
  buildingName: string;
  windowCount: number;
  basePay: number;
  stainTypes: StainType[];
  requiredTool?: ToolType;
  description: string;
  specialMechanic?: 'rain' | 'freeze' | 'heat' | 'rocking';
  unlocked: boolean;
}

export interface WindowCell {
  id: string;
  dirtLevel: number;
  stainType: StainType | null;
  cleaned: boolean;
  streak: boolean;
}

export interface WashSession {
  jobId: string;
  windowIndex: number;
  totalWindows: number;
  cells: WindowCell[][];
  score: number;
  currentTool: ToolType;
  squeegeeAngle: number;
  soapApplied: boolean;
  timeLeft: number;
  combo: number;
  streakLines: number;
}

export interface PlayerState {
  money: number;
  health: number;
  maxHealth: number;
  salsaBoost: number;
  stabilityBoost: number;
  day: number;
  neighborhood: Neighborhood;
  tools: Tool[];
  activeTool: ToolType;
  inventory: FoodItem[];
  completedJobs: string[];
  storyFlags: string[];
  macbookProgress: number;
  macbookPrice: number;
  skillLevels: Record<string, number>;
  trainingCountry: number;
  championshipUnlocked: boolean;
  gameWon: boolean;
}

export interface GameState {
  screen: GameScreen;
  player: PlayerState;
  weather: WeatherType;
  currentJob: Job | null;
  washSession: WashSession | null;
  activeNPC: NPC | null;
  activeDialogue: DialogueTree | null;
  dialogueLineIndex: number;
  notification: string | null;
  shopOpen: boolean;
  dayEndStats: DayEndStats | null;
  previousScreen: GameScreen;
  saveMenuOpen: boolean;
}

export interface SaveSlotMeta {
  slot: number;
  savedAt: string;
  day: number;
  money: number;
  neighborhood: string;
  player: PlayerState;
  weather: WeatherType;
}

export interface DayEndStats {
  jobsCompleted: number;
  moneyEarned: number;
  moneySpent: number;
  averageScore: number;
  specialEvent: string | null;
}

export type GameAction =
  | { type: 'NAVIGATE'; screen: GameScreen }
  | { type: 'START_JOB'; job: Job }
  | { type: 'FINISH_WASH'; score: number; pay: number }
  | { type: 'UPDATE_CELL'; row: number; col: number }
  | { type: 'SET_TOOL'; tool: ToolType }
  | { type: 'SET_SQUEEGEE_ANGLE'; angle: number }
  | { type: 'APPLY_SOAP' }
  | { type: 'ADVANCE_WINDOW'; localScore?: number }
  | { type: 'BUY_ITEM'; item: FoodItem }
  | { type: 'BUY_TOOL'; tool: Tool }
  | { type: 'REPAIR_TOOL'; toolId: ToolType; cost: number }
  | { type: 'EAT_FOOD'; itemId: string }
  | { type: 'START_DIALOGUE'; npc: NPC; dialogueId: string }
  | { type: 'ADVANCE_DIALOGUE' }
  | { type: 'END_DIALOGUE' }
  | { type: 'END_DAY' }
  | { type: 'START_DAY' }
  | { type: 'SHOW_NOTIFICATION'; message: string }
  | { type: 'CLEAR_NOTIFICATION' }
  | { type: 'SET_WEATHER'; weather: WeatherType }
  | { type: 'ADD_STORY_FLAG'; flag: string }
  | { type: 'UNLOCK_NEIGHBORHOOD'; neighborhood: Neighborhood }
  | { type: 'UPDATE_MACBOOK_PRICE' }
  | { type: 'DAMAGE_PLAYER'; amount: number }
  | { type: 'TICK_WASH_TIME' }
  | { type: 'LOAD_GAME'; player: PlayerState; weather: WeatherType }
  | { type: 'TOGGLE_SAVE_MENU' };
