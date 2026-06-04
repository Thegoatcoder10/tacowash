import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/game/store';
import type { FoodCharacter } from '@/game/types';

const CHARACTER_EMOJIS: Record<FoodCharacter, string> = {
  taco: '🌮',
  burrito: '🌯',
  pizza: '🍕',
  croissant: '🥐',
  sushi: '🍣',
  pretzel: '🥨',
  agave: '🌵',
  pancake: '🥞',
  caviar: '🫧',
  hotdog: '🌭',
  fries: '🍟',
  hamburger: '🍔',
  fish: '🐟',
};

const CHARACTER_COLORS: Record<FoodCharacter, string> = {
  taco: '#ff8c00',
  burrito: '#ff3333',
  pizza: '#ff6b35',
  croissant: '#ffd700',
  sushi: '#00e5cc',
  pretzel: '#bf5fff',
  agave: '#00ff88',
  pancake: '#ff8c00',
  caviar: '#00aaff',
  hotdog: '#ff4fa3',
  fries: '#ffd700',
  hamburger: '#ff6b35',
  fish: '#00aaff',
};

// Typewriter that won't restart on arbitrary parent re-renders.
// onDone is stored in a ref so it's excluded from effect deps safely.
// The `skip` prop immediately reveals the full text.
function TypewriterText({
  text,
  speed = 28,
  skip,
  onDone,
}: {
  text: string;
  speed?: number;
  skip?: boolean;
  onDone?: () => void;
}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; });

  // Animate — only re-runs when `text` or `speed` genuinely changes.
  // Component is keyed per-line so this fires on real line transitions only.
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        setDone(true);
        onDoneRef.current?.();
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]); // onDone excluded via ref — intentional

  // Skip: instantly reveal full text
  useEffect(() => {
    if (!skip) return;
    setDisplayed(text);
    setDone(true);
    onDoneRef.current?.();
  }, [skip, text]);

  return (
    <span>
      {displayed}
      {!done && <span className="anim-blink" style={{ color: '#ffd700' }}>█</span>}
    </span>
  );
}

export default function DialogueBox() {
  const { state, dispatch } = useGame();
  const { activeDialogue, activeNPC, dialogueLineIndex } = state;
  const [textDone, setTextDone] = useState(false);
  const [skip, setSkip] = useState(false);

  // Reset both states on each new dialogue line
  useEffect(() => {
    setTextDone(false);
    setSkip(false);
  }, [dialogueLineIndex]);

  if (!activeDialogue || !activeNPC) return null;

  const line = activeDialogue.lines[dialogueLineIndex];
  if (!line) return null;

  const isLast = dialogueLineIndex >= activeDialogue.lines.length - 1;
  const color = CHARACTER_COLORS[line.portrait] ?? '#e8f4ff';
  const emoji = CHARACTER_EMOJIS[line.portrait] ?? '🍔';
  const isPlayer = line.portrait === 'taco';

  const handleAdvance = () => {
    dispatch({ type: 'ADVANCE_DIALOGUE' });
  };

  // First click: skip typewriter. Second click (when text done): advance line.
  const handleOverlayClick = () => {
    if (!textDone) {
      setSkip(true);
    } else {
      handleAdvance();
    }
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-end city-bg"
      style={{ zIndex: 80 }}
      onClick={handleOverlayClick}
    >
      {/* Dim overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
      />

      {/* Character portrait area */}
      <div className="relative w-full max-w-2xl flex items-end px-6 pb-2">
        {/* Speaker portrait */}
        <div
          className={`flex flex-col items-center anim-float ${isPlayer ? 'order-last ml-auto' : ''}`}
          style={{ marginBottom: 8 }}
        >
          <div
            style={{
              fontSize: 72,
              filter: `drop-shadow(0 0 20px ${color}88)`,
              animation: 'float 2s ease-in-out infinite',
            }}
          >
            {emoji}
          </div>
        </div>
      </div>

      {/* Dialogue panel */}
      <div
        className="relative w-full max-w-2xl anim-slide-up"
        style={{ zIndex: 90, padding: '0 16px 16px' }}
      >
        <div
          className="pixel-box"
          style={{
            background: '#080d18',
            borderColor: color,
            boxShadow: `0 0 20px ${color}33, 0 0 60px rgba(0,0,0,0.8), 4px 4px 0 #000`,
            padding: 0,
          }}
        >
          {/* Speaker name bar */}
          <div
            style={{
              background: color,
              padding: '6px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>{emoji}</span>
            <span
              className="font-pixel"
              style={{ fontSize: 12, color: '#000', letterSpacing: '0.05em' }}
            >
              {line.speaker.toUpperCase()}
            </span>
            <span
              className="font-pixel ml-auto"
              style={{ fontSize: 9, color: 'rgba(0,0,0,0.6)' }}
            >
              {dialogueLineIndex + 1}/{activeDialogue.lines.length}
            </span>
          </div>

          {/* Text area */}
          <div
            className="font-pixel"
            style={{
              padding: '16px 20px',
              minHeight: 80,
              fontSize: 11,
              color: '#e8f4ff',
              lineHeight: 2,
              letterSpacing: '0.02em',
            }}
          >
            <TypewriterText
              key={`${dialogueLineIndex}-${line.text}`}
              text={line.text}
              speed={28}
              skip={skip}
              onDone={() => setTextDone(true)}
            />
          </div>

          {/* Advance prompt */}
          <div
            style={{
              borderTop: `2px solid ${color}44`,
              padding: '8px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {textDone ? (
              <>
                <span
                  className="font-pixel anim-blink"
                  style={{ fontSize: 10, color }}
                >
                  {isLast ? '▶ [CLOSE]' : '▶ [CONTINUE]'}
                </span>
                <button
                  className={`pixel-btn ${isLast ? 'pixel-btn-red' : 'pixel-btn-green'}`}
                  style={{ fontSize: 10, padding: '6px 14px' }}
                  onClick={e => { e.stopPropagation(); handleAdvance(); }}
                  aria-label={isLast ? 'Close dialogue' : 'Continue dialogue'}
                >
                  {isLast ? '✕ CLOSE' : '→ NEXT'}
                </button>
              </>
            ) : (
              <span
                className="font-pixel"
                style={{ fontSize: 9, color: '#4a5568' }}
              >
                tap to skip...
              </span>
            )}
          </div>
        </div>

        {/* Reward preview */}
        {isLast && activeDialogue.reward && (
          <div
            className="font-pixel mt-2 text-center"
            style={{ fontSize: 10, color: '#00ff88', textShadow: '0 0 8px #00ff88' }}
          >
            {activeDialogue.reward.money && `+$${activeDialogue.reward.money} reward`}
            {activeDialogue.reward.flag && ` ✓ ${activeDialogue.reward.flag.replace(/_/g, ' ').toUpperCase()}`}
          </div>
        )}
      </div>
    </div>
  );
}
