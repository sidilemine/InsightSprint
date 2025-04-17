# Revised Integration Framework

This document outlines the revised integration framework for the Rapid Consumer Sentiment Analysis service based on the updated technology stack.

## System Architecture Overview

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│                 │     │               │     │                │
│  AssemblyAI     │────▶│  Backend API  │────▶│  Airtable      │
│  Speech Analysis│     │  (Node.js)    │     │  (OAuth)       │
│                 │     │               │     │                │
└─────────────────┘     └───────┬───────┘     └────────────────┘
                               │
                               ▼
                        ┌─────────────┐        ┌────────────────┐
                        │             │        │                │
                        │  Gemini API │◀───────│  Dovetail      │
                        │  (LLM)      │        │  Visualization │
                        │             │        │                │
                        └─────────────┘        └────────────────┘
```

## Component Integration Details

### 1. AssemblyAI Integration

#### API Endpoints:
- `/api/transcribe`: Submit audio for transcription
- `/api/analyze/sentiment`: Get sentiment analysis of audio
- `/api/analyze/content`: Get content moderation results
- `/api/lemur/summarize`: Generate summaries from audio content
- `/api/lemur/insights`: Extract insights from audio content

#### Implementation Changes:
- Replace Voiceform API calls with AssemblyAI SDK
- Update audio processing pipeline to leverage AssemblyAI's features
- Implement new error handling for AssemblyAI-specific responses
- Add configuration for AssemblyAI API keys and settings

#### Code Example:
```javascript
import assemblyai from 'assemblyai';

// Initialize client
const client = new assemblyai.Client(process.env.ASSEMBLYAI_API_KEY);

// Transcribe audio with sentiment analysis
async function transcribeAudio(audioUrl) {
  const config = {
    audio_url: audioUrl,
    sentiment_analysis: true,
    content_safety: true
  };
  
  const transcript = await client.transcripts.create(config);
  return transcript;
}

// Extract insights using LeMUR
async function generateInsights(transcriptId, prompt) {
  const lemurResponse = await client.lemur.query({
    transcript_ids: [transcriptId],
    prompt: prompt,
    max_output_size: 1000
  });
  
  return lemurResponse;
}
```

### 2. Airtable OAuth Integration

#### Authentication Flow:
1. Redirect user to Airtable authorization URL
2. User grants permissions to the application
3. Airtable redirects back with authorization code
4. Exchange code for access token
5. Store and refresh tokens as needed

#### API Endpoints:
- `/api/auth/airtable/connect`: Initiate OAuth flow
- `/api/auth/airtable/callback`: Handle OAuth callback
- `/api/auth/airtable/refresh`: Refresh expired tokens

#### Implementation Changes:
- Replace direct API key authentication with OAuth flow
- Add token management (storage, refresh, expiry)
- Implement PKCE extension for security
- Update Airtable service to use OAuth tokens

#### Code Example:
```javascript
import { AuthorizationCode } from 'simple-oauth2';

// OAuth client configuration
const oauth2Client = new AuthorizationCode({
  client: {
    id: process.env.AIRTABLE_CLIENT_ID,
    secret: process.env.AIRTABLE_CLIENT_SECRET
  },
  auth: {
    tokenHost: 'https://airtable.com',
    tokenPath: '/oauth2/v1/token',
    authorizeHost: 'https://airtable.com',
    authorizePath: '/oauth2/v1/authorize'
  }
});

// Generate authorization URL
function getAuthorizationUrl(state, codeChallenge) {
  return oauth2Client.authorizeURL({
    redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
    scope: 'data.records:read data.records:write',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });
}

