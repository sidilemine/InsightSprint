# Backend Infrastructure Development Plan

## Overview
This document outlines the development plan for the backend infrastructure of the Rapid Consumer Sentiment Analysis service. The backend will serve as the foundation for data processing, integration between services, and business logic implementation.

## Core Backend Components

### 1. API Gateway Service

#### Purpose
- Serve as the central entry point for all API interactions
- Route requests to appropriate services
- Handle authentication and authorization
- Implement rate limiting and request validation

#### Implementation Details
```javascript
// server.js - Main API Gateway
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const voiceformRoutes = require('./routes/voiceform');
const humeAiRoutes = require('./routes/humeAi');
const geminiRoutes = require('./routes/gemini');
const airtableRoutes = require('./routes/airtable');
const insightRoutes = require('./routes/insights');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// Body parsing
app.use(express.json());

// Routes
app.use('/api/voiceform', voiceformRoutes);
app.use('/api/hume', humeAiRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/airtable', airtableRoutes);
app.use('/api/insights', authMiddleware, insightRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

module.exports = app;
```

#### Development Tasks
1. Set up Express.js server with security middleware
2. Implement authentication middleware using JWT
3. Create route handlers for each integrated service
4. Implement rate limiting and request validation
5. Set up error handling and logging
6. Configure CORS for appropriate origins
7. Create environment configuration for different deployment environments

### 2. Authentication Service

#### Purpose
- Manage user authentication and authorization
- Handle user registration and login
- Implement role-based access control
- Manage JWT tokens and sessions

#### Implementation Details
```javascript
// auth.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getUserByEmail } = require('../services/airtable.service');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '24h';

/**
 * Register a new user
 */
async function registerUser(userData) {
  const { email, password, name, role } = userData;
  
  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
  // Create user in Airtable
  const newUser = await createUserInAirtable({
    email,
    password: hashedPassword,
    name,
    role: role || 'client',
    createdAt: new Date().toISOString()
  });
  
  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role
  };
}

/**
 * Authenticate a user and generate JWT token
 */
async function loginUser(email, password) {
  // Get user from Airtable
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error('Invalid credentials');
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
  
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  };
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

module.exports = {
  registerUser,
  loginUser,
  verifyToken
};
```

#### Development Tasks
1. Implement user registration with password hashing
2. Create login functionality with JWT token generation
3. Develop token verification middleware
4. Implement role-based access control
5. Create password reset functionality
6. Set up secure storage of user credentials in Airtable
7. Implement session management

### 3. Webhook Handler Service

#### Purpose
- Process event notifications from integrated services
- Trigger appropriate workflows based on events
- Handle asynchronous communication between services
- Provide error recovery for failed events

