const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('login');
});

// router.get('/chatroom', (req, res) => {
//   res.render('chatroom');
// });

module.exports = router;
