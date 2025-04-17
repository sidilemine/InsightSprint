const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./auth.routes');
const projectRoutes = require('./project.routes');
const interviewRoutes = require('./interview.routes');
const responseRoutes = require('./response.routes');
const analysisRoutes = require('./analysis.routes');
const healthRoutes = require('./health.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/interviews', interviewRoutes);
router.use('/responses', responseRoutes);
router.use('/analyses', analysisRoutes);
router.use('/health', healthRoutes);

module.exports = router;
