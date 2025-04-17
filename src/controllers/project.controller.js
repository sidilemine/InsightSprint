const Project = require('../models/project.model');
const Interview = require('../models/interview.model');
const { setupLogging } = require('../utils/logger');

const logger = setupLogging();

/**
 * Create a new project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createProject = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      client, 
      productCategory, 
      targetAudience, 
      objectives, 
      targetResponseCount 
    } = req.body;

    const project = new Project({
      name,
      description,
      client: client || req.user.id, // Use authenticated user as client if not specified
      productCategory,
      targetAudience,
      objectives,
      targetResponseCount,
      createdBy: req.user.id
    });

    await project.save();

    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    logger.error(`Error in createProject: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get all projects (with filtering options)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProjects = async (req, res) => {
  try {
    const { status, client } = req.query;
    const filter = {};
    
    // Apply filters if provided
    if (status) filter.status = status;
    if (client) filter.client = client;
    
    // Apply role-based filtering
    if (req.user.role === 'client') {
      // Clients can only see their own projects
      filter.client = req.user.id;
    } else if (req.user.role === 'analyst') {
      // Analysts can see projects they created or are assigned to
      filter.$or = [{ createdBy: req.user.id }];
    }
    // Admins can see all projects (no additional filter)

    const projects = await Project.find(filter)
      .populate('client', 'firstName lastName email company')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    logger.error(`Error in getProjects: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get a single project by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'firstName lastName email company')
      .populate('createdBy', 'firstName lastName email');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access to this project
    if (req.user.role === 'client' && project.client._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }

    // Get associated interviews
    const interviews = await Interview.find({ project: project._id })
      .select('title status responseCount createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      project,
      interviews
    });
  } catch (error) {
    logger.error(`Error in getProject: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update a project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProject = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      productCategory, 
      targetAudience, 
      objectives, 
      status,
      targetResponseCount 
    } = req.body;

    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has permission to update this project
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    // Update fields
    if (name) project.name = name;
    if (description) project.description = description;
    if (productCategory) project.productCategory = productCategory;
    if (targetAudience) project.targetAudience = targetAudience;
    if (objectives) project.objectives = objectives;
    if (status) project.status = status;
    if (targetResponseCount) project.targetResponseCount = targetResponseCount;
    
    await project.save();

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    logger.error(`Error in updateProject: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Delete a project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has permission to delete this project
    if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    // Instead of hard delete, archive the project
    project.status = 'archived';
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project archived successfully'
    });
  } catch (error) {
    logger.error(`Error in deleteProject: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
};
