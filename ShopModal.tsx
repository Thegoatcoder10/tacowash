import { useState } from 'react';
import { useGame } from '@/game/store';
import { TOOLS, FOOD_ITEMS } from '@/game/constants';
import type { Tool, FoodItem } from '@/game/types';

type ShopTab = 'tools' | 'food' | 'repair' | 'housing';

export default function ShopModal() {
  const { state, dispatch, navigate } = useGame();
  const { player } = state;
  const [tab, setTab] = useState<ShopTab>('tools');
  const [hovered, setHovered] = useState<string | null>(null);

  const canAfford = (cost: number) => player.money >= cost;

  const tabs: { id: ShopTab; label: string; emoji: string }[] = [
    { id: 'tools', label: 'TOOLS', emoji: '🔧' },
    { id: 'food', label: 'FOOD', emoji: '🌮' },
    { id: 'repair', label: 'REPAIR', emoji: '🛠' },
    { id: 'housing', label: 'HOUSING', emoji: '🏠' },
  ];

  const allTools = Object.values(TOOLS);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center city-bg"
      style={{ zIndex: 70, paddingTop: 64 }}
    >
      {/* Dim overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.7)' }}
        onClick={() => navigate('street')}
      />

      <div
        className="relative pixel-box"
        style={{
          background: '#080d18',
          borderColor: '#00aaff',
          boxShadow: '0 0 30px rgba(0,170,255,0.2), 8px 8px 0 #000',
          width: 'min(680px, 95vw)',
          maxHeight: 'calc(100vh - 100px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(90deg, #00aaff22, #00aaff44)',
            borderBottom: '3px solid #00aaff',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 24 }}>🛒</span>
            <div className="font-pixel">
              <div style={{ fontSize: 12, color: '#00aaff', textShadow: '0 0 8px #00aaff' }}>SUPPLY SHOP</div>
              <div style={{ fontSize: 9, color: '#64748b' }}>Professional Window Washing Supplies</div>
            </div>
          </div>
          <div className="font-pixel text-right">
            <div style={{ fontSize: 9, color: '#64748b' }}>YOUR WALLET</div>
            <div style={{ fontSize: 16, color: '#00ff88', textShadow: '0 0 8px #00ff88' }}>${player.money}</div>
          </div>
          <button
            className="pixel-btn pixel-btn-red"
            style={{ fontSize: 11, padding: '6px 10px' }}
            onClick={() => navigate('street')}
            aria-label="Close shop"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '2px solid #1e3a5f',
            flexShrink: 0,
          }}
        >
          {tabs.map(t => (
            <button
              key={t.id}
              className="font-pixel flex-1"
              style={{
                padding: '8px 4px',
                fontSize: 10,
                background: tab === t.id ? '#1e3a5f' : 'transparent',
                color: tab === t.id ? '#00aaff' : '#64748b',
                borderBottom: tab === t.id ? '2px solid #00aaff' : 'none',
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
              onClick={() => setTab(t.id)}
            >
              <span style={{ marginRight: 4 }}>{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>

          {/* TOOLS */}
          {tab === 'tools' && (
            <div className="flex flex-col gap-2">
              {allTools.map(tool => {
                const owned = player.tools.some(t => t.id === tool.id);
                const affordable = canAfford(tool.cost);
                return (
                  <div
                    key={tool.id}
                    className="flex items-center gap-3 font-pixel"
                    style={{
                      background: owned ? 'rgba(0,255,136,0.05)' : hovered === tool.id ? 'rgba(0,170,255,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `2px solid ${owned ? '#00ff88' : hovered === tool.id ? '#00aaff' : '#1e3a5f'}`,
                      padding: '10px 14px',
                      cursor: owned ? 'default' : 'pointer',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={() => setHovered(tool.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{tool.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: owned ? '#00ff88' : '#e8f4ff' }}>{tool.name}</div>
                      <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>{tool.description}</div>
                      <div style={{ fontSize: 8, color: '#4a5568', marginTop: 2 }}>
                        Cleans: {tool.canClean.join(', ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {owned ? (
                        <div style={{ fontSize: 11, color: '#00ff88' }}>✓ OWNED</div>
                      ) : tool.cost === 0 ? (
                        <div style={{ fontSize: 11, color: '#ffd700' }}>STARTER</div>
                      ) : (
                        <button
                          className={`pixel-btn ${affordable ? 'pixel-btn-blue' : 'pixel-btn-gray'}`}
                          style={{ fontSize: 10, padding: '5px 10px', opacity: affordable ? 1 : 0.5 }}
                          onClick={() => dispatch({ type: 'BUY_TOOL', tool })}
                          disabled={!affordable}
                          aria-label={`Buy ${tool.name} for $${tool.cost}`}
                        >
                          ${tool.cost}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* FOOD */}
          {tab === 'food' && (
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {FOOD_ITEMS.map(item => (
                <div
                  key={item.id}
                  className="font-pixel flex flex-col"
                  style={{
                    background: hovered === item.id ? 'rgba(255,140,0,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `2px solid ${hovered === item.id ? '#ff8c00' : '#1e3a5f'}`,
                    padding: 12,
                    cursor: 'pointer',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: 28 }}>{item.emoji}</span>
                    <div>
                      <div style={{ fontSize: 11, color: '#e8f4ff' }}>{item.name}</div>
                      <div style={{ fontSize: 9, color: '#64748b' }}>{item.description}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs mb-2" style={{ fontSize: 8 }}>
                    {item.healthRestore > 0 && <span style={{ color: '#ff3333' }}>+{item.healthRestore} HP</span>}
                    {item.salsaBoost > 0 && <span style={{ color: '#ff8c00' }}>+{item.salsaBoost} SPD</span>}
                    {item.stabilityBoost > 0 && <span style={{ color: '#00aaff' }}>+{item.stabilityBoost} STB</span>}
                  </div>
                  <button
                    className={`pixel-btn ${canAfford(item.cost) ? 'pixel-btn-yellow' : 'pixel-btn-gray'} mt-auto`}
                    style={{ fontSize: 10, padding: '5px 10px', opacity: canAfford(item.cost) ? 1 : 0.5 }}
                    onClick={() => dispatch({ type: 'BUY_ITEM', item })}
                    disabled={!canAfford(item.cost)}
                    aria-label={`Buy ${item.name} for $${item.cost}`}
                  >
                    BUY ${item.cost}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* REPAIR */}
          {tab === 'repair' && (
            <div className="flex flex-col gap-2">
              {player.tools.length === 0 ? (
                <div className="font-pixel text-center" style={{ fontSize: 11, color: '#64748b', padding: 20 }}>
                  No tools to repair
                </div>
              ) : player.tools.map(tool => {
                const durabilityPct = (tool.durability / tool.maxDurability) * 100;
                const repairCost = Math.round((1 - tool.durability / tool.maxDurability) * 30);
                const isOk = durabilityPct > 80;
                return (
                  <div
                    key={tool.id}
                    className="flex items-center gap-3 font-pixel"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: `2px solid ${isOk ? '#1e3a5f' : '#ff3333'}`,
                      padding: '10px 14px',
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{tool.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: '#e8f4ff' }}>{tool.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="pixel-bar" style={{ borderColor: isOk ? '#00ff88' : '#ff3333', background: '#0a0e1a', width: 120 }}>
                          <div className="pixel-bar-fill" style={{ width: `${durabilityPct}%`, background: isOk ? '#00ff88' : '#ff3333' }} />
                        </div>
                        <span style={{ fontSize: 9, color: isOk ? '#00ff88' : '#ff3333' }}>
                          {Math.round(durabilityPct)}%
                        </span>
                      </div>
                      {!isOk && (
                        <div style={{ fontSize: 8, color: '#ff3333', marginTop: 2 }}>⚠ Dull blade — causes streaks!</div>
                      )}
                    </div>
                    {!isOk && repairCost > 0 ? (
                      <button
                        className={`pixel-btn ${canAfford(repairCost) ? 'pixel-btn-green' : 'pixel-btn-gray'}`}
                        style={{ fontSize: 10, padding: '5px 10px' }}
                        onClick={() => dispatch({ type: 'REPAIR_TOOL', toolId: tool.id, cost: repairCost })}
                        disabled={!canAfford(repairCost)}
                        aria-label={`Repair ${tool.name} for $${repairCost}`}
                      >
                        REPAIR ${repairCost}
                      </button>
                    ) : (
                      <span style={{ fontSize: 10, color: '#00ff88' }}>✓ GOOD</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* HOUSING */}
          {tab === 'housing' && (
            <div className="flex flex-col gap-3">
              {[
                { id: 'box', label: 'Cardboard Box', emoji: '📦', cost: 0, desc: 'Free but cramped. -5 max health.', color: '#64748b' },
                { id: 'shared_room', label: 'Shared Room', emoji: '🛏', cost: 15, desc: 'Per day. Decent rest. Normal stats.', color: '#00aaff' },
                { id: 'apartment', label: 'Studio Apt', emoji: '🏠', cost: 40, desc: 'Per day. +10 max health. Better tips.', color: '#bf5fff' },
              ].map(h => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 font-pixel"
                  style={{ border: `2px solid ${h.color}`, background: `${h.color}0a`, padding: '12px 16px' }}
                >
                  <span style={{ fontSize: 32 }}>{h.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: h.color }}>{h.label}</div>
                    <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>{h.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#e8f4ff' }}>{h.cost === 0 ? 'FREE' : `$${h.cost}/day`}</div>
                  </div>
                </div>
              ))}
              <div className="font-pixel mt-4" style={{ fontSize: 9, color: '#64748b', lineHeight: 2 }}>
                Housing costs are deducted automatically at the start of each day.
                <br />Better housing = better recovery and higher tip multipliers.
              </div>
            </div>
          )}
        </div>

        {/* Inventory preview */}
        {player.inventory.length > 0 && (
          <div
            style={{
              borderTop: '2px solid #1e3a5f',
              padding: '8px 16px',
              background: 'rgba(0,0,0,0.3)',
              flexShrink: 0,
            }}
          >
            <div className="font-pixel" style={{ fontSize: 9, color: '#64748b', marginBottom: 6 }}>BACKPACK</div>
            <div className="flex gap-2 flex-wrap">
              {player.inventory.map((item, i) => (
                <button
                  key={`${item.id}-${i}`}
                  className="pixel-btn pixel-btn-gray"
                  style={{ fontSize: 9, padding: '4px 8px' }}
                  onClick={() => dispatch({ type: 'EAT_FOOD', itemId: item.id })}
                  aria-label={`Eat ${item.name}`}
                >
                  {item.emoji} USE
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
