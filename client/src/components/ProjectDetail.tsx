import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  Assessment as AssessmentIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Insights as InsightsIcon,
  SentimentSatisfiedAlt as SentimentIcon,
  TextFields as TextFieldsIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [project, setProject] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, this would fetch data from the API
        // For now, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockProject = {
          id: projectId,
          name: 'Beverage Product Testing',
          description: 'Consumer testing for new beverage product line with focus on taste, packaging, and brand perception.',
          status: 'active',
          createdAt: '2025-04-01T10:00:00Z',
          lastUpdated: '2025-04-15T14:30:00Z',
          clientName: 'Refresh Beverages Inc.',
          tags: ['beverage', 'product testing', 'consumer feedback'],
          objectives: [
            'Evaluate consumer perception of new beverage flavors',
            'Assess packaging design appeal and functionality',
            'Measure brand perception and alignment with target demographics',
            'Identify potential barriers to purchase'
          ],
          interviews: [
            {
              id: 'interview-1',
              title: 'Interview with Participant 101',
              participantId: 'part-101',
              participantName: 'Participant 101',
              status: 'completed',
              scheduledAt: '2025-04-05T10:00:00Z',
              completedAt: '2025-04-05T10:45:00Z',
              duration: 45,
              hasAnalysis: true
            },
            {
              id: 'interview-2',
              title: 'Interview with Participant 102',
              participantId: 'part-102',
              participantName: 'Participant 102',
              status: 'completed',
              scheduledAt: '2025-04-06T14:00:00Z',
              completedAt: '2025-04-06T14:50:00Z',
              duration: 50,
              hasAnalysis: true
            },
            {
              id: 'interview-3',
              title: 'Interview with Participant 103',
              participantId: 'part-103',
              participantName: 'Participant 103',
              status: 'completed',
              scheduledAt: '2025-04-07T11:30:00Z',
              completedAt: '2025-04-07T12:15:00Z',
              duration: 45,
              hasAnalysis: true
            },
            {
              id: 'interview-4',
              title: 'Interview with Participant 104',
              participantId: 'part-104',
              participantName: 'Participant 104',
              status: 'completed',
              scheduledAt: '2025-04-10T09:00:00Z',
              completedAt: '2025-04-10T09:40:00Z',
              duration: 40,
              hasAnalysis: false
            },
            {
              id: 'interview-5',
              title: 'Interview with Participant 105',
              participantId: 'part-105',
              participantName: 'Participant 105',
              status: 'scheduled',
              scheduledAt: '2025-04-18T11:00:00Z',
              completedAt: null,
              duration: null,
              hasAnalysis: false
            }
          ],
          analyses: [
            {
              id: 'analysis-1',
              title: 'Analysis of Participant 101 Interview',
              sourceId: 'interview-1',
              sourceName: 'Interview with Participant 101',
              type: 'interview',
              createdAt: '2025-04-06T09:30:00Z',
              status: 'completed',
              emotionSummary: {
                primary: 'Interest',
                score: 0.72,
                secondary: 'Satisfaction',
                secondaryScore: 0.58
              },
              textSummary: {
                sentiment: 'positive',
                score: 0.78,
                keyThemes: ['flavor profile', 'packaging design', 'brand perception']
              }
            },
            {
              id: 'analysis-2',
              title: 'Analysis of Participant 102 Interview',
              sourceId: 'interview-2',
              sourceName: 'Interview with Participant 102',
              type: 'interview',
              createdAt: '2025-04-07T10:15:00Z',
              status: 'completed',
              emotionSummary: {
                primary: 'Interest',
                score: 0.65,
                secondary: 'Surprise',
                secondaryScore: 0.42
              },
              textSummary: {
                sentiment: 'mixed',
                score: 0.55,
                keyThemes: ['taste preferences', 'packaging functionality', 'price point']
              }
            },
            {
              id: 'analysis-3',
              title: 'Analysis of Participant 103 Interview',
              sourceId: 'interview-3',
              sourceName: 'Interview with Participant 103',
              type: 'interview',
              createdAt: '2025-04-08T13:45:00Z',
              status: 'completed',
              emotionSummary: {
                primary: 'Satisfaction',
                score: 0.81,
                secondary: 'Interest',
                secondaryScore: 0.67
              },
              textSummary: {
                sentiment: 'positive',
                score: 0.85,
                keyThemes: ['flavor enjoyment', 'brand alignment', 'purchase intent']
              }
            }
          ],
          insights: [
            {
              id: 'insight-1',
              text: 'Strong interest in natural ingredients and sustainable packaging across all participants',
              type: 'trend',
              confidence: 0.85,
              createdAt: '2025-04-10T15:30:00Z',
              sourcesCount: 3
            },
            {
              id: 'insight-2',
              text: 'Voice emotion analysis reveals stronger enthusiasm than text responses alone would indicate',
              type: 'emotion',
              confidence: 0.78,
              createdAt: '2025-04-11T09:45:00Z',
              sourcesCount: 3
            },
            {
              id: 'insight-3',
              text: 'Participants showed higher emotional engagement when discussing flavor profiles compared to packaging',
              type: 'comparison',
              confidence: 0.72,
              createdAt: '2025-04-12T11:15:00Z',
              sourcesCount: 3
            },
            {
              id: 'insight-4',
              text: 'Participants expressed interest in seasonal flavor variations, with voice emotion indicating excitement',
              type: 'opportunity',
              confidence: 0.68,
              createdAt: '2025-04-13T14:00:00Z',
              sourcesCount: 2
            }
          ]
        };
        
        setProject(mockProject);
        setLoading(false);
      } catch (err) {
        setError('Failed to load project details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [projectId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'success';
      case 'scheduled':
        return 'primary';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'trend':
        return <BarChartIcon color="primary" />;
      case 'emotion':
        return <SentimentIcon color="secondary" />;
      case 'comparison':
        return <AssessmentIcon color="info" />;
      case 'opportunity':
        return <InsightsIcon color="success" />;
      default:
        return <InsightsIcon />;
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
      {project && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              {project.name}
            </Typography>
            
            <Chip 
              label={project.status.charAt(0).toUpperCase() + project.status.slice(1)} 
              color={getStatusColor(project.status)} 
            />
          </Box>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Overview
            </Typography>
            
            <Typography variant="body1" paragraph>
              {project.description}
            </Typography>
            
            <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
              {project.tags.map((tag, index) => (
                <Chip 
                  key={index}
                  label={tag} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Client
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {project.clientName}
                  </Typography>
                </Box>
                
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(project.createdAt)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(project.lastUpdated)}
                  </Typography>
                </Box>
                
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Project Objectives
              </Typography>
              
              <List>
                {project.objectives.map((objective, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={objective} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
          
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Interviews" icon={<QuestionAnswerIcon />} iconPosition="start" />
              <Tab label="Analyses" icon={<AssessmentIcon />} iconPosition="start" />
              <Tab label="Insights" icon={<InsightsIcon />} iconPosition="start" />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Interviews ({project.interviews.length})
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Interview</TableCell>
                      <TableCell>Participant</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Scheduled</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Analysis</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {project.interviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell>{interview.title}</TableCell>
                        <TableCell>{interview.participantName}</TableCell>
                        <TableCell>
                          <Chip 
                            label={interview.status.charAt(0).toUpperCase() + interview.status.slice(1)} 
                            color={getStatusColor(interview.status)} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(interview.scheduledAt)}</TableCell>
                        <TableCell>
                          {interview.duration ? `${interview.duration} min` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {interview.hasAnalysis ? (
                            <Chip 
                              label="Available" 
                              color="success" 
                              size="small"
                            />
                          ) : (
                            <Chip 
                              label="Not Available" 
                              color="default" 
                              size="small"
                            />
   
(Content truncated due to size limit. Use line ranges to read in chunks)