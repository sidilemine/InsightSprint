/**
 * Mock services for testing
 * Provides mock implementations of external services
 */

// Mock AssemblyAI service
jest.mock('../src/services/assemblyai.service', () => {
  return {
    transcribeAudio: jest.fn().mockImplementation((audioUrl, options) => {
      return Promise.resolve({
        id: 'mock-transcription-id',
        status: 'queued'
      });
    }),
    
    uploadAudio: jest.fn().mockImplementation((audioData) => {
      return Promise.resolve('https://example.com/mock-upload-url');
    }),
    
    getTranscription: jest.fn().mockImplementation((transcriptId) => {
      return Promise.resolve({
        id: transcriptId,
        status: 'completed',
        text: 'This is a mock transcription for testing purposes.',
        sentiment_analysis_results: [
          {
            text: 'This is a mock transcription',
            start: 0,
            end: 2.5,
            sentiment: 'neutral',
            confidence: 0.85
          },
          {
            text: 'for testing purposes.',
            start: 2.6,
            end: 4.2,
            sentiment: 'positive',
            confidence: 0.78
          }
        ]
      });
    }),
    
    waitForTranscription: jest.fn().mockImplementation((transcriptId) => {
      return Promise.resolve({
        id: transcriptId,
        status: 'completed',
        text: 'This is a mock transcription for testing purposes.',
        sentiment_analysis_results: [
          {
            text: 'This is a mock transcription',
            start: 0,
            end: 2.5,
            sentiment: 'neutral',
            confidence: 0.85
          },
          {
            text: 'for testing purposes.',
            start: 2.6,
            end: 4.2,
            sentiment: 'positive',
            confidence: 0.78
          }
        ]
      });
    }),
    
    generateInsights: jest.fn().mockImplementation((transcriptId, prompt, options) => {
      return Promise.resolve({
        id: `insight-${transcriptId}`,
        response: 'This is a mock insight generated for testing purposes.'
      });
    }),
    
    processAudioComplete: jest.fn().mockImplementation((audioUrl, insightPrompt, options) => {
      return Promise.resolve({
        transcription: {
          id: 'mock-transcription-id',
          status: 'completed',
          text: 'This is a mock transcription for testing purposes.',
          sentiment_analysis_results: [
            {
              text: 'This is a mock transcription',
              start: 0,
              end: 2.5,
              sentiment: 'neutral',
              confidence: 0.85
            },
            {
              text: 'for testing purposes.',
              start: 2.6,
              end: 4.2,
              sentiment: 'positive',
              confidence: 0.78
            }
          ]
        },
        insights: {
          id: 'mock-insight-id',
          response: 'This is a mock insight generated for testing purposes.'
        }
      });
    })
  };
});

