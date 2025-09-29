const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

const stripe = Stripe(`${process.env.stp_live_key}`);
const endpointSecret = `${process.env.stp_hook_live}`;

// This is your Stripe CLI webhook secret for testing your endpoint locally.

router.post('/hook', express.raw({type: 'application/json'}),  async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  
  response.send();
})

router.post('/', (req, res) => {
  res.status(300).send('WIP')
})

module.exports = router;

