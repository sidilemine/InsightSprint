# Revised Implementation Approach for Rapid Consumer Sentiment Analysis

This document outlines the revised implementation approach for the Rapid Consumer Sentiment Analysis service based on the updated technology stack and integration framework.

## Executive Summary

Based on user feedback, we've revised the technology stack to address three key concerns:
1. Replacing Voiceform with AssemblyAI for AI-moderated voice surveys
2. Adapting to Airtable's OAuth token authentication instead of API keys
3. Finding an alternative to Insight7 due to its file number limitations

The revised implementation approach maintains the core functionality of the service while enhancing its capabilities and addressing these concerns.

## Implementation Phases

### Phase 1: Core Infrastructure Setup

#### 1.1 Backend Framework Update
- Update Node.js/Express backend to support the new service integrations
- Implement environment configuration for new API keys and secrets
- Set up secure storage for OAuth tokens and credentials

#### 1.2 Database Schema Modifications
- Update MongoDB schemas to accommodate new data structures
- Add support for storing OAuth tokens securely
- Create new collections for analysis results and visualizations

#### 1.3 Authentication System Enhancement
- Implement OAuth flow for Airtable integration
- Create token management system (storage, refresh, expiry)
- Update middleware to use OAuth tokens for Airtable requests

### Phase 2: Service Integration Implementation

#### 2.1 AssemblyAI Integration
- Implement AssemblyAI client service
- Create endpoints for audio transcription and analysis
- Develop LeMUR integration for advanced insights
- Set up error handling and retry logic

#### 2.2 Airtable OAuth Integration
- Implement OAuth authorization flow with PKCE
- Create token management service
- Update Airtable data access layer to use OAuth
- Implement token refresh mechanism

#### 2.3 Visualization Solution
- **Option A: Dovetail Integration**
  - Implement Dovetail client service
  - Create data transformation layer for Dovetail compatibility
  - Develop embedding mechanism for visualizations
  
- **Option B: In-House Visualization**
  - Implement custom analysis pipeline with Gemini API
  - Develop React/D3.js visualization components
  - Create data processing service for visualization

### Phase 3: Frontend Implementation

#### 3.1 User Interface Updates
- Update React components to support new data structures
- Create visualization embedding components
- Implement OAuth authorization UI flow
- Enhance dashboard with new insight displays

#### 3.2 Researcher Interface
- Develop improved interview management interface
- Create visualization customization tools
- Implement insight exploration features
- Add export functionality for reports

#### 3.3 Respondent Interface
- Update voice recording component to work with AssemblyAI
- Enhance feedback collection mechanism
- Improve user experience for audio submissions

### Phase 4: Testing and Deployment

#### 4.1 Comprehensive Testing
- Implement unit tests for all new services
- Create integration tests for the complete workflow
- Develop end-to-end tests for user journeys
- Perform security testing for OAuth implementation

#### 4.2 Deployment Pipeline
- Update deployment scripts for new dependencies
- Configure environment variables for production
- Set up monitoring for new service integrations
- Implement logging for OAuth and API interactions

#### 4.3 Documentation
- Update API documentation
- Create user guides for the new features
- Develop administrator documentation for OAuth setup
- Create troubleshooting guides

## Technical Implementation Details

### AssemblyAI Implementation

```javascript
// src/services/assemblyai.service.js
const axios = require('axios');

class AssemblyAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: 'https://api.assemblyai.com/v2',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async transcribeAudio(audioUrl, options = {}) {
    try {
      const response = await this.client.post('/transcript', {
        audio_url: audioUrl,
        sentiment_analysis: options.sentiment_analysis || true,
        content_safety: options.content_safety || true
      });
      
      return response.data;
    } catch (error) {
      console.error('AssemblyAI Transcription Error:', error);
      throw error;
    }
  }

  async getTranscription(transcriptId) {
    try {
      const response = await this.client.get(`/transcript/${transcriptId}`);
      return response.data;
    } catch (error) {
      console.error('AssemblyAI Get Transcription Error:', error);
      throw error;
    }
  }

  async generateInsights(transcriptId, prompt) {
    try {
      const response = await this.client.post('/lemur/v3/generate', {
        transcript_ids: [transcriptId],
        prompt: prompt,
        max_output_size: 1000
      });
      
      return response.data;
    } catch (error) {
      console.error('AssemblyAI LeMUR Error:', error);
      throw error;
    }
  }
}

module.exports = AssemblyAIService;
```

### Airtable OAuth Implementation

