# Updated Test Mocks for New Services

This document provides updated test mocks for the new services in the revised technology stack for the Rapid Consumer Sentiment Analysis service.

## 1. AssemblyAI Test Mocks

### Mock Transcription Response

```javascript
// tests/mocks/assemblyai/transcription.mock.js

const mockTranscriptionResponse = {
  id: "mock-transcript-123456",
  status: "completed",
  text: "I really enjoyed using the product. The interface was intuitive, but I found the pricing to be a bit high compared to competitors.",
  words: [
    {
      text: "I",
      start: 0.0,
      end: 0.12,
      confidence: 0.98
    },
    // Additional words...
  ],
  utterances: [
    {
      start: 0,
      end: 4.5,
      confidence: 0.95,
      speaker: "A"
    }
  ],
  sentiment_analysis_results: [
    {
      text: "I really enjoyed using the product.",
      start: 0,
      end: 2.3,
      sentiment: "positive",
      confidence: 0.92
    },
    {
      text: "The interface was intuitive,",
      start: 2.4,
      end: 3.8,
      sentiment: "positive",
      confidence: 0.88
    },
    {
      text: "but I found the pricing to be a bit high compared to competitors.",
      start: 3.9,
      end: 6.2,
      sentiment: "negative",
      confidence: 0.78
    }
  ],
  content_safety_labels: {
    status: "success",
    results: [
      {
        label: "sensitive_topics",
        confidence: 0.01,
        severity: 0
      }
    ]
  }
};

module.exports = { mockTranscriptionResponse };
```

### Mock LeMUR Response

```javascript
// tests/mocks/assemblyai/lemur.mock.js

const mockLemurResponse = {
  id: "mock-lemur-123456",
  status: "completed",
  request: {
    prompt: "Summarize the key points and sentiment from this interview",
    transcript_ids: ["mock-transcript-123456"]
  },
  response: {
    answer: "The respondent had a positive experience with the product overall, particularly appreciating the intuitive interface. However, they expressed concern about the pricing, finding it expensive compared to competitor offerings. This suggests that while the product's usability is a strength, its value proposition may be undermined by its price point.",
    citations: [
      {
        start: 0,
        end: 45,
        transcript_id: "mock-transcript-123456"
      }
    ]
  }
};

module.exports = { mockLemurResponse };
```

### AssemblyAI Service Mock

```javascript
// tests/mocks/services/assemblyai.service.mock.js

const { mockTranscriptionResponse } = require('../assemblyai/transcription.mock');
const { mockLemurResponse } = require('../assemblyai/lemur.mock');

class AssemblyAIServiceMock {
  constructor() {
    this.transcriptions = new Map();
    this.lemurResponses = new Map();
    
    // Pre-populate with mock data
    this.transcriptions.set("mock-transcript-123456", mockTranscriptionResponse);
    this.lemurResponses.set("mock-lemur-123456", mockLemurResponse);
  }
  
  async transcribeAudio(audioUrl, options = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock response
    return {
      id: "mock-transcript-" + Date.now(),
      status: "queued"
    };
  }
  
  async getTranscription(transcriptId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return stored mock or default
    return this.transcriptions.get(transcriptId) || {
      ...mockTranscriptionResponse,
      id: transcriptId
    };
  }
  
  async analyzeSentiment(transcriptId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const transcript = this.transcriptions.get(transcriptId) || mockTranscriptionResponse;
    return transcript.sentiment_analysis_results;
  }
  
  async generateInsights(transcriptId, prompt) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      ...mockLemurResponse,
      id: "mock-lemur-" + Date.now(),
      request: {
        ...mockLemurResponse.request,
        prompt,
        transcript_ids: [transcriptId]
      }
    };
  }
}

module.exports = { AssemblyAIServiceMock };
```

## 2. Airtable OAuth Test Mocks

### Mock OAuth Tokens

```javascript
// tests/mocks/airtable/oauth.mock.js

const mockOAuthTokens = {
  access_token: "mock_access_token_12345",
  refresh_token: "mock_refresh_token_67890",
  token_type: "Bearer",
  expires_in: 3600,
  scope: "data.records:read data.records:write",
  created_at: Date.now()
};

const mockRefreshedTokens = {
  access_token: "mock_refreshed_access_token_12345",
  refresh_token: "mock_refreshed_refresh_token_67890",
  token_type: "Bearer",
  expires_in: 3600,
  scope: "data.records:read data.records:write",
  created_at: Date.now()
};

module.exports = { mockOAuthTokens, mockRefreshedTokens };
```

### Airtable OAuth Service Mock

