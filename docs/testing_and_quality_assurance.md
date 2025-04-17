# Testing and Quality Assurance for Rapid Consumer Sentiment Analysis

## Overview

This document outlines the comprehensive testing and quality assurance processes for the Rapid Consumer Sentiment Analysis service. A robust testing strategy is essential to ensure the reliability, performance, and security of this complex system that integrates multiple technologies and handles sensitive user data.

The testing approach is designed to address the unique challenges of this service, including:

1. **AI Component Reliability**: Ensuring consistent and accurate performance of AI-driven components
2. **Integration Stability**: Verifying seamless communication between multiple third-party services
3. **Audio Processing Quality**: Validating the accuracy of voice recording, transmission, and analysis
4. **Real-time Performance**: Confirming the system can handle concurrent interviews with acceptable response times
5. **Data Security**: Protecting sensitive user information throughout the system

## Testing Strategy

### 1. Unit Testing

Unit tests verify the functionality of individual components in isolation, ensuring each module performs as expected.

#### Backend Unit Tests

```javascript
// tests/unit/services/voiceform.service.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const { createInterview, fetchInterviewResponses } = require('../../../src/services/voiceform.service');
const config = require('../../../src/config');

describe('Voiceform Service', () => {
  let axiosStub;
  
  beforeEach(() => {
    // Stub axios to prevent actual API calls
    axiosStub = sinon.stub(axios, 'post');
    axiosStub.resolves({ data: { success: true, interviewId: '12345' } });
  });
  
  afterEach(() => {
    // Restore original functionality
    axiosStub.restore();
  });
  
  describe('createInterview()', () => {
    it('should create an interview with valid parameters', async () => {
      // Arrange
      const projectData = {
        productCategory: 'Organic Snacks',
        targetAudience: 'Health-conscious millennials',
        objectives: 'Understand emotional drivers behind purchasing decisions'
      };
      
      // Act
      const result = await createInterview(projectData);
      
      // Assert
      expect(result).to.have.property('success', true);
      expect(result).to.have.property('interviewId', '12345');
      expect(axiosStub.calledOnce).to.be.true;
      expect(axiosStub.firstCall.args[0]).to.equal(`${config.VOICEFORM_API_URL}/interviews`);
      expect(axiosStub.firstCall.args[1]).to.have.property('productCategory', 'Organic Snacks');
    });
    
    it('should throw an error with invalid parameters', async () => {
      // Arrange
      const invalidData = {};
      axiosStub.rejects(new Error('Invalid parameters'));
      
      // Act & Assert
      try {
        await createInterview(invalidData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Invalid parameters');
      }
    });
  });
  
  describe('fetchInterviewResponses()', () => {
    it('should fetch responses for a valid interview ID', async () => {
      // Arrange
      const interviewId = '12345';
      axiosStub.resolves({ 
        data: { 
          responses: [
            { id: 'resp1', question: 'How do you feel?', answer: 'Great!' }
          ] 
        } 
      });
      
      // Act
      const result = await fetchInterviewResponses(interviewId);
      
      // Assert
      expect(result).to.be.an('array').with.lengthOf(1);
      expect(result[0]).to.have.property('id', 'resp1');
    });
  });
});
```

#### AI Module Unit Tests

```javascript
// tests/unit/services/emotion-analysis.service.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const { enhanceEmotionAnalysis } = require('../../../src/services/emotion-analysis.service');
const humeAiService = require('../../../src/services/hume-ai.service');
const geminiService = require('../../../src/services/gemini.service');

describe('Emotion Analysis Service', () => {
  let humeAiStub;
  let geminiStub;
  
  beforeEach(() => {
    // Stub external service calls
    humeAiStub = sinon.stub(humeAiService, 'analyzeVoiceEmotion');
    geminiStub = sinon.stub(geminiService, 'generateAnalysis');
    
    // Mock Hume AI response
    humeAiStub.resolves({
      emotions: [
        {
          startTime: 0,
          endTime: 5,
          emotions: {
            joy: 0.8,
            interest: 0.6,
            surprise: 0.2
          }
        },
        {
          startTime: 5,
          endTime: 10,
          emotions: {
            joy: 0.3,
            interest: 0.7,
            confusion: 0.5
          }
        }
      ]
    });
    
    // Mock Gemini response
    geminiStub.resolves({
      emotionalJourney: "The respondent began with high joy and interest...",
      emotionalTriggers: [
        {
          trigger: "Discussion of product features",
          emotions: ["joy", "interest"],
          intensity: "High"
        }
      ],
      emotionalPatterns: [
        {
          pattern: "Consistent interest throughout",
          significance: "Shows engagement with the topic"
        }
      ]
    });
  });
  
  afterEach(() => {
    humeAiStub.restore();
    geminiStub.restore();
  });
  
  describe('enhanceEmotionAnalysis()', () => {
    it('should combine Hume AI and Gemini analysis correctly', async () => {
      // Arrange
      const audioData = Buffer.from('mock audio data');
      const transcription = "I really enjoy using this product because it's intuitive.";
      
      // Act
      const result = await enhanceEmotionAnalysis(audioData, transcription);
      
      // Assert
      expect(result).to.have.property('emotionalJourney');
      expect(result).to.have.property('emotionalTriggers').that.is.an('array');
      expect(result).to.have.property('emotionalPatterns').that.is.an('array');
      expect(humeAiStub.calledOnce).to.be.true;
      expect(geminiStub.calledOnce).to.be.true;
    });
    
    it('should handle errors from Hume AI gracefully', async () => {
      // Arrange
      humeAiStub.rejects(new Error('API error'));
      const audioData = Buffer.from('mock audio data');
      const transcription = "I really enjoy using this product because it's intuitive.";
      
      // Act & Assert
      try {
        await enhanceEmotionAnalysis(audioData, transcription);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('API error');
      }
    });
  });
});
```

