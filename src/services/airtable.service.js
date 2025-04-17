const Airtable = require('airtable');
const config = require('../config/config');
const { setupLogging } = require('../utils/logger');

const logger = setupLogging();

/**
 * Airtable service for data storage and management
 */
class AirtableService {
  constructor() {
    this.apiKey = config.AIRTABLE_API_KEY;
    this.baseId = config.AIRTABLE_BASE_ID;
    
    // Initialize Airtable
    Airtable.configure({
      apiKey: this.apiKey
    });
    
    this.base = Airtable.base(this.baseId);
  }

  /**
   * Store project data in Airtable
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Airtable record
   */
  async storeProject(projectData) {
    try {
      const { 
        _id, 
        name, 
        description, 
        productCategory, 
        targetAudience, 
        objectives, 
        status,
        targetResponseCount,
        currentResponseCount,
        client,
        createdBy
      } = projectData;

      // Create record in Projects table
      const record = await this.base('Projects').create({
        'Project ID': _id.toString(),
        'Name': name,
        'Description': description,
        'Product Category': productCategory,
        'Target Audience': targetAudience,
        'Objectives': objectives,
        'Status': status,
        'Target Response Count': targetResponseCount,
        'Current Response Count': currentResponseCount,
        'Client ID': client.toString(),
        'Created By': createdBy.toString(),
        'Created At': new Date().toISOString()
      });

      return record;
    } catch (error) {
      logger.error(`Airtable storeProject error: ${error.message}`);
      throw new Error(`Failed to store project in Airtable: ${error.message}`);
    }
  }

  /**
   * Store interview data in Airtable
   * @param {Object} interviewData - Interview data
   * @returns {Promise<Object>} Airtable record
   */
  async storeInterview(interviewData) {
    try {
      const { 
        _id, 
        project, 
        title, 
        description, 
        status,
        responseCount,
        publicAccessCode,
        createdBy
      } = interviewData;

      // Create record in Interviews table
      const record = await this.base('Interviews').create({
        'Interview ID': _id.toString(),
        'Project ID': project.toString(),
        'Title': title,
        'Description': description,
        'Status': status,
        'Response Count': responseCount,
        'Public Access Code': publicAccessCode,
        'Created By': createdBy.toString(),
        'Created At': new Date().toISOString()
      });

      return record;
    } catch (error) {
      logger.error(`Airtable storeInterview error: ${error.message}`);
      throw new Error(`Failed to store interview in Airtable: ${error.message}`);
    }
  }

  /**
   * Store response data in Airtable
   * @param {Object} responseData - Response data
   * @returns {Promise<Object>} Airtable record
   */
  async storeResponse(responseData) {
    try {
      const { 
        _id, 
        interview, 
        question,
        respondent,
        textResponse,
        transcription,
        audioUrl,
        processingStatus,
        emotionAnalysis,
        languageAnalysis
      } = responseData;

      // Format emotion analysis for Airtable
      let emotionData = '';
      if (emotionAnalysis && emotionAnalysis.dominantEmotions) {
        emotionData = emotionAnalysis.dominantEmotions
          .map(e => `${e.emotion}: ${e.score.toFixed(2)}`)
          .join(', ');
      }

      // Format language analysis for Airtable
      let sentimentData = '';
      if (languageAnalysis) {
        sentimentData = `${languageAnalysis.sentiment} (${languageAnalysis.sentimentScore})`;
      }

      // Create record in Responses table
      const record = await this.base('Responses').create({
        'Response ID': _id.toString(),
        'Interview ID': interview.toString(),
        'Question ID': question.questionId,
        'Question Text': question.text,
        'Respondent ID': respondent.id,
        'Text Response': textResponse || transcription || '',
        'Audio URL': audioUrl || '',
        'Processing Status': processingStatus,
        'Dominant Emotions': emotionData,
        'Sentiment': sentimentData,
        'Created At': new Date().toISOString()
      });

      return record;
    } catch (error) {
      logger.error(`Airtable storeResponse error: ${error.message}`);
      throw new Error(`Failed to store response in Airtable: ${error.message}`);
    }
  }

