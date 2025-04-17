import request from 'supertest';
import { app } from '../src/app';
import { mixedAnalysisService } from '../src/services/mixed-analysis.service';

// Mock the mixedAnalysisService
jest.mock('../src/services/mixed-analysis.service');

describe('Mixed Analysis API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/mixed-analysis/analyze', () => {
    it('should analyze a single response', async () => {
      // Mock data
      const mockRequest = {
        audioUrl: 'https://example.com/audio.mp3',
        transcription: 'This is a test transcription'
      };
      
      const mockResponse = {
        emotionResults: { emotions: [{ name: 'Joy', intensity: 0.8 }] },
        languageResults: { sentiment: { positive: 0.7, negative: 0.1, neutral: 0.2 } },
        correlationData: [{ emotion: 'Joy', positiveLanguage: 80, neutralLanguage: 15, negativeLanguage: 5 }],
        insights: [{ type: 'primary_emotion', title: 'Primary Emotional Response' }],
        recommendations: [{ type: 'leverage_positive', title: 'Leverage Positive Emotions' }]
      };
      
      // Setup mock
      mixedAnalysisService.analyzeResponse.mockResolvedValue(mockResponse);
      
      // Make request
      const response = await request(app)
        .post('/api/mixed-analysis/analyze')
        .send(mockRequest)
        .expect(200);
      
      // Assertions
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResponse);
      expect(mixedAnalysisService.analyzeResponse).toHaveBeenCalledWith(
        mockRequest.audioUrl,
        mockRequest.transcription
      );
    });
    
    it('should return 400 if required fields are missing', async () => {
      // Make request with missing fields
      const response = await request(app)
        .post('/api/mixed-analysis/analyze')
        .send({ audioUrl: 'https://example.com/audio.mp3' })
        .expect(400);
      
      // Assertions
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
      expect(mixedAnalysisService.analyzeResponse).not.toHaveBeenCalled();
    });
    
    it('should return 500 if service throws an error', async () => {
      // Setup mock to throw error
      mixedAnalysisService.analyzeResponse.mockRejectedValue(new Error('Test error'));
      
      // Make request
      const response = await request(app)
        .post('/api/mixed-analysis/analyze')
        .send({
          audioUrl: 'https://example.com/audio.mp3',
          transcription: 'This is a test transcription'
        })
        .expect(500);
      
      // Assertions
      expect(response.body.success).toBe(false);
      expect(response.body.message).toEqual('Test error');
    });
  });
  
  describe('POST /api/mixed-analysis/analyze-batch', () => {
    it('should analyze multiple responses', async () => {
      // Mock data
      const mockRequest = {
        responses: [
          {
            audioUrl: 'https://example.com/audio1.mp3',
            transcription: 'This is the first test transcription'
          },
          {
            audioUrl: 'https://example.com/audio2.mp3',
            transcription: 'This is the second test transcription'
          }
        ]
      };
      
      const mockResponse = {
        emotionData: [{ name: 'Joy', value: 60 }],
        languageData: [{ category: 'Positive', value: 70 }],
        keyThemes: [{ theme: 'Product Quality', count: 5 }],
        insights: [{ type: 'primary_emotion', title: 'Primary Emotional Response' }],
        recommendations: [{ type: 'leverage_positive', title: 'Leverage Positive Emotions' }]
      };
      
      // Setup mock
      mixedAnalysisService.analyzeMultipleResponses.mockResolvedValue(mockResponse);
      
      // Make request
      const response = await request(app)
        .post('/api/mixed-analysis/analyze-batch')
        .send(mockRequest)
        .expect(200);
      
      // Assertions
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResponse);
      expect(mixedAnalysisService.analyzeMultipleResponses).toHaveBeenCalledWith(
        mockRequest.responses
      );
    });
    
    it('should return 400 if responses array is missing or empty', async () => {
      // Make request with missing responses
      const response1 = await request(app)
        .post('/api/mixed-analysis/analyze-batch')
        .send({})
        .expect(400);
      
      // Make request with empty responses array
      const response2 = await request(app)
        .post('/api/mixed-analysis/analyze-batch')
        .send({ responses: [] })
        .expect(400);
      
      // Assertions
      expect(response1.body.success).toBe(false);
      expect(response2.body.success).toBe(false);
      expect(mixedAnalysisService.analyzeMultipleResponses).not.toHaveBeenCalled();
    });
  });
  
  describe('POST /api/mixed-analysis/projects/:projectId/generate', () => {
    it('should start generating analysis for a project', async () => {
      // Make request
      const response = await request(app)
        .post('/api/mixed-analysis/projects/project-123/generate')
        .expect(200);
      
      // Assertions
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('analysisId');
      expect(response.body.data).toHaveProperty('status', 'processing');
    });
    
    it('should return 400 if project ID is missing', async () => {
      // Make request with missing project ID
      const response = await request(app)
        .post('/api/mixed-analysis/projects//generate')
        .expect(400);
      
      // Assertions
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/mixed-analysis/:analysisId/status', () => {
    it('should get analysis status', async () => {
      // Make request
      const response = await request(app)
        .get('/api/mixed-analysis/analysis-123/status')
        .expect(200);
      
      // Assertions
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('analysisId', 'analysis-123');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('progress');
    });
    
    it('should return 400 if analysis ID is missing', async () => {
      // Make request with missing analysis ID
      const response = await request(app)
        .get('/api/mixed-analysis//status')
        .expect(400);
      
      // Assertions
      expect(response.body.success).toBe(false);
    });
  });
});
