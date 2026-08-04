import React, { useState, useEffect } from 'react';
import { DepositModal } from './OtherPages';


export default function HomeScreen({ wallet, onAdd, onWith, onPlay, navigate, apiCall }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [disawarGames, setDisawarGames] = useState([]);
  const [showDisawar, setShowDisawar] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [countdowns, setCountdowns] = useState({});

  const [settings, setSettings] = useState({
    site_name: 'MATKA KING',
    whatsapp: '9999999999',
    telegram: 'matkaking_support',
    phone: '9999999999',
    ticker_text: '',
  });

  const banners = [
    { text: 'DAILY Disawar', sub: 'Win Big Every Day!', emoji: '🏆', eyebrow: 'MATKAKING PRESENTS' },
    { text: '100% SAFE & TRUSTED', sub: 'Instant Withdrawal', emoji: '🪙', eyebrow: 'MATKAKING PRESENTS' },
    { text: 'FAST WITHDRAWAL', sub: 'Instant Money Transfer', emoji: '⚡', eyebrow: 'MATKAKING PRESENTS' },
    { text: 'NEW GAMES ADDED', sub: 'Play & Win Now!', emoji: '🎯', eyebrow: 'MATKAKING PRESENTS' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % banners.length), 3000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer for each game
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const newCountdowns = {};
      [...games, ...disawarGames].forEach(g => {
        const status = getGameStatus(g);
        if (!status.canPlay) { newCountdowns[g.id] = null; return; }
        const timeStr = g.close_time;
        if (!timeStr) { newCountdowns[g.id] = null; return; }
        const [h, m, s] = timeStr.split(':').map(Number);
        const target = new Date();
        target.setHours(h, m, s || 0, 0);
        let diff = Math.floor((target - now) / 1000);
        if (diff < 0) diff += 86400;
        const hh = Math.floor(diff / 3600);
        const mm = Math.floor((diff % 3600) / 60);
        const ss = diff % 60;
        newCountdowns[g.id] = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
      });
      setCountdowns(newCountdowns);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [games, disawarGames]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('mk_token');
        const API_URL = 'https://sattamatka-deepak-hy1n.onrender.com';
        const res = await fetch(`${API_URL}/api/admin/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data?.success && data?.settings) {
          const s = data.settings;
          setSettings({
            site_name:   s.site_name   || 'MATKA KING',
            whatsapp:    s.whatsapp    || s.whatsapp_support || '9999999999',
            telegram:    s.telegram    || 'matkaking_support',
            phone:       s.phone       || s.support_phone   || '9999999999',
            ticker_text: s.ticker_text || s.notice_text     || '',
          });
        }
      } catch (err) {
        console.log('Settings fetch failed, using defaults');
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = localStorage.getItem('mk_token');
        const API_URL = 'https://sattamatka-deepak-hy1n.onrender.com';
        const res = await fetch(`${API_URL}/api/games`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        let allGames = [];
        if (Array.isArray(data)) allGames = data;
        else if (data?.games) allGames = data.games;
        else if (data?.data) allGames = data.data;

        const disawar = allGames.filter(g =>
          g.name?.toLowerCase().includes('disawar') ||
          g.category?.toLowerCase() === 'disawar' ||
          g.game_category?.toLowerCase() === 'disawar'
        );
        const main = allGames.filter(g =>
          !g.name?.toLowerCase().includes('disawar') &&
          g.category?.toLowerCase() !== 'disawar' &&
          g.game_category?.toLowerCase() !== 'disawar'
        );

        setGames(main);
        setDisawarGames(disawar.length > 0 ? disawar : allGames.filter(g => g.name?.toLowerCase().includes('disawar')));
      } catch (err) {
        setGames([
          { id: 1, name: 'STARLINE MORNING', open_time: '09:00:00', close_time: '09:30:00', status: 'open',   result: null },
          { id: 2, name: 'TIME BAZAR',       open_time: '01:00:00', close_time: '02:00:00', status: 'closed', result: null },
        ]);
        setDisawarGames([
          { id: 10, name: 'DISAWAR', open_time: '05:00:00', close_time: '04:30:00', status: 'open', result: null },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  // ✅ 30 Second Delay Logic
  const isTimePassed = (timeStr, delaySeconds = 30) => {
    if (!timeStr) return false;
    try {
      const now = new Date();
      const [h, m, s] = timeStr.split(':').map(Number);
      const gameDate = new Date();
      gameDate.setHours(h, m, s || 0, 0);
      const diff = (now.getTime() - gameDate.getTime()) / 1000;
      return diff >= delaySeconds;
    } catch { return false; }
  };

  // ✅ Result Format with 30 Sec Delay
  const formatResult = (g) => {
    let openRes = g.open_result;
    let closeRes = g.close_result;

    const nowH = new Date().getHours();
    if (nowH >= 1 && nowH < 6) {
      return '***-**-***';
    }

    if (openRes && !isTimePassed(g.open_time, 30)) openRes = null;
    if (closeRes && !isTimePassed(g.close_time, 30)) closeRes = null;

    const open  = openRes  || '***';
    const close = closeRes || '***';

    let jodi = '**';
    if (openRes) {
      const openDigit = String(openRes).split('').reduce((sum, d) => sum + parseInt(d, 10), 0) % 10;
      if (closeRes) {
        const closeDigit = String(closeRes).split('').reduce((sum, d) => sum + parseInt(d, 10), 0) % 10;
        jodi = `${openDigit}${closeDigit}`;
      } else {
        jodi = `${openDigit}*`;
      }
    }

    return `${open}-${jodi}-${close}`;
  };

  // कल result (yesterday's) — show open_result as 2-digit jodi style
  const getKalResult = (g) => {
    if (g.open_result) {
      const d = String(g.open_result).split('').reduce((s, c) => s + parseInt(c, 10), 0) % 10;
      return String(d).padStart(2, '0');
    }
    return 'XX';
  };

  // आज result
  const getAajResult = (g) => {
    if (g.close_result && isTimePassed(g.close_time, 30)) {
      const d = String(g.close_result).split('').reduce((s, c) => s + parseInt(c, 10), 0) % 10;
      return String(d).padStart(2, '0');
    }
    return 'XX';
  };

  const getGameStatus = (g) => {
    const hasOpen  = g.open_result  && String(g.open_result).trim()  !== '';
    const hasClose = g.close_result && String(g.close_result).trim() !== '';

    if (hasOpen && hasClose) return { text: 'Closed for today', canPlay: false };

    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    const toMins = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const closeMins = toMins(g.close_time);
    const isLateNightGame = closeMins >= 22 * 60;
    const isAfterMidnight = nowMins < 2 * 60;

    let isClosed = false;
    if (isLateNightGame && isAfterMidnight) {
      isClosed = false;
    } else {
      isClosed = nowMins >= closeMins;
    }

    if (isClosed) return { text: 'Closed for today', canPlay: false };
    if (hasOpen)  return { text: 'Running for close', canPlay: true };
    return { text: 'Market is open', canPlay: true };
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
    } catch { return timeStr; }
  };

  const isAdminImpersonating = localStorage.getItem('mk_admin_token');
  const backToAdmin = () => {
    localStorage.setItem('mk_token', localStorage.getItem('mk_admin_token'));
    localStorage.removeItem('mk_admin_token');
    window.location.href = '/?admin=1';
  };

  const getGameIcon = (name) => {
    if (!name) return '🎯';
    const n = name.toUpperCase();
    if (n.includes('TIME')) return '⏳';
    if (n.includes('MILAN')) return '🎲';
    if (n.includes('KALYAN')) return '👑';
    if (n.includes('RAJDHANI')) return '🏰';
    if (n.includes('MAIN')) return '💎';
    if (n.includes('MADHUR')) return '🏺';
    if (n.includes('SRIDEVI')) return '👸';
    if (n.includes('SUPREME')) return '🌟';
    if (n.includes('KUBER')) return '💰';
    if (n.includes('NIGHT')) return '🌙';
    if (n.includes('DAY')) return '☀️';
    return '🎰';
  };

  const renderWaveText = (text) => {
    if (!text) return null;
    let charIndex = 0;
    return text.split(' ').map((word, wIdx, arr) => (
      <React.Fragment key={wIdx}>
        {word.split('').map((char) => {
          const currentDelay = `${charIndex * 0.1}s`;
          charIndex++;
          return (
            <span key={charIndex} style={{ display: 'inline-block', animation: 'wave 1.5s infinite', animationDelay: currentDelay }}>
              {char}
            </span>
          );
        })}
        {wIdx < arr.length - 1 && <>&nbsp;&nbsp;</>}
      </React.Fragment>
    ));
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800;900&family=Poppins:wght@400;600;700;800;900&display=swap');

    @keyframes wave { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
    @keyframes ticker { 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }
    @keyframes bannerFade { 0%{opacity:0;transform:translateX(20px)} 100%{opacity:1;transform:translateX(0)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

    .hs-root {
      background: #f5f0e8;
      min-height: 100vh;
      font-family: 'Poppins', sans-serif;
      padding-bottom: 80px;
      color: #1a1a1a;
    }

    /* HEADER */
    .hs-header {
      background: #e8650a;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 3px 12px rgba(232,101,10,0.4);
    }
    .hs-header-title {
      font-size: 20px;
      font-weight: 900;
      color: #fff;
      letter-spacing: 1.5px;
      font-family: 'Baloo 2', cursive;
    }
    .hs-header-balance {
      background: rgba(255,255,255,0.2);
      border: 1.5px solid rgba(255,255,255,0.4);
      border-radius: 20px;
      padding: 5px 14px;
      color: #fff;
      font-weight: 800;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* TICKER */
    .hs-ticker {
      background: #1a1a2e;
      overflow: hidden;
      padding: 7px 0;
      border-bottom: 2px solid #e8650a;
    }
    .hs-ticker-inner {
      display: inline-block;
      white-space: nowrap;
      animation: ticker 18s linear infinite;
      color: #00e5ff;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    /* TOP BUTTONS */
    .hs-top-btns {
      display: flex;
      gap: 10px;
      padding: 14px 14px 0;
    }
    .hs-top-btn {
      flex: 1;
      background: #1a1a2e;
      border: 2px solid #e8650a;
      border-radius: 10px;
      padding: 10px 0;
      color: #fff;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      letter-spacing: 1px;
      transition: all 0.2s;
    }
    .hs-top-btn:hover {
      background: #e8650a;
    }

    /* BANNER */
    .hs-banner {
      margin: 14px 14px 0;
      border-radius: 14px;
      height: 110px;
      position: relative;
      overflow: hidden;
      background: #1a1a2e;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
    }
    .hs-banner-slide {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      padding: 0 20px;
      transition: opacity 0.5s ease;
    }
    .hs-banner-dots {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 5px;
    }
    .hs-banner-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      transition: all 0.3s;
      cursor: pointer;
    }

    /* ACTION BUTTONS */
    .hs-action-btns {
      display: flex;
      gap: 10px;
      padding: 14px 14px 0;
    }
    .hs-btn-add {
      flex: 1;
      padding: 13px 0;
      border: none;
      border-radius: 25px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #fff;
      font-weight: 900;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      box-shadow: 0 4px 14px rgba(34,197,94,0.35);
      letter-spacing: 0.5px;
      transition: transform 0.2s;
    }
    .hs-btn-add:hover { transform: scale(1.03); }
    .hs-btn-with {
      flex: 1;
      padding: 13px 0;
      border: none;
      border-radius: 25px;
      background: linear-gradient(135deg, #ef4444, #b91c1c);
      color: #fff;
      font-weight: 900;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      box-shadow: 0 4px 14px rgba(239,68,68,0.35);
      letter-spacing: 0.5px;
      transition: transform 0.2s;
    }
    .hs-btn-with:hover { transform: scale(1.03); }

    /* LIVE GAMES LABEL */
    .hs-section-label {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 18px 14px 8px;
      font-size: 15px;
      font-weight: 900;
      color: #1a1a1a;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .hs-live-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: #e8650a;
      animation: pulse 1.2s infinite;
    }

    /* GAME CARD */
    .hs-game-card {
      margin: 0 14px 12px;
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      overflow: hidden;
      border: 1.5px solid #e8e0d4;
    }
    .hs-game-card-header {
      background: #1a1a2e;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .hs-game-name {
      font-size: 16px;
      font-weight: 900;
      color: #fff;
      letter-spacing: 1.5px;
      font-family: 'Baloo 2', cursive;
      text-transform: uppercase;
    }
    .hs-game-time {
      font-size: 10px;
      color: #e8650a;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .hs-game-body {
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* KAL / AAJ BOXES */
    .hs-result-box {
      background: #fff8f0;
      border: 1.5px solid #f5c99a;
      border-radius: 10px;
      padding: 8px 14px;
      text-align: center;
      min-width: 58px;
    }
    .hs-result-num {
      font-size: 22px;
      font-weight: 900;
      color: #e8650a;
      line-height: 1;
    }
    .hs-result-label {
      font-size: 10px;
      color: #888;
      font-weight: 700;
      margin-top: 2px;
    }
    .hs-result-arrow {
      color: #ccc;
      font-size: 14px;
      font-weight: 900;
    }

    /* PLAY BUTTON */
    .hs-play-btn {
      flex: 1;
      padding: 10px 6px;
      border: none;
      border-radius: 25px;
      background: linear-gradient(135deg, #e8650a, #f59420);
      color: #fff;
      font-weight: 900;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      box-shadow: 0 3px 10px rgba(232,101,10,0.4);
      transition: all 0.2s;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .hs-play-btn:hover { transform: scale(1.03); }
    .hs-play-btn-timer {
      font-size: 11px;
      font-weight: 700;
      opacity: 0.9;
      letter-spacing: 2px;
    }
    .hs-play-btn-disabled {
      flex: 1;
      padding: 12px 6px;
      border: none;
      border-radius: 25px;
      background: #d1d5db;
      color: #6b7280;
      font-weight: 900;
      font-size: 12px;
      cursor: not-allowed;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .hs-closed-badge {
      font-size: 10px;
      color: #ef4444;
      font-weight: 800;
      letter-spacing: 1px;
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `;

  // ── DISAWAR PAGE ──────────────────────────────────────────────
  if (showDisawar) {
    return (
      <div className="hs-root">
        <style>{styles}</style>

        {isAdminImpersonating && (
          <button onClick={backToAdmin} style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, background: '#1a1a2e', color: '#FFD700', padding: '8px 16px', borderRadius: 8, fontWeight: 800, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
            ⬅️ Back to Admin
          </button>
        )}

        {/* Header */}
        <div className="hs-header">
          <button onClick={() => setShowDisawar(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="hs-header-title">MATKA DISAWAR</div>
          <div className="hs-header-balance">🎯 {disawarGames.length} Games</div>
        </div>

        {/* Live label */}
        <div className="hs-section-label">
          <div className="hs-live-dot" />
          DISAWAR MARKETS
        </div>

        {disawarGames.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Koi Disawar game nahi mila</div>
          </div>
        ) : (
          disawarGames.map((g) => {
            const status = getGameStatus(g);
            return (
              <div key={g.id} className="hs-game-card">
                <div className="hs-game-card-header">
                  <div className="hs-game-name">{getGameIcon(g.name)} {g.name}</div>
                  <div className="hs-game-time">Open: {formatTime(g.open_time)} &nbsp; Close: {formatTime(g.close_time)}</div>
                </div>
                <div className="hs-game-body">
                  <div className="hs-result-box">
                    <div className="hs-result-num">{getKalResult(g)}</div>
                    <div className="hs-result-label">कल</div>
                  </div>
                  <div className="hs-result-arrow">▶</div>
                  <div className="hs-result-box">
                    <div className="hs-result-num">{getAajResult(g)}</div>
                    <div className="hs-result-label">आज</div>
                  </div>
                  <div style={{ flex: 1 }} />
                  {status.canPlay ? (
                    <button className="hs-play-btn" onClick={() => onPlay(g)}>
                      ▶ PLAY
                      {countdowns[g.id] && <span className="hs-play-btn-timer">• {countdowns[g.id]}</span>}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <button className="hs-play-btn-disabled">MARKET CLOSED</button>
                    </div>
                  )}
                </div>
                {!status.canPlay && (
                  <div style={{ padding: '4px 14px 10px', display: 'flex', justifyContent: 'center' }}>
                    <span className="hs-closed-badge">⛔ CLOSED FOR TODAY</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }

  // ── MAIN HOME ─────────────────────────────────────────────────
  return (
    <div className="hs-root">
      <style>{styles}</style>

      {isAdminImpersonating && (
        <button onClick={backToAdmin} style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, background: '#1a1a2e', color: '#FFD700', padding: '8px 16px', borderRadius: 8, fontWeight: 800, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
          ⬅️ Back to Admin
        </button>
      )}



      {/* TICKER */}
      <div className="hs-ticker">
        <span className="hs-ticker-inner">
          {settings.ticker_text || `Welcome To ${settings.site_name}... Play and Enjoy! &nbsp;&nbsp;&nbsp; 📞 Contact: ${settings.phone} &nbsp;&nbsp;&nbsp; 💳 Instant Withdrawal | 100% Safe &nbsp;&nbsp;&nbsp; Welcome To ${settings.site_name}... Play and Enjoy!`}
        </span>
      </div>

      {/* TOP BUTTONS — STARLINE / DISAWAR */}
      <div className="hs-top-btns">
        <button className="hs-top-btn" onClick={() => navigate && navigate('starline')}>▶ STARLINE</button>
        <button className="hs-top-btn" onClick={() => setShowDisawar(true)}>▶ DISAWAR</button>
      </div>

      {/* BANNER */}
      <div className="hs-banner">
        {banners.map((b, i) => (
          <div key={i} className="hs-banner-slide" style={{ opacity: currentSlide === i ? 1 : 0, background: 'linear-gradient(135deg, #1a1a2e, #2d2d5e)', pointerEvents: currentSlide === i ? 'auto' : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>{b.eyebrow}</div>
              <div style={{ fontSize: 19, fontWeight: 900, color: '#fff', fontFamily: "'Baloo 2', cursive", lineHeight: 1.2, marginBottom: 3 }}>{b.text}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{b.sub}</div>
            </div>
            <div style={{ fontSize: 46 }}>{b.emoji}</div>
          </div>
        ))}
        <div className="hs-banner-dots">
          {banners.map((_, i) => (
            <div key={i} onClick={() => setCurrentSlide(i)} className="hs-banner-dot" style={{ background: currentSlide === i ? '#e8650a' : 'rgba(255,255,255,0.35)' }} />
          ))}
        </div>
      </div>

      {/* ADD / WITHDRAW */}
      <div className="hs-action-btns">
        <button onClick={() => setShowDeposit(true)} className="hs-btn-add">💰 ADD MONEY</button>
        <button onClick={onWith} className="hs-btn-with">💸 WITHDRAW</button>
      </div>

      {showDeposit && (
        <DepositModal
          apiCall={apiCall}
          onClose={() => setShowDeposit(false)}
          onSuccess={() => { setShowDeposit(false); }}
        />
      )}

      {/* LIVE GAMES LABEL */}
      <div className="hs-section-label">
        <div className="hs-live-dot" />
        LIVE GAMES
      </div>

      {/* GAMES LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#e8650a', padding: 40, fontWeight: 700 }}>⏳ Loading Games...</div>
      ) : games.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>Koi game available nahi hai.</div>
      ) : (
        games.map(g => {
          const status = getGameStatus(g);
          return (
            <div key={g.id} className="hs-game-card">
              {/* Card Header — dark with name + times */}
              <div className="hs-game-card-header">
                <div className="hs-game-name">{getGameIcon(g.name)} {g.name}</div>
                <div className="hs-game-time">Open: {formatTime(g.open_time)} &nbsp;|&nbsp; Close: {formatTime(g.close_time)}</div>
              </div>

              {/* Card Body — कल/आज boxes + play button */}
              <div className="hs-game-body">
                <div className="hs-result-box">
                  <div className="hs-result-num">{getKalResult(g)}</div>
                  <div className="hs-result-label">कल</div>
                </div>
                <div className="hs-result-arrow">▶</div>
                <div className="hs-result-box">
                  <div className="hs-result-num">{getAajResult(g)}</div>
                  <div className="hs-result-label">आज</div>
                </div>

                <div style={{ flex: 1 }} />

                {status.canPlay ? (
                  <button className="hs-play-btn" onClick={() => onPlay(g)}>
                    ▶ PLAY
                    {countdowns[g.id] && <span className="hs-play-btn-timer">• {countdowns[g.id]}</span>}
                  </button>
                ) : (
                  <button className="hs-play-btn-disabled">CLOSED</button>
                )}
              </div>

              {/* Closed badge */}
              {!status.canPlay && (
                <div style={{ padding: '0 14px 10px', display: 'flex', justifyContent: 'center' }}>
                  <span className="hs-closed-badge">⛔ CLOSED FOR TODAY</span>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}