```javascript
// src/services/airtable-oauth.service.js
const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');

class AirtableOAuthService {
  constructor(config) {
    this.config = config;
    this.tokenUrl = 'https://airtable.com/oauth2/v1/token';
    this.authorizeUrl = 'https://airtable.com/oauth2/v1/authorize';
  }

  // Generate a random string for state parameter
  generateState() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate a random string for code verifier
  generateCodeVerifier() {
    return crypto.randomBytes(64).toString('hex');
  }

  // Generate code challenge from code verifier
  generateCodeChallenge(codeVerifier) {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    return hash.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Get authorization URL
  getAuthorizationUrl(state, codeChallenge) {
    const params = {
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      scope: this.config.scope || 'data.records:read data.records:write'
    };

    return `${this.authorizeUrl}?${querystring.stringify(params)}`;
  }

  // Exchange authorization code for tokens
  async getTokenFromCode(code, codeVerifier) {
    try {
      const response = await axios.post(this.tokenUrl, {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId,
        code_verifier: codeVerifier
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Airtable OAuth Token Error:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      const response = await axios.post(this.tokenUrl, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Airtable OAuth Refresh Error:', error);
      throw error;
    }
  }

  // Check if token is expired
  isTokenExpired(tokens) {
    if (!tokens || !tokens.created_at || !tokens.expires_in) {
      return true;
    }
    
    const expiryTime = tokens.created_at + (tokens.expires_in * 1000);
    // Add a buffer of 5 minutes to prevent edge cases
    return Date.now() >= (expiryTime - 300000);
  }
}

module.exports = AirtableOAuthService;
```

### Dovetail Integration

```javascript
// src/services/dovetail.service.js
const axios = require('axios');

class DovetailService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: 'https://api.dovetailapp.com/v1',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getProjects() {
    try {
      const response = await this.client.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Dovetail Get Projects Error:', error);
      throw error;
    }
  }

  async createInterview(projectId, data) {
    try {
      const response = await this.client.post(`/projects/${projectId}/interviews`, {
        title: data.title,
        participant: data.participant,
        notes: data.transcription,
        tags: data.tags || []
      });
      
      return response.data;
    } catch (error) {
      console.error('Dovetail Create Interview Error:', error);
      throw error;
    }
  }

  async createVisualization(projectId, data) {
    try {
      const response = await this.client.post(`/projects/${projectId}/visualizations`, {
        name: data.name,
        type: data.type,
        config: data.config || {}
      });
      
      return response.data;
    } catch (error) {
      console.error('Dovetail Create Visualization Error:', error);
      throw error;
    }
  }

  async getVisualizationEmbed(projectId, visualizationId) {
    try {
      const response = await this.client.get(`/projects/${projectId}/visualizations/${visualizationId}/embed`);
      return response.data;
    } catch (error) {
      console.error('Dovetail Embed Error:', error);
      throw error;
    }
  }
}

module.exports = DovetailService;
```

### In-House Analysis Implementation (Alternative to Dovetail)