```javascript
// tests/mocks/services/airtable-oauth.service.mock.js

const { mockOAuthTokens, mockRefreshedTokens } = require('../airtable/oauth.mock');

class AirtableOAuthServiceMock {
  constructor() {
    this.tokens = new Map();
    this.authorizationCodes = new Map();
    
    // Pre-populate with mock data
    this.tokens.set("user123", mockOAuthTokens);
  }
  
  getAuthorizationUrl(state, codeChallenge) {
    // Store the state and code challenge for later verification
    this.authorizationCodes.set(state, {
      codeChallenge,
      code: "mock_auth_code_" + Date.now()
    });
    
    return `https://airtable.com/oauth2/v1/authorize?client_id=mock_client_id&redirect_uri=http://localhost:3000/callback&response_type=code&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  }
  
  async getTokenFromCode(code, codeVerifier, state) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Verify the code and state
    const storedAuth = Array.from(this.authorizationCodes.entries())
      .find(([storedState, auth]) => auth.code === code);
    
    if (!storedAuth) {
      throw new Error("Invalid authorization code");
    }
    
    // Return mock tokens
    return { ...mockOAuthTokens };
  }
  
  async refreshToken(refreshToken, userId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Verify the refresh token
    const userTokens = this.tokens.get(userId);
    if (!userTokens || userTokens.refresh_token !== refreshToken) {
      throw new Error("Invalid refresh token");
    }
    
    // Return refreshed tokens
    const refreshedTokens = { ...mockRefreshedTokens };
    this.tokens.set(userId, refreshedTokens);
    return refreshedTokens;
  }
  
  isTokenExpired(tokens) {
    if (!tokens || !tokens.created_at || !tokens.expires_in) {
      return true;
    }
    
    const expiryTime = tokens.created_at + (tokens.expires_in * 1000);
    return Date.now() >= expiryTime;
  }
}

module.exports = { AirtableOAuthServiceMock };
```

## 3. Dovetail Test Mocks

### Mock Dovetail Responses

```javascript
// tests/mocks/dovetail/responses.mock.js

const mockProject = {
  id: "mock-project-123",
  name: "Consumer Sentiment Analysis",
  description: "Analysis of customer feedback for Product X",
  created_at: "2025-04-17T08:00:00Z",
  updated_at: "2025-04-17T08:00:00Z"
};

const mockInterview = {
  id: "mock-interview-456",
  project_id: "mock-project-123",
  title: "Interview with Customer A",
  participant: {
    name: "John Doe",
    email: "john.doe@example.com"
  },
  notes: "Transcription of the interview...",
  tags: ["positive", "pricing", "usability"],
  created_at: "2025-04-17T09:00:00Z",
  updated_at: "2025-04-17T09:00:00Z"
};

const mockVisualization = {
  id: "mock-visualization-789",
  project_id: "mock-project-123",
  name: "Sentiment Analysis Dashboard",
  type: "sentiment_analysis",
  config: {
    chart_type: "line",
    data_source: "interviews",
    filters: {
      tags: ["positive", "negative", "neutral"]
    }
  },
  created_at: "2025-04-17T10:00:00Z",
  updated_at: "2025-04-17T10:00:00Z",
  embed_url: "https://app.dovetailapp.com/embed/visualization/mock-visualization-789"
};

module.exports = {
  mockProject,
  mockInterview,
  mockVisualization
};
```

### Dovetail Service Mock

```javascript
// tests/mocks/services/dovetail.service.mock.js

const {
  mockProject,
  mockInterview,
  mockVisualization
} = require('../dovetail/responses.mock');

class DovetailServiceMock {
  constructor() {
    this.projects = new Map();
    this.interviews = new Map();
    this.visualizations = new Map();
    
    // Pre-populate with mock data
    this.projects.set(mockProject.id, mockProject);
    this.interviews.set(mockInterview.id, mockInterview);
    this.visualizations.set(mockVisualization.id, mockVisualization);
  }
  
  async getProjects() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return Array.from(this.projects.values());
  }
  
  async getProject(projectId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return this.projects.get(projectId) || null;
  }
  
  async createInterview(projectId, data) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const newInterview = {
      id: "mock-interview-" + Date.now(),
      project_id: projectId,
      title: data.title,
      participant: data.participant,
      notes: data.transcription,
      tags: data.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.interviews.set(newInterview.id, newInterview);
    return newInterview;
  }
  
  async getVisualization(visualizationId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return this.visualizations.get(visualizationId) || null;
  }
  
  async getVisualizationEmbed(projectId, visualizationId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const visualization = this.visualizations.get(visualizationId);
    if (!visualization || visualization.project_id !== projectId) {
      throw new Error("Visualization not found");
    }
    
    return {
      embed_url: visualization.embed_url
    };
  }
  
  async createVisualization(projectId, data) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newVisualization = {
      id: "mock-visualization-" + Date.now(),
      project_id: projectId,
      name: data.name,
      type: data.type,
      config: data.config || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      embed_url: `https://app.dovetailapp.com/embed/visualization/mock-visualization-${Date.now()}`
    };
    
    this.visualizations.set(newVisualization.id, newVisualization);
    return newVisualization;
  }
}

