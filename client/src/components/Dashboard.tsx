import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { 
  Assessment as AssessmentIcon,
  Insights as InsightsIcon,
  Assignment as AssignmentIcon,
  QuestionAnswer as QuestionAnswerIcon,
  TrendingUp as TrendingUpIcon,
  SentimentSatisfiedAlt as SentimentIcon,
  TextFields as TextFieldsIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, this would fetch data from the API
        // For now, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockDashboardData = {
          projects: [
            {
              id: 'project-1',
              name: 'Beverage Product Testing',
              status: 'active',
              interviewsCount: 5,
              responsesCount: 12,
              analysesCount: 3,
              lastUpdated: '2025-04-15T14:30:00Z'
            },
            {
              id: 'project-2',
              name: 'Snack Packaging Feedback',
              status: 'active',
              interviewsCount: 3,
              responsesCount: 9,
              analysesCount: 2,
              lastUpdated: '2025-04-13T10:15:00Z'
            }
          ],
          recentAnalyses: [
            {
              id: 'analysis-1',
              projectId: 'project-1',
              projectName: 'Beverage Product Testing',
              type: 'interview',
              sourceName: 'Interview with Participant 101',
              createdAt: '2025-04-12T14:30:00Z',
              emotionSummary: {
                primary: 'Interest',
                score: 0.72
              },
              textSummary: {
                sentiment: 'positive',
                score: 0.78
              }
            },
            {
              id: 'analysis-3',
              projectId: 'project-2',
              projectName: 'Snack Packaging Feedback',
              type: 'interview',
              sourceName: 'Interview with Participant 201',
              createdAt: '2025-04-13T10:15:00Z',
              emotionSummary: {
                primary: 'Joy',
                score: 0.78
              },
              textSummary: {
                sentiment: 'positive',
                score: 0.85
              }
            }
          ],
          upcomingInterviews: [
            {
              id: 'interview-5',
              projectId: 'project-1',
              projectName: 'Beverage Product Testing',
              participantId: 'part-105',
              participantName: 'Participant 105',
              scheduledAt: '2025-04-18T11:00:00Z',
              status: 'scheduled'
            },
            {
              id: 'interview-6',
              projectId: 'project-2',
              projectName: 'Snack Packaging Feedback',
              participantId: 'part-203',
              participantName: 'Participant 203',
              scheduledAt: '2025-04-19T14:30:00Z',
              status: 'scheduled'
            }
          ],
          insights: [
            {
              id: 'insight-1',
              projectId: 'project-1',
              projectName: 'Beverage Product Testing',
              text: 'Strong interest in natural ingredients and sustainable packaging across all participants',
              type: 'trend',
              confidence: 0.85
            },
            {
              id: 'insight-2',
              projectId: 'project-1',
              projectName: 'Beverage Product Testing',
              text: 'Voice emotion analysis reveals stronger enthusiasm than text responses alone would indicate',
              type: 'emotion',
              confidence: 0.78
            },
            {
              id: 'insight-3',
              projectId: 'project-2',
              projectName: 'Snack Packaging Feedback',
              text: 'Bold colors and clear product imagery generated consistently positive emotional responses',
              type: 'design',
              confidence: 0.82
            }
          ]
        };
        
        setDashboardData(mockDashboardData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAnalysisTypeLabel = (type) => {
    switch (type) {
      case 'interview':
        return 'Interview Analysis';
      case 'response':
        return 'Response Analysis';
      case 'project':
        return 'Project Analysis';
      default:
        return 'Analysis';
    }
  };

  const getAnalysisTypeColor = (type) => {
    switch (type) {
      case 'interview':
        return 'primary';
      case 'response':
        return 'secondary';
      case 'project':
        return 'success';
      default:
        return 'default';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'neutral':
      case 'mixed':
        return 'info';
      case 'negative':
        return 'error';
      default:
        return 'default';
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'trend':
        return <TrendingUpIcon color="primary" />;
      case 'emotion':
        return <SentimentIcon color="secondary" />;
      case 'design':
        return <InsightsIcon color="success" />;
      default:
        return <InsightsIcon />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Client Dashboard
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Projects Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Your Projects
              </Typography>
              
              <Button 
                variant="text" 
                component={Link} 
                to="/client/projects"
              >
                View All
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {dashboardData.projects.map((project) => (
                <Grid item xs={12} md={6} key={project.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {project.name}
                      </Typography>
                      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Last updated: {formatDate(project.lastUpdated)}
                        </Typography>
                        
                        <Chip 
                          label={project.status.charAt(0).toUpperCase() + project.status.slice(1)} 
                          color="primary" 
                          size="small"
                        />
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={4}>
                          <Box textAlign="center">
                            <Typography variant="h5" color="primary">
                              {project.interviewsCount}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Interviews
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Box textAlign="center">
                            <Typography variant="h5" color="primary">
                              {project.responsesCount}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Responses
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Box textAlign="center">
                            <Typography variant="h5" color="primary">
                              {project.analysesCount}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Analyses
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box display="flex" justifyContent="flex-end" mt={2}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          component={Link}
                          to={`/client/projects/${project.id}`}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        
        {/* Recent Analyses */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Recent Analyses
              </Typography>
              
              <Button 
                variant="text" 
                component={Link} 
                to="/client/analyses"
              >
                View All
              </Button>
            </Box>
            
            {dashboardData.recentAnalyses.length > 0 ? (
              <List>
                {dashboardData.recentAnalyses.map((analysis) => (
                  <React.Fragment key={analysis.id}>
                    <ListItem 
                      component={Link}
                      to={`/client/analyses/${analysis.id}`}
                      sx={{ 
                        display: 'block', 
                        textDecoration: 'none', 
                        color: 'inherit',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          borderRadius: 1
                        }
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Chip 
                          label={getAnalysisTypeLabel(analysis.type)} 
                          size="small" 
                          color={getAnalysisTypeColor(analysis.type)}
                        />
                        
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(analysis.createdAt)}
                        </Typography>
                      </Box>
                      
                      <Typography variant="subtitle1">
                        {analysis.sourceName}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Project: {analysis.projectName}
                      </Typography>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Primary Emotion
                          </Typography>
                          <Chip 
                            icon={<SentimentIcon fontSize="small" />}
                            label={`${analysis.emotionSummary.primary} (${Math.round(analysis.emotionSummary.score * 100)}%)`} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" align="right">
                            Sentiment
                          </Typography>
                          <Chip 
                            label={`${analysis.textSummary.sentiment.charAt(0).toUpperCase() + analysis.textSummary.sentiment.slice(1)} (${Math.round(analysis.textSummary.score * 100)}%)`} 
                            size="small"
                            color={getSentimentColor(analysis.textSummary.sentiment)}
                          />
                        </Box>
                      </Box>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={3}>
                <Typography variant="body1" color="text.secondary">
                  No recent analyses available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Upcoming Interviews */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Upcoming Interviews
              </Typography>
              
              <Button 
                variant="text" 
                component={Link} 
                to="/client/interviews"
              >
                View All
              </Button>
            </Box>
            
            {dashboardData.upcomingInterviews.length > 0 ? (
              <List>
                {dashboardData.upcomingInterviews.map((interview) => (
                  <React.Fragment key={interview.id}>
                    <ListItem 
                      component={Link}
                      to={`/client/interviews/${interview.id}`}
                      sx={{ 
                        display: 'block', 
                        textDecoration: '
(Content truncated due to size limit. Use line ranges to read in chunks)