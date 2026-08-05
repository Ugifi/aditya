
// ══════════════════════════════════════════════════════════════
//  ADMIN PANEL — HomeScreen Match Theme
// ══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';

const API = 'https://aditya-nh9i.onrender.com';


function toIST(dateStr) {
  if (!dateStr) return '';
  try {
    let str = String(dateStr);
    if (!str.includes('T') && str.includes(' ')) {
      str = str.replace(' ', 'T') + 'Z';
    } else if (str.includes('T') && !str.includes('+') && !str.endsWith('Z')) {
      str = str + 'Z';
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  } catch (e) { return ''; }
}
function toISTlocal(dateStr) {
  if (!dateStr) return '';
  try {
    let str = String(dateStr);
    if (!str.includes('T') && str.includes(' ')) {
      str = str.replace(' ', 'T') + '+05:30';
    } else if (str.includes('T') && !str.includes('+') && !str.endsWith('Z')) {
      str = str + '+05:30';
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  } catch (e) { return ''; }
}

async function apiCall(path, method = 'GET', body = null, retries = 2) {
  const token = localStorage.getItem('mk_token');
  const url = method === 'GET'
    ? `${API}${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`
    : `${API}${path}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`API attempt ${attempt + 1} failed:`, err.message);
      if (attempt === retries) return { success: false, message: 'Server se connect nahi ho pa raha. Thodi der mein retry karo.' };
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// ── THEME TOKENS (HomeScreen Match) ───────────────────────────
const C = {
  navBg: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 100%)',
  drawerBg: '#1a1a2e',
  drawerItem: '#2a2a4a',
  drawerAct: '#e8650a',
  primary: '#e8650a',
  primaryHov: '#f59420',
  accent: '#f59420',
  accentSoft: 'rgba(232,101,10,0.08)',
  pageBg: '#f5f0e8',
  card: '#fff',
  cardBorder: '#e8e0d4',
  cardShadow: '0 2px 10px rgba(0,0,0,0.08)',
  textMain: '#1a1a1a',
  textSub: '#e8650a',
  textMuted: '#888',
  success: '#22c55e',
  successBg: 'rgba(34,197,94,0.1)',
  danger: '#ef4444',
  dangerBg: 'rgba(239,68,68,0.1)',
  warn: '#f59420',
  warnBg: 'rgba(245,148,32,0.1)',
  inputBg: '#fff8f0',
  inputBdr: '#e8e0d4',
  inputFocus: '#e8650a',
  badgePend: 'rgba(232,101,10,0.1)',
  badgePendT: '#e8650a',
};

const B = {
  card: {
    background: C.card,
    borderRadius: 14,
    border: '1.5px solid ' + C.cardBorder,
    boxShadow: C.cardShadow,
    padding: 18,
    marginBottom: 14,
  },
  input: {
    width: '100%',
    background: C.inputBg,
    border: '2px solid ' + C.inputBdr,
    borderRadius: 10,
    padding: '12px 14px',
    color: '#1a1a1a',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: 12,
    fontWeight: 600,
    fontFamily: "'Poppins', sans-serif",
  },
  btn: {
    width: '100%',
    background: 'linear-gradient(135deg, #e8650a, #f59420)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '14px',
    fontSize: 14,
    fontWeight: 800,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: 1,
    boxShadow: '0 4px 14px rgba(232,101,10,0.35)',
    fontFamily: "'Poppins', sans-serif",
  },
  label: {
    fontSize: 11,
    color: '#e8650a',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: 1,
    display: 'block',
    marginBottom: 6,
    marginLeft: 2,
    fontFamily: "'Poppins', sans-serif",
  },
  title: {
    fontSize: 16,
    fontWeight: 800,
    color: '#e8650a',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: "'Baloo 2', cursive",
  },
};

// ── TIME PICKER WITH AM/PM ─────────────────────────────────────
function TimePicker({ value, onChange, placeholder }) {
  const parseTime = (val) => {
    if (!val) return { hh: '', mm: '', ampm: 'AM' };
    const [h, m] = val.split(':');
    const hour = parseInt(h, 10);
    if (isNaN(hour)) return { hh: '', mm: m || '', ampm: 'AM' };
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hh = hour === 0 ? '12' : hour > 12 ? String(hour - 12).padStart(2, '0') : String(hour).padStart(2, '0');
    return { hh, mm: m || '00', ampm };
  };

  const { hh, mm, ampm } = parseTime(value);

  const emit = (newHH, newMM, newAMPM) => {
    let h = parseInt(newHH, 10);
    if (isNaN(h)) { onChange(''); return; }
    if (newAMPM === 'AM') { if (h === 12) h = 0; }
    else { if (h !== 12) h += 12; }
    onChange(`${String(h).padStart(2, '0')}:${newMM || '00'}`);
  };

  const selStyle = {
    background: C.inputBg,
    border: '2px solid ' + C.inputBdr,
    borderRadius: 10,
    padding: '11px 8px',
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: 700,
    outline: 'none',
    cursor: 'pointer',
    flex: 1,
  };

  const hours = ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
  const mins = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
      <select value={hh} onChange={e => emit(e.target.value, mm, ampm)} style={selStyle}>
        <option value="">HH</option>
        {hours.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <select value={mm} onChange={e => emit(hh, e.target.value, ampm)} style={selStyle}>
        {mins.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select value={ampm} onChange={e => emit(hh, mm, e.target.value)} style={{ ...selStyle, flex: '0 0 70px', fontWeight: 900, color: ampm === 'AM' ? '#22c55e' : '#ef4444' }}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

function displayTime(val) {
  if (!val) return '--';
  const [h, m] = val.split(':');
  const hour = parseInt(h, 10);
  if (isNaN(hour)) return val;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hh = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hh}:${m || '00'} ${ampm}`;
}

// ── STATUS BADGE ───────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    approved: { bg: C.successBg, color: C.success, label: 'Approved' },
    rejected: { bg: C.dangerBg, color: C.danger, label: 'Rejected' },
    pending: { bg: C.badgePend, color: C.badgePendT, label: 'Pending' },
    win: { bg: C.successBg, color: C.success, label: 'Won' },
    loss: { bg: C.dangerBg, color: C.danger, label: 'Lost' },
    open: { bg: C.successBg, color: C.success, label: 'Open' },
    closed: { bg: C.dangerBg, color: C.danger, label: 'Closed' },
  };
  const s = map[status] || { bg: 'rgba(0,0,0,0.05)', color: '#888', label: status };
  return (
    <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', background: s.bg, color: s.color, letterSpacing: 0.5, border: '1px solid ' + s.color + '33' }}>
      {s.label}
    </span>
  );
}

function ActionBtn({ onClick, color, bg, children }) {
  return (
    <button onClick={onClick} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid ' + color + '33', cursor: 'pointer', fontWeight: 800, fontSize: 12, background: bg, color: color, transition: 'all 0.2s', fontFamily: "'Poppins', sans-serif" }}>
      {children}
    </button>
  );
}

