import { useRef, useCallback, useEffect, useState } from 'react';
import { useGame } from '@/game/store';

const GRID_ROWS = 8;
const GRID_COLS = 10;

type LocalCell = 'dirty' | 'soaped' | 'clean' | 'streaked';

// Stain dirt colors + texture variants
const DIRT: Record<string, { bg: string; pattern: string }> = {
  dust:      { bg: 'rgba(175,145,72,0.85)',  pattern: 'dot' },
  grime:     { bg: 'rgba(55,42,20,0.92)',    pattern: 'smear' },
  birdpoop:  { bg: 'rgba(208,202,180,0.90)', pattern: 'blob' },
  hardwater: { bg: 'rgba(95,125,160,0.82)',  pattern: 'ring' },
  pollen:    { bg: 'rgba(195,165,45,0.87)',  pattern: 'dot' },
  saltcrust: { bg: 'rgba(160,170,190,0.82)', pattern: 'ring' },
  icebuild:  { bg: 'rgba(135,180,215,0.82)', pattern: 'smear' },
};

function DirtTexture({ pattern }: { pattern: string }) {
  if (pattern === 'dot') return (
    <div className="absolute inset-0 pointer-events-none" style={{
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1.5px, transparent 1.5px)',
      backgroundSize: '6px 6px',
    }} />
  );
  if (pattern === 'ring') return (
    <div className="absolute inset-0 pointer-events-none" style={{
      backgroundImage: 'radial-gradient(ellipse at 50% 50%, transparent 28%, rgba(255,255,255,0.13) 29%, rgba(255,255,255,0.13) 34%, transparent 35%)',
      backgroundSize: '16px 12px',
    }} />
  );
  if (pattern === 'blob') return (
    <div className="absolute inset-0 pointer-events-none" style={{
      background: 'radial-gradient(ellipse at 38% 32%, rgba(255,255,255,0.28) 0%, transparent 55%)',
    }} />
  );
  return (
    <div className="absolute inset-0 pointer-events-none" style={{
      backgroundImage: 'repeating-linear-gradient(73deg, transparent, transparent 5px, rgba(255,255,255,0.06) 5px, rgba(255,255,255,0.06) 6px)',
    }} />
  );
}

// Custom cursor visuals — hidden native cursor replaced with this
function WashCursor({ x, y, phase, pressing }: {
  x: number; y: number; phase: 'soap' | 'squeegee'; pressing: boolean;
}) {
  if (phase === 'soap') {
    const size = pressing ? 40 : 32;
    return (
      <div
        className="pointer-events-none absolute"
        style={{
          left: x, top: y,
          width: size, height: size,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '2px solid rgba(200,235,255,0.9)',
          background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(180,220,255,0.35) 45%, transparent 100%)',
          boxShadow: `0 0 ${pressing ? 16 : 10}px rgba(180,220,255,0.7), 0 0 ${pressing ? 30 : 20}px rgba(180,220,255,0.3)`,
          transition: 'width 0.08s, height 0.08s, box-shadow 0.08s',
          zIndex: 40,
        }}
      />
    );
  }
  // Squeegee cursor — a horizontal bar
  const w = pressing ? 80 : 64;
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: x, top: y,
        width: w, height: pressing ? 10 : 8,
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 20%, rgba(200,235,255,0.95) 50%, rgba(255,255,255,0.5) 80%, transparent 100%)',
        borderRadius: 4,
        boxShadow: `0 0 ${pressing ? 12 : 8}px rgba(200,235,255,0.8), 0 2px 4px rgba(0,0,0,0.3)`,
        transition: 'width 0.08s, height 0.08s',
        zIndex: 40,
      }}
    />
  );
}

