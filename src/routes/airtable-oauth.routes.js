/**
 * Airtable OAuth Routes
 * API routes for Airtable OAuth authentication
 */

const express = require('express');
const router = express.Router();
const airtableOAuthController = require('../controllers/airtable-oauth.controller');
const auth = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(auth.authenticate);

// Initiate OAuth flow
router.get('/connect', airtableOAuthController.initiateOAuth);

// Handle OAuth callback
router.post('/callback', airtableOAuthController.handleCallback);

// Check authentication status
router.get('/status', airtableOAuthController.checkAuthStatus);

// Refresh access token
router.post('/refresh', airtableOAuthController.refreshToken);

// Revoke authentication
router.post('/revoke', airtableOAuthController.revokeAuth);

module.exports = router;