// ── EDIT GAME MODAL ────────────────────────────────────────────
function EditGameModal({ game, onClose, onSave }) {
  const [form, setForm] = useState({
    name: game.name || '',
    open_time: game.open_time || '',
    close_time: game.close_time || '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name || !form.open_time || !form.close_time) { alert('Saari fields bhariye!'); return; }
    setSaving(true);
    const res = await apiCall(`/api/admin/games/${game.id}`, 'PUT', form);
    setSaving(false);
    if (res.success) { onSave({ ...game, ...form }); onClose(); }
    else alert('Error: ' + (res.message || 'Update failed'));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 24, width: '100%', maxWidth: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', border: '1.5px solid #e8e0d4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#e8650a', fontFamily: "'Baloo 2', cursive" }}>✏️ Edit Game</div>
          <button onClick={onClose} style={{ background: C.dangerBg, border: '1px solid ' + C.danger + '44', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: C.danger, fontSize: 16, fontWeight: 900 }}>✕</button>
        </div>
        <label style={B.label}>Game Name</label>
        <input style={B.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Kalyan" />
        <label style={B.label}>Open Time</label>
        <TimePicker value={form.open_time} onChange={v => setForm(f => ({ ...f, open_time: v }))} />
        <label style={B.label}>Close Time</label>
        <TimePicker value={form.close_time} onChange={v => setForm(f => ({ ...f, close_time: v }))} />
        <button onClick={save} disabled={saving} style={{ ...B.btn, marginTop: 8 }}>
          {saving ? '⏳ SAVING...' : '💾 SAVE CHANGES'}
        </button>
      </div>
    </div>
  );
}

// ── CHANGE MOBILE MODAL ────────────────────────────────────────
function ChangeMobileModal({ user, onClose, onSave }) {
  const [mobile, setMobile] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!mobile || mobile.length !== 10) { alert('Valid 10-digit mobile number daalo!'); return; }
    setSaving(true);
    const res = await apiCall(`/api/admin/users/${user.id}/change-mobile`, 'PUT', { mobile });
    setSaving(false);
    if (res.success) { onSave(mobile); onClose(); }
    else alert('Error: ' + (res.message || 'Update failed'));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 24, width: '100%', maxWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', border: '1.5px solid #e8e0d4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#e8650a', fontFamily: "'Baloo 2', cursive" }}>📱 Change Mobile</div>
          <button onClick={onClose} style={{ background: C.dangerBg, border: '1px solid ' + C.danger + '44', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: C.danger, fontSize: 16, fontWeight: 900 }}>✕</button>
        </div>

        <div style={{ background: '#fff8f0', border: '1.5px solid ' + C.inputBdr, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#666', fontWeight: 700, lineHeight: 1.8 }}>
          👤 <strong style={{ color: '#1a1a1a' }}>{user.name}</strong><br />
          <span style={{ color: '#888', fontSize: 12 }}>Current Number: </span>
          <strong style={{ color: '#e8650a' }}>{user.mobile}</strong>
        </div>

        <label style={B.label}>New Mobile Number</label>
        <input
          style={B.input}
          type="tel"
          placeholder="10-digit mobile number"
          maxLength={10}
          value={mobile}
          onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && save()}
        />

        {mobile.length > 0 && mobile.length < 10 && (
          <div style={{ color: C.warn, fontSize: 12, fontWeight: 700, marginTop: -8, marginBottom: 10 }}>
            ⚠️ {10 - mobile.length} digit aur chahiye
          </div>
        )}

        {mobile.length === 10 && (
          <div style={{ color: C.success, fontSize: 12, fontWeight: 700, marginTop: -8, marginBottom: 10 }}>
            ✅ Number valid hai
          </div>
        )}

        <button
          onClick={save}
          disabled={saving || mobile.length !== 10}
          style={{ ...B.btn, marginTop: 8, opacity: (saving || mobile.length !== 10) ? 0.55 : 1 }}
        >
          {saving ? '⏳ UPDATING...' : '💾 UPDATE MOBILE'}
        </button>
      </div>
    </div>
  );
}

// ─── USER CARD ────────────────────────────────────────────────
function UserCard({ u, onBlock, onAddCoins, onDeductCoins, onChangeMobile, onLoginAs }) {
  return (
    <div style={B.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a1a', fontFamily: "'Poppins', sans-serif" }}>{u.name}</div>
          <div style={{ fontSize: 13, color: '#e8650a', marginTop: 2, fontWeight: 600 }}>{u.mobile}</div>
        </div>
        <StatusBadge status={u.is_blocked ? 'rejected' : 'approved'} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'WALLET', val: '₹' + Number(u.wallet_balance || 0).toLocaleString(), color: '#e8650a' },
          { label: 'WINNING', val: '₹' + Number(u.winning_balance || 0).toLocaleString(), color: C.success },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: '#fff8f0', borderRadius: 10, padding: '10px 12px', border: '1px solid ' + C.cardBorder }}>
            <div style={{ fontSize: 10, color: '#888', fontWeight: 800, marginBottom: 4 }}>{label}</div>
            <div style={{ fontWeight: 900, fontSize: 15, color: color }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <ActionBtn onClick={() => onBlock(u.id, u.is_blocked)} color={u.is_blocked ? C.success : C.warn} bg={u.is_blocked ? C.successBg : C.warnBg}>
          {u.is_blocked ? '✅ Unblock' : '🚫 Block'}
        </ActionBtn>
        <ActionBtn onClick={() => onAddCoins(u.id)} color={C.success} bg={C.successBg}>+ Coins</ActionBtn>
        <ActionBtn onClick={() => onDeductCoins(u.id)} color={C.danger} bg={C.dangerBg}>- Coins</ActionBtn>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <ActionBtn onClick={() => onChangeMobile(u)} color="#e8650a" bg={C.badgePend}>
          📱 Change Mobile
        </ActionBtn>
        <ActionBtn onClick={() => onLoginAs(u.id)} color="#f59420" bg={C.accentSoft}>
          🧑‍💻 Login
        </ActionBtn>
      </div>
    </div>
  );
}

