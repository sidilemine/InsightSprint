const express = require('express');
const router = express.Router();
const { 
  createAnalysis, 
  getProjectAnalyses, 
  getInterviewAnalyses, 
  getAnalysis, 
  updateAnalysis 
} = require('../controllers/analysis.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/analyses
 * @desc    Create a new analysis
 * @access  Private
 */
router.post('/', protect, createAnalysis);

/**
 * @route   GET /api/analyses/project/:projectId
 * @desc    Get all analyses for a project
 * @access  Private
 */
router.get('/project/:projectId', protect, getProjectAnalyses);

/**
 * @route   GET /api/analyses/interview/:interviewId
 * @desc    Get all analyses for an interview
 * @access  Private
 */
router.get('/interview/:interviewId', protect, getInterviewAnalyses);

/**
 * @route   GET /api/analyses/:id
 * @desc    Get a single analysis
 * @access  Private
 */
router.get('/:id', protect, getAnalysis);

/**
 * @route   PUT /api/analyses/:id
 * @desc    Update an analysis (admin/analyst only)
 * @access  Private (Admin, Analyst)
 */
router.put('/:id', protect, authorize('admin', 'analyst'), updateAnalysis);

module.exports = router;
