import { mixedAnalysisService } from '../services/mixed-analysis.service';
import { logger } from '../utils/logger';

/**
 * Controller for mixed emotion-language analysis
 */
class MixedAnalysisController {
  /**
   * Analyze a single response
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async analyzeResponse(req, res) {
    try {
      const { audioUrl, transcription } = req.body;
      
      if (!audioUrl || !transcription) {
        return res.status(400).json({ 
          success: false, 
          message: 'Audio URL and transcription are required' 
        });
      }
      
      logger.info(`Received request to analyze response: ${audioUrl}`);
      
      const analysisResults = await mixedAnalysisService.analyzeResponse(audioUrl, transcription);
      
      return res.status(200).json({
        success: true,
        data: analysisResults
      });
    } catch (error) {
      logger.error(`Error in analyze response: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Analyze multiple responses
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async analyzeMultipleResponses(req, res) {
    try {
      const { responses } = req.body;
      
      if (!responses || !Array.isArray(responses) || responses.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid array of responses is required' 
        });
      }
      
      // Validate each response has required fields
      const invalidResponses = responses.filter(r => !r.audioUrl || !r.transcription);
      if (invalidResponses.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'All responses must include audioUrl and transcription' 
        });
      }
      
      logger.info(`Received request to analyze ${responses.length} responses`);
      
      const analysisResults = await mixedAnalysisService.analyzeMultipleResponses(responses);
      
      return res.status(200).json({
        success: true,
        data: analysisResults
      });
    } catch (error) {
      logger.error(`Error in analyze multiple responses: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Generate analysis for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateProjectAnalysis(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Project ID is required' 
        });
      }
      
      logger.info(`Received request to generate analysis for project: ${projectId}`);
      
      // In a real implementation, we would:
      // 1. Fetch all responses for the project
      // 2. Pass them to analyzeMultipleResponses
      // 3. Save the results to the database
      // 4. Return the analysis ID
      
      // Mock implementation for now
      return res.status(200).json({
        success: true,
        message: 'Analysis generation started',
        data: {
          analysisId: 'mock-analysis-id',
          status: 'processing'
        }
      });
    } catch (error) {
      logger.error(`Error in generate project analysis: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Get analysis status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAnalysisStatus(req, res) {
    try {
      const { analysisId } = req.params;
      
      if (!analysisId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Analysis ID is required' 
        });
      }
      
      logger.info(`Received request to get status for analysis: ${analysisId}`);
      
      // In a real implementation, we would fetch the status from the database
      
      // Mock implementation for now
      return res.status(200).json({
        success: true,
        data: {
          analysisId,
          status: 'completed',
          progress: 100,
          completedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error(`Error in get analysis status: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export const mixedAnalysisController = new MixedAnalysisController();