```javascript
// src/services/in-house-analysis.service.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

class InHouseAnalysisService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async analyzeTranscription(transcription, sentimentData) {
    try {
      const prompt = `
        Analyze the following interview transcription and sentiment data:
        
        Transcription:
        ${transcription}
        
        Sentiment Data:
        ${JSON.stringify(sentimentData)}
        
        Please provide:
        1. Key themes and topics
        2. Emotional patterns
        3. Actionable insights
        4. Recommendations
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
      // Process the analysis text to extract structured data
      const structuredData = this.extractStructuredData(analysisText);
      
      return {
        id: `analysis-${Date.now()}`,
        raw_text: analysisText,
        structured_data: structuredData,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Analysis Error:', error);
      throw error;
    }
  }

  extractStructuredData(analysisText) {
    // This is a simplified implementation
    // In a real system, this would use more sophisticated parsing
    
    const themes = [];
    const insights = [];
    const recommendations = [];
    const emotionalPatterns = [];
    
    // Extract themes
    const themesMatch = analysisText.match(/Key Themes and Topics([\s\S]*?)(?=Emotional Patterns|$)/);
    if (themesMatch && themesMatch[1]) {
      const themeLines = themesMatch[1].split('\n').filter(line => line.trim().length > 0);
      themeLines.forEach(line => {
        const themeMatch = line.match(/\d+\.\s*(.*?):\s*(.*)/);
        if (themeMatch) {
          themes.push({
            name: themeMatch[1],
            description: themeMatch[2],
            sentiment: line.toLowerCase().includes('positive') ? 'positive' : 
                      line.toLowerCase().includes('negative') ? 'negative' : 'neutral',
            confidence: 0.8 // Default confidence
          });
        }
      });
    }
    
    // Extract insights
    const insightsMatch = analysisText.match(/Actionable Insights([\s\S]*?)(?=Recommendations|$)/);
    if (insightsMatch && insightsMatch[1]) {
      const insightLines = insightsMatch[1].split('\n').filter(line => line.trim().length > 0);
      insightLines.forEach(line => {
        const insightMatch = line.match(/\d+\.\s*(.*)/);
        if (insightMatch) {
          insights.push(insightMatch[1]);
        }
      });
    }
    
    // Extract recommendations
    const recommendationsMatch = analysisText.match(/Recommendations([\s\S]*?)(?=$)/);
    if (recommendationsMatch && recommendationsMatch[1]) {
      const recommendationLines = recommendationsMatch[1].split('\n').filter(line => line.trim().length > 0);
      recommendationLines.forEach(line => {
        const recommendationMatch = line.match(/\d+\.\s*(.*)/);
        if (recommendationMatch) {
          recommendations.push(recommendationMatch[1]);
        }
      });
    }
    
    // Extract emotional patterns
    const emotionsMatch = analysisText.match(/Emotional Patterns([\s\S]*?)(?=Actionable Insights|$)/);
    if (emotionsMatch && emotionsMatch[1]) {
      const emotionLines = emotionsMatch[1].split('\n').filter(line => line.trim().length > 0);
      emotionLines.forEach(line => {
        const emotionMatch = line.match(/- (.*)/);
        if (emotionMatch) {
          const emotionText = emotionMatch[1];
          const segment = emotionText.match(/(.*?) sentiment/) ? 
                         emotionText.match(/(.*?) sentiment/)[1] : 'general';
          const emotion = emotionText.toLowerCase().includes('positive') ? 'positive' : 
                         emotionText.toLowerCase().includes('negative') ? 'negative' : 
                         emotionText.toLowerCase().includes('mixed') ? 'mixed' : 'neutral';
          
          emotionalPatterns.push({
            segment,
            emotion,
            intensity: emotion === 'positive' ? 0.8 : 
                      emotion === 'negative' ? 0.7 : 
                      emotion === 'mixed' ? 0.6 : 0.5
          });
        }
      });
    }
    
    return {
      themes,
      emotional_patterns: emotionalPatterns,
      insights,
      recommendations
    };
  }

  async generateVisualizationData(transcription, sentimentData, analysisResults) {
    // Generate visualization data based on the analysis results
    const sentimentOverTime = sentimentData.map((item, index) => ({
      timestamp: item.start || index * 2,
      sentiment: item.sentiment === 'positive' ? 0.8 : 
                item.sentiment === 'negative' ? -0.6 : 0.1,
      text: item.text || transcription.substring(index * 50, (index + 1) * 50).trim()
    }));
    
    // Generate topic clusters from themes
    const topicClusters = analysisResults.structured_data.themes.map(theme => ({
      name: theme.name,
      size: Math.floor(Math.random() * 30) + 10, // Random size between 10-40
      sentiment: theme.sentiment === 'positive' ? 0.8 : 
                theme.sentiment === 'negative' ? -0.6 : 0.1
    }));
    
    // Calculate emotion distribution
    const emotions = sentimentData.reduce((acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
      return acc;
    }, {});
    
    const totalEmotions = Object.values(emotions).reduce((sum, count) => sum + count, 0);
    const emotionPatterns = {
      positive: Math.round((emotions.positive || 0) / totalEmotions * 100),
      negative: Math.round((emotions.negative || 0) / totalEmotions * 100),
      neutral: Math.round((emotions.neutral || 0) / totalEmotions * 100)
    };
    
    return {
      id: `visualization-${Date.now()}`,
      sentiment_over_time: sentimentOverTime,
      topic_clusters: topicClusters,
      emotion_patterns: emotionPatterns,
      created_at: new Date().toISOString()
    };
  }
}

module.exports = InHouseAnalysisService;
```

## Controller Implementation

```javascript
// src/controllers/analysis.controller.js
class AnalysisController {
  constructor(assemblyAIService, airtableService, visualizationService) {
    this.assemblyAIService = assemblyAIService;
    this.airtableService = airtableService;
    this.visualizationService = visualizationService;
  }

