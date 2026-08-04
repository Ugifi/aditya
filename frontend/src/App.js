import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

import AuthScreen from './components/AuthScreen';
import Toast from './components/Toast';
import { DepositModal } from './pages/OtherPages';
import { WithdrawModal } from './components/Modals';

import HomeScreen from './pages/HomeScreen';
import GameTypePage from './pages/GameTypePage';
import BetForm from './pages/BetForm';
import { BidsPage, TxnsPage, WalletPage, SupportPage, HowToPlayPage, FAQPage, TermsPage, PrivacyPage, ReferralPage, GameRatesPage } from './pages/OtherPages';
import AdminPanel, { AdminLogin } from './pages/AdminPanel';

import { INIT_BIDS, INIT_TXNS } from './data/gameData';

var API = 'https://sattamatka-deepak-hy1n.onrender.com';

function apiCall(path, method, body) {
  if (!method) method = 'GET';
  var token = localStorage.getItem('mk_token');
  var opts = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (token) {
    opts.headers['Authorization'] = 'Bearer ' + token;
  }
  if (body) {
    opts.body = JSON.stringify(body);
  }
  return fetch(API + path, opts).then(function(r) { return r.json(); });
}

var IconTransaction = function(props) {
  var size = props.size || 24;
  var color = props.color || 'currentColor';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.8"/>
      <line x1="7" y1="8" x2="17" y2="8" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="7" y1="16" x2="13" y2="16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
};

var IconBids = function(props) {
  var size = props.size || 24;
  var color = props.color || 'currentColor';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="14,2 14,8 20,8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="9" y1="13" x2="15" y2="13" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9" y1="17" x2="12" y2="17" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
};

var IconHome = function(props) {
  var size = props.size || 26;
  var color = props.color || '#fff';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 17L4.5 7L9 12L12 4L15 12L19.5 7L22 17H2Z" fill={color} opacity="0.2"/>
      <path d="M2 17L4.5 7L9 12L12 4L15 12L19.5 7L22 17" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <rect x="2" y="17" width="20" height="3" rx="1.5" fill={color}/>
      <circle cx="4.5" cy="6.5" r="1.5" fill={color}/>
      <circle cx="12" cy="3.5" r="1.5" fill={color}/>
      <circle cx="19.5" cy="6.5" r="1.5" fill={color}/>
    </svg>
  );
};

var IconWallet = function(props) {
  var size = props.size || 24;
  var color = props.color || 'currentColor';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke={color} strokeWidth="1.8"/>
      <path d="M16 3L20 7H4L8 3H16Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <circle cx="17" cy="14" r="2" stroke={color} strokeWidth="1.6"/>
    </svg>
  );
};

var IconSupport = function(props) {
  var size = props.size || 24;
  var color = props.color || 'currentColor';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="10" r="1" fill={color}/>
      <circle cx="12" cy="10" r="1" fill={color}/>
      <circle cx="16" cy="10" r="1" fill={color}/>
    </svg>
  );
};

function LanguageScreen(props) {
  var onSelect = props.onSelect;
  var languages = [
    { label: 'English', val: 'en' },
    { label: '\u0939\u093F\u0928\u094D\u0926\u0940', val: 'hi' },
    { label: '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41', val: 'te' },
    { label: '\u0C95\u0CA8\u0CCD\u0CA8\u0CA1', val: 'kn' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f0e8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: "'Poppins', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position:'absolute', top:'-5%', left:'-10%', width:300, height:300, borderRadius:'50%', background:'rgba(232,101,10,0.06)', filter:'blur(60px)' }}/>
      <div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:350, height:350, borderRadius:'50%', background:'rgba(232,101,10,0.04)', filter:'blur(70px)' }}/>

      <div style={{ width:100, height:100, borderRadius:'50%', background:'rgba(232,101,10,0.1)', border:'2px solid rgba(232,101,10,0.3)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, boxShadow:'0 0 30px rgba(232,101,10,0.15)', overflow:'hidden' }}>
        <img src={process.env.PUBLIC_URL + '/th.jpg'} alt="Logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      </div>

      <div style={{ color:'#1a1a1a', fontSize:26, fontWeight:900, letterSpacing:2, marginBottom:4, fontFamily:"'Baloo 2', cursive" }}>MATKA BOSS</div>
      <div style={{ color:'#e8650a', fontSize:12, fontWeight:700, letterSpacing:1, marginBottom:40 }}>India's #1 Premium Matka Platform</div>

      <div style={{ color:'#1a1a1a', fontSize:22, fontWeight:800, marginBottom:6 }}>Select your</div>
      <div style={{ color:'#e8650a', fontSize:28, fontWeight:900, marginBottom:32, letterSpacing:1, fontFamily:"'Baloo 2', cursive" }}>Language</div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, width:'100%', maxWidth:320 }}>
        {languages.map(function(l) {
          return (
            <button key={l.val} onClick={function() { onSelect(l.val); }}
              style={{
                padding: '20px 0',
                borderRadius: 16,
                border: '2px solid rgba(232,101,10,0.3)',
                background: 'rgba(232,101,10,0.06)',
                color: '#e8650a',
                fontSize: 18,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                letterSpacing: 0.5,
                fontFamily: "'Poppins', sans-serif"
              }}>
              {l.label}
            </button>
          );
        })}
      </div>

      <button onClick={function() { onSelect('mr'); }}
        style={{
          marginTop: 14,
          padding: '20px 80px',
          borderRadius: 16,
          border: '2px solid rgba(232,101,10,0.3)',
          background: 'rgba(232,101,10,0.06)',
          color: '#e8650a',
          fontSize: 18,
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
          letterSpacing: 0.5,
          transition: 'all 0.2s',
          fontFamily: "'Poppins', sans-serif"
        }}>
        {'\u092E\u0930\u093E\u0920\u0940'}
      </button>

      <div style={{ color:'rgba(26,26,26,0.3)', fontSize:11, marginTop:40, fontWeight:600 }}>18+ Only · Play Responsibly</div>
    </div>
  );
}

