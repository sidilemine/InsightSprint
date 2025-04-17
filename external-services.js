/**
 * Mock implementations for external services used in end-to-end testing
 */

// Mock Voiceform service
const mockVoiceformService = {
  createInterview: jest.fn().mockResolvedValue({
    id: 'mock-interview-id',
    title: 'Sample Product Feedback Interview',
    status: 'active',
    questions: [
      { id: 'q1', text: 'How would you describe your experience with our product?' },
      { id: 'q2', text: 'What features do you like the most and why?' },
      { id: 'q3', text: 'What improvements would you suggest for our product?' }
    ],
    createdAt: new Date().toISOString()
  }),
  
  getInterviewResponses: jest.fn().mockResolvedValue([
    {
      id: 'resp-1',
      interviewId: 'mock-interview-id',
      respondentId: 'user-1',
      answers: [
        { 
          questionId: 'q1', 
          audioUrl: '/tests/e2e/fixtures/positive_response.mp3',
          transcription: 'I absolutely love using your product. It has made my daily routine so much easier and more enjoyable.'
        },
        { 
          questionId: 'q2', 
          audioUrl: '/tests/e2e/fixtures/neutral_response.mp3',
          transcription: 'The interface is clean and intuitive. I particularly like the dashboard that shows all my activity in one place.'
        },
        { 
          questionId: 'q3', 
          audioUrl: '/tests/e2e/fixtures/negative_response.mp3',
          transcription: 'The mobile app is frustratingly slow and crashes frequently. I wish it was as reliable as the desktop version.'
        }
      ],
      completedAt: new Date().toISOString()
    },
    {
      id: 'resp-2',
      interviewId: 'mock-interview-id',
      respondentId: 'user-2',
      answers: [
        { 
          questionId: 'q1', 
          audioUrl: '/tests/e2e/fixtures/mixed_response.mp3',
          transcription: 'The product is good overall, but there are some aspects that could be improved.'
        },
        { 
          questionId: 'q2', 
          audioUrl: '/tests/e2e/fixtures/positive_response.mp3',
          transcription: 'I really appreciate the customer support team. They are always helpful and respond quickly to my questions.'
        },
        { 
          questionId: 'q3', 
          audioUrl: '/tests/e2e/fixtures/negative_response.mp3',
          transcription: 'The pricing is too high compared to similar products on the market. I would consider switching if a more affordable option became available.'
        }
      ],
      completedAt: new Date().toISOString()
    }
  ])
};

// Mock Hume AI service
const mockHumeAIService = {
  analyzeVoiceEmotion: jest.fn().mockImplementation((audioUrl) => {
    // Return different emotion results based on the audio file name
    if (audioUrl.includes('positive')) {
      return Promise.resolve({
        emotions: [
          { name: 'Joy', intensity: 0.85, confidence: 0.92 },
          { name: 'Interest', intensity: 0.65, confidence: 0.88 }
        ],
        emotionIntensities: [
          { emotion: 'Joy', intensity: 0.85, frequency: 85, sentiment: 'positive' },
          { emotion: 'Interest', intensity: 0.65, frequency: 65, sentiment: 'positive' }
        ],
        overallSentiment: 'positive',
        confidenceScore: 0.9
      });
    } else if (audioUrl.includes('negative')) {
      return Promise.resolve({
        emotions: [
          { name: 'Frustration', intensity: 0.78, confidence: 0.91 },
          { name: 'Disappointment', intensity: 0.72, confidence: 0.89 }
        ],
        emotionIntensities: [
          { emotion: 'Frustration', intensity: 0.78, frequency: 78, sentiment: 'negative' },
          { emotion: 'Disappointment', intensity: 0.72, frequency: 72, sentiment: 'negative' }
        ],
        overallSentiment: 'negative',
        confidenceScore: 0.88
      });
    } else if (audioUrl.includes('neutral')) {
      return Promise.resolve({
        emotions: [
          { name: 'Calmness', intensity: 0.62, confidence: 0.85 },
          { name: 'Interest', intensity: 0.45, confidence: 0.82 }
        ],
        emotionIntensities: [
          { emotion: 'Calmness', intensity: 0.62, frequency: 62, sentiment: 'neutral' },
          { emotion: 'Interest', intensity: 0.45, frequency: 45, sentiment: 'positive' }
        ],
        overallSentiment: 'neutral',
        confidenceScore: 0.84
      });
    } else {
      // Mixed response
      return Promise.resolve({
        emotions: [
          { name: 'Satisfaction', intensity: 0.55, confidence: 0.83 },
          { name: 'Concern', intensity: 0.48, confidence: 0.81 }
        ],
        emotionIntensities: [
          { emotion: 'Satisfaction', intensity: 0.55, frequency: 55, sentiment: 'positive' },
          { emotion: 'Concern', intensity: 0.48, frequency: 48, sentiment: 'negative' }
        ],
        overallSentiment: 'mixed',
        confidenceScore: 0.82
      });
    }
  })
};

