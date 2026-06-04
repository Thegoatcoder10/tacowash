import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/game/store';
import { JOBS, NPCS, NEIGHBORHOODS } from '@/game/constants';
import type { Job, NPC } from '@/game/types';

interface Building {
  id: string;
  x: number;
  width: number;
  height: number;
  floors: number;
  color: string;
  accentColor: string;
  label: string;
  job?: Job;
  npc?: NPC;
  hasWindows: boolean;
  // Pre-computed stable window states (lit/dirty) — no Math.random() in render
  windowLit: boolean[];
  windowDirty: boolean[];
}

// Deterministic pseudo-random based on seed — no Math.random() in render
function seededBool(seed: number, threshold = 0.5): boolean {
  return ((Math.sin(seed * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1 > threshold;
}

function buildBuildingList(neighborhood: string, jobs: Job[], npcs: NPC[]): Building[] {
  // Filter NPCs for this neighborhood once so indexed assignment is correct
  const localNPCs = npcs.filter(n => n.neighborhood === neighborhood);
  const configs = {
    slums: [
      { label: "Pete's Diner", color: '#1a0e08', accent: '#ff8c00', width: 120, height: 160, floors: 3 },
      { label: "Stan's Mart", color: '#080f1a', accent: '#00aaff', width: 100, height: 140, floors: 2 },
      { label: "McDip's Fish", color: '#0a0a14', accent: '#bf5fff', width: 110, height: 150, floors: 3 },
      { label: 'Pawn Shop', color: '#141008', accent: '#ffd700', width: 80, height: 110, floors: 2 },
      { label: 'Laundromat', color: '#081814', accent: '#00ff88', width: 90, height: 120, floors: 2 },
    ],
    suburbs: [
      { label: 'Chez Claudette', color: '#0d1520', accent: '#00aaff', width: 150, height: 200, floors: 4 },
      { label: 'Celeste Patisserie', color: '#140d1a', accent: '#bf5fff', width: 130, height: 180, floors: 3 },
      { label: 'The Boutique', color: '#0a1408', accent: '#00ff88', width: 120, height: 170, floors: 3 },
      { label: 'Vitamin Shoppe', color: '#140808', accent: '#ff8c00', width: 110, height: 150, floors: 3 },
    ],
    highrise: [
      { label: 'Zen Tower', color: '#08101a', accent: '#00e5cc', width: 160, height: 340, floors: 8 },
      { label: 'Burrito HQ', color: '#140808', accent: '#ff3333', width: 180, height: 380, floors: 10 },
      { label: 'Crystal Corp', color: '#080d14', accent: '#bf5fff', width: 150, height: 320, floors: 8 },
      { label: 'The Shard', color: '#0a0a14', accent: '#ffd700', width: 140, height: 360, floors: 9 },
    ],
  }[neighborhood] ?? [];

  let x = 60;
  return configs.map((c, i) => {
    const job = jobs[i];
    const npc = localNPCs[i]; // each building gets its own NPC by index
    const bx = x;
    x += c.width + 40;
    const windowCols = Math.floor(c.width / 28);
    const windowCount = c.floors * windowCols;
    return {
      id: `building-${i}`,
      x: bx,
      width: c.width,
      height: c.height,
      floors: c.floors,
      color: c.color,
      accentColor: c.accent,
      label: c.label,
      job,
      npc,
      hasWindows: true,
      // Stable deterministic booleans — seed based on building+window index
      windowLit:  Array.from({ length: windowCount }, (_, w) => seededBool(i * 1000 + w, 0.4)),
      windowDirty: Array.from({ length: windowCount }, (_, w) => seededBool(i * 1000 + w + 0.5, 0.5)),
    };
  });
}

interface NPCCharacterProps {
  npc: NPC;
  x: number;
  onClick: () => void;
}

function NPCCharacter({ npc, x, onClick }: NPCCharacterProps) {
  const emojis: Record<string, string> = {
    pancake: '🥞', hotdog: '🌭', caviar: '🫧', burrito: '🌯',
    pizza: '🍕', sushi: '🍣', pretzel: '🥨', croissant: '🥐',
    taco: '🌮', fish: '🐟', hamburger: '🍔', fries: '🍟', agave: '🌵',
  };

  return (
    <div
      className="absolute cursor-pointer"
      style={{ left: x, bottom: 40, transform: 'translateX(-50%)', zIndex: 10 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Talk to ${npc.name}`}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div className="anim-walk flex flex-col items-center">
        <div
          className="font-pixel text-center mb-1 px-2 py-0.5"
          style={{ fontSize: 8, color: '#00ff88', background: 'rgba(0,0,0,0.7)', border: '1px solid #00ff88', whiteSpace: 'nowrap' }}
        >
          {npc.name}
        </div>
        <div
          style={{ fontSize: 36, filter: 'drop-shadow(0 2px 8px rgba(0,255,136,0.4))' }}
        >
          {emojis[npc.character] ?? '🍔'}
        </div>
        <div
          className="font-pixel"
          style={{ fontSize: 8, color: '#ffd700', background: 'rgba(0,0,0,0.7)', padding: '2px 4px', border: '1px solid #1e3a5f' }}
        >
          [TALK]
        </div>
      </div>
    </div>
  );
}

interface BuildingComponentProps {
  building: Building;
  playerX: number;
  onJobClick: (job: Job) => void;
  onNPCClick: (npc: NPC) => void;
  weatherEffect: string;
}

function BuildingComponent({ building: b, playerX, onJobClick, onNPCClick, weatherEffect }: BuildingComponentProps) {
  const isNear = Math.abs(playerX - (b.x + b.width / 2)) < 120;
  const windowRows = b.floors;
  const windowCols = Math.floor(b.width / 28);

  return (
    <div className="absolute" style={{ left: b.x, bottom: 40, width: b.width }}>
      {/* Building body */}
      <div
        style={{
          width: b.width,
          height: b.height,
          background: b.color,
          borderLeft: `3px solid ${b.accentColor}33`,
          borderRight: `3px solid ${b.accentColor}11`,
          borderTop: `3px solid ${b.accentColor}55`,
          position: 'relative',
          boxShadow: `0 0 20px ${b.accentColor}22, inset 0 0 30px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Windows grid */}
        <div
          style={{
            position: 'absolute',
            inset: '12px 8px 8px 8px',
            display: 'grid',
            gridTemplateColumns: `repeat(${windowCols}, 1fr)`,
            gridTemplateRows: `repeat(${windowRows}, 1fr)`,
            gap: 4,
          }}
        >
          {Array.from({ length: windowRows * windowCols }, (_, i) => {
            const isLit = b.windowLit[i] ?? true;
            const hasDirt = b.windowDirty[i] ?? false;
            return (
              <div
                key={i}
                style={{
                  background: isLit ? `${b.accentColor}55` : 'rgba(0,0,0,0.6)',
                  border: `1px solid ${b.accentColor}33`,
                  position: 'relative',
                  cursor: isNear && b.job ? 'pointer' : 'default',
                }}
                onClick={isNear && b.job ? () => onJobClick(b.job!) : undefined}
              >
                {hasDirt && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: weatherEffect === 'rain' ? 'rgba(100,150,200,0.3)' : 'rgba(150,120,60,0.25)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Weather effects on building */}
        {weatherEffect === 'rain' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,100,200,0.1), transparent)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Job button */}
      {b.job && isNear && (
        <button
          className="pixel-btn pixel-btn-yellow absolute font-pixel"
          style={{ fontSize: 9, padding: '4px 8px', bottom: -35, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', zIndex: 20 }}
          onClick={() => onJobClick(b.job!)}
          aria-label={`Take job at ${b.label}`}
        >
          💼 TAKE JOB ${b.job.basePay}
        </button>
      )}

      {/* Building label */}
      <div
        className="font-pixel text-center absolute"
        style={{ fontSize: 8, color: b.accentColor, bottom: -20, left: 0, right: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {b.label}
      </div>
    </div>
  );
}

export default function StreetScene() {
  const { state, dispatch, navigate } = useGame();
  const { player, weather } = state;
  const [playerX, setPlayerX] = useState(200);
  const [moving, setMoving] = useState<'left' | 'right' | null>(null);
  const [frame, setFrame] = useState(0);
  const [rainDrops] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      duration: 0.6 + Math.random() * 0.4,
      delay: Math.random() * 1,
    }))
  );

  const neighborhoodData = NEIGHBORHOODS[player.neighborhood];
  const neighborhoodJobs = JOBS.filter(j => j.neighborhood === player.neighborhood);
  const neighborhoodNPCs = NPCS.filter(n => n.neighborhood === player.neighborhood);
  const buildings = buildBuildingList(player.neighborhood, neighborhoodJobs, neighborhoodNPCs);
  const totalWidth = buildings.reduce((acc, b) => Math.max(acc, b.x + b.width + 100), 800);

  // Keyboard movement
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') setMoving('left');
      if (e.key === 'ArrowRight' || e.key === 'd') setMoving('right');
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'ArrowRight', 'd'].includes(e.key)) setMoving(null);
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKeyUp); };
  }, []);

  useEffect(() => {
    if (!moving) return;
    const speed = 4 + (player.salsaBoost / 100) * 4;
    const interval = setInterval(() => {
      setPlayerX(x => {
        const nx = moving === 'right' ? x + speed : x - speed;
        return Math.max(50, Math.min(totalWidth - 100, nx));
      });
      setFrame(f => (f + 1) % 4);
    }, 30);
    return () => clearInterval(interval);
  }, [moving, player.salsaBoost, totalWidth]);

  const handleJobClick = useCallback((job: Job) => {
    if (!job.unlocked && !state.player.completedJobs.includes(job.id)) {
      const hasTool = job.requiredTool ? player.tools.some(t => t.id === job.requiredTool) : true;
      if (!hasTool) {
        dispatch({ type: 'SHOW_NOTIFICATION', message: `Need ${job.requiredTool} for this job!` });
        setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 3000);
        return;
      }
    }
    dispatch({ type: 'START_JOB', job });
  }, [state.player.completedJobs, player.tools, dispatch]);

  const handleNPCClick = useCallback((npc: NPC) => {
    const hasFlag = (flag: string) => player.storyFlags.includes(flag);
    const firstMeet = npc.dialogues.find(d => d.trigger === 'first_meet' && !hasFlag(d.reward?.flag ?? '__none'));
    const randomDialogue = npc.dialogues.find(d => d.trigger === 'random' && hasFlag(d.storyFlag ?? '__none'));
    const dialogue = firstMeet ?? randomDialogue ?? npc.dialogues[0];
    if (dialogue) {
      dispatch({ type: 'START_DIALOGUE', npc, dialogueId: dialogue.id });
    }
  }, [player.storyFlags, dispatch]);

  const tacoY = [0, -3, -6, -3][frame];

  return (
    <div
      className="absolute inset-0 city-bg overflow-hidden"
      style={{ paddingTop: 64, cursor: 'default' }}
    >
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: weather === 'rain'
            ? 'linear-gradient(180deg, #0a1018 0%, #0d1825 50%, #141a1a 100%)'
            : weather === 'blazing'
            ? 'linear-gradient(180deg, #1a0a00 0%, #0f1008 50%, #080808 100%)'
            : 'linear-gradient(180deg, #050810 0%, #0a0e1a 50%, #0d1525 100%)',
        }}
      />

      {/* Stars (only when clear) */}
      {weather === 'clear' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${(i * 3.33) % 100}%`,
                top: `${((i * 7.3) % 30)}%`,
                width: 2,
                height: 2,
                background: '#e8f4ff',
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      )}

      {/* Rain effect */}
      {weather === 'rain' && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 30 }}>
          {rainDrops.map(drop => (
            <div
              key={drop.id}
              style={{
                position: 'absolute',
                left: `${drop.x}%`,
                top: -20,
                width: 1,
                height: 16,
                background: 'rgba(100,150,200,0.6)',
                animation: `rain-drop ${drop.duration}s linear infinite`,
                animationDelay: `${drop.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Blazing heat shimmer */}
      {weather === 'blazing' && (
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: 100, background: 'linear-gradient(0deg, rgba(255,100,0,0.08), transparent)', zIndex: 5 }}
        />
      )}

      {/* Scrollable world */}
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 0,
          width: totalWidth,
          height: '100%',
          transform: `translateX(${Math.max(0, Math.min(totalWidth - 800, playerX - 400))}px)`,
          transition: 'transform 0.05s linear',
          willChange: 'transform',
        }}
      >
        {/* Ground */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 40, background: 'linear-gradient(180deg, #0d1525, #050810)', borderTop: '3px solid #1e3a5f' }}
        />

        {/* Ground details */}
        {Array.from({ length: Math.floor(totalWidth / 60) }, (_, i) => (
          <div
            key={i}
            className="absolute font-pixel"
            style={{ left: i * 60 + 10, bottom: 10, width: 50, height: 3, background: '#1e3a5f22' }}
          />
        ))}

        {/* Buildings */}
        {buildings.map(b => (
          <BuildingComponent
            key={b.id}
            building={b}
            playerX={playerX}
            onJobClick={handleJobClick}
            onNPCClick={handleNPCClick}
            weatherEffect={weather}
          />
        ))}

        {/* NPCs */}
        {neighborhoodNPCs.slice(0, 3).map((npc, i) => (
          <NPCCharacter
            key={npc.id}
            npc={npc}
            x={(buildings[i]?.x ?? 100) + 60}
            onClick={() => handleNPCClick(npc)}
          />
        ))}

        {/* Player (Taco) */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: playerX, bottom: 40, transform: 'translateX(-50%)', zIndex: 20 }}
        >
          <div
            className="font-pixel"
            style={{ fontSize: 8, color: '#00ff88', background: 'rgba(0,0,0,0.7)', padding: '2px 4px', marginBottom: 2, border: '1px solid #00ff88' }}
          >
            YOU
          </div>
          <div
            style={{
              fontSize: 32,
              transform: `translateY(${tacoY}px) scaleX(moving === 'left' ? -1 : 1)`,
              filter: 'drop-shadow(0 0 6px rgba(255,140,0,0.6))',
              transition: 'transform 0.05s',
            }}
          >
            🌮
          </div>
        </div>
      </div>

      {/* Neighborhood label overlay */}
      <div
        className="absolute font-pixel"
        style={{ top: 72, left: 12, fontSize: 10, color: neighborhoodData.color, textShadow: `0 0 8px ${neighborhoodData.color}` }}
      >
        📍 {neighborhoodData.name.toUpperCase()}
      </div>
      <div
        className="absolute font-pixel"
        style={{ top: 88, left: 12, fontSize: 8, color: '#64748b' }}
      >
        {neighborhoodData.subtitle}
      </div>

      {/* Controls hint */}
      <div
        className="absolute font-pixel"
        style={{ bottom: 50, right: 12, fontSize: 9, color: '#1e3a5f', lineHeight: 1.8 }}
      >
        ← → MOVE<br />
        CLICK BUILDING = JOB<br />
        CLICK NPC = TALK
      </div>

      {/* D-pad buttons for mobile */}
      <div className="absolute" style={{ bottom: 50, left: 12, display: 'flex', gap: 4 }}>
        <button
          className="pixel-btn pixel-btn-gray"
          style={{ fontSize: 14, padding: '8px 14px', minWidth: 44, minHeight: 44 }}
          onPointerDown={() => setMoving('left')}
          onPointerUp={() => setMoving(null)}
          onPointerLeave={() => setMoving(null)}
          aria-label="Move left"
        >
          ◄
        </button>
        <button
          className="pixel-btn pixel-btn-gray"
          style={{ fontSize: 14, padding: '8px 14px', minWidth: 44, minHeight: 44 }}
          onPointerDown={() => setMoving('right')}
          onPointerUp={() => setMoving(null)}
          onPointerLeave={() => setMoving(null)}
          aria-label="Move right"
        >
          ►
        </button>
      </div>

      {/* End day button */}
      <div className="absolute" style={{ bottom: 50, left: '50%', transform: 'translateX(-50%)' }}>
        <button
          className="pixel-btn pixel-btn-red"
          style={{ fontSize: 10, padding: '8px 16px' }}
          onClick={() => dispatch({ type: 'END_DAY' })}
          aria-label="End the day"
        >
          🌙 END DAY
        </button>
      </div>
    </div>
  );
}
