/**
 * Visualization Routes
 * API routes for in-house visualization solution
 */

const express = require('express');
const router = express.Router();
const visualizationController = require('../controllers/visualization.controller');
const auth = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(auth.authenticate);

// Analyze transcription with sentiment data
router.post('/analyze', visualizationController.analyzeTranscription);

// Generate visualization data
router.post('/generate', visualizationController.generateVisualizationData);

// Get analysis by ID
router.get('/analysis/:id', visualizationController.getAnalysis);

// Get visualization data by ID
router.get('/data/:id', visualizationController.getVisualizationData);

// Process complete analysis and visualization workflow
router.post('/process', visualizationController.processComplete);

module.exports = router;
