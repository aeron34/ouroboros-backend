const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(300).send('WIP')
})

module.exports = router;