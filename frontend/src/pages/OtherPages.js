import React, { useState, useEffect, useRef } from 'react';

// ── SHARED THEME ──
const T = {
  bg:         '#f5f0e8',
  orange:     '#e8650a',
  orangeLight:'#f59420',
  dark:       '#1a1a2e',
  white:      '#fff',
  card:       '#fff',
  cardBorder: '#e8e0d4',
  cream:      '#fff8f0',
  creamBorder:'#f5c99a',
  text:       '#1a1a1a',
  textMuted:  '#888',
  green:      '#16a34a',
  red:        '#dc2626',
};

const commonStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800;900&family=Poppins:wght@400;600;700;800;900&display=swap');
  .op-page { background: #f5f0e8; min-height: 100vh; padding-bottom: 80px; color: #1a1a1a; font-family: 'Poppins', sans-serif; }
  .op-header { background: #e8650a; padding: 14px 16px; display: flex; align-items: center; gap: 12px; position: sticky; top: 0; z-index: 100; box-shadow: 0 3px 12px rgba(232,101,10,0.4); }
  .op-header-title { font-size: 18px; font-weight: 900; color: #fff; letter-spacing: 1.5px; font-family: 'Baloo 2', cursive; text-transform: uppercase; flex: 1; }
  .op-back-btn { background: rgba(255,255,255,0.2); border: none; border-radius: 10px; width: 38px; height: 38px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px; font-weight: 700; flex-shrink: 0; }
  .op-card { background: #fff; border-radius: 14px; border: 1.5px solid #e8e0d4; box-shadow: 0 2px 10px rgba(0,0,0,0.08); margin: 12px; padding: 16px; }
  .op-label { font-size: 11px; color: #e8650a; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; display: block; }
  .op-input { width: 100%; background: #fff8f0; border: 1.5px solid #f5c99a; border-radius: 10px; padding: 14px; color: #1a1a1a; font-size: 15px; font-weight: 600; outline: none; margin-bottom: 16px; box-sizing: border-box; font-family: inherit; }
  .op-btn { width: 100%; background: linear-gradient(135deg, #e8650a, #f59420); color: #fff; border: none; border-radius: 25px; padding: 15px; font-size: 16px; font-weight: 900; cursor: pointer; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 4px 14px rgba(232,101,10,0.4); font-family: 'Poppins', sans-serif; }
  .op-section-title { font-size: 12px; font-weight: 800; color: #e8650a; text-transform: uppercase; letter-spacing: 1.5px; padding: 14px 14px 8px; display: flex; align-items: center; gap: 8px; }
  .op-stat-card { background: #fff; border-radius: 14px; padding: 14px; border: 1.5px solid #e8e0d4; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; }
  .op-filter-btn-active { flex: 1; padding: 10px 0; border-radius: 25px; cursor: pointer; font-weight: 800; font-size: 12px; background: linear-gradient(135deg, #e8650a, #f59420); color: #fff; border: none; box-shadow: 0 3px 10px rgba(232,101,10,0.3); }
  .op-filter-btn { flex: 1; padding: 10px 0; border-radius: 25px; cursor: pointer; font-weight: 800; font-size: 12px; background: #fff; color: #888; border: 1.5px solid #e8e0d4; }
  .op-list-item { background: #fff; border-radius: 14px; padding: 14px; margin-bottom: 10px; border: 1.5px solid #e8e0d4; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 12px; }
  .op-menu-item { display: flex; align-items: center; gap: 16px; padding: 16px; border-bottom: 1px solid #f0ebe0; cursor: pointer; transition: background 0.2s; }
  .op-menu-item:hover { background: #fff8f0; }
  .op-menu-icon { width: 44px; height: 44px; background: #fff8f0; border: 1.5px solid #f5c99a; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
`;

function SubHeader({ title, onBack, rightBtn }) {
  return (
    <div className="op-header">
      {onBack && <button className="op-back-btn" onClick={onBack}>‹</button>}
      <div className="op-header-title">{title}</div>
      {rightBtn}
    </div>
  );
}

function Badge({ color }) {
  const cfg = {
    green: { bg: 'rgba(22,163,74,0.12)', color: '#16a34a' },
    red:   { bg: 'rgba(220,38,38,0.12)', color: '#dc2626' },
    blue:  { bg: 'rgba(232,101,10,0.12)', color: '#e8650a' },
  }[color] || { bg: 'rgba(232,101,10,0.12)', color: '#e8650a' };
  return (children) => (
    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', background: cfg.bg, color: cfg.color }}>{children}</span>
  );
}

function makeBadge(color, text) {
  const cfg = {
    green: { bg: 'rgba(22,163,74,0.12)', color: '#16a34a' },
    red:   { bg: 'rgba(220,38,38,0.12)', color: '#dc2626' },
    blue:  { bg: 'rgba(232,101,10,0.12)', color: '#e8650a' },
  }[color] || { bg: 'rgba(232,101,10,0.12)', color: '#e8650a' };
  return <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', background: cfg.bg, color: cfg.color }}>{text}</span>;
}

// ── SUCCESS POPUP ──
function SuccessPopup({ onClose }) {
  const [progress, setProgress] = useState(100);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => { if (p <= 0) { clearInterval(interval); return 0; } return p - 2; });
    }, 100);
    const timer = setTimeout(() => { onClose(); }, 5000);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', border: '1.5px solid #e8e0d4', borderRadius: 24, width: '100%', maxWidth: 360, padding: '32px 24px 28px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative' }}>
        <div onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, background: '#fff8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#e8650a', fontWeight: 700, border: '1.5px solid #f5c99a' }}>✕</div>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 20px rgba(22,163,74,0.3)', fontSize: 38 }}>✅</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#e8650a', marginBottom: 10 }}>Request Submitted!</div>
        <div style={{ fontSize: 14, color: '#666', fontWeight: 600, lineHeight: 1.7, marginBottom: 24 }}>
          Your deposit request has been successfully submitted.<br />
          Wallet will be credited within <span style={{ color: '#e8650a', fontWeight: 800 }}>10–30 Minutes</span>. ✨
        </div>
        <div style={{ background: '#fff8f0', borderRadius: 20, height: 6, overflow: 'hidden', marginBottom: 10, border: '1px solid #f5c99a' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #e8650a, #f59420)', borderRadius: 20, transition: 'width 0.1s linear' }} />
        </div>
        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 20, fontWeight: 600 }}>⏳ Auto-close in {Math.ceil(progress / 20)} sec</div>
        <button onClick={onClose} className="op-btn">✕ &nbsp; Close</button>
      </div>
    </div>
  );
}

// ── DEPOSIT MODAL ──
export function DepositModal({ onClose, apiCall, onSuccess }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [upiId, setUpiId] = useState('');
  const [whatsapp, setWhatsapp] = useState('9999999999');
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [upiCopied, setUpiCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState('');
  const fileInputRef = useRef(null);
  const presets = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    if (!apiCall) return;
    apiCall('/api/payment-info').then(res => {
      if (res?.success && res?.data?.upi_id) {
        const s = res.data;
        setUpiId(s.upi_id);
        if (s.whatsapp_support) setWhatsapp(s.whatsapp_support);
        setQrUrl(s.qr_image || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=${s.upi_id}&pn=${s.upi_name || 'MatkaKing'}&cu=INR`)}`);
      } else {
        apiCall('/api/admin/settings').then(res2 => {
          if (res2?.success && res2?.settings?.upi_id) {
            const s = res2.settings;
            setUpiId(s.upi_id);
            if (s.whatsapp || s.whatsapp_support) setWhatsapp(s.whatsapp || s.whatsapp_support);
            setQrUrl(s.qr_image || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=${s.upi_id}&pn=${s.upi_name || 'MatkaKing'}&cu=INR`)}`);
          }
        }).catch(() => {});
      }
    }).catch(() => {});
  }, [apiCall]);

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMsg({ type: 'err', text: '❌ Only image files allowed' }); return; }
    if (file.size > 5 * 1024 * 1024) { setMsg({ type: 'err', text: '❌ Image size must be under 5MB' }); return; }
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (ev) => { setScreenshotPreview(ev.target.result); setScreenshotBase64(ev.target.result); };
    reader.readAsDataURL(file);
    setMsg({ type: '', text: '' });
  };

  const removeScreenshot = () => { setScreenshot(null); setScreenshotPreview(''); setScreenshotBase64(''); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleNext = () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 100) { setMsg({ type: 'err', text: '❌ Minimum deposit is ₹100' }); return; }
    if (amt > 100000) { setMsg({ type: 'err', text: '❌ Maximum deposit is ₹1,00,000' }); return; }
    setMsg({ type: '', text: '' }); setStep(2);
  };

  const copyUpi = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId).then(() => { setUpiCopied(true); setTimeout(() => setUpiCopied(false), 2000); });
  };

  const sendWhatsApp = (utrValue) => {
    const num = whatsapp.replace(/\D/g, '');
    const text = encodeURIComponent(`💰 *Deposit Request — MatkaKing*\n\nAmount: ₹${parseFloat(amount).toLocaleString('en-IN')}\nUTR/Transaction ID: ${utrValue || utr || 'Not provided'}\nUPI ID Paid To: ${upiId || 'N/A'}\nDate & Time: ${new Date().toLocaleString('en-IN')}\n\nPlease approve quickly 🙏`);
    window.open(`https://wa.me/91${num}?text=${text}`, '_blank');
  };

  const handleSubmitUTR = async () => {
    if (!utr || utr.trim().length < 6) { setMsg({ type: 'err', text: '❌ Enter a valid Transaction Number / UTR' }); return; }
    setLoading(true); setMsg({ type: '', text: '' });
    try {
      const payload = { amount: parseFloat(amount), utr: utr.trim(), payment_method: 'upi' };
      if (screenshotBase64) payload.screenshot = screenshotBase64;
      const res = await apiCall('/api/wallet/deposit', 'POST', payload);
      if (res?.success) { onSuccess && onSuccess(); sendWhatsApp(utr.trim()); setShowSuccess(true); }
      else { setMsg({ type: 'err', text: res?.message || '❌ Request could not be submitted' }); }
    } catch { setMsg({ type: 'err', text: '❌ Unable to connect to server' }); }
    finally { setLoading(false); }
  };

  if (showSuccess) return <SuccessPopup onClose={onClose} />;

  return (
    <>
      <style>{commonStyles}</style>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={{ background: '#f5f0e8', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 520, maxHeight: '94vh', overflowY: 'auto', paddingBottom: 40, boxShadow: '0 -8px 30px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
            <div style={{ width: 44, height: 5, background: '#f5c99a', borderRadius: 10 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px 18px' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#e8650a', fontFamily: "'Baloo 2', cursive" }}>{step === 1 ? '💰 Add Money' : `📱 Pay ₹${parseFloat(amount || 0).toLocaleString('en-IN')}`}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2, fontWeight: 600 }}>{step === 1 ? 'Select or enter amount' : 'Pay via UPI'}</div>
            </div>
            <div onClick={onClose} style={{ width: 36, height: 36, background: '#fff8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: '#e8650a', fontWeight: 700, border: '1.5px solid #f5c99a' }}>✕</div>
          </div>

          {step === 1 && (
            <div style={{ padding: '0 22px' }}>
              <div className="op-label">Quick Amount</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
                {presets.map(p => (
                  <button key={p} onClick={() => setAmount(String(p))} style={{ padding: '14px 0', borderRadius: 14, cursor: 'pointer', fontWeight: 800, fontSize: 15, background: amount === String(p) ? 'linear-gradient(135deg,#e8650a,#f59420)' : '#fff', color: amount === String(p) ? '#fff' : '#1a1a1a', border: amount === String(p) ? 'none' : '1.5px solid #e8e0d4', boxShadow: amount === String(p) ? '0 4px 14px rgba(232,101,10,0.3)' : '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}>
                    ₹{p.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              <div className="op-label">Custom Amount</div>
              <div style={{ position: 'relative', marginBottom: 18 }}>
                <div style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 20, fontWeight: 900, color: '#e8650a' }}>₹</div>
                <input className="op-input" style={{ paddingLeft: 40, marginBottom: 0, fontSize: 20, fontWeight: 900 }} type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                {[{ l: 'Min Deposit', v: '₹100' }, { l: 'Max Deposit', v: '₹1,00,000' }].map((x, i) => (
                  <div key={i} style={{ flex: 1, background: '#fff8f0', borderRadius: 12, padding: '10px 14px', textAlign: 'center', border: '1.5px solid #f5c99a' }}>
                    <div style={{ fontSize: 10, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{x.l}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#e8650a', marginTop: 2 }}>{x.v}</div>
                  </div>
                ))}
              </div>
              {msg.text && <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 12, padding: '13px 16px', marginBottom: 18, color: '#dc2626', fontSize: 13, fontWeight: 700 }}>{msg.text}</div>}
              <button onClick={handleNext} className="op-btn">PROCEED TO PAY →</button>
              <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#aaa', fontWeight: 600 }}>⏰ Approval time: 0–5 hours</div>
            </div>
          )}

          {step === 2 && (
            <div style={{ padding: '0 22px' }}>
              <div style={{ background: '#fff8f0', border: '1.5px solid #f5c99a', borderRadius: 18, padding: '20px', textAlign: 'center', marginBottom: 22 }}>
                <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4, fontWeight: 700 }}>Pay Amount</div>
                <div style={{ color: '#e8650a', fontSize: 40, fontWeight: 900 }}>₹{parseFloat(amount).toLocaleString('en-IN')}</div>
              </div>
              {qrUrl && (
                <div style={{ textAlign: 'center', marginBottom: 22 }}>
                  <div style={{ background: '#fff', border: '2px solid #f5c99a', borderRadius: 22, display: 'inline-block', padding: 16, boxShadow: '0 4px 16px rgba(232,101,10,0.15)' }}>
                    <img src={qrUrl} alt="UPI QR" style={{ width: 210, height: 210, display: 'block' }} />
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: '#888', fontWeight: 600 }}>📷 Scan & Pay</div>
                </div>
              )}
              {upiId && (
                <div style={{ marginBottom: 20 }}>
                  <div className="op-label">UPI ID</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff8f0', border: '1.5px solid #f5c99a', borderRadius: 16, padding: '14px 16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 3 }}>Pay to</div>
                      <div style={{ fontSize: 17, fontWeight: 900, color: '#1a1a1a' }}>{upiId}</div>
                    </div>
                    <button onClick={copyUpi} style={{ padding: '11px 18px', background: upiCopied ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#e8650a,#f59420)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {upiCopied ? '✅ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                </div>
              )}
              <div style={{ background: '#fff8f0', borderRadius: 16, padding: '16px 18px', marginBottom: 20, border: '1.5px solid #f5c99a' }}>
                <div className="op-label" style={{ marginBottom: 14 }}>📋 Payment Steps</div>
                {[
                  { n: '1', t: 'Scan QR or copy UPI ID' },
                  { n: '2', t: `Pay ₹${parseFloat(amount).toLocaleString('en-IN')} from your UPI app` },
                  { n: '3', t: 'Note the Transaction Number / UTR' },
                  { n: '4', t: 'Upload screenshot & enter UTR below' },
                  { n: '5', t: 'Submit — WhatsApp notification sent automatically', highlight: true },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < 4 ? 12 : 0, padding: s.highlight ? '10px 12px' : 0, background: s.highlight ? 'rgba(37,211,102,0.08)' : 'transparent', borderRadius: s.highlight ? 12 : 0, border: s.highlight ? '1px solid rgba(37,211,102,0.3)' : 'none' }}>
                    <div style={{ width: 26, height: 26, background: s.highlight ? 'linear-gradient(135deg,#25D366,#128C7E)' : 'linear-gradient(135deg,#e8650a,#f59420)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 12, flexShrink: 0 }}>{s.n}</div>
                    <div style={{ fontSize: 13, color: s.highlight ? '#25D366' : '#444', fontWeight: s.highlight ? 800 : 600, paddingTop: 3 }}>{s.t}</div>
                  </div>
                ))}
              </div>

              {/* Screenshot Upload */}
              <div style={{ marginBottom: 20 }}>
                <div className="op-label">📸 Payment Screenshot</div>
                {!screenshotPreview ? (
                  <div onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ background: '#fff8f0', border: '2px dashed #f5c99a', borderRadius: 16, padding: '28px 20px', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
                    <div style={{ color: '#e8650a', fontWeight: 800, fontSize: 15, marginBottom: 6 }}>Upload Payment Screenshot</div>
                    <div style={{ color: '#aaa', fontSize: 12, fontWeight: 600 }}>Tap to select image (JPG, PNG · Max 5MB)</div>
                    <div style={{ marginTop: 14, display: 'inline-block', background: 'linear-gradient(135deg,#e8650a,#f59420)', color: '#fff', fontWeight: 800, fontSize: 13, padding: '10px 24px', borderRadius: 25 }}>Choose File</div>
                  </div>
                ) : (
                  <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '2px solid #f5c99a' }}>
                    <img src={screenshotPreview} alt="Payment screenshot" style={{ width: '100%', maxHeight: 260, objectFit: 'contain', background: '#fff', display: 'block' }} />
                    <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 8 }}>
                      <button onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #f5c99a', borderRadius: 8, padding: '6px 12px', color: '#e8650a', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>🔄 Change</button>
                      <button onClick={removeScreenshot} style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '6px 12px', color: '#dc2626', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>✕ Remove</button>
                    </div>
                    <div style={{ padding: '10px 14px', background: 'rgba(22,163,74,0.08)', borderTop: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>✅</span>
                      <span style={{ color: '#16a34a', fontWeight: 800, fontSize: 13 }}>Screenshot attached</span>
                      <span style={{ color: '#aaa', fontSize: 11, marginLeft: 'auto' }}>{screenshot?.name}</span>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleScreenshotChange} />
              </div>

              <div className="op-label">Transaction Number / UTR *</div>
              <input className="op-input" placeholder="12-digit transaction number" value={utr} onChange={e => setUtr(e.target.value)} maxLength={20} />
              <div style={{ background: '#fff8f0', borderRadius: 12, padding: '12px 14px', marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 6, border: '1.5px solid #f5c99a' }}>
                <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>✅ Pay, then enter UTR & submit</div>
                <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 700 }}>⏰ Approval: 0–5 hours</div>
                <div style={{ fontSize: 12, color: '#25D366', fontWeight: 700 }}>💬 WhatsApp notification sent automatically on submit</div>
              </div>
              {msg.text && <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 12, padding: '13px 16px', marginBottom: 18, color: '#dc2626', fontSize: 13, fontWeight: 700 }}>{msg.text}</div>}
              <button onClick={handleSubmitUTR} disabled={loading} className="op-btn" style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 12 }}>
                {loading ? '⏳ Submitting...' : '✅ SUBMIT & NOTIFY ADMIN'}
              </button>
              <button onClick={() => { setStep(1); setMsg({ type: '', text: '' }); }} style={{ width: '100%', padding: '14px', background: 'transparent', border: '1.5px solid #e8e0d4', borderRadius: 14, color: '#888', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>← Change Amount</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── MY BIDS PAGE ──
export function BidsPage({ apiCall }) {
  const [bids, setBids] = useState([]);
  const [summary, setSummary] = useState({ total_bids: 0, won_bids: 0, lost_bids: 0, pending_bids: 0, total_win_amount: 0 });
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (apiCall) {
      apiCall('/api/games/bids/my?limit=500').then(res => {
        if (res.success) { if (res.bids) setBids(res.bids); if (res.summary) setSummary(res.summary); }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [apiCall]);

  const statCards = [
    { icon: '🎯', val: summary.total_bids || 0,   label: 'Total Bids', color: '#e8650a',  border: '#e8650a' },
    { icon: '🏆', val: summary.won_bids || 0,     label: 'Won',        color: '#16a34a',  border: '#16a34a' },
    { icon: '💔', val: summary.lost_bids || 0,    label: 'Lost',       color: '#dc2626',  border: '#dc2626' },
    { icon: '⏳', val: summary.pending_bids || 0, label: 'Pending',    color: '#d97706',  border: '#d97706' },
  ];

  const filteredBids = bids.filter(b => {
    if (filterDate) { const bidDate = new Date(b.created_at).toLocaleDateString('en-CA'); if (bidDate !== filterDate) return false; }
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    return true;
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="op-page">
      <style>{commonStyles}</style>
      <SubHeader title="🎯 My Bids" />

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 12px 0' }}>
        {statCards.map((s, i) => (
          <div key={i} className="op-stat-card" style={{ borderTop: `3px solid ${s.border}` }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2, fontWeight: 700 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Total Winnings */}
      <div style={{ margin: '10px 12px 0', background: '#fff8f0', border: '1.5px solid #f5c99a', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#e8650a', fontWeight: 800, fontSize: 14 }}>💰 Total Winnings</span>
        <span style={{ color: '#16a34a', fontWeight: 900, fontSize: 18 }}>₹{Number(summary.total_win_amount || 0).toLocaleString('en-IN')}</span>
      </div>

      {/* Date Filter */}
      <div style={{ padding: '14px 12px 0' }}>
        <div className="op-label">📅 Date Filter</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input type="date" value={filterDate} max={today} onChange={e => setFilterDate(e.target.value)} style={{ flex: 1, background: '#fff8f0', border: '1.5px solid #f5c99a', borderRadius: 10, padding: '10px 12px', color: '#1a1a1a', fontSize: 14, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }} />
          {filterDate && <button onClick={() => setFilterDate('')} style={{ padding: '10px 14px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, color: '#dc2626', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>✕ Clear</button>}
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          {[['all', 'All'], ['pending', '⏳ Pending'], ['win', '🏆 Won'], ['loss', '💔 Lost']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterStatus(val)} className={filterStatus === val ? 'op-filter-btn-active' : 'op-filter-btn'} style={{ flex: 1, fontSize: 11 }}>{label}</button>
          ))}
        </div>
      </div>

      <div className="op-section-title">🎮 {filterDate ? 'Filtered' : 'Recent'} Bids <span style={{ color: '#aaa', fontWeight: 600, fontSize: 11 }}>{filteredBids.length} bids</span></div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50, color: '#e8650a', fontWeight: 700 }}>⏳ Loading bids...</div>
      ) : filteredBids.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, color: '#888' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{filterDate ? 'No bids on this date' : 'No bids yet'}</div>
        </div>
      ) : (
        <div style={{ padding: '0 12px' }}>
          {filteredBids.map(b => {
            const amount = Number(b.amount || 0);
            const winning = Number(b.win_amount || b.potential_winning || 0);
            const clr = b.status === 'win' ? '#16a34a' : b.status === 'loss' ? '#dc2626' : '#d97706';
            const badgeColor = b.status === 'win' ? 'green' : b.status === 'loss' ? 'red' : 'blue';
            return (
              <div key={b.id} className="op-list-item" style={{ borderLeft: `4px solid ${clr}` }}>
                <div style={{ width: 40, height: 40, background: '#fff8f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, border: '1.5px solid #f5c99a' }}>🎯</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.game_name} — {b.game_type}</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 3 }}>#{b.number} · <span style={{ background: b.session === 'open' ? 'rgba(232,101,10,0.1)' : 'rgba(0,0,0,0.05)', color: b.session === 'open' ? '#e8650a' : '#888', fontWeight: 800, padding: '2px 7px', borderRadius: 6, fontSize: 10, textTransform: 'uppercase' }}>{b.session || 'N/A'}</span> · {(() => { try { let str = String(b.created_at); if (!str.includes('T') && str.includes(' ')) str = str.replace(' ', 'T') + 'Z'; return new Date(str).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }); } catch(e) { return b.created_at; } })()}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 15, color: clr, marginBottom: 4 }}>{b.status === 'win' ? `+₹${winning.toLocaleString('en-IN')}` : `₹${amount.toLocaleString('en-IN')}`}</div>
                  {makeBadge(badgeColor, b.status?.toUpperCase())}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── TRANSACTIONS PAGE ──
export function TxnsPage({ apiCall, navigate }) {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => { fetchTxns(); }, []);

  const fetchTxns = async () => {
    setLoading(true); setError('');
    try {
      const res = await apiCall('/api/wallet/transactions');
      const list = res?.transactions || res?.data || res || [];
      setTxns(Array.isArray(list) ? list : []);
    } catch { setError('Transactions could not be loaded. Please try again.'); }
    finally { setLoading(false); }
  };

  const typeLabel = (type) => ({ deposit: '💰 Deposit', withdrawal: '🏦 Withdrawal', withdraw: '🏦 Withdrawal', bid: '🎯 Bid', winning: '🏆 Winning', win: '🏆 Winning', refund: '↩️ Refund', bonus: '🎁 Bonus', referral: '🤝 Referral Bonus', credit: '⬆️ Credit', debit: '⬇️ Debit' })[type?.toLowerCase()] || `📋 ${type || 'Transaction'}`;

  const isCredit = (tx) => { if (tx.type === 'credit') return true; if (tx.type === 'debit') return false; return ['deposit', 'winning', 'win', 'refund', 'bonus', 'referral'].includes(tx.type?.toLowerCase()); };

  const filtered = txns.filter(t => {
    if (filter !== 'all') { if (filter === 'credit' && !isCredit(t)) return false; if (filter === 'debit' && isCredit(t)) return false; }
    if (filterDate) { const txDate = new Date(t.created_at).toLocaleDateString('en-CA'); if (txDate !== filterDate) return false; }
    return true;
  });

  const totalCredit = txns.filter(t => isCredit(t)).reduce((a, t) => a + Math.abs(Number(t.amount || 0)), 0);
  const totalDebit  = txns.filter(t => !isCredit(t)).reduce((a, t) => a + Math.abs(Number(t.amount || 0)), 0);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="op-page">
      <style>{commonStyles}</style>
      <SubHeader title="💳 Transactions" onBack={navigate ? () => navigate('wallet') : null}
        rightBtn={<button onClick={fetchTxns} style={{ background: '#fff8f0', border: '1.5px solid #f5c99a', color: '#e8650a', padding: '8px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>🔄</button>}
      />

      {!loading && txns.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 12px 0' }}>
          <div className="op-stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontWeight: 700 }}>Total Credit</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#16a34a' }}>+₹{totalCredit.toLocaleString('en-IN')}</div>
          </div>
          <div className="op-stat-card" style={{ borderLeft: '4px solid #dc2626' }}>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontWeight: 700 }}>Total Debit</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#dc2626' }}>-₹{totalDebit.toLocaleString('en-IN')}</div>
          </div>
        </div>
      )}

      <div style={{ padding: '14px 12px 0' }}>
        <div className="op-label">📅 Date Filter</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input type="date" value={filterDate} max={today} onChange={e => setFilterDate(e.target.value)} style={{ flex: 1, background: '#fff8f0', border: '1.5px solid #f5c99a', borderRadius: 10, padding: '10px 12px', color: '#1a1a1a', fontSize: 14, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }} />
          {filterDate && <button onClick={() => setFilterDate('')} style={{ padding: '10px 14px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, color: '#dc2626', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>✕ Clear</button>}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[['all', 'All'], ['credit', 'Credit ⬆️'], ['debit', 'Debit ⬇️']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} className={filter === val ? 'op-filter-btn-active' : 'op-filter-btn'} style={{ flex: 1 }}>{label}</button>
          ))}
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: '#e8650a', fontWeight: 700 }}>⏳ Loading...</div>}
      {!loading && error && <div style={{ textAlign: 'center', padding: 40, color: '#dc2626' }}>{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{filterDate ? 'No transactions on this date' : 'No transactions found'}</div>
        </div>
      )}
      <div style={{ padding: '0 12px' }}>
        {filtered.map((tx, i) => {
          const credit = isCredit(tx);
          const amount = Math.abs(Number(tx.amount ?? tx.amt ?? 0));
          const balAfter = tx.balance_after ?? tx.closing_balance ?? null;
          return (
            <div key={tx.id || i} className="op-list-item" style={{ borderLeft: `4px solid ${credit ? '#16a34a' : '#dc2626'}` }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: credit ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{credit ? '⬆️' : '⬇️'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: '#1a1a1a', fontSize: 14, marginBottom: 3 }}>{typeLabel(tx.type)}</div>
                <div style={{ fontSize: 11, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || tx.note || '—'}</div>
                <div style={{ fontSize: 10, color: '#bbb', marginTop: 3 }}>{tx.created_at ? (() => { try { let str = String(tx.created_at); if (!str.includes('T') && str.includes(' ')) str = str.replace(' ', 'T') + 'Z'; else if (str.includes('T') && !str.includes('+') && !str.endsWith('Z')) str = str + 'Z'; return new Date(str).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }); } catch(e) { return tx.created_at; } })() : '—'}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: credit ? '#16a34a' : '#dc2626' }}>{credit ? '+' : '-'}₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                {balAfter !== null && <div style={{ fontSize: 10, color: '#aaa', marginTop: 3 }}>Bal: ₹{Number(balAfter).toLocaleString('en-IN')}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {!loading && filtered.length > 0 && <div style={{ textAlign: 'center', padding: '12px 0 24px', fontSize: 11, color: '#aaa' }}>{filtered.length} transactions</div>}
    </div>
  );
}

// ── REFERRAL PAGE ──
export function ReferralPage({ apiCall, user, onBack }) {
  const [referralData, setReferralData] = useState({ referral_code: '', total_referrals: 0, pending_bonus: 0, total_earned: 0, referrals: [] });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [siteUrl, setSiteUrl] = useState(window.location.origin);

  useEffect(() => {
    if (!apiCall) return;
    apiCall('/api/admin/settings').then(res => { if (res?.success && res?.settings?.site_url) setSiteUrl(res.settings.site_url.replace(/\/$/, '')); }).catch(() => {});
    apiCall('/api/auth/referral-stats').then(res => { if (res?.success) setReferralData(res.data || {}); setLoading(false); }).catch(() => setLoading(false));
  }, [apiCall]);

  const referralCode = referralData.referral_code || user?.referral_code || '';
  const referralLink = `${siteUrl}?ref=${referralCode}`;

  const copyCode = () => { navigator.clipboard.writeText(referralCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  const shareLink = () => { if (navigator.share) { navigator.share({ title: 'MatkaKing — Join & Win!', text: `Join MatkaKing! Use my referral code: ${referralCode} and we both get ₹50 bonus! 🎉`, url: referralLink }); } else { navigator.clipboard.writeText(referralLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); } };

  return (
    <div className="op-page">
      <style>{commonStyles}</style>
      <SubHeader title="🎁 Refer & Earn" onBack={onBack} />

      <div style={{ background: 'linear-gradient(135deg, #e8650a, #f59420)', margin: '16px 12px', borderRadius: 20, padding: '24px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(232,101,10,0.3)' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎁</div>
        <div style={{ color: '#fff', fontWeight: 900, fontSize: 22, marginBottom: 6 }}>Both Get ₹50 Bonus!</div>
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.6, fontWeight: 600 }}>Share your referral code.<br />Both get ₹50 on their first deposit ✅</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.25)' }}>
          {[{ val: referralData.total_referrals || 0, label: 'Total Referrals' }, { val: `₹${Number(referralData.total_earned || 0).toLocaleString('en-IN')}`, label: 'Total Earned' }, { val: `₹${Number(referralData.pending_bonus || 0).toLocaleString('en-IN')}`, label: 'Pending' }].map((s, i, arr) => (
            <React.Fragment key={i}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{s.val}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4, fontWeight: 700 }}>{s.label}</div>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, background: 'rgba(255,255,255,0.3)' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="op-card">
        <div className="op-label">🔑 Your Referral Code</div>
        <div style={{ background: '#fff8f0', borderRadius: 14, padding: '18px', textAlign: 'center', border: '2px dashed #f5c99a', marginBottom: 14 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#e8650a', letterSpacing: 4 }}>
            {loading ? <span style={{ fontSize: 14, color: '#aaa' }}>⏳ Loading...</span> : referralCode || <span style={{ fontSize: 13, color: '#dc2626' }}>❌ Code not found — please re-login</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={copyCode} style={{ flex: 1, padding: '14px', background: copied ? 'rgba(22,163,74,0.08)' : '#fff8f0', border: `1.5px solid ${copied ? '#16a34a' : '#f5c99a'}`, borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', color: copied ? '#16a34a' : '#e8650a', transition: 'all 0.2s' }}>
            {copied ? '✅ Copied!' : '📋 Copy Code'}
          </button>
          <button onClick={shareLink} className="op-btn" style={{ flex: 1, padding: '14px', width: 'auto', borderRadius: 12 }}>🔗 Share Link</button>
        </div>
      </div>

      <div style={{ margin: '0 12px 12px', background: '#fff', borderRadius: 16, border: '1.5px solid #e8e0d4', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '14px 16px', background: '#fff8f0', borderBottom: '1px solid #f5c99a' }} className="op-label">📋 How It Works</div>
        {[{ n: '1', t: 'Share Your Code', d: 'Send your referral code or link to friends' }, { n: '2', t: 'Friend Joins', d: 'They use your code during registration' }, { n: '3', t: 'First Deposit', d: 'Friend makes their first deposit (admin approved)' }, { n: '4', t: 'Both Get ₹50', d: 'You and your friend both get ₹50 wallet credit!' }].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < 3 ? '1px solid #f0ebe0' : 'none' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#e8650a,#f59420)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{s.n}</div>
            <div>
              <div style={{ fontWeight: 800, color: '#1a1a1a', fontSize: 14 }}>{s.t}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>

      {!loading && referralData.referrals && referralData.referrals.length > 0 && (
        <div style={{ margin: '0 12px' }}>
          <div className="op-section-title">👥 My Referrals</div>
          {referralData.referrals.map((r, i) => (
            <div key={i} className="op-list-item" style={{ borderLeft: `4px solid ${r.status === 'credited' ? '#16a34a' : '#d97706'}` }}>
              <div style={{ width: 40, height: 40, background: '#fff8f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1.5px solid #f5c99a' }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: '#1a1a1a', fontSize: 14 }}>{r.joiner_name || 'User'}</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: r.status === 'credited' ? '#16a34a' : '#d97706' }}>₹{Number(r.bonus_amount || 50).toLocaleString('en-IN')}</div>
                {makeBadge(r.status === 'credited' ? 'green' : 'blue', r.status === 'credited' ? 'CREDITED' : 'PENDING')}
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && (!referralData.referrals || referralData.referrals.length === 0) && (
        <div style={{ textAlign: 'center', padding: '30px 20px', color: '#888' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>👥</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>No referrals yet</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Share your code and earn ₹50!</div>
        </div>
      )}
    </div>
  );
}

// ── WALLET PAGE ──
export function WalletPage({ wallet, onAdd, onWith, user, navigate, apiCall }) {
  const [stats, setStats] = useState({ highest_win: 0, total_bids: 0, games_won: 0, avg_bid: 0 });
  const [showDeposit, setShowDeposit] = useState(false);
  const [walletStats, setWalletStats] = useState({ total_deposited: 0, total_won: 0, total_withdrawn: 0 });

  useEffect(() => {
    if (apiCall) {
      apiCall('/api/auth/profile').then(res => { if (res?.success && res?.user) setStats({ highest_win: res.user.highest_win || 0, total_bids: res.user.total_bids || 0, games_won: res.user.games_won || 0, avg_bid: res.user.avg_bid || 0 }); }).catch(() => {});
      apiCall('/api/wallet/balance').then(res => { if (res?.success) setWalletStats({ total_deposited: res.total_deposited || 0, total_won: res.total_won || 0, total_withdrawn: res.total_withdrawn || 0 }); }).catch(() => {});
    }
  }, [apiCall]);

  return (
    <div className="op-page">
      <style>{commonStyles}</style>
      <SubHeader title="💰 My Wallet" />
      {showDeposit && <DepositModal apiCall={apiCall} onClose={() => setShowDeposit(false)} onSuccess={() => { onAdd && onAdd(); }} />}

      <div style={{ background: 'linear-gradient(135deg, #e8650a, #f59420)', padding: '28px 20px', textAlign: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, boxShadow: '0 4px 20px rgba(232,101,10,0.3)', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Total Balance</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', marginBottom: 20, letterSpacing: -1 }}>₹{wallet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => setShowDeposit(true)} style={{ flex: 1, maxWidth: 150, background: '#fff', color: '#e8650a', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 900, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textTransform: 'uppercase', letterSpacing: 1 }}>💰 ADD MONEY</button>
          <button onClick={onWith} style={{ flex: 1, maxWidth: 150, background: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 20, padding: '12px 0', fontWeight: 900, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>💸 WITHDRAW</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.25)', marginTop: 24, paddingTop: 16 }}>
          {[{ label: 'Total Added', val: '₹' + Number(walletStats.total_deposited || 0).toLocaleString('en-IN') }, { label: 'Total Won', val: '₹' + Number(walletStats.total_won || 0).toLocaleString('en-IN') }, { label: 'Withdrawn', val: '₹' + Number(walletStats.total_withdrawn || 0).toLocaleString('en-IN') }].map((s, i, arr) => (
            <React.Fragment key={i}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{s.val}</div>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, background: 'rgba(255,255,255,0.3)' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', margin: '0 12px 16px', borderRadius: 16, border: '1.5px solid #e8e0d4', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        {[
          { ic: '💰', l: 'Add Fund',           sub: 'UPI, Net Banking, Cards',  fn: () => setShowDeposit(true) },
          { ic: '💸', l: 'Withdraw Fund',       sub: 'Bank Transfer, UPI',       fn: onWith },
          { ic: '📋', l: 'Transaction History', sub: 'All credits & debits',     fn: () => navigate && navigate('txns') },
          { ic: '🎁', l: 'Refer & Earn',        sub: 'Both get ₹50 bonus on first deposit', fn: () => navigate && navigate('referral') },
        ].map((item, i) => (
          <div key={i} className="op-menu-item" onClick={item.fn} style={{ borderBottom: i < 3 ? '1px solid #f0ebe0' : 'none' }}>
            <div className="op-menu-icon">{item.ic}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: '#1a1a1a', fontSize: 15 }}>{item.l}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 3 }}>{item.sub}</div>
            </div>
            <div style={{ color: '#e8650a', fontSize: 24 }}>›</div>
          </div>
        ))}
      </div>

      <div className="op-section-title">📈 Your Stats</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 12px' }}>
        {[
          { val: '₹' + Number(stats.highest_win).toLocaleString('en-IN'), label: 'HIGHEST WIN', color: '#16a34a' },
          { val: String(stats.total_bids),                                  label: 'TOTAL BIDS',  color: '#e8650a' },
          { val: String(stats.games_won),                                   label: 'GAMES WON',   color: '#16a34a' },
          { val: '₹' + Number(stats.avg_bid).toLocaleString('en-IN'),       label: 'AVG BID',     color: '#e8650a' },
        ].map((s, i) => (
          <div key={i} className="op-stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 8, fontWeight: 700 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── HOW TO PLAY ──
export function HowToPlayPage({ onBack }) {
  return (
    <div className="op-page">
      <style>{commonStyles}</style>
      <SubHeader title="📖 How to Play" onBack={onBack} />
      <div style={{ padding: '0 12px 20px' }}>
        <div style={{ fontSize: 14, color: '#666', padding: '16px 4px', lineHeight: 1.6, fontWeight: 500 }}>Matka is a number guessing game. Place bets on open and close numbers and win!</div>
        {[
          { n: '1', t: 'Add Money to Wallet',     d: 'Deposit via UPI. Admin approves within 0–5 hours.' },
          { n: '2', t: 'Choose a Game',            d: 'Pick any open game from the home screen — Kalyan, Milan Day, etc.' },
          { n: '3', t: 'Choose Game Type',         d: 'Single Digit, Jodi, Pana, Sangam — pick your preferred type.' },
          { n: '4', t: 'Enter Number & Amount',    d: 'Pick your lucky number and bid amount. Minimum ₹10.' },
          { n: '5', t: 'Place Bid',                d: 'Tap Place Bid. Amount is instantly deducted from your wallet.' },
          { n: '6', t: 'Wait for Result',          d: 'Winnings are credited to your winning balance after result declaration.' },
        ].map((s, i) => (
          <div key={i} className="op-list-item" style={{ marginBottom: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#e8650a,#f59420)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16, flexShrink: 0 }}>{s.n}</div>
            <div>
              <div style={{ fontWeight: 800, color: '#e8650a', fontSize: 15, marginBottom: 4 }}>{s.t}</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{s.d}</div>
            </div>
          </div>
        ))}
        <div className="op-section-title">🎮 Multipliers</div>
        {[
          { type: 'Single Digit', mult: '9x' }, { type: 'Jodi', mult: '90x' }, { type: 'Single Pana', mult: '150x' },
          { type: 'Double Pana', mult: '300x' }, { type: 'Triple Pana', mult: '600x' }, { type: 'Half Sangam', mult: '1500x' }, { type: 'Full Sangam', mult: '10000x' },
        ].map((g, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 8, border: '1.5px solid #e8e0d4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: 15 }}>{g.type}</div>
            <div style={{ fontWeight: 900, fontSize: 18, color: '#e8650a' }}>{g.mult}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FAQ ──
export function FAQPage({ onBack }) {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: 'How do I create an account?', a: 'Tap "Register" on the login page. Sign up with your mobile number and password.' },
    { q: 'How do I add money?', a: 'Go to Wallet → Add Money → Pay via UPI → Submit UTR. Admin approves within 0–5 hours.' },
    { q: 'What is the minimum deposit?', a: 'Minimum deposit is ₹100. Maximum is ₹1,00,000.' },
    { q: 'How do I withdraw winnings?', a: 'Winning Balance → Withdraw → Enter UPI or bank details → Admin will approve. Min ₹500.' },
    { q: 'When are results declared?', a: 'Each game has its own result time, visible on the game card.' },
    { q: 'Can I cancel a bid?', a: 'No. Once a bid is placed, it cannot be cancelled.' },
    { q: 'Can I have multiple accounts?', a: 'No. Only one account is allowed per mobile number.' },
    { q: 'When is referral bonus credited?', a: 'When your referral makes their first deposit and admin approves — both get ₹50 instantly.' },
    { q: 'What if I have a problem?', a: 'Go to the Support page and contact us via WhatsApp or Telegram. Mon–Sat, 10AM–8PM.' },
  ];
  return (
    <div className="op-page">
      <style>{commonStyles}</style>
      <SubHeader title="❓ FAQ" onBack={onBack} />
      <div style={{ padding: '16px 12px' }}>
        {faqs.map((f, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 10, border: `1.5px solid ${open === i ? '#e8650a' : '#e8e0d4'}`, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: open === i ? '4px solid #e8650a' : '1.5px solid #e8e0d4', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, color: '#1a1a1a', flex: 1, paddingRight: 10, fontSize: 14, lineHeight: 1.4 }}>{f.q}</div>
              <div style={{ color: '#e8650a', fontSize: 22, fontWeight: 700, width: 24, textAlign: 'center' }}>{open === i ? '−' : '+'}</div>
            </div>
            {open === i && <div style={{ fontSize: 13, color: '#666', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0ebe0', lineHeight: 1.6 }}>{f.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TERMS ──
export function TermsPage({ onBack }) {
  const items = [
    { t: '1. Eligibility', d: 'Only users 18+ may use this platform. Accounts of minors will be permanently closed.' },
    { t: '2. Account Rules', d: 'One account per user. Fake information may result in a permanent ban.' },
    { t: '3. Deposits', d: 'Deposits accepted via UPI and Bank Transfer only. Minimum deposit is ₹100.' },
    { t: '4. Withdrawals', d: 'Withdrawals are only from winning balance. Minimum ₹500 required. Admin approval needed.' },
    { t: '5. Gameplay', d: 'Bids cannot be cancelled after placement. Cheating results in a permanent ban.' },
    { t: '6. Responsible Gaming', d: 'Play within your financial limits. Contact support if you experience gambling-related issues.' },
    { t: '7. Liability', d: 'We are not responsible for losses due to technical issues or server downtime.' },
    { t: '8. Account Termination', d: 'Accounts may be closed for rule violations. Remaining balance will be refunded.' },
  ];
  return (
    <div className="op-page">
      <style>{commonStyles}</style>
      <SubHeader title="📜 Terms & Conditions" onBack={onBack} />
      <div style={{ padding: '16px 12px' }}>
        {items.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 10, border: '1.5px solid #e8e0d4', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 800, color: '#e8650a', fontSize: 14, marginBottom: 6 }}>{s.t}</div>
            <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{s.d}</div>
          </div>
        ))}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 16, fontWeight: 600 }}>By using MatkaKing, you agree to these terms.</p>
      </div>
    </div>
  );
}

// ── PRIVACY ──
export function PrivacyPage({ onBack }) {
  const items = [
    { t: '📱 What Data Do We Collect?', d: 'Mobile number, name, device info, and transaction history. No card numbers or banking passwords are stored.' },
    { t: '🔐 How Is Data Secured?', d: 'Your data is stored on encrypted servers. Authentication is secured via JWT tokens.' },
    { t: '💳 Payment Information', d: 'UPI ID is used for withdrawals only. Bank details are stored in encrypted form.' },
    { t: '👤 Your Rights', d: 'You can request account and data deletion. Transaction history can be downloaded.' },
    { t: '📞 Contact', d: 'For any privacy-related queries, contact us via the Support page.' },
  ];
  return (
    <div className="op-page">
      <style>{commonStyles}</style>
      <SubHeader title="🔒 Privacy Policy" onBack={onBack} />
      <div style={{ padding: '16px 12px' }}>
        {items.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px', marginBottom: 10, border: '1.5px solid #e8e0d4', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 800, color: '#e8650a', fontSize: 14, marginBottom: 6 }}>{s.t}</div>
            <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SUPPORT & PROFILE PAGE ──
export function SupportPage({ apiCall, user }) {
  const [contacts, setContacts] = useState({ phone: '9999999999', telegram: 'matkaking_support' });
  const [profileForm, setProfileForm] = useState({ username: user?.name || '', oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!apiCall) return;
    apiCall('/api/admin/settings').then(d => { if (d?.success && d?.settings) setContacts({ phone: d.settings.phone || '9999999999', telegram: d.settings.telegram || 'matkaking_support' }); }).catch(() => {});
  }, [apiCall]);

  const updateProfile = async () => {
    setSuccessMsg(''); setErrorMsg('');
    if (!profileForm.username.trim()) { setErrorMsg('❌ Username is required!'); return; }
    setLoading(true);
    try {
      const profileRes = await apiCall('/api/auth/update-profile', 'PUT', { name: profileForm.username.trim() });
      if (!profileRes?.success) { setErrorMsg(profileRes?.message || '❌ Profile update failed'); setLoading(false); return; }
      if (profileForm.newPassword) {
        if (!profileForm.oldPassword) { setErrorMsg('❌ Current password is required'); setLoading(false); return; }
        if (profileForm.newPassword !== profileForm.confirmPassword) { setErrorMsg('❌ Passwords do not match'); setLoading(false); return; }
        const passRes = await apiCall('/api/auth/update-password', 'POST', { oldPassword: profileForm.oldPassword, newPassword: profileForm.newPassword });
        if (!passRes?.success) { setErrorMsg(passRes?.message || '❌ Password update failed'); setLoading(false); return; }
      }
      setSuccessMsg('✅ Profile updated successfully!');
      setProfileForm(p => ({ ...p, oldPassword: '', newPassword: '', confirmPassword: '' }));
    } catch { setErrorMsg('❌ Unable to connect to server.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="op-page">
      <style>{commonStyles}</style>
      <SubHeader title="👤 My Profile" />

      {/* Profile Card */}
      <div style={{ background: 'linear-gradient(135deg, #e8650a, #f59420)', margin: '16px 12px', borderRadius: 20, padding: '20px', boxShadow: '0 4px 20px rgba(232,101,10,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 70, height: 70, background: 'rgba(255,255,255,0.25)', border: '2.5px solid rgba(255,255,255,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{user?.name || 'User'}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, fontWeight: 600 }}>📱 {user?.mobile || '—'}</div>
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 11, color: '#fff', fontWeight: 800, letterSpacing: 1 }}>✅ Verified</div>
          </div>
        </div>
      </div>

      {user?.referral_code && (
        <div style={{ margin: '0 12px 12px', background: '#fff8f0', borderRadius: 16, border: '1.5px solid #f5c99a', padding: '16px' }}>
          <div className="op-label">🎁 Your Referral Code</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: 10, padding: '12px 14px', border: '2px dashed #f5c99a' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#e8650a', letterSpacing: 3 }}>{user.referral_code}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(user.referral_code); }} style={{ padding: '12px 16px', background: 'linear-gradient(135deg,#e8650a,#f59420)', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer', color: '#fff' }}>📋 Copy</button>
          </div>
        </div>
      )}

      {successMsg && <div style={{ margin: '0 12px 12px', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 10, padding: '12px', color: '#16a34a', fontSize: 13, fontWeight: 700 }}>{successMsg}</div>}
      {errorMsg   && <div style={{ margin: '0 12px 12px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '12px', color: '#dc2626', fontSize: 13, fontWeight: 700 }}>{errorMsg}</div>}

      {/* Support */}
      <div style={{ margin: '0 12px 12px', background: '#fff', borderRadius: 16, border: '1.5px solid #e8e0d4', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '14px 16px', background: '#fff8f0', borderBottom: '1px solid #f5c99a' }} className="op-label">🎧 Help & Support</div>
        <div className="op-menu-item" onClick={() => window.open(`https://wa.me/91${contacts.phone}`, '_blank')} style={{ borderBottom: '1px solid #f0ebe0' }}>
          <div className="op-menu-icon">💬</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: '#1a1a1a', fontSize: 15 }}>WhatsApp Support</div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>+91 {contacts.phone}</div>
          </div>
          <div style={{ color: '#e8650a', fontSize: 24 }}>›</div>
        </div>
        <div className="op-menu-item" onClick={() => window.open(`https://t.me/${contacts.telegram}`, '_blank')}>
          <div className="op-menu-icon">✈️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: '#1a1a1a', fontSize: 15 }}>Telegram Support</div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>Quick reply in 5 mins</div>
          </div>
          <div style={{ color: '#e8650a', fontSize: 24 }}>›</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '24px 0 16px', fontSize: 11, color: '#aaa', fontWeight: 600 }}>MatkaKing · Version 5.0.0 · 18+ Only</div>
    </div>
  );
}

// ── GAME RATES PAGE ──
export function GameRatesPage({ onBack }) {
  const mainRates = [
    { label: 'Single', rate: '1Rs ka 9.5Rs' }, { label: 'Jodi', rate: '1Rs ka 95Rs' },
    { label: 'Single Panna', rate: '1Rs ka 150Rs' }, { label: 'Double Panna', rate: '1Rs ka 300Rs' },
    { label: 'Triple Panna', rate: '1Rs ka 700Rs' }, { label: 'Half Sangam', rate: '1Rs ka 1000Rs' }, { label: 'Full Sangam', rate: '1Rs ka 10000Rs' },
  ];
  const starlineRates = [
    { label: 'Single', rate: '1Rs ka 9.5Rs' }, { label: 'Single Panna', rate: '1Rs ka 150Rs' },
    { label: 'Double Panna', rate: '1Rs ka 300Rs' }, { label: 'Triple Panna', rate: '1Rs ka 700Rs' },
  ];
  return (
    <div className="op-page">
      <style>{commonStyles}</style>
      <SubHeader title="🎰 Game Rates" onBack={onBack} />
      <div style={{ padding: '16px 12px' }}>
        <div style={{ background: 'linear-gradient(135deg, #e8650a, #f59420)', borderRadius: 16, padding: '20px', textAlign: 'center', marginBottom: 20, boxShadow: '0 4px 16px rgba(232,101,10,0.3)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 20, marginBottom: 4 }}>Game Rates</div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Best Main Market Game Rates</div>
        </div>
        <div className="op-section-title">🎯 Main Market Rates</div>
        {mainRates.map((g, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', marginBottom: 8, border: '1.5px solid #e8e0d4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #e8650a' }}>
            <div style={{ fontWeight: 800, color: '#1a1a1a', fontSize: 15 }}>{g.label}</div>
            <div style={{ fontWeight: 900, fontSize: 14, color: '#e8650a', background: '#fff8f0', padding: '6px 14px', borderRadius: 20, border: '1px solid #f5c99a' }}>{g.rate}</div>
          </div>
        ))}
        <div className="op-section-title">⭐ Starline Game Rates</div>
        {starlineRates.map((g, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', marginBottom: 8, border: '1.5px solid #e8e0d4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #f59420' }}>
            <div style={{ fontWeight: 800, color: '#1a1a1a', fontSize: 15 }}>{g.label}</div>
            <div style={{ fontWeight: 900, fontSize: 14, color: '#e8650a', background: '#fff8f0', padding: '6px 14px', borderRadius: 20, border: '1px solid #f5c99a' }}>{g.rate}</div>
          </div>
        ))}
        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 12, color: '#aaa', fontWeight: 600 }}>Best Starline Game Rates</div>
      </div>
    </div>
  );
}