function BlueDrawer(props) {
  var user = props.user;
  var onClose = props.onClose;
  var onNav = props.onNav;
  var onLogout = props.onLogout;
  var wallet = props.wallet;

  var waState = React.useState('919999999999');
  var waNumber = waState[0];
  var setWaNumber = waState[1];
  var tgState = React.useState('matkaking_support');
  var tgId = tgState[0];
  var setTgId = tgState[1];

  React.useEffect(function() {
    apiCall('/api/admin/settings').then(function(res) {
      if (res && res.success && res.settings) {
        var s = res.settings;
        if (s.phone || s.whatsapp_support) {
          var num = (s.phone || s.whatsapp_support).replace(/\D/g, '');
          setWaNumber(num.startsWith('91') ? num : '91' + num);
        }
        if (s.telegram) setTgId(s.telegram);
      }
    }).catch(function() {});
  }, []);

  var menuItems = [
    { section: 'ACCOUNT' },
    { ic: '\uD83D\uDC5B', label: 'My Wallet',           id: 'wallet' },
    { ic: '\uD83D\uDCCB', label: 'Transaction History', id: 'txns' },
    { ic: '\u270F\uFE0F', label: 'Edit Profile',        id: 'profile' },
    { ic: '\uD83C\uDF81', label: 'Refer & Earn',        id: 'referral' },
    { section: 'GAMES' },
    { ic: '\uD83C\uDFAE', label: 'All Games',           id: 'home' },
    { ic: '\uD83C\uDFC6', label: 'Win History',         id: 'bids' },
    { section: 'HELP & SUPPORT' },
    { ic: '\uD83D\uDCAC', label: 'WhatsApp Support',    id: 'wa',  action: function() { window.open('https://wa.me/' + waNumber, '_blank'); } },
    { ic: '\u2708\uFE0F', label: 'Telegram Support',   id: 'tg',  action: function() { window.open('https://t.me/' + tgId, '_blank'); } },
    { ic: '\uD83D\uDCD6', label: 'How to Play',         id: 'htp' },
    { ic: '\uD83C\uDFB0', label: 'Game Rates',          id: 'gamerates' },
    { ic: '\u2753', label: 'FAQ',                 id: 'faq' },
    { ic: '\uD83D\uDCDC', label: 'Terms & Conditions',  id: 'terms' },
    { ic: '\uD83D\uDD12', label: 'Privacy Policy',      id: 'privacy' },
  ];

  var quickBtns = [
    { ic: '\uD83D\uDCB0', label: 'Add Fund', id: 'add' },
    { ic: '\uD83D\uDCB8', label: 'Withdraw', id: 'with' },
    { ic: '\uD83C\uDFAF', label: 'My Bids', id: 'bids' }
  ];

  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:500, backdropFilter:'blur(3px)' }} />
      <div style={{ position:'fixed', top:0, left:0, width:280, height:'100%', background:'#1a1a2e', zIndex:501, overflowY:'auto', animation:'slideDrawerIn 0.25s ease', boxShadow:'4px 0 24px rgba(232,101,10,0.08)', paddingBottom:40, borderRight:'1px solid rgba(232,101,10,0.1)' }}>
        <style>{'@keyframes slideDrawerIn { from { transform: translateX(-100%); } to { transform: translateX(0); } } .drawer-menu-item:hover { background: rgba(232,101,10,0.06) !important; transform: translateX(4px); }'}</style>

        <div style={{ background:'linear-gradient(135deg, #1a1a2e, #2d2d5e)', padding:'20px 16px 16px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'1px solid rgba(232,101,10,0.1)' }}>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ width:50, height:50, borderRadius:'50%', background:'rgba(232,101,10,0.1)', border:'2px solid rgba(232,101,10,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0, color:'#e8650a' }}>
              {(user && user.name ? user.name : 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:2, fontFamily:"'Poppins', sans-serif" }}>{user && user.name ? user.name : 'Player'}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{user && user.mobile ? user.mobile : ''}</div>
              <div style={{ fontSize:11, color:'#e8650a', marginTop:2 }}>
                {'\uD83D\uDCB0'} Rs.{Number(wallet || 0).toLocaleString('en-IN', { minimumFractionDigits:2 })}
              </div>
            </div>
          </div>
          <div onClick={onClose} style={{ color:'#e8650a', fontSize:22, cursor:'pointer', padding:'2px 4px', lineHeight:1 }}>{'\u2715'}</div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, padding:'14px 12px', borderBottom:'1px solid rgba(232,101,10,0.08)', background:'#2a2a4a' }}>
          {quickBtns.map(function(btn) {
            return (
              <div key={btn.id} onClick={function() { onNav(btn.id); onClose(); }}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer', padding:'8px 4px', borderRadius:10, transition:'background 0.15s' }}>
                <div style={{ width:40, height:40, background:'rgba(232,101,10,0.08)', border:'1.5px solid rgba(232,101,10,0.2)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{btn.ic}</div>
                <div style={{ fontSize:11, color:'#e8650a', fontWeight:700, textAlign:'center', fontFamily:"'Poppins', sans-serif" }}>{btn.label}</div>
              </div>
            );
          })}
        </div>

        {menuItems.map(function(item, i) {
          if (item.section) {
            return (
              <div key={i} style={{ fontSize:10, color:'#e8650a', letterSpacing:2, textTransform:'uppercase', padding:'14px 16px 4px', fontWeight:700, fontFamily:"'Poppins', sans-serif" }}>{item.section}</div>
            );
          }
          return (
            <div key={i} className="drawer-menu-item"
              onClick={function() { if (item.action) item.action(); else onNav(item.id); onClose(); }}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', cursor:'pointer', borderBottom:'1px solid rgba(232,101,10,0.06)', transition:'all 0.15s' }}>
              <div style={{ width:36, height:36, background:'rgba(232,101,10,0.08)', border:'1px solid rgba(232,101,10,0.15)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{item.ic}</div>
              <div style={{ fontSize:15, fontWeight:600, color:'#fff', fontFamily:"'Poppins', sans-serif" }}>{item.label}</div>
              <div style={{ marginLeft:'auto', color:'#e8650a', fontSize:18 }}>{'\u203A'}</div>
            </div>
          );
        })}

        <div onClick={onLogout}
          style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', cursor:'pointer', marginTop:8, borderTop:'1px solid rgba(232,101,10,0.08)' }}>
          <div style={{ width:36, height:36, background:'rgba(255,23,68,0.08)', border:'1px solid rgba(255,23,68,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{'\uD83D\uDEAA'}</div>
          <div style={{ fontSize:15, fontWeight:700, color:'#ff1744', fontFamily:"'Poppins', sans-serif" }}>Logout</div>
        </div>
      </div>
    </React.Fragment>
  );
}

function ProfileScreen(props) {
  var user = props.user;
  var showToast = props.showToast;

  var waState = React.useState('919999999999');
  var waNumber = waState[0];
  var setWaNumber = waState[1];
  var tgState = React.useState('matkaking_support');
  var tgId = tgState[0];
  var setTgId = tgState[1];

  React.useEffect(function() {
    apiCall('/api/admin/settings').then(function(res) {
      if (res && res.success && res.settings) {
        var s = res.settings;
        if (s.phone || s.whatsapp_support) {
          var num = (s.phone || s.whatsapp_support).replace(/\D/g, '');
          setWaNumber(num.startsWith('91') ? num : '91' + num);
        }
        if (s.telegram) setTgId(s.telegram);
      }
    }).catch(function() {});
  }, []);

  var nameState = useState(user && user.name ? user.name : '');
  var name = nameState[0];
  var setName = nameState[1];
  var passState = useState('');
  var password = passState[0];
  var setPassword = passState[1];
  var upState = useState(false);
  var updating = upState[0];
  var setUpdating = upState[1];

  var handleUpdate = async function() {
    if (!name) return showToast('Naam khali nahi chhod sakte!', 'err');
    setUpdating(true);
    try {
      var token = localStorage.getItem('mk_token');
      if (password) {
        if (password.length < 6) throw new Error('Password min 6 characters ka ho');
        var resPass = await apiCall('/api/auth/update-password', 'POST', { newPassword: password });
        if (!resPass.success) throw new Error(resPass.message || 'Password update fail');
      }
      var response = await fetch(API + '/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name })
      });
      var resProfile = await response.json();
      if (resProfile.success) { showToast('Profile Updated! \uD83D\uDE80', 'ok'); setPassword(''); }
      else throw new Error(resProfile.message || 'Profile update fail');
    } catch (err) { showToast(err.message || 'Server error!', 'err'); }
    finally { setUpdating(false); }
  };

  var inp = { width:'100%', padding:'12px 14px', borderRadius:10, border:'1.5px solid #e8e0d4', background:'#fff8f0', color:'#1a1a1a', fontSize:15, outline:'none', boxSizing:'border-box', fontFamily:"'Poppins', sans-serif", marginBottom:14 };
  var lbl = { fontSize:11, color:'#e8650a', fontWeight:700, textTransform:'uppercase', letterSpacing:2, display:'block', marginBottom:6, fontFamily:"'Poppins', sans-serif" };

  return (
    <div style={{ background:'#f5f0e8', minHeight:'100vh', paddingBottom:80, fontFamily:"'Poppins', sans-serif" }}>
      <div style={{ background:'linear-gradient(135deg, #1a1a2e, #2d2d5e)', padding:'24px 20px', textAlign:'center', borderBottom:'1px solid rgba(232,101,10,0.1)' }}>
        <div style={{ width:72, height:72, background:'rgba(232,101,10,0.1)', border:'3px solid rgba(232,101,10,0.3)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', fontSize:32, color:'#e8650a' }}>
          {(user && user.name ? user.name : 'U').charAt(0).toUpperCase()}
        </div>
        <div style={{ color:'#fff', fontWeight:800, fontSize:18, fontFamily:"'Baloo 2', cursive" }}>{user && user.name ? user.name : 'User'}</div>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginTop:2 }}>{'\uD83D\uDCF1'} {user && user.mobile ? user.mobile : '\u2014'}</div>
      </div>

      <div style={{ background:'#fff', margin:'12px', borderRadius:14, padding:'16px', border:'1.5px solid #e8e0d4', boxShadow:'0 2px 10px rgba(0,0,0,0.08)' }}>
        <label style={lbl}>Mobile Number</label>
        <input value={user && user.mobile ? user.mobile : ''} disabled style={Object.assign({}, inp, { background:'#f5f0e8', color:'#999', cursor:'not-allowed', border:'1.5px solid #e8e0d4' })} />
        <label style={lbl}>Full Name</label>
        <input value={name} onChange={function(e) { setName(e.target.value); }} style={inp} />
        <label style={lbl}>New Password (Optional)</label>
        <input type="password" placeholder="Naya password (min 6 char)" value={password} onChange={function(e) { setPassword(e.target.value); }} style={Object.assign({}, inp, { marginBottom: 0 })} />
        <button onClick={handleUpdate} disabled={updating}
          style={{ width:'100%', marginTop:14, background:'linear-gradient(135deg, #e8650a, #f59420)', color:'#fff', border:'none', borderRadius:12, padding:14, fontSize:15, fontWeight:800, cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.6 : 1, letterSpacing:2, textTransform:'uppercase', boxShadow:'0 4px 14px rgba(232,101,10,0.35)', fontFamily:"'Poppins', sans-serif" }}>
          {updating ? '\u23F3 Saving...' : '\uD83D\uDCBE UPDATE PROFILE'}
        </button>
      </div>

      <div style={{ background:'#fff', margin:'0 12px', borderRadius:14, overflow:'hidden', border:'1.5px solid #e8e0d4', boxShadow:'0 2px 10px rgba(0,0,0,0.08)' }}>
        <div style={{ padding:'12px 16px', background:'#fff8f0', borderBottom:'1px solid #e8e0d4', fontSize:12, fontWeight:800, color:'#e8650a', textTransform:'uppercase', letterSpacing:1, fontFamily:"'Poppins', sans-serif" }}>{'\uD83C\uDFA7'} Help & Support</div>
        <div onClick={function() { window.open('https://wa.me/' + waNumber, '_blank'); }} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom:'1px solid #e8e0d4', cursor:'pointer' }}>
          <div style={{ width:40, height:40, background:'rgba(232,101,10,0.08)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{'\uD83D\uDCAC'}</div>
          <div style={{ flex:1 }}><div style={{ fontWeight:700, color:'#1a1a1a' }}>WhatsApp Support</div><div style={{ fontSize:11, color:'#888' }}>+91 9999999999</div></div>
          <div style={{ color:'#e8650a', fontSize:20 }}>{'\u203A'}</div>
        </div>
        <div onClick={function() { window.open('https://t.me/' + tgId, '_blank'); }} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', cursor:'pointer' }}>
          <div style={{ width:40, height:40, background:'rgba(232,101,10,0.08)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{'\u2708\uFE0F'}</div>
          <div style={{ flex:1 }}><div style={{ fontWeight:700, color:'#1a1a1a' }}>Telegram Support</div><div style={{ fontSize:11, color:'#888' }}>Quick reply in 5 mins</div></div>
          <div style={{ color:'#e8650a', fontSize:20 }}>{'\u203A'}</div>
        </div>
      </div>
    </div>
  );
}

function CategoryGamesScreen(props) {
  var category = props.category;
  var apiCategory = props.apiCategory;
  var onPlay = props.onPlay;

  var gamesState = useState([]);
  var games = gamesState[0];
  var setGames = gamesState[1];
  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  useEffect(function() {
    var fetchGames = async function() {
      try {
        var token = localStorage.getItem('mk_token');
        var fetchCat = apiCategory || category;
        var res = await fetch(API + '/api/games?category=' + fetchCat, { headers: { 'Authorization': 'Bearer ' + token } });
        var data = await res.json();
        if (data.success) setGames(Array.isArray(data.games) ? data.games : []);
      } catch (e) { } finally { setLoading(false); }
    };
    fetchGames();
  }, [category, apiCategory]);

  var formatResult = function(g) {
    if (g.open_result || g.close_result)
      return (g.open_result || '***') + '-' + (g.jodi_result || '--') + '-' + (g.close_result || '***');
    return '***_**_***';
  };

  var isRunning = function(g) { return g.status === 'open'; };

  return (
    <div style={{ background:'#f5f0e8', minHeight:'100vh', paddingBottom:80, fontFamily:"'Poppins', sans-serif" }}>
      <style>{'@import url("https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800;900&family=Poppins:wght@400;600;700;800;900&display=swap"); .cg-card { background: #fff; border-radius: 14px; margin: 0 14px 12px; overflow: visible; box-shadow: 0 2px 10px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; border: 1.5px solid #e8e0d4; padding: 14px 16px; } .cg-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); } .cg-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:4px; } .cg-card-name { font-family:"Baloo 2", cursive; font-size:18px; font-weight:900; color:#1a1a1a; letter-spacing:0.5px; text-transform:uppercase; line-height:1.2; } .cg-result { font-size:14px; font-weight:700; color:#e8650a; letter-spacing:2px; margin-bottom:6px; } .cg-status-running { display:inline-flex; align-items:center; gap:5px; font-size:13px; font-weight:700; color:#22c55e; margin-bottom:8px; } .cg-status-closed { display:inline-flex; align-items:center; gap:5px; font-size:13px; font-weight:700; color:#ef4444; margin-bottom:8px; } .cg-pulse-dot { width:8px; height:8px; border-radius:50%; background:#22c55e; animation:cgPulse 1.4s ease-in-out infinite; flex-shrink:0; } @keyframes cgPulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.65);} } .cg-bottom-row { display:flex; align-items:center; justify-content:space-between; margin-top:2px; } .cg-time-wrap { display:flex; align-items:center; gap:16px; } .cg-time-lbl { font-size:12px; color:#888; font-weight:600; margin-bottom:1px; } .cg-time-val { font-size:14px; font-weight:700; color:#e8650a; } .cg-divider-v { width:1px; height:32px; background:#e8e0d4; flex-shrink:0; } .cg-play-circle { width:48px; height:48px; border-radius:50%; border:none; background:linear-gradient(135deg, #e8650a, #f59420); color:#fff; font-size:17px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; box-shadow:0 3px 10px rgba(232,101,10,0.4); transition:transform 0.2s, box-shadow 0.2s; margin-top:-28px; } .cg-play-circle:hover { transform:scale(1.1); box-shadow:0 5px 18px rgba(232,101,10,0.5); } .cg-play-circle:active { transform:scale(0.95); } .cg-section-label { padding:4px 14px 8px; font-size:13px; font-weight:800; color:#1a1a1a; letter-spacing:2px; text-transform:uppercase; display:flex; align-items:center; gap:6px; font-family:"Poppins", sans-serif; } .cg-section-label::after { content:""; flex:1; height:1px; background:linear-gradient(90deg,rgba(232,101,10,0.3),transparent); } .cg-loader { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:14px; } .cg-loader-ring { width:44px; height:44px; border:4px solid rgba(232,101,10,0.15); border-top-color:#e8650a; border-radius:50%; animation:cgSpin 0.8s linear infinite; } @keyframes cgSpin { to { transform:rotate(360deg); } }'}</style>

      <div style={{ background:'linear-gradient(135deg, #1a1a2e, #2d2d5e)', padding:'16px', textAlign:'center', borderBottom:'1px solid rgba(232,101,10,0.1)', boxShadow:'0 2px 12px rgba(232,101,10,0.08)' }}>
        <div style={{ fontSize:32, marginBottom:4 }}>
          {category === 'starline' ? '\u2B50' : category === 'jackpot' ? '\uD83C\uDFB0' : '\uD83C\uDFAF'}
        </div>
        <div style={{ color:'#fff', fontSize:20, fontWeight:900, letterSpacing:2, textTransform:'uppercase', fontFamily:"'Baloo 2', cursive" }}>
          {category === 'starline' ? 'Matka Starline' : category === 'jackpot' ? 'KING JACKPOT' : 'DISAWAR'} GAMES
        </div>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:700, marginTop:2 }}>
          {games.filter(function(g) { return g.status === 'open'; }).length} Games Open
        </div>
      </div>

      <div className="cg-section-label" style={{ marginTop:12 }}>{'\uD83C\uDFAE'} Live Markets</div>

      {loading ? (
        <div className="cg-loader">
          <div className="cg-loader-ring" />
          <span style={{ color:'#e8650a', fontWeight:700, fontSize:14 }}>Loading Games...</span>
        </div>
      ) : games.length === 0 ? (
        <div style={{ textAlign:'center', color:'#888', padding:60 }}>
          <div style={{ fontSize:40, marginBottom:10 }}>{'\uD83D\uDEAB'}</div>Koi game available nahi hai.
        </div>
      ) : (
        games.map(function(g) {
          var open = isRunning(g);
          return (
            <div key={g.id} className="cg-card">
              <div className="cg-card-top">
                <div className="cg-card-name">{g.name}</div>
                <svg width="38" height="38" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink:0 }}>
                  <rect x="4" y="7" width="34" height="31" rx="4" stroke="#e8650a" strokeWidth="2.2" fill="rgba(232,101,10,0.06)"/>
                  <path d="M4 15H38" stroke="#e8650a" strokeWidth="2.2"/>
                  <path d="M14 4V10M28 4V10" stroke="#e8650a" strokeWidth="2.5" strokeLinecap="round"/>
                  <rect x="10" y="20" width="5" height="4" rx="1" fill="#e8650a"/>
                  <rect x="19" y="20" width="5" height="4" rx="1" fill="#e8650a"/>
                  <rect x="28" y="20" width="4" height="4" rx="1" fill="#e8650a"/>
                  <rect x="10" y="28" width="5" height="4" rx="1" fill="#e8650a"/>
                  <rect x="19" y="28" width="5" height="4" rx="1" fill="#e8650a"/>
                </svg>
              </div>

              <div className="cg-result">{formatResult(g)}</div>

              {open ? (
                <div className="cg-status-running"><span className="cg-pulse-dot"/>Betting is Running for today</div>
              ) : (
                <div className="cg-status-closed"><span style={{ width:8, height:8, borderRadius:'50%', background:'#ef4444', display:'inline-block', flexShrink:0 }}/>Market Closed</div>
              )}

              <div className="cg-bottom-row">
                <div className="cg-time-wrap">
                  <div>
                    <div className="cg-time-lbl">Time Open :</div>
                    <div className="cg-time-val">{g.open_time || '--:--'}</div>
                  </div>
                  <div className="cg-divider-v"/>
                  <div>
                    <div className="cg-time-lbl">Time Close :</div>
                    <div className="cg-time-val">{g.close_time || '--:--'}</div>
                  </div>
                </div>
                <button className="cg-play-circle"
                  onClick={function() { if (open) onPlay(g); }} disabled={!open}
                  style={!open ? { background:'#d1d5db', color:'#6b7280', cursor:'not-allowed', boxShadow:'none', marginTop:'-28px' } : {}}>
                  {open ? <span style={{ marginLeft:3 }}>{'\u25B6'}</span> : <span>{'\u25B7'}</span>}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function App() {
  var isAdmin = window.location.pathname === '/admin' || window.location.search.includes('admin=1');

  var langState = useState(function() { return localStorage.getItem('mk_language') || null; });
  var language = langState[0];
  var setLanguage = langState[1];

  var handleLanguageSelect = function(lang) {
    localStorage.setItem('mk_language', lang);
    setLanguage(lang);
  };

  var userState = useState(null);
  var user = userState[0];
  var setUser = userState[1];
  var authLoadState = useState(true);
  var authLoading = authLoadState[0];
  var setAuthLoading = authLoadState[1];
  var tabState = useState('home');
  var tab = tabState[0];
  var setTab = tabState[1];
  var walletState = useState(0);
  var wallet = walletState[0];
  var setWallet = walletState[1];
  var bidsState = useState(INIT_BIDS);
  var bids = bidsState[0];
  var setBids = bidsState[1];
  var txnsState = useState(INIT_TXNS);
  var txns = txnsState[0];
  var setTxns = txnsState[1];
  var modalState = useState(null);
  var modal = modalState[0];
  var setModal = modalState[1];
  var drawerState = useState(false);
  var drawer = drawerState[0];
  var setDrawer = drawerState[1];
  var toastState = useState(null);
  var toast = toastState[0];
  var setToast = toastState[1];
  var selGameState = useState(null);
  var selectedGame = selGameState[0];
  var setSelectedGame = selGameState[1];
  var selTypeState = useState(null);
  var selectedType = selTypeState[0];
  var setSelectedType = selTypeState[1];
  var pageState = useState('home');
  var page = pageState[0];
  var setPage = pageState[1];
  var adminState = useState(function() { return !!localStorage.getItem('mk_token') && localStorage.getItem('mk_admin_logged') === '1'; });
  var adminLoggedIn = adminState[0];
  var setAdminLoggedIn = adminState[1];
  var siteState = useState('SATTA KING');
  var siteName = siteState[0];
  var setSiteName = siteState[1];
  var noticeShowState = useState(false);
  var showNotices = noticeShowState[0];
  var setShowNotices = noticeShowState[1];
  var noticeDataState = useState([]);
  var noticesData = noticeDataState[0];
  var setNoticesData = noticeDataState[1];

  var walletRef = useRef(0);
  var bidSubmittingRef = useRef(false);

  var showToast = function(msg, type) {
    if (!type) type = 'ok';
    setToast({ msg: msg, type: type });
  };

  useEffect(function() {
    var token = localStorage.getItem('mk_token');
    if (!token) { setAuthLoading(false); return; }
    apiCall('/api/auth/profile')
      .then(function(res) {
        if (res && res.success && res.user) {
          setUser(function(prev) { return Object.assign({}, prev, res.user); });
        } else {
          localStorage.removeItem('mk_token');
        }
      })
      .catch(function() { localStorage.removeItem('mk_token'); })
      .finally(function() { setAuthLoading(false); });
  }, []);

  var fetchWallet = useCallback(function() {
    if (!localStorage.getItem('mk_token')) return Promise.resolve(null);
    return apiCall('/api/wallet/balance').then(function(d) {
      if (d && d.success) {
        var total = Number(d.wallet_balance || 0) + Number(d.winning_balance || 0);
        walletRef.current = total;
        setWallet(total);
        return { total: total };
      }
      return null;
    }).catch(function() { return null; });
  }, []);

  useEffect(function() { if (user) fetchWallet(); }, [user, fetchWallet]);

  useEffect(function() {
    apiCall('/api/admin/settings')
      .then(function(res) { if (res && res.success && res.settings && res.settings.site_name) setSiteName(res.settings.site_name); })
      .catch(function() {});
  }, [user]);

  useEffect(function() {
    if (!user) return;
    var interval = setInterval(fetchWallet, 30000);
    return function() { clearInterval(interval); };
  }, [user, fetchWallet]);

  var handleLogin = function(u) {
    setUser(u);
    setWallet(0);
    walletRef.current = 0;
    setTimeout(function() {
      apiCall('/api/auth/profile')
        .then(function(res) { if (res && res.success && res.user) setUser(function(prev) { return Object.assign({}, prev, res.user); }); })
        .catch(function() {});
    }, 500);
  };

  var handleAdd = function(amt) { fetchWallet(); showToast('Rs.' + amt.toLocaleString() + ' added!'); };
  var handleWith = function(amt) { fetchWallet(); showToast('Withdrawal Rs.' + amt.toLocaleString() + ' sent'); };

  var handleBidSubmit = async function(data) {
    if (bidSubmittingRef.current) { showToast('Bid processing ho rahi hai... ruko!', 'err'); return; }
    bidSubmittingRef.current = true;
    var amount = data.totalAmt || data.amount || 0;
    try {
      var fresh = await fetchWallet();
      var currentBalance = fresh ? fresh.total : walletRef.current;
      if (amount > currentBalance) {
        showToast('Insufficient balance! Available: Rs.' + currentBalance.toLocaleString(), 'err');
        bidSubmittingRef.current = false;
        return;
      }

      if (data.__bulk) {
        var result = await apiCall('/api/games/bid/bulk', 'POST', {
          game_id: selectedGame.id,
          game_type: selectedType.id,
          session: data.session,
          bids: data.numbers
        });
        if (result.success) {
          showToast(result.bids_placed + ' bids placed! Rs.' + result.total_amount + ' deducted.');
          await fetchWallet();
          var cat = selectedGame && selectedGame.game_category;
          var backPage = cat === 'starline' ? 'starline' : cat === 'jackpot' ? 'jackpot' : cat === 'disawar' ? 'disawar' : 'home';
          setPage(backPage); setSelectedGame(null); setSelectedType(null);
        } else {
          showToast(result.message || 'Bulk bid failed!', 'err');
          await fetchWallet();
        }
        bidSubmittingRef.current = false;
        return;
      }

      var res = await apiCall('/api/games/bid', 'POST', {
        game_id: selectedGame.id,
        game_type: selectedType.id,
        number: data.number,
        amount: data.amount,
        session: data.session || 'open'
      });
      if (!res.success) {
        showToast(res.message || 'Bid failed!', 'err');
        await fetchWallet();
        bidSubmittingRef.current = false;
        return;
      }
      await fetchWallet();
      showToast('Bid Rs.' + amount.toLocaleString() + ' placed!');
      var cat2 = selectedGame && selectedGame.game_category;
      var backPage2 = cat2 === 'starline' ? 'starline' : cat2 === 'jackpot' ? 'jackpot' : cat2 === 'disawar' ? 'disawar' : 'home';
      setPage(backPage2); setSelectedGame(null); setSelectedType(null);

    } catch (e) {
      await fetchWallet();
      showToast('Network error! Dobara try karo.', 'err');
    } finally {
      bidSubmittingRef.current = false;
    }
  };

  var navigate = function(id) {
    setPage(id);
    var validTabs = ['home','bids','disawar','jackpot','wallet','profile','game','txns','support','referral'];
    if (validTabs.indexOf(id) !== -1) setTab(id);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  var handleNav = function(id) {
    fetchWallet();
    if (id === 'add') setModal('add');
    else if (id === 'with') setModal('with');
    else { setPage(id); setSelectedGame(null); setSelectedType(null); setTab(id); }
  };

  var goBack = function() {
    var cat = selectedGame && selectedGame.game_category;
    if (page === 'bet-form') { setPage('game-types'); setSelectedType(null); }
    else if (page === 'game-types') {
      if (cat === 'starline') { setPage('starline'); setSelectedGame(null); }
      else if (cat === 'jackpot') { setPage('jackpot'); setSelectedGame(null); }
      else if (cat === 'disawar') { setPage('disawar'); setSelectedGame(null); }
      else { setPage('home'); setSelectedGame(null); setTab('game'); }
    } else { setPage('home'); setTab('game'); }
  };

  if (isAdmin) {
    if (!adminLoggedIn) return <AdminLogin onLogin={function() { localStorage.setItem('mk_admin_logged', '1'); setAdminLoggedIn(true); }} />;
    return <AdminPanel onLogout={function() { setAdminLoggedIn(false); }} />;
  }

  if (!language) return <LanguageScreen onSelect={handleLanguageSelect} />;

  if (authLoading) {
    return (
      <div style={{ height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#f5f0e8', color:'#e8650a', fontSize:18, fontWeight:700, fontFamily:"'Poppins', sans-serif" }}>
        Loading...
      </div>
    );
  }

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  var isTxnTab = page === 'txns';
  var isSubPage = ['game-types','bet-form','starline','disawar','jackpot'].indexOf(page) !== -1;
  var navTitle = page === 'game-types' ? (selectedGame && selectedGame.name) : page === 'bet-form' ? (selectedType && selectedType.label) : page === 'starline' ? 'Matka Starline' : page === 'jackpot' ? 'KING JACKPOT' : page === 'disawar' ? 'DISAWAR' : null;

  return (
    <React.Fragment>
      <style>{'@import url("https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800;900&family=Poppins:wght@400;600;700;800;900&display=swap"); .topnav { background: #e8650a !important; border-bottom: none !important; box-shadow: 0 3px 12px rgba(232,101,10,0.4) !important; } .brand { color: #fff !important; text-shadow: none !important; font-family: "Baloo 2", cursive !important; letter-spacing: 2px !important; } .back-btn { color: #fff !important; } .hamburger span { background: #fff !important; } .tn-wallet { background: rgba(255,255,255,0.2) !important; border: 1.5px solid rgba(255,255,255,0.4) !important; border-radius: 20px !important; } .tn-wallet span { color: #fff !important; } .tn-bell { background: rgba(255,255,255,0.2) !important; border: 1.5px solid rgba(255,255,255,0.3) !important; } .bell-dot { background: #ff1744 !important; } .botnav { background: #1a1a2e !important; border-top: 1px solid rgba(232,101,10,0.2) !important; box-shadow: 0 -4px 16px rgba(0,0,0,0.15) !important; } .bn-item svg { color: rgba(255,255,255,0.4); } .bn-item span:last-child { color: rgba(255,255,255,0.4) !important; font-size: 10px !important; font-weight: 600 !important; font-family: "Poppins", sans-serif !important; letter-spacing: 0 !important; } .bn-item.active svg { color: #e8650a !important; } .bn-item.active span:last-child { color: #e8650a !important; font-weight: 700 !important; } .bn-item:hover { background: rgba(232,101,10,0.08) !important; } .bn-item:hover svg { color: #e8650a !important; } .home-circle { background: linear-gradient(135deg, #e8650a, #f59420) !important; box-shadow: 0 4px 16px rgba(232,101,10,0.4) !important; border: 3px solid #1a1a2e !important; } .notif-modal-header { background: #1a1a2e !important; } input::placeholder { color: #999 !important; } option { background: #fff; color: #1a1a1a; }'}</style>

      <div className="topnav">
        <div className="tn-left">
          {isSubPage
            ? <div className="back-btn" onClick={goBack} style={{ color:'#fff', fontSize:26, cursor:'pointer', padding:'4px 8px 4px 0' }}>{'\u2039'}</div>
            : <div className="hamburger" onClick={function() { setDrawer(true); }}><span/><span/><span/></div>
          }
          <span className="brand">{isSubPage ? (navTitle || 'BACK') : siteName}</span>
        </div>
        <div className="tn-right">
          {!isTxnTab && (
            <div className="tn-wallet" onClick={function() { fetchWallet(); setPage('wallet'); setTab('wallet'); }}>
              <span>{'\uD83D\uDCBC'}</span>
              <span>Rs.{wallet.toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 })}</span>
            </div>
          )}
          <div className="tn-bell" style={{ cursor:'pointer' }} onClick={function() {
            apiCall('/api/notices').then(function(res) {
              if (res && res.success) setNoticesData(res.notices || []);
              setShowNotices(true);
            }).catch(function() { setShowNotices(true); });
          }}>
            {'\uD83D\uDD14'}<div className="bell-dot"/>
          </div>
        </div>
      </div>

      {page === 'home' && <HomeScreen wallet={wallet} onAdd={function() { setModal('add'); }} onWith={function() { setModal('with'); }} onPlay={function(g) { setSelectedGame(g); setPage('game-types'); setTab('game'); window.scrollTo(0, 0); document.documentElement.scrollTop = 0; }} navigate={navigate} apiCall={apiCall} />}
      {page === 'profile' && <ProfileScreen user={user} showToast={showToast} />}
      {page === 'game-types' && <GameTypePage game={selectedGame} onSelect={function(gt) { setSelectedType(gt); setPage('bet-form'); }} />}
      {page === 'bet-form' && <BetForm game={selectedGame} gameType={selectedType} wallet={wallet} onSubmit={handleBidSubmit} />}
      {page === 'starline' && <CategoryGamesScreen category="starline" onPlay={function(g) { setSelectedGame(g); setPage('game-types'); }} />}
      {page === 'jackpot' && <CategoryGamesScreen category="jackpot" apiCategory="disawar" onPlay={function(g) { setSelectedGame(g); setPage('game-types'); }} />}
      {page === 'disawar' && <CategoryGamesScreen category="disawar" onPlay={function(g) { setSelectedGame(g); setPage('game-types'); }} />}
      {page === 'bids' && <BidsPage apiCall={apiCall}/>}
      {page === 'txns' && <TxnsPage apiCall={apiCall} navigate={navigate}/>}
      {page === 'wallet' && <WalletPage wallet={wallet} onAdd={null} onWith={function() { setModal('with'); }} user={user} navigate={navigate} apiCall={apiCall}/>}
      {page === 'support' && <SupportPage apiCall={apiCall} user={user} />}
      {page === 'htp' && <HowToPlayPage onBack={function() { setPage('home'); }} />}
      {page === 'faq' && <FAQPage onBack={function() { setPage('home'); }} />}
      {page === 'terms' && <TermsPage onBack={function() { setPage('home'); }} />}
      {page === 'privacy' && <PrivacyPage onBack={function() { setPage('home'); }} />}
      {page === 'gamerates' && <GameRatesPage onBack={function() { setPage('home'); }} />}
      {page === 'referral' && <ReferralPage apiCall={apiCall} user={user} onBack={function() { setPage('wallet'); }} />}

      {!isSubPage && (
        <div className="botnav">
          <div className={'bn-item' + (tab === 'txns' ? ' active' : '')} onClick={function() { navigate('txns'); }}>
            <IconTransaction color={tab === 'txns' ? '#e8650a' : 'rgba(232,101,10,0.4)'} />
            <span>Transaction</span>
          </div>
          <div className={'bn-item' + (tab === 'bids' ? ' active' : '')} onClick={function() { navigate('bids'); }}>
            <IconBids color={tab === 'bids' ? '#e8650a' : 'rgba(232,101,10,0.4)'} />
            <span>My Bids</span>
          </div>
          <div className="bn-center" onClick={function() { setPage('home'); setTab('home'); setSelectedGame(null); setSelectedType(null); }}>
            <div className="home-circle"><IconHome size={26} color="#fff" /></div>
            <span style={{ color: tab === 'home' ? '#e8650a' : 'rgba(255,255,255,0.4)', fontSize:10, fontWeight: tab === 'home' ? 700 : 600, marginTop:2, fontFamily:"'Poppins', sans-serif" }}>Home</span>
          </div>
          <div className={'bn-item' + (tab === 'wallet' ? ' active' : '')} onClick={function() { navigate('wallet'); }}>
            <IconWallet color={tab === 'wallet' ? '#e8650a' : 'rgba(232,101,10,0.4)'} />
            <span>Funds</span>
          </div>
          <div className={'bn-item' + (tab === 'support' ? ' active' : '')} onClick={function() { setPage('support'); setTab('support'); }}>
            <IconSupport color={tab === 'support' ? '#e8650a' : 'rgba(232,101,10,0.4)'} />
            <span>Support</span>
          </div>
        </div>
      )}

      {drawer && (
        <BlueDrawer user={user} wallet={wallet} onClose={function() { setDrawer(false); }} onNav={handleNav}
          onLogout={function() { localStorage.removeItem('mk_token'); setUser(null); setWallet(0); walletRef.current = 0; setDrawer(false); }}
        />
      )}

      {modal === 'add' && <DepositModal apiCall={apiCall} onClose={function() { setModal(null); fetchWallet(); }} onSuccess={function() { fetchWallet(); }} />}
      {modal === 'with' && <WithdrawModal wallet={wallet} onClose={function() { setModal(null); }} onSuccess={handleWith}/>}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={function() { setToast(null); }}/>}

      {showNotices && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={function() { setShowNotices(false); }}>
          <div style={{ background:'#fff', width:'90%', maxWidth:350, borderRadius:14, overflow:'hidden', boxShadow:'0 0 30px rgba(0,0,0,0.15)', border:'1.5px solid #e8e0d4' }}
            onClick={function(e) { e.stopPropagation(); }}>
            <div className="notif-modal-header" style={{ color:'#fff', padding:'14px 16px', fontWeight:700, display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:"'Poppins', sans-serif" }}>
              <span style={{ fontSize:16 }}>{'\uD83D\uDD14'} Notifications</span>
              <span onClick={function() { setShowNotices(false); }} style={{ cursor:'pointer', fontSize:20, color:'#e8650a' }}>{'\u2715'}</span>
            </div>
            <div style={{ padding:16, maxHeight:'60vh', overflowY:'auto' }}>
              {noticesData.length === 0 ? (
                <div style={{ color:'#888', textAlign:'center', padding:'30px 20px', fontSize:14, fontFamily:"'Poppins', sans-serif" }}>Abhi koi naya notification nahi hai.</div>
              ) : (
                noticesData.map(function(n, i) {
                  return (
                    <div key={n.id || i} style={{ background:'#fff8f0', padding:12, borderRadius:8, marginBottom:10, color:'#1a1a1a', fontSize:13, borderLeft:'4px solid #e8650a', lineHeight:1.5, fontFamily:"'Poppins', sans-serif" }}>
                      {n.message}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}