/**
 * Airtable OAuth Service
 * Handles OAuth authentication flow for Airtable integration
 */

const { AuthorizationCode } = require('simple-oauth2');
const crypto = require('crypto-js');
const logger = require('../utils/logger');
const db = require('../utils/db');

class AirtableOAuthService {
  constructor() {
    this.config = {
      client: {
        id: process.env.AIRTABLE_CLIENT_ID,
        secret: process.env.AIRTABLE_CLIENT_SECRET
      },
      auth: {
        tokenHost: 'https://airtable.com',
        tokenPath: '/oauth2/v1/token',
        authorizeHost: 'https://airtable.com',
        authorizePath: '/oauth2/v1/authorize'
      }
    };
    
    this.redirectUri = process.env.AIRTABLE_REDIRECT_URI;
    this.scope = 'data.records:read data.records:write schema.bases:read';
    this.client = new AuthorizationCode(this.config);
  }

  /**
   * Generate a random string for state parameter
   * @returns {string} Random state string
   */
  generateState() {
    return crypto.lib.WordArray.random(32).toString();
  }

  /**
   * Generate a random string for code verifier
   * @returns {string} Random code verifier string
   */
  generateCodeVerifier() {
    return crypto.lib.WordArray.random(64).toString();
  }

  /**
   * Generate code challenge from code verifier using SHA-256
   * @param {string} codeVerifier - Code verifier string
   * @returns {string} Code challenge string
   */
  generateCodeChallenge(codeVerifier) {
    const hash = crypto.SHA256(codeVerifier);
    return hash.toString(crypto.enc.Base64)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Get authorization URL for OAuth flow
   * @param {string} state - State parameter for CSRF protection
   * @param {string} codeChallenge - Code challenge for PKCE
   * @returns {string} Authorization URL
   */
  getAuthorizationUrl(state, codeChallenge) {
    logger.info('Generating Airtable authorization URL');
    
    return this.client.authorizeURL({
      redirect_uri: this.redirectUri,
      scope: this.scope,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code
   * @param {string} codeVerifier - Code verifier for PKCE
   * @returns {Promise<Object>} Token response
   */
  async getTokenFromCode(code, codeVerifier) {
    try {
      logger.info('Exchanging authorization code for access token');
      
      const tokenParams = {
        code,
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier
      };
      
      const result = await this.client.getToken(tokenParams);
      const token = result.token.token;
      
      // Add created_at timestamp if not present
      if (!token.created_at) {
        token.created_at = Math.floor(Date.now() / 1000);
      }
      
      logger.info('Successfully obtained access token');
      return token;
    } catch (error) {
      logger.error(`Token Exchange Error: ${error.message}`);
      throw new Error(`Failed to exchange code for token: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New token response
   */
  async refreshToken(refreshToken) {
    try {
      logger.info('Refreshing access token');
      
      const refreshTokenObj = this.client.createToken({
        refresh_token: refreshToken,
        expires_at: null
      });
      
      const newToken = await refreshTokenObj.refresh();
      const token = newToken.token;
      
      // Add created_at timestamp if not present
      if (!token.created_at) {
        token.created_at = Math.floor(Date.now() / 1000);
      }
      
      logger.info('Successfully refreshed access token');
      return token;
    } catch (error) {
      logger.error(`Token Refresh Error: ${error.message}`);
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Check if token is expired
   * @param {Object} token - Token object
   * @returns {boolean} True if token is expired
   */
  isTokenExpired(token) {
    if (!token || !token.access_token || !token.expires_in || !token.created_at) {
      return true;
    }
    
    const expiryTime = token.created_at + token.expires_in;
    // Add a 5-minute buffer to prevent edge cases
    return (Math.floor(Date.now() / 1000) + 300) >= expiryTime;
  }

  /**
   * Store OAuth state and code verifier in database
   * @param {string} userId - User ID
   * @param {string} state - State parameter
   * @param {string} codeVerifier - Code verifier
   * @returns {Promise<void>}
   */
  async storeOAuthState(userId, state, codeVerifier) {
    try {
      logger.info(`Storing OAuth state for user: ${userId}`);
      
      // Encrypt code verifier for additional security
      const encryptedCodeVerifier = crypto.AES.encrypt(
        codeVerifier,
        process.env.ENCRYPTION_KEY
      ).toString();
      
      await db.collection('oauth_states').updateOne(
        { userId },
        { 
          $set: { 
            state,
            codeVerifier: encryptedCodeVerifier,
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
      
      logger.info(`OAuth state stored for user: ${userId}`);
    } catch (error) {
      logger.error(`Store OAuth State Error: ${error.message}`);
      throw new Error(`Failed to store OAuth state: ${error.message}`);
    }
  }

  /**
   * Retrieve and verify OAuth state from database
   * @param {string} userId - User ID
   * @param {string} state - State parameter to verify
   * @returns {Promise<string>} Code verifier if state is valid
   */
  async verifyAndGetCodeVerifier(userId, state) {
    try {
      logger.info(`Verifying OAuth state for user: ${userId}`);
      
      const oauthState = await db.collection('oauth_states').findOne({ userId });
      
      if (!oauthState) {
        logger.error(`No OAuth state found for user: ${userId}`);
        throw new Error('No OAuth state found');
      }
      
      if (oauthState.state !== state) {
        logger.error(`OAuth state mismatch for user: ${userId}`);
        throw new Error('OAuth state mismatch');
      }
      
      // Decrypt code verifier
      const decryptedCodeVerifier = crypto.AES.decrypt(
        oauthState.codeVerifier,
        process.env.ENCRYPTION_KEY
      ).toString(crypto.enc.Utf8);
      
      // Clean up the used state
      await db.collection('oauth_states').deleteOne({ userId });
      
      logger.info(`OAuth state verified for user: ${userId}`);
      return decryptedCodeVerifier;
    } catch (error) {
      logger.error(`Verify OAuth State Error: ${error.message}`);
      throw new Error(`Failed to verify OAuth state: ${error.message}`);
    }
  }

  /**
   * Store tokens in database
   * @param {string} userId - User ID
   * @param {Object} tokens - Token object
   * @returns {Promise<void>}
   */
  async storeTokens(userId, tokens) {
    try {
      logger.info(`Storing tokens for user: ${userId}`);
      
      // Encrypt refresh token for security
      const encryptedRefreshToken = crypto.AES.encrypt(
        tokens.refresh_token,
        process.env.ENCRYPTION_KEY
      ).toString();
      
      await db.collection('oauth_tokens').updateOne(
        { userId },
        {
          $set: {
            accessToken: tokens.access_token,
            refreshToken: encryptedRefreshToken,
            expiresIn: tokens.expires_in,
            createdAt: tokens.created_at || Math.floor(Date.now() / 1000),
            scope: tokens.scope,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
      
      logger.info(`Tokens stored for user: ${userId}`);
    } catch (error) {
      logger.error(`Store Tokens Error: ${error.message}`);
      throw new Error(`Failed to store tokens: ${error.message}`);
    }
  }

  /**
   * Get tokens from database
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Token object
   */
  async getTokens(userId) {
    try {
      logger.info(`Getting tokens for user: ${userId}`);
      
      const tokenDoc = await db.collection('oauth_tokens').findOne({ userId });
      
      if (!tokenDoc) {
        logger.warn(`No tokens found for user: ${userId}`);
        return null;
      }
      
      // Decrypt refresh token
      const decryptedRefreshToken = crypto.AES.decrypt(
        tokenDoc.refreshToken,
        process.env.ENCRYPTION_KEY
      ).toString(crypto.enc.Utf8);
      
      const tokens = {
        access_token: tokenDoc.accessToken,
        refresh_token: decryptedRefreshToken,
        expires_in: tokenDoc.expiresIn,
        created_at: tokenDoc.createdAt,
        scope: tokenDoc.scope
      };
      
      logger.info(`Retrieved tokens for user: ${userId}`);
      return tokens;
    } catch (error) {
      logger.error(`Get Tokens Error: ${error.message}`);
      throw new Error(`Failed to get tokens: ${error.message}`);
    }
  }

  /**
   * Get valid access token, refreshing if necessary
   * @param {string} userId - User ID
   * @returns {Promise<string>} Valid access token
   */
  async getValidAccessToken(userId) {
    try {
      logger.info(`Getting valid access token for user: ${userId}`);
      
      const tokens = await this.getTokens(userId);
      
      if (!tokens) {
        logger.error(`No tokens found for user: ${userId}`);
        throw new Error('User not authenticated with Airtable');
      }
      
      // Check if token is expired
      if (this.isTokenExpired(tokens)) {
        logger.info(`Token expired for user: ${userId}, refreshing`);
        
        // Refresh token
        const newTokens = await this.refreshToken(tokens.refresh_token);
        
        // Store new tokens
        await this.storeTokens(userId, newTokens);
        
        logger.info(`Token refreshed for user: ${userId}`);
        return newTokens.access_token;
      }
      
      logger.info(`Using existing valid token for user: ${userId}`);
      return tokens.access_token;
    } catch (error) {
      logger.error(`Get Valid Access Token Error: ${error.message}`);
      throw new Error(`Failed to get valid access token: ${error.message}`);
    }
  }
}

module.exports = new AirtableOAuthService();
