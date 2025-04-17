/**
 * End-to-End Test: Participant Perspective
 * 
 * This test simulates the workflow from a participant's perspective:
 * 1. Receiving an interview invitation
 * 2. Accessing the interview session
 * 3. Answering questions and submitting voice responses
 * 4. Completing the interview
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { 
  mockVoiceformService, 
  mockHumeAIService
} = require('./mocks/external-services');
const fs = require('fs');
const path = require('path');

// Mock the external service modules
jest.mock('../../src/services/voiceform.service', () => mockVoiceformService);
jest.mock('../../src/services/hume-ai.service', () => mockHumeAIService);

describe('Participant Workflow', () => {
  let interviewToken;
  let interviewSession;
  
  // Sample interview data (pre-created by researcher)
  const sampleInterviewId = 'mock-interview-id';
  
  // Sample participant data
  const participant = {
    name: 'Test Participant',
    email: 'participant@test.com',
    demographics: {
      age: '25-34',
      gender: 'Prefer not to say',
      location: 'United States'
    }
  };

  beforeAll(async () => {
    // Generate a participant access token
    const response = await request(app)
      .post(`/api/interviews/${sampleInterviewId}/generate-access`)
      .send({ email: participant.email });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('accessToken');
    
    interviewToken = response.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  test('1. Participant can access interview session with token', async () => {
    const response = await request(app)
      .get(`/api/respondent/interview-session`)
      .set('Authorization', `Bearer ${interviewToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('interview');
    expect(response.body.data.interview).toHaveProperty('title');
    expect(response.body.data.interview).toHaveProperty('questions');
    expect(response.body.data.interview.questions.length).toBeGreaterThan(0);
    
    interviewSession = response.body.data;
  });

  test('2. Participant can submit demographic information', async () => {
    const response = await request(app)
      .post(`/api/respondent/demographics`)
      .set('Authorization', `Bearer ${interviewToken}`)
      .send(participant.demographics);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Demographics saved');
  });

  test('3. Participant can submit voice response to first question', async () => {
    // Get the first question from the interview
    const firstQuestion = interviewSession.interview.questions[0];
    
    // In a real test, we would upload an actual audio file
    // For this test, we'll use our placeholder file
    const audioFilePath = path.join(__dirname, 'fixtures', 'positive_response.mp3');
    
    const response = await request(app)
      .post(`/api/respondent/submit-response`)
      .set('Authorization', `Bearer ${interviewToken}`)
      .field('questionId', firstQuestion.id)
      .field('transcription', 'I absolutely love using your product. It has made my daily routine so much easier and more enjoyable.')
      .attach('audioFile', audioFilePath);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('responseId');
  });

  test('4. Participant can submit voice response to second question', async () => {
    // Get the second question from the interview
    const secondQuestion = interviewSession.interview.questions[1];
    
    // Use a different audio file for this response
    const audioFilePath = path.join(__dirname, 'fixtures', 'neutral_response.mp3');
    
    const response = await request(app)
      .post(`/api/respondent/submit-response`)
      .set('Authorization', `Bearer ${interviewToken}`)
      .field('questionId', secondQuestion.id)
      .field('transcription', 'The interface is clean and intuitive. I particularly like the dashboard that shows all my activity in one place.')
      .attach('audioFile', audioFilePath);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('responseId');
  });

  test('5. Participant can submit voice response to third question', async () => {
    // Get the third question from the interview
    const thirdQuestion = interviewSession.interview.questions[2];
    
    // Use a negative audio file for this response
    const audioFilePath = path.join(__dirname, 'fixtures', 'negative_response.mp3');
    
    const response = await request(app)
      .post(`/api/respondent/submit-response`)
      .set('Authorization', `Bearer ${interviewToken}`)
      .field('questionId', thirdQuestion.id)
      .field('transcription', 'The mobile app is frustratingly slow and crashes frequently. I wish it was as reliable as the desktop version.')
      .attach('audioFile', audioFilePath);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('responseId');
  });

  test('6. Participant can complete the interview session', async () => {
    const response = await request(app)
      .post(`/api/respondent/complete-interview`)
      .set('Authorization', `Bearer ${interviewToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Interview completed');
  });

  test('7. Participant cannot access interview after completion', async () => {
    // Try to access the interview session again with the same token
    const response = await request(app)
      .get(`/api/respondent/interview-session`)
      .set('Authorization', `Bearer ${interviewToken}`);
    
    // Should return an error or indicate the interview is already completed
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('completed');
  });
});
