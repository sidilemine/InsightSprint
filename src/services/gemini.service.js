const axios = require('axios');
const config = require('../config/config');
const { setupLogging } = require('../utils/logger');

const logger = setupLogging();

/**
 * Gemini API service for natural language processing and analysis
 */
class GeminiService {
  constructor() {
    this.apiKey = config.GEMINI_API_KEY;
    this.apiUrl = config.GEMINI_API_URL;
    this.model = 'gemini-1.5-pro';
    this.client = axios.create({
      baseURL: this.apiUrl,
      params: {
        key: this.apiKey
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Analyze text for sentiment, themes, and insights
   * @param {String} text - Text to analyze
   * @param {Object} context - Additional context (e.g., product category, question)
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeText(text, context = {}) {
    try {
      if (!text || text.trim() === '') {
        throw new Error('Text is required for analysis');
      }

      const { productCategory, question, targetAudience } = context;
      
      // Create prompt for Gemini
      const prompt = this._createAnalysisPrompt(text, productCategory, question, targetAudience);
      
      // Make API request
      const response = await this.client.post(`/models/${this.model}:generateContent`, {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048
        }
      });
      
      // Process response
      return this._processAnalysisResponse(response.data);
    } catch (error) {
      logger.error(`Gemini analyzeText error: ${error.message}`);
      throw new Error(`Failed to analyze text with Gemini: ${error.message}`);
    }
  }

  /**
   * Generate insights from multiple responses
   * @param {Array} responses - Array of response objects
   * @param {Object} context - Additional context (e.g., product category, interview)
   * @returns {Promise<Object>} Aggregated insights
   */
  async generateInsights(responses, context = {}) {
    try {
      if (!responses || !Array.isArray(responses) || responses.length === 0) {
        throw new Error('Responses are required for insight generation');
      }

      const { productCategory, targetAudience, objectives } = context;
      
      // Extract text and emotion data from responses
      const responseData = responses.map(response => {
        return {
          questionText: response.question?.text || '',
          textResponse: response.textResponse || response.transcription || '',
          emotions: response.emotionAnalysis?.dominantEmotions || []
        };
      });
      
      // Create prompt for Gemini
      const prompt = this._createInsightsPrompt(responseData, productCategory, targetAudience, objectives);
      
      // Make API request
      const response = await this.client.post(`/models/${this.model}:generateContent`, {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 4096
        }
      });
      
      // Process response
      return this._processInsightsResponse(response.data);
    } catch (error) {
      logger.error(`Gemini generateInsights error: ${error.message}`);
      throw new Error(`Failed to generate insights with Gemini: ${error.message}`);
    }
  }

  /**
   * Generate follow-up questions based on a response
   * @param {Object} response - Response object
   * @param {Object} context - Additional context
   * @returns {Promise<String>} Follow-up question
   */
  async generateFollowUpQuestion(response, context = {}) {
    try {
      if (!response) {
        throw new Error('Response is required for follow-up question generation');
      }

      const { productCategory, question, interviewObjectives } = context;
      
      // Extract text and emotion data from response
      const textResponse = response.textResponse || response.transcription || '';
      const emotions = response.emotionAnalysis?.dominantEmotions || [];
      
      // Create prompt for Gemini
      const prompt = this._createFollowUpPrompt(textResponse, emotions, question, productCategory, interviewObjectives);
      
      // Make API request
      const apiResponse = await this.client.post(`/models/${this.model}:generateContent`, {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024
        }
      });
      
      // Extract follow-up question from response
      const followUpQuestion = this._extractFollowUpQuestion(apiResponse.data);
      
      return followUpQuestion;
    } catch (error) {
      logger.error(`Gemini generateFollowUpQuestion error: ${error.message}`);
      throw new Error(`Failed to generate follow-up question with Gemini: ${error.message}`);
    }
  }

  /**
   * Create prompt for text analysis
   * @param {String} text - Text to analyze
   * @param {String} productCategory - Product category
   * @param {String} question - Question that prompted the response
   * @param {String} targetAudience - Target audience
   * @returns {String} Prompt for Gemini
   * @private
   */
  _createAnalysisPrompt(text, productCategory, question, targetAudience) {
    return `
You are an expert sentiment and language analyst specializing in consumer insights for the ${productCategory || 'consumer products'} industry.

Analyze the following consumer response to the question: "${question || 'Not provided'}"

Target audience: ${targetAudience || 'General consumers'}

RESPONSE TEXT:
"""
${text}
"""

Provide a structured analysis in JSON format with the following elements:
1. Overall sentiment (positive, negative, neutral, or mixed)
2. Sentiment score (-1.0 to 1.0)
3. Key themes (list of themes with relevance scores from 0.0 to 1.0)
4. Entities mentioned (products, brands, features) with their sentiment
5. Emotional tone of the language
6. Key insights from the response
7. Implications for product/marketing strategy

Format your response as valid JSON only, with no additional text or explanation.
`;
  }

  /**
   * Create prompt for generating insights from multiple responses
   * @param {Array} responseData - Array of response data
   * @param {String} productCategory - Product category
   * @param {String} targetAudience - Target audience
   * @param {String} objectives - Research objectives
   * @returns {String} Prompt for Gemini
   * @private
   */
  _createInsightsPrompt(responseData, productCategory, targetAudience, objectives) {
    // Format response data for the prompt
    const formattedResponses = responseData.map((response, index) => {
      const emotionsText = response.emotions.map(e => `${e.emotion}: ${e.score.toFixed(2)}`).join(', ');
      
      return `
RESPONSE #${index + 1}:
Question: "${response.questionText}"
Text: "${response.textResponse}"
Emotions: ${emotionsText || 'Not available'}
`;
    }).join('\n');

    return `
You are an expert consumer insights analyst specializing in the ${productCategory || 'consumer products'} industry.

RESEARCH CONTEXT:
Product Category: ${productCategory || 'Not specified'}
Target Audience: ${targetAudience || 'General consumers'}
Research Objectives: ${objectives || 'Understand consumer sentiment and preferences'}

I have collected the following consumer responses from interviews:

${formattedResponses}

Based on these responses, provide a comprehensive analysis in JSON format with the following elements:
1. Key themes across all responses (with relevance scores from 0.0 to 1.0)
2. Sentiment distribution (percentage of positive, negative, neutral, and mixed responses)
3. Emotional patterns detected (which emotions were most prevalent)
4. Key insights (the most important findings from the data)
5. Recommendations for product/marketing strategy (at least 3, prioritized as high, medium, or low)
6. Supporting evidence for each recommendation

Format your response as valid JSON only, with no additional text or explanation.
`;
  }

  /**
   * Create prompt for generating follow-up questions
   * @param {String} textResponse - Text response
   * @param {Array} emotions - Dominant emotions
   * @param {String} question - Original question
   * @param {String} productCategory - Product category
   * @param {String} interviewObjectives - Interview objectives
   * @returns {String} Prompt for Gemini
   * @private
   */
  _createFollowUpPrompt(textResponse, emotions, question, productCategory, interviewObjectives) {
    const emotionsText = emotions.map(e => `${e.emotion}: ${e.score.toFixed(2)}`).join(', ');

    return `
You are an expert AI interviewer specializing in consumer research for the ${productCategory || 'consumer products'} industry.

INTERVIEW CONTEXT:
Original Question: "${question || 'Not provided'}"
Interview Objectives: ${interviewObjectives || 'Understand consumer sentiment and preferences'}
Product Category: ${productCategory || 'Not specified'}

The respondent has provided the following answer:
"""
${textResponse}
"""

Emotional analysis of their response: ${emotionsText || 'Not available'}

Based on this response and the detected emotions, generate ONE follow-up question that will:
1. Dig deeper into their answer
2. Explore the emotional aspects of their response
3. Uncover additional insights relevant to the product category
4. Be conversational and empathetic in tone
5. Be open-ended to encourage elaboration

The follow-up question should be directly related to what they've shared and should feel like a natural continuation of the conversation. Keep it concise (1-2 sentences maximum).

Provide ONLY the follow-up question with no additional text, explanation, or formatting.
`;
  }

  /**
   * Process response from text analysis
   * @param {Object} responseData - Response data from Gemini
   * @returns {Object} Processed analysis results
   * @private
   */
  _processAnalysisResponse(responseData) {
    try {
      if (!responseData.candidates || responseData.candidates.length === 0) {
        throw new Error('No candidates in Gemini response');
      }
      
      const candidate = responseData.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('No content in Gemini response candidate');
      }
      
      const content = candidate.content.parts[0].text;
      
      // Parse JSON from response
      const analysisResults = JSON.parse(content);
      
      return {
        sentiment: analysisResults.sentiment || 'neutral',
        sentimentScore: analysisResults.sentimentScore || 0,
        keyThemes: analysisResults.keyThemes || [],
        entities: analysisResults.entities || [],
        emotionalTone: analysisResults.emotionalTone || '',
        keyInsights: analysisResults.keyInsights || [],
        implications: analysisResults.implications || []
      };
    } catch (error) {
      logger.error(`Gemini _processAnalysisResponse error: ${error.message}`);
      throw new Error(`Failed to process Gemini analysis response: ${error.message}`);
    }
  }