export default function WindowWashMinigame() {
  const { state, dispatch } = useGame();
  const { washSession, currentJob, weather } = state;

  const [phase, setPhase] = useState<'soap' | 'squeegee'>('soap');
  const [localCells, setLocalCells] = useState<LocalCell[][]>(() =>
    Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill('dirty') as LocalCell[])
  );

  // Animation sets
  const [bubbleCells, setBubbleCells] = useState<Set<string>>(new Set());
  const [wipingCells, setWipingCells] = useState<Set<string>>(new Set());
  const [sparkleCells, setSparkleCells] = useState<Set<string>>(new Set());
  const [showSweep, setShowSweep] = useState(false);

  // Custom cursor
  const [cursor, setCursor] = useState({ x: -200, y: -200 });
  const [pressing, setPressing] = useState(false);
  const [overGrid, setOverGrid] = useState(false);

  // Grid container ref for coordinate-based cell detection
  const gridRef = useRef<HTMLDivElement>(null);

  // Stable ref for localCells (avoids stale closures in callbacks)
  const localCellsRef = useRef(localCells);
  useEffect(() => { localCellsRef.current = localCells; }, [localCells]);

  // Drag state
  const isDragging = useRef(false);
  const lastCellKey = useRef<string | null>(null);

  // Reset when window advances
  const prevWindowIdx = useRef(-1);
  useEffect(() => {
    if (!washSession) return;
    if (prevWindowIdx.current !== washSession.windowIndex) {
      prevWindowIdx.current = washSession.windowIndex;
      setLocalCells(Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill('dirty') as LocalCell[]));
      setPhase('soap');
      setBubbleCells(new Set());
      setWipingCells(new Set());
      setSparkleCells(new Set());
      setShowSweep(false);
    }
  }, [washSession?.windowIndex]);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => dispatch({ type: 'TICK_WASH_TIME' }), 1000);
    return () => clearInterval(t);
  }, [dispatch]);

  useEffect(() => {
    if (washSession?.timeLeft === 0) {
      dispatch({ type: 'ADVANCE_WINDOW', localScore: computeScore() });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [washSession?.timeLeft]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const countStats = () => {
    let soaped = 0, clean = 0, streaked = 0;
    for (const row of localCellsRef.current)
      for (const c of row) {
        if (c === 'soaped') soaped++;
        else if (c === 'clean') clean++;
        else if (c === 'streaked') streaked++;
      }
    return { soaped, clean, streaked };
  };

  const computeScore = () => {
    const { clean, streaked } = countStats();
    const pct = clean / (GRID_ROWS * GRID_COLS);
    return Math.max(0, Math.round(pct * 100) - Math.min(streaked * 4, 30));
  };

  // ── Cell interactions ────────────────────────────────────────────────────
  const soapCell = useCallback((row: number, col: number) => {
    if (localCellsRef.current[row]?.[col] !== 'dirty') return;
    const key = `${row}-${col}`;
    setLocalCells(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = 'soaped';
      return next;
    });
    setBubbleCells(prev => new Set([...prev, key]));
    setTimeout(() => setBubbleCells(prev => { const n = new Set(prev); n.delete(key); return n; }), 500);
  }, []);

  const wipeCell = useCallback((row: number, col: number) => {
    const cur = localCellsRef.current[row]?.[col];
    if (!cur || cur === 'clean') return;
    const key = `${row}-${col}`;
    const result: LocalCell = cur === 'soaped' ? 'clean' : 'streaked';

    setLocalCells(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = result;
      return next;
    });

    if (result === 'clean') {
      // Wipe reveal
      setWipingCells(prev => new Set([...prev, key]));
      setTimeout(() => setWipingCells(prev => { const n = new Set(prev); n.delete(key); return n; }), 320);
      // Sparkle
      setSparkleCells(prev => new Set([...prev, key]));
      setTimeout(() => setSparkleCells(prev => { const n = new Set(prev); n.delete(key); return n; }), 550);
    }
  }, []);

  const interact = useCallback((row: number, col: number) => {
    const key = `${row}-${col}`;
    if (key === lastCellKey.current) return;
    lastCellKey.current = key;
    if (phase === 'soap') soapCell(row, col);
    else wipeCell(row, col);
  }, [phase, soapCell, wipeCell]);

  // ── Coordinate-based cell from pointer position ──────────────────────────
  const cellFromPointer = useCallback((clientX: number, clientY: number) => {
    const grid = gridRef.current;
    if (!grid) return null;
    const rect = grid.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const col = Math.floor((x / rect.width) * GRID_COLS);
    const row = Math.floor((y / rect.height) * GRID_ROWS);
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return null;
    return { row, col };
  }, []);

  // ── Pointer handlers — all on the grid container ─────────────────────────
  const onGridPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId); // captures all move/up even outside element — key for touch
    isDragging.current = true;
    lastCellKey.current = null;
    setPressing(true);
    const cell = cellFromPointer(e.clientX, e.clientY);
    if (cell) interact(cell.row, cell.col);
  }, [cellFromPointer, interact]);

  const onGridPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Update custom cursor position relative to grid
    const grid = gridRef.current;
    if (grid) {
      const rect = grid.getBoundingClientRect();
      setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    if (!isDragging.current) return;
    const cell = cellFromPointer(e.clientX, e.clientY);
    if (cell) interact(cell.row, cell.col);
  }, [cellFromPointer, interact]);

  const onGridPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    isDragging.current = false;
    lastCellKey.current = null;
    setPressing(false);
  }, []);

  // ── Phase switching ────────────────────────────────────────────────────────
  const switchToSqueegee = () => {
    dispatch({ type: 'APPLY_SOAP' });
    setPhase('squeegee');
    lastCellKey.current = null;
  };

  const finishWindow = () => {
    const { clean } = countStats();
    const total = GRID_ROWS * GRID_COLS;
    // Trigger all-clean sweep if window is mostly clean
    if (clean / total >= 0.75) {
      setShowSweep(true);
      setTimeout(() => {
        setShowSweep(false);
        dispatch({ type: 'ADVANCE_WINDOW', localScore: computeScore() });
      }, 750);
    } else {
      dispatch({ type: 'ADVANCE_WINDOW', localScore: computeScore() });
    }
  };

  if (!washSession || !currentJob) return null;

  const { soaped, clean, streaked } = countStats();
  const total = GRID_ROWS * GRID_COLS;
  const soapPct = Math.round((soaped + clean) / total * 100);
  const cleanPct = Math.round(clean / total * 100);
  const canSqueegee = soaped + clean >= Math.floor(total * 0.45);

  const weatherWarning =
    weather === 'rain'    ? '🌧 Rain — soap washes off fast!'  :
    weather === 'blazing' ? '🔥 Heat — foam dries instantly!'  :
    weather === 'snow'    ? '❄ Freezing — squeegee stiffens'  : null;

  return (
    <div
      className="absolute inset-0 flex flex-col city-bg"
      style={{ paddingTop: 64, touchAction: 'none' }}
    >
      {/* ── Phase info bar ─────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 font-pixel"
        style={{ background: 'rgba(0,0,0,0.82)', borderBottom: '2px solid #1e3a5f', padding: '8px 16px' }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div style={{ fontSize: 9, color: '#64748b' }}>{currentJob.clientName}</div>
            <div style={{ fontSize: 11, color: '#ffd700' }}>{currentJob.buildingName}</div>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: phase === 'soap' ? '#00aaff' : '#00ff88', color: '#000', fontSize: 11,
              }}>
                {phase === 'soap' ? '1' : '✓'}
              </div>
              <span style={{ fontSize: 9, color: phase === 'soap' ? '#00aaff' : '#00ff88' }}>
                {phase === 'soap' ? 'SOAP' : 'SOAPED'}
              </span>
            </div>
            <span style={{ fontSize: 9, color: '#1e3a5f' }}>→</span>
            <div className="flex items-center gap-1" style={{ opacity: phase === 'squeegee' ? 1 : 0.35 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: phase === 'squeegee' ? '#00ff88' : '#1e3a5f', color: phase === 'squeegee' ? '#000' : '#4a5568', fontSize: 11,
              }}>2</div>
              <span style={{ fontSize: 9, color: phase === 'squeegee' ? '#00ff88' : '#4a5568' }}>SQUEEGEE</span>
            </div>
          </div>

          {/* Timer */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: '#64748b' }}>TIME</div>
            <div style={{
              fontSize: 18, lineHeight: 1,
              color: washSession.timeLeft < 20 ? '#ff3333' : '#ffd700',
              textShadow: washSession.timeLeft < 20 ? '0 0 8px #ff3333' : 'none',
            }}>
              {washSession.timeLeft}s
            </div>
          </div>
        </div>

        {/* Instruction */}
        <div style={{ marginTop: 5, fontSize: 9, color: phase === 'soap' ? '#00aaff' : '#00ff88' }}>
          {phase === 'soap'
            ? '🧴 Drag or tap to lather soap across the dirty glass'
            : '🪣 Drag or swipe to squeegee the foam away'}
          {weatherWarning && <span style={{ color: '#ffd700', marginLeft: 10 }}>{weatherWarning}</span>}
        </div>
      </div>

      {/* ── Window grid ────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center" style={{ minHeight: 0, padding: '10px 14px' }}>
        {/* Outer frame */}
        <div
          style={{
            background: '#0a1220',
            border: '8px solid #16222e',
            boxShadow: '0 0 50px rgba(0,100,200,0.2), inset 0 0 40px rgba(0,0,0,0.7), 10px 10px 0 #000',
            position: 'relative',
          }}
        >
          {/* Window cross-bars */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 6, background: '#16222e', transform: 'translateX(-50%)', zIndex: 15, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 6, background: '#16222e', transform: 'translateY(-50%)', zIndex: 15, pointerEvents: 'none' }} />

          {/* Grid — ALL pointer events here */}
          <div
            ref={gridRef}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
              width: 'min(500px, calc(100vw - 48px))',
              height: 'min(340px, calc(100vh - 240px))',
              touchAction: 'none',
              cursor: overGrid ? 'none' : 'default',
              position: 'relative',
              zIndex: 1,
            }}
            onPointerDown={onGridPointerDown}
            onPointerMove={onGridPointerMove}
            onPointerUp={onGridPointerUp}
            onPointerEnter={() => setOverGrid(true)}
            onPointerLeave={() => { setOverGrid(false); isDragging.current = false; setPressing(false); }}
          >
            {/* Custom cursor */}
            {overGrid && (
              <WashCursor x={cursor.x} y={cursor.y} phase={phase} pressing={pressing} />
            )}

            {/* All-clean sweep flash */}
            {showSweep && (
              <div
                className="glass-sweep absolute pointer-events-none"
                style={{
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), rgba(200,240,255,0.8), rgba(255,255,255,0.6), transparent)',
                  zIndex: 35,
                }}
              />
            )}

            {/* Cells */}
            {washSession.cells.map((row, ri) =>
              row.map((cell, ci) => {
                const localState = localCells[ri]?.[ci] ?? 'dirty';
                const key = `${ri}-${ci}`;
                const isWiping = wipingCells.has(key);
                const isBubbling = bubbleCells.has(key);
                const isSparkling = sparkleCells.has(key);
                const dirtyInfo = cell.stainType ? (DIRT[cell.stainType] ?? DIRT.grime) : null;

                return (
                  <div
                    key={cell.id}
                    className="relative overflow-hidden"
                    style={{
                      background: (localState === 'dirty' || localState === 'soaped')
                        ? (dirtyInfo?.bg ?? 'rgba(100,90,70,0.82)')
                        : localState === 'streaked'
                        ? 'rgba(165,190,220,0.22)'
                        : 'rgba(10,18,32,0.6)', // clean = dark glass
                      borderRight: '1px solid rgba(0,0,0,0.25)',
                      borderBottom: '1px solid rgba(0,0,0,0.25)',
                    }}
                  >
                    {/* Dirt texture (only when dirty or soaped) */}
                    {(localState === 'dirty' || localState === 'soaped') && dirtyInfo && (
                      <DirtTexture pattern={dirtyInfo.pattern} />
                    )}

                    {/* Soap foam overlay */}
                    {localState === 'soaped' && (
                      <div
                        className={`soap-foam absolute inset-0 ${isBubbling ? 'bubble-pop' : ''}`}
                      />
                    )}

                    {/* Bubble pop flash (appears briefly on soap application) */}
                    {isBubbling && localState === 'soaped' && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(200,235,255,0.3) 50%, transparent 100%)',
                          zIndex: 10,
                        }}
                      />
                    )}

                    {/* Clean glass layer — reveals via clip-path during wipe */}
                    {localState === 'clean' && (
                      <div
                        className={`${isWiping ? 'wipe-reveal' : ''} absolute inset-0`}
                        style={{
                          background: 'linear-gradient(135deg, rgba(180,220,255,0.22) 0%, rgba(120,180,255,0.08) 100%)',
                          animation: !isWiping ? 'glass-shine 3s ease-in-out infinite' : undefined,
                        }}
                      />
                    )}

                    {/* Clean sparkle burst ✦ */}
                    {isSparkling && (
                      <div
                        className="sparkle-burst absolute pointer-events-none"
                        style={{
                          inset: '15%',
                          background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(200,240,255,0.6) 40%, transparent 100%)',
                          borderRadius: '50%',
                          zIndex: 20,
                        }}
                      />
                    )}

                    {/* Streak smear pattern */}
                    {localState === 'streaked' && (
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'repeating-linear-gradient(60deg, transparent, transparent 2px, rgba(200,220,250,0.22) 2px, rgba(200,220,250,0.22) 3px)',
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Glass surface reflection — always on top */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
          }} />
        </div>
      </div>

      {/* ── Bottom controls ────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 font-pixel"
        style={{ background: 'rgba(0,0,0,0.85)', borderTop: '2px solid #1e3a5f', padding: '10px 16px' }}
      >
        <div className="flex items-center gap-4">
          {/* Progress bar */}
          <div style={{ flex: 1 }}>
            {phase === 'soap' ? (
              <>
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: 9, color: '#00aaff' }}>SOAP COVERAGE</span>
                  <span style={{ fontSize: 9, color: '#00aaff' }}>{soapPct}%</span>
                </div>
                <div className="pixel-bar" style={{ borderColor: '#00aaff', background: '#050810', height: 14 }}>
                  <div className="pixel-bar-fill" style={{ width: `${soapPct}%`, background: 'linear-gradient(90deg, #00aaff, #c0e8ff)' }} />
                </div>
                {!canSqueegee && (
                  <div style={{ fontSize: 8, color: '#64748b', marginTop: 3 }}>
                    Cover at least 45% before squeegeeing
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: 9, color: '#00ff88' }}>CLEAN</span>
                  <span style={{ fontSize: 9, color: cleanPct >= 80 ? '#00ff88' : cleanPct >= 50 ? '#ffd700' : '#ff8c00' }}>
                    {cleanPct}%
                    {streaked > 0 && <span style={{ color: '#ff3333', marginLeft: 8 }}>⚠ {streaked} streaks</span>}
                  </span>
                </div>
                <div className="pixel-bar" style={{ borderColor: '#00ff88', background: '#050810', height: 14 }}>
                  <div className="pixel-bar-fill" style={{
                    width: `${cleanPct}%`,
                    background: cleanPct >= 80 ? 'linear-gradient(90deg, #00ff88, #c0ffe0)' : cleanPct >= 50 ? '#ffd700' : '#ff8c00',
                  }} />
                </div>
              </>
            )}
          </div>

          {/* Window + pay */}
          <div style={{ textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontSize: 9, color: '#64748b' }}>
              WIN. {washSession.windowIndex + 1}/{washSession.totalWindows}
            </div>
            <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>EST. PAY</div>
            <div style={{ fontSize: 14, color: '#00ff88', textShadow: '0 0 6px #00ff88' }}>
              ${Math.round(currentJob.basePay * (cleanPct / 100) * 1.5)}
            </div>
          </div>

          {/* Action button */}
          {phase === 'soap' ? (
            <button
              className={`pixel-btn ${canSqueegee ? 'pixel-btn-blue' : 'pixel-btn-gray'}`}
              style={{ fontSize: 11, padding: '10px 16px', opacity: canSqueegee ? 1 : 0.45 }}
              onClick={canSqueegee ? switchToSqueegee : undefined}
              disabled={!canSqueegee}
            >
              🪣 SQUEEGEE
            </button>
          ) : (
            <button
              className="pixel-btn pixel-btn-green"
              style={{ fontSize: 11, padding: '10px 16px' }}
              onClick={finishWindow}
            >
              {washSession.windowIndex + 1 < washSession.totalWindows ? '→ NEXT' : '✓ DONE'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
