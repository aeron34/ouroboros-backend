const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

const stripe = Stripe(`${process.env.stp_live_key}`);
const endpointSecret = `${process.env.stp_hook_live}`;

const webhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    console.log('Received webhook event:', event.type);

    // Handle successful purchase events
    if (event.type === 'checkout.session.completed') {
      await handleSuccessfulPurchase(event.data.object);
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ payload: { received: true, eventType: event.type } });
  } catch (err) {
    next(err);
  }
};

// Handle successful purchase logic
async function handleSuccessfulPurchase(session) {
  console.log('✅ Purchase completed successfully!');
  console.log('Session ID:', session.id);
}


router.post('/', (req, res) => {
  res.status(300).send('WIP')
})

module.exports = { router, webhook }
