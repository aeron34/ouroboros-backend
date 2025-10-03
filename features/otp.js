const express = require('express');
const router = express.Router();
const twilio = require('twilio');

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!ACCOUNT_SID || !AUTH_TOKEN || !VERIFY_SERVICE_SID) {
  console.warn('[OTP] Missing Twilio env vars. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID');
}

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

const isE164 = s => typeof s === 'string' && /^\+\d{7,15}$/.test(s.trim());

router.post('/send', async (req, res) => {
  try {
    const raw = (req.body?.phoneNumber || '').trim();
    const channel = (req.body?.channel || 'sms').toLowerCase();

    if (!isE164(raw)) {
      return res.status(400).json({ error: 'Invalid phone number. Use E.164 like +15551234567.' });
    }
    if (!['sms', 'call'].includes(channel)) {
      return res.status(400).json({ error: 'Invalid channel. Use "sms" or "call".' });
    }
    if (!ACCOUNT_SID || !AUTH_TOKEN || !VERIFY_SERVICE_SID) {
      return res.status(500).json({ error: 'Server not configured for OTP.' });
    }

    const verification = await client.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verifications.create({ to: raw, channel });

    return res.status(200).json({ ok: true, to: raw, status: verification.status });
  } catch (err) {
    const status = err?.status || err?.statusCode || 400;
    if (status === 429) return res.status(503).json({ error: 'Rate limited. Try again shortly.' });
    if (status >= 500) return res.status(502).json({ error: 'Upstream provider error.' });
    return res.status(400).json({ error: 'Failed to send OTP.' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const raw = (req.body?.phoneNumber || '').trim();
    const code = (req.body?.code || '').toString().trim();

    if (!isE164(raw)) {
      return res.status(400).json({ error: 'Invalid phone number. Use E.164 like +15551234567.' });
    }
    if (!code) {
      return res.status(400).json({ error: 'OTP code is required.' });
    }
    if (!ACCOUNT_SID || !AUTH_TOKEN || !VERIFY_SERVICE_SID) {
      return res.status(500).json({ error: 'Server not configured for OTP.' });
    }

    const check = await client.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: raw, code });

    const ok = check.status === 'approved';
    return res.status(200).json({ ok, to: raw, status: check.status });
  } catch (err) {
    const status = err?.status || err?.statusCode || 400;
    if (status === 429) return res.status(503).json({ error: 'Rate limited. Try again shortly.' });
    if (status >= 500) return res.status(502).json({ error: 'Upstream provider error.' });
    return res.status(400).json({ error: 'Invalid or expired OTP.' });
  }
});

module.exports = router;