// Mock Gemini API service
const mockGeminiService = {
  analyzeText: jest.fn().mockImplementation((text) => {
    // Return different language analysis results based on text content
    if (text.includes('love') || text.includes('appreciate') || text.includes('like')) {
      return Promise.resolve({
        sentiment: { positive: 0.85, negative: 0.05, neutral: 0.1 },
        themes: [
          { text: 'Product Satisfaction', sentiment: 'positive', confidence: 0.9 },
          { text: 'Ease of Use', sentiment: 'positive', confidence: 0.85 }
        ],
        keyPhrases: ['love using your product', 'made my daily routine easier', 'clean and intuitive'],
        entities: [
          { name: 'product', type: 'PRODUCT', sentiment: 'positive' },
          { name: 'interface', type: 'FEATURE', sentiment: 'positive' },
          { name: 'dashboard', type: 'FEATURE', sentiment: 'positive' }
        ]
      });
    } else if (text.includes('slow') || text.includes('crashes') || text.includes('too high') || text.includes('frustrat')) {
      return Promise.resolve({
        sentiment: { positive: 0.1, negative: 0.8, neutral: 0.1 },
        themes: [
          { text: 'Performance Issues', sentiment: 'negative', confidence: 0.88 },
          { text: 'Pricing Concerns', sentiment: 'negative', confidence: 0.85 }
        ],
        keyPhrases: ['frustratingly slow', 'crashes frequently', 'pricing is too high'],
        entities: [
          { name: 'mobile app', type: 'PRODUCT', sentiment: 'negative' },
          { name: 'pricing', type: 'FEATURE', sentiment: 'negative' }
        ]
      });
    } else {
      // Neutral or mixed content
      return Promise.resolve({
        sentiment: { positive: 0.4, negative: 0.3, neutral: 0.3 },
        themes: [
          { text: 'Product Features', sentiment: 'neutral', confidence: 0.75 },
          { text: 'User Experience', sentiment: 'mixed', confidence: 0.7 }
        ],
        keyPhrases: ['good overall', 'could be improved', 'some aspects'],
        entities: [
          { name: 'product', type: 'PRODUCT', sentiment: 'mixed' },
          { name: 'aspects', type: 'FEATURE', sentiment: 'negative' }
        ]
      });
    }
  }),
  
  generateInsights: jest.fn().mockResolvedValue({
    insights: [
      { type: 'primary_emotion', title: 'Primary Emotional Response', content: 'Users express predominantly positive emotions when discussing the core product functionality.', significance: 0.85 },
      { type: 'pain_point', title: 'Key Pain Point', content: 'Mobile app performance issues are causing significant frustration among users.', significance: 0.78 },
      { type: 'contradiction', title: 'Emotional Contradiction', content: 'Users express positive sentiment about the product features while simultaneously feeling negative about pricing.', significance: 0.65 }
    ],
    recommendations: [
      { type: 'leverage_positive', title: 'Leverage Positive Emotions', content: 'Emphasize the intuitive interface and comprehensive dashboard in marketing materials.', priority: 'medium' },
      { type: 'address_negative', title: 'Address Negative Emotions', content: 'Prioritize mobile app performance improvements to address user frustration.', priority: 'high' },
      { type: 'explore_opportunity', title: 'Explore Opportunity', content: 'Consider introducing a lower-priced tier to address pricing concerns while maintaining premium features.', priority: 'medium' }
    ]
  })
};

// Mock Airtable service
const mockAirtableService = {
  storeProject: jest.fn().mockResolvedValue({
    id: 'mock-airtable-project-id',
    name: 'Sample Product Feedback Project',
    createdAt: new Date().toISOString()
  }),
  
  storeInterviews: jest.fn().mockResolvedValue([
    { id: 'mock-airtable-interview-id-1', status: 'completed' }
  ]),
  
  storeResponses: jest.fn().mockResolvedValue([
    { id: 'mock-airtable-response-id-1', status: 'processed' },
    { id: 'mock-airtable-response-id-2', status: 'processed' }
  ]),
  
  storeAnalysis: jest.fn().mockResolvedValue({
    id: 'mock-airtable-analysis-id',
    status: 'completed',
    createdAt: new Date().toISOString()
  })
};

// Mock Insight7 service
const mockInsight7Service = {
  generateVisualizations: jest.fn().mockResolvedValue({
    visualizations: [
      {
        type: 'emotion_distribution',
        title: 'Emotion Distribution',
        imageUrl: '/tests/e2e/fixtures/emotion_distribution.png',
        description: 'Distribution of emotions detected across all responses'
      },
      {
        type: 'sentiment_by_theme',
        title: 'Sentiment by Theme',
        imageUrl: '/tests/e2e/fixtures/sentiment_by_theme.png',
        description: 'Sentiment analysis broken down by identified themes'
      },
      {
        type: 'emotion_language_correlation',
        title: 'Emotion-Language Correlation',
        imageUrl: '/tests/e2e/fixtures/emotion_language_correlation.png',
        description: 'Correlation between detected emotions and language sentiment'
      }
    ]
  })
};

module.exports = {
  mockVoiceformService,
  mockHumeAIService,
  mockGeminiService,
  mockAirtableService,
  mockInsight7Service
};