  /**
   * Store analysis data in Airtable
   * @param {Object} analysisData - Analysis data
   * @returns {Promise<Object>} Airtable record
   */
  async storeAnalysis(analysisData) {
    try {
      const { 
        _id, 
        project, 
        interview, 
        title,
        description,
        status,
        responseCount,
        dominantEmotions,
        sentimentDistribution,
        keyThemes,
        keyInsights,
        recommendations,
        createdBy
      } = analysisData;

      // Format dominant emotions for Airtable
      let emotionsData = '';
      if (dominantEmotions && Array.isArray(dominantEmotions)) {
        emotionsData = dominantEmotions
          .map(e => `${e.emotion}: ${e.score.toFixed(2)}`)
          .join(', ');
      }

      // Format key themes for Airtable
      let themesData = '';
      if (keyThemes && Array.isArray(keyThemes)) {
        themesData = keyThemes
          .map(t => `${t.theme} (${t.relevance.toFixed(2)})`)
          .join(', ');
      }

      // Format key insights for Airtable
      let insightsData = '';
      if (keyInsights && Array.isArray(keyInsights)) {
        insightsData = keyInsights
          .map(i => i.insight)
          .join('\n');
      }

      // Format recommendations for Airtable
      let recommendationsData = '';
      if (recommendations && Array.isArray(recommendations)) {
        recommendationsData = recommendations
          .map(r => `[${r.priority}] ${r.recommendation}`)
          .join('\n');
      }

      // Create record in Analyses table
      const record = await this.base('Analyses').create({
        'Analysis ID': _id.toString(),
        'Project ID': project.toString(),
        'Interview ID': interview.toString(),
        'Title': title,
        'Description': description,
        'Status': status,
        'Response Count': responseCount,
        'Dominant Emotions': emotionsData,
        'Key Themes': themesData,
        'Key Insights': insightsData,
        'Recommendations': recommendationsData,
        'Created By': createdBy.toString(),
        'Created At': new Date().toISOString()
      });

      return record;
    } catch (error) {
      logger.error(`Airtable storeAnalysis error: ${error.message}`);
      throw new Error(`Failed to store analysis in Airtable: ${error.message}`);
    }
  }

  /**
   * Get project data from Airtable
   * @param {String} projectId - Project ID
   * @returns {Promise<Object>} Project data
   */
  async getProject(projectId) {
    try {
      const records = await this.base('Projects').select({
        filterByFormula: `{Project ID} = '${projectId}'`
      }).firstPage();

      if (!records || records.length === 0) {
        throw new Error(`Project not found in Airtable: ${projectId}`);
      }

      return records[0];
    } catch (error) {
      logger.error(`Airtable getProject error: ${error.message}`);
      throw new Error(`Failed to get project from Airtable: ${error.message}`);
    }
  }

  /**
   * Get interview data from Airtable
   * @param {String} interviewId - Interview ID
   * @returns {Promise<Object>} Interview data
   */
  async getInterview(interviewId) {
    try {
      const records = await this.base('Interviews').select({
        filterByFormula: `{Interview ID} = '${interviewId}'`
      }).firstPage();

      if (!records || records.length === 0) {
        throw new Error(`Interview not found in Airtable: ${interviewId}`);
      }

      return records[0];
    } catch (error) {
      logger.error(`Airtable getInterview error: ${error.message}`);
      throw new Error(`Failed to get interview from Airtable: ${error.message}`);
    }
  }

  /**
   * Get responses for an interview from Airtable
   * @param {String} interviewId - Interview ID
   * @returns {Promise<Array>} Array of response records
   */
  async getResponsesForInterview(interviewId) {
    try {
      const records = await this.base('Responses').select({
        filterByFormula: `{Interview ID} = '${interviewId}'`
      }).all();

      return records;
    } catch (error) {
      logger.error(`Airtable getResponsesForInterview error: ${error.message}`);
      throw new Error(`Failed to get responses from Airtable: ${error.message}`);
    }
  }

  /**
   * Update project data in Airtable
   * @param {String} projectId - Project ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated record
   */
  async updateProject(projectId, updateData) {
    try {
      // Get Airtable record ID
      const records = await this.base('Projects').select({
        filterByFormula: `{Project ID} = '${projectId}'`
      }).firstPage();

      if (!records || records.length === 0) {
        throw new Error(`Project not found in Airtable: ${projectId}`);
      }

      const recordId = records[0].id;
      
      // Format update data for Airtable
      const airtableData = {};
      
      if (updateData.name) airtableData['Name'] = updateData.name;
      if (updateData.description) airtableData['Description'] = updateData.description;
      if (updateData.productCategory) airtableData['Product Category'] = updateData.productCategory;
      if (updateData.targetAudience) airtableData['Target Audience'] = updateData.targetAudience;
      if (updateData.objectives) airtableData['Objectives'] = updateData.objectives;
      if (updateData.status) airtableData['Status'] = updateData.status;
      if (updateData.targetResponseCount) airtableData['Target Response Count'] = updateData.targetResponseCount;
      if (updateData.currentResponseCount) airtableData['Current Response Count'] = updateData.currentResponseCount;
      
      // Update record
      const updatedRecord = await this.base('Projects').update(recordId, airtableData);

      return updatedRecord;
    } catch (error) {
      logger.error(`Airtable updateProject error: ${error.message}`);
      throw new Error(`Failed to update project in Airtable: ${error.message}`);
    }
  }
}

module.exports = new AirtableService();
