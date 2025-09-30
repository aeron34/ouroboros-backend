const express = require('express')
const router = express();
require('dotenv').config();

const knx = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.host,
    user: process.env.user,
    port: process.env.db_port,
    password: process.env.password,
    database: process.env.database,
    ssl: { rejectUnauthorized: false }
  },
  pool: { min: 0, max: 10 } // Configure the pool size here
});

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