const axios = require('axios');
const config = require('../config/config');
const { setupLogging } = require('../utils/logger');

const logger = setupLogging();

/**
 * Voiceform API service for creating and managing voice interviews
 */
class VoiceformService {
  constructor() {
    this.apiKey = config.VOICEFORM_API_KEY;
    this.apiUrl = config.VOICEFORM_API_URL;
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create a new interview in Voiceform
   * @param {Object} interviewData - Interview data
   * @returns {Promise<Object>} Voiceform interview data
   */
  async createInterview(interviewData) {
    try {
      const { title, description, questions } = interviewData;
      
      // Format questions for Voiceform API
      const formattedQuestions = questions.map(q => ({
        id: q.questionId,
        text: q.text,
        type: this._mapQuestionType(q.type),
        options: q.options || [],
        order: q.order
      }));
      
      const response = await this.client.post('/interviews', {
        title,
        description,
        questions: formattedQuestions,
        settings: {
          allowAudioResponses: true,
          moderationEnabled: true,
          emotionAnalysisEnabled: true
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Voiceform createInterview error: ${error.message}`);
      throw new Error(`Failed to create interview in Voiceform: ${error.message}`);
    }
  }

  /**
   * Get an interview from Voiceform
   * @param {String} voiceformId - Voiceform interview ID
   * @returns {Promise<Object>} Voiceform interview data
   */
  async getInterview(voiceformId) {
    try {
      const response = await this.client.get(`/interviews/${voiceformId}`);
      return response.data;
    } catch (error) {
      logger.error(`Voiceform getInterview error: ${error.message}`);
      throw new Error(`Failed to get interview from Voiceform: ${error.message}`);
    }
  }

  /**
   * Update an interview in Voiceform
   * @param {String} voiceformId - Voiceform interview ID
   * @param {Object} interviewData - Updated interview data
   * @returns {Promise<Object>} Updated Voiceform interview data
   */
  async updateInterview(voiceformId, interviewData) {
    try {
      const { title, description, questions, status } = interviewData;
      
      const updateData = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      
      if (questions && Array.isArray(questions)) {
        // Format questions for Voiceform API
        updateData.questions = questions.map(q => ({
          id: q.questionId,
          text: q.text,
          type: this._mapQuestionType(q.type),
          options: q.options || [],
          order: q.order
        }));
      }
      
      if (status) {
        updateData.status = this._mapStatus(status);
      }
      
      const response = await this.client.put(`/interviews/${voiceformId}`, updateData);
      return response.data;
    } catch (error) {
      logger.error(`Voiceform updateInterview error: ${error.message}`);
      throw new Error(`Failed to update interview in Voiceform: ${error.message}`);
    }
  }

  /**
   * Get responses for an interview from Voiceform
   * @param {String} voiceformId - Voiceform interview ID
   * @returns {Promise<Array>} Array of responses
   */
  async getResponses(voiceformId) {
    try {
      const response = await this.client.get(`/interviews/${voiceformId}/responses`);
      return response.data;
    } catch (error) {
      logger.error(`Voiceform getResponses error: ${error.message}`);
      throw new Error(`Failed to get responses from Voiceform: ${error.message}`);
    }
  }

  /**
   * Get a single response from Voiceform
   * @param {String} voiceformId - Voiceform interview ID
   * @param {String} responseId - Voiceform response ID
   * @returns {Promise<Object>} Response data
   */
  async getResponse(voiceformId, responseId) {
    try {
      const response = await this.client.get(`/interviews/${voiceformId}/responses/${responseId}`);
      return response.data;
    } catch (error) {
      logger.error(`Voiceform getResponse error: ${error.message}`);
      throw new Error(`Failed to get response from Voiceform: ${error.message}`);
    }
  }

  /**
   * Get audio URL for a response
   * @param {String} voiceformId - Voiceform interview ID
   * @param {String} responseId - Voiceform response ID
   * @returns {Promise<String>} Audio URL
   */
  async getResponseAudioUrl(voiceformId, responseId) {
    try {
      const response = await this.client.get(`/interviews/${voiceformId}/responses/${responseId}/audio`);
      return response.data.audioUrl;
    } catch (error) {
      logger.error(`Voiceform getResponseAudioUrl error: ${error.message}`);
      throw new Error(`Failed to get response audio URL from Voiceform: ${error.message}`);
    }
  }

  /**
   * Map internal question type to Voiceform question type
   * @param {String} type - Internal question type
   * @returns {String} Voiceform question type
   * @private
   */
  _mapQuestionType(type) {
    const typeMap = {
      'open': 'open_ended',
      'multiple-choice': 'multiple_choice',
      'rating': 'rating',
      'yes-no': 'yes_no'
    };
    
    return typeMap[type] || 'open_ended';
  }

  /**
   * Map internal status to Voiceform status
   * @param {String} status - Internal status
   * @returns {String} Voiceform status
   * @private
   */
  _mapStatus(status) {
    const statusMap = {
      'draft': 'draft',
      'active': 'active',
      'paused': 'paused',
      'completed': 'completed',
      'archived': 'archived'
    };
    
    return statusMap[status] || 'draft';
  }
}

module.exports = new VoiceformService();
