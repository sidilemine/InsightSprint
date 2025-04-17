import request from 'supertest';
import { app } from '../src/app';
import { airtableService } from '../src/services/airtable.service';
import { insight7Service } from '../src/services/insight7.service';

// Mock the external services
jest.mock('../src/services/airtable.service');
jest.mock('../src/services/insight7.service');

describe('Data Storage and Visualization Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Airtable data storage', () => {
    it('should store analysis results in Airtable', async () => {
      // Mock analysis results
      const analysisResults = {
        projectId: 'project-123',
        analysisId: 'analysis-123',
        emotionData: [{ name: 'Joy', value: 60 }],
        languageData: [{ category: 'Positive', value: 70 }],
        keyThemes: [{ theme: 'Product Quality', count: 5 }],
        insights: [{ type: 'primary_emotion', title: 'Primary Emotional Response' }],
        recommendations: [{ type: 'leverage_positive', title: 'Leverage Positive Emotions' }]
      };
      
      // Mock Airtable response
      const mockAirtableResponse = {
        id: 'rec123',
        fields: {
          projectId: 'project-123',
          analysisId: 'analysis-123',
          status: 'completed',
          createdAt: new Date().toISOString()
        }
      };
      
      // Setup mock
      airtableService.storeAnalysisResults.mockResolvedValue(mockAirtableResponse);
      
      // Make request to store analysis results
      const response = await request(app)
        .post('/api/storage/store-analysis')
        .send(analysisResults)
        .expect(200);
      
      // Assertions
      expect(response.body.success).toBe(true);
      expect(airtableService.storeAnalysisResults).toHaveBeenCalledWith(analysisResults);
      expect(response.body.data).toHaveProperty('id', 'rec123');
      expect(response.body.data).toHaveProperty('fields.status', 'completed');
    });
    
    it('should retrieve analysis results from Airtable', async () => {
      // Mock Airtable response
      const mockAnalysisRecord = {
        id: 'rec123',
        fields: {
          projectId: 'project-123',
          analysisId: 'analysis-123',
          status: 'completed',
          createdAt: new Date().toISOString(),
          emotionData: JSON.stringify([{ name: 'Joy', value: 60 }]),
          languageData: JSON.stringify([{ category: 'Positive', value: 70 }]),
          keyThemes: JSON.stringify([{ theme: 'Product Quality', count: 5 }]),
          insights: JSON.stringify([{ type: 'primary_emotion', title: 'Primary Emotional Response' }]),
          recommendations: JSON.stringify([{ type: 'leverage_positive', title: 'Leverage Positive Emotions' }])
        }
      };
      
      // Setup mock
      airtableService.getAnalysisResults.mockResolvedValue(mockAnalysisRecord);
      
      // Make request to retrieve analysis results
      const response = await request(app)
        .get('/api/storage/analysis/analysis-123')
        .expect(200);
      
      // Assertions
      expect(response.body.success).toBe(true);
      expect(airtableService.getAnalysisResults).toHaveBeenCalledWith('analysis-123');
      expect(response.body.data).toHaveProperty('id', 'rec123');
      expect(response.body.data).toHaveProperty('fields.analysisId', 'analysis-123');
      expect(response.body.data.fields).toHaveProperty('emotionData');
      expect(response.body.data.fields).toHaveProperty('languageData');
      expect(response.body.data.fields).toHaveProperty('keyThemes');
      expect(response.body.data.fields).toHaveProperty('insights');
      expect(response.body.data.fields).toHaveProperty('recommendations');
    });
  });
  
  describe('Insight7 visualization', () => {
    it('should generate visualizations from analysis results', async () => {
      // Mock analysis results
      const analysisResults = {
        projectId: 'project-123',
        analysisId: 'analysis-123',
        emotionData: [{ name: 'Joy', value: 60 }],
        languageData: [{ category: 'Positive', value: 70 }],
        keyThemes: [{ theme: 'Product Quality', count: 5 }],
        insights: [{ type: 'primary_emotion', title: 'Primary Emotional Response' }],
        recommendations: [{ type: 'leverage_positive', title: 'Leverage Positive Emotions' }]
      };
      
      // Mock Insight7 response
      const mockVisualizationResponse = {
        visualizationId: 'viz-123',
        visualizationUrl: 'https://insight7.io/visualizations/viz-123',
        charts: [
          { type: 'emotion-pie', url: 'https://insight7.io/charts/emotion-pie-123' },
          { type: 'sentiment-bar', url: 'https://insight7.io/charts/sentiment-bar-123' },
          { type: 'theme-cloud', url: 'https://insight7.io/charts/theme-cloud-123' }
        ]
      };
      
      // Setup mock
      insight7Service.generateVisualizations.mockResolvedValue(mockVisualizationResponse);
      
      // Make request to generate visualizations
      const response = await request(app)
        .post('/api/visualization/generate')
        .send(analysisResults)
        .expect(200);
      
      // Assertions
      expect(response.body.success).toBe(true);
      expect(insight7Service.generateVisualizations).toHaveBeenCalledWith(analysisResults);
      expect(response.body.data).toHaveProperty('visualizationId', 'viz-123');
      expect(response.body.data).toHaveProperty('visualizationUrl');
      expect(response.body.data).toHaveProperty('charts');
      expect(response.body.data.charts).toHaveLength(3);
    });
    
    it('should retrieve visualization data', async () => {
      // Mock Insight7 response
      const mockVisualizationData = {
        visualizationId: 'viz-123',
        visualizationUrl: 'https://insight7.io/visualizations/viz-123',
        charts: [
          { type: 'emotion-pie', url: 'https://insight7.io/charts/emotion-pie-123' },
          { type: 'sentiment-bar', url: 'https://insight7.io/charts/sentiment-bar-123' },
          { type: 'theme-cloud', url: 'https://insight7.io/charts/theme-cloud-123' }
        ],
        embedCode: '<iframe src="https://insight7.io/embed/viz-123"></iframe>'
      };
      
      // Setup mock
      insight7Service.getVisualizationData.mockResolvedValue(mockVisualizationData);
      
      // Make request to retrieve visualization data
      const response = await request(app)
        .get('/api/visualization/viz-123')
        .expect(200);
      
      // Assertions
      expect(response.body.success).toBe(true);
      expect(insight7Service.getVisualizationData).toHaveBeenCalledWith('viz-123');
      expect(response.body.data).toHaveProperty('visualizationId', 'viz-123');
      expect(response.body.data).toHaveProperty('visualizationUrl');
      expect(response.body.data).toHaveProperty('charts');
      expect(response.body.data).toHaveProperty('embedCode');
    });
  });
});
