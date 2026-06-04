import { useState, useEffect } from 'react';
import { useGame } from '@/game/store';

const AUTOSAVE_KEY = 'tacowash_autosave';

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 3,
  size: Math.random() < 0.3 ? 3 : 2,
}));

const CITY_BUILDINGS = [
  { x: 0, w: 80, h: 180, color: '#0d1f3c' },
  { x: 60, w: 60, h: 240, color: '#0a1928' },
  { x: 100, w: 90, h: 200, color: '#0f2040' },
  { x: 170, w: 70, h: 300, color: '#0c1a30' },
  { x: 220, w: 50, h: 160, color: '#0d1f3c' },
  { x: 250, w: 100, h: 280, color: '#0a1928' },
  { x: 330, w: 65, h: 220, color: '#0f2040' },
  { x: 370, w: 80, h: 190, color: '#0c1a30' },
  { x: 430, w: 110, h: 260, color: '#0d1f3c' },
  { x: 520, w: 60, h: 180, color: '#0a1928' },
  { x: 560, w: 85, h: 310, color: '#0f2040' },
  { x: 620, w: 70, h: 230, color: '#0c1a30' },
  { x: 670, w: 90, h: 200, color: '#0d1f3c' },
  { x: 740, w: 55, h: 170, color: '#0a1928' },
  { x: 775, w: 100, h: 290, color: '#0f2040' },
];

const WINDOW_LIGHTS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 60 + 5,
  on: Math.random() > 0.4,
  color: ['#ffd700', '#00aaff', '#ff8c00', '#00ff88'][Math.floor(Math.random() * 4)],
}));

