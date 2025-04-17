const axios = require('axios');
const config = require('../config/config');
const { setupLogging } = require('../utils/logger');
const fs = require('fs');

const logger = setupLogging();

/**
 * Hume AI service for emotion recognition from voice recordings
 */
class HumeAIService {
  constructor() {
    this.apiKey = config.HUME_AI_API_KEY;
    this.apiUrl = config.HUME_AI_API_URL;
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Analyze emotions in an audio file
   * @param {String} audioFilePath - Path to audio file
   * @returns {Promise<Object>} Emotion analysis results
   */
  async analyzeAudioFile(audioFilePath) {
    try {
      // Read the audio file as a buffer
      const audioBuffer = fs.readFileSync(audioFilePath);
      
      // Convert buffer to base64
      const audioBase64 = audioBuffer.toString('base64');
      
      // Create form data for the API request
      const formData = {
        data: audioBase64,
        models: {
          prosody: {
            granularity: 'utterance'
          }
        }
      };
      
      // Make the API request
      const response = await this.client.post('/batch/jobs', formData);
      
      // Get the job ID
      const jobId = response.data.job_id;
      
      // Poll for job completion
      return await this._pollJobCompletion(jobId);
    } catch (error) {
      logger.error(`Hume AI analyzeAudioFile error: ${error.message}`);
      throw new Error(`Failed to analyze audio with Hume AI: ${error.message}`);
    }
  }

  /**
   * Analyze emotions in an audio URL
   * @param {String} audioUrl - URL to audio file
   * @returns {Promise<Object>} Emotion analysis results
   */
  async analyzeAudioUrl(audioUrl) {
    try {
      // Create form data for the API request
      const formData = {
        url: audioUrl,
        models: {
          prosody: {
            granularity: 'utterance'
          }
        }
      };
      
      // Make the API request
      const response = await this.client.post('/batch/jobs', formData);
      
      // Get the job ID
      const jobId = response.data.job_id;
      
      // Poll for job completion
      return await this._pollJobCompletion(jobId);
    } catch (error) {
      logger.error(`Hume AI analyzeAudioUrl error: ${error.message}`);
      throw new Error(`Failed to analyze audio URL with Hume AI: ${error.message}`);
    }
  }

  /**
   * Poll for job completion
   * @param {String} jobId - Hume AI job ID
   * @returns {Promise<Object>} Emotion analysis results
   * @private
   */
  async _pollJobCompletion(jobId) {
    try {
      // Maximum number of polling attempts
      const maxAttempts = 30;
      // Delay between polling attempts (in milliseconds)
      const pollingDelay = 2000;
      
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        // Get job status
        const response = await this.client.get(`/batch/jobs/${jobId}`);
        
        // Check if job is completed
        if (response.data.state === 'completed') {
          return this._processEmotionResults(response.data.results);
        }
        
        // Check if job failed
        if (response.data.state === 'failed') {
          throw new Error(`Hume AI job failed: ${response.data.error}`);
        }
        
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, pollingDelay));
        attempts++;
      }
      
      throw new Error('Hume AI job timed out');
    } catch (error) {
      logger.error(`Hume AI _pollJobCompletion error: ${error.message}`);
      throw new Error(`Failed to poll Hume AI job: ${error.message}`);
    }
  }

  /**
   * Process emotion results from Hume AI
   * @param {Object} results - Raw Hume AI results
   * @returns {Object} Processed emotion results
   * @private
   */
  _processEmotionResults(results) {
    try {
      // Extract prosody results
      const prosodyResults = results.prosody;
      
      if (!prosodyResults || !prosodyResults.predictions || prosodyResults.predictions.length === 0) {
        throw new Error('No emotion predictions found in Hume AI results');
      }
      
      // Extract emotion predictions
      const predictions = prosodyResults.predictions;
      
      // Format emotion data
      const emotionData = predictions.map(prediction => {
        return {
          startTime: prediction.start_time,
          endTime: prediction.end_time,
          emotions: this._extractEmotions(prediction.emotions)
        };
      });
      
      // Calculate dominant emotions
      const dominantEmotions = this._calculateDominantEmotions(emotionData);
      
      // Generate emotional journey description
      const emotionalJourney = this._generateEmotionalJourney(emotionData);
      
      return {
        emotions: emotionData,
        dominantEmotions,
        emotionalJourney
      };
    } catch (error) {
      logger.error(`Hume AI _processEmotionResults error: ${error.message}`);
      throw new Error(`Failed to process Hume AI results: ${error.message}`);
    }
  }

  /**
   * Extract emotions from Hume AI prediction
   * @param {Array} emotions - Hume AI emotion predictions
   * @returns {Map} Map of emotion names to scores
   * @private
   */
  _extractEmotions(emotions) {
    const emotionMap = new Map();
    
    emotions.forEach(emotion => {
      emotionMap.set(emotion.name, emotion.score);
    });
    
    return emotionMap;
  }

  /**
   * Calculate dominant emotions from emotion data
   * @param {Array} emotionData - Processed emotion data
   * @returns {Array} Array of dominant emotions with scores
   * @private
   */
  _calculateDominantEmotions(emotionData) {
    // Aggregate all emotion scores
    const aggregatedEmotions = new Map();
    
    emotionData.forEach(data => {
      data.emotions.forEach((score, emotion) => {
        const currentScore = aggregatedEmotions.get(emotion) || 0;
        aggregatedEmotions.set(emotion, currentScore + score);
      });
    });
    
    // Convert to array and sort by score
    const sortedEmotions = Array.from(aggregatedEmotions.entries())
      .map(([emotion, score]) => ({ emotion, score }))
      .sort((a, b) => b.score - a.score);
    
    // Return top 3 emotions
    return sortedEmotions.slice(0, 3);
  }

  /**
   * Generate emotional journey description
   * @param {Array} emotionData - Processed emotion data
   * @returns {String} Emotional journey description
   * @private
   */
  _generateEmotionalJourney(emotionData) {
    // This is a simplified version - in a real implementation, 
    // this would generate a more detailed description of the emotional journey
    
    if (emotionData.length === 0) {
      return 'No emotional journey detected';
    }
    
    if (emotionData.length === 1) {
      const topEmotion = this._getTopEmotion(emotionData[0].emotions);
      return `Consistent ${topEmotion.emotion} throughout the response`;
    }
    
    // Get top emotion at start
    const startEmotion = this._getTopEmotion(emotionData[0].emotions);
    
    // Get top emotion at end
    const endEmotion = this._getTopEmotion(emotionData[emotionData.length - 1].emotions);
    
    if (startEmotion.emotion === endEmotion.emotion) {
      return `Consistent ${startEmotion.emotion} throughout the response`;
    } else {
      return `Started with ${startEmotion.emotion} and transitioned to ${endEmotion.emotion}`;
    }
  }

  /**
   * Get top emotion from emotion map
   * @param {Map} emotions - Map of emotion names to scores
   * @returns {Object} Top emotion with name and score
   * @private
   */
  _getTopEmotion(emotions) {
    let topEmotion = '';
    let topScore = -1;
    
    emotions.forEach((score, emotion) => {
      if (score > topScore) {
        topEmotion = emotion;
        topScore = score;
      }
    });
    
    return { emotion: topEmotion, score: topScore };
  }
}

module.exports = new HumeAIService();
