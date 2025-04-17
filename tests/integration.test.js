import request from 'supertest';
import { app } from '../src/app';
import { humeAiService } from '../src/services/hume-ai.service';
import { geminiService } from '../src/services/gemini.service';

// Mock the external services
jest.mock('../src/services/hume-ai.service');
jest.mock('../src/services/gemini.service');

describe('Integration Tests: Voice Emotion Recognition with Language Processing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('End-to-end analysis flow', () => {
    it('should process voice recording and generate correlated insights', async () => {
      // Mock data
      const audioUrl = 'https://example.com/test-recording.mp3';
      const transcription = 'I really love the product quality, but the customer service was disappointing.';
      
      // Mock Hume AI response
      const mockEmotionResults = {
        emotions: [
          { name: 'Joy', intensity: 0.7 },
          { name: 'Surprise', intensity: 0.3 },
          { name: 'Anger', intensity: 0.2 }
        ],
        emotionIntensities: [
          { emotion: 'Joy', intensity: 0.7, frequency: 60, sentiment: 'positive' },
          { emotion: 'Surprise', intensity: 0.3, frequency: 30, sentiment: 'mixed' },
          { emotion: 'Anger', intensity: 0.2, frequency: 10, sentiment: 'negative' }
        ]
      };
      
      // Mock Gemini API response
      const mockLanguageResults = {
        sentiment: {
          positive: 0.6,
          negative: 0.3,
          neutral: 0.1
        },
        themes: [
          { text: 'Product Quality', sentiment: 'positive' },
          { text: 'Customer Service', sentiment: 'negative' }
        ]
      };
      
      // Setup mocks
      humeAiService.analyzeVoiceEmotion.mockResolvedValue(mockEmotionResults);
      geminiService.analyzeText.mockResolvedValue(mockLanguageResults);
      
      // Make request to analyze the response
      const response = await request(app)
        .post('/api/mixed-analysis/analyze')
        .send({ audioUrl, transcription })
        .expect(200);
      
      // Assertions
      expect(response.body.success).toBe(true);
      expect(humeAiService.analyzeVoiceEmotion).toHaveBeenCalledWith(audioUrl);
      expect(geminiService.analyzeText).toHaveBeenCalledWith(transcription);
      
      // Verify the response structure
      const data = response.body.data;
      expect(data).toHaveProperty('emotionResults');
      expect(data).toHaveProperty('languageResults');
      expect(data).toHaveProperty('correlationData');
      expect(data).toHaveProperty('contradictions');
      expect(data).toHaveProperty('themeEmotionConnections');
      expect(data).toHaveProperty('insights');
      expect(data).toHaveProperty('recommendations');
      
      // Verify correlation data
      expect(data.correlationData).toBeInstanceOf(Array);
      expect(data.correlationData.length).toBe(mockEmotionResults.emotions.length);
      
      // Verify insights
      expect(data.insights).toBeInstanceOf(Array);
      expect(data.insights.length).toBeGreaterThan(0);
      
      // Verify recommendations
      expect(data.recommendations).toBeInstanceOf(Array);
      expect(data.recommendations.length).toBeGreaterThan(0);
      
      // Verify theme-emotion connections
      expect(data.themeEmotionConnections).toBeInstanceOf(Array);
      expect(data.themeEmotionConnections.length).toBe(mockLanguageResults.themes.length);
    });
  });
  
  describe('Contradiction detection', () => {
    it('should identify contradictions between voice emotions and language sentiment', async () => {
      // Mock data with contradiction: Joy emotion with negative language
      const audioUrl = 'https://example.com/contradiction-test.mp3';
      const transcription = 'I am very disappointed with this product.';
      
      // Mock Hume AI response with Joy as primary emotion
      const mockEmotionResults = {
        emotions: [
          { name: 'Joy', intensity: 0.8 },
          { name: 'Surprise', intensity: 0.2 }
        ],
        emotionIntensities: [
          { emotion: 'Joy', intensity: 0.8, frequency: 80, sentiment: 'positive' },
          { emotion: 'Surprise', intensity: 0.2, frequency: 20, sentiment: 'mixed' }
        ]
      };
      
      // Mock Gemini API response with negative sentiment
      const mockLanguageResults = {
        sentiment: {
          positive: 0.1,
          negative: 0.8,
          neutral: 0.1
        },
        themes: [
          { text: 'Product Disappointment', sentiment: 'negative' }
        ]
      };
      
      // Setup mocks
      humeAiService.analyzeVoiceEmotion.mockResolvedValue(mockEmotionResults);
      geminiService.analyzeText.mockResolvedValue(mockLanguageResults);
      
      // Make request to analyze the response
      const response = await request(app)
        .post('/api/mixed-analysis/analyze')
        .send({ audioUrl, transcription })
        .expect(200);
      
      // Assertions
      expect(response.body.success).toBe(true);
      
      // Verify contradictions are detected
      const data = response.body.data;
      expect(data.contradictions).toBeInstanceOf(Array);
      expect(data.contradictions.length).toBeGreaterThan(0);
      
      // Verify the contradiction details
      const contradiction = data.contradictions[0];
      expect(contradiction.emotion).toBe('Joy');
      expect(contradiction.expectedSentiment).toBe('positive');
      expect(contradiction.actualSentiment).toBe('negative');
      expect(contradiction).toHaveProperty('significance');
      
      // Verify insights include contradiction
      const contradictionInsight = data.insights.find(insight => insight.type === 'contradiction');
      expect(contradictionInsight).toBeTruthy();
      
      // Verify recommendations include addressing the contradiction
      const contradictionRecommendation = data.recommendations.find(
        rec => rec.type.includes('contradiction')
      );
      expect(contradictionRecommendation).toBeTruthy();
    });
  });
  
  describe('Batch analysis', () => {
    it('should aggregate results from multiple responses', async () => {
      // Mock data for multiple responses
      const responses = [
        {
          audioUrl: 'https://example.com/response1.mp3',
          transcription: 'I love the product quality.'
        },
        {
          audioUrl: 'https://example.com/response2.mp3',
          transcription: 'The customer service was terrible.'
        },
        {
          audioUrl: 'https://example.com/response3.mp3',
          transcription: 'The price is too high for what you get.'
        }
      ];
      
      // Mock individual analysis results
      const mockAnalysisResults = responses.map((response, index) => {
        // Create different mock results for each response
        if (index === 0) {
          // Positive response
          return {
            emotionResults: {
              emotions: [{ name: 'Joy', intensity: 0.9 }],
              emotionIntensities: [{ emotion: 'Joy', intensity: 0.9, frequency: 90, sentiment: 'positive' }]
            },
            languageResults: {
              sentiment: { positive: 0.9, negative: 0.05, neutral: 0.05 },
              themes: [{ text: 'Product Quality', sentiment: 'positive' }]
            },
            correlationData: [{ emotion: 'Joy', positiveLanguage: 90, neutralLanguage: 5, negativeLanguage: 5 }],
            contradictions: [],
            themeEmotionConnections: [{ theme: 'Product Quality', sentiment: 'positive', emotions: [{ name: 'Joy', intensity: 0.9, confidence: 0.9 }] }],
            insights: [{ type: 'primary_emotion', title: 'Primary Emotional Response', significance: 0.9 }],
            recommendations: [{ type: 'leverage_positive', title: 'Leverage Positive Emotions', priority: 'medium' }]
          };
        } else if (index === 1) {
          // Negative response
          return {
            emotionResults: {
              emotions: [{ name: 'Anger', intensity: 0.8 }],
              emotionIntensities: [{ emotion: 'Anger', intensity: 0.8, frequency: 80, sentiment: 'negative' }]
            },
            languageResults: {
              sentiment: { positive: 0.05, negative: 0.9, neutral: 0.05 },
              themes: [{ text: 'Customer Service', sentiment: 'negative' }]
            },
            correlationData: [{ emotion: 'Anger', positiveLanguage: 5, neutralLanguage: 5, negativeLanguage: 90 }],
            contradictions: [],
            themeEmotionConnections: [{ theme: 'Customer Service', sentiment: 'negative', emotions: [{ name: 'Anger', intensity: 0.8, confidence: 0.9 }] }],
            insights: [{ type: 'primary_emotion', title: 'Primary Emotional Response', significance: 0.8 }],
            recommendations: [{ type: 'address_negative', title: 'Address Negative Emotions', priority: 'high' }]
          };
        } else {
          // Mixed response
          return {
            emotionResults: {
              emotions: [{ name: 'Disgust', intensity: 0.7 }, { name: 'Surprise', intensity: 0.3 }],
              emotionIntensities: [
                { emotion: 'Disgust', intensity: 0.7, frequency: 70, sentiment: 'negative' },
                { emotion: 'Surprise', intensity: 0.3, frequency: 30, sentiment: 'mixed' }
              ]
            },
            languageResults: {
              sentiment: { positive: 0.1, negative: 0.7, neutral: 0.2 },
              themes: [{ text: 'Price', sentiment: 'negative' }]
            },
            correlationData: [
              { emotion: 'Disgust', positiveLanguage: 5, neutralLanguage: 15, negativeLanguage: 80 },
              { emotion: 'Surprise', positiveLanguage: 20, neutralLanguage: 30, negativeLanguage: 50 }
            ],
            contradictions: [],
            themeEmotionConnections: [{ theme: 'Price', sentiment: 'negative', emotions: [{ name: 'Disgust', intensity: 0.7, confidence: 0.8 }] }],
            insights: [{ type: 'primary_emotion', title: 'Primary Emotional Response', significance: 0.7 }],
            recommendations: [{ type: 'address_negative', title: 'Address Negative Emotions', priority: 'high' }]
          };
        }
      });
      
      // Setup mock for analyzeResponse to return different results for each call
      let callCount = 0;
      jest.spyOn(request(app), 'post').mockImplementation(() => {
        const result = mockAnalysisResults[callCount];
        callCount++;
        return {
          send: jest.fn().mockResolvedValue({
            status: 200,
            body: { success: true, data: result }
          })
        };
      });
      
      // Make request to analyze batch
      const response = await request(app)
        .post('/api/mixed-analysis/analyze-batch')
        .send({ responses })
        .expect(200);
      
      // Assertions
      expect(response.body.success).toBe(true);
      
      // Verify aggregated results
      const data = response.body.data;
      expect(data).toHaveProperty('emotionData');
      expect(data).toHaveProperty('languageData');
      expect(data).toHaveProperty('keyThemes');
      expect(data).toHaveProperty('emotionLanguageCorrelation');
      expect(data).toHaveProperty('insights');
      expect(data).toHaveProperty('recommendations');
      
      // Verify themes are aggregated
      expect(data.keyThemes).toBeInstanceOf(Array);
      expect(data.keyThemes.length).toBeGreaterThan(0);
      
      // Verify emotions are aggregated
      expect(data.emotionData).toBeInstanceOf(Array);
      expect(data.emotionData.length).toBeGreaterThan(0);
      
      // Verify recommendations are prioritized
      expect(data.recommendations).toBeInstanceOf(Array);
      expect(data.recommendations.length).toBeGreaterThan(0);
      expect(data.recommendations[0]).toHaveProperty('priority', 'high');
    });
  });
});
