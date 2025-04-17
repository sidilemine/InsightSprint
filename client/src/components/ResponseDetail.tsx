import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  Chip, 
  Divider, 
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  Send as SendIcon,
  QuestionAnswer as QuestionAnswerIcon,
  InsightsOutlined as InsightsIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  SentimentSatisfiedAlt as SentimentIcon,
  TextFields as TextFieldsIcon
} from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';

const ResponseDetail = () => {
  const { responseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);
  
  useEffect(() => {
    const fetchResponseDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, this would fetch data from the API
        // For now, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockResponse = {
          id: responseId,
          interviewId: 'interview-1',
          projectId: 'project-1',
          projectName: 'Beverage Product Testing',
          participantId: 'part-101',
          questionId: 1,
          questionText: 'What are your first impressions of this new beverage concept?',
          responseType: 'open_ended',
          responseText: "I'm intrigued by the natural ingredients and the sustainable packaging. The colors are vibrant and appealing. It looks refreshing and I'd be curious to try it.",
          audioUrl: '/audio/response-1.mp3',
          duration: 28, // seconds
          completedAt: '2025-04-12T10:15:00Z',
          emotionAnalysis: {
            primary: 'Interest',
            secondary: 'Joy',
            emotions: [
              { name: 'Interest', score: 0.72 },
              { name: 'Joy', score: 0.45 },
              { name: 'Surprise', score: 0.23 },
              { name: 'Skepticism', score: 0.12 },
              { name: 'Confusion', score: 0.08 }
            ]
          },
          textAnalysis: {
            sentiment: 'positive',
            score: 0.78,
            keywords: ['natural ingredients', 'sustainable packaging', 'vibrant', 'appealing', 'refreshing'],
            themes: ['Product Appearance', 'Sustainability', 'Natural Ingredients']
          },
          mixedAnalysis: {
            insights: [
              "The participant shows genuine interest in the product concept, with voice emotion analysis confirming the positive sentiment expressed in their words.",
              "While verbally expressing excitement about the sustainable packaging, their voice revealed underlying curiosity, suggesting a desire to learn more about the sustainability claims.",
              "The emotional response was strongest when discussing product appearance, suggesting this is an important product attribute for this consumer."
            ],
            recommendations: [
              "Emphasize natural ingredients and sustainability in marketing materials to align with the participant's strongest positive emotional responses.",
              "Provide more detailed information about the sustainability aspects of the packaging to satisfy the detected curiosity.",
              "Maintain the vibrant visual design as it generated strong positive emotional responses."
            ]
          }
        };
        
        setResponse(mockResponse);
        setLoading(false);
      } catch (err) {
        setError('Failed to load response details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchResponseDetails();
  }, [responseId]);
  
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
  
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'neutral':
        return 'info';
      case 'negative':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Define LinearProgress component for use in the component
  const LinearProgress = ({ variant, value, sx }) => {
    return (
      <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: sx?.borderRadius || 0, ...sx }}>
        <Box
          sx={{
            width: `${value}%`,
            height: sx?.height || 4,
            bgcolor: 'primary.main',
            borderRadius: sx?.borderRadius || 0,
          }}
        />
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : response ? (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              Response Details
            </Typography>
            
            <Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                component={Link}
                to={`/admin/responses/${response.id}/edit`}
                sx={{ mr: 1 }}
              >
                Edit Notes
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AssessmentIcon />}
                component={Link}
                to={`/admin/responses/${response.id}/analysis`}
              >
                View Analysis
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <QuestionAnswerIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5">
                    Question
                  </Typography>
                </Box>
                
                <Typography variant="body1" paragraph>
                  {response.questionText}
                </Typography>
                
                <Box display="flex" flexWrap="wrap" gap={1}>
                  <Chip 
                    label={`Project: ${response.projectName}`} 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Participant: ${response.participantId}`} 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Type: ${response.responseType.replace('_', ' ').charAt(0).toUpperCase() + response.responseType.replace('_', ' ').slice(1)}`} 
                    variant="outlined"
                  />
                </Box>
              </Paper>
              
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <RecordVoiceOverIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5">
                    Voice Response
                  </Typography>
                </Box>
                
                <Box mb={3}>
                  <audio 
                    controls 
                    src={response.audioUrl}
                    style={{ width: '100%' }}
                  >
                    Your browser does not support the audio element.
                  </audio>
                  <Typography variant="body2" color="text.secondary" align="right">
                    Duration: {formatDuration(response.duration)}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Emotion Analysis
                </Typography>
                
                <Box display="flex" gap={1} mb={3}>
                  <Chip 
                    label={`Primary: ${response.emotionAnalysis.primary}`} 
                    color="primary" 
                  />
                  <Chip 
                    label={`Secondary: ${response.emotionAnalysis.secondary}`} 
                    color="secondary" 
                  />
                </Box>
                
                {response.emotionAnalysis.emotions.map((emotion) => (
                  <Box key={emotion.name} display="flex" alignItems="center" mb={1}>
                    <Typography variant="body1" sx={{ minWidth: 100 }}>
                      {emotion.name}
                    </Typography>
                    <Box width="100%" mr={1} ml={2}>
                      <LinearProgress 
                        variant="determinate" 
                        value={emotion.score * 100} 
                        sx={{ height: 10, borderRadius: 5 }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(emotion.score * 100)}%
                    </Typography>
                  </Box>
                ))}
              </Paper>
              
              <Paper sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <TextFieldsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5">
                    Text Response
                  </Typography>
                </Box>
                
                {response.responseType === 'open_ended' ? (
                  <Typography variant="body1" paragraph>
                    "{response.responseText}"
                  </Typography>
                ) : response.responseType === 'scale' ? (
                  <Typography variant="body1" paragraph>
                    Rating: <strong>{response.responseValue}/5</strong>
                  </Typography>
                ) : response.responseType === 'yes_no' ? (
                  <Typography variant="body1" paragraph>
                    Answer: <strong>{response.responseValue.charAt(0).toUpperCase() + response.responseValue.slice(1)}</strong>
                  </Typography>
                ) : (
                  <Typography variant="body1" paragraph>
                    {response.responseText || response.responseValue}
                  </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Text Analysis
                </Typography>
                
                <Box display="flex" alignItems="center" mb={3}>
                  <Typography variant="body1" sx={{ mr: 1 }}>
                    Sentiment:
                  </Typography>
                  <Chip 
                    label={response.textAnalysis.sentiment.charAt(0).toUpperCase() + response.textAnalysis.sentiment.slice(1)} 
                    color={getSentimentColor(response.textAnalysis.sentiment)}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    Score: {Math.round(response.textAnalysis.score * 100)}%
                  </Typography>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Keywords:
                </Typography>
                
                <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                  {response.textAnalysis.keywords.map((keyword) => (
                    <Chip 
                      key={keyword}
                      label={keyword}
                      variant="outlined"
                    />
                  ))}
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Themes:
                </Typography>
                
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {response.textAnalysis.themes.map((theme) => (
                    <Chip 
                      key={theme}
                      label={theme}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <InsightsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5">
                    Mixed Analysis Insights
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Insights generated by analyzing the correlation between voice emotion patterns and text content.
                </Typography>
                
                <List>
                  {response.mixedAnalysis.insights.map((insight, index) => (
                    <ListItem key={index} alignItems="flex-start">
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <InsightsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={insight} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
              
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <AssessmentIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h5">
                    Recommendations
                  </Typography>
                </Box>
                
                <List>
                  {response.mixedAnalysis.recommendations.map((recommendation, index) => (
                    <ListItem key={index} alignItems="flex-start">
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <AssessmentIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
              
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EditIcon />}
                  component={Link}
                  to={`/admin/responses/${response.id}/edit`}
                  sx={{ mb: 2 }}
                >
                  Edit Notes
                </Button>
                
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<AssessmentIcon />}
                  component={Link}
                  to={`/admin/responses/${response.id}/analysis`}
                  sx={{ mb: 2 }}
                >
                  View Full Analysis
                </Button>
                
                <Button
                  fullWidth
  
(Content truncated due to size limit. Use line ranges to read in chunks)