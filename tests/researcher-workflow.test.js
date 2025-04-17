/**
 * End-to-End Test: Researcher Perspective
 * 
 * This test simulates the workflow from a researcher's perspective:
 * 1. Creating a new project
 * 2. Setting up an interview with a discussion guide
 * 3. Reviewing responses
 * 4. Generating and viewing analysis
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { 
  mockVoiceformService, 
  mockHumeAIService, 
  mockGeminiService, 
  mockAirtableService, 
  mockInsight7Service 
} = require('./mocks/external-services');

// Mock the external service modules
jest.mock('../../src/services/voiceform.service', () => mockVoiceformService);
jest.mock('../../src/services/hume-ai.service', () => mockHumeAIService);
jest.mock('../../src/services/gemini.service', () => mockGeminiService);
jest.mock('../../src/services/airtable.service', () => mockAirtableService);
jest.mock('../../src/services/insight7.service', () => mockInsight7Service);

describe('Researcher Workflow', () => {
  let authToken;
  let projectId;
  let interviewId;
  let analysisId;
  
  // Test user credentials
  const testUser = {
    email: 'researcher@test.com',
    password: 'Password123!',
    name: 'Test Researcher',
    role: 'admin'
  };

  // Sample project data
  const sampleProject = {
    name: 'Product Feedback Study',
    description: 'Gathering user feedback on our product experience',
    clientName: 'Internal Research Team',
    industry: 'Technology',
    targetAudience: 'Current product users'
  };

  // Sample interview data
  const sampleInterview = {
    title: 'Product Experience Interview',
    description: 'In-depth interview about user experience with our product',
    questions: [
      'How would you describe your overall experience with our product?',
      'Which features of our product do you find most valuable and why?',
      'What improvements or new features would make our product more valuable to you?'
    ]
  };

  beforeAll(async () => {
    // Register test user if not exists
    try {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    } catch (error) {
      console.log('User may already exist, continuing with tests');
    }

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  test('1. Researcher can create a new project', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send(sampleProject);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data.name).toBe(sampleProject.name);
    
    projectId = response.body.data._id;
  });

  test('2. Researcher can create an interview with discussion guide', async () => {
    const interviewWithProjectId = {
      ...sampleInterview,
      projectId
    };
    
    const response = await request(app)
      .post('/api/interviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send(interviewWithProjectId);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data.title).toBe(sampleInterview.title);
    expect(response.body.data.questions.length).toBe(sampleInterview.questions.length);
    
    interviewId = response.body.data._id;
  });

  test('3. Researcher can view interview responses', async () => {
    // Mock responses should be automatically created by the mock service
    const response = await request(app)
      .get(`/api/interviews/${interviewId}/responses`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    // Verify response structure
    const firstResponse = response.body.data[0];
    expect(firstResponse).toHaveProperty('answers');
    expect(firstResponse.answers).toBeInstanceOf(Array);
    expect(firstResponse.answers.length).toBeGreaterThan(0);
  });

  test('4. Researcher can generate analysis from responses', async () => {
    const analysisRequest = {
      interviewId,
      name: 'Product Feedback Analysis',
      description: 'Analysis of user feedback on product experience'
    };
    
    const response = await request(app)
      .post('/api/analysis')
      .set('Authorization', `Bearer ${authToken}`)
      .send(analysisRequest);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data).toHaveProperty('status', 'processing');
    
    analysisId = response.body.data._id;
  });

  test('5. Researcher can view analysis results', async () => {
    // In a real scenario, we would wait for processing to complete
    // For testing, we'll assume it's completed immediately
    
    const response = await request(app)
      .get(`/api/analysis/${analysisId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id', analysisId);
    
    // Verify analysis contains expected sections
    expect(response.body.data).toHaveProperty('emotionData');
    expect(response.body.data).toHaveProperty('languageData');
    expect(response.body.data).toHaveProperty('insights');
    expect(response.body.data).toHaveProperty('recommendations');
    expect(response.body.data).toHaveProperty('visualizations');
  });

  test('6. Researcher can view mixed analysis results', async () => {
    const response = await request(app)
      .get(`/api/mixed-analysis/${analysisId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Verify mixed analysis contains correlation data
    expect(response.body.data).toHaveProperty('correlationData');
    expect(response.body.data).toHaveProperty('themeEmotionConnections');
    expect(response.body.data).toHaveProperty('contradictions');
  });
});
