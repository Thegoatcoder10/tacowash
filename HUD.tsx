import { useState } from 'react';
import { useGame } from '@/game/store';

// Market-stall style nav button — full HUD height, coloured awning stripe
function NavStall({ emoji, label, color, onClick, ariaLabel }: {
  emoji: string; label: string; color: string; onClick: () => void; ariaLabel: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={ariaLabel}
      className="flex flex-col items-center justify-center relative"
      style={{
        width: 54,
        height: '100%',
        background: hovered ? `${color}14` : 'transparent',
        border: 'none',
        borderLeft: '2px solid #1e3a5f',
        cursor: 'pointer',
        gap: 3,
        transition: 'background 0.12s',
        padding: '0 4px',
      }}
    >
      {/* Awning stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 5,
        background: color,
        boxShadow: hovered ? `0 0 10px ${color}99` : `0 0 4px ${color}44`,
        transition: 'box-shadow 0.12s',
      }} />
      <span style={{ fontSize: 20, lineHeight: 1, marginTop: 4 }}>{emoji}</span>
      <span className="font-pixel" style={{
        fontSize: 7,
        color: hovered ? color : '#4a5568',
        letterSpacing: '0.03em',
        transition: 'color 0.12s',
      }}>{label}</span>
    </button>
  );
}

function StatBar({ value, max, color, label, emoji }: {
  value: number; max: number; color: string; label: string; emoji: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span style={{ fontSize: 14 }}>{emoji}</span>
      <div className="flex-1" style={{ minWidth: 60 }}>
        <div className="font-pixel" style={{ fontSize: 8, color: '#64748b', marginBottom: 2 }}>{label}</div>
        <div className="pixel-bar" style={{ borderColor: color, background: '#0a0e1a', width: '100%' }}>
          <div
            className="pixel-bar-fill"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
      <div className="font-pixel" style={{ fontSize: 9, color, minWidth: 28, textAlign: 'right' }}>
        {Math.round(value)}
      </div>
    </div>
  );
}

export default function HUD() {
  const { state, dispatch, navigate } = useGame();
  const { player, weather, washSession, screen, notification } = state;

  const weatherIcons: Record<string, string> = {
    clear: '☀️', rain: '🌧️', snow: '❄️', blazing: '🔥',
  };
  const weatherColors: Record<string, string> = {
    clear: '#ffd700', rain: '#00aaff', snow: '#e8f4ff', blazing: '#ff3333',
  };

  const activeTool = player.tools.find(t => t.id === player.activeTool);
  const macbookPct = Math.min(100, (player.money / player.macbookPrice) * 100);

  const isWashing = screen === 'washing';

  return (
    <>
      {/* Top HUD bar */}
      <div
        className="absolute top-0 left-0 right-0 z-50 flex items-stretch"
        style={{
          background: 'linear-gradient(180deg, rgba(5,8,16,0.98) 0%, rgba(10,14,26,0.92) 100%)',
          borderBottom: '3px solid #1e3a5f',
          height: 64,
        }}
      >
        {/* Left: Day + Weather */}
        <div
          className="flex flex-col justify-center px-3 font-pixel"
          style={{ borderRight: '2px solid #1e3a5f', minWidth: 90 }}
        >
          <div style={{ fontSize: 10, color: '#64748b' }}>DAY</div>
          <div style={{ fontSize: 18, color: '#ffd700', lineHeight: 1, textShadow: '0 0 8px #ffd700' }}>
            {String(player.day).padStart(3, '0')}
          </div>
          <div style={{ fontSize: 10 }}>
            <span>{weatherIcons[weather]}</span>
            <span style={{ color: weatherColors[weather], marginLeft: 4 }}>{weather.toUpperCase()}</span>
          </div>
        </div>

        {/* Center: Stats */}
        <div className="flex-1 flex flex-col justify-center px-3 gap-1" style={{ minWidth: 0 }}>
          <StatBar value={player.health} max={player.maxHealth} color="#ff3333" label="HEALTH" emoji="❤️" />
          <StatBar value={player.salsaBoost} max={100} color="#ff8c00" label="SALSA" emoji="🌶️" />
        </div>

        {/* Right: Money + MacBook */}
        <div
          className="flex flex-col justify-center px-3 font-pixel"
          style={{ borderLeft: '2px solid #1e3a5f', minWidth: 130 }}
        >
          <div style={{ fontSize: 9, color: '#64748b' }}>WALLET</div>
          <div style={{ fontSize: 16, color: '#00ff88', lineHeight: 1.2, textShadow: '0 0 8px #00ff88' }}>
            ${player.money.toLocaleString()}
          </div>
          <div style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>💻 MACBOOK ${player.macbookPrice.toLocaleString()}</div>
          <div className="pixel-bar" style={{ borderColor: '#00e5cc', background: '#0a0e1a', width: '100%', height: 8, marginTop: 2 }}>
            <div
              className="pixel-bar-fill"
              style={{ width: `${macbookPct}%`, background: '#00e5cc', height: '100%' }}
            />
          </div>
        </div>

        {/* Far right: market stall nav buttons */}
        {!isWashing && (
          <div className="flex h-full">
            <NavStall emoji="🛒" label="SHOP"  color="#00aaff" onClick={() => navigate('shop')}                           ariaLabel="Open shop" />
            <NavStall emoji="🗺" label="MAP"   color="#ffd700" onClick={() => navigate('worldmap')}                       ariaLabel="Open world map" />
            <NavStall emoji="💾" label="SAVE"  color="#00ff88" onClick={() => dispatch({ type: 'TOGGLE_SAVE_MENU' })}    ariaLabel="Save game" />
          </div>
        )}
      </div>


      {/* Notification toast */}
      {notification && (
        <div
          className="absolute font-pixel anim-slide-down"
          style={{
            top: 72,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#111827',
            border: '3px solid #00ff88',
            boxShadow: '0 0 12px rgba(0,255,136,0.4), 4px 4px 0 #000',
            padding: '8px 20px',
            fontSize: 11,
            color: '#00ff88',
            zIndex: 100,
            whiteSpace: 'nowrap',
            textShadow: '0 0 8px #00ff88',
          }}
        >
          {notification}
        </div>
      )}

      {/* Story flag badges */}
      {player.storyFlags.includes('trained_japan') && (
        <div
          className="absolute font-pixel"
          style={{ top: 70, right: 8, fontSize: 9, color: '#bf5fff', background: '#111827', border: '2px solid #bf5fff', padding: '3px 6px' }}
        >
          ZEN FOCUS
        </div>
      )}
    </>
  );
}
