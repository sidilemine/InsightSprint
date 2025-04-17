const express = require('express');
const router = express.Router();
const { 
  submitResponse, 
  getResponses, 
  getResponse, 
  updateResponse, 
  getResponseAudio 
} = require('../controllers/response.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

/**
 * @route   POST /api/responses
 * @desc    Submit a new response
 * @access  Public
 */
router.post('/', upload.single('audio'), handleUploadError, submitResponse);

/**
 * @route   GET /api/responses/interview/:interviewId
 * @desc    Get all responses for an interview
 * @access  Private
 */
router.get('/interview/:interviewId', protect, getResponses);

/**
 * @route   GET /api/responses/:id
 * @desc    Get a single response
 * @access  Private
 */
router.get('/:id', protect, getResponse);

/**
 * @route   PUT /api/responses/:id
 * @desc    Update a response (admin/analyst only)
 * @access  Private (Admin, Analyst)
 */
router.put('/:id', protect, authorize('admin', 'analyst'), updateResponse);

/**
 * @route   GET /api/responses/:id/audio
 * @desc    Get audio file for a response
 * @access  Private
 */
router.get('/:id/audio', protect, getResponseAudio);

module.exports = router;
