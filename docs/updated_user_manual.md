# User Manual: Rapid Consumer Sentiment Analysis Service

## Overview

The Rapid Consumer Sentiment Analysis service is a comprehensive solution for conducting voice-based consumer research with advanced emotion and sentiment analysis. This updated version features:

- AssemblyAI integration for superior speech-to-text and sentiment analysis
- Secure Airtable OAuth authentication for data storage
- In-house visualization solution with advanced charts and insights

This manual provides instructions for setting up, configuring, and using the service.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Using the Service](#using-the-service)
5. [API Reference](#api-reference)
6. [Troubleshooting](#troubleshooting)

## System Requirements

- Node.js 16.x or higher
- MongoDB 4.4 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Microphone access for audio recording

## Installation

### Option 1: Local Development

1. Clone the repository:
   ```
   git clone https://github.com/your-organization/rapid-sentiment-analysis.git
   cd rapid-sentiment-analysis
   ```

2. Install server dependencies:
   ```
   npm install
   ```

3. Install client dependencies:
   ```
   cd client
   npm install
   cd ..
   ```

4. Create a `.env` file based on `.env.example` and configure your environment variables.

5. Start the development server:
   ```
   npm run dev
   ```

### Option 2: Production Deployment

1. Clone the repository:
   ```
   git clone https://github.com/your-organization/rapid-sentiment-analysis.git
   cd rapid-sentiment-analysis
   ```

2. Run the deployment script:
   ```
   node scripts/deploy.js
   ```

## Configuration

### Required API Keys

The service requires the following API keys:

1. **AssemblyAI API Key**
   - Sign up at [https://www.assemblyai.com/](https://www.assemblyai.com/)
   - Create an API key in your dashboard
   - Add to `.env` as `ASSEMBLYAI_API_KEY`

2. **Airtable OAuth Credentials**
   - Register an OAuth application at [https://airtable.com/developers/web/apps](https://airtable.com/developers/web/apps)
   - Configure the redirect URI to `http://your-domain.com/api/airtable-oauth/callback`
   - Add Client ID and Secret to `.env` as `AIRTABLE_CLIENT_ID` and `AIRTABLE_CLIENT_SECRET`

3. **Gemini API Key**
   - Sign up for Google AI Studio at [https://ai.google.dev/](https://ai.google.dev/)
   - Create an API key
   - Add to `.env` as `GEMINI_API_KEY`

### Environment Variables

Configure the following environment variables in your `.env` file:

```
# Server configuration
PORT=3000
NODE_ENV=production

# Database configuration
MONGO_URI=mongodb://localhost:27017/rapid-sentiment-analysis

# JWT configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# AssemblyAI configuration
ASSEMBLYAI_API_KEY=your-assemblyai-api-key

# Airtable OAuth configuration
AIRTABLE_CLIENT_ID=your-airtable-client-id
AIRTABLE_CLIENT_SECRET=your-airtable-client-secret
AIRTABLE_REDIRECT_URI=http://your-domain.com/api/airtable-oauth/callback

# Gemini API configuration
GEMINI_API_KEY=your-gemini-api-key

# Encryption configuration
ENCRYPTION_KEY=your-encryption-key
```

## Using the Service

### User Registration and Login

1. Navigate to the application URL
2. Click "Register" to create a new account
3. Verify your email address if required
4. Log in with your credentials

### Connecting to Airtable

1. Go to "Settings" > "Integrations"
2. Click "Connect to Airtable"
3. Authorize the application in the Airtable OAuth window
4. Confirm the connection was successful

### Creating a Project

1. Navigate to "Projects" and click "New Project"
2. Enter project details:
   - Name
   - Description
   - Client information
   - Research objectives
3. Click "Create Project"

### Setting Up Interviews

1. Open your project
2. Go to the "Interviews" tab and click "New Interview"
3. Configure interview settings:
   - Name
   - Discussion guide
   - Participant information
   - Schedule
4. Click "Create Interview"

### Recording and Analyzing Responses

1. Open an interview
2. Click "Record Response" or share the participant link
3. Use the Audio Recorder to capture responses:
   - Click "Start Recording"
   - Ask the question
   - Click "Stop Recording" when finished
   - Click "Process Audio" to analyze
4. Wait for processing to complete (typically 30-60 seconds)

### Viewing Analysis and Visualizations

1. Navigate to "Analyses" for a project or interview
2. Select an analysis to view
3. Explore the visualization dashboard:
   - Sentiment Analysis tab: View sentiment changes over time
   - Emotion Distribution tab: See breakdown of emotions
   - Key Topics tab: Explore important themes and topics
   - Word Frequency tab: Identify commonly used words
   - Insights tab: Review AI-generated insights and recommendations

### Exporting Data

1. From any analysis view, click "Export"
2. Choose your preferred format:
   - PDF Report
   - CSV Data
   - JSON Data
   - Airtable Sync
3. Configure export options and click "Export"

## API Reference

### Authentication Endpoints

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Authenticate and receive JWT token
- `POST /api/auth/refresh`: Refresh JWT token
- `GET /api/auth/me`: Get current user information

### AssemblyAI Endpoints

- `POST /api/assemblyai/transcribe`: Transcribe audio from URL
- `POST /api/assemblyai/upload`: Upload audio file
- `GET /api/assemblyai/transcription/:id`: Get transcription status and results
- `GET /api/assemblyai/transcription/:id/wait`: Wait for transcription to complete
- `POST /api/assemblyai/insights`: Generate insights using LeMUR
- `POST /api/assemblyai/process`: Process audio file end-to-end

### Airtable OAuth Endpoints

- `GET /api/airtable-oauth/connect`: Initiate OAuth flow
- `POST /api/airtable-oauth/callback`: Handle OAuth callback
- `GET /api/airtable-oauth/status`: Check authentication status
- `POST /api/airtable-oauth/refresh`: Refresh access token
- `POST /api/airtable-oauth/revoke`: Revoke authentication

### Visualization Endpoints

- `POST /api/visualization/analyze`: Analyze transcription with sentiment data
- `POST /api/visualization/generate`: Generate visualization data
- `GET /api/visualization/analysis/:id`: Get analysis by ID
- `GET /api/visualization/data/:id`: Get visualization data by ID
- `POST /api/visualization/process`: Process complete analysis and visualization workflow

### Project Management Endpoints

- `GET /api/projects`: Get all projects
- `POST /api/projects`: Create a new project
- `GET /api/projects/:id`: Get project by ID
- `PUT /api/projects/:id`: Update project
- `DELETE /api/projects/:id`: Delete project

### Interview Management Endpoints

- `GET /api/interviews`: Get all interviews
- `POST /api/interviews`: Create a new interview
- `GET /api/interviews/:id`: Get interview by ID
- `PUT /api/interviews/:id`: Update interview
- `DELETE /api/interviews/:id`: Delete interview

### Response Management Endpoints

- `GET /api/responses`: Get all responses
- `POST /api/responses`: Create a new response
- `GET /api/responses/:id`: Get response by ID
- `PUT /api/responses/:id`: Update response
- `DELETE /api/responses/:id`: Delete response

## Troubleshooting

### Common Issues

1. **Audio Recording Issues**
   - Ensure microphone permissions are granted in your browser
   - Try using Chrome or Firefox for best compatibility
   - Check that your microphone is working properly

2. **Transcription Errors**
   - Ensure audio is clear and has minimal background noise
   - Check that the audio format is supported (MP3, WAV, M4A)
   - Verify your AssemblyAI API key is valid and has sufficient credits

3. **Airtable Connection Issues**
   - Confirm your OAuth credentials are correct
   - Ensure the redirect URI matches exactly what's configured in Airtable
   - Check that your Airtable account has the necessary permissions

4. **Visualization Not Loading**
   - Verify your Gemini API key is valid
   - Check browser console for JavaScript errors
   - Ensure the analysis data is complete and properly formatted

### Getting Help

If you encounter issues not covered in this manual:

1. Check the logs in the `logs/` directory
2. Review the API response for error messages
3. Contact support at support@jadekite.com with:
   - Detailed description of the issue
   - Steps to reproduce
   - Error messages or screenshots
   - Environment information (browser, OS, etc.)

---

© 2025 Jade Kite. All rights reserved.
