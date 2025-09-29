const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

const stripe = Stripe(`${process.env.stp_test_key}`);
const endpointSecret = `${process.env.stp_wbh_key}`;


router.post('/hook', (req, res) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  
  res.status(300).send('WIP')
})

router.post('/', (req, res) => {
  res.status(300).send('WIP')
})

module.exports = router;

