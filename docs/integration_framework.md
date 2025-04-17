# Integration Framework Development

## Overview
This document outlines the integration framework for the Rapid Consumer Sentiment Analysis service. The integration framework serves as the connective tissue between all system components, enabling seamless data flow and communication between the backend services, external APIs, and frontend interfaces.

## Integration Architecture

### Integration Layer Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        Integration Layer                                │
│                                                                         │
├─────────────┬─────────────────────────────────┬───────────────────────┤
│ API Gateway │      Webhook Handlers           │   Authentication      │
│             │                                 │   Service             │
└─────┬───────┴──────────────┬──────────────────┴───────────┬───────────┘
      │                      │                              │
      ▼                      ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        Service Adapters                                 │
│                                                                         │
├─────────────┬─────────────────────────────────┬───────────────────────┤
│ Voiceform   │      Hume AI                    │   Gemini API          │
│ Adapter     │      Adapter                    │   Adapter             │
└─────────────┴─────────────────────────────────┴───────────────────────┘
      ▲                      ▲                              ▲
      │                      │                              │
      ▼                      ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        Data Transformation Layer                        │
│                                                                         │
├─────────────┬─────────────────────────────────┬───────────────────────┤
│ Request     │      Response                   │   Error               │
│ Transformer │      Transformer                │   Handler             │
└─────────────┴─────────────────────────────────┴───────────────────────┘
      ▲                      ▲                              ▲
      │                      │                              │
      ▼                      ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        Event Bus                                        │
│                                                                         │
├─────────────┬─────────────────────────────────┬───────────────────────┤
│ Publishers  │      Subscribers                │   Event Handlers      │
│             │                                 │                       │
└─────────────┴─────────────────────────────────┴───────────────────────┘
```

## Integration Components Implementation

### 1. API Gateway

The API Gateway serves as the central entry point for all API interactions, routing requests to the appropriate services and handling cross-cutting concerns like authentication, rate limiting, and request validation.

#### Implementation Details

```javascript
// api-gateway.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Load environment variables
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

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
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const interviewRoutes = require('./routes/interview.routes');
const insightRoutes = require('./routes/insight.routes');
const reportRoutes = require('./routes/report.routes');
const webhookRoutes = require('./routes/webhook.routes');

app.use('/api/auth', authRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/interviews', authMiddleware, interviewRoutes);
app.use('/api/insights', authMiddleware, insightRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/webhooks', webhookRoutes);

// Service proxies for direct service communication
if (process.env.ENABLE_SERVICE_PROXIES === 'true') {
  // Voiceform proxy
  app.use('/services/voiceform', authMiddleware, createProxyMiddleware({
    target: process.env.VOICEFORM_API_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/services/voiceform': ''
    },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('Authorization', `Bearer ${process.env.VOICEFORM_API_KEY}`);
    },
    logLevel: 'warn'
  }));
  
  // Hume AI proxy
  app.use('/services/hume', authMiddleware, createProxyMiddleware({
    target: process.env.HUME_API_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/services/hume': ''
    },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('Authorization', `Bearer ${process.env.HUME_API_KEY}`);
    },
    logLevel: 'warn'
  }));
  
  // Insight7 proxy
  app.use('/services/insight7', authMiddleware, createProxyMiddleware({
    target: process.env.INSIGHT7_API_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/services/insight7': ''
    },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('Authorization', `Bearer ${process.env.INSIGHT7_API_KEY}`);
    },
    logLevel: 'warn'
  }));
}

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

module.exports = app;
```

### 2. Webhook Handler System

The Webhook Handler System processes event notifications from integrated services, triggering appropriate workflows based on events and providing error recovery for failed events.

#### Implementation Details

```javascript
// webhook-handler.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { processVoiceformWebhook } = require('../services/voiceform.service');
const { processHumeWebhook } = require('../services/hume.service');
const { processGeminiWebhook } = require('../services/gemini.service');
const { processInsight7Webhook } = require('../services/insight7.service');
const { storeFailedWebhook, retryFailedWebhooks } = require('../services/webhook.service');
const logger = require('../utils/logger');

