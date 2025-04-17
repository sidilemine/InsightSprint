const Interview = require('../models/interview.model');
const Project = require('../models/project.model');
const { setupLogging } = require('../utils/logger');

const logger = setupLogging();

/**
 * Create a new interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createInterview = async (req, res) => {
  try {
    const { 
      project: projectId, 
      title, 
      description, 
      questions 
    } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has permission to create interview for this project
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create interviews for this project'
      });
    }

    // Validate questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one question is required'
      });
    }

    // Format questions with proper order if not provided
    const formattedQuestions = questions.map((q, index) => ({
      ...q,
      order: q.order || index + 1
    }));

    const interview = new Interview({
      project: projectId,
      title,
      description,
      questions: formattedQuestions,
      createdBy: req.user.id
    });

    await interview.save();

    res.status(201).json({
      success: true,
      interview
    });
  } catch (error) {
    logger.error(`Error in createInterview: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get all interviews for a project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getInterviews = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;
    
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has permission to view interviews for this project
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view interviews for this project'
      });
    }

    // Build filter
    const filter = { project: projectId };
    if (status) filter.status = status;

    const interviews = await Interview.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews
    });
  } catch (error) {
    logger.error(`Error in getInterviews: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get a single interview by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('project', 'name status')
      .populate('createdBy', 'firstName lastName email');
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user has permission to view this interview
    const project = await Project.findById(interview.project._id);
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this interview'
      });
    }

    res.status(200).json({
      success: true,
      interview
    });
  } catch (error) {
    logger.error(`Error in getInterview: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update an interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateInterview = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      questions,
      status
    } = req.body;

    let interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user has permission to update this interview
    const project = await Project.findById(interview.project);
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this interview'
      });
    }

    // Only allow updates if interview is in draft status
    if (interview.status !== 'draft' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update interview that is not in draft status'
      });
    }

    // Update fields
    if (title) interview.title = title;
    if (description) interview.description = description;
    if (status) interview.status = status;
    
    // Update questions if provided
    if (questions && Array.isArray(questions) && questions.length > 0) {
      // Format questions with proper order if not provided
      const formattedQuestions = questions.map((q, index) => ({
        ...q,
        order: q.order || index + 1
      }));
      
      interview.questions = formattedQuestions;
    }
    
    await interview.save();

    res.status(200).json({
      success: true,
      interview
    });
  } catch (error) {
    logger.error(`Error in updateInterview: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Delete an interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user has permission to delete this interview
    const project = await Project.findById(interview.project);
    if (req.user.role !== 'admin' && interview.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this interview'
      });
    }

    // Only allow deletion if interview is in draft status
    if (interview.status !== 'draft' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete interview that is not in draft status'
      });
    }

    // Instead of hard delete, archive the interview
    interview.status = 'archived';
    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Interview archived successfully'
    });
  } catch (error) {
    logger.error(`Error in deleteInterview: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get public interview by access code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPublicInterview = async (req, res) => {
  try {
    const { accessCode } = req.params;
    
    const interview = await Interview.findOne({ 
      publicAccessCode: accessCode,
      status: 'active'
    }).select('title description questions');
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or not active'
      });
    }

    res.status(200).json({
      success: true,
      interview: {
        id: interview._id,
        title: interview.title,
        description: interview.description,
        questions: interview.questions.sort((a, b) => a.order - b.order)
      }
    });
  } catch (error) {
    logger.error(`Error in getPublicInterview: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createInterview,
  getInterviews,
  getInterview,
  updateInterview,
  deleteInterview,
  getPublicInterview
};
