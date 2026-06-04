import { useGame } from '@/game/store';
import { NEIGHBORHOODS, TRAINING_COUNTRIES } from '@/game/constants';

export default function WorldMap() {
  const { state, dispatch, navigate } = useGame();
  const { player } = state;

  const hasFlag = (flag: string) => player.storyFlags.includes(flag);
  const cruiseUnlocked = hasFlag('cruise_unlocked') || hasFlag('lost_to_burrito');

  const neighborhoods = [
    { id: 'slums', data: NEIGHBORHOODS.slums, unlocked: true },
    { id: 'suburbs', data: NEIGHBORHOODS.suburbs, unlocked: player.money >= 150 || hasFlag('unlocked_suburbs') },
    { id: 'highrise', data: NEIGHBORHOODS.highrise, unlocked: player.money >= 500 || hasFlag('unlocked_highrise') },
  ] as const;

  return (
    <div className="absolute inset-0 city-bg flex flex-col" style={{ paddingTop: 64 }}>
      {/* Header */}
      <div
        style={{
          borderBottom: '3px solid #1e3a5f',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0,0,0,0.6)',
          flexShrink: 0,
        }}
      >
        <div className="font-pixel">
          <div style={{ fontSize: 12, color: '#ffd700', textShadow: '0 0 8px #ffd700' }}>🗺 WORLD MAP</div>
          <div style={{ fontSize: 9, color: '#64748b' }}>Taco Metropolis & Beyond</div>
        </div>
        <button
          className="pixel-btn pixel-btn-gray"
          style={{ fontSize: 11 }}
          onClick={() => navigate('street')}
          aria-label="Back to street"
        >
          ← BACK
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {/* City map grid */}
        <div className="font-pixel mb-4" style={{ fontSize: 10, color: '#64748b' }}>THE CITY</div>

        <div className="grid gap-3 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {neighborhoods.map(({ id, data, unlocked }) => {
            const isCurrent = player.neighborhood === id;
            return (
              <div
                key={id}
                className="font-pixel"
                style={{
                  border: `3px solid ${isCurrent ? data.color : unlocked ? data.color + '66' : '#1e3a5f'}`,
                  background: isCurrent ? `${data.color}15` : unlocked ? `${data.color}08` : 'rgba(0,0,0,0.3)',
                  padding: 16,
                  cursor: unlocked ? 'pointer' : 'default',
                  transition: 'all 0.1s',
                  boxShadow: isCurrent ? `0 0 20px ${data.color}33` : 'none',
                  opacity: unlocked ? 1 : 0.5,
                }}
                onClick={() => {
                  if (unlocked) {
                    dispatch({ type: 'NAVIGATE', screen: 'street' });
                  }
                }}
              >
                <div style={{ fontSize: 11, color: unlocked ? data.color : '#4a5568', marginBottom: 4 }}>
                  {isCurrent ? '▶ ' : ''}{data.name.toUpperCase()}
                  {!unlocked && ' 🔒'}
                </div>
                <div style={{ fontSize: 9, color: '#64748b', marginBottom: 8 }}>{data.subtitle}</div>
                <div style={{ fontSize: 9, color: '#4a5568' }}>
                  Pay: ${data.minPay}–${data.maxPay}/job
                </div>
                {!unlocked && (
                  <div style={{ fontSize: 8, color: '#ff3333', marginTop: 4 }}>
                    {id === 'suburbs' ? 'Unlock: Save $150' : 'Unlock: Save $500'}
                  </div>
                )}
                {isCurrent && (
                  <div
                    className="mt-2"
                    style={{ fontSize: 9, color: data.color, background: `${data.color}22`, padding: '3px 6px', border: `1px solid ${data.color}44`, display: 'inline-block' }}
                  >
                    ● CURRENT LOCATION
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cruise Arc */}
        <div className="font-pixel mb-4" style={{ fontSize: 10, color: '#64748b' }}>
          WORLD TRAINING ARC
          {!cruiseUnlocked && <span style={{ color: '#ff3333', marginLeft: 8 }}>🔒 (Unlock: Lose to Burrito King)</span>}
        </div>

        <div
          className="grid gap-2 mb-8"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            opacity: cruiseUnlocked ? 1 : 0.4,
          }}
        >
          {TRAINING_COUNTRIES.map((country, i) => {
            const trained = hasFlag(country.flag_key);
            const isNext = !trained && i === player.trainingCountry && cruiseUnlocked;
            return (
              <div
                key={country.name}
                className="font-pixel"
                style={{
                  border: `2px solid ${trained ? '#00ff88' : isNext ? '#ffd700' : '#1e3a5f'}`,
                  background: trained ? 'rgba(0,255,136,0.05)' : isNext ? 'rgba(255,215,0,0.05)' : 'rgba(0,0,0,0.2)',
                  padding: 10,
                  cursor: cruiseUnlocked && isNext ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (cruiseUnlocked && isNext) navigate('cruise');
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 4 }}>{country.flag} {country.emoji}</div>
                <div style={{ fontSize: 11, color: trained ? '#00ff88' : isNext ? '#ffd700' : '#4a5568' }}>
                  {country.name}
                  {trained && ' ✓'}
                  {isNext && ' ←'}
                </div>
                <div style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>{country.skill}</div>
                {trained && <div style={{ fontSize: 8, color: '#00ff88', marginTop: 3 }}>✓ {country.perk.split('—')[0]}</div>}
              </div>
            );
          })}
        </div>

        {/* Championship */}
        {player.championshipUnlocked && (
          <>
            <div className="font-pixel mb-4" style={{ fontSize: 10, color: '#bf5fff' }}>🏆 GLOBAL CHAMPIONSHIP</div>
            <div
              className="font-pixel"
              style={{ border: '3px solid #bf5fff', background: 'rgba(191,95,255,0.1)', padding: 16, boxShadow: '0 0 20px rgba(191,95,255,0.2)', cursor: 'pointer' }}
              onClick={() => navigate('championship')}
            >
              <div style={{ fontSize: 12, color: '#bf5fff' }}>⚔ GLOBAL WINDOW WASHING CHAMPIONSHIP</div>
              <div style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>Final battle. Win it all. Buy the MacBook. Expose the Burrito Syndicate.</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                {['🍔', '🌭', '🍟', '🌯'].map((e, i) => (
                  <div key={i} style={{ fontSize: 24 }}>{e}</div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