// Mock Airtable OAuth service
jest.mock('../src/services/airtable-oauth.service', () => {
  return {
    generateState: jest.fn().mockReturnValue('mock-state-123'),
    
    generateCodeVerifier: jest.fn().mockReturnValue('mock-code-verifier-123'),
    
    generateCodeChallenge: jest.fn().mockImplementation((codeVerifier) => {
      return 'mock-code-challenge-123';
    }),
    
    getAuthorizationUrl: jest.fn().mockImplementation((state, codeChallenge) => {
      return `https://airtable.com/oauth2/v1/authorize?client_id=mock-client-id&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fairtable-oauth%2Fcallback&response_type=code&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    }),
    
    getTokenFromCode: jest.fn().mockImplementation((code, codeVerifier) => {
      return Promise.resolve({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 7200,
        created_at: Math.floor(Date.now() / 1000),
        scope: 'data.records:read data.records:write'
      });
    }),
    
    refreshToken: jest.fn().mockImplementation((refreshToken) => {
      return Promise.resolve({
        access_token: 'mock-new-access-token',
        refresh_token: 'mock-new-refresh-token',
        expires_in: 7200,
        created_at: Math.floor(Date.now() / 1000),
        scope: 'data.records:read data.records:write'
      });
    }),
    
    isTokenExpired: jest.fn().mockImplementation((token) => {
      return false;
    }),
    
    storeOAuthState: jest.fn().mockImplementation((userId, state, codeVerifier) => {
      return Promise.resolve();
    }),
    
    verifyAndGetCodeVerifier: jest.fn().mockImplementation((userId, state) => {
      return Promise.resolve('mock-code-verifier-123');
    }),
    
    storeTokens: jest.fn().mockImplementation((userId, tokens) => {
      return Promise.resolve();
    }),
    
    getTokens: jest.fn().mockImplementation((userId) => {
      return Promise.resolve({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 7200,
        created_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        scope: 'data.records:read data.records:write'
      });
    }),
    
    getValidAccessToken: jest.fn().mockImplementation((userId) => {
      return Promise.resolve('mock-access-token');
    })
  };
});

// Mock Visualization service
jest.mock('../src/services/visualization.service', () => {
  return {
    analyzeTranscription: jest.fn().mockImplementation((transcription, sentimentData, options) => {
      return Promise.resolve({
        id: `analysis-${Date.now()}`,
        raw_text: 'Mock analysis of the transcription.',
        structured_data: {
          themes: [
            {
              name: 'Product Experience',
              sentiment: 'positive',
              description: 'User had a positive experience with the product.',
              confidence: 0.85
            },
            {
              name: 'Pricing Concerns',
              sentiment: 'negative',
              description: 'User expressed concerns about pricing.',
              confidence: 0.75
            }
          ],
          emotional_patterns: [
            {
              segment: 'beginning',
              emotion: 'positive',
              description: 'Started with positive sentiment.',
              intensity: 0.8
            },
            {
              segment: 'end',
              emotion: 'negative',
              description: 'Ended with negative sentiment.',
              intensity: 0.7
            }
          ],
          insights: [
            'Users appreciate the product experience but are price-sensitive.',
            'The interface is well-received and considered intuitive.'
          ],
          recommendations: [
            'Consider reviewing pricing strategy.',
            'Highlight the intuitive interface in marketing materials.'
          ]
        },
        created_at: new Date().toISOString()
      });
    }),
    
    generateVisualizationData: jest.fn().mockImplementation((transcription, sentimentData, analysis) => {
      return Promise.resolve({
        id: `visualization-${Date.now()}`,
        sentiment_over_time: sentimentData.map((item, index) => ({
          timestamp: item.start || index,
          sentiment: item.sentiment === 'positive' ? 0.7 : 
                    item.sentiment === 'negative' ? -0.7 : 0.1,
          text: item.text || '',
          confidence: item.confidence || 0.5
        })),
        topic_clusters: analysis.structured_data.themes.map(theme => ({
          name: theme.name,
          size: theme.confidence * 30,
          sentiment: theme.sentiment === 'positive' ? 0.7 : 
                    theme.sentiment === 'negative' ? -0.7 : 0.1,
          confidence: theme.confidence
        })),
        emotion_distribution: {
          positive: 60,
          negative: 30,
          neutral: 10,
          mixed: 0
        },
        word_frequency: [
          { word: 'product', count: 3 },
          { word: 'interface', count: 2 },
          { word: 'pricing', count: 2 },
          { word: 'enjoyed', count: 1 }
        ],
        created_at: new Date().toISOString()
      });
    }),
    
    getAnalysis: jest.fn().mockImplementation((analysisId) => {
      return Promise.resolve({
        id: analysisId,
        raw_text: 'Mock analysis of the transcription.',
        structured_data: {
          themes: [
            {
              name: 'Product Experience',
              sentiment: 'positive',
              description: 'User had a positive experience with the product.',
              confidence: 0.85
            },
            {
              name: 'Pricing Concerns',
              sentiment: 'negative',
              description: 'User expressed concerns about pricing.',
              confidence: 0.75
            }
          ],
          emotional_patterns: [
            {
              segment: 'beginning',
              emotion: 'positive',
              description: 'Started with positive sentiment.',
              intensity: 0.8
            },
            {
              segment: 'end',
              emotion: 'negative',
              description: 'Ended with negative sentiment.',
              intensity: 0.7
            }
          ],
          insights: [
            'Users appreciate the product experience but are price-sensitive.',
            'The interface is well-received and considered intuitive.'
          ],
          recommendations: [
            'Consider reviewing pricing strategy.',
            'Highlight the intuitive interface in marketing materials.'
          ]
        },
        created_at: new Date().toISOString()
      });
    }),
    
    getVisualizationData: jest.fn().mockImplementation((visualizationId) => {
      return Promise.resolve({
        id: visualizationId,
        sentiment_over_time: [
          { timestamp: 0, sentiment: 0.7, text: 'I really enjoyed using the product.', confidence: 0.92 },
          { timestamp: 2.4, sentiment: 0.7, text: 'The interface was intuitive,', confidence: 0.88 },
          { timestamp: 3.9, sentiment: -0.7, text: 'but I found the pricing to be a bit high compared to competitors.', confidence: 0.78 }
        ],
        topic_clusters: [
          { name: 'Product Experience', size: 25, sentiment: 0.7, confidence: 0.85 },
          { name: 'Pricing Concerns', size: 22, sentiment: -0.7, confidence: 0.75 }
        ],
        emotion_distribution: {
          positive: 60,
          negative: 30,
          neutral: 10,
          mixed: 0
        },
        word_frequency: [
          { word: 'product', count: 3 },
          { word: 'interface', count: 2 },
          { word: 'pricing', count: 2 },
          { word: 'enjoyed', count: 1 }
        ],
        created_at: new Date().toISOString()
      });
    }),
    
    processComplete: jest.fn().mockImplementation((transcription, sentimentData, options) => {
      const analysis = {
        id: `analysis-${Date.now()}`,
        raw_text: 'Mock analysis of the transcription.',
        structured_data: {
          themes: [
            {
              name: 'Product Experience',
              sentiment: 'positive',
              description: 'User had a positive experience with the product.',
              confidence: 0.85
            },
            {
              name: 'Pricing Concerns',
              sentiment: 'negative',
              description: 'User expressed concerns about pricing.',
              confidence: 0.75
            }
          ],
          emotional_patterns: [
            {
              segment: 'beginning',
              emotion: 'positive',
              description: 'Started with positive sentiment.',
              intensity: 0.8
            },
            {
              segment: 'end',
              emotion: 'negative',
              description: 'Ended with negative sentiment.',
              intensity: 0.7
            }
          ],
          insights: [
            'Users appreciate the product experience but are price-sensitive.',
            'The interface is well-received and considered intuitive.'
          ],
          recommendations: [
            'Consider reviewing pricing strategy.',
            'Highlight the intuitive interface in marketing materials.'
          ]
        },
        created_at: new Date().toISOString()
      };
      
      const visualization = {
        id: `visualization-${Date.now()}`,
        sentiment_over_time: sentimentData.map((item, index) => ({
          timestamp: item.start || index,
          sentiment: item.sentiment === 'positive' ? 0.7 : 
                    item.sentiment === 'negative' ? -0.7 : 0.1,
          text: item.text || '',
          confidence: item.confidence || 0.5
        })),
        topic_clusters: analysis.structured_data.themes.map(theme => ({
          name: theme.name,
          size: theme.confidence * 30,
          sentiment: theme.sentiment === 'positive' ? 0.7 : 
                    theme.sentiment === 'negative' ? -0.7 : 0.1,
          confidence: theme.confidence
        })),
        emotion_distribution: {
          positive: 60,
          negative: 30,
          neutral: 10,
          mixed: 0
        },
        word_frequency: [
          { word: 'product', count: 3 },
          { word: 'interface', count: 2 },
          { word: 'pricing', count: 2 },
          { word: 'enjoyed', count: 1 }
        ],
        created_at: new Date().toISOString()
      };
      
      return Promise.resolve({
        analysis,
        visualization
      });
    })
  };
});

// Mock database
jest.mock('../src/utils/db', () => {
  const mockCollections = {
    users: {
      findOne: jest.fn().mockImplementation((query) => {
        if (query.email === 'test@example.com') {
          return Promise.resolve({
            _id: 'mock-user-id',
            name: 'Test User',
            email: 'test@example.com',
            role: 'admin'
          });
        }
        return Promise.resolve(null);
      }),
      insertOne: jest.fn().mockImplementation((doc) => {
        return Promise.resolve({ insertedId: 'mock-user-id' });
      })
    },
    oauth_states: {
      findOne: jest.fn().mockImplementation((query) => {
        return Promise.resolve({
          userId: query.userId,
          state: 'mock-state-123',
          codeVerifier: 'U2FsdGVkX1+A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0=', // Encrypted mock code verifier
          createdAt: new Date()
        });
      }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
    },
    oauth_tokens: {
      findOne: jest.fn().mockImplementation((query) => {
        return Promise.resolve({
          userId: query.userId,
          accessToken: 'mock-access-token',
          refreshToken: 'U2FsdGVkX1+A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0=', // Encrypted mock refresh token
          expiresIn: 7200,
          createdAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          scope: 'data.records:read data.records:write',
          updatedAt: new Date()
        });
      }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
    },
    analyses: {
      findOne: jest.fn().mockImplementation((query) => {
        return Promise.resolve({
          id: query.id,
          raw_text: 'Mock analysis of the transcription.',
          structured_data: {
            themes: [
              {
                name: 'Product Experience',
                sentiment: 'positive',
                description: 'User had a positive experience with the product.',
                confidence: 0.85
              },
              {
                name: 'Pricing Concerns',
                sentiment: 'negative',
                description: 'User expres
(Content truncated due to size limit. Use line ranges to read in chunks)