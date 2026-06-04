import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/game/store';

const PANELS = [
  {
    emoji: '🏙️',
    color: '#ff8c00',
    title: 'TACO CITY — 3 YEARS AGO',
    body: 'The slums smelled of corn tortillas and possibility. Your family ran El Taco Loco — the best taco truck in three neighborhoods.',
  },
  {
    emoji: '🌮',
    color: '#ffd700',
    title: 'THE FAMILY LEGACY',
    body: 'Three generations of secret salsa. Lines around the block every night. People travelled across the city just for one taco.',
  },
  {
    emoji: '🌯',
    color: '#ff3333',
    title: 'THE BURRITO KING',
    body: 'He ran the Burrito Syndicate from the High-Rise District. Every food vendor paid tribute. Every one... except your family.',
  },
  {
    emoji: '🔥',
    color: '#ff4400',
    title: 'THE FIRE',
    body: '"Electrical fault," the report said. El Taco Loco — three generations of history — burned to ash overnight. Everyone knew the truth.',
  },
  {
    emoji: '💸',
    color: '#64748b',
    title: 'ROCK BOTTOM',
    body: 'You have $50. A family with nowhere to go. And a rage that could strip paint off a skyscraper.',
  },
  {
    emoji: '🪟',
    color: '#00aaff',
    title: 'THE ONLY JOB',
    body: 'A flyer on a lamppost: "WINDOW WASHERS NEEDED." You grabbed a squeegee. You had no other choice.',
  },
  {
    emoji: '🌮✊',
    color: '#00ff88',
    title: 'THE PLAN',
    body: 'Save every dollar. Train across the world. Win the Championship. Buy a MacBook. Expose the Syndicate.\n\nOne window at a time.',
  },
] as const;

// Typewriter that won't restart on parent re-renders (onDone in ref)
function TypewriterText({ text, speed = 30, skip, onDone }: {
  text: string; speed?: number; skip?: boolean; onDone?: () => void;
}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; });

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); onDoneRef.current?.(); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);

  useEffect(() => {
    if (!skip) return;
    setDisplayed(text);
    setDone(true);
    onDoneRef.current?.();
  }, [skip, text]);

  return (
    <span>
      {displayed.split('\n').map((line, i, arr) => (
        <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
      ))}
      {!done && <span style={{ animation: 'blink-cursor 1s step-start infinite', color: '#ffd700' }}>█</span>}
    </span>
  );
}

export default function BackstoryScreen() {
  const { navigate } = useGame();
  const [panelIdx, setPanelIdx] = useState(0);
  const [textDone, setTextDone] = useState(false);
  const [skip, setSkip] = useState(false);
  const [fading, setFading] = useState(false);
  const [visible, setVisible] = useState(false);

  const panel = PANELS[panelIdx];
  const isLast = panelIdx >= PANELS.length - 1;

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const goToStreet = () => navigate('street');

  const advance = () => {
    if (!textDone) { setSkip(true); return; }
    if (isLast) { goToStreet(); return; }
    setFading(true);
    setTimeout(() => {
      setPanelIdx(i => i + 1);
      setTextDone(false);
      setSkip(false);
      setFading(false);
    }, 280);
  };

  // Stable ref so keyboard handler doesn't go stale
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['Enter', ' ', 'ArrowRight'].includes(e.key)) advanceRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center city-bg"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        cursor: 'pointer',
        padding: '20px 16px',
      }}
      onClick={advance}
    >
      {/* Distant stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            left: `${(i * 2.5) % 100}%`,
            top: `${(i * 3.7) % 55}%`,
            width: 2, height: 2,
            background: '#e8f4ff',
            opacity: 0.25,
            animation: `star-twinkle ${2 + (i % 4)}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* Skip button — top right */}
      <button
        className="absolute font-pixel pixel-btn pixel-btn-gray"
        style={{ top: 16, right: 16, fontSize: 8, padding: '6px 12px', zIndex: 10 }}
        onClick={e => { e.stopPropagation(); goToStreet(); }}
        aria-label="Skip intro"
      >
        SKIP INTRO →
      </button>

      {/* Panel card */}
      <div
        style={{
          width: 'min(560px, 100%)',
          opacity: fading ? 0 : 1,
          transform: fading ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 0.28s ease, transform 0.28s ease',
        }}
      >
        {/* Coloured accent line */}
        <div style={{
          height: 4,
          background: panel.color,
          boxShadow: `0 0 20px ${panel.color}88`,
          marginBottom: 0,
        }} />

        <div
          className="pixel-box font-pixel"
          style={{
            borderColor: `${panel.color}66`,
            background: '#060c16',
            padding: '28px 28px 24px',
            boxShadow: `0 0 40px ${panel.color}22, 8px 8px 0 #000`,
          }}
        >
          {/* Panel number */}
          <div style={{ fontSize: 8, color: '#1e3a5f', marginBottom: 12 }}>
            {panelIdx + 1} / {PANELS.length}
          </div>

          {/* Emoji illustration */}
          <div style={{
            fontSize: 64,
            marginBottom: 20,
            textAlign: 'center',
            animation: 'float 3s ease-in-out infinite',
            filter: `drop-shadow(0 0 16px ${panel.color}66)`,
          }}>
            {panel.emoji}
          </div>

          {/* Title */}
          <div style={{
            fontSize: 13,
            color: panel.color,
            textShadow: `0 0 12px ${panel.color}88`,
            marginBottom: 18,
            textAlign: 'center',
            letterSpacing: '0.04em',
          }}>
            {panel.title}
          </div>

          {/* Body text */}
          <div style={{
            fontSize: 10,
            color: '#c8d8e8',
            lineHeight: 2.2,
            minHeight: 80,
            textAlign: 'center',
          }}>
            <TypewriterText
              key={`${panelIdx}-${panel.body}`}
              text={panel.body}
              speed={32}
              skip={skip}
              onDone={() => setTextDone(true)}
            />
          </div>

          {/* Advance hint */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            {textDone ? (
              <div style={{
                fontSize: 9,
                color: panel.color,
                animation: 'blink-cursor 1.2s step-start infinite',
              }}>
                {isLast ? '▶ BEGIN YOUR STORY' : '▶ CONTINUE'}
              </div>
            ) : (
              <div style={{ fontSize: 8, color: '#1e3a5f' }}>tap to skip...</div>
            )}
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {PANELS.map((_, i) => (
          <div key={i} style={{
            width: i === panelIdx ? 16 : 6,
            height: 6,
            background: i === panelIdx ? panel.color : i < panelIdx ? `${panel.color}66` : '#1e3a5f',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            boxShadow: i === panelIdx ? `0 0 6px ${panel.color}` : 'none',
          }} />
        ))}
      </div>
    </div>
  );
}
