const Analysis = require('../models/analysis.model');
const Interview = require('../models/interview.model');
const Project = require('../models/project.model');
const Response = require('../models/response.model');
const { setupLogging } = require('../utils/logger');

const logger = setupLogging();

/**
 * Create a new analysis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAnalysis = async (req, res) => {
  try {
    const { 
      project: projectId, 
      interview: interviewId, 
      title, 
      description 
    } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if interview exists
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if interview belongs to project
    if (interview.project.toString() !== projectId) {
      return res.status(400).json({
        success: false,
        message: 'Interview does not belong to this project'
      });
    }

    // Check if user has permission to create analysis for this project
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create analysis for this project'
      });
    }

    // Check if there are responses to analyze
    const responseCount = await Response.countDocuments({ 
      interview: interviewId,
      processingStatus: 'completed'
    });

    if (responseCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No completed responses available for analysis'
      });
    }

    const analysis = new Analysis({
      project: projectId,
      interview: interviewId,
      title,
      description,
      responseCount,
      status: 'pending',
      createdBy: req.user.id
    });

    await analysis.save();

    res.status(201).json({
      success: true,
      analysis
    });
  } catch (error) {
    logger.error(`Error in createAnalysis: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get all analyses for a project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProjectAnalyses = async (req, res) => {
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

    // Check if user has permission to view analyses for this project
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analyses for this project'
      });
    }

    // Build filter
    const filter = { project: projectId };
    if (status) filter.status = status;

    const analyses = await Analysis.find(filter)
      .populate('interview', 'title responseCount')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: analyses.length,
      analyses
    });
  } catch (error) {
    logger.error(`Error in getProjectAnalyses: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get all analyses for an interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getInterviewAnalyses = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { status } = req.query;
    
    // Check if interview exists
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user has permission to view analyses for this interview
    const project = await Project.findById(interview.project);
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analyses for this interview'
      });
    }

    // Build filter
    const filter = { interview: interviewId };
    if (status) filter.status = status;

    const analyses = await Analysis.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: analyses.length,
      analyses
    });
  } catch (error) {
    logger.error(`Error in getInterviewAnalyses: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get a single analysis by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id)
      .populate('project', 'name status')
      .populate('interview', 'title responseCount')
      .populate('createdBy', 'firstName lastName email');
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    // Check if user has permission to view this analysis
    const project = await Project.findById(analysis.project._id);
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this analysis'
      });
    }

    res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    logger.error(`Error in getAnalysis: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update an analysis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAnalysis = async (req, res) => {
  try {
    // Only admins and analysts can update analyses
    if (req.user.role !== 'admin' && req.user.role !== 'analyst') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update analyses'
      });
    }

    const { 
      title,
      description,
      status,
      aggregatedEmotions,
      dominantEmotions,
      emotionalJourney,
      sentimentDistribution,
      keyThemes,
      keyInsights,
      recommendations,
      visualizationData,
      insight7Id,
      processingError
    } = req.body;

    let analysis = await Analysis.findById(req.params.id);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    // Update fields
    if (title) analysis.title = title;
    if (description) analysis.description = description;
    if (status) analysis.status = status;
    if (aggregatedEmotions) analysis.aggregatedEmotions = aggregatedEmotions;
    if (dominantEmotions) analysis.dominantEmotions = dominantEmotions;
    if (emotionalJourney) analysis.emotionalJourney = emotionalJourney;
    if (sentimentDistribution) analysis.sentimentDistribution = sentimentDistribution;
    if (keyThemes) analysis.keyThemes = keyThemes;
    if (keyInsights) analysis.keyInsights = keyInsights;
    if (recommendations) analysis.recommendations = recommendations;
    if (visualizationData) analysis.visualizationData = visualizationData;
    if (insight7Id) analysis.insight7Id = insight7Id;
    if (processingError) analysis.processingError = processingError;
    
    await analysis.save();

    res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    logger.error(`Error in updateAnalysis: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createAnalysis,
  getProjectAnalyses,
  getInterviewAnalyses,
  getAnalysis,
  updateAnalysis
};
