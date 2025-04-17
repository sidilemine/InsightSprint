require('dotenv').config();

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/rapid-sentiment',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1d',
  
  // External API keys
  VOICEFORM_API_KEY: process.env.VOICEFORM_API_KEY,
  VOICEFORM_API_URL: process.env.VOICEFORM_API_URL || 'https://api.voiceform.com/v1',
  
  HUME_AI_API_KEY: process.env.HUME_AI_API_KEY,
  HUME_AI_API_URL: process.env.HUME_AI_API_URL || 'https://api.hume.ai/v1',
  
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_API_URL: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1',
  
  AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  
  INSIGHT7_API_KEY: process.env.INSIGHT7_API_KEY,
  INSIGHT7_API_URL: process.env.INSIGHT7_API_URL,
  
  // Redis configuration
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // File storage
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100, // 100 requests per window
};
