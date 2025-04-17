/**
 * Visualization Service
 * Handles in-house visualization solution for sentiment analysis data
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const db = require('../utils/db');

class VisualizationService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Analyze transcription with sentiment data using Gemini API
   * @param {string} transcription - Transcription text
   * @param {Array} sentimentData - Sentiment analysis results
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeTranscription(transcription, sentimentData, options = {}) {
    try {
      logger.info('Analyzing transcription with Gemini API');
      
      const prompt = `
        Analyze the following interview transcription and sentiment data:
        
        Transcription:
        ${transcription}
        
        Sentiment Data:
        ${JSON.stringify(sentimentData)}
        
        Please provide:
        1. Key themes and topics (with sentiment for each)
        2. Emotional patterns throughout the interview
        3. Actionable insights based on the content
        4. Recommendations for follow-up
        
        Format your response as structured data that can be easily parsed.
      `;
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.2,
          maxOutputTokens: options.maxTokens || 2048
        }
      });
      
      const response = await result.response;
      const analysisText = response.text();
      
      // Process the analysis text to extract structured data
      const structuredData = this.extractStructuredData(analysisText);
      
      const analysis = {
        id: `analysis-${Date.now()}`,
        raw_text: analysisText,
        structured_data: structuredData,
        created_at: new Date().toISOString()
      };
      
      // Store analysis in database
      await this.storeAnalysis(analysis);
      
      logger.info(`Analysis completed: ${analysis.id}`);
      return analysis;
    } catch (error) {
      logger.error(`Analysis Error: ${error.message}`);
      throw new Error(`Failed to analyze transcription: ${error.message}`);
    }
  }

  /**
   * Extract structured data from analysis text
   * @param {string} analysisText - Raw analysis text from Gemini
   * @returns {Object} Structured data
   */
  extractStructuredData(analysisText) {
    try {
      // This is a simplified implementation
      // In a real system, this would use more sophisticated parsing
      
      const themes = [];
      const insights = [];
      const recommendations = [];
      const emotionalPatterns = [];
      
      // Extract themes
      const themesMatch = analysisText.match(/Key themes and topics[\s\S]*?(?=Emotional patterns|$)/i);
      if (themesMatch && themesMatch[0]) {
        const themeLines = themesMatch[0].split('\n').filter(line => line.trim().length > 0);
        themeLines.forEach(line => {
          const themeMatch = line.match(/[-*•]?\s*(.*?)(?:\(([^)]+)\))?:?\s*(.*)/);
          if (themeMatch) {
            const name = themeMatch[1]?.trim();
            const sentiment = themeMatch[2]?.trim().toLowerCase() || 
                             (line.toLowerCase().includes('positive') ? 'positive' : 
                              line.toLowerCase().includes('negative') ? 'negative' : 'neutral');
            const description = themeMatch[3]?.trim() || '';
            
            if (name && name.length > 0 && !name.toLowerCase().includes('key themes')) {
              themes.push({
                name,
                sentiment,
                description,
                confidence: this.getSentimentConfidence(sentiment)
              });
            }
          }
        });
      }
      
      // Extract emotional patterns
      const emotionsMatch = analysisText.match(/Emotional patterns[\s\S]*?(?=Actionable insights|$)/i);
      if (emotionsMatch && emotionsMatch[0]) {
        const emotionLines = emotionsMatch[0].split('\n').filter(line => line.trim().length > 0);
        emotionLines.forEach(line => {
          const emotionMatch = line.match(/[-*•]?\s*(.*)/);
          if (emotionMatch) {
            const emotionText = emotionMatch[1]?.trim();
            
            if (emotionText && emotionText.length > 0 && !emotionText.toLowerCase().includes('emotional patterns')) {
              const segment = emotionText.match(/(.*?) sentiment|at the (beginning|middle|end)/) ? 
                             (emotionText.match(/(.*?) sentiment/)?.[1] || 
                              emotionText.match(/at the (beginning|middle|end)/)?.[1] || 'general').trim() : 'general';
              
              const emotion = emotionText.toLowerCase().includes('positive') ? 'positive' : 
                             emotionText.toLowerCase().includes('negative') ? 'negative' : 
                             emotionText.toLowerCase().includes('mixed') ? 'mixed' : 'neutral';
              
              emotionalPatterns.push({
                segment,
                emotion,
                description: emotionText,
                intensity: this.getSentimentIntensity(emotion)
              });
            }
          }
        });
      }
      
      // Extract insights
      const insightsMatch = analysisText.match(/Actionable insights[\s\S]*?(?=Recommendations|$)/i);
      if (insightsMatch && insightsMatch[0]) {
        const insightLines = insightsMatch[0].split('\n').filter(line => line.trim().length > 0);
        insightLines.forEach(line => {
          const insightMatch = line.match(/[-*•]?\s*(.*)/);
          if (insightMatch) {
            const insightText = insightMatch[1]?.trim();
            
            if (insightText && insightText.length > 0 && !insightText.toLowerCase().includes('actionable insights')) {
              insights.push(insightText);
            }
          }
        });
      }
      
      // Extract recommendations
      const recommendationsMatch = analysisText.match(/Recommendations[\s\S]*?(?=$)/i);
      if (recommendationsMatch && recommendationsMatch[0]) {
        const recommendationLines = recommendationsMatch[0].split('\n').filter(line => line.trim().length > 0);
        recommendationLines.forEach(line => {
          const recommendationMatch = line.match(/[-*•]?\s*(.*)/);
          if (recommendationMatch) {
            const recommendationText = recommendationMatch[1]?.trim();
            
            if (recommendationText && recommendationText.length > 0 && !recommendationText.toLowerCase().includes('recommendations')) {
              recommendations.push(recommendationText);
            }
          }
        });
      }
      
      return {
        themes,
        emotional_patterns: emotionalPatterns,
        insights,
        recommendations
      };
    } catch (error) {
      logger.error(`Extract Structured Data Error: ${error.message}`);
      return {
        themes: [],
        emotional_patterns: [],
        insights: [],
        recommendations: []
      };
    }
  }

  /**
   * Get sentiment confidence value
   * @param {string} sentiment - Sentiment label
   * @returns {number} Confidence value
   */
  getSentimentConfidence(sentiment) {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 0.8;
      case 'negative':
        return 0.7;
      case 'mixed':
        return 0.6;
      case 'neutral':
      default:
        return 0.5;
    }
  }

  /**
   * Get sentiment intensity value
   * @param {string} emotion - Emotion label
   * @returns {number} Intensity value
   */
  getSentimentIntensity(emotion) {
    switch (emotion.toLowerCase()) {
      case 'positive':
        return 0.8;
      case 'negative':
        return 0.7;
      case 'mixed':
        return 0.6;
      case 'neutral':
      default:
        return 0.5;
    }
  }

  /**
   * Store analysis in database
   * @param {Object} analysis - Analysis object
   * @returns {Promise<void>}
   */
  async storeAnalysis(analysis) {
    try {
      await db.collection('analyses').insertOne(analysis);
      logger.info(`Analysis stored in database: ${analysis.id}`);
    } catch (error) {
      logger.error(`Store Analysis Error: ${error.message}`);
      throw new Error(`Failed to store analysis: ${error.message}`);
    }
  }

  /**
   * Generate visualization data from transcription, sentiment data, and analysis
   * @param {string} transcription - Transcription text
   * @param {Array} sentimentData - Sentiment analysis results
   * @param {Object} analysis - Analysis results
   * @returns {Promise<Object>} Visualization data
   */
  async generateVisualizationData(transcription, sentimentData, analysis) {
    try {
      logger.info('Generating visualization data');
      
      // Generate sentiment over time data
      const sentimentOverTime = this.generateSentimentOverTimeData(sentimentData);
      
      // Generate topic clusters from themes
      const topicClusters = this.generateTopicClustersData(analysis.structured_data.themes);
      
      // Calculate emotion distribution
      const emotionDistribution = this.calculateEmotionDistribution(sentimentData);
      
      // Generate word frequency data
      const wordFrequency = this.generateWordFrequencyData(transcription);
      
      const visualizationData = {
        id: `visualization-${Date.now()}`,
        sentiment_over_time: sentimentOverTime,
        topic_clusters: topicClusters,
        emotion_distribution: emotionDistribution,
        word_frequency: wordFrequency,
        created_at: new Date().toISOString()
      };
      
      // Store visualization data in database
      await this.storeVisualizationData(visualizationData);
      
      logger.info(`Visualization data generated: ${visualizationData.id}`);
      return visualizationData;
    } catch (error) {
      logger.error(`Generate Visualization Data Error: ${error.message}`);
      throw new Error(`Failed to generate visualization data: ${error.message}`);
    }
  }

  /**
   * Generate sentiment over time data
   * @param {Array} sentimentData - Sentiment analysis results
   * @returns {Array} Sentiment over time data
   */
  generateSentimentOverTimeData(sentimentData) {
    return sentimentData.map((item, index) => ({
      timestamp: item.start || index,
      sentiment: this.sentimentToValue(item.sentiment),
      text: item.text || '',
      confidence: item.confidence || 0.5
    }));
  }

  /**
   * Generate topic clusters data from themes
   * @param {Array} themes - Themes from analysis
   * @returns {Array} Topic clusters data
   */
  generateTopicClustersData(themes) {
    return themes.map(theme => ({
      name: theme.name,
      size: this.calculateThemeSize(theme),
      sentiment: this.sentimentToValue(theme.sentiment),
      confidence: theme.confidence || 0.5
    }));
  }

  /**
   * Calculate emotion distribution from sentiment data
   * @param {Array} sentimentData - Sentiment analysis results
   * @returns {Object} Emotion distribution
   */
  calculateEmotionDistribution(sentimentData) {
    const emotions = sentimentData.reduce((acc, item) => {
      const sentiment = item.sentiment.toLowerCase();
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});
    
    const totalEmotions = Object.values(emotions).reduce((sum, count) => sum + count, 0);
    
    return {
      positive: Math.round(((emotions.positive || 0) / totalEmotions) * 100),
      negative: Math.round(((emotions.negative || 0) / totalEmotions) * 100),
      neutral: Math.round(((emotions.neutral || 0) / totalEmotions) * 100),
      mixed: Math.round(((emotions.mixed || 0) / totalEmotions) * 100)
    };
  }

  /**
   * Generate word frequency data from transcription
   * @param {string} transcription - Transcription text
   * @returns {Array} Word frequency data
   */
  generateWordFrequencyData(transcription) {
    // Remove common stop words
    const stopWords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
      'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
      'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
      'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
      'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by',
      'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over',
      'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
      'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
      'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can',
      'will', 'just', 'don', 'should', 'now'];
    
    // Clean and tokenize text
    const words = transcription.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    // Count word frequency
    const wordCounts = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array and sort by frequency
    const wordFrequency = Object.entries(wordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30); // Limit to top 30 words
    
    return wordFrequency;
  }

  /**
   * Calculate theme size based on confidence and description length
   * @param {Object} theme - Theme object
   * @returns {number} Theme size
   */
  calculateThemeSize(theme) {
    const baseSize = 20;
    const confidenceBoost = (theme.confidence || 0.5) * 20;
    const descriptionBoost = theme.description ? Math.min(theme.description.length / 10, 10) : 0;
    
    return Math.round(baseSize + confidenceBoost + descriptionBoost);
  }

  /**
   * Convert sentiment label to numeric value
   * @param {string} sentiment - Sentiment label
   * @returns {number} Sentiment value
   */
  sentimentToValue(sentiment) {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 0.7;
      case 'negative':
        return -0.7;
      case 'mixed':
        return 0.0;
      case 'neutral':
      default:
        return 0.1;
    }
  }

  /**
   * Store visualization data in database
   * @param {Object} visualizationData - Visualization data
   * @returns {Promise<void>}
   */
  async storeVisualizationData(visualizationData) {
    try {
      await db.collection('visualizations').insertOne(visualizationData);
      logger.info(`Visualization data stored in database: ${visualizationData.id}`);
    } catch (error) {
      logger.error(`Store Visualization Data Error: ${error.message}`);
      throw new Error(`Failed to store visualization data: ${error.message}`);
    }
  }

  /**
   * Get analysis by ID
   * @param {string} analysisId - Analysis ID
   * @returns {Promise<Object>} Analysis object
   */
  async getAnalysis(analysisId) {
    try {
      const analysis = await db.collection('analyses').findOne({ id: analysisId });
      
      if (!analysis) {
        throw new Error(`Analysis not found: ${analysisId}`);
      }
      
      return analysis;
    } catch (error) {
      logger.error(`Get Analysis Error: ${error.message}`);
      throw new Error(`Failed to get analysis: ${error.message}`);
    }
  }

  /**
   * Get visualization data by I
(Content truncated due to size limit. Use line ranges to read in chunks)