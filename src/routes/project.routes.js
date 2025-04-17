const express = require('express');
const router = express.Router();
const { 
  createProject, 
  getProjects, 
  getProject, 
  updateProject, 
  deleteProject 
} = require('../controllers/project.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private (Admin, Analyst)
 */
router.post('/', protect, authorize('admin', 'analyst'), createProject);

/**
 * @route   GET /api/projects
 * @desc    Get all projects (filtered by role)
 * @access  Private
 */
router.get('/', protect, getProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project
 * @access  Private
 */
router.get('/:id', protect, getProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private
 */
router.put('/:id', protect, updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project (archive)
 * @access  Private (Admin, Project Creator)
 */
router.delete('/:id', protect, deleteProject);

module.exports = router;
