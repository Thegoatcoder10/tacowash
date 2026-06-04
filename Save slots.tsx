import { useState, useEffect } from 'react';
import { useGame } from '@/game/store';
import type { SaveSlotMeta } from '@/game/types';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
}

const NEIGHBORHOOD_LABEL: Record<string, string> = {
  slums: 'The Slums',
  suburbs: 'The Suburbs',
  highrise: 'High-Rise',
};

function SlotCard({
  slot,
  meta,
  onSave,
  onLoad,
  onClear,
}: {
  slot: number;
  meta: SaveSlotMeta | null;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
}) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div
      className="font-pixel"
      style={{
        border: `3px solid ${meta ? '#1e3a5f' : '#0d1a2e'}`,
        background: meta ? 'rgba(30,58,95,0.2)' : 'rgba(0,0,0,0.15)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Slot number */}
      <div
        style={{
          width: 36,
          height: 36,
          border: `3px solid ${meta ? '#00aaff' : '#1e3a5f'}`,
          background: meta ? 'rgba(0,170,255,0.12)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          color: meta ? '#00aaff' : '#1e3a5f',
          flexShrink: 0,
        }}
      >
        {slot + 1}
      </div>

      {/* Slot content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {meta ? (
          <>
            <div style={{ fontSize: 11, color: '#e8f4ff', marginBottom: 2 }}>
              DAY {meta.day} — {NEIGHBORHOOD_LABEL[meta.neighborhood] ?? meta.neighborhood}
            </div>
            <div style={{ fontSize: 9, color: '#00ff88' }}>
              ${meta.money.toLocaleString()} saved
            </div>
            <div style={{ fontSize: 8, color: '#4a5568', marginTop: 2 }}>
              {formatDate(meta.savedAt)}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 10, color: '#1e3a5f' }}>EMPTY SLOT</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1" style={{ flexShrink: 0 }}>
        {meta ? (
          <>
            <button
              className="pixel-btn pixel-btn-green"
              style={{ fontSize: 9, padding: '4px 10px' }}
              onClick={onLoad}
            >
              ▶ LOAD
            </button>
            <button
              className="pixel-btn pixel-btn-blue"
              style={{ fontSize: 9, padding: '4px 10px' }}
              onClick={onSave}
            >
              💾 SAVE
            </button>
            {confirmClear ? (
              <button
                className="pixel-btn pixel-btn-red"
                style={{ fontSize: 9, padding: '4px 10px' }}
                onClick={() => { onClear(); setConfirmClear(false); }}
              >
                CONFIRM
              </button>
            ) : (
              <button
                className="pixel-btn pixel-btn-gray"
                style={{ fontSize: 9, padding: '4px 10px' }}
                onClick={() => setConfirmClear(true)}
              >
                🗑 DEL
              </button>
            )}
          </>
        ) : (
          <button
            className="pixel-btn pixel-btn-blue"
            style={{ fontSize: 9, padding: '4px 10px' }}
            onClick={onSave}
          >
            💾 SAVE
          </button>
        )}
      </div>
    </div>
  );
}

export default function SaveSlots() {
  const { state, dispatch, saveGame, loadGame, getSaveSlots } = useGame();
  const [slots, setSlots] = useState<(SaveSlotMeta | null)[]>([null, null, null]);

  // Refresh slot data whenever the menu opens
  useEffect(() => {
    if (state.saveMenuOpen) {
      setSlots(getSaveSlots());
    }
  }, [state.saveMenuOpen, getSaveSlots]);

  if (!state.saveMenuOpen) return null;

  const refresh = () => setSlots(getSaveSlots());

  const handleSave = (slot: number) => {
    saveGame(slot);
    refresh();
  };

  const handleLoad = (slot: number) => {
    loadGame(slot);
    // LOAD_GAME closes the menu via the reducer
  };

  const handleClear = (slot: number) => {
    try { localStorage.removeItem(`tacowash_save_${slot}`); } catch { /* ignore */ }
    refresh();
  };

  const isOnTitle = state.screen === 'title';

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: 200 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(3px)' }}
        onClick={() => dispatch({ type: 'TOGGLE_SAVE_MENU' })}
      />

      <div
        className="relative pixel-box font-pixel"
        style={{
          background: '#080d18',
          borderColor: '#00aaff',
          boxShadow: '0 0 40px rgba(0,170,255,0.25), 8px 8px 0 #000',
          width: 'min(560px, 95vw)',
          maxHeight: 'calc(100vh - 80px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
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
          <div>
            <div style={{ fontSize: 12, color: '#00aaff', textShadow: '0 0 8px #00aaff' }}>
              💾 SAVE SLOTS
            </div>
            <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>
              {isOnTitle ? 'Load a save to continue' : 'Save or load your progress'}
            </div>
          </div>
          <button
            className="pixel-btn pixel-btn-red"
            style={{ fontSize: 11, padding: '6px 10px' }}
            onClick={() => dispatch({ type: 'TOGGLE_SAVE_MENU' })}
            aria-label="Close save menu"
          >
            ✕
          </button>
        </div>

        {/* Slots */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
          {slots.map((meta, i) => (
            <SlotCard
              key={i}
              slot={i}
              meta={meta}
              onSave={() => handleSave(i)}
              onLoad={() => handleLoad(i)}
              onClear={() => handleClear(i)}
            />
          ))}

          <div
            style={{
              marginTop: 8,
              fontSize: 9,
              color: '#4a5568',
              lineHeight: 1.9,
              borderTop: '2px solid #1e3a5f',
              paddingTop: 10,
            }}
          >
            ✓ Auto-save runs every time you end a day.
            <br />
            Manual saves let you keep separate runs.
          </div>
        </div>
      </div>
    </div>
  );
}
