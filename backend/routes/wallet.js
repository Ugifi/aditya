const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
require('dotenv').config();

// Multer config for payment proof uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `dep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// ─── GET BALANCE ──────────────────────────────────────────────────────────────
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT wallet_balance, winning_balance FROM users WHERE id = ?',
      [req.user.id]
    );

    // Total deposited (approved deposits only)
    const [deposited] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM deposit_requests WHERE user_id = ? AND type = 'deposit' AND status = 'approved'",
      [req.user.id]
    );

    // Total won (from transactions)
    const [won] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'credit' AND wallet_type = 'winning_wallet'",
      [req.user.id]
    );

    // Total withdrawn (approved withdrawals)
    const [withdrawn] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM deposit_requests WHERE user_id = ? AND type = 'withdrawal' AND status = 'approved'",
      [req.user.id]
    );

    res.json({
      success: true,
      wallet_balance: parseFloat(rows[0].wallet_balance),
      winning_balance: parseFloat(rows[0].winning_balance),
      total: parseFloat(rows[0].wallet_balance) + parseFloat(rows[0].winning_balance),
      total_deposited: parseFloat(deposited[0].total),
      total_won: parseFloat(won[0].total),
      total_withdrawn: parseFloat(withdrawn[0].total)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── DEPOSIT REQUEST ──────────────────────────────────────────────────────────
const uploadOptional = (req, res, next) => {
  upload.single('payment_proof')(req, res, (err) => { next(); });
};

router.post('/deposit', authMiddleware, uploadOptional, [
  body('amount').isFloat({ min: 1 }).withMessage('Valid amount required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const amount = parseFloat(req.body.amount);
  const utr = req.body.utr || req.body.transaction_id || req.body.utr_number || null;
  const minDeposit = parseFloat(process.env.MIN_DEPOSIT || 100);

  if (amount < minDeposit) {
    return res.status(400).json({ success: false, message: `Minimum deposit ₹${minDeposit}` });
  }

  const payment_proof = req.file ? req.file.filename : null;

  try {
    // Get payment settings
    const [settings] = await db.query("SELECT setting_value FROM site_settings WHERE setting_key = 'upi_id'");
    const upi_id = settings.length ? settings[0].setting_value : 'N/A';

    const [result] = await db.query(
      'INSERT INTO deposit_requests (user_id, amount, payment_proof, utr_number, status) VALUES (?, ?, ?, ?, "pending")',
      [req.user.id, amount, payment_proof, utr]
    );

    res.status(201).json({
      success: true,
      message: 'Deposit request submitted. Admin will approve shortly.',
      request_id: result.insertId,
      upi_id
    });
  } catch (err) {
    console.error('Deposit error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── WITHDRAWAL REQUEST ───────────────────────────────────────────────────────
router.post('/withdraw', authMiddleware, [
  body('amount').isFloat({ min: 1 }).withMessage('Valid amount required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const amount = parseFloat(req.body.amount);
  const { upi_id, bank_name, account_number, ifsc } = req.body;

  const minWithdraw = parseFloat(process.env.MIN_WITHDRAWAL || 500);
  const maxWithdraw = parseFloat(process.env.MAX_WITHDRAWAL || 50000);

  if (amount < minWithdraw) return res.status(400).json({ success: false, message: `Minimum withdrawal ₹${minWithdraw}` });
  if (amount > maxWithdraw) return res.status(400).json({ success: false, message: `Maximum withdrawal ₹${maxWithdraw}` });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Lock user row
    const [rows] = await conn.query('SELECT winning_balance FROM users WHERE id = ? FOR UPDATE', [req.user.id]);
    const winBalance = parseFloat(rows[0].winning_balance);

    if (winBalance < amount) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: `Insufficient winning balance. Available: ₹${winBalance}` });
    }

    // Check pending withdrawal — DISABLED (multiple withdrawals allowed)
    // const [pending] = await conn.query(
    //   "SELECT id FROM deposit_requests WHERE user_id = ? AND type = 'withdrawal' AND status = 'pending'",
    //   [req.user.id]
    // );
    // if (pending.length) {
    //   await conn.rollback();
    //   return res.status(400).json({ success: false, message: 'You already have a pending withdrawal request' });
    // }

    // Deduct winning balance
    await conn.query('UPDATE users SET winning_balance = winning_balance - ? WHERE id = ?', [amount, req.user.id]);

    // Create withdrawal request
    const [result] = await conn.query(
      'INSERT INTO deposit_requests (user_id, amount, type, upi_id, bank_name, account_number, ifsc_code, status) VALUES (?, ?, "withdrawal", ?, ?, ?, ?, "pending")',
      [req.user.id, amount, upi_id, bank_name || null, account_number || null, ifsc || null]
    );

    // Log transaction
    await conn.query(
      'INSERT INTO transactions (user_id, type, wallet_type, amount, description, reference_id) VALUES (?, "debit", "winning_wallet", ?, "Withdrawal Request", ?)',
      [req.user.id, amount, result.insertId]
    );

    await conn.commit();
    res.json({
      success: true,
      message: 'Withdrawal request submitted. Processing within 24 hours.',
      request_id: result.insertId
    });
  } catch (err) {
    await conn.rollback();
    console.error('Withdraw error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// ─── TRANSACTION HISTORY ──────────────────────────────────────────────────────
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT id, type, wallet_type, amount, description, status, created_at
       FROM transactions WHERE user_id = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );

    const [count] = await db.query('SELECT COUNT(*) as total FROM transactions WHERE user_id = ?', [req.user.id]);

    res.json({
      success: true,
      transactions: rows,
      pagination: { page, limit, total: count[0].total, pages: Math.ceil(count[0].total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── DEPOSIT/WITHDRAWAL HISTORY ───────────────────────────────────────────────
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const type = req.query.type || 'deposit'; // deposit or withdrawal
    const [rows] = await db.query(
      `SELECT id, amount, type, status, upi_id, utr_number, created_at, updated_at
       FROM deposit_requests WHERE user_id = ? AND type = ?
       ORDER BY created_at DESC LIMIT 50`,
      [req.user.id, type]
    );
    res.json({ success: true, requests: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const axios = require('axios');

// ─── WATCHPAYS CONFIG ─────────────────────────────────────────────────────────
const WATCHPAY_MERCHANT_ID = process.env.WATCHPAY_MERCHANT_ID || "100555454";
const WATCHPAY_API_KEY     = process.env.WATCHPAY_API_KEY     || "e7d999d3c5fba2902a0c17f360265170";
const WATCHPAY_API_URL     = "https://api.watchpays.com/v1/create";
const WATCHPAY_CALLBACK    = process.env.WATCHPAY_CALLBACK_URL || "https://yourdomain.com/api/wallet/watchpay/webhook";
const FRONTEND_URL         = process.env.FRONTEND_URL          || "https://yourdomain.com";

// ─── WATCHPAY: CREATE PAYMENT ─────────────────────────────────────────────────
// POST /api/wallet/watchpay/create
// Body: { amount: 500 }
router.post('/watchpay/create', authMiddleware, async (req, res) => {
  try {
    let amount = parseFloat(req.body.amount);
    const minDeposit = parseFloat(process.env.MIN_DEPOSIT || 100);

    if (!amount || amount < minDeposit) {
      return res.status(400).json({ success: false, message: `Minimum deposit ₹${minDeposit}` });
    }

    // Round amount fix: WatchPays exact 1000 multiples reject karta hai
    amount = parseFloat(amount.toFixed(2));
    if (amount % 1000 === 0 && amount > 0) {
      amount = parseFloat((amount - 1).toFixed(2));
    }

    const merchantOrderNo = "MK" + Date.now() + Math.floor(Math.random() * 9000 + 1000);
    const extra = "UID_" + req.user.id;

    // Signature banana
    const signParams = {
      amount:            String(amount),
      callback_url:      WATCHPAY_CALLBACK,
      merchant_id:       WATCHPAY_MERCHANT_ID,
      merchant_order_no: merchantOrderNo,
    };

    const sortedKeys = Object.keys(signParams).sort();
    let signStr = sortedKeys.map(k => `${k}=${signParams[k]}`).join("&");
    signStr += "&key=" + WATCHPAY_API_KEY;

    const crypto = require('crypto');
    const signature = crypto.createHash('md5').update(signStr).digest('hex');

    const payload = {
      merchant_id:       WATCHPAY_MERCHANT_ID,
      api_key:           WATCHPAY_API_KEY,
      amount:            String(amount),
      merchant_order_no: merchantOrderNo,
      callback_url:      WATCHPAY_CALLBACK,
      extra:             extra,
      signature:         signature,
    };

    // WatchPays API call
    const wpRes = await axios.post(WATCHPAY_API_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    const data = wpRes.data;

    if (data.success === true && data.payment_url) {
      // DB mein pending entry daalo
      const [userRows] = await db.query('SELECT mobile FROM users WHERE id = ?', [req.user.id]);
      const mobile = userRows[0]?.mobile || '';

      await db.query(
        `INSERT INTO deposit_requests 
          (user_id, amount, type, utr_number, status, payment_proof) 
         VALUES (?, ?, 'deposit', ?, 'pending', ?)`,
        [req.user.id, amount, merchantOrderNo, 'watchpay']
      );

      return res.json({
        success: true,
        payment_url: data.payment_url,
        order_id: merchantOrderNo,
      });
    } else {
      console.error('WatchPays error:', data);
      return res.status(502).json({ success: false, message: 'Payment gateway error. Try again.' });
    }

  } catch (err) {
    console.error('WatchPay create error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── WATCHPAY: WEBHOOK (Auto Balance Credit) ──────────────────────────────────
// POST /api/wallet/watchpay/webhook  ← WatchPays isko call karega
// GET  /api/wallet/watchpay/webhook  ← User redirect hoga payment ke baad
router.get('/watchpay/webhook', (req, res) => {
  // User payment ke baad yahan redirect hota hai
  res.redirect(`${FRONTEND_URL}/#/funds`);
});

router.post('/watchpay/webhook', async (req, res) => {
  const data = req.body;

  // Log karo
  console.log('[WatchPay Webhook]', JSON.stringify(data));

  try {
    const { orderNo, merchantOrder, status, amount } = data;

    if (status !== 'success') {
      return res.json({ status: 'acknowledged' });
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Order check karo
      const [rows] = await conn.query(
        `SELECT id, user_id, status FROM deposit_requests 
         WHERE utr_number = ? AND type = 'deposit' LIMIT 1`,
        [merchantOrder]
      );

      if (rows.length === 0) {
        console.log('[WatchPay] Order not found:', merchantOrder);
        await conn.rollback();
        return res.json({ status: 'acknowledged' });
      }

      const row = rows[0];

      // Already processed check
      if (row.status === 'approved') {
        console.log('[WatchPay] Already processed:', merchantOrder);
        await conn.rollback();
        return res.json({ status: 'acknowledged' });
      }

      // 1. Deposit request approve karo
      await conn.query(
        `UPDATE deposit_requests SET status = 'approved', updated_at = NOW() 
         WHERE id = ? AND status = 'pending'`,
        [row.id]
      );

      // 2. Wallet balance add karo
      await conn.query(
        'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
        [parseFloat(amount), row.user_id]
      );

      // 3. Transaction log
      await conn.query(
        `INSERT INTO transactions 
          (user_id, type, wallet_type, amount, description, reference_id, status) 
         VALUES (?, 'credit', 'deposit_wallet', ?, 'WatchPays Auto Deposit', ?, 'completed')`,
        [row.user_id, parseFloat(amount), row.id]
      );

      await conn.commit();
      console.log(`[WatchPay] SUCCESS: +${amount} credited to user ${row.user_id}`);

    } catch (err) {
      await conn.rollback();
      console.error('[WatchPay] DB Error:', err.message);
    } finally {
      conn.release();
    }

  } catch (err) {
    console.error('[WatchPay] Webhook error:', err.message);
  }

  res.json({ status: 'acknowledged' });
});


module.exports = router;
