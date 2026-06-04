import { useState, useEffect } from 'react';
import { useGame } from '@/game/store';
import { TRAINING_COUNTRIES } from '@/game/constants';

type Phase = 'intro' | 'minigame' | 'result';

const SHIP_WASH_CELLS = 6;

export default function TrainingArc() {
  const { state, dispatch, navigate } = useGame();
  const { player } = state;
  const [phase, setPhase] = useState<Phase>('intro');
  const [cleanedCells, setCleanedCells] = useState<boolean[]>(Array(SHIP_WASH_CELLS).fill(false));
  const [rocking, setRocking] = useState(0);
  const [score, setScore] = useState(0);

  const countryIndex = player.trainingCountry;
  const country = TRAINING_COUNTRIES[countryIndex];

  // Ship rocking effect
  useEffect(() => {
    if (phase !== 'minigame') return;
    const t = setInterval(() => {
      setRocking(Math.sin(Date.now() / 800) * 8);
    }, 50);
    return () => clearInterval(t);
  }, [phase]);

  if (!country) {
    return (
      <div className="absolute inset-0 city-bg flex items-center justify-center" style={{ paddingTop: 64 }}>
        <div className="font-pixel text-center" style={{ color: '#00ff88', fontSize: 12 }}>
          ALL COUNTRIES TRAINED!<br />
          <button className="pixel-btn pixel-btn-green mt-4" style={{ fontSize: 11 }} onClick={() => {
            dispatch({ type: 'ADD_STORY_FLAG', flag: 'all_trained' });
            navigate('street');
          }}>
            ← RETURN HOME
          </button>
        </div>
      </div>
    );
  }

  const handleCellClean = (i: number) => {
    if (cleanedCells[i]) return;
    // Rocking makes some cells harder — chance of missing
    const missChance = Math.abs(rocking) / 8 * 0.3;
    if (Math.random() < missChance) return;
    const newCells = [...cleanedCells];
    newCells[i] = true;
    setCleanedCells(newCells);
    if (newCells.every(Boolean)) {
      const finalScore = Math.round(80 + Math.random() * 20);
      setScore(finalScore);
      setPhase('result');
    }
  };

  const handleTrainingComplete = () => {
    dispatch({ type: 'ADD_STORY_FLAG', flag: country.flag_key });
    if (countryIndex + 1 >= TRAINING_COUNTRIES.length) {
      dispatch({ type: 'ADD_STORY_FLAG', flag: 'all_trained' });
      dispatch({ type: 'ADD_STORY_FLAG', flag: 'championship_unlocked' });
      navigate('worldmap');
    } else {
      navigate('worldmap');
    }
  };

  return (
    <div
      className="absolute inset-0 city-bg flex flex-col items-center justify-center"
      style={{ paddingTop: 64, padding: 20 }}
    >
      {/* Ship rocking container */}
      <div
        style={{
          transform: phase === 'minigame' ? `rotate(${rocking}deg)` : 'none',
          transition: 'transform 0.1s',
          width: '100%',
          maxWidth: 600,
        }}
      >
        {/* Country header */}
        <div
          className="pixel-box font-pixel mb-4"
          style={{
            borderColor: country.color || '#00aaff',
            background: '#080d18',
            padding: '14px 20px',
            boxShadow: `0 0 20px ${country.color || '#00aaff'}44, 8px 8px 0 #000`,
          }}
        >
          <div className="flex items-center gap-4">
            <div style={{ fontSize: 48 }}>{country.flag} {country.emoji}</div>
            <div>
              <div style={{ fontSize: 12, color: country.color || '#00aaff' }}>
                TRAINING: {country.name.toUpperCase()}
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Teacher: {country.teacher}</div>
              <div style={{ fontSize: 9, color: '#ffd700', marginTop: 4 }}>
                SKILL: {country.skill}
              </div>
            </div>
          </div>
        </div>

        {phase === 'intro' && (
          <div className="pixel-box font-pixel" style={{ borderColor: '#1e3a5f', background: '#080d18', padding: 20 }}>
            <div style={{ fontSize: 11, color: '#e8f4ff', lineHeight: 2.2, marginBottom: 16 }}>
              <span style={{ fontSize: 14 }}>{country.emoji}</span>
              {' '}Your cruise ship has docked in <span style={{ color: country.color || '#00aaff' }}>{country.name}</span>.<br />
              <br />
              To pay for your passage, you must clean the ship's salt-crusted portholes.
              <br />
              Watch out — the ocean is rough today.
              <br /><br />
              <span style={{ color: '#ffd700' }}>Master perk: {country.perk}</span>
            </div>
            <button
              className="pixel-btn pixel-btn-green"
              style={{ fontSize: 12, padding: '10px 24px' }}
              onClick={() => setPhase('minigame')}
              aria-label="Start training"
            >
              ▶ BEGIN TRAINING
            </button>
          </div>
        )}

        {phase === 'minigame' && (
          <div className="pixel-box font-pixel" style={{ borderColor: '#00aaff', background: '#080d18', padding: 20 }}>
            <div style={{ fontSize: 10, color: '#00aaff', marginBottom: 12 }}>
              🚢 SHIP PORTHOLE CLEANING — OCEAN IS ROCKING!
            </div>
            <div style={{ fontSize: 9, color: '#64748b', marginBottom: 12 }}>
              Rocking: <span style={{ color: Math.abs(rocking) > 4 ? '#ff3333' : '#ffd700' }}>{Math.abs(rocking) > 4 ? 'HEAVY' : 'MODERATE'}</span>
              {' '}— tap each porthole to clean it
            </div>
            <div className="flex gap-3 flex-wrap justify-center mb-4">
              {cleanedCells.map((cleaned, i) => (
                <button
                  key={i}
                  onClick={() => handleCellClean(i)}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    border: `4px solid ${cleaned ? '#00ff88' : '#00aaff'}`,
                    background: cleaned ? 'rgba(0,255,136,0.15)' : 'rgba(100,150,200,0.2)',
                    cursor: cleaned ? 'default' : 'pointer',
                    fontSize: cleaned ? 28 : 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: cleaned ? '0 0 12px rgba(0,255,136,0.4)' : 'none',
                    transition: 'all 0.15s',
                  }}
                  disabled={cleaned}
                  aria-label={`Porthole ${i + 1} ${cleaned ? 'cleaned' : 'dirty'}`}
                >
                  {cleaned ? '✓' : '🌊'}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 9, color: '#64748b' }}>
              {cleanedCells.filter(Boolean).length}/{SHIP_WASH_CELLS} portholes cleaned
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div
            className="pixel-box font-pixel anim-slide-up"
            style={{ borderColor: '#00ff88', background: '#080d18', padding: 24, textAlign: 'center' }}
          >
            <div style={{ fontSize: 48, marginBottom: 8, animation: 'victory-bounce 0.5s ease-in-out infinite' }}>
              {country.emoji}
            </div>
            <div style={{ fontSize: 12, color: '#00ff88', textShadow: '0 0 8px #00ff88', marginBottom: 8 }}>
              TECHNIQUE MASTERED!
            </div>
            <div style={{ fontSize: 11, color: '#ffd700', marginBottom: 4 }}>{country.skill}</div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 16 }}>{country.perk}</div>
            <div style={{ fontSize: 12, color: '#e8f4ff', marginBottom: 16 }}>
              Score: <span style={{ color: '#00ff88' }}>{score}%</span>
            </div>
            <div style={{ fontSize: 9, color: '#64748b', marginBottom: 20, lineHeight: 2 }}>
              The {country.teacher} bows respectfully.<br />
              "You have learned well, taco. Carry this knowledge home."
            </div>
            <button
              className="pixel-btn pixel-btn-green"
              style={{ fontSize: 12, padding: '10px 24px' }}
              onClick={handleTrainingComplete}
              aria-label="Continue journey"
            >
              → CONTINUE JOURNEY
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