  /**
   * Process response from insights generation
   * @param {Object} responseData - Response data from Gemini
   * @returns {Object} Processed insights
   * @private
   */
  _processInsightsResponse(responseData) {
    try {
      if (!responseData.candidates || responseData.candidates.length === 0) {
        throw new Error('No candidates in Gemini response');
      }
      
      const candidate = responseData.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('No content in Gemini response candidate');
      }
      
      const content = candidate.content.parts[0].text;
      
      // Parse JSON from response
      const insightsResults = JSON.parse(content);
      
      return {
        keyThemes: insightsResults.keyThemes || [],
        sentimentDistribution: insightsResults.sentimentDistribution || {},
        emotionalPatterns: insightsResults.emotionalPatterns || [],
        keyInsights: insightsResults.keyInsights || [],
        recommendations: insightsResults.recommendations || [],
        supportingEvidence: insightsResults.supportingEvidence || {}
      };
    } catch (error) {
      logger.error(`Gemini _processInsightsResponse error: ${error.message}`);
      throw new Error(`Failed to process Gemini insights response: ${error.message}`);
    }
  }

  /**
   * Extract follow-up question from response
   * @param {Object} responseData - Response data from Gemini
   * @returns {String} Follow-up question
   * @private
   */
  _extractFollowUpQuestion(responseData) {
    try {
      if (!responseData.candidates || responseData.candidates.length === 0) {
        throw new Error('No candidates in Gemini response');
      }
      
      const candidate = responseData.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('No content in Gemini response candidate');
      }
      
      const content = candidate.content.parts[0].text;
      
      // Clean up the response
      return content.trim();
    } catch (error) {
      logger.error(`Gemini _extractFollowUpQuestion error: ${error.message}`);
      throw new Error(`Failed to extract follow-up question from Gemini response: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();
