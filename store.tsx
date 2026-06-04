import { createContext, useContext, useReducer, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { GameState, GameAction, PlayerState, WindowCell, WashSession, SaveSlotMeta, WeatherType } from './types';
import { TOOLS, JOBS, MACBOOK_BASE_PRICE, STAIN_COLORS, CLEAN_COLOR } from './constants';

const SAVE_KEY = (slot: number) => `tacowash_save_${slot}`;
const AUTOSAVE_KEY = 'tacowash_autosave';

function writeSave(key: string, state: GameState) {
  const meta: SaveSlotMeta & { isAutoSave?: boolean } = {
    slot: 0,
    savedAt: new Date().toISOString(),
    day: state.player.day,
    money: state.player.money,
    neighborhood: state.player.neighborhood,
    player: state.player,
    weather: state.weather,
  };
  try { localStorage.setItem(key, JSON.stringify(meta)); } catch { /* storage full */ }
}

function readSave(key: string): SaveSlotMeta | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as SaveSlotMeta) : null;
  } catch { return null; }
}

const GRID_ROWS = 8;
const GRID_COLS = 10;

function makeGrid(stainTypes: string[]): WindowCell[][] {
  return Array.from({ length: GRID_ROWS }, (_, r) =>
    Array.from({ length: GRID_COLS }, (_, c) => {
      const isStained = Math.random() < 0.65;
      const stain = isStained ? stainTypes[Math.floor(Math.random() * stainTypes.length)] : null;
      return {
        id: `${r}-${c}`,
        dirtLevel: isStained ? 0.4 + Math.random() * 0.6 : Math.random() * 0.2,
        stainType: stain as WindowCell['stainType'],
        cleaned: false,
        streak: false,
      };
    })
  );
}

const initialPlayer: PlayerState = {
  money: 50,
  health: 100,
  maxHealth: 100,
  salsaBoost: 0,
  stabilityBoost: 0,
  day: 1,
  neighborhood: 'slums',
  tools: [{ ...TOOLS.washer }],
  activeTool: 'washer',
  inventory: [],
  completedJobs: [],
  storyFlags: [],
  macbookProgress: 0,
  macbookPrice: MACBOOK_BASE_PRICE,
  skillLevels: {},
  trainingCountry: 0,
  championshipUnlocked: false,
  gameWon: false,
};

const initialState: GameState = {
  screen: 'title',
  player: initialPlayer,
  weather: 'clear',
  currentJob: null,
  washSession: null,
  activeNPC: null,
  activeDialogue: null,
  dialogueLineIndex: 0,
  notification: null,
  shopOpen: false,
  dayEndStats: null,
  previousScreen: 'street',
  saveMenuOpen: false,
};