#### Frontend Unit Tests

```javascript
// tests/unit/components/interview/AudioWaveform.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioWaveform from '../../../../src/components/interview/AudioWaveform';

describe('AudioWaveform Component', () => {
  it('renders in recording state correctly', () => {
    // Arrange & Act
    render(<AudioWaveform isRecording={true} />);
    
    // Assert
    const waveformElement = screen.getByTestId('audio-waveform');
    expect(waveformElement).toBeInTheDocument();
    expect(waveformElement).toHaveClass('recording');
  });
  
  it('renders in non-recording state correctly', () => {
    // Arrange & Act
    render(<AudioWaveform isRecording={false} />);
    
    // Assert
    const waveformElement = screen.getByTestId('audio-waveform');
    expect(waveformElement).toBeInTheDocument();
    expect(waveformElement).not.toHaveClass('recording');
  });
});
```

```javascript
// tests/unit/components/analysis/EmotionAnalysisChart.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmotionAnalysisChart from '../../../../src/components/analysis/EmotionAnalysisChart';

// Mock the Recharts library
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div data-testid="pie" />,
    Cell: () => <div data-testid="cell" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />
  };
});

describe('EmotionAnalysisChart Component', () => {
  const mockEmotionData = [
    { name: 'Joy', value: 40 },
    { name: 'Interest', value: 30 },
    { name: 'Surprise', value: 20 },
    { name: 'Confusion', value: 10 }
  ];
  
  it('renders with emotion data correctly', () => {
    // Arrange & Act
    render(<EmotionAnalysisChart emotionData={mockEmotionData} />);
    
    // Assert
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });
  
  it('renders empty state when no data is provided', () => {
    // Arrange & Act
    render(<EmotionAnalysisChart emotionData={[]} />);
    
    // Assert
    expect(screen.getByText(/No emotion data available/i)).toBeInTheDocument();
  });
});
```

### 2. Integration Testing

Integration tests verify that different components work together correctly, focusing on the interfaces between modules and services.

#### API Integration Tests

```javascript
// tests/integration/api/interview.api.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../../src/app');
const db = require('../../../src/db');
const { createTestProject, cleanupTestData } = require('../../helpers/test-utils');

describe('Interview API', () => {
  let testProject;
  let authToken;
  
  before(async () => {
    // Set up test data and authenticate
    testProject = await createTestProject();
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@jadekite.com',
        password: 'testpassword'
      });
    authToken = loginResponse.body.token;
  });
  
  after(async () => {
    // Clean up test data
    await cleanupTestData();
  });
  
  describe('POST /api/interviews', () => {
    it('should create a new interview', async () => {
      // Arrange
      const interviewData = {
        projectId: testProject.id,
        templateId: 'template-123'
      };
      
      // Act
      const response = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(interviewData);
      
      // Assert
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('status', 'draft');
      expect(response.body).to.have.property('projectId', testProject.id);
    });
    
    it('should return 400 for invalid data', async () => {
      // Arrange
      const invalidData = {
        // Missing required fields
      };
      
      // Act
      const response = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);
      
      // Assert
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
    });
  });
  
  describe('GET /api/interviews/:id', () => {
    it('should retrieve an interview by ID', async () => {
      // Arrange
      const createResponse = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProject.id,
          templateId: 'template-123'
        });
      const interviewId = createResponse.body.id;
      
      // Act
      const response = await request(app)
        .get(`/api/interviews/${interviewId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      // Assert
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('id', interviewId);
      expect(response.body).to.have.property('projectId', testProject.id);
    });
    
    it('should return 404 for non-existent interview', async () => {
      // Act
      const response = await request(app)
        .get('/api/interviews/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Assert
      expect(response.status).to.equal(404);
    });
  });
});
```

#### Service Integration Tests

```javascript
// tests/integration/services/analysis-pipeline.test.js
const { expect } = require('chai');
const fs = require('fs').promises;
const path = require('path');
const { processInterviewResponse } = require('../../../src/services/analysis-pipeline.service');
const { createTestResponse } = require('../../helpers/test-utils');

describe('Analysis Pipeline Integration', () => {
  it('should process an interview response end-to-end', async () => {
    // Arrange
    const testAudioPath = path.join(__dirname, '../../fixtures/test-response.webm');
    const audioBuffer = await fs.readFile(testAudioPath);
    const testResponse = await createTestResponse();
    
    // Act
    const result = await processInterviewResponse(testResponse.id, audioBuffer);
    
    // Assert
    expect(result).to.have.property('transcription').that.is.a('string');
    expect(result).to.have.property('emotionAnalysis').that.is.an('object');
    expect(result).to.have.property('languageAnalysis').that.is.an('object');
    expect(result).to.have.property('aiResponse').that.is.a('string');
    expect(result).to.have.property('followUpQuestion').that.is.a('string');
  });
  
  it('should handle poor quality audio gracefully', async () => {
    // Arrange
    const testAudioPath = path.join(__dirname, '../../fixtures/poor-quality-audio.webm');
    const audioBuffer = await fs.readFile(testAudioPath);
    const testResponse = await createTestResponse();
    
    // Act
    const result = await processInterviewResponse(testResponse.id, audioBuffer);
    
    // Assert
    expect(result).to.have.property('transcription');
    expect(result).to.have.property('qualityIssue', true);
    expect(result).to.have.property('qualityMessage').that.includes('audio quality');
  });
});
```

#### Third-Party Integration Tests

```javascript
// tests/integration/services/hume-ai.test.js
const { expect } = require('chai');
const fs = require('fs').promises;
const path = require('path');
const { analyzeVoiceEmotion } = require('../../../src/services/hume-ai.service');
const config = require('../../../src/config');

