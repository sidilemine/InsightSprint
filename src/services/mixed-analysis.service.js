import axios from 'axios';
import { logger } from '../utils/logger';
import { config } from '../config/config';
import { humeAiService } from './hume-ai.service';
import { geminiService } from './gemini.service';

/**
 * Service for mixed emotion-language analysis
 * Combines voice emotion recognition with language processing
 */
class MixedAnalysisService {
  /**
   * Analyze a voice response for both emotional and language content
   * @param {string} audioUrl - URL of the audio file to analyze
   * @param {string} transcription - Text transcription of the audio
   * @returns {Promise<Object>} - Combined analysis results
   */
  async analyzeResponse(audioUrl, transcription) {
    try {
      logger.info(`Starting mixed analysis for response: ${audioUrl}`);
      
      // Run emotion and language analyses in parallel for efficiency
      const [emotionResults, languageResults] = await Promise.all([
        this.getEmotionAnalysis(audioUrl),
        this.getLanguageAnalysis(transcription)
      ]);
      
      // Combine the results with correlation analysis
      const combinedResults = this.correlateResults(emotionResults, languageResults);
      
      logger.info(`Completed mixed analysis for response: ${audioUrl}`);
      return combinedResults;
    } catch (error) {
      logger.error(`Error in mixed analysis: ${error.message}`);
      throw new Error(`Mixed analysis failed: ${error.message}`);
    }
  }
  
