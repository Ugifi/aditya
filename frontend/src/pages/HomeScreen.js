import React, { useState, useEffect, useRef } from 'react';
import { DepositModal } from './OtherPages';

function getMatkaDate() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  if (ist.getUTCHours() < 2) {
    ist.setUTCDate(ist.getUTCDate() - 1);
  }
  return ist.toISOString().split('T')[0];
}

export default function HomeScreen({ wallet, onAdd, onWith, onPlay, navigate, apiCall, onViewChart, openDisawar, onDisawarOpened }) {
  const [games, setGames] = useState([]);
  const [starlineGames, setStarlineGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [disawarGames, setDisawarGames] = useState([]);
  const [selectedDisawarGame, setSelectedDisawarGame] = useState(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [timers, setTimers] = useState({});

  const [activeView, setActiveView] = useState(2);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = 0;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) setActiveView(prev => (prev + 1) % 3);
    else if (isRightSwipe) setActiveView(prev => (prev - 1 + 3) % 3);
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const [settings, setSettings] = useState({
    site_name: 'MATKA KING',
    whatsapp: '9999999999',
    telegram: 'matkaking_support',
    phone: '9999999999',
    ticker_text: '',
  });

  const TEXT_SLIDES = [
    {
      icon: '🏆', badge: '⭐ TRUSTED BY LAKHS',
      line1: "INDIA'S #1 MATKA",
      line2: 'PLATFORM',
      sub: '🎰 Fast Results • 100% Safe • 24/7 Play',
      color: '#FF6B00',
      bg: 'linear-gradient(135deg, #1a0a00, #2d1200)',
      accent: 'rgba(255,107,0,0.18)',
    },
    {
      icon: '💸', badge: '✅ INSTANT PROCESS',
      line1: 'WITHDRAW YOUR',
      line2: 'WINNING ANYTIME',
      sub: '🏦 UPI • Bank Transfer • Instant Approval',
      color: '#00c853',
      bg: 'linear-gradient(135deg, #001a0a, #002d14)',
      accent: 'rgba(0,200,83,0.15)',
    },
    {
      icon: '📊', badge: '🔴 LIVE UPDATES',
      line1: 'DAILY RESULTS',
      line2: 'ON TIME — EVERY TIME',
      sub: '⏱ Real-time Results • No Delay • Accurate',
      color: '#2979ff',
      bg: 'linear-gradient(135deg, #00071a, #001233)',
      accent: 'rgba(41,121,255,0.15)',
    },
    {
      icon: '🔐', badge: '🛡️ 100% SECURE',
      line1: 'SAFE & TRUSTED',
      line2: 'PLAY WITH CONFIDENCE',
      sub: '🔒 Encrypted • Fair Play • Verified Platform',
      color: '#d500f9',
      bg: 'linear-gradient(135deg, #0f001a, #1a0033)',
      accent: 'rgba(213,0,249,0.13)',
    },
  ];

  const DISAWAR_GAME_TYPES = [
    { id: 'single_digit',       label: 'Left Digit',     icon: '🎯', desc: 'Open result digit',    win: '9.5',   numType: 'ank'       },
    { id: 'single_digit_close', label: 'Right Digit',    icon: '🎰', desc: 'Close result digit',   win: '9.5',   numType: 'ank'       },
    { id: 'jodi_digit',         label: 'Jodi',           icon: '🎲', desc: 'Two digit pair',        win: '95',    numType: 'jodi'      },
    { id: 'jodi_bulk',          label: 'Jodi Bulk',      icon: '📦', desc: 'Multiple Jodis',        win: '95',    numType: 'jodi_bulk' },
    { id: 'odd_even',           label: 'Odd / Even',     icon: '⚖️', desc: 'Odd ya Even pick karo', win: '2',     numType: 'odd_even'  },
    { id: 'family_jodi',        label: 'Family Jodi',    icon: '👨‍👩‍👧', desc: 'Family jodi set',        win: '95',    numType: 'jodi'      },
    { id: 'crossing_jodi',      label: 'Crossing Jodi',  icon: '✂️', desc: 'Crossing combination',  win: '95',    numType: 'jodi_bulk' },
    { id: 'cycle_jodi',         label: 'Cycle Jodi',     icon: '🔄', desc: 'Cycle jodi set',        win: '95',    numType: 'jodi_bulk' },
  ];

  // Auto slide every 3s
  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % TEXT_SLIDES.length), 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (openDisawar) {
      setActiveView(2);
      setSelectedDisawarGame(null);
      if (onDisawarOpened) onDisawarOpened();
    }
  }, [openDisawar]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('mk_token');
        const API_URL = 'https://aditya-nh9i.onrender.com';
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
        const API_URL = 'https://aditya-nh9i.onrender.com';
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
        const starline = allGames.filter(g =>
          g.name?.toLowerCase().includes('starline') ||
          g.category?.toLowerCase() === 'starline' ||
          g.game_category?.toLowerCase() === 'starline'
        );
        const main = allGames.filter(g =>
          !g.name?.toLowerCase().includes('disawar') &&
          g.category?.toLowerCase() !== 'disawar' &&
          g.game_category?.toLowerCase() !== 'disawar' &&
          !g.name?.toLowerCase().includes('starline') &&
          g.category?.toLowerCase() !== 'starline' &&
          g.game_category?.toLowerCase() !== 'starline'
        );

        setGames(sortByCloseTime(main));
        setStarlineGames(sortByCloseTime(starline));
        setDisawarGames(sortByCloseTime(disawar.length > 0 ? disawar : allGames.filter(g => g.name?.toLowerCase().includes('disawar'))));
      } catch (err) {
        setGames([{ id: 1, name: 'TIME BAZAR', open_time: '01:00:00', close_time: '02:00:00', status: 'closed', result: null }]);
        setStarlineGames([{ id: 2, name: 'STARLINE MORNING', open_time: '09:00:00', close_time: '09:30:00', status: 'open', result: null }]);
        setDisawarGames([{ id: 10, name: 'DISAWAR', open_time: '05:00:00', close_time: '04:30:00', status: 'open', result: null }]);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  // Timer countdown
  useEffect(() => {
    const calcTimers = () => {
      const allGames = [...games, ...starlineGames, ...disawarGames];
      const newTimers = {};
      allGames.forEach(g => {
        const closeTimeStr = g.close_time;
        if (!closeTimeStr) return;
        const now = new Date();
        const [h, m, s] = closeTimeStr.split(':').map(Number);
        const closeDate = new Date();
        closeDate.setHours(h, m, s || 0, 0);
        if (closeDate < now) closeDate.setDate(closeDate.getDate() + 1);
        const diff = Math.max(0, Math.floor((closeDate - now) / 1000));
        const hh = Math.floor(diff / 3600);
        const mm = Math.floor((diff % 3600) / 60);
        const ss = diff % 60;
        newTimers[g.id] = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
      });
      setTimers(newTimers);
    };
    calcTimers();
    const interval = setInterval(calcTimers, 1000);
    return () => clearInterval(interval);
  }, [games, starlineGames, disawarGames]);

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

  const formatResult = (g) => {
    let openRes = g.open_result;
    let closeRes = g.close_result;
    const nowH = new Date().getHours();
    if (nowH >= 1 && nowH < 6) return '***-**-***';
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

  const formatDisawarResult = (g) => {
    const matkaDate = getMatkaDate();
    const jodiRes = g.jodi_result;
    const hasJodi = jodiRes && String(jodiRes).trim() !== '';
    if (g.result_date) {
      if (g.result_date !== matkaDate) return 'XX';
      if (hasJodi) {
        const j = String(jodiRes).replace(/[^0-9]/g, '');
        if (/^\d{2}$/.test(j)) return j;
      }
      return 'XX';
    }
    if (!hasJodi) return 'XX';
    const j = String(jodiRes).replace(/[^0-9]/g, '');
    if (/^\d{2}$/.test(j)) return j;
    const closeRes = g.close_result;
    if (!closeRes || !isTimePassed(g.close_time, 30)) return 'XX';
    const cleaned = String(closeRes).replace(/[^0-9]/g, '');
    if (/^\d{2}$/.test(cleaned)) return cleaned;
    const openRes = g.open_result;
    if (openRes && closeRes) {
      const od = String(openRes).split('').reduce((s, c) => s + parseInt(c), 0) % 10;
      const cd = String(closeRes).split('').reduce((s, c) => s + parseInt(c), 0) % 10;
      return `${od}${cd}`;
    }
    return 'XX';
  };

  const getDisawarYesterdayJodi = (g) => {
    const matkaDate = getMatkaDate();
    const jodiRes = g.jodi_result;
    const hasJodi = jodiRes && String(jodiRes).trim() !== '';
    if (g.result_date) {
      if (g.result_date === matkaDate) return g.prev_jodi_result || 'XX';
      else {
        if (hasJodi) {
          const j = String(jodiRes).replace(/[^0-9]/g, '');
          if (/^\d{2}$/.test(j)) return j;
        }
        return g.prev_jodi_result || 'XX';
      }
    }
    if (hasJodi) {
      const j = String(jodiRes).replace(/[^0-9]/g, '');
      if (/^\d{2}$/.test(j)) return j;
    }
    return g.prev_jodi_result || 'XX';
  };

  const getDisawarStatus = (g) => {
    const hasClose = g.close_result && String(g.close_result).trim() !== '';
    if (hasClose) return { text: 'CLOSED FOR TODAY', canPlay: false };
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const toMins = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    const closeMins = toMins(g.close_time);
    const isNextDay = closeMins < 6 * 60;
    let isClosed = false;
    if (isNextDay) isClosed = nowMins >= closeMins && nowMins < 6 * 60;
    else isClosed = nowMins >= closeMins;
    if (isClosed) return { text: 'CLOSED FOR TODAY', canPlay: false };
    return { text: 'Market is open', canPlay: true };
  };

  const getGameStatus = (g) => {
    const hasOpen  = g.open_result  && String(g.open_result).trim()  !== '';
    const hasClose = g.close_result && String(g.close_result).trim() !== '';
    if (hasOpen && hasClose) return { text: 'CLOSED FOR TODAY', canPlay: false };
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
    if (isLateNightGame && isAfterMidnight) isClosed = false;
    else isClosed = nowMins >= closeMins;
    if (isClosed) return { text: 'CLOSED FOR TODAY', canPlay: false };
    if (hasOpen) return { text: 'Running for close', canPlay: true };
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

const sortByCloseTime = (gamesList) => {
  return [...gamesList].sort((a, b) => {
    const toMinutes = (t) => {
      if (!t) return 9999;
      const [h, m] = t.split(':').map(Number);
      const adjusted = h < 6 ? h + 24 : h;
      return adjusted * 60 + m;
    };
    return toMinutes(a.close_time) - toMinutes(b.close_time);
  });
};

  const getGameIcon = (name) => {
    if (!name) return '🎰';
    const n = name.toUpperCase();
    if (n.includes('TIME BAZAR') || (n.includes('TIME') && n.includes('BAZAR'))) return '⌛';
    if (n.includes('TIME')) return '🕐';
    if (n.includes('MILAN') && n.includes('DAY')) return '🌤️';
    if (n.includes('MILAN') && n.includes('NIGHT')) return '🌃';
    if (n.includes('MILAN')) return '🎲';
    if (n.includes('KALYAN') && n.includes('NIGHT')) return '🌙';
    if (n.includes('KALYAN')) return '👑';
    if (n.includes('RAJDHANI') && n.includes('DAY')) return '🏛️';
    if (n.includes('RAJDHANI') && n.includes('NIGHT')) return '🌆';
    if (n.includes('RAJDHANI')) return '🏰';
    if (n.includes('MAIN') && n.includes('BAZAR')) return '🏪';
    if (n.includes('MAIN')) return '💎';
    if (n.includes('MADHUR') && n.includes('MORNING')) return '🌅';
    if (n.includes('MADHUR') && n.includes('DAY')) return '☀️';
    if (n.includes('MADHUR') && n.includes('NIGHT')) return '🌠';
    if (n.includes('MADHUR')) return '🏺';
    if (n.includes('SRIDEVI') && n.includes('NIGHT')) return '💫';
    if (n.includes('SRIDEVI')) return '👸';
    if (n.includes('SUPREME')) return '🌟';
    if (n.includes('KUBER')) return '💰';
    if (n.includes('MORNING')) return '🌄';
    if (n.includes('NIGHT')) return '🌙';
    if (n.includes('DAY')) return '🌞';
    if (n.includes('KARNATAKA')) return '🗺️';
    if (n.includes('FARIDABAD')) return '🏙️';
    if (n.includes('GAZIABAD') || n.includes('GHAZIABAD')) return '🎡';
    if (n.includes('DISAWAR')) return '🎯';
    if (n.includes('LAXMI') || n.includes('LAKSHMI')) return '🪔';
    if (n.includes('SHREE') || n.includes('SHRI')) return '🙏';
    if (n.includes('JAISALMER')) return '🏜️';
    if (n.includes('STAR')) return '⭐';
    if (n.includes('GOLD')) return '🥇';
    if (n.includes('DIAMOND')) return '💠';
    if (n.includes('SILVER')) return '🥈';
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

  // ── DISAWAR GAME TYPE SELECT SCREEN ───────────────────────────
  if (selectedDisawarGame) {
    const digitTypes  = DISAWAR_GAME_TYPES.slice(0, 2);
    const jodiTypes   = DISAWAR_GAME_TYPES.slice(2, 4);
    const extraTypes  = DISAWAR_GAME_TYPES.slice(4);

    return (
      <div className="screen" style={{ paddingBottom: 80, backgroundColor: '#F5EDE0', minHeight: '100vh', color: '#1a0800', fontFamily: "'Poppins', sans-serif" }}>
        <style>{`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
          .anim-in { animation: fadeInUp 0.35s ease both; }
          .dgt-cell { transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; }
          .dgt-cell:hover { transform: translateY(-3px) scale(1.02); border-color: rgba(255,107,0,0.5) !important; box-shadow: 0 0 20px rgba(255,107,0,0.15) !important; }
        `}</style>
        <div style={{ background: 'linear-gradient(135deg, #FF6B00, #cc4400)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
          <button onClick={() => setSelectedDisawarGame(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>{selectedDisawarGame.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Game Type Select Karo</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '24px 16px 8px' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: 3, textShadow: '0 0 20px rgba(255,107,0,0.4)' }}>
            {selectedDisawarGame.name}
          </div>
        </div>
        <div style={{ padding: '8px 14px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#FF6B00', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, borderLeft: '3px solid #FF6B00', paddingLeft: 10 }}>Digit Games</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {digitTypes.map((gt, i) => (
              <div key={i} className="dgt-cell anim-in" style={{ animationDelay: `${i * 0.05}s`, background: 'linear-gradient(145deg, rgba(255,237,224,0.95), rgba(255,220,190,0.9))', padding: '22px 12px', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1.5px solid rgba(255,107,0,0.3)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden' }} onClick={() => onPlay(selectedDisawarGame, gt)}>
                <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.4)', borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 900, color: '#FF6B00' }}>{gt.win}x</div>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,107,0,0.08)', border: '1.5px solid rgba(255,107,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 10 }}>{gt.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#FF6B00', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{gt.label}</div>
                <div style={{ fontSize: 11, color: '#7A5030', textAlign: 'center' }}>{gt.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {jodiTypes.map((gt, i) => (
              <div key={i} className="dgt-cell anim-in" style={{ animationDelay: `${(i+2) * 0.05}s`, background: 'linear-gradient(145deg, rgba(255,237,224,0.95), rgba(255,220,190,0.9))', padding: '22px 12px', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1.5px solid rgba(255,107,0,0.3)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden' }} onClick={() => onPlay(selectedDisawarGame, gt)}>
                <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.4)', borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 900, color: '#FF6B00' }}>{gt.win}x</div>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,107,0,0.08)', border: '1.5px solid rgba(255,107,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 10 }}>{gt.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#FF6B00', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{gt.label}</div>
                <div style={{ fontSize: 11, color: '#7A5030', textAlign: 'center' }}>{gt.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {extraTypes.map((gt, i) => (
              <div key={i} className="dgt-cell anim-in" style={{ animationDelay: `${(i+4) * 0.05}s`, background: 'linear-gradient(145deg, rgba(255,237,224,0.95), rgba(255,220,190,0.9))', padding: '22px 12px', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1.5px solid rgba(255,107,0,0.3)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden' }} onClick={() => onPlay(selectedDisawarGame, gt)}>
                <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.4)', borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 900, color: '#FF6B00' }}>{gt.win}x</div>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,107,0,0.08)', border: '1.5px solid rgba(255,107,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 10 }}>{gt.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#FF6B00', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{gt.label}</div>
                <div style={{ fontSize: 11, color: '#7A5030', textAlign: 'center' }}>{gt.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER GAMES LIST ──────────────────────────────────────────
  const renderGamesList = (gamesList, isDisawarStyle = false, hideOpenTime = false) => {
    if (loading) return (
      <div style={{ textAlign: 'center', color: '#FF6B00', padding: 40, fontWeight: 700 }}>⏳ Loading Games...</div>
    );
    if (gamesList.length === 0) return (
      <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>Koi game available nahi hai.</div>
    );

    return gamesList.map(g => {
      const status = isDisawarStyle ? getDisawarStatus(g) : getGameStatus(g);
      const timerStr = timers[g.id] || '00:00:00';

      const formatStarlineResult = (g) => {
        const openRes = g.open_result;
        if (!openRes) return '***-*';
        const digits = String(openRes).replace(/[^0-9]/g, '');
        if (digits.length < 3) return '***-*';
        const sum = digits.split('').reduce((s, d) => s + parseInt(d), 0) % 10;
        return `${digits}-${sum}`;
      };

      const kal = isDisawarStyle
        ? getDisawarYesterdayJodi(g)
        : (g.open_result ? String(g.open_result).slice(-2) : 'XX');

      const aaj = isDisawarStyle
        ? formatDisawarResult(g)
        : (g.close_result ? String(g.close_result).slice(-2) : 'XX');

      return (
        <div key={g.id} style={{
          background: '#fff',
          borderRadius: 14,
          marginBottom: 12,
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
          border: '1px solid #ececec',
        }}>
          {/* HEADER: game name + close time */}
          <div style={{
            background: '#1a1a1a',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{getGameIcon(g.name)}</span>
              <span style={{
                fontSize: 14,
                fontWeight: 900,
                color: '#FF6B00',
                letterSpacing: 1,
                textTransform: 'uppercase',
                textShadow: '0 0 10px rgba(255,107,0,0.3)',
              }}>{g.name}</span>
            </div>
            <span style={{ fontSize: 11, color: '#bbb', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Close: <span style={{ color: '#FF6B00', fontWeight: 800 }}>{formatTime(g.close_time)}</span>
            </span>
          </div>

          {/* BODY: कल | आज | PLAY */}
          <div style={{
            background: '#faf8f5',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            {/* KAL */}
            <div style={{
              flex: 1,
              background: '#fff',
              borderRadius: 10,
              padding: '8px 6px',
              textAlign: 'center',
              border: '1px solid #e8e0d5',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                fontSize: 24,
                fontWeight: 900,
                color: '#FF6B00',
                lineHeight: 1.1,
                fontFamily: "'Orbitron', 'Poppins', sans-serif",
              }}>{kal}</div>
              <div style={{ fontSize: 11, color: '#aaa', fontWeight: 700, marginTop: 2 }}>कल</div>
            </div>

            {/* Arrow */}
            <div style={{ color: '#ccc', fontSize: 20 }}>›</div>

            {/* AAJ */}
            <div style={{
              flex: 1,
              background: '#fff',
              borderRadius: 10,
              padding: '8px 6px',
              textAlign: 'center',
              border: '1px solid #e8e0d5',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                fontSize: 24,
                fontWeight: 900,
                color: '#FF6B00',
                lineHeight: 1.1,
                fontFamily: "'Orbitron', 'Poppins', sans-serif",
              }}>{aaj}</div>
              <div style={{ fontSize: 11, color: '#aaa', fontWeight: 700, marginTop: 2 }}>आज</div>
            </div>

            {/* PLAY / CLOSED button */}
            <button
              onClick={() => status.canPlay && (isDisawarStyle ? setSelectedDisawarGame(g) : onPlay(g))}
              disabled={!status.canPlay}
              style={{
                flex: 1.5,
                padding: '12px 6px',
                border: 'none',
                borderRadius: 12,
                background: status.canPlay
                  ? 'linear-gradient(135deg, #FF6B00, #FF9500)'
                  : '#e0e0e0',
                color: status.canPlay ? '#fff' : '#999',
                fontWeight: 900,
                fontSize: 12,
                cursor: status.canPlay ? 'pointer' : 'not-allowed',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                boxShadow: status.canPlay ? '0 4px 14px rgba(255,107,0,0.4)' : 'none',
                position: 'relative',
                overflow: 'hidden',
                minWidth: 90,
              }}
            >
              {status.canPlay && (
                <div style={{
                  position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%',
                  background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.25), transparent)',
                  animation: 'shineMove 2.5s infinite linear',
                  pointerEvents: 'none',
                }}/>
              )}
              <span style={{ fontSize: 13, fontWeight: 900 }}>
                {status.canPlay ? '▶ PLAY' : 'CLOSED'}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.92)',
                fontFamily: "'Orbitron', monospace",
                letterSpacing: 0.5,
              }}>
                {formatTime(g.close_time)}
              </span>
            </button>
          </div>

          {/* CLOSED FOR TODAY bar */}
          {!status.canPlay && (
            <div style={{
              background: '#fff3f3',
              borderTop: '1px solid #ffd5d5',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{ color: '#e53935', fontSize: 12 }}>🔴</span>
              <span style={{ fontSize: 11, color: '#e53935', fontWeight: 800, letterSpacing: 1 }}>CLOSED FOR TODAY</span>
            </div>
          )}
        </div>
      );
    });
  };

  // ── MAIN HOME ──────────────────────────────────────────────────
  return (
    <div
      className="screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        paddingBottom: 80,
        backgroundColor: '#f2ede6',
        minHeight: '100vh',
        color: '#111',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {isAdminImpersonating && (
        <button onClick={backToAdmin} style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, background: '#0d1b5e', color: '#FFD700', padding: '8px 16px', borderRadius: 8, fontWeight: 800, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
          ⬅️ Back to Admin
        </button>
      )}

      <style>{`
        @keyframes shineMove { 0% { left: -100%; } 100% { left: 100%; } }
        @keyframes wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes fadeSlide { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        .text-slide-in { animation: fadeSlide 0.4s ease both; }
      `}</style>

      {/* ADD MONEY + WITHDRAW BUTTONS */}
      <div style={{
        display: 'flex',
        gap: 10,
        padding: '12px 14px 10px',
        background: '#f2ede6',
      }}>
        <button
          onClick={onAdd}
          style={{
            flex: 1,
            padding: '12px 0',
            border: 'none',
            borderRadius: 10,
            background: '#3aac0a',
            color: '#fff',
            fontWeight: 900,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: '0 3px 12px rgba(255,107,0,0.35)',
            letterSpacing: 0.5,
          }}
        >
          💰 ADD MONEY
        </button>
        <button
          onClick={onWith}
          style={{
            flex: 1,
            padding: '12px 0',
            border: 'none',
            borderRadius: 10,
            background: '#f11313',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: '0 3px 12px rgba(229,57,53,0.3)',
            letterSpacing: 0.5,
          }}
        >
          🏦 WITHDRAW
        </button>
      </div>

      {/* TEXT SLIDER — 4 slides */}
      <div style={{ padding: '0 14px 12px', position: 'relative' }}>
        <div style={{
          borderRadius: 16,
          overflow: 'hidden',
          height: 110,
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
        }}>
          {TEXT_SLIDES.map((slide, i) => (
            <div
              key={i}
              className={currentSlide === i ? 'text-slide-in' : ''}
              style={{
                position: 'absolute', inset: 0,
                opacity: currentSlide === i ? 1 : 0,
                transition: 'opacity 0.5s ease',
                pointerEvents: currentSlide === i ? 'auto' : 'none',
                background: slide.bg,
                display: 'flex',
                alignItems: 'center',
                padding: '0 18px',
                gap: 16,
                borderLeft: `5px solid ${slide.color}`,
                overflow: 'hidden',
              }}
            >
              {/* Decorative circles */}
              <div style={{ position:'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius:'50%', background: slide.accent, pointerEvents:'none' }}/>
              <div style={{ position:'absolute', right: 40, bottom: -30, width: 70, height: 70, borderRadius:'50%', background: slide.accent, pointerEvents:'none' }}/>

              {/* Icon box */}
              <div style={{
                width: 58, height: 58, borderRadius: 16,
                background: slide.accent,
                border: `2px solid ${slide.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, flexShrink: 0,
                boxShadow: `0 0 16px ${slide.accent}`,
              }}>{slide.icon}</div>

              {/* Text */}
              <div style={{ flex: 1, zIndex: 2 }}>
                <div style={{
                  display: 'inline-block',
                  background: slide.accent,
                  border: `1px solid ${slide.color}`,
                  borderRadius: 20,
                  padding: '2px 10px',
                  fontSize: 9,
                  fontWeight: 800,
                  color: slide.color,
                  letterSpacing: 1,
                  marginBottom: 5,
                }}>{slide.badge}</div>
                <div style={{
                  fontSize: 15, fontWeight: 900,
                  color: '#fff', letterSpacing: 1,
                  textTransform: 'uppercase', lineHeight: 1.2,
                }}>
                  {slide.line1} <span style={{ color: slide.color }}>{slide.line2}</span>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 600,
                  color: 'rgba(255,255,255,0.55)',
                  marginTop: 4, letterSpacing: 0.3,
                }}>{slide.sub}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
          {TEXT_SLIDES.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                width: currentSlide === i ? 20 : 7,
                height: 7,
                borderRadius: 4,
                background: currentSlide === i ? '#FF6B00' : '#ccc',
                transition: 'all 0.3s',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* LIVE GAMES HEADING */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 16px 10px',
      }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          background: '#FF6B00',
          display: 'inline-block',
          boxShadow: '0 0 8px #FF6B00',
          animation: 'pulseDot 1.2s infinite',
        }}/>
        <span style={{
          fontSize: 14,
          fontWeight: 900,
          color: '#1a1a1a',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>LIVE GAMES</span>
      </div>

      <style>{`@keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.4)} }`}</style>

      {/* GAMES LIST */}
      <div style={{ padding: '0 12px' }}>
        {renderGamesList(disawarGames, true)}
      </div>
    </div>
  );
}