function calcCleanScore(session: WashSession): number {
  let cleaned = 0;
  let total = 0;
  let streaks = 0;
  for (const row of session.cells) {
    for (const cell of row) {
      total++;
      if (cell.cleaned) cleaned++;
      if (cell.streak) streaks++;
    }
  }
  const pct = total > 0 ? cleaned / total : 0;
  const streakPenalty = Math.min(streaks * 5, 40);
  return Math.max(0, Math.round(pct * 100) - streakPenalty);
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, screen: action.screen, previousScreen: state.screen };

    case 'START_JOB': {
      const cells = makeGrid(action.job.stainTypes);
      const session: WashSession = {
        jobId: action.job.id,
        windowIndex: 0,
        totalWindows: action.job.windowCount,
        cells,
        score: 0,
        currentTool: state.player.activeTool,
        squeegeeAngle: 90,
        soapApplied: false,
        timeLeft: 120,
        combo: 0,
        streakLines: 0,
      };
      return {
        ...state,
        screen: 'washing',
        currentJob: action.job,
        washSession: session,
        previousScreen: state.screen,
      };
    }

    case 'UPDATE_CELL': {
      if (!state.washSession) return state;
      const { row, col } = action;
      const sess = state.washSession;
      const cell = sess.cells[row][col];
      if (cell.cleaned) return state;

      const tool = state.player.tools.find(t => t.id === sess.currentTool);
      const canClean = tool ? (tool.canClean as string[]).includes(cell.stainType ?? 'dust') : true;

      // Squeegee requires correct angle
      const isSqueegeeing = sess.currentTool === 'squeegee';
      const angleDiff = Math.abs(sess.squeegeeAngle - 90);
      const angleOk = !isSqueegeeing || angleDiff <= 15;

      let newDirt = cell.dirtLevel;
      let cleaned = cell.cleaned;
      let streak = cell.streak;

      if (canClean && sess.soapApplied) {
        newDirt = Math.max(0, cell.dirtLevel - (tool?.powerLevel ?? 1) * 0.25);
        if (newDirt < 0.1) {
          cleaned = true;
          streak = isSqueegeeing && !angleOk;
        }
      } else if (!sess.soapApplied && isSqueegeeing) {
        streak = true;
      }

      const newCells = sess.cells.map((r, ri) =>
        ri === row ? r.map((c, ci) => ci === col ? { ...c, dirtLevel: newDirt, cleaned, streak } : c) : r
      );

      // Degrade tool durability slightly
      const newTools = state.player.tools.map(t =>
        t.id === sess.currentTool ? { ...t, durability: Math.max(0, t.durability - 0.5) } : t
      );

      return {
        ...state,
        washSession: { ...sess, cells: newCells },
        player: { ...state.player, tools: newTools },
      };
    }

    case 'SET_TOOL':
      return state.washSession
        ? { ...state, washSession: { ...state.washSession, currentTool: action.tool }, player: { ...state.player, activeTool: action.tool } }
        : { ...state, player: { ...state.player, activeTool: action.tool } };

    case 'SET_SQUEEGEE_ANGLE':
      return state.washSession
        ? { ...state, washSession: { ...state.washSession, squeegeeAngle: action.angle } }
        : state;

    case 'APPLY_SOAP':
      return state.washSession
        ? { ...state, washSession: { ...state.washSession, soapApplied: true } }
        : state;

    case 'ADVANCE_WINDOW': {
      if (!state.washSession || !state.currentJob) return state;
      const sess = state.washSession;
      const windowScore = action.localScore ?? calcCleanScore(sess);
      const nextIndex = sess.windowIndex + 1;

      if (nextIndex >= sess.totalWindows) {
        const totalScore = Math.round((sess.score + windowScore) / sess.totalWindows);
        const pay = Math.round(state.currentJob.basePay * (totalScore / 100) * 1.5);
        return {
          ...state,
          washSession: { ...sess, score: sess.score + windowScore },
          screen: 'street',
          player: {
            ...state.player,
            money: state.player.money + pay,
            completedJobs: [...state.player.completedJobs, state.currentJob.id],
          },
          notification: `Job done! +$${pay} (${totalScore}% clean)`,
        };
      }

      const newCells = makeGrid(state.currentJob.stainTypes);
      return {
        ...state,
        washSession: {
          ...sess,
          windowIndex: nextIndex,
          cells: newCells,
          soapApplied: false,
          score: sess.score + windowScore,
          squeegeeAngle: 90,
        },
      };
    }

    case 'FINISH_WASH': {
      if (!state.currentJob) return state;
      return {
        ...state,
        screen: 'street',
        player: {
          ...state.player,
          money: state.player.money + action.pay,
          completedJobs: [...state.player.completedJobs, state.currentJob.id],
        },
        currentJob: null,
        washSession: null,
        notification: `Job complete! +$${action.pay} (score: ${action.score}%)`,
      };
    }

    case 'BUY_ITEM': {
      const item = action.item;
      if (state.player.money < item.cost) return state;
      return {
        ...state,
        player: {
          ...state.player,
          money: state.player.money - item.cost,
          inventory: [...state.player.inventory, item],
        },
        notification: `Bought ${item.name}!`,
      };
    }

    case 'BUY_TOOL': {
      const tool = action.tool;
      if (state.player.money < tool.cost) return state;
      const alreadyOwns = state.player.tools.some(t => t.id === tool.id);
      if (alreadyOwns) return state;
      return {
        ...state,
        player: {
          ...state.player,
          money: state.player.money - tool.cost,
          tools: [...state.player.tools, { ...tool }],
        },
        notification: `Got ${tool.name}!`,
      };
    }

    case 'REPAIR_TOOL': {
      if (state.player.money < action.cost) return state;
      return {
        ...state,
        player: {
          ...state.player,
          money: state.player.money - action.cost,
          tools: state.player.tools.map(t =>
            t.id === action.toolId ? { ...t, durability: t.maxDurability } : t
          ),
        },
        notification: 'Tool repaired!',
      };
    }

    case 'EAT_FOOD': {
      const itemIndex = state.player.inventory.findIndex(i => i.id === action.itemId);
      if (itemIndex === -1) return state;
      const item = state.player.inventory[itemIndex];
      const newInv = [...state.player.inventory];
      newInv.splice(itemIndex, 1);
      return {
        ...state,
        player: {
          ...state.player,
          inventory: newInv,
          health: Math.min(state.player.maxHealth, state.player.health + item.healthRestore),
          salsaBoost: Math.min(100, state.player.salsaBoost + item.salsaBoost),
          stabilityBoost: Math.min(100, state.player.stabilityBoost + item.stabilityBoost),
        },
        notification: `Ate ${item.name}! +${item.healthRestore}HP`,
      };
    }

    case 'START_DIALOGUE':
      return {
        ...state,
        activeNPC: action.npc,
        activeDialogue: action.npc.dialogues.find(d => d.id === action.dialogueId) ?? null,
        dialogueLineIndex: 0,
        screen: 'dialogue',
        previousScreen: state.screen,
      };

    case 'ADVANCE_DIALOGUE': {
      if (!state.activeDialogue) return state;
      const nextIndex = state.dialogueLineIndex + 1;
      if (nextIndex >= state.activeDialogue.lines.length) {
        const reward = state.activeDialogue.reward;
        let newState = { ...state, screen: state.previousScreen as GameState['screen'], activeNPC: null, activeDialogue: null, dialogueLineIndex: 0 };
        if (reward?.flag) {
          newState = { ...newState, player: { ...newState.player, storyFlags: [...newState.player.storyFlags, reward.flag] } };
        }
        if (reward?.money) {
          newState = { ...newState, player: { ...newState.player, money: newState.player.money + reward.money } };
        }
        return newState;
      }
      return { ...state, dialogueLineIndex: nextIndex };
    }

    case 'END_DIALOGUE':
      return { ...state, screen: state.previousScreen as GameState['screen'], activeNPC: null, activeDialogue: null, dialogueLineIndex: 0 };

    case 'END_DAY': {
      const jobsCount = state.player.completedJobs.length;
      const moneyEarned = state.player.money - 50; // rough
      return {
        ...state,
        screen: 'dayend',
        dayEndStats: {
          jobsCompleted: jobsCount,
          moneyEarned: Math.max(0, moneyEarned),
          moneySpent: 0,
          averageScore: 75,
          specialEvent: state.weather !== 'clear' ? `Weather: ${state.weather}` : null,
        },
      };
    }

    case 'START_DAY': {
      const dailyCost = 15;
      const macbookPrice = state.player.money >= state.player.macbookPrice ? state.player.macbookPrice : state.player.macbookPrice;
      const hasBoughtMacbook = state.player.money >= macbookPrice && state.player.storyFlags.includes('won_championship');
      return {
        ...state,
        screen: hasBoughtMacbook ? 'ending' : 'street',
        player: {
          ...state.player,
          day: state.player.day + 1,
          money: Math.max(0, state.player.money - dailyCost),
          salsaBoost: 0,
          stabilityBoost: 0,
          gameWon: hasBoughtMacbook,
        },
        weather: (['clear', 'clear', 'clear', 'rain', 'blazing', 'snow'] as const)[Math.floor(Math.random() * 6)],
        dayEndStats: null,
      };
    }

    case 'SHOW_NOTIFICATION':
      return { ...state, notification: action.message };

    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };

    case 'SET_WEATHER':
      return { ...state, weather: action.weather };

    case 'ADD_STORY_FLAG':
      return state.player.storyFlags.includes(action.flag)
        ? state
        : { ...state, player: { ...state.player, storyFlags: [...state.player.storyFlags, action.flag] } };

    case 'UPDATE_MACBOOK_PRICE': {
      const fluctuation = (Math.random() - 0.5) * 200;
      return { ...state, player: { ...state.player, macbookPrice: Math.max(1800, Math.min(3500, Math.round(state.player.macbookPrice + fluctuation))) } };
    }

    case 'DAMAGE_PLAYER':
      return { ...state, player: { ...state.player, health: Math.max(0, state.player.health - action.amount) } };

    case 'TICK_WASH_TIME':
      return state.washSession
        ? { ...state, washSession: { ...state.washSession, timeLeft: Math.max(0, state.washSession.timeLeft - 1) } }
        : state;

    case 'LOAD_GAME':
      return {
        ...initialState,
        screen: 'street',
        player: action.player,
        weather: action.weather,
        saveMenuOpen: false,
      };

    case 'TOGGLE_SAVE_MENU':
      return { ...state, saveMenuOpen: !state.saveMenuOpen };

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  navigate: (screen: GameState['screen']) => void;
  showNotif: (msg: string) => void;
  saveGame: (slot: number) => void;
  loadGame: (slot: number) => boolean;
  loadAutoSave: () => boolean;
  getSaveSlots: () => (SaveSlotMeta | null)[];
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Stable ref so save callbacks always read current state without re-creating
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const navigate = useCallback((screen: GameState['screen']) => {
    dispatch({ type: 'NAVIGATE', screen });
  }, []);

  const showNotif = useCallback((message: string) => {
    dispatch({ type: 'SHOW_NOTIFICATION', message });
    setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 2500);
  }, []);

  const saveGame = useCallback((slot: number) => {
    writeSave(SAVE_KEY(slot), stateRef.current);
    dispatch({ type: 'SHOW_NOTIFICATION', message: `💾 Game saved to slot ${slot + 1}` });
    setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 2500);
  }, []);

  const loadGame = useCallback((slot: number): boolean => {
    const meta = readSave(SAVE_KEY(slot));
    if (!meta) return false;
    dispatch({ type: 'LOAD_GAME', player: meta.player, weather: meta.weather as WeatherType });
    return true;
  }, []);

  const loadAutoSave = useCallback((): boolean => {
    const meta = readSave(AUTOSAVE_KEY);
    if (!meta) return false;
    dispatch({ type: 'LOAD_GAME', player: meta.player, weather: meta.weather as WeatherType });
    return true;
  }, []);

  const getSaveSlots = useCallback((): (SaveSlotMeta | null)[] => {
    return [0, 1, 2].map(slot => readSave(SAVE_KEY(slot)));
  }, []);

  // Auto-save whenever the day ends
  useEffect(() => {
    if (state.screen === 'dayend') {
      writeSave(AUTOSAVE_KEY, state);
    }
  }, [state.screen]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GameContext.Provider value={{ state, dispatch, navigate, showNotif, saveGame, loadGame, loadAutoSave, getSaveSlots }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export { STAIN_COLORS, CLEAN_COLOR };
