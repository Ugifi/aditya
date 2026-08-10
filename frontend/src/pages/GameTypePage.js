import React from 'react';
import { GameIcon } from '../components/Icons';
import { GAME_TYPES } from '../data/gameData';

// ── Disawar specific game types ──────────────────────────────────────────────
const DISAWAR_GAME_TYPES = [
  { id: 'single_digit',      label: 'LEFT DIGIT',    icon: 'single_digit', desc: 'Open result digit (0–9)',  win: '9.5', numType: 'ank' },
  { id: 'jodi_digit',        label: 'RIGHT DIGIT',   icon: 'jodi',         desc: 'Close result digit (0–9)', win: '9.5', numType: 'ank' },
  { id: 'jodi_bulk',         label: 'JODI',          icon: 'jodi',         desc: 'Pick 2-digit Jodi 00–99',  win: '95',  numType: 'jodi' },
  { id: 'single_digit_bulk', label: 'JODI BULK',     icon: 'bulk',         desc: 'Multiple Jodi bets',       win: '95',  numType: 'jodi_bulk' },
  { id: 'odd_even',          label: 'ODD / EVEN',    icon: 'odd_even',     desc: 'Bet on Odd or Even digit', win: '2',   numType: 'oddeven' },
  { id: 'family_jodi',       label: 'FAMILY JODI',   icon: 'family',       desc: 'Play all family combos',   win: '95',  numType: 'jodi_bulk' },
  { id: 'crossing_jodi',     label: 'CROSSING JODI', icon: 'cross',        desc: 'Cross digits for Jodis',   win: '95',  numType: 'jodi_bulk' },
  { id: 'cycle_jodi',        label: 'CYCLE JODI',    icon: 'cycle_jodi',   desc: 'All jodis with a digit',   win: '95',  numType: 'jodi_bulk' },
];

// ── Starline specific game types ─────────────────────────────────────────────
const STARLINE_GAME_TYPES = GAME_TYPES.filter(gt =>
  ['single_digit', 'single_pana', 'double_pana', 'triple_pana',
   'single_pana_bulk', 'double_pana_bulk', 'sp_common', 'dp_common',
   'sp_dp_tp', 'family_pana', 'odd_even'].includes(gt.id)
);

export default function GameTypePage({ game, onSelect }) {
  const category = game?.game_category?.toLowerCase() || game?.category?.toLowerCase() || '';

  const isStarline = category === 'starline';
  const isDisawar  = category === 'disawar';

  const activeGameTypes = isStarline
    ? STARLINE_GAME_TYPES
    : isDisawar
      ? DISAWAR_GAME_TYPES
      : GAME_TYPES;

  return (
    <div className="game-type-page screen" style={{
      minHeight: '100vh',
      paddingTop: '16px',
      paddingBottom: '80px',
      overscrollBehavior: 'none',
      background: '#F5EDE0',
    }}>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseBadge {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.1); }
        }
        @keyframes shineText {
          0%   { left: -100%; }
          100% { left: 100%; }
        }
        .anim-in { animation: fadeInUp 0.35s ease both; }

        .gt-cell {
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .gt-cell:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 22px rgba(255,107,0,0.18) !important;
        }
        .gt-cell:active {
          transform: scale(0.97);
        }
        .gt-icon-wrap {
          transition: transform 0.2s;
        }
        .gt-cell:hover .gt-icon-wrap {
          transform: scale(1.08) translateY(-2px);
        }
        .gt-icon-wrap svg { width: 28px; height: 28px; fill: #FF6B00; }
      `}</style>

      {/* ── Game Name Banner ── */}
      {game && (
        <div style={{ textAlign: 'center', marginBottom: 18, padding: '0 16px' }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #1A0800 0%, #2C1100 60%, #1A0800 100%)',
            borderRadius: 12,
            padding: '10px 28px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
            border: '2px solid #FF6B00',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* shine sweep */}
            <div style={{
              position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%',
              background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.15), transparent)',
              animation: 'shineText 2.5s infinite',
              pointerEvents: 'none',
            }} />
            <div style={{
              fontSize: 20, fontWeight: 800, color: '#FFFFFF',
              textTransform: 'uppercase', letterSpacing: 3,
              position: 'relative', zIndex: 1,
              fontFamily: "'Teko', sans-serif",
            }}>
              {game.name || 'SELECT TYPE'}
            </div>
            <div style={{
              fontSize: 11, color: 'rgba(255,200,150,0.85)', fontWeight: 600,
              marginTop: 2, position: 'relative', zIndex: 1,
              fontFamily: "'Teko', sans-serif", letterSpacing: 1,
            }}>
              Game Type Select Karo
            </div>
          </div>
        </div>
      )}

      {/* ── Section label ── */}
      <div style={{
        padding: '0 16px 10px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#FF6B00', display: 'inline-block',
          animation: 'pulseBadge 1.4s infinite',
        }}/>
        <span style={{
          fontSize: 13, fontWeight: 800, color: '#1A0800',
          letterSpacing: 2, textTransform: 'uppercase',
          fontFamily: "'Teko', sans-serif",
        }}>
          CHOOSE GAME TYPE
        </span>
      </div>

      {/* ── Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        padding: '0 12px',
      }}>
        {activeGameTypes.map((gt, i) => (
          <div
            key={gt.id}
            className="gt-cell anim-in"
            style={{
              animationDelay: `${i * 0.04}s`,
              background: '#FFFFFF',
              borderRadius: 14,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
              border: '1.5px solid #E8D5C0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
            onClick={() => onSelect(gt)}
          >
            {/* Black top header bar (like HomeScreen game card header) */}
            <div style={{
              width: '100%',
              background: 'linear-gradient(90deg, #1A0800, #2C1100)',
              padding: '8px 10px 6px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{
                fontSize: 12, fontWeight: 800, color: '#FFFFFF',
                fontFamily: "'Teko', sans-serif", letterSpacing: 1.5,
                textTransform: 'uppercase', lineHeight: 1,
              }}>
                {gt.label}
              </span>
              {/* Win badge */}
              {gt.win && (
                <span style={{
                  background: '#FF6B00',
                  borderRadius: 6, padding: '1px 7px',
                  fontSize: 10, fontWeight: 900, color: '#FFFFFF',
                  fontFamily: "'Teko', sans-serif", letterSpacing: 0.5,
                }}>
                  {gt.win}x
                </span>
              )}
            </div>

            {/* Card body */}
            <div style={{
              padding: '16px 12px 14px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              {/* Icon circle */}
              <div className="gt-icon-wrap" style={{
                width: 54, height: 54, borderRadius: '50%', marginBottom: 8,
                background: 'linear-gradient(135deg, #FFF0E0, #FFE0C0)',
                border: '2px solid #FF6B00',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(255,107,0,0.20)',
              }}>
                <GameIcon name={gt.icon} />
              </div>

              {/* Desc */}
              {gt.desc && (
                <div style={{
                  fontSize: 11, color: '#7A5030', textAlign: 'center',
                  lineHeight: 1.4, padding: '0 2px',
                  fontFamily: "'Rajdhani', sans-serif",
                }}>
                  {gt.desc}
                </div>
              )}
            </div>

            {/* Orange PLAY button at bottom */}
            <div style={{
              width: '100%',
              background: 'linear-gradient(90deg, #FF6B00, #E85A00)',
              padding: '7px 0',
              textAlign: 'center',
            }}>
              <span style={{
                fontSize: 12, fontWeight: 800, color: '#FFFFFF',
                fontFamily: "'Teko', sans-serif", letterSpacing: 1.5,
              }}>
                ▶ PLAY
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}