#### Implementation Details
```javascript
// webhook.service.js
const { processVoiceformInterview } = require('./voiceform.service');
const { processHumeAnalysis } = require('./hume.service');
const { processGeminiAnalysis } = require('./gemini.service');
const { updateAirtableRecord } = require('./airtable.service');
const { sendNotification } = require('./notification.service');
const logger = require('../utils/logger');

/**
 * Handle webhook from Voiceform when interview is completed
 */
async function handleVoiceformWebhook(payload) {
  try {
    logger.info(`Received Voiceform webhook: ${payload.interviewId}`);
    
    // Validate webhook signature
    if (!isValidVoiceformSignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }
    
    // Process the interview data
    const interviewData = await processVoiceformInterview(payload.interviewId);
    
    // Update Airtable with interview data
    await updateAirtableRecord('Interviews', payload.interviewId, {
      status: 'completed',
      transcription: interviewData.transcription,
      audioUrl: interviewData.audioUrl,
      completedAt: new Date().toISOString()
    });
    
    // Trigger emotion analysis with Hume AI
    await triggerHumeAnalysis(interviewData.audioUrl, payload.interviewId);
    
    // Trigger language analysis with Gemini
    await triggerGeminiAnalysis(interviewData.transcription, payload.interviewId);
    
    // Send notification
    await sendNotification('interview_completed', {
      interviewId: payload.interviewId,
      projectId: payload.projectId
    });
    
    return { success: true };
  } catch (error) {
    logger.error(`Error processing Voiceform webhook: ${error.message}`);
    // Store failed webhook for retry
    await storeFailedWebhook('voiceform', payload);
    throw error;
  }
}

/**
 * Handle webhook from Hume AI when emotion analysis is completed
 */
async function handleHumeWebhook(payload) {
  try {
    logger.info(`Received Hume AI webhook: ${payload.analysisId}`);
    
    // Validate webhook signature
    if (!isValidHumeSignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }
    
    // Process the emotion analysis data
    const emotionData = await processHumeAnalysis(payload.analysisId);
    
    // Update Airtable with emotion data
    await updateAirtableRecord('EmotionAnalyses', payload.analysisId, {
      status: 'completed',
      emotionData: JSON.stringify(emotionData),
      completedAt: new Date().toISOString()
    });
    
    // Check if both analyses are complete
    await checkAnalysisCompletion(payload.interviewId);
    
    return { success: true };
  } catch (error) {
    logger.error(`Error processing Hume AI webhook: ${error.message}`);
    // Store failed webhook for retry
    await storeFailedWebhook('hume', payload);
    throw error;
  }
}

/**
 * Handle webhook from Gemini API when language analysis is completed
 */
async function handleGeminiWebhook(payload) {
  try {
    logger.info(`Received Gemini webhook: ${payload.analysisId}`);
    
    // Process the language analysis data
    const languageData = await processGeminiAnalysis(payload.analysisId);
    
    // Update Airtable with language data
    await updateAirtableRecord('LanguageAnalyses', payload.analysisId, {
      status: 'completed',
      languageData: JSON.stringify(languageData),
      completedAt: new Date().toISOString()
    });
    
    // Check if both analyses are complete
    await checkAnalysisCompletion(payload.interviewId);
    
    return { success: true };
  } catch (error) {
    logger.error(`Error processing Gemini webhook: ${error.message}`);
    // Store failed webhook for retry
    await storeFailedWebhook('gemini', payload);
    throw error;
  }
}

/**
 * Check if both emotion and language analyses are complete
 * If yes, trigger insight generation
 */
async function checkAnalysisCompletion(interviewId) {
  const emotionAnalysis = await getAnalysisStatus('EmotionAnalyses', interviewId);
  const languageAnalysis = await getAnalysisStatus('LanguageAnalyses', interviewId);
  
  if (emotionAnalysis.status === 'completed' && languageAnalysis.status === 'completed') {
    // Both analyses are complete, trigger insight generation
    await triggerInsightGeneration(interviewId, emotionAnalysis.id, languageAnalysis.id);
    
    // Send notification
    await sendNotification('analysis_completed', {
      interviewId: interviewId
    });
  }
}

module.exports = {
  handleVoiceformWebhook,
  handleHumeWebhook,
  handleGeminiWebhook
};
```

#### Development Tasks
1. Create webhook endpoints for each integrated service
2. Implement signature validation for secure webhooks
3. Develop event processing logic for each webhook type
4. Create workflow triggers based on webhook events
5. Implement error handling and retry mechanisms
6. Set up logging for webhook activities
7. Create notification system for important events

### 4. Data Processing Service

#### Purpose
- Transform and combine data from various sources
- Perform statistical analysis on collected data
- Generate insights from combined analyses
- Prepare data for visualization and reporting