  /**
   * Get emotion analysis from Hume AI
   * @param {string} audioUrl - URL of the audio file to analyze
   * @returns {Promise<Object>} - Emotion analysis results
   */
  async getEmotionAnalysis(audioUrl) {
    try {
      // Use the Hume AI service to analyze emotions in the voice recording
      const emotionResults = await humeAiService.analyzeVoiceEmotion(audioUrl);
      return emotionResults;
    } catch (error) {
      logger.error(`Error in emotion analysis: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get language analysis from Gemini API
   * @param {string} transcription - Text transcription to analyze
   * @returns {Promise<Object>} - Language analysis results
   */
  async getLanguageAnalysis(transcription) {
    try {
      // Use the Gemini service to analyze language sentiment and themes
      const languageResults = await geminiService.analyzeText(transcription);
      return languageResults;
    } catch (error) {
      logger.error(`Error in language analysis: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Correlate emotion and language results to find patterns and insights
   * @param {Object} emotionResults - Results from emotion analysis
   * @param {Object} languageResults - Results from language analysis
   * @returns {Object} - Correlated analysis with insights
   */
  correlateResults(emotionResults, languageResults) {
    try {
      // Extract primary data from both analyses
      const { emotions, emotionIntensities } = emotionResults;
      const { sentiment, themes } = languageResults;
      
      // Create emotion-language correlation data
      const correlationData = this.createCorrelationData(emotions, sentiment);
      
      // Identify emotional contradictions
      const contradictions = this.identifyContradictions(emotions, sentiment);
      
      // Connect themes with emotions
      const themeEmotionConnections = this.connectThemesWithEmotions(themes, emotions);
      
      // Generate insights based on the combined analysis
      const insights = this.generateInsights(
        emotions, 
        emotionIntensities, 
        sentiment, 
        themes, 
        contradictions
      );
      
      // Create strategic recommendations
      const recommendations = this.createRecommendations(
        contradictions,
        themeEmotionConnections,
        emotionIntensities
      );
      
      return {
        emotionResults,
        languageResults,
        correlationData,
        contradictions,
        themeEmotionConnections,
        insights,
        recommendations
      };
    } catch (error) {
      logger.error(`Error in correlation analysis: ${error.message}`);
      throw new Error(`Correlation analysis failed: ${error.message}`);
    }
  }
  
  /**
   * Create correlation data between emotions and language sentiment
   * @param {Array} emotions - Detected emotions
   * @param {Object} sentiment - Language sentiment analysis
   * @returns {Array} - Correlation data for visualization
   */
  createCorrelationData(emotions, sentiment) {
    // Initialize correlation data structure
    const correlationData = emotions.map(emotion => ({
      emotion: emotion.name,
      positiveLanguage: 0,
      neutralLanguage: 0,
      negativeLanguage: 0
    }));
    
    // Calculate correlation percentages based on emotion and sentiment overlap
    // This is a simplified version - in production, this would use more sophisticated algorithms
    correlationData.forEach(item => {
      const emotion = emotions.find(e => e.name === item.emotion);
      
      // Default distribution based on typical patterns
      if (emotion.name === 'Joy' || emotion.name === 'Surprise') {
        item.positiveLanguage = 70;
        item.neutralLanguage = 20;
        item.negativeLanguage = 10;
      } else if (emotion.name === 'Sadness' || emotion.name === 'Anger' || 
                 emotion.name === 'Fear' || emotion.name === 'Disgust') {
        item.positiveLanguage = 10;
        item.neutralLanguage = 20;
        item.negativeLanguage = 70;
      } else {
        // Neutral emotion
        item.positiveLanguage = 33;
        item.neutralLanguage = 34;
        item.negativeLanguage = 33;
      }
      
      // Adjust based on actual sentiment
      if (sentiment.positive > 0.6) {
        item.positiveLanguage += 15;
        item.negativeLanguage -= 10;
        item.neutralLanguage -= 5;
      } else if (sentiment.negative > 0.6) {
        item.negativeLanguage += 15;
        item.positiveLanguage -= 10;
        item.neutralLanguage -= 5;
      }
      
      // Ensure values are within bounds
      item.positiveLanguage = Math.max(0, Math.min(100, item.positiveLanguage));
      item.neutralLanguage = Math.max(0, Math.min(100, item.neutralLanguage));
      item.negativeLanguage = Math.max(0, Math.min(100, item.negativeLanguage));
      
      // Ensure they sum to 100%
      const total = item.positiveLanguage + item.neutralLanguage + item.negativeLanguage;
      item.positiveLanguage = Math.round((item.positiveLanguage / total) * 100);
      item.neutralLanguage = Math.round((item.neutralLanguage / total) * 100);
      item.negativeLanguage = 100 - item.positiveLanguage - item.neutralLanguage;
    });
    
    return correlationData;
  }
  
  /**
   * Identify contradictions between emotions and language
   * @param {Array} emotions - Detected emotions
   * @param {Object} sentiment - Language sentiment analysis
   * @returns {Array} - List of contradictions
   */
  identifyContradictions(emotions, sentiment) {
    const contradictions = [];
    
    // Define expected sentiment for each emotion
    const expectedSentiment = {
      'Joy': 'positive',
      'Surprise': 'mixed',
      'Sadness': 'negative',
      'Anger': 'negative',
      'Fear': 'negative',
      'Disgust': 'negative',
      'Neutral': 'neutral'
    };
    
    // Determine actual sentiment
    let actualSentiment;
    if (sentiment.positive > sentiment.negative && sentiment.positive > sentiment.neutral) {
      actualSentiment = 'positive';
    } else if (sentiment.negative > sentiment.positive && sentiment.negative > sentiment.neutral) {
      actualSentiment = 'negative';
    } else {
      actualSentiment = 'neutral';
    }
    
    // Check for contradictions
    emotions.forEach(emotion => {
      const expected = expectedSentiment[emotion.name];
      
      // If expected is 'mixed', it's not a contradiction
      if (expected !== 'mixed' && expected !== actualSentiment) {
        contradictions.push({
          emotion: emotion.name,
          intensity: emotion.intensity,
          expectedSentiment: expected,
          actualSentiment: actualSentiment,
          significance: emotion.intensity * Math.abs(sentiment[expected] - sentiment[actualSentiment])
        });
      }
    });
    
    // Sort by significance
    return contradictions.sort((a, b) => b.significance - a.significance);
  }
  
  /**
   * Connect themes with emotions
   * @param {Array} themes - Identified themes
   * @param {Array} emotions - Detected emotions
   * @returns {Array} - Theme-emotion connections
   */
  connectThemesWithEmotions(themes, emotions) {
    // Create connections between themes and emotions
    return themes.map(theme => {
      // Find emotions that occur in the same segments as this theme
      // This is a simplified approach - in production, we would use more sophisticated methods
      const connectedEmotions = emotions
        .filter(emotion => Math.random() > 0.5) // Simplified random connection for demo
        .map(emotion => ({
          name: emotion.name,
          intensity: emotion.intensity,
          confidence: Math.random() * 0.5 + 0.5 // Random confidence between 0.5 and 1.0
        }))
        .sort((a, b) => b.confidence - a.confidence);
      
      return {
        theme: theme.text,
        sentiment: theme.sentiment,
        emotions: connectedEmotions
      };
    });
  }
  
  /**
   * Generate insights based on the combined analysis
   * @param {Array} emotions - Detected emotions
   * @param {Array} emotionIntensities - Emotion intensity data
   * @param {Object} sentiment - Language sentiment
   * @param {Array} themes - Identified themes
   * @param {Array} contradictions - Identified contradictions
   * @returns {Array} - List of insights
   */
  generateInsights(emotions, emotionIntensities, sentiment, themes, contradictions) {
    const insights = [];
    
    // Insight 1: Primary emotional response
    const primaryEmotion = emotions.sort((a, b) => b.intensity - a.intensity)[0];
    insights.push({
      type: 'primary_emotion',
      title: 'Primary Emotional Response',
      description: `The dominant emotion detected is ${primaryEmotion.name} with an intensity of ${(primaryEmotion.intensity * 100).toFixed(0)}%.`,
      significance: primaryEmotion.intensity
    });
    
    // Insight 2: Sentiment-emotion alignment
    if (contradictions.length > 0) {
      const topContradiction = contradictions[0];
      insights.push({
        type: 'contradiction',
        title: 'Emotional Contradiction Detected',
        description: `The voice expresses ${topContradiction.emotion} but the language is ${topContradiction.actualSentiment}, suggesting a potential disconnect between stated opinion and emotional response.`,
        significance: topContradiction.significance
      });
    } else {
      insights.push({
        type: 'alignment',
        title: 'Aligned Emotional Response',
        description: 'The emotional tone of voice aligns with the sentiment expressed in language, indicating authentic feedback.',
        significance: 0.7
      });
    }
    
    // Insight 3: Theme-emotion connection
    if (themes.length > 0 && emotions.length > 0) {
      const topTheme = themes[0];
      insights.push({
        type: 'theme_emotion',
        title: 'Key Theme-Emotion Connection',
        description: `The theme "${topTheme.text}" appears to trigger ${emotions[0].name} responses, suggesting this aspect has significant emotional impact.`,
        significance: 0.8
      });
    }
    
    // Insight 4: Intensity analysis
    const highIntensityEmotions = emotions.filter(e => e.intensity > 0.7);
    if (highIntensityEmotions.length > 0) {
      insights.push({
        type: 'high_intensity',
        title: 'High Emotional Intensity',
        description: `Strong emotional intensity detected for ${highIntensityEmotions.map(e => e.name).join(', ')}, indicating aspects that evoke powerful responses.`,
        significance: 0.9
      });
    }
    
    // Sort by significance
    return insights.sort((a, b) => b.significance - a.significance);
  }
  
  /**
   * Create strategic recommendations based on analysis
   * @param {Array} contradictions - Identified contradictions
   * @param {Array} themeEmotionConnections - Theme-emotion connections
   * @param {Array} emotionIntensities - Emotion intensity data
   * @returns {Array} - Strategic recommendations
   */
  createRecommendations(contradictions, themeEmotionConnections, emotionIntensities) {
    const recommendations = [];
    
    // Recommendation 1: Address contradictions
    if (contradictions.length > 0) {
      recommendations.push({
        type: 'address_contradiction',
        title: 'Address Emotional Contradictions',
        description: `Further investigate why ${contradictions[0].emotion} is expressed vocally while language is ${contradictions[0].actualSentiment}. This may indicate unmet expectations or unstated concerns.`,
        priority: 'high'
      });
    }
    
    // Recommendation 2: Leverage positive themes
    const positiveThemes = themeEmotionConnections.filter(t => t.sentiment === 'positive');
    if (positiveThemes.length > 0) {
      recommendations.push({
        type: 'leverage_positive',
        title: 'Leverage Positive Themes',
        description: `Emphasize "${positiveThemes[0].theme}" in marketing and product development, as it generates positive emotional responses.`,
        priority: 'medium'
      });
    }
    
    // Recommendation 3: Address negative themes
    const negativeThemes = themeEmotionConnections.filter(t => t.sentiment === 'negative');
    if (negativeThemes.length > 0) {
      recommendations.push({
        type: 'address_negative',
        title: 'Address Negative Themes',
        description: `Prioritize improvements to "${negativeThemes[0].theme}" as it generates negative emotional responses.`,
        priority: 'high'
      });
    }
    
    // Recommendation 4: Emotional intensity focus
    const highIntensityEmotions = emotionIntensities.filter(e => e.intensity > 0.7);
    if (highIntensityEmotions.length > 0) {
      const emotion = highIntensityEmotions[0];
      if (['Joy', 'Surprise'].includes(emotion.name)) {
        recommendations.push({
          type: 'leverage_intensity',
          title: 'Leverage High-Intensity Positive Emotions',
          description: `The strong ${emotion.name} response indicates powerful positive engagement. Identify what triggers this response and amplify it in product and marketing.`,
          priority: 'medium'
        });
      } else if (['Anger', 'Sadness', 'Fear', 'Disgust'].includes(emotion.name)) {
        recommendations.push({
          type: 'address_intensity',
          title: 'Address High-Intensity Negative Emotions',
          description: `The strong ${emotion.name} response indicates significant issues that require immediate attention to prevent customer dissatisfaction.`,
          priority: 'high'
        });
      }
    }
    
    // Sort by priority
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
  
  /**
   * Analyze multiple responses and aggregate the results
   * @param {Array} responses - Array of response objects with audioUrl and transcription
   * @returns {Promise<Object>} - Aggregated analysis results
   */
  async analyzeMultipleResponses(responses) {
    try {
      logger.info(`Starting batch analysis for ${responses.length} responses`);
      
      // Analyze each response individually
      const analysisPromises = responses.map(response => 
        this.analyzeResponse(response.audioUrl, response.transcription)
      );
      
      // Wait for all analyses to complete
      const analysisResults = await Promise.all(analysisPromises);
      
      // Aggregate the results
      const aggregatedResults = this
(Content truncated due to size limit. Use line ranges to read in chunks)