import { useState, useEffect } from 'react';
import { useGame } from '@/game/store';

const BLOG_POSTS = [
  { title: 'EXCLUSIVE: Inside the Burrito Syndicate\'s Window-Washing Monopoly', reads: '14.2K', viral: false },
  { title: 'How One Taco Exposed City Hall\'s Dirty Deals (And Dirtier Windows)', reads: '89.7K', viral: true },
  { title: 'The Squeegee That Toppled an Empire: A Window Washer\'s Story', reads: '203K', viral: true },
  { title: 'FOLLOW-UP: Burrito King Arrested. 47 Buildings Seized.', reads: '1.1M', viral: true },
];

export default function Ending() {
  const { state } = useGame();
  const { player } = state;

  const [phase, setPhase] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [totalReads, setTotalReads] = useState(0);
  const [macbookPurchased, setMacbookPurchased] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 800);
    return () => clearTimeout(t);
  }, []);

  const handleBuyMacbook = () => {
    setMacbookPurchased(true);
    setTimeout(() => setPhase(2), 600);
  };

  const handlePublish = (i: number) => {
    if (i !== publishedCount) return;
    const post = BLOG_POSTS[i];
    const reads = parseFloat(post.reads) * (post.reads.includes('M') ? 1000000 : post.reads.includes('K') ? 1000 : 1);
    setTotalReads(r => r + reads);
    setPublishedCount(c => c + 1);
  };

  const allPublished = publishedCount >= BLOG_POSTS.length;

  return (
    <div className="absolute inset-0 city-bg flex flex-col items-center justify-center overflow-auto" style={{ paddingTop: 64, paddingBottom: 40 }}>
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 1.67) % 100}%`,
              top: `${(i * 2.3) % 80}%`,
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              background: '#e8f4ff',
              opacity: 0.3 + (i % 5) * 0.1,
              animation: `star-twinkle ${2 + (i % 4)}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative font-pixel" style={{ width: 'min(600px, 95vw)', zIndex: 1 }}>

        {/* Victory header */}
        <div
          className={`pixel-box mb-4 transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{
            borderColor: '#ffd700',
            background: '#0d0c00',
            padding: 24,
            textAlign: 'center',
            boxShadow: '0 0 40px rgba(255,215,0,0.25), 8px 8px 0 #000',
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 8, animation: 'victory-bounce 0.6s ease-in-out infinite' }}>🏆</div>
          <div style={{ fontSize: 16, color: '#ffd700', textShadow: '0 0 16px #ffd700', marginBottom: 4 }}>
            CHAMPION OF THE WORLD
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginBottom: 12 }}>
            Day {player.day} — Total Saved: ${player.money}
          </div>
          <div style={{ fontSize: 11, color: '#e8f4ff', lineHeight: 2.2 }}>
            You stood at the top of the gleaming high-rise, squeegee in hand.
            <br />
            The Burrito King was gone. The syndicate was finished.
            <br />
            The city's windows had never been cleaner.
          </div>
        </div>

        {/* MacBook purchase */}
        {phase >= 1 && !macbookPurchased && (
          <div
            className="pixel-box mb-4 anim-slide-up"
            style={{ borderColor: '#00e5cc', background: '#001a18', padding: 20 }}
          >
            <div style={{ fontSize: 11, color: '#00e5cc', textShadow: '0 0 8px #00e5cc', marginBottom: 8 }}>
              💻 THE MACBOOK PRO
            </div>
            <div style={{ fontSize: 10, color: '#e8f4ff', lineHeight: 2, marginBottom: 12 }}>
              You walk into the Apple Store. Everyone stares at the taco in squeegee harness.
              <br />
              You place <span style={{ color: '#ffd700' }}>${player.macbookPrice}</span> in crisp bills on the counter.
              <br />
              The Genius says nothing. He knows.
            </div>
            <button
              className="pixel-btn pixel-btn-green"
              style={{ fontSize: 12, padding: '10px 24px' }}
              onClick={handleBuyMacbook}
            >
              💰 BUY THE MACBOOK (${player.macbookPrice})
            </button>
          </div>
        )}

        {macbookPurchased && phase < 2 && (
          <div className="pixel-box mb-4 font-pixel text-center" style={{ borderColor: '#00e5cc', background: '#001a18', padding: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 4, animation: 'float 1s ease-in-out infinite' }}>💻</div>
            <div style={{ fontSize: 12, color: '#00e5cc' }}>MACBOOK PRO ACQUIRED!</div>
          </div>
        )}

        {/* Blog phase */}
        {phase >= 2 && (
          <div className="pixel-box mb-4 anim-slide-up" style={{ borderColor: '#bf5fff', background: '#0d0018', padding: 20 }}>
            <div style={{ fontSize: 11, color: '#bf5fff', textShadow: '0 0 8px #bf5fff', marginBottom: 4 }}>
              📰 TACO TRUTH — INVESTIGATIVE BLOG
            </div>
            <div style={{ fontSize: 9, color: '#64748b', marginBottom: 16 }}>
              You boot up the MacBook. Time to expose everything.
            </div>

            <div className="flex flex-col gap-2">
              {BLOG_POSTS.map((post, i) => {
                const published = i < publishedCount;
                const isNext = i === publishedCount;
                return (
                  <div
                    key={i}
                    style={{
                      border: `2px solid ${published ? '#00ff88' : isNext ? '#bf5fff' : '#1e3a5f'}`,
                      background: published ? 'rgba(0,255,136,0.05)' : isNext ? 'rgba(191,95,255,0.05)' : 'rgba(0,0,0,0.2)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: isNext ? 'pointer' : 'default',
                      transition: 'all 0.1s',
                    }}
                    onClick={() => handlePublish(i)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, color: published ? '#00ff88' : isNext ? '#e8f4ff' : '#4a5568', lineHeight: 1.8 }}>
                        {post.title}
                      </div>
                      {published && (
                        <div style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>
                          {post.reads} reads {post.viral && '🔥 VIRAL'}
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {published
                        ? <span style={{ fontSize: 12, color: '#00ff88' }}>✓</span>
                        : isNext
                        ? <span style={{ fontSize: 10, color: '#bf5fff' }}>▶ PUBLISH</span>
                        : <span style={{ fontSize: 10, color: '#1e3a5f' }}>🔒</span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>

            {publishedCount > 0 && (
              <div style={{ marginTop: 12, fontSize: 10, color: '#ffd700' }}>
                Total readers: {totalReads >= 1000000
                  ? `${(totalReads / 1000000).toFixed(1)}M`
                  : totalReads >= 1000
                  ? `${(totalReads / 1000).toFixed(1)}K`
                  : totalReads}
              </div>
            )}
          </div>
        )}

        {/* Final credits */}
        {allPublished && (
          <div
            className="pixel-box anim-slide-up"
            style={{ borderColor: '#ffd700', background: '#0d0c00', padding: 24, textAlign: 'center' }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>🌮✨🏆</div>
            <div style={{ fontSize: 12, color: '#ffd700', textShadow: '0 0 12px #ffd700', marginBottom: 12 }}>
              THE END
            </div>
            <div style={{ fontSize: 10, color: '#e8f4ff', lineHeight: 2.4, marginBottom: 16 }}>
              <span style={{ color: '#00ff88' }}>1.4 million people</span> read your story.
              <br />
              The city council launched an investigation.
              <br />
              Three buildings were renamed in your honor.
              <br />
              Your family's taco truck was rebuilt — bigger, shinier, cleaner.
              <br /><br />
              <span style={{ color: '#64748b', fontSize: 9 }}>
                You still wash windows sometimes. Just for fun.
              </span>
            </div>
            <div style={{ fontSize: 9, color: '#4a5568', marginBottom: 16 }}>
              TACO WASH — A game about windows, determination, and corn tortillas
            </div>
            <button
              className="pixel-btn pixel-btn-gray"
              style={{ fontSize: 11, padding: '8px 20px' }}
              onClick={() => window.location.reload()}
            >
              ↩ PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
