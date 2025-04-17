/**
 * AssemblyAI Service
 * Handles integration with AssemblyAI for speech-to-text, sentiment analysis, and LeMUR insights
 */

const axios = require('axios');
const logger = require('../utils/logger');

class AssemblyAIService {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.ASSEMBLYAI_API_KEY;
    this.baseUrl = 'https://api.assemblyai.com/v2';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Submit audio for transcription with optional analysis features
   * @param {string} audioUrl - URL of the audio file to transcribe
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} - Transcription job details
   */
  async transcribeAudio(audioUrl, options = {}) {
    try {
      logger.info(`Submitting audio for transcription: ${audioUrl}`);
      
      const payload = {
        audio_url: audioUrl,
        sentiment_analysis: options.sentiment_analysis !== false,
        content_safety: options.content_safety !== false,
        entity_detection: options.entity_detection || false,
        auto_chapters: options.auto_chapters || false
      };
      
      const response = await this.client.post('/transcript', payload);
      logger.info(`Transcription job created: ${response.data.id}`);
      
      return response.data;
    } catch (error) {
      logger.error(`AssemblyAI Transcription Error: ${error.message}`);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  /**
   * Upload audio file directly to AssemblyAI
   * @param {Buffer} audioData - Audio file buffer
   * @returns {Promise<string>} - URL of the uploaded audio
   */
  async uploadAudio(audioData) {
    try {
      logger.info('Uploading audio file to AssemblyAI');
      
      // Get upload URL
      const uploadResponse = await this.client.post('/upload', {});
      const uploadUrl = uploadResponse.data.upload_url;
      
      // Upload the file
      await axios.put(uploadUrl, audioData, {
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });
      
      logger.info(`Audio uploaded successfully: ${uploadUrl}`);
      return uploadUrl;
    } catch (error) {
      logger.error(`AssemblyAI Upload Error: ${error.message}`);
      throw new Error(`Failed to upload audio: ${error.message}`);
    }
  }

  /**
   * Get transcription status and results
   * @param {string} transcriptId - ID of the transcription job
   * @returns {Promise<Object>} - Transcription details and results
   */
  async getTranscription(transcriptId) {
    try {
      logger.info(`Fetching transcription: ${transcriptId}`);
      
      const response = await this.client.get(`/transcript/${transcriptId}`);
      return response.data;
    } catch (error) {
      logger.error(`AssemblyAI Get Transcription Error: ${error.message}`);
      throw new Error(`Failed to get transcription: ${error.message}`);
    }
  }

  /**
   * Wait for transcription to complete
   * @param {string} transcriptId - ID of the transcription job
   * @param {number} maxAttempts - Maximum number of polling attempts
   * @param {number} interval - Polling interval in milliseconds
   * @returns {Promise<Object>} - Completed transcription
   */
  async waitForTranscription(transcriptId, maxAttempts = 30, interval = 2000) {
    logger.info(`Waiting for transcription to complete: ${transcriptId}`);
    
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const transcription = await this.getTranscription(transcriptId);
      
      if (transcription.status === 'completed') {
        logger.info(`Transcription completed: ${transcriptId}`);
        return transcription;
      } else if (transcription.status === 'error') {
        logger.error(`Transcription failed: ${transcription.error}`);
        throw new Error(`Transcription failed: ${transcription.error}`);
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    }
    
    logger.error(`Transcription timed out after ${maxAttempts} attempts`);
    throw new Error('Transcription timed out');
  }

  /**
   * Extract sentiment analysis results from transcription
   * @param {Object} transcription - Transcription object
   * @returns {Array} - Sentiment analysis results
   */
  extractSentimentAnalysis(transcription) {
    if (!transcription.sentiment_analysis_results || 
        transcription.sentiment_analysis_results.length === 0) {
      logger.warn('No sentiment analysis results found in transcription');
      return [];
    }
    
    return transcription.sentiment_analysis_results;
  }

  /**
   * Generate insights using LeMUR
   * @param {string} transcriptId - ID of the transcription
   * @param {string} prompt - Prompt for LeMUR analysis
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - LeMUR analysis results
   */
  async generateInsights(transcriptId, prompt, options = {}) {
    try {
      logger.info(`Generating insights for transcription: ${transcriptId}`);
      
      const payload = {
        transcript_ids: [transcriptId],
        prompt: prompt,
        max_output_size: options.max_output_size || 1000,
        temperature: options.temperature || 0.7,
        final_model: options.final_model || 'default'
      };
      
      const response = await this.client.post('/lemur/v3/generate', payload);
      logger.info(`Insights generated for transcription: ${transcriptId}`);
      
      return response.data;
    } catch (error) {
      logger.error(`AssemblyAI LeMUR Error: ${error.message}`);
      throw new Error(`Failed to generate insights: ${error.message}`);
    }
  }

  /**
   * Process audio file end-to-end: transcribe, analyze, and generate insights
   * @param {string} audioUrl - URL of the audio file
   * @param {string} insightPrompt - Prompt for generating insights
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Complete analysis results
   */
  async processAudioComplete(audioUrl, insightPrompt, options = {}) {
    try {
      // Step 1: Submit for transcription
      const transcriptionJob = await this.transcribeAudio(audioUrl, options);
      
      // Step 2: Wait for transcription to complete
      const transcription = await this.waitForTranscription(
        transcriptionJob.id,
        options.maxAttempts,
        options.pollingInterval
      );
      
      // Step 3: Generate insights if requested
      let insights = null;
      if (insightPrompt) {
        insights = await this.generateInsights(
          transcription.id,
          insightPrompt,
          options.lemurOptions
        );
      }
      
      // Return complete results
      return {
        transcription,
        insights
      };
    } catch (error) {
      logger.error(`Complete Audio Processing Error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = AssemblyAIService;
