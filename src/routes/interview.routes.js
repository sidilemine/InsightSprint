const express = require('express');
const router = express.Router();
const { 
  createInterview, 
  getInterviews, 
  getInterview, 
  updateInterview, 
  deleteInterview,
  getPublicInterview
} = require('../controllers/interview.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/interviews
 * @desc    Create a new interview
 * @access  Private (Admin, Analyst)
 */
router.post('/', protect, authorize('admin', 'analyst'), createInterview);

/**
 * @route   GET /api/interviews/project/:projectId
 * @desc    Get all interviews for a project
 * @access  Private
 */
router.get('/project/:projectId', protect, getInterviews);

/**
 * @route   GET /api/interviews/:id
 * @desc    Get a single interview
 * @access  Private
 */
router.get('/:id', protect, getInterview);

/**
 * @route   PUT /api/interviews/:id
 * @desc    Update an interview
 * @access  Private
 */
router.put('/:id', protect, updateInterview);

/**
 * @route   DELETE /api/interviews/:id
 * @desc    Delete an interview (archive)
 * @access  Private (Admin, Interview Creator)
 */
router.delete('/:id', protect, deleteInterview);

/**
 * @route   GET /api/interviews/public/:accessCode
 * @desc    Get public interview by access code
 * @access  Public
 */
router.get('/public/:accessCode', getPublicInterview);

module.exports = router;
