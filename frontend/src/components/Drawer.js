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

  const API_URL = 'https://aditya-nh9i.onrender.com';
  const defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky&backgroundColor=ffcc00";

  const getAvatarUrl = () => {
    if (!user?.profile_pic) return defaultAvatar;
    if (user.profile_pic.startsWith('http')) return user.profile_pic;
    return `${API_URL}${user.profile_pic}`;
  };

  const SectionLabel = ({ text }) => (
    <div style={{
      color: '#FF6B00',
      fontSize: 11,
      fontWeight: 800,
      padding: '15px 15px 5px 15px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      borderLeft: '3px solid #FF6B00',
      marginLeft: 10,
      marginTop: 5
    }}>
      {text}
    </div>
  );

  const DrawerItem = ({ icon, label, onClick, iconBg = 'rgba(255,107,0,0.1)', iconBorder = 'rgba(255,107,0,0.3)', txtColor = '#1A0A00' }) => (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 15px',
        borderBottom: '1px solid rgba(255,107,0,0.1)',
        cursor: 'pointer',
        background: '#FFF5E6',
        transition: 'background 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#FFE8CC'}
      onMouseLeave={e => e.currentTarget.style.background = '#FFF5E6'}
    >
      <div style={{
        width: 34,
        height: 34,
        borderRadius: '10px',
        background: iconBg,
        border: `1px solid ${iconBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        fontSize: 16
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 14, color: txtColor, fontWeight: 600, flex: 1 }}>{label}</div>
      <div style={{ color: '#FF6B00', fontSize: 14, fontWeight: 800 }}>›</div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes slideOutAnim {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .drawer-scroll::-webkit-scrollbar { width: 0px; }
      `}</style>

      {/* Dark Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 1000
        }}
      />

      {/* Side Panel */}
      <div
        className="drawer-scroll"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: '285px',
          background: '#FFF5E6',
          zIndex: 1001,
          overflowY: 'auto',
          borderRight: '2px solid rgba(255,107,0,0.2)',
          color: '#1A0A00'
        }}
      >

        {/* ─── USER HEADER ─── */}
        <div style={{
          padding: '20px 15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid rgba(255,107,0,0.2)',
          background: 'linear-gradient(135deg, #FF6B00, #e55a00)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={getAvatarUrl()}
              onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
              alt="Avatar"
              style={{
                width: 50, height: 50,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #fff',
                boxShadow: '0 0 12px rgba(0,0,0,0.25)',
                background: '#ff8c3a'
              }}
            />
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '0.5px' }}>
                {user?.name || 'Vikas Verma'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                +91 {user?.mobile || '6375334550'}
              </div>
            </div>
          </div>
          <div
            onClick={onClose}
            style={{ fontSize: 22, color: '#fff', cursor: 'pointer', padding: '0 5px', fontWeight: 700 }}
          >✕</div>
        </div>

        {/* ─── QUICK BUTTONS ─── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '15px 10px',
          borderBottom: '1px solid rgba(255,107,0,0.15)',
          background: '#1A0A00'
        }}>
          <div onClick={() => { onNav('add'); onClose(); }} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
            <div style={{
              background: 'rgba(255,107,0,0.15)',
              border: '1px solid rgba(255,107,0,0.4)',
              width: 44, height: 44, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 6px', fontSize: 20
            }}>💰</div>
            <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 800 }}>Add Fund</div>
          </div>

          <div onClick={() => { onNav('with'); onClose(); }} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
            <div style={{
              background: 'rgba(255,23,68,0.12)',
              border: '1px solid rgba(255,23,68,0.35)',
              width: 44, height: 44, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 6px', fontSize: 20
            }}>💸</div>
            <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 800 }}>Withdraw</div>
          </div>

          <div onClick={() => { onNav('bids'); onClose(); }} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
            <div style={{
              background: 'rgba(255,107,0,0.12)',
              border: '1px solid rgba(255,107,0,0.35)',
              width: 44, height: 44, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 6px', fontSize: 20
            }}>🎯</div>
            <div style={{ fontSize: 11, color: '#FF6B00', fontWeight: 800 }}>My Bids</div>
          </div>
        </div>

        {/* ─── ACCOUNT ─── */}
        <SectionLabel text="Account" />
        <DrawerItem icon="💼" label="My Wallet" onClick={() => { onNav('wallet'); onClose(); }} />
        <DrawerItem icon="📄" label="Transaction History" onClick={() => { onNav('txns'); onClose(); }} />
        <DrawerItem icon="✏️" label="Edit Profile" onClick={() => { onNav('profile'); onClose(); }} />

        {/* ─── GAMES ─── */}
        <SectionLabel text="Games" />
        <DrawerItem icon="🎮" label="All Games" onClick={() => { onNav('home'); onClose(); }} />
        <DrawerItem icon="🏆" label="Win History" onClick={() => { onNav('bids'); onClose(); }} />

        {/* ─── HELP & SUPPORT ─── */}
        <SectionLabel text="Help & Support" />
        <DrawerItem
          icon="💬" label="WhatsApp Support"
          iconBg="rgba(37,211,102,0.12)" iconBorder="rgba(37,211,102,0.35)"
          onClick={() => { window.open(`https://wa.me/${whatsappNumber}`, '_blank'); onClose(); }}
        />
        <DrawerItem
          icon="✈️" label="Telegram Support"
          iconBg="rgba(0,136,204,0.12)" iconBorder="rgba(0,136,204,0.35)"
          onClick={() => { window.open(`https://t.me/${telegramId}`, '_blank'); onClose(); }}
        />

        {/* ─── MORE ─── */}
        <SectionLabel text="More" />
        <DrawerItem icon="📖" label="How to Play" onClick={() => { onNav('htp'); onClose(); }} />
        <DrawerItem icon="❓" label="FAQ" onClick={() => { onNav('faq'); onClose(); }} />
        <DrawerItem icon="📜" label="Terms & Conditions" onClick={() => { onNav('terms'); onClose(); }} />
        <DrawerItem icon="🔒" label="Privacy Policy" onClick={() => { onNav('privacy'); onClose(); }} />

        {/* ─── LOGOUT ─── */}
        <div style={{ padding: '20px 15px', paddingBottom: '40px', background: '#FFF5E6' }}>
          <div
            onClick={() => { onLogout(); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px',
              background: 'rgba(255,23,68,0.08)',
              border: '1.5px solid rgba(255,23,68,0.3)',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            <svg
              width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff1744"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginRight: 10, animation: 'slideOutAnim 1.5s infinite ease-in-out' }}
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span style={{ color: '#ff1744', fontWeight: 800, fontSize: 16, letterSpacing: '1px' }}>LOGOUT</span>
          </div>
        </div>

      </div>
    </>
  );
}