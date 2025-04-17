const axios = require('axios');
const config = require('../config/config');
const { setupLogging } = require('../utils/logger');

const logger = setupLogging();

/**
 * Insight7 service for AI-powered visualization of open-ended responses
 */
class Insight7Service {
  constructor() {
    this.apiKey = config.INSIGHT7_API_KEY;
    this.apiUrl = config.INSIGHT7_API_URL;
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create a new visualization project in Insight7
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Insight7 project data
   */
  async createProject(projectData) {
    try {
      const { 
        name, 
        description, 
        productCategory, 
        targetAudience 
      } = projectData;
      
      const response = await this.client.post('/projects', {
        name,
        description,
        category: productCategory,
        audience: targetAudience,
        settings: {
          visualizationTypes: ['word_cloud', 'sentiment_chart', 'theme_network', 'emotion_map'],
          enableEmotionAnalysis: true
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Insight7 createProject error: ${error.message}`);
      throw new Error(`Failed to create project in Insight7: ${error.message}`);
    }
  }

  /**
   * Upload responses to Insight7 for analysis and visualization
   * @param {String} insight7ProjectId - Insight7 project ID
   * @param {Array} responses - Array of response objects
   * @returns {Promise<Object>} Upload result
   */
  async uploadResponses(insight7ProjectId, responses) {
    try {
      if (!responses || !Array.isArray(responses) || responses.length === 0) {
        throw new Error('Responses are required for Insight7 upload');
      }
      
      // Format responses for Insight7
      const formattedResponses = responses.map(response => {
        return {
          id: response._id.toString(),
          question: response.question.text,
          answer: response.textResponse || response.transcription || '',
          metadata: {
            questionId: response.question.questionId,
            respondentId: response.respondent?.id || 'anonymous',
            timestamp: response.createdAt,
            emotions: response.emotionAnalysis?.dominantEmotions || []
          }
        };
      });
      
      const response = await this.client.post(`/projects/${insight7ProjectId}/responses`, {
        responses: formattedResponses
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Insight7 uploadResponses error: ${error.message}`);
      throw new Error(`Failed to upload responses to Insight7: ${error.message}`);
    }
  }

  /**
   * Generate visualizations for a project
   * @param {String} insight7ProjectId - Insight7 project ID
   * @returns {Promise<Object>} Visualization data
   */
  async generateVisualizations(insight7ProjectId) {
    try {
      const response = await this.client.post(`/projects/${insight7ProjectId}/visualizations/generate`, {
        types: ['word_cloud', 'sentiment_chart', 'theme_network', 'emotion_map']
      });
      
      // Get job ID
      const jobId = response.data.jobId;
      
      // Poll for job completion
      return await this._pollJobCompletion(insight7ProjectId, jobId);
    } catch (error) {
      logger.error(`Insight7 generateVisualizations error: ${error.message}`);
      throw new Error(`Failed to generate visualizations in Insight7: ${error.message}`);
    }
  }

  /**
   * Get visualizations for a project
   * @param {String} insight7ProjectId - Insight7 project ID
   * @returns {Promise<Object>} Visualization data
   */
  async getVisualizations(insight7ProjectId) {
    try {
      const response = await this.client.get(`/projects/${insight7ProjectId}/visualizations`);
      return response.data;
    } catch (error) {
      logger.error(`Insight7 getVisualizations error: ${error.message}`);
      throw new Error(`Failed to get visualizations from Insight7: ${error.message}`);
    }
  }

  /**
   * Get a specific visualization
   * @param {String} insight7ProjectId - Insight7 project ID
   * @param {String} visualizationId - Visualization ID
   * @returns {Promise<Object>} Visualization data
   */
  async getVisualization(insight7ProjectId, visualizationId) {
    try {
      const response = await this.client.get(`/projects/${insight7ProjectId}/visualizations/${visualizationId}`);
      return response.data;
    } catch (error) {
      logger.error(`Insight7 getVisualization error: ${error.message}`);
      throw new Error(`Failed to get visualization from Insight7: ${error.message}`);
    }
  }

  /**
   * Get visualization image URL
   * @param {String} insight7ProjectId - Insight7 project ID
   * @param {String} visualizationId - Visualization ID
   * @returns {Promise<String>} Image URL
   */
  async getVisualizationImageUrl(insight7ProjectId, visualizationId) {
    try {
      const response = await this.client.get(`/projects/${insight7ProjectId}/visualizations/${visualizationId}/image`);
      return response.data.imageUrl;
    } catch (error) {
      logger.error(`Insight7 getVisualizationImageUrl error: ${error.message}`);
      throw new Error(`Failed to get visualization image URL from Insight7: ${error.message}`);
    }
  }

  /**
   * Export visualizations as PDF
   * @param {String} insight7ProjectId - Insight7 project ID
   * @returns {Promise<String>} PDF URL
   */
  async exportVisualizationsAsPdf(insight7ProjectId) {
    try {
      const response = await this.client.post(`/projects/${insight7ProjectId}/export`, {
        format: 'pdf',
        includeRawData: false
      });
      
      // Get job ID
      const jobId = response.data.jobId;
      
      // Poll for job completion
      const exportResult = await this._pollExportCompletion(insight7ProjectId, jobId);
      
      return exportResult.downloadUrl;
    } catch (error) {
      logger.error(`Insight7 exportVisualizationsAsPdf error: ${error.message}`);
      throw new Error(`Failed to export visualizations as PDF from Insight7: ${error.message}`);
    }
  }

  /**
   * Poll for job completion
   * @param {String} insight7ProjectId - Insight7 project ID
   * @param {String} jobId - Job ID
   * @returns {Promise<Object>} Visualization data
   * @private
   */
  async _pollJobCompletion(insight7ProjectId, jobId) {
    try {
      // Maximum number of polling attempts
      const maxAttempts = 30;
      // Delay between polling attempts (in milliseconds)
      const pollingDelay = 2000;
      
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        // Get job status
        const response = await this.client.get(`/projects/${insight7ProjectId}/jobs/${jobId}`);
        
        // Check if job is completed
        if (response.data.status === 'completed') {
          return await this.getVisualizations(insight7ProjectId);
        }
        
        // Check if job failed
        if (response.data.status === 'failed') {
          throw new Error(`Insight7 job failed: ${response.data.error}`);
        }
        
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, pollingDelay));
        attempts++;
      }
      
      throw new Error('Insight7 job timed out');
    } catch (error) {
      logger.error(`Insight7 _pollJobCompletion error: ${error.message}`);
      throw new Error(`Failed to poll Insight7 job: ${error.message}`);
    }
  }

  /**
   * Poll for export job completion
   * @param {String} insight7ProjectId - Insight7 project ID
   * @param {String} jobId - Job ID
   * @returns {Promise<Object>} Export result
   * @private
   */
  async _pollExportCompletion(insight7ProjectId, jobId) {
    try {
      // Maximum number of polling attempts
      const maxAttempts = 30;
      // Delay between polling attempts (in milliseconds)
      const pollingDelay = 2000;
      
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        // Get job status
        const response = await this.client.get(`/projects/${insight7ProjectId}/jobs/${jobId}`);
        
        // Check if job is completed
        if (response.data.status === 'completed') {
          return response.data.result;
        }
        
        // Check if job failed
        if (response.data.status === 'failed') {
          throw new Error(`Insight7 export job failed: ${response.data.error}`);
        }
        
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, pollingDelay));
        attempts++;
      }
      
      throw new Error('Insight7 export job timed out');
    } catch (error) {
      logger.error(`Insight7 _pollExportCompletion error: ${error.message}`);
      throw new Error(`Failed to poll Insight7 export job: ${error.message}`);
    }
  }
}

module.exports = new Insight7Service();
