const express = require('express')
const router = express();
require('dotenv').config();

// Stripe webhook route - MUST be before express.json() middleware
router.post(
  "/payments/hook",
  express.raw({ type: "application/json" }),
  require("./features/payments").webhook
);

router.use(express.urlencoded({extended: false}));
router.use(express.json());

const paths = ['user', 'payments']

/* These routes will each be turned into microservices in the future */
paths.map(path => {
  const module = require(`./features/${path}`);
  router.use(`/${path.split('/')[0]}`, module.router || module);
})

router.get('/', (req, res) => {
  res.status(300).send('default route.')
})

router.listen(process.env.PORT);