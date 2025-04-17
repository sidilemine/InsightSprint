/**
 * Airtable OAuth Controller
 * Handles API endpoints for Airtable OAuth authentication
 */

const airtableOAuthService = require('../services/airtable-oauth.service');
const logger = require('../utils/logger');

class AirtableOAuthController {
  /**
   * Initiate OAuth flow
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async initiateOAuth(req, res) {
    try {
      const userId = req.user.id;
      
      // Generate state and code verifier
      const state = airtableOAuthService.generateState();
      const codeVerifier = airtableOAuthService.generateCodeVerifier();
      const codeChallenge = airtableOAuthService.generateCodeChallenge(codeVerifier);
      
      // Store state and code verifier
      await airtableOAuthService.storeOAuthState(userId, state, codeVerifier);
      
      // Generate authorization URL
      const authorizationUrl = airtableOAuthService.getAuthorizationUrl(state, codeChallenge);
      
      return res.status(200).json({
        success: true,
        data: {
          authorizationUrl,
          state
        }
      });
    } catch (error) {
      logger.error(`Initiate OAuth Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Handle OAuth callback
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async handleCallback(req, res) {
    try {
      const { code, state } = req.body;
      const userId = req.user.id;
      
      if (!code || !state) {
        return res.status(400).json({
          success: false,
          error: 'Code and state are required'
        });
      }
      
      // Verify state and get code verifier
      const codeVerifier = await airtableOAuthService.verifyAndGetCodeVerifier(userId, state);
      
      // Exchange code for tokens
      const tokens = await airtableOAuthService.getTokenFromCode(code, codeVerifier);
      
      // Store tokens
      await airtableOAuthService.storeTokens(userId, tokens);
      
      return res.status(200).json({
        success: true,
        data: {
          authenticated: true,
          scope: tokens.scope
        }
      });
    } catch (error) {
      logger.error(`Handle Callback Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Check authentication status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async checkAuthStatus(req, res) {
    try {
      const userId = req.user.id;
      
      // Get tokens
      const tokens = await airtableOAuthService.getTokens(userId);
      
      if (!tokens) {
        return res.status(200).json({
          success: true,
          data: {
            authenticated: false
          }
        });
      }
      
      // Check if token is expired
      const isExpired = airtableOAuthService.isTokenExpired(tokens);
      
      return res.status(200).json({
        success: true,
        data: {
          authenticated: true,
          isExpired,
          scope: tokens.scope
        }
      });
    } catch (error) {
      logger.error(`Check Auth Status Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Refresh access token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async refreshToken(req, res) {
    try {
      const userId = req.user.id;
      
      // Get valid access token (refreshes if necessary)
      const accessToken = await airtableOAuthService.getValidAccessToken(userId);
      
      return res.status(200).json({
        success: true,
        data: {
          authenticated: true
        }
      });
    } catch (error) {
      logger.error(`Refresh Token Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Revoke authentication
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async revokeAuth(req, res) {
    try {
      const userId = req.user.id;
      
      // Remove tokens from database
      await db.collection('oauth_tokens').deleteOne({ userId });
      
      return res.status(200).json({
        success: true,
        data: {
          authenticated: false
        }
      });
    } catch (error) {
      logger.error(`Revoke Auth Error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AirtableOAuthController();