module.exports = { DovetailServiceMock };
```

## 4. In-House Analysis Test Mocks (Alternative to Dovetail)

### Mock Gemini API Responses

```javascript
// tests/mocks/gemini/responses.mock.js

const mockGeminiAnalysisResponse = {
  text: `
# Analysis Results

## Key Themes and Topics
1. Product Usability: The respondent highlighted the intuitive interface as a positive aspect.
2. Pricing Concerns: There was dissatisfaction with the pricing compared to competitors.
3. Value Proposition: The overall sentiment suggests a disconnect between perceived value and cost.

## Emotional Patterns
- Initial positive sentiment about the product experience
- Shift to negative sentiment when discussing pricing
- Mixed overall sentiment with positive usability offset by pricing concerns

## Actionable Insights
1. The product's interface design is successful and should be maintained
2. Pricing strategy may need reconsideration to align with perceived value
3. Competitor pricing analysis should be conducted to understand market positioning

## Recommendations
1. Consider a tiered pricing model to address price sensitivity
2. Highlight unique features that justify the premium pricing
3. Conduct further research on specific interface elements that users find intuitive
4. Develop marketing messaging that emphasizes value over cost
  `
};

module.exports = { mockGeminiAnalysisResponse };
```

### In-House Analysis Service Mock

```javascript
// tests/mocks/services/in-house-analysis.service.mock.js

const { mockGeminiAnalysisResponse } = require('../gemini/responses.mock');

class InHouseAnalysisServiceMock {
  constructor() {
    this.analyses = new Map();
    this.visualizations = new Map();
  }
  
  async analyzeTranscription(transcription, sentimentData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const analysisId = "analysis-" + Date.now();
    const analysis = {
      id: analysisId,
      raw_text: mockGeminiAnalysisResponse.text,
      structured_data: {
        themes: [
          { name: "Product Usability", sentiment: "positive", confidence: 0.92 },
          { name: "Pricing Concerns", sentiment: "negative", confidence: 0.85 },
          { name: "Value Proposition", sentiment: "mixed", confidence: 0.78 }
        ],
        emotional_patterns: [
          { segment: "product experience", emotion: "positive", intensity: 0.8 },
          { segment: "pricing", emotion: "negative", intensity: 0.7 },
          { segment: "overall", emotion: "mixed", intensity: 0.6 }
        ],
        insights: [
          "Interface design is successful",
          "Pricing strategy needs reconsideration",
          "Competitor pricing analysis recommended"
        ],
        recommendations: [
          "Consider tiered pricing model",
          "Highlight unique features",
          "Research intuitive interface elements",
          "Develop value-focused marketing"
        ]
      },
      created_at: new Date().toISOString()
    };
    
    this.analyses.set(analysisId, analysis);
    return analysis;
  }
  
  async generateVisualizationData(transcription, sentimentData, analysisResults) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const visualizationId = "visualization-" + Date.now();
    const visualization = {
      id: visualizationId,
      sentiment_over_time: sentimentData.map((item, index) => ({
        timestamp: index * 2,
        sentiment: item.sentiment === "positive" ? 0.8 : 
                  item.sentiment === "negative" ? -0.6 : 0.1,
        text: transcription.substring(index * 50, (index + 1) * 50).trim()
      })),
      topic_clusters: [
        { name: "Product Usability", size: 35, sentiment: 0.8 },
        { name: "Pricing", size: 25, sentiment: -0.6 },
        { name: "Competitors", size: 15, sentiment: 0.1 },
        { name: "Interface", size: 20, sentiment: 0.9 },
        { name: "Value", size: 18, sentiment: -0.2 }
      ],
      emotion_patterns: {
        positive: 45,
        negative: 30,
        neutral: 25
      },
      created_at: new Date().toISOString()
    };
    
    this.visualizations.set(visualizationId, visualization);
    return visualization;
  }
  
  async getAnalysis(analysisId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return this.analyses.get(analysisId) || null;
  }
  
  async getVisualization(visualizationId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return this.visualizations.get(visualizationId) || null;
  }
}

module.exports = { InHouseAnalysisServiceMock };
```

## 5. Integration Test Example

```javascript
// tests/integration/sentiment-analysis-flow.test.js

const { AssemblyAIServiceMock } = require('../mocks/services/assemblyai.service.mock');
const { AirtableOAuthServiceMock } = require('../mocks/services/airtable-oauth.service.mock');
const { DovetailServiceMock } = require('../mocks/services/dovetail.service.mock');
const { InHo
(Content truncated due to size limit. Use line ranges to read in chunks)