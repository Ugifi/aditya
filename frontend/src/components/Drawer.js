import React from 'react';

export default function Drawer({ user, onClose, onNav, onLogout, apiCall }) {
  const [whatsappNumber, setWhatsappNumber] = React.useState("919999999999");
  const [telegramId, setTelegramId] = React.useState("matkaking_support");

  React.useEffect(() => {
    if (!apiCall) return;
    apiCall('/api/admin/settings').then(res => {
      if (res?.success && res?.settings) {
        const s = res.settings;
        if (s.phone || s.whatsapp_support) {
          const num = (s.phone || s.whatsapp_support).replace(/\D/g, '');
          setWhatsappNumber(num.startsWith('91') ? num : `91${num}`);
        }
        if (s.telegram) setTelegramId(s.telegram);
      }
    }).catch(() => {});
  }, [apiCall]);

  const API_URL = 'https://sattamatka-deepak-hy1n.onrender.com';
  const defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky&backgroundColor=ffcc00";

  const getAvatarUrl = () => {
    if (!user?.profile_pic) return defaultAvatar;
    if (user.profile_pic.startsWith('http')) return user.profile_pic;
    return `${API_URL}${user.profile_pic}`;
  };

  const SectionLabel = ({ text }) => (
    <div style={{ color: '#e8650a', fontSize: 11, fontWeight: 800, padding: '15px 15px 5px 15px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
      {text}
    </div>
  );

  const DrawerItem = ({ icon, label, onClick, iconBg = '#fff8f0', iconBorder = '#f5c99a', txtColor = '#1a1a1a' }) => (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', padding: '12px 15px', borderBottom: '1px solid #f0ebe0', cursor: 'pointer', transition: 'background 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#fff8f0'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, border: `1.5px solid ${iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14, fontSize: 17, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ fontSize: 14, color: txtColor, fontWeight: 700, flex: 1 }}>{label}</div>
      <div style={{ color: '#e8650a', fontSize: 16, fontWeight: 900 }}>›</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800;900&family=Poppins:wght@400;600;700;800;900&display=swap');
        @keyframes slideOutAnim {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .drawer-item:hover { background: #fff8f0 !important; }
      `}</style>

      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 1000 }} />

      {/* Drawer Panel */}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: '#f5f0e8', zIndex: 1001, overflowY: 'auto', borderRight: '1.5px solid #e8e0d4', fontFamily: "'Poppins', sans-serif" }}>

        {/* USER HEADER */}
        <div style={{ padding: '20px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #e8e0d4', background: '#1a1a2e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={getAvatarUrl()}
              onError={e => { e.target.onerror = null; e.target.src = defaultAvatar; }}
              alt="Avatar"
              style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #e8650a', boxShadow: '0 0 12px rgba(232,101,10,0.3)', background: '#fff8f0' }}
            />
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '0.5px', fontFamily: "'Baloo 2', cursive" }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>+91 {user?.mobile || '—'}</div>
            </div>
          </div>
          <div onClick={onClose} style={{ fontSize: 22, color: '#e8650a', cursor: 'pointer', padding: '0 5px', fontWeight: 900 }}>✕</div>
        </div>

        {/* QUICK BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 10px', borderBottom: '1.5px solid #e8e0d4', background: '#fff' }}>
          {[
            { icon: '💰', label: 'Add Fund',  nav: 'add',    bg: 'rgba(22,163,74,0.1)',   border: 'rgba(22,163,74,0.3)'  },
            { icon: '💸', label: 'Withdraw',  nav: 'with',   bg: 'rgba(220,38,38,0.1)',   border: 'rgba(220,38,38,0.3)'  },
            { icon: '🎯', label: 'My Bids',   nav: 'bids',   bg: '#fff8f0',               border: '#f5c99a'              },
          ].map((btn, i) => (
            <div key={i} onClick={() => { onNav(btn.nav); onClose(); }} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ background: btn.bg, border: `1.5px solid ${btn.border}`, width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: 20 }}>{btn.icon}</div>
              <div style={{ fontSize: 11, color: '#e8650a', fontWeight: 800 }}>{btn.label}</div>
            </div>
          ))}
        </div>

        {/* ACCOUNT */}
        <SectionLabel text="Account" />
        <DrawerItem icon="💼" label="My Wallet"            onClick={() => { onNav('wallet');  onClose(); }} />
        <DrawerItem icon="📄" label="Transaction History"  onClick={() => { onNav('txns');    onClose(); }} />
        <DrawerItem icon="✏️" label="Edit Profile"         onClick={() => { onNav('profile'); onClose(); }} />

        {/* GAMES */}
        <SectionLabel text="Games" />
        <DrawerItem icon="🎮" label="All Games"   onClick={() => { onNav('home'); onClose(); }} />
        <DrawerItem icon="🏆" label="Win History" onClick={() => { onNav('bids'); onClose(); }} />

        {/* HELP & SUPPORT */}
        <SectionLabel text="Help & Support" />
        <DrawerItem icon="💬" label="WhatsApp Support"
          iconBg="rgba(37,211,102,0.1)" iconBorder="rgba(37,211,102,0.35)"
          onClick={() => { window.open(`https://wa.me/${whatsappNumber}`, '_blank'); onClose(); }}
        />
        <DrawerItem icon="✈️" label="Telegram Support"
          iconBg="rgba(0,136,204,0.1)" iconBorder="rgba(0,136,204,0.35)"
          onClick={() => { window.open(`https://t.me/${telegramId}`, '_blank'); onClose(); }}
        />

        {/* MORE */}
        <SectionLabel text="More" />
        <DrawerItem icon="📖" label="How to Play"        onClick={() => { onNav('htp');     onClose(); }} />
        <DrawerItem icon="❓" label="FAQ"                onClick={() => { onNav('faq');     onClose(); }} />
        <DrawerItem icon="📜" label="Terms & Conditions" onClick={() => { onNav('terms');   onClose(); }} />
        <DrawerItem icon="🔒" label="Privacy Policy"     onClick={() => { onNav('privacy'); onClose(); }} />

        {/* LOGOUT */}
        <div style={{ padding: '20px 15px', paddingBottom: '40px' }}>
          <div onClick={() => { onLogout(); onClose(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '13px', background: 'rgba(220,38,38,0.06)', border: '1.5px solid rgba(220,38,38,0.25)', borderRadius: '12px', cursor: 'pointer' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginRight: 10, animation: 'slideOutAnim 1.5s infinite ease-in-out' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span style={{ color: '#dc2626', fontWeight: 900, fontSize: 15, letterSpacing: '1px' }}>LOGOUT</span>
          </div>
        </div>

      </div>
    </>
  );
}