// ─── DEPOSIT CARD ─────────────────────────────────────────────
function DepositCard({ d, onApprove, onReject }) {
  const [utrCopied, setUtrCopied] = React.useState(false);
  const utrValue = d.utr_number || d.utr || d.transaction_id || '';

  const copyUtr = () => {
    if (!utrValue) return;
    navigator.clipboard.writeText(utrValue).then(() => {
      setUtrCopied(true);
      setTimeout(() => setUtrCopied(false), 2000);
    });
  };

  return (
    <div style={B.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a1a', fontFamily: "'Poppins', sans-serif" }}>{d.name}</div>
          <div style={{ fontSize: 13, color: '#e8650a', fontWeight: 600 }}>{d.mobile}</div>
        </div>
        <div style={{ fontWeight: 900, fontSize: 20, color: C.success }}>₹{Number(d.amount).toLocaleString()}</div>
      </div>

      {utrValue && (
        <div style={{ background: '#fff8f0', border: '1.5px solid ' + C.inputBdr, borderRadius: 10, padding: '10px 12px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>UTR / Ref No</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#1a1a1a' }}>{utrValue}</div>
          </div>
          <button onClick={copyUtr} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid ' + C.primary + '33', cursor: 'pointer', fontWeight: 800, fontSize: 12, background: utrCopied ? C.successBg : C.badgePend, color: utrCopied ? C.success : '#e8650a', whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: "'Poppins', sans-serif" }}>
            {utrCopied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>
      )}

      {d.upi_id && (
        <div style={{ fontSize: 13, color: '#666', marginBottom: 8, fontWeight: 600 }}>UPI Ref: {d.upi_id}</div>
      )}
      <div style={{ fontSize: 11, color: '#888', marginBottom: 12, fontWeight: 600 }}>📅 {toIST(d.created_at)}</div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <StatusBadge status={d.status} />
        {d.status === 'pending' && <React.Fragment>
          <ActionBtn onClick={() => onApprove(d.id)} color={C.success} bg={C.successBg}>✅ Approve</ActionBtn>
          <ActionBtn onClick={() => onReject(d.id)} color={C.danger} bg={C.dangerBg}>❌ Reject</ActionBtn>
        </React.Fragment>}
      </div>
    </div>
  );
}

// ─── WITHDRAWAL CARD ──────────────────────────────────────────
function WithdrawCard({ w, onApprove, onReject }) {
  const isBank = w.method === 'bank' || w.account_number;
  return (
    <div style={B.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a1a', fontFamily: "'Poppins', sans-serif" }}>{w.name}</div>
          <div style={{ fontSize: 13, color: '#e8650a', fontWeight: 600 }}>{w.mobile}</div>
        </div>
        <div style={{ fontWeight: 900, fontSize: 20, color: C.danger }}>₹{Number(w.amount).toLocaleString()}</div>
      </div>
      <div style={{ background: '#fff8f0', border: '1.5px solid ' + C.inputBdr, borderRadius: 10, padding: 12, marginBottom: 12 }}>
        {isBank ? (
          <React.Fragment>
            <div style={{ fontSize: 11, color: '#e8650a', fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>🏦 BANK TRANSFER</div>
            <div style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.8, fontWeight: 600 }}>
              <span style={{ color: '#888' }}>Name:</span> <strong>{w.account_name}</strong><br />
              <span style={{ color: '#888' }}>A/C No:</span> <strong>{w.account_number}</strong><br />
              <span style={{ color: '#888' }}>IFSC:</span> <strong>{w.ifsc_code}</strong><br />
              <span style={{ color: '#888' }}>Bank:</span> <strong>{w.bank_name}</strong>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div style={{ fontSize: 11, color: '#e8650a', fontWeight: 900, marginBottom: 6, textTransform: 'uppercase' }}>📱 UPI TRANSFER</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a' }}>{w.upi_id}</div>
            {w.account_name && <div style={{ fontSize: 13, color: '#666', fontWeight: 600, marginTop: 4 }}>{w.account_name}</div>}
          </React.Fragment>
        )}
      </div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 12, fontWeight: 600 }}>📅 {toIST(w.created_at)}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <StatusBadge status={w.status} />
        {w.status === 'pending' && <React.Fragment>
          <ActionBtn onClick={() => onApprove(w.id)} color={C.success} bg={C.successBg}>✅ Approve</ActionBtn>
          <ActionBtn onClick={() => onReject(w.id)} color={C.danger} bg={C.dangerBg}>❌ Reject</ActionBtn>
        </React.Fragment>}
      </div>
    </div>
  );
}

// ─── ADMIN LOGIN ──────────────────────────────────────────────
export function AdminLogin({ onLogin }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const go = async () => {
    setErr('');
    if (!mobile || !password) { setErr('Mobile aur password daalo'); return; }
    setLoading(true);
    try {
      const data = await apiCall('/api/auth/login', 'POST', { mobile, password });
      if (!data.success) { setErr(data.message || 'Login failed'); setLoading(false); return; }
      if (data.user.role !== 'admin') { setErr('Yeh account admin nahi hai'); setLoading(false); return; }
      localStorage.setItem('mk_token', data.token);
      localStorage.setItem('mk_admin_user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch { setErr('Server se connect nahi ho pa raha.'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f5f0e8', padding: 24, fontFamily: "'Poppins', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 60, right: 60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(232,101,10,0.06)', pointerEvents: 'none', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: 80, left: 40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(232,101,10,0.04)', pointerEvents: 'none', filter: 'blur(50px)' }} />

      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 84, height: 84, background: 'rgba(232,101,10,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(232,101,10,0.15)', border: '2px solid rgba(232,101,10,0.3)' }}>
          <span style={{ fontSize: 38 }}>👑</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#1a1a1a', letterSpacing: 2, fontFamily: "'Baloo 2', cursive" }}>ADMIN PANEL</div>
        <div style={{ fontSize: 12, color: '#e8650a', fontWeight: 700, marginTop: 6, letterSpacing: 1 }}>SAKTA MATKA • SECURE LOGIN</div>
      </div>

      <div style={{ background: '#fff', borderRadius: 18, padding: 32, width: '100%', maxWidth: 370, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', border: '1.5px solid #e8e0d4' }}>
        <label style={B.label}>Mobile Number</label>
        <input type="tel" placeholder="Admin Mobile" maxLength={10} value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} style={B.input} />
        <label style={B.label}>Password</label>
        <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} style={B.input} />
        {err && (
          <div style={{ background: C.dangerBg, borderLeft: '4px solid ' + C.danger, borderRadius: 8, padding: '10px 14px', color: C.danger, fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
            ⚠️ {err}
          </div>
        )}
        <button onClick={go} disabled={loading} style={{ ...B.btn, marginTop: 8, opacity: loading ? 0.75 : 1 }}>
          {loading ? '⏳ VERIFYING...' : '🚀 SECURE LOGIN'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN PANEL MAIN
// ═══════════════════════════════════════════════════════════════
export default function AdminPanel({ onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [bids, setBids] = useState([]);
  const [bidFilterDate, setBidFilterDate] = useState('');
  const [bidFilterStatus, setBidFilterStatus] = useState('all');
  const [notices, setNotices] = useState([]);
  const [noticeMsg, setNoticeMsg] = useState('');
  const [newGame, setNewGame] = useState({ name: '', open_time: '', close_time: '' });
  const [resultForm, setResultForm] = useState({});
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [editingGame, setEditingGame] = useState(null);
  const [gameTab, setGameTab] = useState('main');
  const [changeMobileUser, setChangeMobileUser] = useState(null);

  const [adminReady, setAdminReady] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('mk_token');
    if (token) {
      apiCall('/api/auth/profile').then(res => {
        if (res?.success && res?.user?.role === 'admin') {
          setAdminReady(true);
        } else {
          localStorage.removeItem('mk_token');
          localStorage.removeItem('mk_admin_user');
          onLogout();
        }
      }).catch(() => setAdminReady(true));
    } else {
      onLogout();
    }
  }, []);

  useEffect(() => {
    if (!adminReady) return;
    const timer = setTimeout(() => {
      localStorage.removeItem('mk_token');
      localStorage.removeItem('mk_admin_user');
      localStorage.removeItem('mk_admin_logged');
      onLogout();
    }, 10 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [adminReady]);

  const [settings, setSettings] = useState({
    site_name: '', site_url: '', upi_id: '', upi_name: '', whatsapp: '', phone: '',
    telegram: '', telegram_channel: '', support_hours: '', support_email: '',
    min_deposit: '', max_deposit: '', min_withdrawal: '', max_withdrawal: '',
    maintenance_mode: '0', qr_image: '',
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const qrFileRef = useRef(null);

  const [pwForm, setPwForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const changeAdminPassword = async () => {
    if (!pwForm.oldPass || !pwForm.newPass || !pwForm.confirmPass) {
      showToast('❌ Saare fields bhariye!'); return;
    }
    if (pwForm.newPass.length < 6) { showToast('❌ New password min 6 characters ka ho!'); return; }
    if (pwForm.newPass !== pwForm.confirmPass) { showToast('❌ New password aur confirm password match nahi kar rahe!'); return; }
    setPwSaving(true);
    try {
      const res = await apiCall('/api/auth/update-password', 'POST', {
        oldPassword: pwForm.oldPass,
        newPassword: pwForm.newPass,
      });
      if (res.success) {
        showToast('✅ Password change ho gaya! Dobara login karo.');
        setPwForm({ oldPass: '', newPass: '', confirmPass: '' });
        setTimeout(() => { localStorage.removeItem('mk_token'); localStorage.removeItem('mk_admin_user'); localStorage.removeItem('mk_admin_logged'); onLogout(); }, 2000);
      } else {
        showToast('❌ ' + (res.message || 'Password change failed'));
      }
    } catch { showToast('❌ Server error!'); }
    setPwSaving(false);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchPageData = (currentPage, isInitial = false) => {
    if (isInitial) setLoading(true);
    const done = () => { if (isInitial) setLoading(false); };

    if (currentPage === 'dashboard') {
      apiCall('/api/admin/stats').then(d => { if (d.success) { setStats(d.stats); setLastRefresh(new Date()); } done(); }).catch(done);
    } else if (currentPage === 'users') {
      apiCall('/api/admin/users').then(d => { if (d.success) { setUsers(d.users); setLastRefresh(new Date()); } done(); }).catch(done);
    } else if (currentPage === 'games' || currentPage === 'results') {
      apiCall('/api/admin/games').then(d => {
        if (d.success && d.games) {
          setGames(d.games);
          setLastRefresh(new Date());
        } else {
          showToast('❌ Games load nahi hue: ' + (d.message || 'Server error'));
        }
        done();
      }).catch(err => {
        showToast('❌ Server se connect nahi ho pa raha!');
        done();
      });
    } else if (currentPage === 'deposits') {
      apiCall('/api/admin/deposits').then(d => { if (d.success) { setDeposits(d.deposits); setLastRefresh(new Date()); } done(); }).catch(done);
    } else if (currentPage === 'withdrawals') {
      apiCall('/api/admin/withdrawals').then(d => { if (d.success) { setWithdrawals(d.withdrawals); setLastRefresh(new Date()); } done(); }).catch(done);
    } else if (currentPage === 'bids') {
      apiCall('/api/admin/bids?limit=10000').then(d => { if (d.success) { setBids(d.bids); setLastRefresh(new Date()); } done(); }).catch(done);
    } else if (currentPage === 'notices') {
      apiCall('/api/admin/notices').then(d => { if (d.success) { setNotices(d.notices || []); setLastRefresh(new Date()); } done(); }).catch(done);
    } else if (currentPage === 'settings') {
      apiCall('/api/admin/settings').then(d => {
        if (d.success && d.settings) {
          const s = d.settings;
          setSettings(prev => ({
            ...prev,
            site_name: s.site_name || prev.site_name,
            site_url: s.site_url || prev.site_url,
            upi_id: s.upi_id || prev.upi_id,
            upi_name: s.upi_name || prev.upi_name,
            whatsapp: s.whatsapp || s.whatsapp_support || prev.whatsapp,
            phone: s.phone || s.support_phone || prev.phone,
            telegram: s.telegram || s.telegram_user || prev.telegram,
            telegram_channel: s.telegram_channel || prev.telegram_channel,
            support_hours: s.support_hours || prev.support_hours,
            support_email: s.support_email || prev.support_email,
            min_deposit: s.min_deposit || prev.min_deposit,
            max_deposit: s.max_deposit || prev.max_deposit,
            min_withdrawal: s.min_withdrawal || prev.min_withdrawal,
            max_withdrawal: s.max_withdrawal || prev.max_withdrawal,
            maintenance_mode: s.maintenance_mode || '0',
            qr_image: s.qr_image || '',
          }));
        }
        done();
      }).catch(done);
    } else { done(); }
  };

  useEffect(() => {
    if (!adminReady) return;
    fetchPageData(page, true);
    const realtimePages = ['dashboard', 'bids', 'deposits', 'withdrawals', 'notices'];
    let interval = null;
    if (realtimePages.includes(page)) {
      interval = setInterval(() => fetchPageData(page, false), 15000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [page, adminReady]);

  const navigateTo = (id) => { setPage(id); setDrawerOpen(false); };

  const toggleBlock = async (id, blocked) => {
    const res = await apiCall(`/api/admin/users/${id}/block`, 'PUT', { block: !blocked });
    if (res.success) { setUsers(us => us.map(u => u.id === id ? { ...u, is_blocked: !blocked } : u)); showToast(blocked ? 'User unblocked ✅' : 'User blocked 🚫'); }
  };
  const addCoins = async (id) => {
    const a = prompt('Kitne coins ADD karne hain?'); if (!a) return;
    const res = await apiCall(`/api/admin/users/${id}/coins`, 'PUT', { amount: Number(a), action: 'add', wallet: 'wallet' });
    if (res.success) { showToast('Coins added ✅'); fetchPageData('users', false); } else showToast('Error: ' + res.message);
  };
  const deductCoins = async (id) => {
    const a = prompt('Kitne coins DEDUCT karne hain?'); if (!a) return;
    const res = await apiCall(`/api/admin/users/${id}/coins`, 'PUT', { amount: Number(a), action: 'deduct', wallet: 'wallet' });
    if (res.success) { showToast('Coins deducted ✅'); fetchPageData('users', false); } else showToast('Error: ' + res.message);
  };

  const handleChangeMobile = (user) => {
    setChangeMobileUser(user);
  };

  const loginAsUser = async (id) => {
    const res = await apiCall(`/api/admin/users/${id}/login-as`, 'POST');
    if (res.success) {
      localStorage.setItem('mk_admin_token', localStorage.getItem('mk_token'));
      localStorage.setItem('mk_token', res.token);
      window.location.href = '/';
    } else {
      showToast('❌ Error: ' + (res.message || 'Failed to login as user'));
    }
  };

  const addGame = async () => {
    if (!newGame.name || !newGame.open_time || !newGame.close_time) { showToast('Saari details bhariye!'); return; }
    const res = await apiCall('/api/admin/games', 'POST', { ...newGame, category: 'regular' });
    if (res.success) { setGames(gs => [...gs, res.game || res.data]); setNewGame({ name: '', open_time: '', close_time: '' }); showToast('Game added ✅'); fetchPageData('games'); }
    else showToast('Error: ' + res.message);
  };
  const toggleGameStatus = async (id, status) => {
    const newStatus = status === 'open' ? 'closed' : 'open';
    const res = await apiCall(`/api/admin/games/${id}/status`, 'PUT', { status: newStatus });
    if (res.success) { setGames(gs => gs.map(g => g.id === id ? { ...g, status: newStatus } : g)); showToast('Game ' + newStatus + ' ✅'); }
  };
  const declareResult = async (gameId) => {
    const val = resultForm[gameId]; if (!val) return;
    const parts = val.split('-');
    const res = await apiCall(`/api/admin/games/${gameId}/result`, 'PUT', { open_result: parts[0] || '', close_result: parts[1] || '' });
    if (res.success) { setGames(gs => gs.map(g => g.id === gameId ? { ...g, result: val } : g)); setResultForm(rf => ({ ...rf, [gameId]: '' })); showToast('Result declared! Winners credited ✅'); }
    else showToast('Error: ' + (res.message || 'Failed'));
  };

  const updateDeposit = async (id, action) => {
    const res = await apiCall(`/api/admin/deposits/${id}`, 'PUT', { action });
    if (res.success) { setDeposits(ds => ds.map(d => d.id === id ? { ...d, status: action === 'approve' ? 'approved' : 'rejected' } : d)); showToast('Deposit ' + action + 'd ✅'); }
  };
  const updateWithdrawal = async (id, action) => {
    const res = await apiCall(`/api/admin/withdrawals/${id}`, 'PUT', { action });
    if (res.success) { setWithdrawals(ws => ws.map(w => w.id === id ? { ...w, status: action === 'approve' ? 'approved' : 'rejected' } : w)); showToast('Withdrawal ' + action + 'd ✅'); }
  };

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) { showToast('QR image 500KB se chhoti honi chahiye!'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setSettings(s => ({ ...s, qr_image: ev.target.result })); showToast('QR image load hua — Save karo ✅'); };
    reader.readAsDataURL(file);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    const payload = {
      site_name: settings.site_name, site_url: settings.site_url, upi_id: settings.upi_id,
      upi_name: settings.upi_name || settings.site_name || 'MatkaKing',
      whatsapp: settings.whatsapp, whatsapp_support: settings.whatsapp,
      phone: settings.phone, support_phone: settings.phone,
      telegram: settings.telegram, telegram_channel: settings.telegram_channel,
      support_hours: settings.support_hours, support_email: settings.support_email,
      min_deposit: settings.min_deposit, max_deposit: settings.max_deposit,
      min_withdrawal: settings.min_withdrawal, max_withdrawal: settings.max_withdrawal,
      maintenance_mode: settings.maintenance_mode, qr_image: settings.qr_image,
    };
    const res = await apiCall('/api/admin/settings', 'POST', payload);
    setSavingSettings(false);
    if (res.success) { setSettingsSaved(true); showToast('✅ Sab settings save ho gayi!'); setTimeout(() => setSettingsSaved(false), 3000); }
    else showToast('❌ Error: ' + res.message);
  };

  const autoQrUrl = settings.upi_id
    ? 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent('upi://pay?pa=' + settings.upi_id + '&pn=' + encodeURIComponent(settings.upi_name || 'MatkaKing') + '&cu=INR')
    : null;

  const SIDEBAR = [
    { id: 'dashboard', ic: '📊', l: 'Dashboard' },
    { id: 'users', ic: '👥', l: 'Users' },
    { id: 'games', ic: '🎮', l: 'Games' },
    { id: 'deposits', ic: '💰', l: 'Deposits' },
    { id: 'withdrawals', ic: '💸', l: 'Withdrawals' },
    { id: 'bids', ic: '🎯', l: 'All Bids' },
    { id: 'results', ic: '🏆', l: 'Declare Result' },
    { id: 'notices', ic: '🔔', l: 'Notices' },
    { id: 'settings', ic: '⚙️', l: 'Settings' },
  ];

  const pageTitles = {
    dashboard: '📊 Dashboard', users: '👥 Users', games: '🎮 Manage Games',
    deposits: '💰 Deposit Requests', withdrawals: '💸 Withdrawal Requests',
    bids: '🎯 All Player Bids', results: '🏆 Declare Results',
    notices: '🔔 Notices & Alerts', settings: '⚙️ Settings',
  };

  if (!adminReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f0e8', color: '#e8650a', fontSize: 16, fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
        ⏳ Verifying admin...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f0e8', fontFamily: "'Poppins', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#fff', color: '#1a1a1a', padding: '14px 24px', borderRadius: 12, borderLeft: '4px solid #e8650a', boxShadow: '0 4px 20px rgba(232,101,10,0.15)', zIndex: 9999, fontWeight: 700, fontSize: 14, maxWidth: 320, border: '1.5px solid #e8e0d4' }}>
          {toast}
        </div>
      )}

      {/* Edit Game Modal */}
      {editingGame && (
        <EditGameModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onSave={(updated) => {
            setGames(gs => gs.map(g => g.id === updated.id ? updated : g));
            showToast('Game updated ✅');
          }}
        />
      )}

      {/* Change Mobile Modal */}
      {changeMobileUser && (
        <ChangeMobileModal
          user={changeMobileUser}
          onClose={() => setChangeMobileUser(null)}
          onSave={(newMobile) => {
            setUsers(us => us.map(u => u.id === changeMobileUser.id ? { ...u, mobile: newMobile } : u));
            showToast('📱 Mobile number update ho gaya ✅');
            setChangeMobileUser(null);
          }}
        />
      )}

      {/* NAVBAR */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d2d5e)', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 3px 12px rgba(232,101,10,0.3)', flexShrink: 0, borderBottom: '1px solid rgba(232,101,10,0.1)' }}>
        <button onClick={() => setDrawerOpen(true)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, width: 42, height: 42, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 0 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: 20, height: 2.5, background: '#fff', borderRadius: 2 }} />)}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>👑</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: 1.5, lineHeight: 1, fontFamily: "'Baloo 2', cursive" }}>
              {settings.site_name || 'SAKTA MATKA'}
            </div>
            <div style={{ fontSize: 9, color: '#e8650a', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Admin Panel</div>
          </div>
        </div>

        <button onClick={() => { localStorage.removeItem('mk_token'); localStorage.removeItem('mk_admin_user'); localStorage.removeItem('mk_admin_logged'); onLogout(); }} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 14px', borderRadius: 10, fontWeight: 800, fontSize: 11, cursor: 'pointer', letterSpacing: 0.5, fontFamily: "'Poppins', sans-serif" }}>
          LOGOUT
        </button>
      </div>

      {/* DRAWER OVERLAY */}
      {drawerOpen && <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', zIndex: 300 }} />}

      {/* SIDE DRAWER */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: 272, background: '#1a1a2e', zIndex: 400, overflowY: 'auto', paddingBottom: 40, transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', boxShadow: drawerOpen ? '5px 0 24px rgba(232,101,10,0.1)' : 'none', borderRight: '1px solid rgba(232,101,10,0.1)' }}>
        <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d2d5e)', padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(232,101,10,0.1)' }}>
          <div><div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 1, fontFamily: "'Baloo 2', cursive" }}>{settings.site_name || 'SAKTA MATKA'}</div>
            <div style={{ fontSize: 11, color: '#e8650a', marginTop: 4, fontWeight: 700, letterSpacing: 1 }}>Admin Control Panel</div>
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: 18, fontWeight: 'bold' }}>✕</button>
        </div>

        <div style={{ fontSize: 10, color: 'rgba(232,101,10,0.5)', letterSpacing: 2, textTransform: 'uppercase', padding: '20px 20px 8px', fontWeight: 800 }}>Navigation</div>

        {SIDEBAR.map(s => (
          <div key={s.id} onClick={() => navigateTo(s.id)} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', cursor: 'pointer',
            borderBottom: '1px solid rgba(232,101,10,0.06)',
            background: page === s.id ? 'rgba(232,101,10,0.08)' : 'transparent',
            borderLeft: page === s.id ? '4px solid #e8650a' : '4px solid transparent',
            color: page === s.id ? '#e8650a' : 'rgba(255,255,255,0.6)',
            fontSize: 14, fontWeight: page === s.id ? 800 : 500,
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 19, width: 24, textAlign: 'center' }}>{s.ic}</span>
            {s.l}
            {page === s.id && <span style={{ marginLeft: 'auto', color: '#e8650a', fontSize: 18 }}>›</span>}
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#e8650a', fontFamily: "'Baloo 2', cursive" }}>{pageTitles[page]}</div>
          {['dashboard', 'bids', 'deposits', 'withdrawals', 'notices'].includes(page) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1.5px solid #e8e0d4', borderRadius: 20, padding: '6px 12px', fontSize: 11, color: '#e8650a', fontWeight: 800 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e8650a', display: 'inline-block', animation: 'livePulse 2s infinite' }} />
              LIVE {lastRefresh && <span style={{ color: '#888', marginLeft: 4 }}>· {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
            </div>
          )}
        </div>

        <style>{`
          @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)} }
          input:focus,select:focus { border-color: #e8650a !important; box-shadow: 0 0 0 3px rgba(232,101,10,0.12) !important; }
          input::placeholder { color: #aaa !important; }
          option { background: #fff; color: #1a1a1a; }
        `}</style>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#e8650a', fontSize: 15, fontWeight: 700 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
            Loading Data...
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {!loading && page === 'dashboard' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { val: stats.total_users || 0, label: 'Total Users', color: '#e8650a', icon: '👥' },
              { val: stats.active_games || 0, label: 'Active Games', color: '#f59420', icon: '🎮' },
              { val: stats.today_bids?.count || 0, label: 'Aaj ke Bids', color: '#e8650a', icon: '🎯' },
              { val: '₹' + (stats.today_bids?.volume || 0).toLocaleString(), label: 'Bid Volume', color: '#f59420', icon: '📈' },
              { val: stats.pending_deposits?.count || 0, label: 'Pending Deposits', color: '#ef4444', icon: '⏳' },
              { val: '₹' + (stats.pending_deposits?.volume || 0).toLocaleString(), label: 'Pending Dep. Amt', color: '#ef4444', icon: '💳' },
              { val: stats.pending_withdrawals?.count || 0, label: 'Pending Withdraw', color: '#f59420', icon: '🔄' },
              { val: '₹' + (stats.pending_withdrawals?.volume || 0).toLocaleString(), label: 'Pending With. Amt', color: '#f59420', icon: '💵' },
              { val: '₹' + (stats.total_deposited || 0).toLocaleString(), label: 'Total Deposited', color: '#1a1a2e', icon: '🏦' },
              { val: '₹' + (stats.total_winnings_paid || 0).toLocaleString(), label: 'Winnings Paid', color: '#22c55e', icon: '🏆' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', border: '1.5px solid #e8e0d4', borderLeft: '5px solid ' + s.color, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: s.color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4, fontWeight: 800 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── USERS ── */}
        {!loading && page === 'users' && (
          <div>
            {users.length === 0
              ? <div style={{ textAlign: 'center', color: '#888', padding: 40, fontWeight: 700 }}>Koi user nahi mila</div>
              : users.map(u => (
                <UserCard
                  key={u.id}
                  u={u}
                  onBlock={toggleBlock}
                  onAddCoins={addCoins}
                  onDeductCoins={deductCoins}
                  onChangeMobile={handleChangeMobile}
                  onLoginAs={loginAsUser}
                />
              ))
            }
          </div>
        )}

        {/* ── GAMES ── */}
        {!loading && page === 'games' && <React.Fragment>
          <div style={B.card}>
            <div style={B.title}>➕ Add New Game</div>
            <label style={B.label}>Game Name</label>
            <input style={B.input} placeholder="Game Name (e.g. Kalyan)" value={newGame.name} onChange={e => setNewGame({ ...newGame, name: e.target.value })} />
            <label style={B.label}>Open Time</label>
            <TimePicker value={newGame.open_time} onChange={v => setNewGame({ ...newGame, open_time: v })} />
            <label style={B.label}>Close Time</label>
            <TimePicker value={newGame.close_time} onChange={v => setNewGame({ ...newGame, close_time: v })} />
            <label style={B.label}>Category</label>
            <select value="regular" style={{ ...B.input, marginBottom: 0 }} disabled>
              <option value="regular">Regular</option>
            </select>
            <button onClick={addGame} style={{ ...B.btn, marginTop: 14 }}>🎮 ADD GAME</button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {['main', 'starline', 'disawar'].map(tab => (
              <button key={tab} onClick={() => setGameTab(tab)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid ' + (gameTab === tab ? '#e8650a' : '#e8e0d4'), cursor: 'pointer', fontWeight: 800, fontSize: 12, background: gameTab === tab ? '#e8650a' : '#fff', color: gameTab === tab ? '#fff' : '#888', textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Poppins', sans-serif" }}>
                {tab}
              </button>
            ))}
          </div>

          {games.filter(g => {
            if (gameTab === 'main') return !g.name?.toLowerCase().includes('starline') && !g.name?.toLowerCase().includes('disawar') && g.category !== 'starline' && g.category !== 'disawar';
            if (gameTab === 'starline') return g.name?.toLowerCase().includes('starline') || g.category === 'starline';
            return g.name?.toLowerCase().includes('disawar') || g.category === 'disawar';
          }).map(g => (
            <div key={g.id} style={B.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: '#1a1a1a', fontFamily: "'Baloo 2', cursive", textTransform: 'uppercase' }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Open: {displayTime(g.open_time)} · Close: {displayTime(g.close_time)}</div>
                </div>
                <StatusBadge status={g.status} />
              </div>
              {g.open_result && <div style={{ fontSize: 12, color: '#e8650a', fontWeight: 700, marginBottom: 10 }}>Result: {g.open_result}-{g.jodi_result || '--'}-{g.close_result || '***'}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <ActionBtn onClick={() => toggleGameStatus(g.id, g.status)} color={g.status === 'open' ? '#ef4444' : '#22c55e'} bg={g.status === 'open' ? C.dangerBg : C.successBg}>
                  {g.status === 'open' ? '🚫 Close' : '✅ Open'}
                </ActionBtn>
                <ActionBtn onClick={() => setEditingGame(g)} color="#e8650a" bg={C.badgePend}>✏️ Edit</ActionBtn>
              </div>
            </div>
          ))}
        </React.Fragment>}

        {/* ── RESULTS ── */}
        {!loading && page === 'results' && (
          <div>
            {games.map(g => (
              <div key={g.id} style={B.card}>
                <div style={{ fontWeight: 900, fontSize: 16, color: '#1a1a1a', marginBottom: 8, fontFamily: "'Baloo 2', cursive", textTransform: 'uppercase' }}>{g.name}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                  <input
                    style={{ ...B.input, flex: 1, marginBottom: 0 }}
                    placeholder="open_result-close_result (e.g. 123-45-678)"
                    value={resultForm[g.id] || ''}
                    onChange={e => setResultForm(rf => ({ ...rf, [g.id]: e.target.value }))}
                  />
                  <button onClick={() => declareResult(g.id)} style={{ padding: '12px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #e8650a, #f59420)', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 3px 10px rgba(232,101,10,0.3)', fontFamily: "'Poppins', sans-serif" }}>
                    🏆 Declare
                  </button>
                </div>
                {g.open_result && <div style={{ background: '#fff8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#e8650a', fontWeight: 700, border: '1px solid #e8e0d4' }}>
                  Current: {g.open_result}-{g.jodi_result || '--'}-{g.close_result || '***'}
                </div>}
              </div>
            ))}
          </div>
        )}

        {/* ── DEPOSITS ── */}
        {!loading && page === 'deposits' && (
          <div>
            {deposits.length === 0
              ? <div style={{ textAlign: 'center', color: '#888', padding: 40, fontWeight: 700 }}>Koi pending deposit nahi hai</div>
              : deposits.map(d => (
                <DepositCard key={d.id} d={d} onApprove={(id) => updateDeposit(id, 'approve')} onReject={(id) => updateDeposit(id, 'reject')} />
              ))
            }
          </div>
        )}

        {/* ── WITHDRAWALS ── */}
        {!loading && page === 'withdrawals' && (
          <div>
            {withdrawals.length === 0
              ? <div style={{ textAlign: 'center', color: '#888', padding: 40, fontWeight: 700 }}>Koi pending withdrawal nahi hai</div>
              : withdrawals.map(w => (
                <WithdrawCard key={w.id} w={w} onApprove={(id) => updateWithdrawal(id, 'approve')} onReject={(id) => updateWithdrawal(id, 'reject')} />
              ))
            }
          </div>
        )}

        {/* ── BIDS ── */}
        {!loading && page === 'bids' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <input type="date" value={bidFilterDate} onChange={e => setBidFilterDate(e.target.value)} style={{ ...B.input, width: 'auto', flex: 1, marginBottom: 0 }} />
              <select value={bidFilterStatus} onChange={e => setBidFilterStatus(e.target.value)} style={{ ...B.input, width: 'auto', flex: '0 0 130px', marginBottom: 0 }}>
                <option value="all">All Status</option>
                <option value="win">Won</option>
                <option value="loss">Lost</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            {bids
              .filter(b => {
                if (bidFilterStatus !== 'all' && b.status !== bidFilterStatus) return false;
                if (bidFilterDate) {
                  const bDate = b.created_at ? b.created_at.split('T')[0] : '';
                  if (bDate !== bidFilterDate) return false;
                }
                return true;
              })
              .map(b => (
                <div key={b.id} style={B.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: '#1a1a1a' }}>{b.name}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{b.game_name} · {b.game_type} · {b.session}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, fontSize: 16, color: '#e8650a' }}>₹{Number(b.amount).toLocaleString()}</div>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888', fontWeight: 600 }}>
                    <span>Number: <strong style={{ color: '#1a1a1a' }}>{b.number}</strong></span>
                    <span>📅 {toIST(b.created_at)}</span>
                  </div>
                </div>
              ))
            }
            {bids.length === 0 && <div style={{ textAlign: 'center', color: '#888', padding: 40, fontWeight: 700 }}>Koi bid nahi mili</div>}
          </div>
        )}

        {/* ── NOTICES ── */}
        {!loading && page === 'notices' && (
          <div>
            <div style={B.card}>
              <div style={B.title}>➕ Add Notice</div>
              <textarea
                style={{ ...B.input, minHeight: 80, resize: 'vertical', marginBottom: 0 }}
                placeholder="Notice message likho..."
                value={noticeMsg}
                onChange={e => setNoticeMsg(e.target.value)}
              />
              <button onClick={async () => {
                if (!noticeMsg.trim()) { showToast('Message likho!'); return; }
                const res = await apiCall('/api/admin/notices', 'POST', { message: noticeMsg });
                if (res.success) { setNoticeMsg(''); showToast('Notice added ✅'); fetchPageData('notices', false); }
                else showToast('Error: ' + res.message);
              }} style={{ ...B.btn, marginTop: 14 }}>🔔 SEND NOTICE</button>
            </div>

            {notices.map((n, i) => (
              <div key={n.id || i} style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, border: '1.5px solid #e8e0d4', borderLeft: '4px solid #e8650a', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 600, lineHeight: 1.6, marginBottom: 8 }}>{n.message}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>📅 {toIST(n.created_at)}</div>
                  <button onClick={async () => {
                    const res = await apiCall('/api/admin/notices/' + n.id, 'DELETE');
                    if (res.success) { showToast('Notice deleted ✅'); fetchPageData('notices', false); }
                    else showToast('Error: ' + res.message);
                  }} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #ef444444', cursor: 'pointer', fontWeight: 800, fontSize: 11, background: C.dangerBg, color: '#ef4444', fontFamily: "'Poppins', sans-serif" }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
            {notices.length === 0 && <div style={{ textAlign: 'center', color: '#888', padding: 40, fontWeight: 700 }}>Koi notice nahi hai</div>}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {!loading && page === 'settings' && (
          <div>
            <div style={B.card}>
              <div style={B.title}>🌐 Site Settings</div>
              <label style={B.label}>Site Name</label>
              <input style={B.input} placeholder="e.g. MATKA KING" value={settings.site_name} onChange={e => setSettings(s => ({ ...s, site_name: e.target.value }))} />
              <label style={B.label}>Site URL</label>
              <input style={B.input} placeholder="https://yoursite.com" value={settings.site_url} onChange={e => setSettings(s => ({ ...s, site_url: e.target.value }))} />
            </div>

            <div style={B.card}>
              <div style={B.title}>💳 Payment Settings</div>
              <label style={B.label}>UPI ID</label>
              <input style={B.input} placeholder="yourupi@paytm" value={settings.upi_id} onChange={e => setSettings(s => ({ ...s, upi_id: e.target.value }))} />
              <label style={B.label}>UPI Name</label>
              <input style={B.input} placeholder="Display Name" value={settings.upi_name} onChange={e => setSettings(s => ({ ...s, upi_name: e.target.value }))} />

              <label style={B.label}>Min Deposit (₹)</label>
              <input type="number" style={B.input} placeholder="100" value={settings.min_deposit} onChange={e => setSettings(s => ({ ...s, min_deposit: e.target.value }))} />
              <label style={B.label}>Max Deposit (₹)</label>
              <input type="number" style={B.input} placeholder="50000" value={settings.max_deposit} onChange={e => setSettings(s => ({ ...s, max_deposit: e.target.value }))} />
              <label style={B.label}>Min Withdrawal (₹)</label>
              <input type="number" style={B.input} placeholder="200" value={settings.min_withdrawal} onChange={e => setSettings(s => ({ ...s, min_withdrawal: e.target.value }))} />
              <label style={B.label}>Max Withdrawal (₹)</label>
              <input type="number" style={B.input} placeholder="50000" value={settings.max_withdrawal} onChange={e => setSettings(s => ({ ...s, max_withdrawal: e.target.value }))} />

              {/* QR Section */}
              <div style={{ marginTop: 12, marginBottom: 12 }}>
                <label style={B.label}>QR Code Image</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <input type="file" accept="image/*" ref={qrFileRef} onChange={handleQrUpload} style={{ display: 'none' }} />
                    <button onClick={() => qrFileRef.current && qrFileRef.current.click()} style={{ width: '100%', padding: '12px', borderRadius: 10, border: '2px dashed ' + C.inputBdr, background: '#fff8f0', color: '#e8650a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      📷 Upload QR
                    </button>
                  </div>
                  {(settings.qr_image || autoQrUrl) && (
                    <div style={{ width: 100, height: 100, borderRadius: 10, border: '1.5px solid #e8e0d4', overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={settings.qr_image || autoQrUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
                {settings.qr_image && (
                  <button onClick={() => { setSettings(s => ({ ...s, qr_image: '' })); showToast('QR image removed ✅'); }} style={{ marginTop: 8, padding: '6px 14px', borderRadius: 8, border: '1px solid #ef444444', cursor: 'pointer', fontWeight: 700, fontSize: 12, background: C.dangerBg, color: '#ef4444', fontFamily: "'Poppins', sans-serif" }}>
                    🗑️ Remove QR
                  </button>
                )}
              </div>
            </div>

            <div style={B.card}>
              <div style={B.title}>📞 Support Settings</div>
              <label style={B.label}>WhatsApp Number</label>
              <input style={B.input} placeholder="9999999999" value={settings.whatsapp} onChange={e => setSettings(s => ({ ...s, whatsapp: e.target.value }))} />
              <label style={B.label}>Phone Number</label>
              <input style={B.input} placeholder="9999999999" value={settings.phone} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} />
              <label style={B.label}>Telegram Username</label>
              <input style={B.input} placeholder="@username" value={settings.telegram} onChange={e => setSettings(s => ({ ...s, telegram: e.target.value }))} />
              <label style={B.label}>Telegram Channel</label>
              <input style={B.input} placeholder="@channel" value={settings.telegram_channel} onChange={e => setSettings(s => ({ ...s, telegram_channel: e.target.value }))} />
              <label style={B.label}>Support Hours</label>
              <input style={B.input} placeholder="10 AM - 10 PM" value={settings.support_hours} onChange={e => setSettings(s => ({ ...s, support_hours: e.target.value }))} />
              <label style={B.label}>Support Email</label>
              <input style={B.input} placeholder="support@email.com" value={settings.support_email} onChange={e => setSettings(s => ({ ...s, support_email: e.target.value }))} />
            </div>

            <div style={B.card}>
              <div style={B.title}>🔧 Maintenance</div>
              <label style={B.label}>Maintenance Mode</label>
              <select value={settings.maintenance_mode} onChange={e => setSettings(s => ({ ...s, maintenance_mode: e.target.value }))} style={B.input}>
                <option value="0">❌ OFF - Site Open</option>
                <option value="1">✅ ON - Site Closed</option>
              </select>
            </div>

            <button onClick={saveSettings} disabled={savingSettings} style={{ ...B.btn, opacity: savingSettings ? 0.6 : 1, marginBottom: 14 }}>
              {savingSettings ? '⏳ SAVING...' : '💾 SAVE ALL SETTINGS'}
            </button>

            {settingsSaved && (
              <div style={{ background: C.successBg, borderLeft: '4px solid ' + C.success, borderRadius: 8, padding: '10px 14px', color: C.success, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                ✅ Settings saved successfully!
              </div>
            )}

            {/* CHANGE PASSWORD */}
            <div style={B.card}>
              <div style={B.title}>🔑 Change Admin Password</div>
              <label style={B.label}>Current Password</label>
              <input type="password" style={B.input} placeholder="••••••••" value={pwForm.oldPass} onChange={e => setPwForm(p => ({ ...p, oldPass: e.target.value }))} />
              <label style={B.label}>New Password</label>
              <input type="password" style={B.input} placeholder="Min 6 characters" value={pwForm.newPass} onChange={e => setPwForm(p => ({ ...p, newPass: e.target.value }))} />
              <label style={B.label}>Confirm New Password</label>
              <input type="password" style={{ ...B.input, marginBottom: 0 }} placeholder="Repeat new password" value={pwForm.confirmPass} onChange={e => setPwForm(p => ({ ...p, confirmPass: e.target.value }))} />
              <button onClick={changeAdminPassword} disabled={pwSaving} style={{ ...B.btn, marginTop: 14, opacity: pwSaving ? 0.6 : 1 }}>
                {pwSaving ? '⏳ CHANGING...' : '🔑 CHANGE PASSWORD'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
