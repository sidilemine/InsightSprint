import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

/**
 * AirtableOAuthConnect Component
 * Handles connecting to Airtable via OAuth
 */
const AirtableOAuthConnect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [authStatus, setAuthStatus] = useState({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Check if already connected to Airtable
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/airtable-oauth/status');
        
        if (response.data.success) {
          setAuthStatus(response.data.data);
          setIsConnected(response.data.data.authenticated);
        }
      } catch (error) {
        console.error('Error checking Airtable auth status:', error);
        setError('Failed to check Airtable connection status');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Initiate OAuth flow
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.get('/api/airtable-oauth/connect');
      
      if (response.data.success) {
        // Store state in localStorage for verification after redirect
        localStorage.setItem('airtable_oauth_state', response.data.data.state);
        
        // Redirect to Airtable authorization page
        window.location.href = response.data.data.authorizationUrl;
      } else {
        setError('Failed to initiate Airtable connection');
      }
    } catch (error) {
      console.error('Error connecting to Airtable:', error);
      setError('Failed to connect to Airtable');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh token if expired
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.post('/api/airtable-oauth/refresh');
      
      if (response.data.success) {
        setAuthStatus({
          ...authStatus,
          isExpired: false
        });
        setIsConnected(true);
      } else {
        setError('Failed to refresh Airtable connection');
      }
    } catch (error) {
      console.error('Error refreshing Airtable connection:', error);
      setError('Failed to refresh Airtable connection');
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke connection
  const handleRevoke = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.post('/api/airtable-oauth/revoke');
      
      if (response.data.success) {
        setAuthStatus({
          authenticated: false
        });
        setIsConnected(false);
      } else {
        setError('Failed to revoke Airtable connection');
      }
    } catch (error) {
      console.error('Error revoking Airtable connection:', error);
      setError('Failed to revoke Airtable connection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>Airtable Connection</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {isLoading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {isConnected ? (
              <div>
                <Alert variant="success">
                  Connected to Airtable
                  {authStatus.scope && (
                    <div className="mt-2">
                      <small>Scope: {authStatus.scope}</small>
                    </div>
                  )}
                </Alert>
                
                {authStatus.isExpired && (
                  <Alert variant="warning">
                    Your Airtable connection has expired. Please refresh to continue using Airtable.
                  </Alert>
                )}
                
                <div className="d-flex gap-2">
                  {authStatus.isExpired && (
                    <Button 
                      variant="primary" 
                      onClick={handleRefresh}
                      disabled={isLoading}
                    >
                      Refresh Connection
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline-danger" 
                    onClick={handleRevoke}
                    disabled={isLoading}
                  >
                    Disconnect from Airtable
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p>Connect your Airtable account to store and manage your research data.</p>
                <Button 
                  variant="primary" 
                  onClick={handleConnect}
                  disabled={isLoading}
                >
                  Connect to Airtable
                </Button>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default AirtableOAuthConnect;