// Only run these tests if integration testing is enabled
describe.skip('Hume AI Integration', function() {
  this.timeout(10000); // Increase timeout for external API calls
  
  before(function() {
    // Skip tests if API key is not configured
    if (!config.HUME_AI_API_KEY) {
      this.skip();
    }
  });
  
  it('should analyze emotions in voice recording', async () => {
    // Arrange
    const testAudioPath = path.join(__dirname, '../../fixtures/emotion-sample.webm');
    const audioBuffer = await fs.readFile(testAudioPath);
    
    // Act
    const result = await analyzeVoiceEmotion(audioBuffer);
    
    // Assert
    expect(result).to.have.property('emotions').that.is.an('array');
    expect(result.emotions.length).to.be.greaterThan(0);
    expect(result.emotions[0]).to.have.property('startTime');
    expect(result.emotions[0]).to.have.property('endTime');
    expect(result.emotions[0]).to.have.property('emotions').that.is.an('object');
  });
  
  it('should return error for invalid audio format', async () => {
    // Arrange
    const invalidBuffer = Buffer.from('not a valid audio file');
    
    // Act & Assert
    try {
      await analyzeVoiceEmotion(invalidBuffer);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).to.include('Invalid audio format');
    }
  });
});
```

### 3. End-to-End Testing

End-to-end tests verify the entire application flow from start to finish, simulating real user scenarios.

```javascript
// tests/e2e/interview-flow.test.js
const { test, expect } = require('@playwright/test');

test.describe('Interview Flow', () => {
  test('complete interview process', async ({ page }) => {
    // Navigate to interview landing page
    await page.goto('/interview/test-interview-id');
    
    // Verify landing page elements
    await expect(page.locator('h1')).toContainText('Welcome to Your Interview');
    
    // Proceed through setup steps
    await page.click('text=Next');
    
    // Grant microphone permissions (handled by Playwright context)
    await page.click('text=Next');
    
    // Start the interview
    await page.click('text=Start Interview');
    
    // Verify first question appears
    await expect(page.locator('.question-text')).toBeVisible();
    
    // Simulate recording (in a real test, we'd use mock audio)
    await page.click('text=Start Recording');
    await page.waitForTimeout(3000); // Simulate 3 seconds of recording
    await page.click('text=Stop Recording');
    
    // Submit response
    await page.click('text=Submit Response');
    
    // Verify AI response appears
    await expect(page.locator('.ai-response')).toBeVisible();
    
    // Continue to next question
    await page.click('text=Continue');
    
    // Verify second question appears
    await expect(page.locator('.question-text')).toBeVisible();
    
    // Complete the interview (simplified for brevity)
    await page.click('text=Start Recording');
    await page.waitForTimeout(3000);
    await page.click('text=Stop Recording');
    await page.click('text=Submit Response');
    
    // Skip to completion (in a real test we'd complete all questions)
    await page.goto('/interview/test-interview-id/complete');
    
    // Verify completion page
    await expect(page.locator('h1')).toContainText('Thank You');
  });
});
```

```javascript
// tests/e2e/admin-dashboard.test.js
const { test, expect } = require('@playwright/test');

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@jadekite.com');
    await page.fill('input[name="password"]', 'adminpassword');
    await page.click('button[type="submit"]');
    
    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('create and manage a project', async ({ page }) => {
    // Navigate to projects page
    await page.click('text=Projects');
    
    // Create new project
    await page.click('text=New Project');
    
    // Fill out project details
    await page.fill('input[name="name"]', 'Test Project');
    await page.fill('input[name="productCategory"]', 'Organic Snacks');
    await page.selectOption('select[name="clientId"]', { label: 'Test Client' });
    await page.click('text=Next');
    
    // Fill out interview setup
    await page.fill('textarea[name="targetAudience"]', 'Health-conscious millennials');
    await page.fill('textarea[name="objectives"]', 'Understand emotional drivers');
    await page.fill('input[name="targetResponseCount"]', '10');
    await page.selectOption('select[name="interviewTemplateId"]', { label: 'Standard Template' });
    await page.click('text=Next');
    
    // Review and create
    await page.click('text=Create Project');
    
    // Verify project was created
    await expect(page).toHaveURL(/\/projects\/[\w-]+$/);
    await expect(page.locator('h1')).toContainText('Test Project');
    
    // Navigate to interview management
    await page.click('text=Interviews');
    
    // Start collection
    await page.click('text=Start Collection');
    
    // Verify collection started
    await expect(page.locator('text=Pause Collection')).toBeVisible();
    
    // Navigate to analysis dashboard
    await page.click('text=Analysis');
    
    // Verify analysis page loads
    await expect(page.locator('h1')).toContainText('Analysis Dashboard');
  });
});
```

### 4. Performance Testing

Performance tests evaluate the system's responsiveness, scalability, and stability under various load conditions.

#### Load Testing Script

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// Custom metrics
const errors = new Counter('errors');
const interviewResponseTime = new Rate('interview_response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 10 }, // Ramp up to 10 users over 1 minute
    { duration: '3m', target: 10 }, // Stay at 10 users for 3 minutes
    { duration: '1m', target: 20 }, // Ramp up to 20 users over 1 minute
    { duration: '3m', target: 20 }, // Stay at 20 users for 3 minutes
    { duration: '1m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests should be below 500ms
    'interview_response_time': ['avg<300'], // Average interview response time below 300ms
    'errors': ['count<10'], // Less than 10 errors
  },
};

// Simulated interview data
const interviewData = {
  projectId: 'performance-test-project',
  templateId: 'standard-template',
};

// Main test function
export default function() {
  // Step 1: Create a new interview
  const createResponse = http.post('http://localhost:3000/api/interviews', JSON.stringify(interviewData), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(createResponse, {
    'interview created successfully': (r) => r.status === 201,
  }) || errors.add(1);
  
  const interviewId = createResponse.json('id');
  
  // Step 2: Get interview details
  const getResponse = http.get(`http://localhost:3000/api/interviews/${interviewId}`);
  
  check(getResponse, {
    'interview details retrieved successfully': (r) => r.status === 200,
  }) || errors.add(1);
  
  // Step 3: Submit a response (with mock audio data)
  const mockAudioData = 'data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC...'; // Truncated for brevity
  const formData = {
    questionId: 'q1',
    audio: http.file(mockAudioData, 'response.webm', 'audio/webm'),
  };
  
  const startTime = new Date().getTime();
  const submitResponse = http.post(
    `http://localhost:3000/api/interviews/${interviewId}/responses`,
    formData
  );
  const endTime = new Date().getTime();
  
  // Record response time
  interviewResponseTime.add(endTime - startTime);
  
  check(submitResponse, {
    'response submitted successfully': (r) => r.status === 200,
    'AI response received': (r) => r.json('aiResponse') !== undefined,
  }) || errors.add(1);
  
  // Wait between iterations
  sleep(1);
}
```

#### Stress Testing Script

```javascript
// tests/performance/stress-test.js
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Custom metrics
const errors = new Counter('errors');
const processingTime = new Trend('processing_time');