#### Implementation Details
```javascript
// data-processing.service.js
const { getRecordById } = require('./airtable.service');
const { generateInsights } = require('./insight.service');
const logger = require('../utils/logger');

/**
 * Process combined emotion and language data to generate insights
 */
async function processAnalysisData(interviewId, emotionAnalysisId, languageAnalysisId) {
  try {
    logger.info(`Processing analysis data for interview: ${interviewId}`);
    
    // Get emotion analysis data
    const emotionAnalysis = await getRecordById('EmotionAnalyses', emotionAnalysisId);
    const emotionData = JSON.parse(emotionAnalysis.emotionData);
    
    // Get language analysis data
    const languageAnalysis = await getRecordById('LanguageAnalyses', languageAnalysisId);
    const languageData = JSON.parse(languageAnalysis.languageData);
    
    // Get interview data
    const interview = await getRecordById('Interviews', interviewId);
    const transcription = interview.transcription;
    
    // Combine data for processing
    const combinedData = {
      interview: {
        id: interviewId,
        transcription: transcription,
        questions: interview.questions
      },
      emotion: emotionData,
      language: languageData
    };
    
    // Process the combined data
    const processedData = await processCombinedData(combinedData);
    
    // Generate insights from processed data
    const insights = await generateInsights(processedData);
    
    // Store insights in Airtable
    await storeInsights(interviewId, insights);
    
    // Update interview status
    await updateInterviewStatus(interviewId, 'insights_generated');
    
    return insights;
  } catch (error) {
    logger.error(`Error processing analysis data: ${error.message}`);
    throw error;
  }
}

/**
 * Process combined data to extract patterns and correlations
 */
async function processCombinedData(combinedData) {
  // Extract emotion segments
  const emotionSegments = extractEmotionSegments(combinedData.emotion);
  
  // Extract language themes
  const languageThemes = extractLanguageThemes(combinedData.language);
  
  // Map emotions to transcript segments
  const mappedEmotions = mapEmotionsToTranscript(
    emotionSegments, 
    combinedData.interview.transcription
  );
  
  // Correlate emotions with language themes
  const correlations = correlateEmotionsWithThemes(mappedEmotions, languageThemes);
  
  // Identify key moments in the interview
  const keyMoments = identifyKeyMoments(mappedEmotions, correlations);
  
  // Calculate sentiment scores
  const sentimentScores = calculateSentimentScores(mappedEmotions, languageThemes);
  
  return {
    emotionSegments,
    languageThemes,
    mappedEmotions,
    correlations,
    keyMoments,
    sentimentScores,
    interviewId: combinedData.interview.id
  };
}

/**
 * Extract emotion segments from Hume AI data
 */
function extractEmotionSegments(emotionData) {
  // Implementation details for extracting emotion segments
  // ...
}

/**
 * Extract language themes from Gemini API data
 */
function extractLanguageThemes(languageData) {
  // Implementation details for extracting language themes
  // ...
}

/**
 * Map emotions to transcript segments
 */
function mapEmotionsToTranscript(emotionSegments, transcription) {
  // Implementation details for mapping emotions to transcript
  // ...
}

/**
 * Correlate emotions with language themes
 */
function correlateEmotionsWithThemes(mappedEmotions, languageThemes) {
  // Implementation details for correlating emotions with themes
  // ...
}

/**
 * Identify key moments in the interview
 */
function identifyKeyMoments(mappedEmotions, correlations) {
  // Implementation details for identifying key moments
  // ...
}

/**
 * Calculate sentiment scores
 */
function calculateSentimentScores(mappedEmotions, languageThemes) {
  // Implementation details for calculating sentiment scores
  // ...
}

module.exports = {
  processAnalysisData,
  processCombinedData
};
```

#### Development Tasks
1. Implement data retrieval from various sources
2. Create data transformation and normalization functions
3. Develop statistical analysis algorithms
4. Implement correlation analysis between emotion and language data
5. Create insight generation logic
6. Set up data preparation for visualization
7. Implement caching for frequently accessed data

### 5. Airtable Integration Service

#### Purpose
- Serve as the primary data storage interface
- Handle CRUD operations for all data entities
- Manage relationships between data entities
- Implement data validation and transformation

