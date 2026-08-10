import React, { useState, useEffect } from 'react';

const API_URL = 'https://aditya-nh9i.onrender.com';

function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleReset = async () => {
    setErr('');
    if (!mobile || mobile.length !== 10) return setErr('Valid 10-digit mobile daalo');
    if (!name.trim()) return setErr('Registered naam daalo');
    if (!newPass || newPass.length < 6) return setErr('Naya password minimum 6 characters');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, name: name.trim(), new_password: newPass }),
      });
      const data = await res.json();
      if (!data.success) { setErr(data.message || 'Kuch galat hua'); setLoading(false); return; }
      setStep(2);
    } catch {
      setErr('Network error. Dobara try karo.');
    }
    setLoading(false);
  };

  return (
    <div className="forgot-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="forgot-modal">
        <div className="modal-head">
          <div className="modal-title">🔑 Password Reset</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {step === 1 ? (
          <>
            <p className="modal-help">Apna registered mobile number aur naam daalo.</p>
            <label className="modal-label">Mobile Number</label>
            <div className="modal-input">
              <span>📱</span>
              <span className="modal-prefix">+91</span>
              <input type="tel" placeholder="10-digit mobile" value={mobile} maxLength={10}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} />
            </div>
            <label className="modal-label">Registered Naam</label>
            <div className="modal-input">
              <span>👤</span>
              <input type="text" placeholder="Register karte time diya naam" value={name}
                onChange={(e) => setName(e.target.value)} />
            </div>
            <label className="modal-label">Naya Password</label>
            <div className="modal-input password-modal-input">
              <span>🔒</span>
              <input type={showPass ? 'text' : 'password'} placeholder="Minimum 6 characters"
                value={newPass} onChange={(e) => setNewPass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReset()} />
              <button className="modal-eye" onClick={() => setShowPass((p) => !p)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {err && <div className="error-box">⚠️ {err}</div>}
            <button className="modal-gold-btn" onClick={handleReset} disabled={loading}>
              {loading ? '⏳ Checking...' : '🔑 Reset Password'}
            </button>
          </>
        ) : (
          <div className="reset-success">
            <div className="success-icon">✅</div>
            <div className="success-title">Password Reset Ho Gaya!</div>
            <div className="success-text">Ab naye password se login karo.</div>
            <button className="modal-gold-btn" onClick={onClose}>🚀 Login Karo</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [siteName, setSiteName] = useState('MARUTI MATKA');
  const [showForgot, setShowForgot] = useState(false);
  const [waNumber, setWaNumber] = useState('');
  const [tgUsername, setTgUsername] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/payment-info`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.site_name) setSiteName(d.data.site_name);
        if (d.success && d.data?.whatsapp_support) setWaNumber(d.data.whatsapp_support);
        if (d.success && d.data?.telegram) setTgUsername(d.data.telegram);
      })
      .catch(() => {});
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) { setReferralCode(refCode.toUpperCase()); setTab('register'); }
  }, []);

  const go = async () => {
    setErr(''); setLoading(true);
    try {
      let endpoint = '', payload = {};
      if (tab === 'login') {
        if (!mobile || !password) { setErr('Mobile aur password daalo'); setLoading(false); return; }
        endpoint = '/api/auth/login';
        payload = { mobile, password };
      } else {
        if (!name || !mobile || !password) { setErr('Sab fields zaroori hain'); setLoading(false); return; }
        if (mobile.length !== 10) { setErr('Valid 10-digit mobile daalo'); setLoading(false); return; }
        if (password.length < 6) { setErr('Password minimum 6 characters'); setLoading(false); return; }
        endpoint = '/api/auth/register';
        payload = { name, mobile, password };
        if (referralCode.trim()) payload.referral_code = referralCode.trim().toUpperCase();
      }
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const res = await response.json();
      if (!res.success) { setErr(res.message || 'Failed'); setLoading(false); return; }
      localStorage.setItem('mk_token', res.token);
      onLogin(res.user);
    } catch (e) {
      setErr(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const switchTab = (t) => {
    setTab(t); setErr(''); setName(''); setMobile(''); setPassword('');
    if (t === 'login') setReferralCode('');
  };

  const sparks = [
    ['5%','8%',4],['10%','89%',3],['18%','4%',3],['24%','93%',4],
    ['31%','8%',3],['42%','95%',4],['56%','3%',3],['68%','91%',4],
    ['78%','7%',3],['88%','87%',4],['94%','28%',3],['14%','50%',3],
    ['47%','12%',3],['61%','82%',3],['35%','96%',4],['82%','48%',3],
  ];

  return (
    <div className="auth-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }
        html, body, #root { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden !important; }
        button, input { font-family: 'Poppins', sans-serif; }

        .auth-page {
          position: fixed; inset: 0;
          width: 100vw; height: 100dvh;
          overflow: hidden !important;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(180deg, #FF6B00 0%, #e55a00 100%);
          color: #1A0A00;
        }

        .auth-shell {
          position: relative;
          width: min(100vw, 430px);
          height: 100dvh;
          min-height: 0;
          overflow: hidden;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-start;
          padding: 8px 12px 8px;
          background: linear-gradient(180deg, #FF6B00 0%, #FF8C00 40%, #FFF5E6 100%);
        }

        @keyframes sparkle {
          0%, 100% { opacity: .2; transform: scale(.5); }
          50% { opacity: 1; transform: scale(1.6); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes goldShine {
          0% { left: -130%; }
          55%, 100% { left: 160%; }
        }
        @keyframes textShine {
          0% { background-position: 220% center; }
          100% { background-position: -220% center; }
        }
        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 18px 50px rgba(0,0,0,.15), 0 0 20px rgba(255,107,0,.15); }
          50% { box-shadow: 0 18px 50px rgba(0,0,0,.2), 0 0 35px rgba(255,107,0,.3); }
        }

        .spark {
          position: absolute; border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 10px 3px rgba(255,255,255,.75);
          animation: sparkle 2.4s ease-in-out infinite;
          z-index: 1;
        }

        .logo-wrap {
          position: relative; z-index: 3;
          width: min(100%, 430px);
          height: clamp(160px, 25vh, 230px);
          display: flex; justify-content: center; align-items: center;
          flex: 0 0 auto;
        }

        .logo-ring {
          position: absolute; left: 50%; top: 50%;
          width: 280px; height: 280px;
          transform: translate(-50%,-50%) rotate(45deg);
          border: 2px solid rgba(255,255,255,.35);
          border-radius: 14px;
        }
        .logo-ring.small {
          width: 210px; height: 210px;
          border-color: rgba(255,255,255,.2);
        }

        .logo-glow {
          position: absolute; left: 50%; top: 50%;
          transform: translate(-50%,-50%);
          width: 200px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,.25), transparent 68%);
          filter: blur(18px);
        }

        .auth-logo {
          position: relative; z-index: 3;
          width: clamp(160px, 20vw, 250px);
          height: clamp(150px, 22vh, 210px);
          object-fit: contain;
          filter: drop-shadow(0 0 22px rgba(255,255,255,.4)) drop-shadow(0 7px 22px rgba(0,0,0,.3));
          animation: logoFloat 4s ease-in-out infinite;
        }

        .hero-divider {
          position: relative; z-index: 5;
          width: min(92%, 360px); height: 30px;
          margin: -1px 0 0;
          display: flex; align-items: center; justify-content: center;
        }
        .hero-divider::before, .hero-divider::after {
          content: '';
          position: absolute; top: 50%;
          width: 44%; height: 2px;
          transform: translateY(-50%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.8) 18%, #fff 52%, rgba(255,255,255,.8) 82%, transparent);
          box-shadow: 0 0 7px rgba(255,255,255,.6);
        }
        .hero-divider::before { left: 0; }
        .hero-divider::after { right: 0; }

        .divider-gem {
          position: relative;
          width: 22px; height: 22px;
          transform: rotate(45deg);
          border: 2px solid #fff;
          background: linear-gradient(135deg, #FF6B00, #ff9d50 48%, #e55a00);
          box-shadow: 0 0 9px rgba(255,255,255,.8);
        }

        .brand {
          position: relative; z-index: 4;
          width: 100%; text-align: center;
          flex: 0 0 auto; margin-top: 0;
        }
        .brand-title {
          margin: 0;
          font-size: clamp(28px, 4vw, 46px);
          line-height: 1; font-weight: 900;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: #fff;
          text-shadow: 0 3px 0 rgba(0,0,0,.25), 0 0 20px rgba(255,255,255,.3);
        }
        .brand-subtitle {
          margin: 5px 0 0;
          font-size: clamp(11px, 1.6vw, 15px);
          font-weight: 800; line-height: 1.1;
          color: rgba(255,255,255,.85);
          text-shadow: 0 1px 4px rgba(0,0,0,.2);
        }
        .brand-subtitle b { color: #fff; }

        .auth-card {
          position: relative; z-index: 4;
          width: min(100%, 450px);
          margin-top: clamp(9px, 1.5vh, 16px);
          padding: 16px 17px 16px;
          border-radius: 23px;
          background: #fff;
          border: 2px solid rgba(255,107,0,.25);
          animation: cardGlow 4s ease-in-out infinite;
          flex: 0 0 auto;
        }

        .tabs {
          height: 52px; display: flex; gap: 3px;
          padding: 3px;
          border: 2px solid rgba(255,107,0,.2);
          border-radius: 17px;
          background: rgba(255,107,0,.06);
          margin-bottom: 14px;
        }
        .tab {
          flex: 1; border: 0; border-radius: 13px;
          background: transparent;
          color: #FF6B00; font-size: 14px; font-weight: 900;
          cursor: pointer; transition: .2s ease;
        }
        .tab.active {
          color: #fff;
          background: linear-gradient(180deg, #FF8C00 0%, #FF6B00 48%, #e55a00 100%);
          box-shadow: 0 0 15px rgba(255,107,0,.4), inset 0 2px 0 rgba(255,255,255,.3);
        }

        .field { margin-bottom: 11px; }
        .field-label {
          display: block; margin: 0 0 5px 1px;
          color: #FF6B00; font-size: 10px; font-weight: 900;
          letter-spacing: .8px; text-transform: uppercase;
        }

        .input-box {
          height: 49px; width: 100%;
          display: flex; align-items: center; overflow: hidden;
          border: 2px solid rgba(255,107,0,.35);
          border-radius: 14px;
          background: rgba(255,107,0,.04);
          transition: .2s ease;
        }
        .input-box:focus-within {
          border-color: #FF6B00;
          box-shadow: 0 0 0 3px rgba(255,107,0,.08), 0 0 17px rgba(255,107,0,.1);
        }

        .input-icon {
          width: 43px; height: 100%; flex: 0 0 43px;
          display: grid; place-items: center;
          background: rgba(255,107,0,.08);
          font-size: 17px;
        }
        .prefix {
          padding: 0 5px; color: #FF6B00;
          font-size: 14px; font-weight: 900;
        }
        .input-box input {
          min-width: 0; flex: 1; height: 100%;
          border: 0; outline: 0; background: transparent;
          color: #1A0A00; font-size: 15px; font-weight: 700;
          padding: 0 8px; caret-color: #FF6B00;
        }
        .input-box input::placeholder { color: rgba(0,0,0,.25); }

        .eye {
          width: 42px; height: 100%; border: 0;
          background: transparent; color: rgba(0,0,0,.4);
          cursor: pointer; font-size: 17px;
        }

        .error-box {
          margin: 0 0 10px; padding: 8px 11px;
          border-left: 3px solid #ff4455; border-radius: 7px;
          background: rgba(255,23,68,.07);
          color: #cc1133; font-size: 11px; font-weight: 700;
        }

        .gold-btn {
          position: relative; overflow: hidden;
          width: 100%; min-height: 56px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          border: none; border-radius: 36px;
          background: linear-gradient(180deg, #FF8C00 0%, #FF6B00 52%, #e55a00 100%);
          color: #fff; cursor: pointer;
          box-shadow: 0 4px 20px rgba(255,107,0,.4), inset 0 2px 0 rgba(255,255,255,.25);
          transition: transform .15s, filter .15s;
        }
        .gold-btn::after {
          content: ''; position: absolute; top: 0; left: -130%;
          width: 55%; height: 100%; transform: skewX(-20deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.5), transparent);
          animation: goldShine 2.4s ease-in-out infinite;
        }
        .gold-btn:hover { transform: translateY(-2px) scale(1.01); filter: brightness(1.08); }
        .gold-btn:active { transform: scale(.98); }

        .gold-main {
          position: relative; z-index: 2;
          font-size: 16px; font-weight: 900;
          letter-spacing: 1px; line-height: 1.1;
        }
        .gold-sub {
          position: relative; z-index: 2;
          margin-top: 2px; font-size: 10px;
          font-weight: 900; letter-spacing: 1.1px;
          line-height: 1; color: rgba(255,255,255,.85);
        }

        .forgot-link {
          display: block; width: max-content;
          margin: 10px auto 0;
          color: #FF6B00; font-size: 12px; font-weight: 800;
          text-decoration: underline; cursor: pointer;
        }
        .forgot-link:hover { color: #e55a00; }

        .footer-note {
          position: relative; z-index: 3;
          margin: 7px 0 0; color: rgba(255,255,255,.75);
          font-size: 12px; font-weight: 600; text-align: center;
          flex: 0 0 auto;
        }

        /* ─── FORGOT MODAL ─── */
        .forgot-overlay {
          position: fixed; inset: 0; z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          background: rgba(0,0,0,.7); backdrop-filter: blur(7px);
        }
        .forgot-modal {
          width: min(100%, 370px); padding: 22px;
          border-radius: 21px;
          background: #fff;
          border: 2px solid rgba(255,107,0,.3);
          box-shadow: 0 0 45px rgba(255,107,0,.2);
        }
        .modal-head {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 12px;
        }
        .modal-title { color: #FF6B00; font-size: 17px; font-weight: 900; }
        .modal-close {
          width: 32px; height: 32px;
          border: 1px solid rgba(255,107,0,.3); border-radius: 8px;
          background: rgba(255,107,0,.08);
          color: #FF6B00; cursor: pointer;
        }
        .modal-help {
          margin: 0 0 15px; color: rgba(0,0,0,.45);
          font-size: 12px; line-height: 1.5; font-weight: 600;
        }
        .modal-label {
          display: block; margin: 0 0 6px;
          color: #FF6B00; font-size: 10px;
          font-weight: 900; letter-spacing: 1px; text-transform: uppercase;
        }
        .modal-input {
          height: 47px; display: flex; align-items: center;
          margin-bottom: 12px; padding: 0 11px;
          border: 1.5px solid rgba(255,107,0,.3); border-radius: 11px;
          background: rgba(255,107,0,.04);
        }
        .modal-input input {
          flex: 1; min-width: 0; height: 100%;
          border: 0; outline: 0; background: transparent;
          color: #1A0A00; padding: 0 10px;
          font-size: 13px; font-weight: 600;
        }
        .modal-prefix { color: #FF6B00; font-size: 13px; font-weight: 900; padding-left: 7px; }
        .modal-eye { border: 0; background: transparent; cursor: pointer; font-size: 16px; }
        .modal-gold-btn {
          width: 100%; border: none; border-radius: 40px;
          padding: 13px; color: #fff;
          background: linear-gradient(90deg, #e55a00, #FF8C00, #e55a00);
          font-size: 13px; font-weight: 900; cursor: pointer;
        }
        .reset-success { text-align: center; padding: 8px 0 2px; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
        .success-title { color: #FF6B00; font-size: 17px; font-weight: 900; margin-bottom: 7px; }
        .success-text { color: rgba(0,0,0,.45); font-size: 12px; font-weight: 600; margin-bottom: 20px; }

        @media (max-width: 600px) {
          .auth-shell { width: 100vw; padding: 3px 8px 5px; }
          .logo-wrap { height: 160px; }
          .auth-logo { width: 220px; height: 155px; }
          .logo-ring { width: 230px; height: 230px; }
          .logo-ring.small { width: 175px; height: 175px; }
          .brand-title { font-size: 29px; }
          .brand-subtitle { font-size: 11px; }
          .auth-card { margin-top: 8px; padding: 13px 12px 13px; }
          .tabs { height: 48px; margin-bottom: 11px; }
          .tab { font-size: 13px; }
          .field { margin-bottom: 8px; }
          .input-box { height: 45px; }
          .gold-btn { min-height: 52px; }
          .gold-main { font-size: 14px; }
          .gold-sub { font-size: 9px; }
          .footer-note { display: none; }
        }

        @media (max-height: 700px) {
          .logo-wrap { height: 130px; }
          .auth-logo { width: 190px; height: 125px; }
          .logo-ring { width: 195px; height: 195px; }
          .logo-ring.small { width: 150px; height: 150px; }
          .brand-title { font-size: 25px; }
          .brand-subtitle { font-size: 10px; }
          .auth-card { margin-top: 5px; padding: 10px 11px 10px; }
          .tabs { height: 44px; margin-bottom: 8px; }
          .field { margin-bottom: 6px; }
          .input-box { height: 40px; }
          .gold-btn { min-height: 46px; }
        }
      `}</style>

      <div className="auth-shell">

        {sparks.map(([top, left, size], i) => (
          <span key={i} className="spark"
            style={{ top, left, width: size, height: size, animationDelay: `${i * .16}s` }} />
        ))}

        {/* LOGO */}
        <div className="logo-wrap">
          <div className="logo-ring" />
          <div className="logo-ring small" />
          <div className="logo-glow" />
          <img className="auth-logo" src="/yono.png" alt="MATKA"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>

        {/* DIVIDER */}
        <div className="hero-divider" aria-hidden="true">
          <span className="divider-gem" />
        </div>

        {/* BRAND */}
        <div className="brand">
          <h1 className="brand-title">{siteName}</h1>
          <p className="brand-subtitle">India's <b>#1</b> Premium Matka Platform</p>
        </div>

        {/* FORGOT MODAL */}
        {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

        {/* AUTH CARD */}
        <div className="auth-card">

          <div className="tabs">
            {['login', 'register'].map((t) => (
              <button key={t} className={`tab ${tab === t ? 'active' : ''}`}
                onClick={() => switchTab(t)}>
                {t === 'login' ? '🔐 LOGIN' : '📝 REGISTER'}
              </button>
            ))}
          </div>

          {tab === 'register' && (
            <div className="field">
              <label className="field-label">Full Name</label>
              <div className="input-box">
                <span className="input-icon">👤</span>
                <input type="text" placeholder="PLEASE ENTER YOUR NAME"
                  value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
          )}

          <div className="field">
            <label className="field-label">Mobile Number</label>
            <div className="input-box">
              <span className="input-icon">📱</span>
              <span className="prefix">+91</span>
              <input type="tel" placeholder="10-digit mobile" maxLength={10}
                value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <div className="input-box">
              <span className="input-icon">🔒</span>
              <input type={showPass ? 'text' : 'password'} placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && go()} />
              <button className="eye" onClick={() => setShowPass((p) => !p)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <div className="field">
              <label className="field-label">
                Referral Code <span style={{ opacity: .4, textTransform: 'none' }}>(Optional)</span>
              </label>
              <div className="input-box">
                <span className="input-icon">🎁</span>
                <input type="text" placeholder="ENTER REFERRAL CODE" maxLength={10}
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())} />
              </div>
            </div>
          )}

          {err && <div className="error-box">⚠️ {err}</div>}

          <button className="gold-btn" onClick={go} disabled={loading}>
            <span className="gold-main">
              {loading ? '⏳ PROCESSING...' : tab === 'login' ? '🚀 SECURE LOGIN' : '✨ CREATE ACCOUNT'}
            </span>
            {!loading && <span className="gold-sub">PLAY SMART, WIN BIG</span>}
          </button>

          {tab === 'login' && (
            <div className="forgot-link" onClick={() => setShowForgot(true)}>
              🔑 Forgot Password?
            </div>
          )}

          {(waNumber || tgUsername) && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {waNumber && (
                <a href={`https://wa.me/91${waNumber.replace(/\D/g, '')}`}
                  target="_blank" rel="noreferrer"
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 6, padding: '11px 0',
                    borderRadius: 12, background: 'rgba(37,211,102,0.08)',
                    border: '1.5px solid rgba(37,211,102,0.35)',
                    color: '#1a7a40', fontWeight: 800, fontSize: 13, textDecoration: 'none',
                  }}>
                  💬 WhatsApp
                </a>
              )}
              {tgUsername && (
                <a href={`https://t.me/${tgUsername}`}
                  target="_blank" rel="noreferrer"
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 6, padding: '11px 0',
                    borderRadius: 12, background: 'rgba(0,136,204,0.08)',
                    border: '1.5px solid rgba(0,136,204,0.3)',
                    color: '#0077aa', fontWeight: 800, fontSize: 13, textDecoration: 'none',
                  }}>
                  ✈️ Telegram
                </a>
              )}
            </div>
          )}

        </div>

        <p className="footer-note">18+ Only · Play Responsibly · © 2026 {siteName}</p>

      </div>
    </div>
  );
}