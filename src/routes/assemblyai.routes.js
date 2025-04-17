/**
 * AssemblyAI Routes
 * API routes for AssemblyAI integration
 */

const express = require('express');
const router = express.Router();
const assemblyAIController = require('../controllers/assemblyai.controller');
const upload = require('../middleware/upload.middleware');
const auth = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(auth.authenticate);

// Transcribe audio from URL
router.post('/transcribe', assemblyAIController.transcribeAudio.bind(assemblyAIController));

// Upload audio file
router.post('/upload', upload.single('audio'), assemblyAIController.uploadAudio.bind(assemblyAIController));

// Get transcription status and results
router.get('/transcription/:id', assemblyAIController.getTranscription.bind(assemblyAIController));

// Wait for transcription to complete
router.get('/transcription/:id/wait', assemblyAIController.waitForTranscription.bind(assemblyAIController));

// Generate insights using LeMUR
router.post('/insights', assemblyAIController.generateInsights.bind(assemblyAIController));

// Process audio file end-to-end
router.post('/process', assemblyAIController.processAudioComplete.bind(assemblyAIController));

module.exports = router;