// Test configuration for stress testing
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users over 1 minute
    { duration: '3m', target: 50 },  // Stay at 50 users for 3 minutes
    { duration: '1m', target: 100 }, // Ramp up to 100 users over 1 minute
    { duration: '3m', target: 100 }, // Stay at 100 users for 3 minutes
    { duration: '1m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // 95% of requests should be below 1s
    'processing_time': ['avg<500'],      // Average processing time below 500ms
    'errors': ['count<50'],              // Less than 50 errors
  },
};

// Main test function
export default function() {
  // Simulate concurrent analysis requests
  const payload = JSON.stringify({
    audioUrl: 'https://example.com/test-audio.webm',
    transcription: 'This is a test response for stress testing the system.',
    questionId: 'stress-test-q1',
    responseId: `response-${__VU}-${__ITER}`, // Virtual User and Iteration
  });
  
  const startTime = new Date().getTime();
  const response = http.post('http://localhost:3000/api/analysis/process', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  const endTime = new Date().getTime();
  
  // Record processing time
  processingTime.add(endTime - startTime);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'analysis completed': (r) => r.json('status') === 'completed',
  }) || errors.add(1);
  
  // Wait between iterations
  sleep(0.5);
}
```

### 5. Security Testing

Security tests identify vulnerabilities and ensure the system protects sensitive data and prevents unauthorized access.

#### Authentication and Authorization Tests

```javascript
// tests/security/auth.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');
const { createTestUser, createTestClient, cleanupTestData } = require('../helpers/test-utils');

describe('Authentication and Authorization', () => {
  let adminToken, clientToken, regularToken;
  
  before(async () => {
    // Create test users and get tokens
    await createTestUser('admin@jadekite.com', 'adminpassword', 'admin');
    await createTestUser('client@example.com', 'clientpassword', 'client');
    await createTestUser('user@jadekite.com', 'userpassword', 'user');
    await createTestClient('Test Client', 'client@example.com');
    
    // Get admin token
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@jadekite.com',
        password: 'adminpassword'
      });
    adminToken = adminResponse.body.token;
    
    // Get client token
    const clientResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'client@example.com',
        password: 'clientpassword'
      });
    clientToken = clientResponse.body.token;
    
    // Get regular user token
    const userResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@jadekite.com',
        password: 'userpassword'
      });
    regularToken = userResponse.body.token;
  });
  
  after(async () => {
    await cleanupTestData();
  });
  
  describe('Authentication', () => {
    it('should reject requests without a token', async () => {
      const response = await request(app)
        .get('/api/projects');
      
      expect(response.status).to.equal(401);
    });
    
    it('should reject requests with an invalid token', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).to.equal(401);
    });
    
    it('should accept requests with a valid token', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).to.equal(200);
    });
  });
  
  describe('Authorization', () => {
    it('should allow admins to access all projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).to.equal(200);
    });
    
    it('should restrict clients to their own projects', async () => {
      // Create a project for the test client
      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Client Test Project',
          clientId: 'test-client-id'
        });
      
      const projectId = createResponse.body.id;
      
      // Client should be able to access their project
      const clientResponse = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${clientToken}`);
      
      expect(clientResponse.status).to.equal(200);
      
      // Client should not be able to access other projects
      const otherResponse = await request(app)
        .get('/api/projects/other-project-id')
        .set('Authorization', `Bearer ${clientToken}`);
      
      expect(otherResponse.status).to.equal(403);
    });
    
    it('should restrict regular users based on role permissions', async () => {
      // Regular user should not be able to create projects
      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          name: 'Unauthorized Project',
          clientId: 'test-client-id'
        });
      
      expect(createResponse.status).to.equal(403);
      
      // Regular user should be able to view projects
      const viewResponse = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${regularToken}`);
      
      expect(viewResponse.status).to.equal(200);
    });
  });
});
```

#### Data Protection Tests

```javascript
// tests/security/data-protection.test.js
const request = require('supertest');
const { expect } = require('chai');
const fs = require('fs').promises;
const path = require('path');
const app = require('../../src/app');
const { createTestProject, createTestUser, cleanupTestData } = require('../helpers/test-utils');

