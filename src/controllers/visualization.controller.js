/**
 * Visualization Controller
 * Handles API endpoints for in-house visualization solution
 */

const visualizationService = require('../services/visualization.service');
const logger = require('../utils/logger');

class VisualizationController {
  /**
   * Analyze transcription with sentiment data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async analyzeTranscription(req, res) {
    try {
      const { transcription, sentimentData, options } = req.body;
      
      if (!transcription || !sentimentData) {
        return res.status(400).json({
          success: false,
          error: 'Transcription and sentiment data are required'
        });
      }
      
      const analysis = await visualizationService.analyzeTranscription(
        transcription,
        sentimentData,
        options || {}
      );
      
      return res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error(`Analyze Transcription Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Generate visualization data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateVisualizationData(req, res) {
    try {
      const { transcription, sentimentData, analysisId } = req.body;
      
      if (!transcription || !sentimentData || !analysisId) {
        return res.status(400).json({
          success: false,
          error: 'Transcription, sentiment data, and analysis ID are required'
        });
      }
      
      // Get analysis
      const analysis = await visualizationService.getAnalysis(analysisId);
      
      // Generate visualization data
      const visualizationData = await visualizationService.generateVisualizationData(
        transcription,
        sentimentData,
        analysis
      );
      
      return res.status(200).json({
        success: true,
        data: visualizationData
      });
    } catch (error) {
      logger.error(`Generate Visualization Data Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get analysis by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAnalysis(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Analysis ID is required'
        });
      }
      
      const analysis = await visualizationService.getAnalysis(id);
      
      return res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error(`Get Analysis Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get visualization data by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getVisualizationData(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Visualization ID is required'
        });
      }
      
      const visualizationData = await visualizationService.getVisualizationData(id);
      
      return res.status(200).json({
        success: true,
        data: visualizationData
      });
    } catch (error) {
      logger.error(`Get Visualization Data Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Process complete analysis and visualization workflow
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async processComplete(req, res) {
    try {
      const { transcription, sentimentData, options } = req.body;
      
      if (!transcription || !sentimentData) {
        return res.status(400).json({
          success: false,
          error: 'Transcription and sentiment data are required'
        });
      }
      
      const results = await visualizationService.processComplete(
        transcription,
        sentimentData,
        options || {}
      );
      
      return res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      logger.error(`Process Complete Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new VisualizationController();