// Exchange code for token
async function getToken(code, codeVerifier) {
  const tokenParams = {
    code,
    redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
    code_verifier: codeVerifier
  };
  
  try {
    const result = await oauth2Client.getToken(tokenParams);
    return result.token;
  } catch (error) {
    console.error('Access Token Error', error.message);
    throw error;
  }
}
```

### 3. Dovetail Integration

#### Integration Approach:
- Use Dovetail's API to push data for visualization
- Embed Dovetail visualizations in the application dashboard
- Implement SSO for seamless user experience

#### API Endpoints:
- `/api/visualize/push`: Send analyzed data to Dovetail
- `/api/visualize/embed`: Get embedded visualization URLs
- `/api/visualize/export`: Export visualization data

#### Implementation Changes:
- Create new Dovetail service for API interactions
- Implement data transformation for Dovetail compatibility
- Add visualization component in frontend for Dovetail embeds
- Set up authentication between our system and Dovetail

#### Code Example:
```javascript
import axios from 'axios';

// Dovetail API client
class DovetailClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.dovetailapp.com/v1';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }
  
  // Push interview data to Dovetail
  async createInterview(projectId, data) {
    try {
      const response = await this.client.post(`/projects/${projectId}/interviews`, {
        title: data.title,
        participant: data.participant,
        notes: data.transcription,
        tags: data.tags,
        sentiment: data.sentiment
      });
      return response.data;
    } catch (error) {
      console.error('Dovetail API Error', error);
      throw error;
    }
  }
  
  // Get embedded visualization URL
  async getVisualizationEmbed(projectId, visualizationId) {
    try {
      const response = await this.client.get(`/projects/${projectId}/visualizations/${visualizationId}/embed`);
      return response.data.embedUrl;
    } catch (error) {
      console.error('Dovetail Embed Error', error);
      throw error;
    }
  }
}
```

### 4. In-House LLM Analysis Option

If choosing the in-house approach instead of Dovetail:

#### Components:
- Custom analysis pipeline using Gemini API
- React-based visualization dashboard with D3.js
- MongoDB for storing analysis results

#### API Endpoints:
- `/api/analyze/custom`: Run custom analysis on transcribed data
- `/api/visualize/generate`: Generate visualization data
- `/api/visualize/dashboard`: Get dashboard configuration

#### Implementation Example:
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Analyze transcription with Gemini
async function analyzeTranscription(transcription, sentimentData) {
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
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Generate visualization data
function generateVisualizationData(transcription, sentimentData, analysisResults) {
  // Process data for D3.js visualizations
  const sentimentOverTime = sentimentData.map((item, index) => ({
    timestamp: item.timestamp,
    sentiment: item.sentiment,
    text: transcription.sentences[index]
  }));
  
  const topicClusters = processTopics(analysisResults.topics);
  const emotionPatterns = processEmotions(sentimentData);
  
  return {
    sentimentOverTime,
    topicClusters,
    emotionPatterns,
    insights: analysisResults.insights
  };
}
```

## Data Flow

1. **Audio Collection**:
   - User uploads audio files or records responses
   - Audio is sent to AssemblyAI for processing

2. **Transcription & Analysis**:
   - AssemblyAI transcribes audio to text
   - Sentiment analysis and content moderation are applied
   - LeMUR generates initial insights and summaries

3. **Data Storage**:
   - Processed data is stored in Airtable via OAuth
   - Structured for easy retrieval and analysis

4. **Visualization**:
   - Data is sent to Dovetail for visualization (or processed by in-house system)
   - Visualizations are embedded in the application dashboard

5. **Insight Generation**:
   - Gemini API processes combined data for deeper insights
   - Results are presented to researchers for review and refinement

## Error Handling and Fallbacks

- Implement retry logic for API failures
- Cache transcription results to prevent duplicate processing
- Provide fallback visualization options if Dovetail is unavailable
- Allow manual override for automated analysis results

## Security Considerations

- Store OAuth tokens securely using encryption
- Implement proper PKCE flow for OAuth security
- Use environment variables for all API keys and secrets
- Apply rate limiting to prevent API abuse
- Ensure data is encrypted in transit and at rest

## Next Steps for Implementation

1. Update service integration modules for each component
2. Implement OAuth flow for Airtable
3. Create data transformation layer for Dovetail compatibility
4. Update frontend to support new visualization options
5. Develop comprehensive testing strategy for the revised stack