#### Implementation Details
```javascript
// airtable.service.js
const Airtable = require('airtable');
const logger = require('../utils/logger');

// Configure Airtable
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// Table names
const TABLES = {
  PROJECTS: 'Projects',
  INTERVIEWS: 'Interviews',
  EMOTION_ANALYSES: 'EmotionAnalyses',
  LANGUAGE_ANALYSES: 'LanguageAnalyses',
  INSIGHTS: 'Insights',
  REPORTS: 'Reports',
  USERS: 'Users'
};

/**
 * Create a record in Airtable
 */
async function createRecord(tableName, data) {
  try {
    logger.info(`Creating record in ${tableName}`);
    
    const record = await base(tableName).create(data);
    
    return {
      id: record.id,
      ...record.fields
    };
  } catch (error) {
    logger.error(`Error creating record in ${tableName}: ${error.message}`);
    throw error;
  }
}

/**
 * Get a record by ID
 */
async function getRecordById(tableName, recordId) {
  try {
    logger.info(`Getting record ${recordId} from ${tableName}`);
    
    const record = await base(tableName).find(recordId);
    
    return {
      id: record.id,
      ...record.fields
    };
  } catch (error) {
    logger.error(`Error getting record ${recordId} from ${tableName}: ${error.message}`);
    throw error;
  }
}

/**
 * Update a record in Airtable
 */
async function updateRecord(tableName, recordId, data) {
  try {
    logger.info(`Updating record ${recordId} in ${tableName}`);
    
    const record = await base(tableName).update(recordId, data);
    
    return {
      id: record.id,
      ...record.fields
    };
  } catch (error) {
    logger.error(`Error updating record ${recordId} in ${tableName}: ${error.message}`);
    throw error;
  }
}

/**
 * Delete a record from Airtable
 */
async function deleteRecord(tableName, recordId) {
  try {
    logger.info(`Deleting record ${recordId} from ${tableName}`);
    
    await base(tableName).destroy(recordId);
    
    return { success: true };
  } catch (error) {
    logger.error(`Error deleting record ${recordId} from ${tableName}: ${error.message}`);
    throw error;
  }
}

/**
 * Query records from Airtable
 */
async function queryRecords(tableName, filterFormula = '', sort = []) {
  try {
    logger.info(`Querying records from ${tableName}`);
    
    const query = {
      pageSize: 100
    };
    
    if (filterFormula) {
      query.filterByFormula = filterFormula;
    }
    
    if (sort.length > 0) {
      query.sort = sort;
    }
    
    const records = await base(tableName).select(query).all();
    
    return records.map(record => ({
      id: record.id,
      ...record.fields
    }));
  } catch (error) {
    logger.error(`Error querying records from ${tableName}: ${error.message}`);
    throw error;
  }
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
  try {
    logger.info(`Getting user by email: ${email}`);
    
    const users = await queryRecords(
      TABLES.USERS,
      `{email} = "${email}"`
    );
    
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    logger.error(`Error getting user by email: ${error.message}`);
    throw error;
  }
}

/**
 * Get projects for a user
 */
async function getProjectsForUser(userId) {
  try {
    logger.info(`Getting projects for user: ${userId}`);
    
    const projects = await queryRecords(
      TABLES.PROJECTS,
      `OR(
        {ownerId} = "${userId}",
        {teamMembers} = "${userId}",
        {clientId} = "${userId}"
      )`,
      [{ field: 'createdAt', direction: 'desc' }]
    );
    
    return projects;
  } catch (error) {
    logger.error(`Error getting projects for user: ${error.message}`);
    throw error;
  }
}

/**
 * Get interviews for a project
 */
async function getInterviewsForProject(projectId) {
  try {
    logger.info(`Getting interviews for project: ${projectId}`);
    
    const interviews = await queryRecords(
      TABLES.INTERVIEWS,
      `{projectId} = "${projectId}"`,
      [{ field: 'createdAt', direction: 'desc' }]
    );
    
    return interviews;
  } catch (error) {
    logger.error(`Error getting interviews for project: ${error.message}`);
    throw error;
  }
}

/**
 * Get insights for an interview
 */
async function getInsightsForInterview(interviewId) {
  try {
    logger.info(`Getting insights for interview: ${interviewId}`);
    
    const insights = await queryRecords(
      TABLES.INSIGHTS,
      `{interviewId} = "${interviewId}"`,
      [{ field: 'createdAt', direction: 'desc' }]
    );
    
    return insights;
  } catch (error) {
    logger.error(`Error getting insights for interview: ${error.message}`);
    throw error;
  }
}

module.exports = {
  createRecord,
  getRecordById,
  updateRecord,
  deleteRecord,
  queryRecords,
  getUserByEmail,
  getProjectsForUser,
  getInterviewsForProject,
  getInsightsForInterview,
  TABLES
};
```

#### Development Tasks
1. Set up Airtable base structure with appropriate tables
2. Implement CRUD operations for all entities
3. Create query functions for common data access patterns
4. Implement data validation before storage
5. Set up error handling and retry mechanisms
6. Create data transformation functions
7. Implement caching for frequently accessed data

### 6. External API Integration Services

#### Purpose
- Handle communication with external APIs (Voiceform, Hume AI, Gemini)
- Manage API credentials and authentication
- Implement rate limiting and error handling
- Transform data between system format and API format