describe('Data Protection', () => {
  let adminToken;
  let testProject;
  
  before(async () => {
    // Create test user and get token
    await createTestUser('admin@jadekite.com', 'adminpassword', 'admin');
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@jadekite.com',
        password: 'adminpassword'
      });
    adminToken = loginResponse.body.token;
    
    // Create test project
    testProject = await createTestProject();
  });
  
  after(async () => {
    await cleanupTestData();
  });
  
  describe('Audio Data Protection', () => {
    it('should store audio data securely', async () => {
      // Arrange
      const testAudioPath = path.join(__dirname, '../fixtures/test-response.webm');
      const audioBuffer = await fs.readFile(testAudioPath);
      
      // Act
      const response = await request(app)
        .post(`/api/interviews/${testProject.interviewId}/responses`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('audio', audioBuffer, 'test-response.webm')
        .field('questionId', 'test-question-id');
      
      // Assert
      expect(response.status).to.equal(200);
      
      // Verify audio is not directly accessible
      const audioUrl = response.body.audioUrl;
      const directAccessResponse = await request(app)
        .get(audioUrl)
        .set('Authorization', ''); // No auth token
      
      expect(directAccessResponse.status).to.equal(401);
    });
    
    it('should encrypt sensitive data in the database', async () => {
      // This would typically involve checking the database directly
      // For this example, we'll use an API endpoint that returns encryption status
      
      const response = await request(app)
        .get(`/api/system/encryption-status`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('audioEncrypted', true);
      expect(response.body).to.have.property('personalDataEncrypted', true);
    });
  });
  
  describe('Data Access Controls', () => {
    it('should anonymize data for exports', async () => {
      // Request an anonymized export
      const exportResponse = await request(app)
        .post(`/api/projects/${testProject.id}/export`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          anonymize: true
        });
      
      expect(exportResponse.status).to.equal(200);
      
      // Download the export
      const downloadResponse = await request(app)
        .get(exportResponse.body.exportUrl)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(downloadResponse.status).to.equal(200);
      
      // Parse the exported data
      const exportedData = JSON.parse(downloadResponse.text);
      
      // Verify personal identifiers are anonymized
      exportedData.responses.forEach(response => {
        expect(response).to.not.have.property('respondentEmail');
        expect(response).to.not.have.property('respondentName');
        expect(response).to.have.property('respondentId').that.matches(/^anon-/);
      });
    });
  });
});
```

### 6. Accessibility Testing

Accessibility tests ensure the application is usable by people with disabilities and complies with accessibility standards.

```javascript
// tests/accessibility/a11y.test.js
const { test, expect } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