// Validate webhook signatures
function validateVoiceformSignature(req, res, next) {
  try {
    const signature = req.headers['x-voiceform-signature'];
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.VOICEFORM_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    
    if (signature === expectedSignature) {
      next();
    } else {
      logger.warn('Invalid Voiceform webhook signature');
      res.status(401).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    logger.error(`Error validating Voiceform signature: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function validateHumeSignature(req, res, next) {
  try {
    const signature = req.headers['x-hume-signature'];
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.HUME_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    
    if (signature === expectedSignature) {
      next();
    } else {
      logger.warn('Invalid Hume webhook signature');
      res.status(401).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    logger.error(`Error validating Hume signature: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Voiceform webhook endpoint
router.post('/voiceform', validateVoiceformSignature, async (req, res) => {
  try {
    logger.info('Received Voiceform webhook');
    
    // Process webhook asynchronously
    processWebhookAsync('voiceform', req.body);
    
    // Return immediate response
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error(`Error handling Voiceform webhook: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Hume AI webhook endpoint
router.post('/hume', validateHumeSignature, async (req, res) => {
  try {
    logger.info('Received Hume webhook');
    
    // Process webhook asynchronously
    processWebhookAsync('hume', req.body);
    
    // Return immediate response
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error(`Error handling Hume webhook: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Gemini webhook endpoint
router.post('/gemini', async (req, res) => {
  try {
    logger.info('Received Gemini webhook');
    
    // Process webhook asynchronously
    processWebhookAsync('gemini', req.body);
    
    // Return immediate response
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error(`Error handling Gemini webhook: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Insight7 webhook endpoint
router.post('/insight7', async (req, res) => {
  try {
    logger.info('Received Insight7 webhook');
    
    // Process webhook asynchronously
    processWebhookAsync('insight7', req.body);
    
    // Return immediate response
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error(`Error handling Insight7 webhook: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process webhook asynchronously
async function processWebhookAsync(source, payload) {
  try {
    switch (source) {
      case 'voiceform':
        await processVoiceformWebhook(payload);
        break;
      case 'hume':
        await processHumeWebhook(payload);
        break;
      case 'gemini':
        await processGeminiWebhook(payload);
        break;
      case 'insight7':
        await processInsight7Webhook(payload);
        break;
      default:
        logger.warn(`Unknown webhook source: ${source}`);
    }
  } catch (error) {
    logger.error(`Error processing ${source} webhook: ${error.message}`);
    await storeFailedWebhook(source, payload, error.message);
  }
}

// Retry failed webhooks endpoint (internal use only)
router.post('/retry', async (req, res) => {
  try {
    const { source, id } = req.body;
    
    if (!source && !id) {
      // Retry all failed webhooks
      const results = await retryFailedWebhooks();
      res.status(200).json(results);
    } else if (source && !id) {
      // Retry all failed webhooks for a specific source
      const results = await retryFailedWebhooks(source);
      res.status(200).json(results);
    } else if (source && id) {
      // Retry a specific failed webhook
      const result = await retryFailedWebhooks(source, id);
      res.status(200).json(result);
    } else {
      res.status(400).json({ error: 'Invalid request' });
    }
  } catch (error) {
    logger.error(`Error retrying webhooks: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

### 3. Service Adapters

Service Adapters provide a consistent interface for interacting with external services, handling the specifics of each API and abstracting away the details from the rest of the system.

#### Voiceform Adapter

```javascript
// voiceform-adapter.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const logger = require('../utils/logger');

class VoiceformAdapter extends EventEmitter {
  constructor(config) {
    super();
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
    this.webhookUrl = config.webhookUrl;
    
    // Configure axios instance
    this.api = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Handle API errors
   */
  handleApiError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error(`Voiceform API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      this.emit('error', {
        type: 'api_response_error',
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      logger.error(`Voiceform API no response: ${error.message}`);
      this.emit('error', {
        type: 'api_no_response',
        message: error.message
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error(`Voiceform API request error: ${error.message}`);
      this.emit('error', {
        type: 'api_request_error',
        message: error.message
      });
    }
  }
  
  /**
   * Create a new interview
   */
  async createInterview(interviewData) {
    try {
      logger.info('Creating interview in Voiceform');
      
      const payload = {
        title: interviewData.title,
        description: interviewData.description,
        questions: interviewData.questions,
        settings: {
          language: interviewData.language || 'en',
          maxDuration: interviewData.maxDuration || 300,
          aiModeration: true,
          webhookUrl: this.webhookUrl
        }
      };
      
      const response = await this.api.post('/interviews', payload);
      
      this.emit('interview_created', {
        id: response.data.id,
        url: response.data.url,
        status: response.data.status
      });
      
      return {
        id: response.data.id,
        url: response.data.url,
        status: response.data.status
      };
    } catch (error) {
      // Error is already logged and emitted in the interceptor
      throw new Error(`Failed to create interview: ${error.message}`);
    }
  }
  
  /**
   * Get interview data
   */
  async getInterview(interviewId) {
    try {
      logger.info(`Getting interview ${interviewId} from Voiceform`);
      
      const response = await this.api.get(`/interviews/${interviewId}`);
      
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
      // Error is already logged and emitted in the interceptor
      throw new Error(`Failed to get interview: ${error.message}`);
    }
  }
  
  /**
   * Get interview responses
   */
  async getInterviewResponses(interviewId) {
    try {
      logger.info(`Getting responses for interview ${interviewId} from Voiceform`);
      
      const response = await this.api.get(`/interviews/${interviewId}/responses`);
      
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
      // Error is already logged and emitted in the interceptor
      throw new Error(`Failed to get interview responses: ${error.message}`);
    }
  }
  
  /**
   * Download audio file
   */
  async downloadAudio(audioUrl, outputPath) {
    try {
      logger.info(`Downloading audio from ${audioUrl}`);
      
      const response = await axios({
        method: 'GET',
        url: audioUrl,
        responseType: 'stream'
      });
      
      const writer = fs.createWriteStream(outputPath);
      
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          logger.info(`Audio downloaded to ${outputPath}`);
          resolve(outputPath);
        });
        writer.on('error', (err) => {
          logger.error(`Error downloading audio: ${err.message}`);
          reject(err);
        });
      });
    } catch (error) {
      logger.error(`Error downloading audio: ${error.message}`);
      throw new Error(`Failed to download audio: ${error.message}`);
    }
  }
  
  /**
   * Process webhook payload
   */
  async processWebhook(payload) {
    try {
      logger.info(`Processing Voiceform webhook: ${JSON.stringify(payload)}`);
      
      // Get interview data
      const interview = await this.getInterview(payload.interviewId);
      
      // Get interview responses
      const responses = await this.getInterviewResponses(payload.interviewId);
      
      // Process the first response (assuming one respondent per interview)
      const response = responses[0];
      
      const processedData = {
        interviewId: interview.id,
        title: interview.title,
        questions: interview.questions,
        audioUrl: response.audioUrl,
        transcription: response.transcription,
        answers: response.answers,
        completedAt: response.completedAt
      };
      
      this.emit('interview_completed', processedData);
      
      return processedData;
    } catch (error) {
      logger.error(`Error processing Voiceform webhook: ${error.message}`);
      this.emit('webhook_processing_error', {
        source: 'voiceform',
        error: error.message,
        payload
      });
      throw error;
    }
  }
}

module.exports = VoiceformAdapter;
```

#### Hume AI Adapter

```javascript
// hume-adapter.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const logger = require('../utils/logger');

class HumeAdapter extends EventEmitter {
  constructor(config) {
    super();
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
    this.webhookUrl = config.webhookUrl;
    
    // Configure axios instance
    this.api = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Handle API errors
   */
  handleApiError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error(`Hume API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      this.emit('error', {
        type: 'api_response_error',
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      logger.error(`Hume API no response: ${error.message}`);
      this.emit('error', {
        type: 'api_no_response',
        message: error.message
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error(`Hume API request error: ${error.message}`);
      this.emit('error', {
        type: 'api_request_error',
        message: error.message
      });
    }
  }
  
  /**
   * Submit audio for emotion analysis
   */
  async submitAudioForAnalysis(audioPath, metadata = {}) {
    try {
      logger.info(`Submitting audio for analysis: ${audioPath}`);
      
      // Create form data
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(audioPath));
      formData.append('metadata', JSON.stringify({
        ...metadata,
        webhookUrl: this.webhookUrl
      }));
      
      // Submit for analysis
      const response = await axios.post(`${this.apiUrl}/v2/batch/jobs`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      const result = {
        jobId: response.data.job_id,
        status: response.data.status
      };
      
      this.emit('analysis_submitted', result);
      
      return result;
    } catch (error) {
      logger.error(`Error submitting audio for analysis: ${error.message}`);
      this.emit('error', {
        type: 'audio_submission_error',
        message: error.message
      });
      throw new Error(`Failed to submit audio for analysis: ${error.message}`);
    }
  }
  
  /**
   * Get analysis results
   */
  async getAnalysisResults(jobId) {
    try {
      logger.info(`Getting analysis results for job: ${jobId}`);
      
      const response = await this.api.get(`/v2/batch/jobs/${jobId}`);
      
      if (response.data.status !== 'COMPLETED') {
        logger.info(`Job not completed: ${response.data.status}`);
        return {
          jobId: response.data.job_id,
          status: response.data.status
        };
      }
      
      const result = {
        jobId: response.data.job_id,
        status: response.data.status,
        results: response.data.results,
        emotions: this.processEmotionResults(response.data.results)
      };
      
      this.emit('analysis_completed', result);
      
      return result;
    } catch (error) {
      // Error is already logged and emitted in the interceptor
      throw new Error(`Failed to get analysis results: ${error.message}`);
    }
  }
  
  /**
   * Process emotion results into a more usable format
   */
  processEmotionResults(results) {
    try {
      // Extract the emotions from the results
      const emotions = [];
      
      if (!results || !results.predictions || !results.predictions.length) {
        return emotions;
      }
      
      // Process each prediction
      for (const prediction of results.predictions) {
        if (!prediction.models || !prediction.models.prosody) {
          continue;
        }
        
        const prosodyModel = prediction.models.prosody;
        
        // Get the emotions from the prosody model
        for (const segment of prosodyModel.segments) {
          const emotionData = {
            startTime: segment.start_time,
            endTime: segment.end_time,
            emotions: {}
          };
          
          // Extract emotion scores
          for (const [emotion, score] of Object.entries(segment.emotions)) {
            emotionData.emotions[emotion] = score;
          }
          
          emotions.push(emotionData);
        }
      }
      
      return emotions;
    } catch (error) {
      logger.error(`Error processing emotion results: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Process webhook payload
   */
  async processWebhook(payload) {
    try {
      logger.info(`Processing Hume webhook: ${JSON.stringify(payload)}`);
      
      // Get analysis results
      const analysisResults = await this.getAnalysisResults(payload.job_id);
      
      const processedData = {
        jobId: analysisResults.jobId,
        status: analysisResults.status,
        emotions: analysisResults.emotions,
        completedAt: new Date().toISOString(),
        metadata: payload.metadata || {}
      };
      
      this.emit('emotion_analysis_completed', processedData);
      
      return processedData;
    } catch (error) {
      logger.error(`Error processing Hume webhook: ${error.message}`);
      this.emit('webhook_processing_error', {
        source: 'hume',
        error: error.message,
        payload
      });
      throw error;
    }
  }
}

module.exports = HumeAdapter;
```

#### Gemini API Adapter

```javascript
// gemini-adapter.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { EventEmitter } = require('events');
const logger = require('../utils/logger');

class GeminiAdapter extends EventEmitter {
  constructor(config) {
    super();
    this.apiKey = config.apiKey;
    this.modelName = config.modelName || 'gemini-1.5-pro';
    
    // Initialize Gemini API
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: this.modelName });
  }
  
  /**
   * Extract JSON from Gemini response
   */
  extractJsonFromResponse(text) {
    try {
      // Try to extract JSON from code block
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : '{}';
      
      return JSON.parse(jsonString);
    } catch (error) {
      logger.error(`Error extracting JSON from response: ${error.message}`);
      return {};
    }
  }
  
  /**
   * Analyze transcription for themes
   */
  async extractThemes(transcription) {
    try {
      logger.info('Extracting themes from transcription');
      
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
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonData = this.extractJsonFromResponse(text);
      
      this.emit('themes_extracted', {
        themes: jsonData.themes || []
      });
      
      return jsonData.themes || [];
    } catch (error) {
      logger.error(`Error extracting themes: ${error.message}`);
      this.emit('error', {
        type: 'theme_extraction_error',
        message: error.message
      });
      return [];
    }
  }
  
  /**
   * Extract sentiment from transcription
   */
  async extractSentiment(transcription) {
    try {
      logger.info('Extracting sentiment from transcription');
      
      const prompt = `
        Analyze the sentiment in the following interview transcription.
        Provide an overall sentiment score from -1.0 (very negative) to 1.0 (very positive),
        as well as sentiment scores for different segments of the interview.
        Also identify the most positive and most negative parts of the interview.
        Format the response as JSON with the following structure:
        {
          "overallSentiment": 0.5,
          "segments": [
            {
              "text": "Segment text",
              "sentiment": 0.7
            }
          ],
          "mostPositive": {
            "text": "Most positive segment",
            "sentiment": 0.9
          },
          "mostNegative": {
            "text": "Most negative segment",
            "sentiment": -0.8
          }
        }
        
        Transcription:
        ${transcription}
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonData = this.extractJsonFromResponse(text);
      
      this.emit('sentiment_extracted', jsonData);
      
      return jsonData;
    } catch (error) {
      logger.error(`Error extracting sentiment: ${error.message}`);
      this.emit('error', {
        type: 'sentiment_extraction_error',
        message: error.message
      });
      return {
        overallSentiment: 0,
        segments: [],
        mostPositive: null,
        mostNegative: null
      };
    }
  }
  
  /**
   * Extract key phrases from transcription
   */
  async extractKeyPhrases(transcription) {
    try {
      logger.info('Extracting key phrases from transcription');
      
      const prompt = `
        Extract the most important key phrases from the following interview transcription.
        For each key phrase, provide the phrase itself, its context, and its significance.
        Format the response as JSON with the following structure:
        {
          "keyPhrases": [
            {
              "phrase": "Key phrase",
              "context": "The context in which the phrase appears",
              "significance": "Why this phrase is significant"
            }
          ]
        }
        
        Transcription:
        ${transcription}
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonData = this.extractJsonFromResponse(text);
      
      this.emit('key_phrases_extracted', {
        keyPhrases: jsonData.keyPhrases || []
      });
      
      return jsonData.keyPhrases || [];
    } catch (error) {
      logger.error(`Error extracting key phrases: ${error.message}`);
      this.emit('error', {
        type: 'key_phrase_extraction_error',
        message: error.message
      });
      return [];
    }
  }
  
  /**
   * Extract entities from transcription
   */
  async extractEntities(transcription) {
    try {
      logger.info('Extracting entities from transcription');
      
      const prompt = `
        Extract named entities from the following interview transcription.
        Entities can include people, organizations, products, brands, locations, etc.
        For each entity, provide the entity name, its type, and mentions in the text.
        Format the response as JSON with the following structure:
        {
          "entities": [
            {
              "name": "Entity name",
              "type": "Entity type (PERSON, ORGANIZATION, PRODUCT, BRAND, LOCATION, etc.)",
              "mentions": ["Mention 1", "Mention 2"]
            }
          ]
        }
        
        Transcription:
        ${transcription}
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonData = this.extractJsonFromResponse(text);
      
      this.emit('entities_extracted', {
        entities: jsonData.entities || []
      });
      
      return jsonData.entities || [];
    } catch (error) {
      logger.error(`Error extracting entities: ${error.message}`);
      this.emit('error', {
        type: 'entity_extraction_error',
        message: error.message
      });
      return [];
    }
  }
  
  /**
   * Generate insights from combined data
   */
  async generateInsights(data) {
    try {
      logger.info('Generating insights from combined data');
      
      const prompt = `
        You are an expert consumer insights analyst. Based on the following data from a consumer interview,
        generate actionable insights and recommendations. The data includes emotion analysis, language analysis,
        correlations between emotions and language, key moments from the interview, and overall sentiment scores.
        
        Project Context:
        ${JSON.stringify(data.project, null, 2)}
        
        Emotion Analysis:
        ${JSON.stringify(data.emotionData, null, 2)}
        
        Language Analysis:
        ${JSON.stringify(data.languageData, null, 2)}
        
        Correlations:
        ${JSON.stringify(data.correlations, null, 2)}
        
        Key Moments:
        ${JSON.stringify(data.keyMoments, null, 2)}
        
        Sentiment Scores:
        ${JSON.stringify(data.sentimentScores, null, 2)}
        
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
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonData = this.extractJsonFromResponse(text);
      
      this.emit('insights_generated', jsonData);
      
      return jsonData;
    } catch (error) {
      logger.error(`Error generating insights: ${error.message}`);
      this.emit('error', {
        type: 'insight_generation_error',
        message: error.message
      });
      throw error;
    }
  }
  
  /**
   * Analyze transcription (main entry point)
   */
  async analyzeTranscription(transcription, metadata = {}) {
    try {
      logger.info('Analyzing transcription');
      
      // Generate a unique analysis ID
      const analysisId = `gemini-${metadata.interviewId || Date.now()}-${Date.now()}`;
      
      // Process in background
      this.processTranscriptionAsync(analysisId, transcription, metadata);
      
      return {
        analysisId,
        status: 'processing'
      };
    } catch (error) {
      logger.error(`Error analyzing transcription: ${error.message}`);
      this.emit('error', {
        type: 'transcription_analysis_error',
        message: error.message
      });
      throw error;
    }
  }
  
  /**
   * Process transcription asynchronously
   */
  async processTranscriptionAsync(analysisId, transcription, metadata = {}) {
    try {
      // Extract themes
      const themes = await this.extractThemes(transcription);
      
      // Extract sentiment
      const sentiment = await this.extractSentiment(transcription);
      
      // Extract key phrases
      const keyPhrases = await this.extractKeyPhrases(transcription);
      
      // Extract entities
      const entities = await this.extractEntities(transcription);
      
      // Combine results
      const results = {
        analysisId,
        themes,
        sentiment,
        keyPhrases,
        entities,
        metadata,
        completedAt: new Date().toISOString()
      };
      
      // Emit completion event
      this.emit('analysis_completed', results);
      
      return results;
    } catch (error) {
      logger.error(`Error processing transcription: ${error.message}`);
      this.emit('error', {
        type: 'async_processing_error',
        message: error.message,
        analysisId
      });
    }
  }
}

module.exports = GeminiAdapter;
```

### 4. Data Transformation Layer

The Data Transformation Layer handles the conversion of data between different formats, ensuring that data is properly structured for each component of the system.

#### Request Transformer

```javascript
// request-transformer.js
const logger = require('../utils/logger');

/**
 * Transform interview creation request
 */
function transformInterviewCreationRequest(req) {
  try {
    const { title, description, questions, language, maxDuration, projectId } = req.body;
    
    // Validate required fields
    if (!title) {
      throw new Error('Title is required');
    }
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new Error('Questions are required and must be an array');
    }
    
    // Transform questions to Voiceform format if needed
    const transformedQuestions = questions.map((question, index) => {
      if (typeof question === 'string') {
        return {
          id: `q${index + 1}`,
          text: question,
          type: 'open'
        };
      }
      
      return {
        id: question.id || `q${index + 1}`,
        text: question.text,
        type: question.type || 'open'
      };
    });
    
    // Return transformed request
    return {
      title,
      description: description || '',
      questions: transformedQuestions,
      language: language || 'en',
      maxDuration: maxDuration || 300,
      projectId
    };
  } catch (error) {
    logger.error(`Error transforming interview creation request: ${error.message}`);
    throw error;
  }
}

/**
 * Transform audio analysis request
 */
function transformAudioAnalysisRequest(req) {
  try {
    const { audioUrl, interviewId, projectId } = req.body;
    
    // Validate required fields
    if (!audioUrl) {
      throw new Error('Audio URL is required');
    }
    
    if (!interviewId) {
      throw new Error('Interview ID is required');
    }
    
    // Return transformed request
    return {
      audioUrl,
      interviewId,
      projectId,
      metadata: {
        interviewId,
        projectId,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    logger.error(`Error transforming audio analysis request: ${error.message}`);
    throw error;
  }
}

/**
 * Transform transcription analysis request
 */
function transformTranscriptionAnalysisRequest(req) {
  try {
    const { transcription, interviewId, projectId } = req.body;
    
    // Validate required fields
    if (!transcription) {
      throw new Error('Transcription is required');
    }
    
    if (!interviewId) {
      throw new Error('Interview ID is required');
    }
    
    // Return transformed request
    return {
      transcription,
      metadata: {
        interviewId,
        projectId,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    logger.error(`Error transforming transcription analysis request: ${error.message}`);
    throw error;
  }
}

/**
 * Transform insight generation request
 */
function transformInsightGenerationRequest(req) {
  try {
    const { interviewId, emotionAnalysisId, languageAnalysisId, projectId } = req.body;
    
    // Validate required fields
    if (!interviewId) {
      throw new Error('Interview ID is required');
    }
    
    if (!emotionAnalysisId) {
      throw new Error('Emotion analysis ID is required');
    }
    
    if (!languageAnalysisId) {
      throw new Error('Language analysis ID is required');
    }
    
    // Return transformed request
    return {
      interviewId,
      emotionAnalysisId,
      languageAnalysisId,
      projectId,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error transforming insight generation request: ${error.message}`);
    throw error;
  }
}

module.exports = {
  transformInterviewCreationRequest,
  transformAudioAnalysisRequest,
  transformTranscriptionAnalysisRequest,
  transformInsightGenerationRequest
};
```

#### Response Transformer

```javascript
// response-transformer.js
const logger = require('../utils/logger');

/**
 * Transform interview response
 */
function transformInterviewResponse(interview) {
  try {
    return {
      id: interview.id,
      title: interview.title,
      description: interview.description,
      status: interview.status,
      url: interview.url,
      questions: interview.questions,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
      projectId: interview.projectId
    };
  } catch (error) {
    logger.error(`Error transforming interview response: ${error.message}`);
    return interview;
  }
}

/**
 * Transform emotion analysis response
 */
function transformEmotionAnalysisResponse(analysis) {
  try {
    // Extract the most prevalent emotions
    const emotionSummary = summarizeEmotions(analysis.emotions);
    
    return {
      id: analysis.jobId,
      status: analysis.status,
      emotions: analysis.emotions,
      summary: emotionSummary,
      completedAt: analysis.completedAt,
      interviewId: analysis.metadata?.interviewId
    };
  } catch (error) {
    logger.error(`Error transforming emotion analysis response: ${error.message}`);
    return analysis;
  }
}

/**
 * Summarize emotions from analysis
 */
function summarizeEmotions(emotions) {
  try {
    if (!emotions || !Array.isArray(emotions) || emotions.length === 0) {
      return {
        predominantEmotions: [],
        emotionDistribution: {},
        emotionalJourney: []
      };
    }
    
    // Calculate emotion distribution
    const emotionCounts = {};
    const emotionScores = {};
    
    emotions.forEach(segment => {
      Object.entries(segment.emotions).forEach(([emotion, score]) => {
        if (!emotionCounts[emotion]) {
          emotionCounts[emotion] = 0;
          emotionScores[emotion] = 0;
        }
        
        emotionCounts[emotion]++;
        emotionScores[emotion] += score;
      });
    });
    
    // Calculate average scores
    const emotionDistribution = {};
    Object.entries(emotionScores).forEach(([emotion, totalScore]) => {
      emotionDistribution[emotion] = totalScore / emotionCounts[emotion];
    });
    
    // Get predominant emotions (top 3)
    const predominantEmotions = Object.entries(emotionDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion, score]) => ({
        emotion,
        score
      }));
    
    // Create emotional journey (simplified for response)
    const emotionalJourney = emotions.map((segment, index) => {
      // Find the strongest emotion in this segment
      const strongestEmotion = Object.entries(segment.emotions)
        .sort((a, b) => b[1] - a[1])[0];
      
      return {
        timepoint: index,
        startTime: segment.startTime,
        endTime: segment.endTime,
        primaryEmotion: strongestEmotion ? strongestEmotion[0] : 'neutral',
        primaryScore: strongestEmotion ? strongestEmotion[1] : 0
      };
    });
    
    return {
      predominantEmotions,
      emotionDistribution,
      emotionalJourney
    };
  } catch (error) {
    logger.error(`Error summarizing emotions: ${error.message}`);
    return {
      predominantEmotions: [],
      emotionDistribution: {},
      emotionalJourney: []
    };
  }
}

/**
 * Transform language analysis response
 */
function transformLanguageAnalysisResponse(analysis) {
  try {
    return {
      id: analysis.analysisId,
      themes: analysis.themes,
      sentiment: analysis.sentiment,
      keyPhrases: analysis.keyPhrases,
      entities: analysis.entities,
      completedAt: analysis.completedAt,
      interviewId: analysis.metadata?.interviewId
    };
  } catch (error) {
    logger.error(`Error transforming language analysis response: ${error.message}`);
    return analysis;
  }
}

/**
 * Transform insight response
 */
function transformInsightResponse(insight) {
  try {
    return {
      id: insight.id,
      keyInsights: insight.keyInsights,
      emotionalDrivers: insight.emotionalDrivers,
      languagePatterns: insight.languagePatterns,
      recommendations: insight.recommendations,
      priorityAreas: insight.priorityAreas,
      completedAt: insight.completedAt,
      interviewId: insight.interviewId,
      projectId: insight.projectId
    };
  } catch (error) {
    logger.error(`Error transforming insight response: ${error.message}`);
    return insight;
  }
}

module.exports = {
  transformInterviewResponse,
  transformEmotionAnalysisResponse,
  transformLanguageAnalysisResponse,
  transformInsightResponse
};
```

### 5. Event Bus

The Event Bus provides a publish-subscribe mechanism for communication between components, allowing for loose coupling and asynchronous processing.

```javascript
// event-bus.js
const EventEmitter = require('events');
const logger = require('../utils/logger');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Increase max listeners
    
    // Log all events in debug mode
    if (process.env.NODE_ENV === 'development') {
      this.onAny((event, ...args) => {
        logger.debug(`Event emitted: ${event}`, { args });
      });
    }
  }
  
  /**
   * Subscribe to an event
   */
  subscribe(event, listener) {
    this.on(event, listener);
    return () => this.unsubscribe(event, listener);
  }
  
  /**
   * Unsubscribe from an event
   */
  unsubscribe(event, listener) {
    this.off(event, listener);
  }
  
  /**
   * Publish an event
   */
  publish(event, data) {
    this.emit(event, data);
  }
  
  /**
   * Subscribe to all events matching a pattern
   */
  subscribePattern(pattern, listener) {
    const patternRegex = new RegExp(pattern);
    
    const wrappedListener = (event, data) => {
      if (patternRegex.test(event)) {
        listener(event, data);
      }
    };
    
    this.onAny(wrappedListener);
    
    return () => this.unsubscribePattern(wrappedListener);
  }
  
  /**
   * Unsubscribe from pattern
   */
  unsubscribePattern(wrappedListener) {
    this.offAny(wrappedListener);
  }
  
  /**
   * Subscribe to an event once
   */
  subscribeOnce(event, listener) {
    this.once(event, listener);
  }
}

// Create a singleton instance
const eventBus = new EventBus();

module.exports = eventBus;
```

### 6. Integration Orchestrator

The Integration Orchestrator coordinates the flow of data between different components, managing the overall integration process.

```javascript
// integration-orchestrator.js
const eventBus = require('./event-bus');
const logger = require('../utils/logger');
const { createRecord, updateRecord, getRecordById } = require('../services/airtable.service');
const { TABLES } = require('../config/airtable.config');

class IntegrationOrchestrator {
  constructor() {
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Interview events
    eventBus.subscribe('interview_created', this.handleInterviewCreated.bind(this));
    eventBus.subscribe('interview_completed', this.handleInterviewCompleted.bind(this));
    
    // Analysis events
    eventBus.subscribe('emotion_analysis_completed', this.handleEmotionAnalysisCompleted.bind(this));
    eventBus.subscribe('language_analysis_completed', this.handleLanguageAnalysisCompleted.bind(this));
    
    // Insight events
    eventBus.subscribe('insights_generated', this.handleInsightsGenerated.bind(this));
    
    // Error events
    eventBus.subscribe('error', this.handleError.bind(this));
  }
  
  /**
   * Handle interview created event
   */
  async handleInterviewCreated(data) {
    try {
      logger.info(`Handling interview created event: ${data.id}`);
      
      // Store interview in Airtable
      await createRecord(TABLES.INTERVIEWS, {
        id: data.id,
        title: data.title,
        status: data.status,
        url: data.url,
        projectId: data.projectId,
        createdAt: new Date().toISOString()
      });
      
      // Publish event
      eventBus.publish('interview_stored', {
        id: data.id,
        projectId: data.projectId
      });
    } catch (error) {
      logger.error(`Error handling interview created event: ${error.message}`);
      eventBus.publish('error', {
        type: 'interview_storage_error',
        message: error.message,
        data
      });
    }
  }
  
  /**
   * Handle interview completed event
   */
  async handleInterviewCompleted(data) {
    try {
      logger.info(`Handling interview completed event: ${data.interviewId}`);
      
      // Update interview in Airtable
      await updateRecord(TABLES.INTERVIEWS, data.interviewId, {
        status: 'completed',
        transcription: data.transcription,
        audioUrl: data.audioUrl,
        completedAt: data.completedAt || new Date().toISOString()
      });
      
      // Trigger emotion analysis
      eventBus.publish('trigger_emotion_analysis', {
        interviewId: data.interviewId,
        audioUrl: data.audioUrl
      });
      
      // Trigger language analysis
      eventBus.publish('trigger_language_analysis', {
        interviewId: data.interviewId,
        transcription: data.transcription
      });
      
      // Publish event
      eventBus.publish('interview_processing_started', {
        interviewId: data.interviewId
      });
    } catch (error) {
      logger.error(`Error handling interview completed event: ${error.message}`);
      eventBus.publish('error', {
        type: 'interview_processing_error',
        message: error.message,
        data
      });
    }
  }
  
  /**
   * Handle emotion analysis completed event
   */
  async handleEmotionAnalysisCompleted(data) {
    try {
      logger.info(`Handling emotion analysis completed event: ${data.jobId}`);
      
      const interviewId = data.metadata?.interviewId;
      
      if (!interviewId) {
        throw new Error('Interview ID not found in metadata');
      }
      
      // Store emotion analysis in Airtable
      const record = await createRecord(TABLES.EMOTION_ANALYSES, {
        jobId: data.jobId,
        interviewId,
        status: data.status,
        emotionData: JSON.stringify(data.emotions),
        completedAt: data.completedAt
      });
      
      // Check if both analyses are complete
      await this.checkAnalysisCompletion(interviewId);
      
      // Publish event
      eventBus.publish('emotion_analysis_stored', {
        id: record.id,
        interviewId
      });
    } catch (error) {
      logger.error(`Error handling emotion analysis completed event: ${error.message}`);
      eventBus.publish('error', {
        type: 'emotion_analysis_storage_error',
        message: error.message,
        data
      });
    }
  }
  
  /**
   * Handle language analysis completed event
   */
  async handleLanguageAnalysisCompleted(data) {
    try {
      logger.info(`Handling language analysis completed event: ${data.analysisId}`);
      
      const interviewId = data.metadata?.interviewId;
      
      if (!interviewId) {
        throw new Error('Interview ID not found in metadata');
      }
      
      // Store language analysis in Airtable
      const record = await createRecord(TABLES.LANGUAGE_ANALYSES, {
        analysisId: data.analysisId,
        interviewId,
        themes: JSON.stringify(data.themes),
        sentiment: JSON.stringify(data.sentiment),
        keyPhrases: JSON.stringify(data.keyPhrases),
        entities: JSON.stringify(data.entities),
        completedAt: data.completedAt
      });
      
      // Check if both analyses are complete
      await this.checkAnalysisCompletion(interviewId);
      
      // Publish event
      eventBus.publish('language_analysis_stored', {
        id: record.id,
        interviewId
      });
    } catch (error) {
      logger.error(`Error handling language analysis completed event: ${error.message}`);
      eventBus.publish('error', {
        type: 'language_analysis_storage_error',
        message: error.message,
        data
      });
    }
  }
  
  /**
   * Check if both analyses are complete
   */
  async checkAnalysisCompletion(interviewId) {
    try {
      logger.info(`Checking analysis completion for interview: ${interviewId}`);
      
      // Get emotion analysis
      const emotionAnalyses = await getRecordsByField(
        TABLES.EMOTION_ANALYSES,
        'interviewId',
        interviewId
      );
      
      // Get language analysis
      const languageAnalyses = await getRecordsByField(
        TABLES.LANGUAGE_ANALYSES,
        'interviewId',
        interviewId
      );
      
      if (emotionAnalyses.length > 0 && languageAnalyses.length > 0) {
        const emotionAnalysis = emotionAnalyses[0];
        const languageAnalysis = languageAnalyses[0];
        
        // Trigger insight generation
        eventBus.publish('trigger_insight_generation', {
          interviewId,
          emotionAnalysisId: emotionAnalysis.id,
          languageAnalysisId: languageAnalysis.id
        });
        
        // Update interview status
        await updateRecord(TABLES.INTERVIEWS, interviewId, {
          status: 'analyzed'
        });
        
        // Publish event
        eventBus.publish('analysis_completed', {
          interviewId,
          emotionAnalysisId: emotionAnalysis.id,
          languageAnalysisId: languageAnalysis.id
        });
      }
    } catch (error) {
      logger.error(`Error checking analysis completion: ${error.message}`);
      eventBus.publish('error', {
        type: 'analysis_completion_check_error',
        message: error.message,
        interviewId
      });
    }
  }
  
  /**
   * Handle insights generated event
   */
  async handleInsightsGenerated(data) {
    try {
      logger.info(`Handling insights generated event for interview: ${data.interviewId}`);
      
      // Store insights in Airtable
      const record = await createRecord(TABLES.INSIGHTS, {
        interviewId: data.interviewId,
        keyInsights: JSON.stringify(data.keyInsights),
        emotionalDrivers: JSON.stringify(data.emotionalDrivers),
        languagePatterns: JSON.stringify(data.languagePatterns),
        recommendations: JSON.stringify(data.recommendations),
        priorityAreas: JSON.stringify(data.priorityAreas),
        completedAt: new Date().toISOString()
      });
      
      // Update interview status
      await updateRecord(TABLES.INTERVIEWS, data.interviewId, {
        status: 'completed'
      });
      
      // Publish event
      eventBus.publish('insights_stored', {
        id: record.id,
        interviewId: data.interviewId
      });
    } catch (error) {
      logger.error(`Error handling insights generated event: ${error.message}`);
      eventBus.publish('error', {
        type: 'insights_storage_error',
        message: error.message,
        data
      });
    }
  }
  
  /**
   * Handle error event
   */
  handleError(error) {
    logger.error(`Integration error: ${error.type} - ${error.message}`);
    
    // Store error in Airtable for tracking
    try {
      createRecord(TABLES.ERRORS, {
        type: error.type,
        message: error.message,
        data: JSON.stringify(error.data || {}),
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      logger.error(`Error storing error record: ${err.message}`);
    }
  }
}

// Helper function to get records by field
async function getRecordsByField(tableName, fieldName, fieldValue) {
  try {
    const records = await queryRecords(
      tableName,
      `{${fieldName}} = "${fieldValue}"`
    );
    
    return records;
  } catch (error) {
    logger.error(`Error getting records by field: ${error.message}`);
    return [];
  }
}

// Create a singleton instance
const orchestrator = new IntegrationOrchestrator();

module.exports = orchestrator;
```

## Integration Configuration

### Environment Configuration

```
# Integration Configuration
INTEGRATION_TIMEOUT=30000
RETRY_ATTEMPTS=3
RETRY_DELAY=5000
WEBHOOK_SECRET=your-webhook-secret

# Service URLs
VOICEFORM_WEBHOOK_URL=https://api.example.com/webhooks/voiceform
HUME_WEBHOOK_URL=https://api.example.com/webhooks/hume
GEMINI_WEBHOOK_URL=https://api.example.com/webhooks/gemini
INSIGHT7_WEBHOOK_URL=https://api.example.com/webhooks/insight7

# Service Secrets
VOICEFORM_WEBHOOK_SECRET=your-voiceform-webhook-secret
HUME_WEBHOOK_SECRET=your-hume-webhook-secret
```

### Integration Startup

```javascript
// integration-startup.js
const express = require('express');
const { createServer } = require('http');
const logger = require('./utils/logger');
const apiGateway = require('./api-gateway');
const orchestrator = require('./integration-orchestrator');
const eventBus = require('./event-bus');
const { VoiceformAdapter, HumeAdapter, GeminiAdapter } = require('./adapters');

// Load environment variables
require('dotenv').config();

// Initialize service adapters
const voiceformAdapter = new VoiceformAdapter({
  apiKey: process.env.VOICEFORM_API_KEY,
  apiUrl: process.env.VOICEFORM_API_URL,
  webhookUrl: process.env.VOICEFORM_WEBHOOK_URL
});

const humeAdapter = new HumeAdapter({
  apiKey: process.env.HUME_API_KEY,
  apiUrl: process.env.HUME_API_URL,
  webhookUrl: process.env.HUME_WEBHOOK_URL
});

const geminiAdapter = new GeminiAdapter({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: 'gemini-1.5-pro'
});

// Connect adapter events to event bus
voiceformAdapter.on('interview_created', (data) => {
  eventBus.publish('interview_created', data);
});

voiceformAdapter.on('interview_completed', (data) => {
  eventBus.publish('interview_completed', data);
});

humeAdapter.on('analysis_completed', (data) => {
  eventBus.publish('emotion_analysis_completed', data);
});

geminiAdapter.on('analysis_completed', (data) => {
  eventBus.publish('language_analysis_completed', data);
});

// Handle adapter errors
voiceformAdapter.on('error', (error) => {
  eventBus.publish('error', {
    type: `voiceform_${error.type}`,
    message: error.message,
    data: error.data
  });
});

humeAdapter.on('error', (error) => {
  eventBus.publish('error', {
    type: `hume_${error.type}`,
    message: error.message,
    data: error.data
  });
});

geminiAdapter.on('error', (error) => {
  eventBus.publish('error', {
    type: `gemini_${error.type}`,
    message: error.message,
    data: error.data
  });
});

// Subscribe to trigger events
eventBus.subscribe('trigger_emotion_analysis', async (data) => {
  try {
    logger.info(`Triggering emotion analysis for interview: ${data.interviewId}`);
    
    // Download audio file
    const tempFilePath = `/tmp/${data.interviewId}.mp3`;
    await voiceformAdapter.downloadAudio(data.audioUrl, tempFilePath);
    
    // Submit for analysis
    await humeAdapter.submitAudioForAnalysis(tempFilePath, {
      interviewId: data.interviewId
    });
  } catch (error) {
    logger.error(`Error triggering emotion analysis: ${error.message}`);
    eventBus.publish('error', {
      type: 'emotion_analysis_trigger_error',
      message: error.message,
      data
    });
  }
});

eventBus.subscribe('trigger_language_analysis', async (data) => {
  try {
    logger.info(`Triggering language analysis for interview: ${data.interviewId}`);
    
    // Submit for analysis
    await geminiAdapter.analyzeTranscription(data.transcription, {
      interviewId: data.interviewId
    });
  } catch (error) {
    logger.error(`Error triggering language analysis: ${error.message}`);
    eventBus.publish('error', {
      type: 'language_analysis_trigger_error',
      message: error.message,
      data
    });
  }
});

eventBus.subscribe('trigger_insight_generation', async (data) => {
  try {
    logger.info(`Triggering insight generation for interview: ${data.interviewId}`);
    
    // Get emotion analysis data
    const emotionAnalysis = await getRecordById(
      TABLES.EMOTION_ANALYSES,
      data.emotionAnalysisId
    );
    
    // Get language analysis data
    const languageAnalysis = await getRecordById(
      TABLES.LANGUAGE_ANALYSES,
      data.languageAnalysisId
    );
    
    // Get interview data
    const interview = await getRecordById(
      TABLES.INTERVIEWS,
      data.interviewId
    );
    
    // Get project data
    const project = await getRecordById(
      TABLES.PROJECTS,
      interview.projectId
    );
    
    // Prepare data for insight generation
    const insightData = {
      project: {
        title: project.title,
        description: project.description,
        objectives: project.objectives,
        industry: project.industry
      },
      emotionData: JSON.parse(emotionAnalysis.emotionData),
      languageData: {
        themes: JSON.parse(languageAnalysis.themes),
        sentiment: JSON.parse(languageAnalysis.sentiment),
        keyPhrases: JSON.parse(languageAnalysis.keyPhrases),
        entities: JSON.parse(languageAnalysis.entities)
      },
      interviewId: data.interviewId
    };
    
    // Generate insights
    const insights = await geminiAdapter.generateInsights(insightData);
    
    // Add interview ID
    insights.interviewId = data.interviewId;
    
    // Publish event
    eventBus.publish('insights_generated', insights);
  } catch (error) {
    logger.error(`Error triggering insight generation: ${error.message}`);
    eventBus.publish('error', {
      type: 'insight_generation_trigger_error',
      message: error.message,
      data
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = createServer(apiGateway);

server.listen(PORT, () => {
  logger.info(`Integration framework running on port ${PORT}`);
});

// Export for testing
module.exports = {
  server,
  voiceformAdapter,
  humeAdapter,
  geminiAdapter,
  eventBus,
  orchestrator
};
```

## Implementation Plan

### Phase 1: Core Integration Components (Week 1-2)
1. Set up API Gateway with security middleware
2. Implement Event Bus for communication between components
3. Create basic Service Adapters for external services
4. Implement Webhook Handler System
5. Set up error handling and logging

### Phase 2: Service Adapters (Week 3-4)
1. Implement Voiceform Adapter with event emission
2. Create Hume AI Adapter with audio processing
3. Develop Gemini API Adapter with text analysis
4. Implement Airtable Adapter for data storage
5. Create Insight7 Adapter for visualization

### Phase 3: Data Transformation (Week 5-6)
1. Implement Request Transformer for API requests
2. Create Response Transformer for API responses
3. Develop data normalization functions
4. Implement error handling for transformations
5. Create validation functions for data integrity

### Phase 4: Integration Orchestration (Week 7-8)
1. Implement Integration Orchestrator
2. Create workflow management for the analysis pipeline
3. Implement event handling for all components
4. Set up error recovery mechanisms
5. Create monitoring and alerting for integration issues

## Conclusion
This integration framework provides a robust foundation for connecting all components of the Rapid Consumer Sentiment Analysis service. The framework is designed to be modular, scalable, and resilient, with comprehensive error handling and monitoring. The event-driven architecture allows for loose coupling between components, making the system easier to maintain and extend in the future.
