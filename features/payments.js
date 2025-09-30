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
    res.status(200).json({ payload: { received: true, eventType: event.type } });
  } catch (err) {
    next(err);
  }
};

router.post('/', (req, res) => {
  res.status(300).send('WIP')
})

module.exports = { router, webhook };