test.describe('Accessibility', () => {
  test('admin dashboard should not have accessibility violations', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@jadekite.com');
    await page.fill('input[name="password"]', 'adminpassword');
    await page.click('button[type="submit"]');
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Run accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('client portal should not have accessibility violations', async ({ page }) => {
    // Login to client portal
    await page.goto('/client/login');
    await page.fill('input[name="email"]', 'client@example.com');
    await page.fill('input[name="password"]', 'clientpassword');
    await page.click('button[type="submit"]');
    
    // Navigate to dashboard
    await page.goto('/client/dashboard');
    
    // Run accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('respondent interface should not have accessibility violations', async ({ page }) => {
    // Navigate to interview landing page
    await page.goto('/interview/test-interview-id');
    
    // Run accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

## Continuous Integration and Deployment

### CI/CD Pipeline Configuration

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:4.4
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint code
        run: npm run lint
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Build application
        run: npm run build
        
      - name: Upload build artifacts
        uses: actions/upload-artifact@v2
        with:
          name: build
          path: dist/
  
  e2e-tests:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Download build artifacts
        uses: actions/download-artifact@v2
        with:
          name: build
          path: dist/
          
      - name: Start application
        run: npm run start:e2e &
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: playwright-report
          path: playwright-report/
  
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Run dependency vulnerability scan
        run: npm audit --production
        
      - name: Run SAST scan
        uses: github/codeql-action/analyze@v1
        with:
          languages: javascript
  
  deploy-staging:
    needs: [test, e2e-tests, security-scan]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Download build artifacts
        uses: actions/download-artifact@v2
        with:
          name: build
          path: dist/
          
      - name: Deploy to staging
        run: |
          # Deployment script for staging environment
          echo "Deploying to staging..."
  
  deploy-production:
    needs: [test, e2e-tests, security-scan]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Download build artifacts
        uses: actions/download-artifact@v2
        with:
          name: build
          path: dist/
          
      - name: Deploy to production
        run: |
          # Deployment script for production environment
          echo "Deploying to production..."
```

## Quality Assurance Processes

### 1. Code Review Process

```markdown
# Code Review Guidelines

## Process Overview

1. **Create Pull Request**: Developer creates a PR with a clear description of changes
2. **Automated Checks**: CI pipeline runs tests, linting, and security scans
3. **Peer Review**: At least one team member reviews the code
4. **Address Feedback**: Developer addresses review comments
5. **Final Approval**: Reviewer approves changes
6. **Merge**: Code is merged to the target branch

## Review Checklist

### Functionality
- [ ] Code works as expected and meets requirements
- [ ] Edge cases are handled appropriately
- [ ] Error handling is implemented

### Code Quality
- [ ] Code follows project style guidelines
- [ ] No unnecessary complexity
- [ ] Functions and methods are focused and not too long
- [ ] Variable and function names are clear and descriptive

### Testing
- [ ] Appropriate unit tests are included
- [ ] Integration tests cover key scenarios
- [ ] Edge cases are tested

### Security
- [ ] Input validation is implemented
- [ ] Authentication and authorization checks are in place
- [ ] Sensitive data is handled securely

### Performance
- [ ] No obvious performance issues
- [ ] Database queries are optimized
- [ ] Resource-intensive operations are handled efficiently

### Documentation
- [ ] Code is well-commented where necessary
- [ ] API endpoints are documented
- [ ] Complex logic is explained
```

### 2. Bug Tracking and Resolution Process

```markdown
# Bug Tracking and Resolution Process

## Bug Reporting

1. **Identification**: Bug is identified through testing, user feedback, or monitoring
2. **Documentation**: Bug is documented with the following information:
   - Description of the issue
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details (browser, OS, etc.)
   - Screenshots or videos if applicable
   - Severity level
3. **Triage**: Bug is triaged and assigned a priority

## Bug Resolution

1. **Assignment**: Bug is assigned to a developer
2. **Investigation**: Developer investigates the root cause
3. **Fix Implementation**: Developer implements a fix
4. **Testing**: Fix is tested to ensure it resolves the issue without introducing new problems
5. **Code Review**: Fix undergoes code review
6. **Deployment**: Fix is deployed to the appropriate environment
7. **Verification**: Bug is verified as resolved
8. **Closure**: Bug is closed with documentation of the resolution

## Severity Levels

- **Critical**: System is unusable, data loss or security breach
- **High**: Major functionality is impacted, no workaround available
- **Medium**: Important functionality is impacted, workaround available
- **Low**: Minor issue with minimal impact on users
```

### 3. Release Management Process

```markdown
# Release Management Process

## Release Planning

1. **Feature Selection**: Determine features and fixes for the release
2. **Scope Definition**: Define clear scope and acceptance criteria
3. **Timeline Planning**: Establish development, testing, and release timeline
4. **Resource Allocation**: Assign resources for development and testing

## Development Phase

1. **Feature Development**: Implement features according to requirements
2. **Code Reviews**: Conduct thorough code reviews
3. **Unit Testing**: Develop and run unit tests
4. **Integration**: Integrate features into the release branch

## Testing Phase

1. **Integration Testing**: Test integrated components
2. **System Testing**: Test the entire system
3. **Performance Testing**: Verify system performance under load
4. **Security Testing**: Conduct security assessments
5. **User Acceptance Testing**: Validate with stakeholders
6. **Regression Testing**: Ensure existing functionality works

## Release Preparation

1. **Release Notes**: Prepare detailed release notes
2. **Deployment Plan**: Create deployment and rollback plans
3. **Final Approval**: Obtain stakeholder approval

## Deployment

1. **Pre-deployment Checks**: Verify environment readiness
2. **Deployment**: Deploy to production using CI/CD pipeline
3. **Smoke Testing**: Perform quick validation after deployment
4. **Monitoring**: Monitor system for issues

## Post-Release

1. **Issue Tracking**: Track and address any issues
2. **User Feedback**: Collect and analyze user feedback
3. **Retrospective**: Conduct release retrospective
4. **Documentation**: Update documentation as needed
```

## Test Automation Framework

### Test Runner Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/config/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{js,ts}',
    '<rootDir>/tests/integration/**/*.test.{js,ts}',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

```javascript
// playwright.config.js
const { devices } = require('@playwright/test');

module.exports = {
  testDir: './tests/e2e',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/test-results.json' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
};
```

### Test Helpers and Utilities

```javascript
// tests/helpers/test-utils.js
const db = require('../../src/db');
const { hashPassword } = require('../../src/utils/auth');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a test user
 */
async function createTestUser(email, password, role = 'user') {
  const hashedPassword = await hashPassword(password);
  
  const user = {
    id: uuidv4(),
    email,
    password: hashedPassword,
    role,
    createdAt: new Date(),
  };
  
  await db.collection('users').insertOne(user);
  
  return user;
}

/**
 * Create a test client
 */
async function createTestClient(name, email) {
  const client = {
    id: 'test-client-id',
    name,
    email,
    createdAt: new Date(),
  };
  
  await db.collection('clients').insertOne(client);
  
  return client;
}

/**
 * Create a test project
 */
async function createTestProject() {
  const project = {
    id: uuidv4(),
    name: 'Test Project',
    productCategory: 'Test Category',
    clientId: 'test-client-id',
    status: 'draft',
    createdAt: new Date(),
  };
  
  await db.collection('projects').insertOne(project);
  
  // Create an interview for the project
  const interview = {
    id: uuidv4(),
    projectId: project.id,
    status: 'draft',
    createdAt: new Date(),
  };
  
  await db.collection('interviews').insertOne(interview);
  
  return {
    ...project,
    interviewId: interview.id,
  };
}

/**
 * Create a test response
 */
async function createTestResponse() {
  const testProject = await createTestProject();
  
  const response = {
    id: uuidv4(),
    interviewId: testProject.interviewId,
    questionId: 'test-question-id',
    status: 'pending',
    createdAt: new Date(),
  };
  
  await db.collection('responses').insertOne(response);
  
  return response;
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  await db.collection('users').deleteMany({ email: /test/ });
  await db.collection('clients').deleteMany({ id: 'test-client-id' });
  await db.collection('projects').deleteMany({ name: 'Test Project' });
  await db.collection('interviews').deleteMany({});
  await db.collection('responses').deleteMany({});
}

module.exports = {
  createTestUser,
  createTestClient,
  createTestProject,
  createTestResponse,
  cleanupTestData,
};
```

```javascript
// tests/helpers/mock-data.js
/**
 * Generate mock emotion analysis data
 */
function generateMockEmotionData() {
  return {
    emotions: [
      {
        startTime: 0,
        endTime: 5,
        emotions: {
          joy: 0.8,
          interest: 0.6,
          surprise: 0.2,
        },
      },
      {
        startTime: 5,
        endTime: 10,
        emotions: {
          joy: 0.3,
          interest: 0.7,
          confusion: 0.5,
        },
      },
      {
        startTime: 10,
        endTime: 15,
        emotions: {
          interest: 0.8,
          concentration: 0.6,
        },
      },
    ],
  };
}

/**
 * Generate mock language analysis data
 */
function generateMockLanguageData() {
  return {
    keyThemes: [
      {
        theme: 'Ease of Use',
        description: 'References to how easy or difficult the product is to use',
        quotes: ['It was really intuitive', 'I didn\'t need to read instructions'],
        sentiment: 'Positive',
      },
      {
        theme: 'Quality',
        description: 'References to product quality and durability',
        quotes: ['It feels well-made', 'I expect it to last a long time'],
        sentiment: 'Positive',
      },
    ],
    sentimentAnalysis: {
      overall: 'Positive',
      score: 0.75,
      byTopic: [
        {
          topic: 'Ease of Use',
          sentiment: 'Positive',
          score: 0.9,
        },
        {
          topic: 'Price',
          sentiment: 'Neutral',
          score: 0.1,
        },
      ],
    },
    implicitNeeds: [
      {
        need: 'Status and Recognition',
        evidence: 'References to how others perceive the product',
        confidence: 'Medium',
      },
    ],
  };
}

/**
 * Generate mock insight data
 */
function generateMockInsightData() {
  return {
    keyInsights: [
      {
        title: 'Emotional Connection to Brand',
        description: 'Users form strong emotional bonds with the brand based on shared values',
        supportingData: 'High joy response when discussing brand values',
        importance: 'high',
      },
    ],
    emotionalDrivers: [
      {
        emotion: 'Joy',
        description: 'Joy is triggered by the product\'s ease of use',
        triggers: ['Intuitive interface', 'Quick results'],
        implications: 'Focus marketing on simplicity and time-saving',
      },
    ],
    recommendations: [
      {
        title: 'Emphasize Emotional Benefits',
        description: 'Marketing should focus on how the product makes users feel',
        rationale: 'Strong emotional responses to benefit-focused messaging',
        implementation: 'Update website and packaging copy',
        priority: 'high',
      },
    ],
  };
}

module.exports = {
  generateMockEmotionData,
  generateMockLanguageData,
  generateMockInsightData,
};
```

## Monitoring and Alerting

### Monitoring Configuration

```javascript
// src/monitoring/index.js
const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;
const Sentry = require('@sentry/node');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');
const config = require('../config');

// Initialize Sentry for error tracking
Sentry.init({
  dsn: config.SENTRY_DSN,
  environment: config.NODE_ENV,
  tracesSampleRate: 0.2,
});

// Set up Prometheus metrics
const prometheusExporter = new PrometheusExporter({
  port: 9464,
  startServer: true,
});

const meterProvider = new MeterProvider({
  exporter: prometheusExporter,
  interval: 1000,
});

// Create metrics
const apiRequestCounter = meterProvider.getMeter('api').createCounter('api_requests_total', {
  description: 'Total number of API requests',
});

const responseTimeHistogram = meterProvider.getMeter('api').createHistogram('response_time_seconds', {
  description: 'Response time in seconds',
});

const audioProcessingGauge = meterProvider.getMeter('processing').createUpDownCounter('audio_processing_current', {
  description: 'Current number of audio files being processed',
});

// Set up Winston logger
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  return `${timestamp} ${level}: ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata) : ''}`;
});

const logger = createLogger({
  level: config.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'rapid-sentiment-analysis' },
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        consoleFormat
      ),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add Sentry transport for error logs
if (config.NODE_ENV === 'production') {
  logger.add(new Sentry.Handlers.WinstonTransport({
    level: 'error',
    Sentry,
  }));
}

// Middleware for tracking API requests
const requestTracker = (req, res, next) => {
  const start = Date.now();
  
  // Track request
  apiRequestCounter.add(1, {
    method: req.method,
    route: req.route?.path || 'unknown',
  });
  
  // Track response time
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    responseTimeHistogram.record(duration, {
      method: req.method,
      route: req.route?.path || 'unknown',
      status_code: res.statusCode,
    });
    
    // Log request details
    logger.info('API Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      user: req.user?.id || 'anonymous',
    });
  });
  
  next();
};

