#!/usr/bin/env node

/**
 * Deployment script for Rapid Consumer Sentiment Analysis
 * Sets up and deploys the application
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../src/utils/logger');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

logger.info('Starting deployment process');

try {
  // Step 1: Install dependencies
  logger.info('Installing server dependencies');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  // Step 2: Install client dependencies
  logger.info('Installing client dependencies');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '../client') });
  
  // Step 3: Build client
  logger.info('Building client application');
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '../client') });
  
  // Step 4: Run tests
  logger.info('Running integration tests');
  execSync('node tests/run-tests.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  // Step 5: Start server
  logger.info('Starting server');
  execSync('npm start', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  logger.info('Deployment completed successfully');
} catch (error) {
  logger.error(`Deployment failed: ${error.message}`);
  process.exit(1);
}
