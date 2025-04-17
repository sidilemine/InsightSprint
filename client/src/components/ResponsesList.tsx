import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterListIcon,
  SentimentSatisfiedAlt as SentimentIcon,
  TextFields as TextFieldsIcon,
  RecordVoiceOver as RecordVoiceOverIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ResponsesList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responses, setResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, this would fetch data from the API
        // For now, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockResponses = [
          {
            id: 'resp-1',
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
              score: 0.72
            },
            textAnalysis: {
              sentiment: 'positive',
              score: 0.78
            }
          },
          {
            id: 'resp-2',
            interviewId: 'interview-1',
            projectId: 'project-1',
            projectName: 'Beverage Product Testing',
            participantId: 'part-101',
            questionId: 2,
            questionText: 'How would you rate the appeal of the packaging design on a scale of 1-5?',
            responseType: 'scale',
            responseValue: 4,
            audioUrl: '/audio/response-2.mp3',
            duration: 15, // seconds
            completedAt: '2025-04-12T10:17:00Z',
            emotionAnalysis: {
              primary: 'Satisfaction',
              secondary: 'Interest',
              score: 0.68
            },
            textAnalysis: {
              sentiment: 'positive',
              score: 0.82
            }
          },
          {
            id: 'resp-3',
            interviewId: 'interview-1',
            projectId: 'project-1',
            projectName: 'Beverage Product Testing',
            participantId: 'part-101',
            questionId: 3,
            questionText: 'What emotions do you feel when you think about trying this product?',
            responseType: 'open_ended',
            responseText: "I feel curious and excited to try something new. There's also a bit of anticipation about the taste. I'm hopeful it will be refreshing and flavorful without being too sweet like many other beverages.",
            audioUrl: '/audio/response-3.mp3',
            duration: 32, // seconds
            completedAt: '2025-04-12T10:19:00Z',
            emotionAnalysis: {
              primary: 'Anticipation',
              secondary: 'Curiosity',
              score: 0.81
            },
            textAnalysis: {
              sentiment: 'positive',
              score: 0.71
            }
          },
          {
            id: 'resp-4',
            interviewId: 'interview-2',
            projectId: 'project-1',
            projectName: 'Beverage Product Testing',
            participantId: 'part-102',
            questionId: 1,
            questionText: 'What are your first impressions of this new beverage concept?',
            responseType: 'open_ended',
            responseText: "The packaging looks modern and eye-catching. I like that it emphasizes natural ingredients, which is important to me. I'm a bit skeptical about the flavor profile though, as these types of drinks can sometimes be too sweet.",
            audioUrl: '/audio/response-4.mp3',
            duration: 35, // seconds
            completedAt: '2025-04-12T11:30:00Z',
            emotionAnalysis: {
              primary: 'Interest',
              secondary: 'Skepticism',
              score: 0.65
            },
            textAnalysis: {
              sentiment: 'mixed',
              score: 0.55
            }
          },
          {
            id: 'resp-5',
            interviewId: 'interview-3',
            projectId: 'project-2',
            projectName: 'Snack Packaging Feedback',
            participantId: 'part-201',
            questionId: 1,
            questionText: 'What do you think about the new packaging design?',
            responseType: 'open_ended',
            responseText: "I really like the bold colors and the clear product imagery. It stands out on the shelf and gives me a good idea of what to expect inside. The sustainability messaging is also a nice touch.",
            audioUrl: '/audio/response-5.mp3',
            duration: 30, // seconds
            completedAt: '2025-04-13T09:20:00Z',
            emotionAnalysis: {
              primary: 'Joy',
              secondary: 'Interest',
              score: 0.78
            },
            textAnalysis: {
              sentiment: 'positive',
              score: 0.85
            }
          }
        ];
        
        setResponses(mockResponses);
        setFilteredResponses(mockResponses);
        setLoading(false);
      } catch (err) {
        setError('Failed to load responses. Please try again.');
        setLoading(false);
      }
    };
    
    fetchResponses();
  }, []);

  useEffect(() => {
    // Filter responses based on search term
    if (searchTerm.trim() === '') {
      setFilteredResponses(responses);
    } else {
      const filtered = responses.filter(response => 
        response.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.participantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (response.responseText && response.responseText.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredResponses(filtered);
    }
    
    // Reset to first page when search changes
    setPage(0);
  }, [searchTerm, responses]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
      case 'mixed':
        return 'info';
      case 'negative':
        return 'error';
      default:
        return 'default';
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderTableView = () => {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Response ID</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Participant</TableCell>
              <TableCell>Question</TableCell>
              <TableCell>Response</TableCell>
              <TableCell>Primary Emotion</TableCell>
              <TableCell>Sentiment</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredResponses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((response) => (
                <TableRow key={response.id}>
                  <TableCell component="th" scope="row">
                    <Link 
                      to={`/admin/responses/${response.id}`}
                      style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'medium' }}
                    >
                      {response.id}
                    </Link>
                  </TableCell>
                  <TableCell>{response.projectName}</TableCell>
                  <TableCell>{response.participantId}</TableCell>
                  <TableCell>{truncateText(response.questionText, 50)}</TableCell>
                  <TableCell>
                    {response.responseType === 'open_ended' 
                      ? truncateText(response.responseText, 50)
                      : response.responseType === 'scale'
                        ? `Rating: ${response.responseValue}/5`
                        : response.responseType === 'yes_no'
                          ? response.responseValue.charAt(0).toUpperCase() + response.responseValue.slice(1)
                          : truncateText(response.responseText || response.responseValue, 50)
                    }
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={response.emotionAnalysis.primary} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={response.textAnalysis.sentiment.charAt(0).toUpperCase() + response.textAnalysis.sentiment.slice(1)} 
                      size="small"
                      color={getSentimentColor(response.textAnalysis.sentiment)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      component={Link}
                      to={`/admin/responses/${response.id}`}
                      title="View Response"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    
                    <IconButton 
                      size="small" 
                      color="secondary"
                      component={Link}
                      to={`/admin/responses/${response.id}/analysis`}
                      title="View Analysis"
                    >
                      <AssessmentIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            
            {filteredResponses.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No responses found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderCardView = () => {
    return (
      <Grid container spacing={2}>
        {filteredResponses
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((response) => (
            <Grid item xs={12} md={6} lg={4} key={response.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1">
                      {response.participantId}
                    </Typography>
                    <Chip 
                      label={response.projectName} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {truncateText(response.questionText, 100)}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    {response.responseType === 'open_ended' ? (
                      <TextFieldsIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    ) : (
                      <RecordVoiceOverIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    )}
                    <Typography variant="body2">
                      {response.responseType === 'open_ended' 
                        ? truncateText(response.responseText, 100)
                        : response.responseType === 'scale'
                          ? `Rating: ${response.responseValue}/5`
                          : response.responseType === 'yes_no'
                            ? response.responseValue.charAt(0).toUpperCase() + response.responseValue.slice(1)
                            : truncateText(response.responseText || response.responseValue, 100)
                      }
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Primary Emotion
                      </Typography>
                      <Chip 
                        icon={<SentimentIcon fontSize="small" />}
                        label={response.emotionAnalysis.primary} 
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
                        label={response.textAnalysis.sentiment.charAt(0).toUpperCase() + response.textAnalysis.sentiment.slice(1)} 
                        size="small"
                        color={getSentimentColor(response.textAnalysis.sentiment)}
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" display="block" align="right" sx={{ mt: 1 }}>
                    {formatDate(response.completedAt)}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button 
                    s
(Content truncated due to size limit. Use line ranges to read in chunks)