// Track audio processing
const trackAudioProcessing = {
  start: () => {
    audioProcessingGauge.add(1);
  },
  end: () => {
    audioProcessingGauge.add(-1);
  },
};

module.exports = {
  logger,
  Sentry,
  requestTracker,
  trackAudioProcessing,
  metrics: {
    apiRequestCounter,
    responseTimeHistogram,
    audioProcessingGauge,
  },
};
```

### Alert Configuration

```javascript
// src/monitoring/alerts.js
const nodemailer = require('nodemailer');
const config = require('../config');
const { logger } = require('./index');

// Configure email transport
const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_SECURE,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASSWORD,
  },
});

// Alert levels
const AlertLevel = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

// Alert channels
const AlertChannel = {
  EMAIL: 'email',
  SLACK: 'slack',
  SMS: 'sms',
};

/**
 * Send an alert
 */
async function sendAlert(level, message, details, channels = [AlertChannel.EMAIL]) {
  try {
    logger.info(`Sending ${level} alert: ${message}`, { details, channels });
    
    // Log the alert
    switch (level) {
      case AlertLevel.INFO:
        logger.info(message, details);
        break;
      case AlertLevel.WARNING:
        logger.warn(message, details);
        break;
      case AlertLevel.ERROR:
      case AlertLevel.CRITICAL:
        logger.error(message, details);
        break;
    }
    
    // Send to configured channels
    const promises = [];
    
    if (channels.includes(AlertChannel.EMAIL)) {
      promises.push(sendEmailAlert(level, message, details));
    }
    
    if (channels.includes(AlertChannel.SLACK)) {
      promises.push(sendSlackAlert(level, message, details));
    }
    
    if (channels.includes(AlertChannel.SMS) && level === AlertLevel.CRITICAL) {
      promises.push(sendSmsAlert(message));
    }
    
    await Promise.all(promises);
    
    return true;
  } catch (error) {
    logger.error('Failed to send alert', { error: error.message, level, message });
    return false;
  }
}

