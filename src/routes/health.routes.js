const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'rapid-sentiment-analysis',
    environment: process.env.NODE_ENV
  });
});

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with component status
 * @access  Public
 */
router.get('/detailed', async (req, res) => {
  try {
    // This will be expanded to check database, Redis, and external API connections
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'rapid-sentiment-analysis',
      environment: process.env.NODE_ENV,
      components: {
        api: { status: 'ok' }
        // Other components will be added as they are implemented
      }
    };
    
    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error.message
    });
  }
});

module.exports = router;
