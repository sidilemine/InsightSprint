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
  TableRow,
  IconButton
} from '@mui/material';
import { 
  Assessment as AssessmentIcon,
  SentimentSatisfiedAlt as SentimentIcon,
  TextFields as TextFieldsIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon
} from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`interview-tabpanel-${index}`}
      aria-labelledby={`interview-tab-${index}`}
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

const InterviewDetail = () => {
  const { interviewId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interview, setInterview] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, this would fetch data from the API
        // For now, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockInterview = {
          id: interviewId,
          title: 'Interview with Participant 101',
          projectId: 'project-1',
          projectName: 'Beverage Product Testing',
          participantId: 'part-101',
          participantName: 'Participant 101',
          status: 'completed',
          scheduledAt: '2025-04-05T10:00:00Z',
          completedAt: '2025-04-05T10:45:00Z',
          duration: 45,
          moderator: 'AI Moderator',
          audioUrl: 'https://example.com/interviews/audio-101.mp3',
          transcriptUrl: 'https://example.com/interviews/transcript-101.txt',
          hasAnalysis: true,
          analysisId: 'analysis-1',
          questions: [
            {
              id: 'q1',
              text: 'What were your first impressions of the beverage packaging?',
              timestamp: '00:02:15',
              responseText: 'I really liked the modern design and the bright colors. It definitely caught my eye and made me want to pick it up. The shape of the bottle is also very ergonomic and easy to hold.',
              emotionData: {
                primary: 'Interest',
                score: 0.75,
                secondary: 'Satisfaction',
                secondaryScore: 0.62,
                timeline: [
                  { time: 0, emotion: 'Neutral', score: 0.5 },
                  { time: 5, emotion: 'Interest', score: 0.65 },
                  { time: 10, emotion: 'Interest', score: 0.75 },
                  { time: 15, emotion: 'Satisfaction', score: 0.62 },
                  { time: 20, emotion: 'Interest', score: 0.7 }
                ]
              },
              textAnalysis: {
                sentiment: 'positive',
                score: 0.82,
                keyPhrases: ['modern design', 'bright colors', 'caught my eye', 'ergonomic']
              }
            },
            {
              id: 'q2',
              text: 'How would you describe the taste of the beverage?',
              timestamp: '00:05:30',
              responseText: 'The flavor was refreshing but a bit too sweet for my taste. I liked the fruity notes, especially the hint of citrus. The aftertaste was clean without any artificial flavor that you sometimes get with these types of drinks.',
              emotionData: {
                primary: 'Mixed',
                score: 0.60,
                secondary: 'Interest',
                secondaryScore: 0.55,
                timeline: [
                  { time: 0, emotion: 'Neutral', score: 0.5 },
                  { time: 5, emotion: 'Satisfaction', score: 0.58 },
                  { time: 10, emotion: 'Mild Disappointment', score: 0.45 },
                  { time: 15, emotion: 'Interest', score: 0.55 },
                  { time: 20, emotion: 'Satisfaction', score: 0.62 }
                ]
              },
              textAnalysis: {
                sentiment: 'mixed',
                score: 0.65,
                keyPhrases: ['refreshing', 'too sweet', 'fruity notes', 'citrus', 'clean aftertaste', 'no artificial flavor']
              }
            },
            {
              id: 'q3',
              text: 'How does this beverage align with your perception of the brand?',
              timestamp: '00:10:45',
              responseText: 'It feels very consistent with what I expect from this brand. They've always positioned themselves as premium and health-conscious, and this product continues that tradition. The natural ingredients and sustainable packaging really reinforce their brand values.',
              emotionData: {
                primary: 'Satisfaction',
                score: 0.78,
                secondary: 'Trust',
                secondaryScore: 0.72,
                timeline: [
                  { time: 0, emotion: 'Neutral', score: 0.5 },
                  { time: 5, emotion: 'Satisfaction', score: 0.65 },
                  { time: 10, emotion: 'Trust', score: 0.72 },
                  { time: 15, emotion: 'Satisfaction', score: 0.78 },
                  { time: 20, emotion: 'Satisfaction', score: 0.75 }
                ]
              },
              textAnalysis: {
                sentiment: 'positive',
                score: 0.85,
                keyPhrases: ['consistent', 'premium', 'health-conscious', 'natural ingredients', 'sustainable packaging', 'brand values']
              }
            },
            {
              id: 'q4',
              text: 'Would you purchase this product, and if so, how often?',
              timestamp: '00:15:20',
              responseText: 'Yes, I would definitely buy it, probably once or twice a week. It would be perfect for after my workout or as an afternoon refreshment. The price point seems reasonable for a premium beverage.',
              emotionData: {
                primary: 'Interest',
                score: 0.82,
                secondary: 'Satisfaction',
                secondaryScore: 0.75,
                timeline: [
                  { time: 0, emotion: 'Neutral', score: 0.5 },
                  { time: 5, emotion: 'Interest', score: 0.82 },
                  { time: 10, emotion: 'Satisfaction', score: 0.75 },
                  { time: 15, emotion: 'Interest', score: 0.78 },
                  { time: 20, emotion: 'Satisfaction', score: 0.72 }
                ]
              },
              textAnalysis: {
                sentiment: 'positive',
                score: 0.88,
                keyPhrases: ['definitely buy', 'once or twice a week', 'after workout', 'afternoon refreshment', 'reasonable price', 'premium beverage']
              }
            }
          ],
          summary: {
            text: 'The participant showed strong interest and satisfaction with the product, particularly regarding its packaging design and brand alignment. While the taste was generally well-received, there was some concern about sweetness levels. Purchase intent is high, with the participant indicating regular purchase frequency. Voice emotion analysis revealed consistently higher levels of interest and satisfaction than might be apparent from text alone, particularly when discussing packaging design and brand values.',
            emotionSummary: {
              primary: 'Interest',
              score: 0.72,
              secondary: 'Satisfaction',
              secondaryScore: 0.68,
              overall: 'Positive',
              overallScore: 0.75
            },
            textSummary: {
              sentiment: 'positive',
              score: 0.78,
              keyThemes: ['packaging design', 'brand alignment', 'taste preferences', 'purchase intent']
            },
            recommendations: [
              'Consider offering a less sweet variant to address taste concerns',
              'Emphasize ergonomic packaging design in marketing materials',
              'Highlight natural ingredients and sustainable packaging to reinforce brand values',
              'Position as post-workout refreshment based on usage intent'
            ]
          }
        };
        
        setInterview(mockInterview);
        setDuration(mockInterview.duration * 60); // Convert minutes to seconds
        setLoading(false);
      } catch (err) {
        setError('Failed to load interview details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchInterviewDetails();
  }, [interviewId]);

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control the audio playback
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, this would control the audio volume
  };

  const handleTimeChange = (newTime) => {
    setCurrentTime(newTime);
    // In a real implementation, this would seek the audio to the new time
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
      {interview && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              {interview.title}
            </Typography>
            
            <Chip 
              label={interview.status.charAt(0).toUpperCase() + interview.status.slice(1)} 
              color={interview.status === 'completed' ? 'success' : 'primary'} 
            />
          </Box>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Interview Overview
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Project
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <Link to={`/client/projects/${interview.projectId}`} style={{ textDecoration: 'none', color: 'primary.main' }}>
                      {interview.projectName}
                    </Link>
                  </Typography>
                </Box>
                
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Participant
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {interview.participantName}
                  </Typography>
                </Box>
                
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Moderator
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {interview.moderator}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Scheduled
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(interview.scheduledAt)}
                  </Typography>
                </Box>
                
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(interview.completedAt)}
                  </Typography>
                </Box>
                
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {interview.duration} minutes
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {interview.hasAnalysis && (
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<AssessmentIcon />}
                  component={Link}
                  to={`/client/analyses/${interview.analysisId}`}
                >
                  View Full Analysis
                </Button>
              </Box>
            )}
          </Paper>
          
          {/* Audio Player */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <IconButton onClick={togglePlayPause} color="primary">
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                
                <IconButton onClick={toggleMute} color="primary">
                  {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
                
                <Typography variant="body2" sx={{ mx: 2 }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center">
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ mr: 1 }}
                  onClick={() => {
                    // In a real implementation, this would download the audio file
                    alert('Audio download would start here');
                  }}
                >
                  Download Audio
                </Button>
                
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
        
(Content truncated due to size limit. Use line ranges to read in chunks)