/**
 * Send an email alert
 */
async function sendEmailAlert(level, message, details) {
  const subject = `[${level.toUpperCase()}] Rapid Sentiment Analysis Alert`;
  
  const htmlContent = `
    <h2>${message}</h2>
    <p><strong>Level:</strong> ${level}</p>
    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
    <p><strong>Environment:</strong> ${config.NODE_ENV}</p>
    <h3>Details:</h3>
    <pre>${JSON.stringify(details, null, 2)}</pre>
  `;
  
  const mailOptions = {
    from: config.ALERT_EMAIL_FROM,
    to: config.ALERT_EMAIL_TO,
    subject,
    html: htmlContent,
  };
  
  return transporter.sendMail(mailOptions);
}

/**
 * Send a Slack alert
 */
async function sendSlackAlert(level, message, details) {
  // Implementation depends on Slack API client
  // This is a placeholder
  logger.info('Slack alert would be sent here', { level, message, details });
  return true;
}

/**
 * Send an SMS alert
 */
async function sendSmsAlert(message) {
  // Implementation depends on SMS service
  // This is a placeholder
  logger.info('SMS alert would be sent here', { message });
  return true;
}

module.exports = {
  AlertLevel,
  AlertChannel,
  sendAlert,
};
```

## Implementation Plan

### Phase 1: Test Framework Setup (Week 1)
1. Set up unit testing framework with Jest
2. Configure integration testing environment
3. Set up end-to-end testing with Playwright
4. Implement test helpers and utilities
5. Configure CI pipeline for automated testing

### Phase 2: Core Testing Implementation (Week 2)
1. Implement unit tests for backend services
2. Develop integration tests for API endpoints
3. Create end-to-end tests for critical user flows
4. Set up performance testing scripts
5. Implement security testing

### Phase 3: Quality Assurance Processes (Week 3)
1. Establish code review guidelines
2. Set up bug tracking and resolution process
3. Define release management workflow
4. Implement monitoring and alerting
5. Create documentation for QA processes

### Phase 4: Test Automation and Reporting (Week 4)
1. Set up automated test runs in CI/CD pipeline
2. Implement test coverage reporting
3. Create dashboards for test results
4. Set up performance monitoring
5. Implement automated security scanning

## Conclusion

This comprehensive testing and quality assurance plan ensures the Rapid Consumer Sentiment Analysis service is reliable, secure, and performs well under various conditions. By implementing a multi-layered testing approach that covers unit, integration, end-to-end, performance, security, and accessibility testing, we can identify and address issues early in the development process.

The continuous integration and deployment pipeline automates the testing process, ensuring that every code change is thoroughly tested before deployment. The established quality assurance processes provide clear guidelines for code reviews, bug tracking, and release management, promoting a culture of quality throughout the development lifecycle.

Monitoring and alerting systems provide real-time visibility into the application's performance and help quickly identify and resolve issues in production. This proactive approach to quality assurance ensures that the service meets the high standards required for a critical business application handling sensitive user data.

By following this plan, we can deliver a robust, high-quality service that provides accurate sentiment analysis and valuable insights to clients while maintaining a positive user experience for interview participants.
