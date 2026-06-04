import { useEffect, useState } from 'react';
import { useGame } from '@/game/store';

const EVENTS = [
  'A pigeon blessed three of your windows. Thanks, pigeon.',
  'You discovered a new soap formula. Accidentally. It was dish soap.',
  'Caviar Claudette watched you work through binoculars. You felt observed.',
  'The Burrito Syndicate opened a new office building. More windows to clean...',
  'Your squeegee blade developed a tiny nick. Watch for streaks.',
  'A city inspector complimented your technique. You blushed.',
  'It rained right after you finished a job. Life is suffering.',
  'Your taco shell is starting to feel a bit crunchy from the city pollution.',
  'You found $5 wedged behind a downspout. Thank you, city.',
  'A Hamburger food blogger reviewed your window washing. 4/5 stars.',
];

export default function DayEndReport() {
  const { state, dispatch } = useGame();
  const { player, dayEndStats, weather } = state;
  const [revealed, setRevealed] = useState(false);
  const [event] = useState(() => EVENTS[Math.floor(Math.random() * EVENTS.length)]);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  const macbookPct = Math.min(100, (player.money / player.macbookPrice) * 100);
  const daysToGo = Math.ceil((player.macbookPrice - player.money) / Math.max(1, dayEndStats?.moneyEarned ?? 30));
  const isAlmostThere = macbookPct >= 80;

  const weatherLabel: Record<string, string> = {
    clear: '☀️ Clear',
    rain: '🌧 Rain — windows dirtied overnight',
    snow: '❄ Snow — ice buildup expected',
    blazing: '🔥 Heat wave incoming',
  };

  return (
    <div className="absolute inset-0 city-bg flex items-center justify-center" style={{ zIndex: 60, paddingTop: 64 }}>
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{ left: `${(i * 2.5) % 100}%`, top: `${(i * 3.7) % 60}%`, width: 2, height: 2, background: '#e8f4ff', opacity: 0.4, animation: `star-twinkle ${2 + i * 0.1}s ease-in-out infinite` }}
          />
        ))}
      </div>

      <div
        className={`relative pixel-box transition-all duration-500 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{
          background: '#080d18',
          borderColor: '#ffd700',
          boxShadow: '0 0 30px rgba(255,215,0,0.15), 8px 8px 0 #000',
          width: 'min(560px, 95vw)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(90deg, #1a1200, #2a1e00)',
            borderBottom: '3px solid #ffd700',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 32, animation: 'float 2s ease-in-out infinite' }}>🌙</span>
          <div className="font-pixel">
            <div style={{ fontSize: 12, color: '#ffd700', textShadow: '0 0 8px #ffd700' }}>END OF DAY {player.day}</div>
            <div style={{ fontSize: 9, color: '#64748b' }}>Daily report — Taco Wash Operations</div>
          </div>
          <div className="ml-auto font-pixel text-right">
            <div style={{ fontSize: 9, color: '#64748b' }}>NEIGHBORHOOD</div>
            <div style={{ fontSize: 11, color: '#ff8c00' }}>{player.neighborhood.toUpperCase()}</div>
          </div>
        </div>

        <div style={{ padding: '16px 20px' }}>
          {/* Stats grid */}
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}
          >
            {[
              { label: 'JOBS DONE', value: dayEndStats?.jobsCompleted ?? 0, emoji: '✅', color: '#00ff88' },
              { label: 'MONEY EARNED', value: `$${dayEndStats?.moneyEarned ?? 0}`, emoji: '💰', color: '#ffd700' },
              { label: 'AVG SCORE', value: `${dayEndStats?.averageScore ?? 0}%`, emoji: '⭐', color: '#00aaff' },
              { label: 'TOTAL SAVINGS', value: `$${player.money}`, emoji: '🏦', color: '#00ff88' },
            ].map(stat => (
              <div
                key={stat.label}
                className="font-pixel"
                style={{ background: 'rgba(255,255,255,0.03)', border: '2px solid #1e3a5f', padding: '10px 12px' }}
              >
                <div style={{ fontSize: 8, color: '#64748b' }}>{stat.emoji} {stat.label}</div>
                <div style={{ fontSize: 14, color: stat.color, marginTop: 4 }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* MacBook progress */}
          <div className="font-pixel mb-4" style={{ background: 'rgba(0,229,204,0.05)', border: '2px solid #00e5cc', padding: '10px 14px' }}>
            <div className="flex justify-between items-center mb-2">
              <div style={{ fontSize: 10, color: '#00e5cc' }}>💻 MACBOOK PRO SAVINGS</div>
              <div style={{ fontSize: 10, color: isAlmostThere ? '#00ff88' : '#64748b' }}>
                ${player.money} / ${player.macbookPrice}
              </div>
            </div>
            <div className="pixel-bar" style={{ borderColor: '#00e5cc', background: '#0a0e1a', width: '100%', height: 16 }}>
              <div
                className="pixel-bar-fill"
                style={{ width: `${macbookPct}%`, background: 'linear-gradient(90deg, #00e5cc, #00ff88)', height: '100%' }}
              />
            </div>
            <div style={{ fontSize: 9, color: '#64748b', marginTop: 6 }}>
              {isAlmostThere
                ? `🎉 SO CLOSE! Only $${player.macbookPrice - player.money} to go!`
                : `Est. ${daysToGo} more days at this rate`
              }
            </div>
          </div>

          {/* Tomorrow's weather */}
          <div className="font-pixel mb-4" style={{ fontSize: 10, color: '#64748b', background: 'rgba(0,0,0,0.3)', border: '2px solid #1e3a5f', padding: '8px 12px' }}>
            <span style={{ color: '#00aaff' }}>TOMORROW:</span>
            &nbsp;{weatherLabel[weather] ?? '☀️ Clear'}
          </div>

          {/* Random event */}
          <div
            className="font-pixel mb-4"
            style={{ fontSize: 10, color: '#bf5fff', background: 'rgba(191,95,255,0.06)', border: '2px solid #bf5fff44', padding: '8px 12px', lineHeight: 2, fontStyle: 'italic' }}
          >
            📰 CITY SCOOP: {event}
          </div>

          {/* Neighborhood unlock hint */}
          {player.neighborhood === 'slums' && player.money >= 200 && (
            <div
              className="font-pixel mb-4"
              style={{ fontSize: 10, color: '#ffd700', background: 'rgba(255,215,0,0.06)', border: '2px solid #ffd70044', padding: '8px 12px' }}
            >
              🔓 THE SUBURBS are now accessible! Visit the World Map.
            </div>
          )}

          {/* Story progression hint */}
          {player.completedJobs.length >= 3 && !player.storyFlags.includes('reached_highrise') && (
            <div
              className="font-pixel mb-4"
              style={{ fontSize: 9, color: '#ff3333', background: 'rgba(255,51,51,0.06)', border: '2px solid #ff333344', padding: '8px 12px', lineHeight: 2 }}
            >
              🌯 Rumor has it... the Burrito King operates from the High-Rise District.<br />
              Keep earning. Keep training. Your time will come.
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div
          style={{
            borderTop: '2px solid #1e3a5f',
            padding: '12px 20px',
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
          }}
        >
          <button
            className="pixel-btn pixel-btn-green"
            style={{ fontSize: 11, padding: '10px 24px' }}
            onClick={() => dispatch({ type: 'START_DAY' })}
            aria-label="Start next day"
          >
            ▶ START DAY {player.day + 1}
          </button>
          <button
            className="pixel-btn pixel-btn-blue"
            style={{ fontSize: 11, padding: '10px 16px' }}
            onClick={() => { dispatch({ type: 'START_DAY' }); setTimeout(() => {}, 10); }}
            aria-label="Open shop before next day"
          >
            🛒 SHOP
          </button>
        </div>
      </div>
    </div>
  );
}
