const express = require('express');
const router = express.Router();
const path = require('path');

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  router.use(express.static(path.join(__dirname, '../../client/build')));

  // Any route that is not an API route will be redirected to index.html
  router.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'));
  });
}

module.exports = router;
