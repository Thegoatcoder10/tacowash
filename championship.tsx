import { useState, useEffect } from 'react';
import { useGame } from '@/game/store';

type Phase = 'intro' | 'battle' | 'result';

const BOSS_LINES = [
  '"You dare challenge me? I own this city\'s filth!"',
  '"My syndicate controls every window in the high-rise!"',
  '"A taco? Against ME? This is an insult!"',
  '"I will crush you like a... like a burrito! A very well-wrapped burrito!"',
];

const ROUNDS = 3;
const CELLS_PER_ROUND = 9;

export default function Championship() {
  const { state, dispatch, navigate } = useGame();
  const { player } = state;

  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [bossScore, setBossScore] = useState(0);
  const [cells, setCells] = useState<boolean[]>(Array(CELLS_PER_ROUND).fill(false));
  const [bossLine] = useState(() => BOSS_LINES[Math.floor(Math.random() * BOSS_LINES.length)]);
  const [rocking, setRocking] = useState(0);
  const [winner, setWinner] = useState<'player' | 'boss' | null>(null);
  const [roundFlash, setRoundFlash] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== 'battle') return;
    const t = setInterval(() => {
      setRocking(Math.sin(Date.now() / 600) * 12);
    }, 50);
    return () => clearInterval(t);
  }, [phase]);

  const handleCellClean = (i: number) => {
    if (cells[i]) return;
    const missChance = Math.abs(rocking) / 12 * 0.35;
    if (Math.random() < missChance) return;
    const next = [...cells];
    next[i] = true;
    setCells(next);

    if (next.every(Boolean)) {
      const roundPlayerScore = Math.round(70 + Math.random() * 30);
      const roundBossScore = Math.round(55 + Math.random() * 40);
      const newPlayer = playerScore + roundPlayerScore;
      const newBoss = bossScore + roundBossScore;
      setPlayerScore(newPlayer);
      setBossScore(newBoss);

      const won = roundPlayerScore > roundBossScore;
      setRoundFlash(won ? `ROUND ${round} — YOU WIN! +${roundPlayerScore} vs Boss +${roundBossScore}` : `ROUND ${round} — BOSS WINS! +${roundPlayerScore} vs Boss +${roundBossScore}`);

      setTimeout(() => {
        setRoundFlash(null);
        if (round >= ROUNDS) {
          setWinner(newPlayer > newBoss ? 'player' : 'boss');
          setPhase('result');
        } else {
          setRound(r => r + 1);
          setCells(Array(CELLS_PER_ROUND).fill(false));
        }
      }, 2000);
    }
  };

  const handleFinish = () => {
    if (winner === 'player') {
      dispatch({ type: 'ADD_STORY_FLAG', flag: 'championship_won' });
      navigate('ending');
    } else {
      dispatch({ type: 'ADD_STORY_FLAG', flag: 'championship_lost' });
      navigate('street');
    }
  };

  return (
    <div className="absolute inset-0 city-bg flex flex-col items-center justify-center" style={{ paddingTop: 64, padding: 20 }}>
      {/* Boss header */}
      <div
        className="pixel-box font-pixel mb-4 w-full"
        style={{
          maxWidth: 600,
          borderColor: '#bf5fff',
          background: '#0d0818',
          padding: '14px 20px',
          boxShadow: '0 0 30px rgba(191,95,255,0.3), 8px 8px 0 #000',
        }}
      >
        <div className="flex items-center gap-4">
          <div style={{ fontSize: 48, animation: 'float 1.5s ease-in-out infinite' }}>🌯</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#bf5fff', textShadow: '0 0 8px #bf5fff' }}>
              ⚔ GLOBAL CHAMPIONSHIP FINAL
            </div>
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>vs THE BURRITO KING</div>
            {phase === 'intro' && (
              <div style={{ fontSize: 9, color: '#ff3333', marginTop: 6, lineHeight: 1.8, fontStyle: 'italic' }}>
                {bossLine}
              </div>
            )}
          </div>
          <div style={{ fontSize: 48, animation: 'float 2s ease-in-out infinite' }}>🌮</div>
        </div>

        {phase === 'battle' && (
          <div className="flex justify-between mt-4" style={{ borderTop: '2px solid #bf5fff44', paddingTop: 8 }}>
            <div className="text-center">
              <div style={{ fontSize: 9, color: '#64748b' }}>🌮 YOU</div>
              <div style={{ fontSize: 16, color: '#00ff88', textShadow: '0 0 8px #00ff88' }}>{playerScore}</div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: 12, color: '#bf5fff' }}>ROUND {round}/{ROUNDS}</div>
              <div style={{ fontSize: 9, color: '#64748b' }}>clean faster!</div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: 9, color: '#64748b' }}>🌯 BOSS</div>
              <div style={{ fontSize: 16, color: '#ff3333', textShadow: '0 0 8px #ff3333' }}>{bossScore}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: 600 }}>
        {phase === 'intro' && (
          <div className="pixel-box font-pixel" style={{ borderColor: '#bf5fff44', background: '#080d18', padding: 20 }}>
            <div style={{ fontSize: 11, color: '#e8f4ff', lineHeight: 2.2, marginBottom: 16 }}>
              You've trained across <span style={{ color: '#ffd700' }}>7 countries</span>. You've washed a thousand windows.
              <br /><br />
              Now the Burrito King stands before you — the man who burned your family's taco truck, who controls the city's
              filth from his high-rise throne.
              <br /><br />
              <span style={{ color: '#bf5fff' }}>3 rounds. Best total score wins.</span>
              <br />
              Win, and the city is yours. Lose... and the syndicate wins forever.
            </div>
            <button
              className="pixel-btn pixel-btn-green"
              style={{ fontSize: 12, padding: '10px 24px' }}
              onClick={() => setPhase('battle')}
            >
              ⚔ BEGIN FINAL BATTLE
            </button>
          </div>
        )}

        {phase === 'battle' && (
          <div
            style={{
              transform: `rotate(${rocking}deg)`,
              transition: 'transform 0.1s',
            }}
          >
            <div className="pixel-box font-pixel" style={{ borderColor: '#bf5fff', background: '#080d18', padding: 20 }}>
              <div style={{ fontSize: 10, color: '#bf5fff', marginBottom: 8 }}>
                🏆 CHAMPIONSHIP WINDOW — CLEAN THEM ALL!
              </div>
              <div style={{ fontSize: 9, color: '#64748b', marginBottom: 12 }}>
                Rocking: <span style={{ color: Math.abs(rocking) > 6 ? '#ff3333' : '#ffd700' }}>
                  {Math.abs(rocking) > 6 ? 'EXTREME' : 'HEAVY'}
                </span>
              </div>

              {roundFlash && (
                <div
                  style={{
                    background: 'rgba(191,95,255,0.15)',
                    border: '2px solid #bf5fff',
                    padding: '8px 12px',
                    marginBottom: 12,
                    fontSize: 10,
                    color: '#bf5fff',
                    textAlign: 'center',
                    animation: 'anim-blink 0.5s ease-in-out',
                  }}
                >
                  {roundFlash}
                </div>
              )}

              <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {cells.map((cleaned, i) => (
                  <button
                    key={i}
                    onClick={() => handleCellClean(i)}
                    disabled={cleaned || !!roundFlash}
                    style={{
                      height: 72,
                      border: `3px solid ${cleaned ? '#00ff88' : '#bf5fff'}`,
                      background: cleaned ? 'rgba(0,255,136,0.1)' : 'rgba(191,95,255,0.1)',
                      cursor: cleaned ? 'default' : 'pointer',
                      fontSize: cleaned ? 28 : 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: cleaned ? '0 0 12px rgba(0,255,136,0.3)' : '0 0 8px rgba(191,95,255,0.2)',
                      transition: 'all 0.15s',
                    }}
                    aria-label={`Window ${i + 1} ${cleaned ? 'clean' : 'dirty'}`}
                  >
                    {cleaned ? '✓' : '🌯'}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 9, color: '#64748b' }}>
                {cells.filter(Boolean).length}/{CELLS_PER_ROUND} windows cleaned this round
              </div>
            </div>
          </div>
        )}

        {phase === 'result' && winner && (
          <div
            className="pixel-box font-pixel anim-slide-up"
            style={{
              borderColor: winner === 'player' ? '#ffd700' : '#ff3333',
              background: '#080d18',
              padding: 24,
              textAlign: 'center',
              boxShadow: winner === 'player'
                ? '0 0 40px rgba(255,215,0,0.3), 8px 8px 0 #000'
                : '0 0 40px rgba(255,51,51,0.3), 8px 8px 0 #000',
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 12, animation: 'victory-bounce 0.5s ease-in-out infinite' }}>
              {winner === 'player' ? '🏆' : '😭'}
            </div>
            <div style={{ fontSize: 14, color: winner === 'player' ? '#ffd700' : '#ff3333', textShadow: `0 0 12px ${winner === 'player' ? '#ffd700' : '#ff3333'}`, marginBottom: 8 }}>
              {winner === 'player' ? 'CHAMPION!' : 'DEFEATED...'}
            </div>
            <div style={{ fontSize: 11, color: '#e8f4ff', marginBottom: 4 }}>
              Final Score — You: <span style={{ color: '#00ff88' }}>{playerScore}</span> | Boss: <span style={{ color: '#ff3333' }}>{bossScore}</span>
            </div>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 16, lineHeight: 2 }}>
              {winner === 'player'
                ? 'The crowd erupts. The Burrito King drops his squeegee. You did it.'
                : 'The Burrito King laughs. "Come back when you\'re cleaner, taco."'}
            </div>
            <button
              className={`pixel-btn ${winner === 'player' ? 'pixel-btn-yellow' : 'pixel-btn-red'}`}
              style={{ fontSize: 12, padding: '10px 24px' }}
              onClick={handleFinish}
            >
              {winner === 'player' ? '🏆 CLAIM VICTORY' : '↩ RETURN HOME'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