#### Implementation Details
```javascript
// voiceform.service.js
const axios = require('axios');
const logger = require('../utils/logger');

const VOICEFORM_API_URL = process.env.VOICEFORM_API_URL;
const VOICEFORM_API_KEY = process.env.VOICEFORM_API_KEY;

// Configure axios instance
const voiceformApi = axios.create({
  baseURL: VOICEFORM_API_URL,
  headers: {
    'Authorization': `Bearer ${VOICEFORM_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Create a new interview in Voiceform
 */
async function createInterview(interviewData) {
  try {
    logger.info('Creating interview in Voiceform');
    
    const response = await voiceformApi.post('/interviews', {
      title: interviewData.title,
      description: interviewData.description,
      questions: interviewData.questions,
      settings: {
        language: interviewData.language || 'en',
        maxDuration: interviewData.maxDuration || 300,
        aiModeration: true,
        webhookUrl: `${process.env.API_BASE_URL}/api/webhooks/voiceform`
      }
    });
    
    return {
      id: response.data.id,
      url: response.data.url,
      status: response.data.status
    };
  } catch (error) {
    logger.error(`Error creating interview in Voiceform: ${error.message}`);
    throw error;
  }
}

/**
 * Get interview data from Voiceform
 */
async function getInterview(interviewId) {
  try {
    logger.info(`Getting interview ${interviewId} from Voiceform`);
    
    const response = await voiceformApi.get(`/interviews/${interviewId}`);
    
    return {
      id: response.data.id,
      title: response.data.title,
      description: response.data.description,
      status: response.data.status,
      questions: response.data.questions,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt
    };
  } catch (error) {
    logger.error(`Error getting interview from Voiceform: ${error.message}`);
    throw error;
  }
}

/**
 * Get interview responses from Voiceform
 */
async function getInterviewResponses(interviewId) {
  try {
    logger.info(`Getting responses for interview ${interviewId} from Voiceform`);
    
    const response = await voiceformApi.get(`/interviews/${interviewId}/responses`);
    
    return response.data.map(resp => ({
      id: resp.id,
      interviewId: resp.interviewId,
      respondentId: resp.respondentId,
      answers: resp.answers,
      audioUrl: resp.audioUrl,
      transcription: resp.transcription,
      completedAt: resp.completedAt
    }));
  } catch (error) {
    logger.error(`Error getting interview responses from Voiceform: ${error.message}`);
    throw error;
  }
}

/**
 * Process Voiceform interview data
 */
async function processVoiceformInterview(interviewId) {
  try {
    logger.info(`Processing Voiceform interview: ${interviewId}`);
    
    // Get interview data
    const interview = await getInterview(interviewId);
    
    // Get interview responses
    const responses = await getInterviewResponses(interviewId);
    
    // Process the first response (assuming one respondent per interview)
    const response = responses[0];
    
    return {
      interviewId: interview.id,
      title: interview.title,
      questions: interview.questions,
      audioUrl: response.audioUrl,
      transcription: response.transcription,
      answers: response.answers,
      completedAt: response.completedAt
    };
  } catch (error) {
    logger.error(`Error processing Voiceform interview: ${error.message}`);
    throw error;
  }
}

module.exports = {
  createInterview,
  getInterview,
  getInterviewResponses,
  processVoiceformInterview
};
```

```javascript
// hume.service.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { downloadFile } = require('../utils/fileUtils');

const HUME_API_URL = process.env.HUME_API_URL;
const HUME_API_KEY = process.env.HUME_API_KEY;

// Configure axios instance
const humeApi = axios.create({
  baseURL: HUME_API_URL,
  headers: {
    'Authorization': `Bearer ${HUME_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Submit audio for emotion analysis
 */
async function submitAudioForAnalysis(audioUrl, interviewId) {
  try {
    logger.info(`Submitting audio for analysis: ${audioUrl}`);
    
    // Download the audio file
    const tempFilePath = path.join('/tmp', `${interviewId}.mp3`);
    await downloadFile(audioUrl, tempFilePath);
    
    // Create form data
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(tempFilePath));
    formData.append('metadata', JSON.stringify({
      interviewId: interviewId,
      webhookUrl: `${process.env.API_BASE_URL}/api/webhooks/hume`
    }));
    
    // Submit for analysis
    const response = await axios.post(`${HUME_API_URL}/v2/batch/jobs`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${HUME_API_KEY}`
      }
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    return {
      jobId: response.data.job_id,
      status: response.data.status
    };
  } catch (error) {
    logger.error(`Error submitting audio for analysis: ${error.message}`);
    throw error;
  }
}

/**
 * Get emotion analysis results
 */
async function getAnalysisResults(jobId) {
  try {
    logger.info(`Getting analysis results for job: ${jobId}`);
    
    const response = await humeApi.get(`/v2/batch/jobs/${jobId}`);
    
    if (response.data.status !== 'COMPLETED') {
      throw new Error(`Job not completed: ${response.data.status}`);
    }
    
    return {
      jobId: response.data.job_id,
      status: response.data.status,
      results: response.data.results,
      emotions: processEmotionResults(response.data.results)
    };
  } catch (error) {
    logger.error(`Error getting analysis results: ${error.message}`);
    throw error;
  }
}

/**
 * Process emotion results into a more usable format
 */
function processEmotionResults(results) {
  // Implementation details for processing emotion results
  // ...
}

/**
 * Process Hume analysis data
 */
async function processHumeAnalysis(jobId) {
  try {
    logger.info(`Processing Hume analysis: ${jobId}`);
    
    // Get analysis results
    const analysisResults = await getAnalysisResults(jobId);
    
    // Process the results
    return {
      jobId: analysisResults.jobId,
      status: analysisResults.status,
      emotions: analysisResults.emotions,
      completedAt: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error processing Hume analysis: ${error.message}`);
    throw error;
  }
}

module.exports = {
  submitAudioForAnalysis,
  getAnalysisResults,
  processHumeAnalysis
};
```

```javascript
// gemini.service.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-1.5-pro';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

/**
 * Analyze transcription for language patterns
 */
async function analyzeTranscription(transcription, interviewId) {
  try {
    logger.info(`Analyzing transcription for interview: ${interviewId}`);
    
    // Create analysis job
    const analysisId = `gemini-${interviewId}-${Date.now()}`;
    
    // Store analysis job in Airtable
    await createAnalysisJob(analysisId, interviewId, transcription);
    
    // Process in background
    processTranscriptionAsync(analysisId, transcription);
    
    return {
      analysisId,
      status: 'processing'
    };
  } catch (error) {
    logger.error(`Error analyzing transcription: ${error.message}`);
    throw error;
  }
}

/**
 * Process transcription asynchronously
 */
async function processTranscriptionAsync(analysisId, transcription) {
  try {
    // Extract themes
    const themes = await extractThemes(transcription);
    
    // Extract sentiment
    const sentiment = await extractSentiment(transcription);
    
    // Extract key phrases
    const keyPhrases = await extractKeyPhrases(transcription);
    
    // Extract entities
    const entities = await extractEntities(transcription);
    
    // Store results
    await storeAnalysisResults(analysisId, {
      themes,
      sentiment,
      keyPhrases,
      entities,
      completedAt: new Date().toISOString()
    });
    
    // Trigger webhook
    await triggerGeminiWebhook(analysisId);
  } catch (error) {
    logger.error(`Error processing transcription: ${error.message}`);
    await updateAnalysisStatus(analysisId, 'failed', { error: error.message });
  }
}

/**
 * Extract themes from transcription
 */
async function extractThemes(transcription) {
  try {
    const prompt = `
      Analyze the following interview transcription and identify the main themes discussed.
      For each theme, provide a title, brief description, and relevant quotes from the transcription.
      Format the response as JSON with the following structure:
      {
        "themes": [
          {
            "title": "Theme title",
            "description": "Brief description of the theme",
            "quotes": ["Quote 1", "Quote 2"]
          }
        ]
      }
      
      Transcription:
      ${transcription}
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : '{}';
    
    return JSON.parse(jsonString).themes || [];
  } catch (error) {
    logger.error(`Error extracting themes: ${error.message}`);
    return [];
  }
}

/**
 * Extract sentiment from transcription
 */
async function extractSentiment(transcription) {
  // Implementation details for extracting sentiment
  // ...
}

/**
 * Extract key phrases from transcription
 */
async function extractKeyPhrases(transcription) {
  // Implementation details for extracting key phrases
  // ...
}

/**
 * Extract entities from transcription
 */
async function extractEntities(transcription) {
  // Implementation details for extracting entities
  // ...
}

/**
 * Process Gemini analysis
 */
async function processGeminiAnalysis(analysisId) {
  try {
    logger.info(`Processing Gemini analysis: ${analysisId}`);
    
    // Get analysis results
    const analysis = await getAnalysisById(analysisId);
    
    return {
      analysisId: analysis.id,
      themes: analysis.themes,
      sentiment: analysis.sentiment,
      keyPhrases: analysis.keyPhrases,
      entities: analysis.entities,
      completedAt: analysis.completedAt
    };
  } catch (error) {
    logger.error(`Error processing Gemini analysis: ${error.message}`);
    throw error;
  }
}

module.exports = {
  analyzeTranscription,
  processGeminiAnalysis
};
```

#### Development Tasks
1. Implement API clients for each external service
2. Create data transformation functions for API requests and responses
3. Implement error handling and retry mechanisms
4. Set up rate limiting to stay within API quotas
5. Create webhook handlers for asynchronous notifications
6. Implement logging for API interactions
7. Create mock services for testing

### 7. Insight Generation Service

#### Purpose
- Generate actionable insights from analyzed data
- Create recommendations based on insights
- Prioritize insights by importance
- Format insights for presentation

#### Implementation Details
```javascript
// insight.service.js
const { getRecordById, createRecord, TABLES } = require('./airtable.service');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-1.5-pro';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

/**
 * Generate insights from processed data
 */
async function generateInsights(processedData) {
  try {
    logger.info(`Generating insights for interview: ${processedData.interviewId}`);
    
    // Get project context
    const interview = await getRecordById(TABLES.INTERVIEWS, processedData.interviewId);
    const project = await getRecordById(TABLES.PROJECTS, interview.projectId);
    
    // Generate insights using Gemini
    const insights = await generateInsightsWithGemini(processedData, project);
    
    // Store insights in Airtable
    await storeInsights(processedData.interviewId, insights);
    
    return insights;
  } catch (error) {
    logger.error(`Error generating insights: ${error.message}`);
    throw error;
  }
}

/**
 * Generate insights using Gemini API
 */
async function generateInsightsWithGemini(processedData, project) {
  try {
    // Prepare data for Gemini
    const promptData = {
      project: {
        title: project.title,
        description: project.description,
        objectives: project.objectives,
        industry: project.industry
      },
      emotionData: processedData.emotionSegments,
      languageData: processedData.languageThemes,
      correlations: processedData.correlations,
      keyMoments: processedData.keyMoments,
      sentimentScores: processedData.sentimentScores
    };
    
    // Create prompt
    const prompt = `
      You are an expert consumer insights analyst. Based on the following data from a consumer interview,
      generate actionable insights and recommendations. The data includes emotion analysis, language analysis,
      correlations between emotions and language, key moments from the interview, and overall sentiment scores.
      
      Project Context:
      ${JSON.stringify(promptData.project, null, 2)}
      
      Emotion Analysis:
      ${JSON.stringify(promptData.emotionData, null, 2)}
      
      Language Analysis:
      ${JSON.stringify(promptData.languageData, null, 2)}
      
      Correlations:
      ${JSON.stringify(promptData.correlations, null, 2)}
      
      Key Moments:
      ${JSON.stringify(promptData.keyMoments, null, 2)}
      
      Sentiment Scores:
      ${JSON.stringify(promptData.sentimentScores, null, 2)}
      
      Generate a comprehensive analysis with the following sections:
      1. Key Insights: The most important findings from the data
      2. Emotional Drivers: What emotions are driving consumer behavior and why
      3. Language Patterns: Key themes and patterns in how the consumer talks about the product/service
      4. Recommendations: Actionable recommendations based on the insights
      5. Priority Areas: Areas that require immediate attention
      
      Format the response as JSON with the following structure:
      {
        "keyInsights": [
          {
            "title": "Insight title",
            "description": "Detailed description of the insight",
            "supportingData": "Reference to the data that supports this insight",
            "importance": "high/medium/low"
          }
        ],
        "emotionalDrivers": [
          {
            "emotion": "Emotion name",
            "description": "Description of how this emotion influences behavior",
            "triggers": ["Trigger 1", "Trigger 2"],
            "implications": "What this means for the brand"
          }
        ],
        "languagePatterns": [
          {
            "pattern": "Pattern name",
            "description": "Description of the language pattern",
            "examples": ["Example 1", "Example 2"],
            "significance": "Why this pattern matters"
          }
        ],
        "recommendations": [
          {
            "title": "Recommendation title",
            "description": "Detailed description of the recommendation",
            "rationale": "Why this recommendation is important",
            "implementation": "How to implement this recommendation",
            "priority": "high/medium/low"
          }
        ],
        "priorityAreas": [
          {
            "area": "Area name",
            "reason": "Why this area needs immediate attention",
            "potentialImpact": "The potential impact of addressing this area"
          }
        ]
      }
    `;
    
    // Generate insights
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : '{}';
    
    return JSON.parse(jsonString);
  } catch (error) {
    logger.error(`Error generating insights with Gemini: ${error.message}`);
    throw error;
  }
}

/**
 * Store insights in Airtable
 */
async function storeInsights(interviewId, insights) {
  try {
    logger.info(`Storing insights for interview: ${interviewId}`);
    
    // Store key insights
    for (const insight of insights.keyInsights) {
      await createRecord(TABLES.INSIGHTS, {
        interviewId,
        type: 'key_insight',
        title: insight.title,
        description: insight.description,
        supportingData: insight.supportingData,
        importance: insight.importance,
        createdAt: new Date().toISOString()
      });
    }
    
    // Store emotional drivers
    for (const driver of insights.emotionalDrivers) {
      await createRecord(TABLES.INSIGHTS, {
        interviewId,
        type: 'emotional_driver',
        title: driver.emotion,
        description: driver.description,
        triggers: JSON.stringify(driver.triggers),
        implications: driver.implications,
        createdAt: new Date().toISOString()
      });
    }
    
    // Store recommendations
    for (const recommendation of insights.recommendations) {
      await createRecord(TABLES.INSIGHTS, {
        interviewId,
        type: 'recommendation',
        title: recommendation.title,
        description: recommendation.description,
        rationale: recommendation.rationale,
        implementation: recommendation.implementation,
        priority: recommendation.priority,
        createdAt: new Date().toISOString()
      });
    }
    
    // Store summary
    await createRecord(TABLES.INSIGHTS, {
      interviewId,
      type: 'summary',
      languagePatterns: JSON.stringify(insights.languagePatterns),
      priorityAreas: JSON.stringify(insights.priorityAreas),
      createdAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    logger.error(`Error storing insights: ${error.message}`);
    throw error;
  }
}

module.exports = {
  generateInsights,
  storeInsights
};
```

#### Development Tasks
1. Implement insight generation logic using Gemini API
2. Create data preparation functions for insight generation
3. Develop recommendation generation algorithms
4. Implement insight prioritization logic
5. Create insight formatting functions
6. Set up storage of generated insights
7. Implement caching for frequently accessed insights

## Backend Infrastructure Setup

### Environment Configuration

```javascript
// .env.example
# Server Configuration
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=24h

# Airtable Configuration
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-airtable-base-id

# Voiceform Configuration
VOICEFORM_API_URL=https://api.voiceform.com/v1
VOICEFORM_API_KEY=your-voiceform-api-key

# Hume AI Configuration
HUME_API_URL=https://api.hume.ai
HUME_API_KEY=your-hume-ai-api-key

# Gemini API Configuration
GEMINI_API_KEY=your-gemini-api-key

# Insight7 Configuration
INSIGHT7_API_URL=https://api.insight7.io/v1
INSIGHT7_API_KEY=your-insight7-api-key

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://jadekite.com

# Logging Configuration
LOG_LEVEL=info
```

### Package Configuration

```json
// package.json
{
  "name": "jade-kite-backend",
  "version": "1.0.0",
  "description": "Backend for Jade Kite Rapid Consumer Sentiment Analysis",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "@google/generative-ai": "^0.1.3",
    "airtable": "^0.12.2",
    "axios": "^1.6.2",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "form-data": "^4.0.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.2",
    "supertest": "^6.3.3"
  }
}
```

### Directory Structure

```
jade-kite-backend/
├── config/
│   └── config.js
├── controllers/
│   ├── auth.controller.js
│   ├── interview.controller.js
│   ├── project.controller.js
│   ├── insight.controller.js
│   ├── report.controller.js
│   └── webhook.controller.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── validator.js
├── routes/
│   ├── auth.routes.js
│   ├── interview.routes.js
│   ├── project.routes.js
│   ├── insight.routes.js
│   ├── report.routes.js
│   └── webhook.routes.js
├── services/
│   ├── airtable.service.js
│   ├── auth.service.js
│   ├── data-processing.service.js
│   ├── gemini.service.js
│   ├── hume.service.js
│   ├── insight.service.js
│   ├── notification.service.js
│   ├── report.service.js
│   └── voiceform.service.js
├── utils/
│   ├── fileUtils.js
│   ├── logger.js
│   └── validators.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

## Implementation Plan

### Phase 1: Core Infrastructure Setup (Week 1-2)
1. Set up project structure and configuration
2. Implement API Gateway with security middleware
3. Create Authentication Service with JWT
4. Set up Airtable base structure and integration service
5. Implement logging and error handling

### Phase 2: External API Integrations (Week 3-4)
1. Implement Voiceform integration service
2. Create Hume AI integration service
3. Develop Gemini API integration service
4. Set up webhook handlers for all services
5. Implement file handling utilities

### Phase 3: Data Processing Pipeline (Week 5-6)
1. Develop Data Processing Service
2. Implement Insight Generation Service
3. Create correlation algorithms for emotion and language data
4. Set up data transformation and normalization functions
5. Implement caching for frequently accessed data

### Phase 4: Testing and Documentation (Week 7-8)
1. Write unit tests for all services
2. Create integration tests for the complete pipeline
3. Document API endpoints
4. Set up monitoring and alerting
5. Implement error recovery mechanisms

## Conclusion
This backend infrastructure development plan provides a comprehensive blueprint for implementing the server-side components of the Rapid Consumer Sentiment Analysis service. The plan focuses on creating a robust, scalable, and secure backend that integrates with all required external services while maintaining efficient use of resources. The implementation is designed to be modular, allowing for easy maintenance and future enhancements.
