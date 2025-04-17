/**
 * AssemblyAI Controller
 * Handles API endpoints for AssemblyAI integration
 */

const AssemblyAIService = require('../services/assemblyai.service');
const logger = require('../utils/logger');

class AssemblyAIController {
  constructor() {
    this.assemblyAIService = new AssemblyAIService();
  }

  /**
   * Transcribe audio file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async transcribeAudio(req, res) {
    try {
      const { audioUrl, options } = req.body;
      
      if (!audioUrl) {
        return res.status(400).json({
          success: false,
          error: 'Audio URL is required'
        });
      }
      
      const transcriptionJob = await this.assemblyAIService.transcribeAudio(audioUrl, options || {});
      
      return res.status(200).json({
        success: true,
        data: transcriptionJob
      });
    } catch (error) {
      logger.error(`Transcribe Audio Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Upload audio file to AssemblyAI
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadAudio(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No audio file provided'
        });
      }
      
      const audioData = req.file.buffer;
      const uploadUrl = await this.assemblyAIService.uploadAudio(audioData);
      
      return res.status(200).json({
        success: true,
        data: { upload_url: uploadUrl }
      });
    } catch (error) {
      logger.error(`Upload Audio Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get transcription status and results
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTranscription(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Transcription ID is required'
        });
      }
      
      const transcription = await this.assemblyAIService.getTranscription(id);
      
      return res.status(200).json({
        success: true,
        data: transcription
      });
    } catch (error) {
      logger.error(`Get Transcription Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Wait for transcription to complete
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async waitForTranscription(req, res) {
    try {
      const { id } = req.params;
      const { maxAttempts, interval } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Transcription ID is required'
        });
      }
      
      const transcription = await this.assemblyAIService.waitForTranscription(
        id,
        maxAttempts ? parseInt(maxAttempts) : undefined,
        interval ? parseInt(interval) : undefined
      );
      
      return res.status(200).json({
        success: true,
        data: transcription
      });
    } catch (error) {
      logger.error(`Wait For Transcription Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Generate insights using LeMUR
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateInsights(req, res) {
    try {
      const { transcriptId, prompt, options } = req.body;
      
      if (!transcriptId || !prompt) {
        return res.status(400).json({
          success: false,
          error: 'Transcript ID and prompt are required'
        });
      }
      
      const insights = await this.assemblyAIService.generateInsights(
        transcriptId,
        prompt,
        options || {}
      );
      
      return res.status(200).json({
        success: true,
        data: insights
      });
    } catch (error) {
      logger.error(`Generate Insights Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Process audio file end-to-end
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async processAudioComplete(req, res) {
    try {
      const { audioUrl, insightPrompt, options } = req.body;
      
      if (!audioUrl) {
        return res.status(400).json({
          success: false,
          error: 'Audio URL is required'
        });
      }
      
      const results = await this.assemblyAIService.processAudioComplete(
        audioUrl,
        insightPrompt,
        options || {}
      );
      
      return res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      logger.error(`Process Audio Complete Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AssemblyAIController();