  async createAnalysis(req, res) {
    try {
      const { audioUrl, projectId, options } = req.body;
      
      // Step 1: Transcribe audio
      const transcriptionResponse = await this.assemblyAIService.transcribeAudio(audioUrl, {
        sentiment_analysis: true,
        content_safety: true
      });
      
      // Step 2: Poll for transcription completion
      let transcription;
      let attempts = 0;
      const maxAttempts = 30;
      
      while (attempts < maxAttempts) {
        transcription = await this.assemblyAIService.getTranscription(transcriptionResponse.id);
        
        if (transcription.status === 'completed') {
          break;
        } else if (transcription.status === 'error') {
          throw new Error('Transcription failed: ' + transcription.error);
        }
        
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Transcription timed out');
      }
      
      // Step 3: Generate insights if requested
      let insights = null;
      if (options?.generateInsights) {
        insights = await this.assemblyAIService.generateInsights(
          transcription.id,
          'Analyze this interview for key themes, emotional patterns, and actionable insights.'
        );
      }
      
      // Step 4: Store in Airtable
      const airtableRecord = await this.airtableService.createRecord('Analyses', {
        TranscriptionId: transcription.id,
        Text: transcription.text,
        SentimentAnalysis: JSON.stringify(transcription.sentiment_analysis_results),
        ContentSafety: JSON.stringify(transcription.content_safety_labels),
        Insights: insights ? JSON.stringify(insights.response) : null,
        ProjectId: projectId,
        CreatedAt: new Date().toISOString()
      });
      
      // Step 5: Create visualization if requested
      let visualization = null;
      if (options?.createVisualization) {
        // This could be Dovetail or in-house visualization
        visualization = await this.visualizationService.createVisualization(projectId, {
          transcription,
          insights,
          airtableRecordId: airtableRecord.id
        });
      }
      
      // Return the results
      return res.status(200).json({
        success: true,
        data: {
          transcription,
          insights,
          airtableRecord,
          visualization
        }
      });
    } catch (error) {
      console.error('Analysis Creation Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getAnalysis(req, res) {
    try {
      const { id } = req.params;
      
      // Get transcription from AssemblyAI
      const transcription = await this.assemblyAIService.getTranscription(id);
      
      // Get record from Airtable
      const airtableRecord = await this.airtableService.getRecord('Analyses', {
        filterByFormula: `{TranscriptionId} = '${id}'`
      });
      
      // Get visualization if available
      let visualization = null;
      if (airtableRecord && airtableRecord.fields.VisualizationId) {
        visualization = await this.visualizationService.getVisualization(
          airtableRecord.fields.ProjectId,
          airtableRecord.fields.VisualizationId
        );
      }
      
      return res.status(200).json({
        success: true,
        data: {
          transcription,
          airtableRecord,
          visualization
        }
      });
    } catch (error) {
      console.error('Get Analysis Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = AnalysisController;
```

## Frontend Implementation

### React Components for OAuth Flow

```jsx
// src/client/components/AirtableOAuth.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface AirtableOAuthProps {
  onSuccess: (tokens: any) => void;
  onError: (error: Error) => void;
}

const AirtableOAuth: React.FC<AirtableOAuthProps> = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const initiateOAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Request authorization URL from backend
      const response = await axios.get('/api/auth/airtable/connect');
      
      // Store state and code verifier in session storage
      sessionStorage.setItem('oauth_state', response.data.state);
      sessionStorage.setItem('oauth_code_verifier', response.data.codeVerifier);
      
      // Redirect to Airtable authorization page
      window.location.href = response.data.authorizationUrl;
    } catch (err) {
      setError('Failed to initiate OAuth flow');
      onError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state) {
        try {
          setIsLoading(true);
          
          // Verify state matches
          const storedState = sessionStorage.getItem('oauth_state');
          if (state !== storedState) {
            throw new Error('OAuth state mismatch');
          }
          
          // Get code verifier
          const codeVerifier = sessionStorage.getItem('oauth_code_verifier');
          if (!codeVerifier) {
            throw new Error('Code verifier not found');
          }
          
          // Exchange code for tokens
          const response = await axios.post('/api/auth/airtable/callback', {
            code,
            state,
            codeVerifier
          });
          
          // Clear session storage
          sessionStorage.removeItem('oauth_state');
          sessionStorage.removeItem('oauth_code_verifier');
          
          // Call success callback
          onSuccess(response.data.tokens);
        } catch (err) {
          setError('Failed to complete OAuth flow');
          onError(err as Error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    if (window.location.search.includes('code=')) {
      handleCallback();
    }
  }, [onSuccess, onError]);
  
  return (
    <div className="airtable-oauth">
      <h2>Connect to Airtable</h2>
      {error && <div className="error">{error}</div>}
      <button 
        onClick={initiateOAuth} 
        disabled={isLoading}
        className="btn btn-primary"
      >
        {isLoading ? 'Connecting...' : 'Connect to Airtable'}
      </button>
    </div>
  );
};

export default AirtableOAuth;
```

### Visualization Component

```jsx
// src/client/components/AnalysisVisualization.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Bar, Pie } from 'react-chartjs-2';

interface AnalysisVisualizationProps {
  analysisId: string;
  visualizationType: 'dovetail' | 'in-house';
}

const AnalysisVisualization: React.FC<AnalysisVisualizationProps> = ({ 
  analysisId, 
  visualizationType 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visualizationData, setVisualizationData] = useState<any>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchVisualization = async () => {
      try {
        setIsLoading(true);
        
        if (visualizationType === 'dovetail') {
          // Fetch Dovetail embed URL
          const response = await axios.get(`/api/visualize/embed/${analysisId}`);
          setEmbedUrl(response.data.embedUrl);
        } else {
          // Fetch in-house visualization data
          const response = await axios.get(`/api/visualize/data/${analysisId}`);
          setVisualizationData(response.data);
        }
      } catch (err) {
        setError('Failed to load visualization');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVisualization();
  }, [analysisId, visualizationType]);
  
  if (isLoading) {
    return <div className="loading">Loading visualization...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (visualizationType === 'dovetail' && embedUrl) {
    return (
      <div className="dovetail-embed">
        <iframe 
          src={embedUrl} 
          width="100%" 
          height="600" 
          frameBorder="0"
          title="Dovetail Visualization"
        />
      </div>
    );
  }
  
  if (visualizationType === 'in-house' && visualizationData) {
    return (
      <div className="in-house-visualization">
        <h3>Sentiment Over Time</h3>
        <div className="chart-container">
          <Line 
            data={{
              labels: visualizationData.sentiment_over_time.map((item: any) => 
                new Date(item.timestamp * 1000).toISOString().substr(14, 5)
              ),
              datasets: [{
                label: 'Sentiment',
                data: visualizationData.sentiment_over_time.map((item: any) => item.sentiment),
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
              }]
            }}
            options={{
              scales: {
                y: {
                  min: -1,
                  max: 1
                }
              }
            }}
          />
        </div>
        
        <h3>Emotion Distribution</h3>
        <div className="chart-container">
          <Pie 
            data={{
              labels: Object.keys(visualizationData.emotion_patterns),
              datasets: [{
                data: Object.values(visualizationData.emotion_patterns),
                backgroundColor: [
                  'rgba(75, 192, 192, 0.6)',
                  'rgba(255, 99, 132, 0.6)',
                  'rgba(201, 203, 207, 0.6)'
                ]
              }]
            }}
          />
        </div>
        
        <h3>Topic Distribution</h3>
        <div className="chart-container">
          <Bar 
            data={{
              labels: visualizationData.topic_clusters.map((item: any) => item.name),
              datasets: [{
                label: 'Size',
                data: visualizationData.topic_clusters.map((item: any) => item.size),
                backgroundColor: visualizationData.topic_clusters.map((item: any) => 
                  item.sentiment > 0.3 ? 'rgba(75, 192, 192, 0.6)' :
                  item.sentiment < -0.3 ? 'rgba(255, 99, 132, 0.6)' :
                  'rgba(201, 203, 207, 0.6)'
                )
              }]
            }}
          />
        </div>
      </div>
    );
  }
  
  return <div>No visualization available</div>;
};

export default AnalysisVisualization;
```

## Migration Strategy

### 1. Data Migration

- Create a script to migrate existing data to the new schema
- Implement a backup mechanism for existing data
- Validate migrated data for consistency

### 2. Service Transition

- Implement parallel running of old and new services during transition
- Create feature flags to control service switching
- Develop rollback procedures in case of issues

### 3. User Training

- Create documentation for the new features
- Develop training materials for researchers
- Provide support during the transition period

## Risk Management

| Risk | Impact | Mitigation |
|------|--------|------------|
| AssemblyAI API changes | High | Implement version pinning, monitor API changes |
| OAuth token expiration | Medium | Implement robust token refresh mechanism |
| Visualization compatibility | Medium | Test thoroughly, provide fallback options |
| Data migration issues | High | Create comprehensive backup strategy, validate data |
| User adoption challenges | Medium | Provide training and support, gather feedback |

## Success Metrics

- Successful processing of voice surveys with AssemblyAI
- Reliable Airtable integration using OAuth
- Effective visualization of analysis results
- Positive user feedback on the new features
- Improved analysis quality and insights

## Next Steps

1. Finalize technology stack selection based on user feedback
2. Begin implementation of core infrastructure updates
3. Develop service integrations in parallel
4. Create and test frontend components
5. Perform comprehensive testing
6. Deploy to production with careful monitoring
