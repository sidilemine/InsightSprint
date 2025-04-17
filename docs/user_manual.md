# Rapid Consumer Sentiment Analysis - User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Getting Started](#getting-started)
4. [Admin Dashboard Guide](#admin-dashboard-guide)
5. [Client Portal Guide](#client-portal-guide)
6. [Respondent Interface Guide](#respondent-interface-guide)
7. [Mixed Emotion-Language Analysis](#mixed-emotion-language-analysis)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)
10. [Technical Support](#technical-support)

## Introduction

Welcome to the Rapid Consumer Sentiment Analysis (RCSA) system, developed by Jade Kite. This comprehensive solution combines AI-moderated mini-qual interviews with advanced Voice Emotion Recognition technology to deliver deeper insights into consumer behavior and preferences.

This user manual provides detailed instructions for all three user interfaces:
- **Admin Dashboard**: For Jade Kite team members managing projects and analyses
- **Client Portal**: For clients viewing results and insights
- **Respondent Interface**: For interview participants

### Key Features

- **AI-moderated voice interviews** that capture authentic consumer responses
- **Dual-layer analysis** combining voice emotion recognition with language processing
- **Comprehensive visualization** of insights through interactive dashboards
- **Automated reporting** with actionable recommendations

## System Overview

The Rapid Consumer Sentiment Analysis system consists of five integrated components:

1. **Voiceform**: Handles voice interview collection and initial processing
2. **Hume AI**: Provides advanced emotion detection from voice recordings
3. **Gemini API**: Performs natural language processing and insight generation
4. **Airtable**: Manages centralized data storage and organization
5. **Insight7**: Creates AI-powered visualizations of open-ended responses

These components work together to create a seamless workflow from data collection to insight generation:

```
Voice Interviews → Emotion Detection → Language Analysis → Data Storage → Visualization → Insights
```

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Microphone (for respondents)
- Screen resolution of 1280x720 or higher

### Accessing the System

- **Admin Dashboard**: https://app.jadekite.com/admin
- **Client Portal**: https://app.jadekite.com/client
- **Respondent Interface**: Accessed via unique interview links

### Account Creation

1. **Admin Accounts**: Created by system administrators
2. **Client Accounts**: Created by admins for client access
3. **Respondent Access**: No account required, accessed via unique links

## Admin Dashboard Guide

The Admin Dashboard is the control center for managing all aspects of the Rapid Consumer Sentiment Analysis system.

### Dashboard Overview

The dashboard provides a high-level view of:
- Active projects
- Recent interviews
- Response rates
- Analysis status

### Project Management

#### Creating a New Project

1. Navigate to **Projects** → **Create New Project**
2. Enter project details:
   - Project name
   - Client information
   - Project description
   - Target audience
   - Product category
3. Click **Create Project**

#### Managing Existing Projects

From the Projects list, you can:
- View project details
- Edit project information
- Archive completed projects
- Clone existing projects

### Interview Management

#### Creating a New Interview

1. Navigate to **Interviews** → **Create New Interview**
2. Select the associated project
3. Enter interview details:
   - Interview title
   - Description
   - Estimated duration
4. Add questions:
   - Click **Add Question**
   - Enter question text
   - Select question type (open-ended, multiple choice, etc.)
   - Add any follow-up prompts
5. Configure AI moderation settings:
   - Select moderation style (neutral, conversational, etc.)
   - Set follow-up question parameters
   - Configure emotion detection sensitivity
6. Click **Create Interview**

#### Distributing Interviews

1. Navigate to the interview details page
2. Click **Distribution**
3. Choose distribution method:
   - Generate shareable links
   - Email to participant list
   - Embed on website
4. Set access parameters:
   - Interview availability window
   - Maximum responses
   - Access restrictions
5. Click **Start Distribution**

### Response Management

The Responses section allows you to:
- View all responses across projects
- Filter by project, date, or respondent demographics
- Listen to voice recordings
- Review transcriptions
- See emotion analysis results
- Export response data

### Analysis Management

#### Creating a New Analysis

1. Navigate to **Analyses** → **Create New Analysis**
2. Select the project and interviews to include
3. Configure analysis parameters:
   - Analysis title
   - Description
   - Analysis focus areas
   - Visualization preferences
4. Click **Generate Analysis**

#### Viewing Analysis Results

The Analysis Detail page provides:
- Emotional distribution visualization
- Language sentiment analysis
- Mixed emotion-language correlation
- Key themes identification
- Strategic recommendations

#### Sharing Analysis Results

1. Navigate to the analysis details page
2. Click **Share**
3. Choose sharing method:
   - Add client users
   - Generate shareable link
   - Export as PDF
4. Set access permissions
5. Click **Share Analysis**

## Client Portal Guide

The Client Portal provides clients with access to project results and insights.

### Dashboard Overview

The client dashboard shows:
- Active projects
- Recent analyses
- Key insights summary
- Notification center

### Viewing Projects

Clients can:
- See all their active projects
- View project details and status
- Access associated interviews and analyses

### Exploring Analyses

The Analysis Detail page provides clients with:
- Interactive visualizations
- Tabbed navigation between different analysis views
- Downloadable reports
- Actionable insights

### Understanding Mixed Analysis

The Mixed Analysis tab helps clients understand:
- How emotions correlate with language
- Where emotional contradictions exist
- Which themes trigger specific emotions
- Strategic recommendations based on the combined analysis

## Respondent Interface Guide

The Respondent Interface is designed to be intuitive and engaging for interview participants.

### Interview Process

1. **Landing Page**: Introduces the interview purpose and process
2. **Consent**: Obtains necessary permissions
3. **Interview Session**: Presents questions sequentially
4. **Voice Recording**: Allows respondents to record their answers
5. **Review**: Lets respondents review and re-record if needed
6. **Completion**: Confirms successful submission

### Voice Recording Tips

Advise respondents to:
- Find a quiet environment
- Speak naturally at a normal pace
- Position approximately 6-12 inches from the microphone
- Express thoughts and feelings honestly
- Elaborate on answers when possible

## Mixed Emotion-Language Analysis

The mixed emotion-language analysis is the core differentiator of the Rapid Consumer Sentiment Analysis system.

### How It Works

1. **Voice Emotion Recognition**: Hume AI analyzes voice recordings to detect:
   - Primary emotions (joy, surprise, sadness, anger, fear, disgust, neutral)
   - Emotional intensity
   - Emotional shifts during responses

2. **Language Processing**: Gemini API analyzes transcribed text to identify:
   - Sentiment (positive, negative, neutral)
   - Key themes and topics
   - Language patterns and word choice

3. **Correlation Analysis**: The system then correlates these two data streams to:
   - Identify alignment or misalignment between emotions and language
   - Detect hidden sentiments not expressed verbally
   - Measure emotional intensity relative to language strength
   - Connect specific themes with emotional responses

### Interpreting Results

#### Emotion-Language Correlation Chart

This stacked bar chart shows how each detected emotion correlates with language sentiment:
- **Aligned Responses**: When emotion and language match (e.g., joy with positive language)
- **Contradictory Responses**: When emotion and language differ (e.g., surprise with negative language)
- **Neutral Language with Emotion**: When neutral language masks emotional responses

#### Key Insights

The system automatically generates insights such as:
- **Emotional Contradictions**: Where voice emotion contradicts language sentiment
- **Hidden Dissatisfaction**: Where positive/neutral language masks negative emotions
- **Intensity vs. Language**: How emotional intensity correlates with language strength
- **Theme-Emotion Connections**: Which themes trigger specific emotional responses

#### Strategic Recommendations

Based on the mixed analysis, the system provides actionable recommendations:
- Prioritized improvement areas based on emotional intensity
- Communication strategies based on emotional responses
- Product development focus areas
- Marketing message optimization

## Troubleshooting

### Common Issues

#### Admin Dashboard

- **Analysis Generation Failure**: Check that all required data is available and retry
- **Interview Distribution Error**: Verify email addresses and distribution settings
- **Data Export Issues**: Ensure you have the necessary permissions

#### Client Portal

- **Visualization Not Loading**: Try refreshing the browser or clearing cache
- **Report Download Failure**: Check internet connection and try again
- **Access Restrictions**: Contact your Jade Kite representative

#### Respondent Interface

- **Microphone Access Denied**: Check browser permissions for microphone
- **Recording Failure**: Try using a different browser or device
- **Session Timeout**: Complete the interview in one sitting when possible

### Error Messages

| Error Code | Description | Solution |
|------------|-------------|----------|
| E001 | Authentication failure | Check credentials and try again |
| E002 | Permission denied | Contact administrator for access |
| E003 | Data processing error | Retry operation or contact support |
| E004 | Recording device not found | Check microphone connection |
| E005 | Network connection error | Check internet connection |

## FAQ

### General Questions

**Q: How long does it take to get results from an interview?**
A: Initial results are available within minutes of interview completion. Comprehensive analyses are typically ready within 24-48 hours, depending on the number of responses.

**Q: How accurate is the emotion detection?**
A: Hume AI's emotion detection has been validated to achieve over 85% accuracy across diverse demographics and accents.

**Q: Can the system handle multiple languages?**
A: Currently, the system supports English, Spanish, French, German, and Mandarin Chinese. Additional languages are being added regularly.

### Admin Questions

**Q: How many questions should an interview include?**
A: We recommend 5-7 questions for optimal respondent engagement and completion rates.

**Q: What's the recommended sample size?**
A: For qualitative insights, we recommend 20-30 respondents per demographic segment.

### Client Questions

**Q: Can we customize the analysis focus?**
A: Yes, admins can configure analysis parameters to focus on specific aspects of the feedback.

**Q: How do we share results with our team?**
A: Analyses can be shared via the platform, exported as PDFs, or presented in interactive dashboards.

### Respondent Questions

**Q: How long are interviews typically?**
A: Most interviews take 5-10 minutes to complete.

**Q: Is my personal information shared?**
A: Only demographic information relevant to the analysis is shared. Personal identifiers are removed unless explicitly permitted.

## Technical Support

For technical assistance, please contact:

- **Email**: support@jadekite.com
- **Phone**: (555) 123-4567
- **Hours**: Monday-Friday, 9am-5pm EST

When contacting support, please provide:
- Your username
- Project or interview ID (if applicable)
- Detailed description of the issue
- Screenshots if possible

---

© 2025 Jade Kite. All rights reserved.
