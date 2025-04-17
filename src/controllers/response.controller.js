const Response = require('../models/response.model');
const Interview = require('../models/interview.model');
const Project = require('../models/project.model');
const { setupLogging } = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

const logger = setupLogging();

/**
 * Submit a new response to an interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const submitResponse = async (req, res) => {
  try {
    const { 
      interviewId, 
      questionId, 
      respondentId,
      demographics,
      textResponse
    } = req.body;

    // Check if interview exists and is active
    const interview = await Interview.findOne({ 
      _id: interviewId,
      status: 'active'
    });
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found or not active'
      });
    }

    // Check if question exists in the interview
    const question = interview.questions.find(q => q.questionId === questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in this interview'
      });
    }

    // Create response
    const response = new Response({
      interview: interviewId,
      question: {
        questionId: question.questionId,
        text: question.text
      },
      respondent: {
        id: respondentId,
        demographics: demographics || {}
      },
      textResponse,
      processingStatus: 'pending'
    });

    // Handle audio file upload if present
    if (req.file) {
      response.audioFilePath = req.file.path;
      response.audioUrl = `/uploads/${req.file.filename}`;
    }

    await response.save();

    // Update response count in interview
    interview.responseCount += 1;
    await interview.save();

    // Update response count in project
    const project = await Project.findById(interview.project);
    if (project) {
      project.currentResponseCount += 1;
      await project.save();
    }

    res.status(201).json({
      success: true,
      response: {
        id: response._id,
        questionId: response.question.questionId,
        respondentId: response.respondent.id,
        processingStatus: response.processingStatus
      }
    });
  } catch (error) {
    logger.error(`Error in submitResponse: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get responses for an interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getResponses = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { questionId, respondentId, status } = req.query;
    
    // Check if interview exists
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user has permission to view responses for this interview
    const project = await Project.findById(interview.project);
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view responses for this interview'
      });
    }

    // Build filter
    const filter = { interview: interviewId };
    if (questionId) filter['question.questionId'] = questionId;
    if (respondentId) filter['respondent.id'] = respondentId;
    if (status) filter.processingStatus = status;

    const responses = await Response.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: responses.length,
      responses
    });
  } catch (error) {
    logger.error(`Error in getResponses: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get a single response by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getResponse = async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);
    
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Check if user has permission to view this response
    const interview = await Interview.findById(response.interview);
    const project = await Project.findById(interview.project);
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this response'
      });
    }

    res.status(200).json({
      success: true,
      response
    });
  } catch (error) {
    logger.error(`Error in getResponse: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Update a response (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateResponse = async (req, res) => {
  try {
    // Only admins and analysts can update responses
    if (req.user.role !== 'admin' && req.user.role !== 'analyst') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update responses'
      });
    }

    const { 
      transcription,
      emotionAnalysis,
      languageAnalysis,
      processingStatus,
      processingError
    } = req.body;

    let response = await Response.findById(req.params.id);
    
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Update fields
    if (transcription) response.transcription = transcription;
    if (emotionAnalysis) response.emotionAnalysis = emotionAnalysis;
    if (languageAnalysis) response.languageAnalysis = languageAnalysis;
    if (processingStatus) response.processingStatus = processingStatus;
    if (processingError) response.processingError = processingError;
    
    await response.save();

    res.status(200).json({
      success: true,
      response
    });
  } catch (error) {
    logger.error(`Error in updateResponse: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get audio file for a response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getResponseAudio = async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);
    
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Check if user has permission to access this audio
    const interview = await Interview.findById(response.interview);
    const project = await Project.findById(interview.project);
    if (req.user.role === 'client' && project.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this audio'
      });
    }

    // Check if audio file exists
    if (!response.audioFilePath) {
      return res.status(404).json({
        success: false,
        message: 'No audio file found for this response'
      });
    }

    // Send the file
    const filePath = path.join(__dirname, '..', '..', response.audioFilePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Audio file not found on server'
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    logger.error(`Error in getResponseAudio: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  submitResponse,
  getResponses,
  getResponse,
  updateResponse,
  getResponseAudio
};
