const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

router.post('/check_number', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const url = `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(
      phoneNumber
    )}?Fields=line_type_intelligence`;

    const response = await fetch(url, {
      headers: {
        Authorization:
          'Basic ' + Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64'),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res
        .status(response.status)
        .json({ error: 'Twilio error', details: errorData });
    }

    const data = await response.json();
    const lineInfo = data.line_type_intelligence;

    if (!lineInfo) {
      return res.status(500).json({ error: 'No line type info returned' });
    }

    if (lineInfo.type === 'nonFixedVoip') {
      return res.status(400).json({
        message: 'Try a different number',
        carrier: lineInfo.carrier_name || 'Unknown Carrier',
      });
    }

    return res.status(200).json({
      message: `Good phone number (Carrier: ${lineInfo.carrier_name || 'Unknown'})`,
      type: lineInfo.type,
    });
  } catch (error) {
    console.error('Error checking number:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