export default function TitleScreen() {
  const { navigate, dispatch, loadAutoSave } = useGame();
  const [blink, setBlink] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [tacoFrame, setTacoFrame] = useState(0);

  // Check saves once on mount (before any user interaction)
  const [hasAutoSave] = useState(() => !!localStorage.getItem(AUTOSAVE_KEY));
  const [hasManualSaves] = useState(() =>
    [0, 1, 2].some(i => !!localStorage.getItem(`tacowash_save_${i}`))
  );

  const handleContinue = () => {
    if (loadAutoSave()) return; // navigates to street internally
    navigate('street');         // fallback
  };

  useEffect(() => {
    const t1 = setTimeout(() => setShowSubtitle(true), 800);
    const t2 = setTimeout(() => setShowMenu(true), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTacoFrame(f => (f + 1) % 4), 200);
    return () => clearInterval(t);
  }, []);

  const tacoY = [0, -4, -8, -4][tacoFrame];

  return (
    <div className="relative w-full h-screen overflow-hidden city-bg scanlines">
      {/* Stars */}
      <div className="absolute inset-0">
        {STARS.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              background: '#e8f4ff',
              animation: `star-twinkle ${1.5 + s.delay}s ease-in-out infinite`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* City skyline */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: 320 }}>
        <svg width="100%" height="320" viewBox="0 0 860 320" preserveAspectRatio="none">
          {CITY_BUILDINGS.map((b, i) => (
            <rect key={i} x={b.x} y={320 - b.h} width={b.w} height={b.h} fill={b.color} />
          ))}
          {/* Building windows */}
          {WINDOW_LIGHTS.map(w => (
            <rect
              key={w.id}
              x={`${w.x}%`}
              y={`${w.y}%`}
              width="5"
              height="4"
              fill={w.on ? w.color : 'transparent'}
              opacity={w.on ? 0.9 : 0}
            />
          ))}
        </svg>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: '#050810' }} />

      {/* Neon street glow */}
      <div className="absolute bottom-8 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, transparent, #ff333344, #00aaff44, transparent)' }} />

      {/* Main content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: 120 }}>
        {/* Taco sprite */}
        <div
          className="text-8xl mb-4 select-none"
          style={{
            transform: `translateY(${tacoY}px)`,
            filter: 'drop-shadow(0 0 20px rgba(255,140,0,0.8)) drop-shadow(0 0 40px rgba(255,51,51,0.5))',
            transition: 'transform 0.1s',
            fontSize: 80,
          }}
        >
          🌮
        </div>

        {/* Title */}
        <div className="relative mb-2">
          <h1
            className="font-title text-center"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 'clamp(36px, 8vw, 72px)',
              fontWeight: 900,
              color: '#ffd700',
              textShadow: '0 0 10px #ffd700, 0 0 30px #ffd700, 0 0 60px #ff8c00, 4px 4px 0 #553300',
              letterSpacing: '0.05em',
              lineHeight: 1,
            }}
          >
            TACO
          </h1>
          <h1
            className="font-title text-center"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 'clamp(36px, 8vw, 72px)',
              fontWeight: 900,
              color: '#00e5cc',
              textShadow: '0 0 10px #00e5cc, 0 0 30px #00e5cc, 0 0 60px #00aaff, 4px 4px 0 #003344',
              letterSpacing: '0.12em',
              lineHeight: 1,
            }}
          >
            WASH
          </h1>
        </div>

        {/* Subtitle */}
        {showSubtitle && (
          <div
            className="font-pixel text-center mb-8 anim-slide-down"
            style={{ fontSize: 11, color: '#64748b', letterSpacing: '0.08em', lineHeight: 1.8, maxWidth: 400, padding: '0 20px' }}
          >
            <span style={{ color: '#ff8c00' }}>FROM RAGS TO RICHES</span>
            <br />
            squeegee your way to the top
            <br />
            <span style={{ color: '#bf5fff' }}>expose the burrito cartel</span>
            <br />
            buy that macbook pro
          </div>
        )}

        {/* Menu */}
        {showMenu && (
          <div className="flex flex-col items-center gap-3 anim-slide-up">
            {hasAutoSave && (
              <button
                className="pixel-btn pixel-btn-green"
                onClick={handleContinue}
                style={{ fontSize: 11, padding: '12px 32px', minWidth: 200 }}
              >
                ▶ CONTINUE
              </button>
            )}
            <button
              className={`pixel-btn ${hasAutoSave ? 'pixel-btn-gray' : 'pixel-btn-green'}`}
              onClick={() => navigate('backstory')}
              style={{ fontSize: hasAutoSave ? 9 : 11, padding: hasAutoSave ? '10px 24px' : '12px 32px', minWidth: 200 }}
            >
              {hasAutoSave ? '+ NEW GAME' : '▶ NEW GAME'}
            </button>
            {hasManualSaves && (
              <button
                className="pixel-btn pixel-btn-blue"
                onClick={() => dispatch({ type: 'TOGGLE_SAVE_MENU' })}
                style={{ fontSize: 11, padding: '10px 24px', minWidth: 200 }}
              >
                📁 LOAD SAVE
              </button>
            )}
          </div>
        )}

        {/* Blinking start hint */}
        {showMenu && (
          <div
            className="font-pixel mt-6"
            style={{ fontSize: 10, color: blink ? '#ffd700' : 'transparent', transition: 'color 0.1s' }}
          >
            PRESS ANY KEY TO BEGIN
          </div>
        )}
      </div>

      {/* Version tag */}
      <div
        className="absolute bottom-2 right-3 font-pixel"
        style={{ fontSize: 9, color: '#1e3a5f' }}
      >
        v1.0 — TACO WASH STUDIOS
      </div>

      {/* Top corner lore */}
      <div
        className="absolute top-3 left-3 font-pixel"
        style={{ fontSize: 9, color: '#64748b', lineHeight: 1.8 }}
      >
        <span style={{ color: '#ff3333' }}>⚠</span> RATED T FOR TACO
      </div>

      {/* Marquee at bottom */}
      <div
        className="absolute font-pixel overflow-hidden"
        style={{ bottom: 28, left: 0, right: 0, fontSize: 9, color: '#1e3a5f', height: 14, lineHeight: '14px' }}
      >
        <div style={{ animation: 'marquee 20s linear infinite', whiteSpace: 'nowrap', display: 'inline-block' }}>
          &nbsp;&nbsp;&nbsp;🌮 WINDOW WASHING • SQUEEGEE MASTERY • BURRITO SYNDICATE • WORLD CHAMPIONSHIP • MACBOOK PRO DREAMS • SALSA SPEED BOOST • 7 COUNTRY TRAINING ARC • 🌮 WINDOW WASHING • SQUEEGEE MASTERY •&nbsp;&nbsp;&nbsp;
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
