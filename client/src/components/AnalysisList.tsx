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
  InsightsOutlined as InsightsIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const AnalysisList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyses, setAnalyses] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, this would fetch data from the API
        // For now, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockAnalyses = [
          {
            id: 'analysis-1',
            projectId: 'project-1',
            projectName: 'Beverage Product Testing',
            type: 'interview',
            sourceId: 'interview-1',
            sourceName: 'Interview with Participant 101',
            createdAt: '2025-04-12T14:30:00Z',
            status: 'completed',
            emotionSummary: {
              primary: 'Interest',
              score: 0.72
            },
            textSummary: {
              sentiment: 'positive',
              score: 0.78
            },
            keyInsights: [
              "Strong interest in natural ingredients and sustainable packaging",
              "Positive emotional response to visual design elements",
              "Some price sensitivity detected in voice patterns"
            ]
          },
          {
            id: 'analysis-2',
            projectId: 'project-1',
            projectName: 'Beverage Product Testing',
            type: 'interview',
            sourceId: 'interview-2',
            sourceName: 'Interview with Participant 102',
            createdAt: '2025-04-12T16:45:00Z',
            status: 'completed',
            emotionSummary: {
              primary: 'Skepticism',
              score: 0.65
            },
            textSummary: {
              sentiment: 'mixed',
              score: 0.55
            },
            keyInsights: [
              "Concerns about flavor profile and sweetness level",
              "Positive response to packaging sustainability claims",
              "Voice emotion analysis revealed stronger skepticism than text alone"
            ]
          },
          {
            id: 'analysis-3',
            projectId: 'project-2',
            projectName: 'Snack Packaging Feedback',
            type: 'interview',
            sourceId: 'interview-3',
            sourceName: 'Interview with Participant 201',
            createdAt: '2025-04-13T10:15:00Z',
            status: 'completed',
            emotionSummary: {
              primary: 'Joy',
              score: 0.78
            },
            textSummary: {
              sentiment: 'positive',
              score: 0.85
            },
            keyInsights: [
              "Strong positive emotional response to bold colors and imagery",
              "Sustainability messaging resonated well with participant",
              "Voice emotion confirmed genuine enthusiasm for the design"
            ]
          },
          {
            id: 'analysis-4',
            projectId: 'project-1',
            projectName: 'Beverage Product Testing',
            type: 'project',
            sourceId: 'project-1',
            sourceName: 'Beverage Product Testing - Aggregate Analysis',
            createdAt: '2025-04-14T09:30:00Z',
            status: 'completed',
            emotionSummary: {
              primary: 'Interest',
              score: 0.68
            },
            textSummary: {
              sentiment: 'positive',
              score: 0.71
            },
            keyInsights: [
              "Overall positive reception to product concept across participants",
              "Natural ingredients and sustainability are key drivers of interest",
              "Price sensitivity is a common concern detected in voice patterns",
              "Packaging design received consistently positive emotional responses"
            ]
          },
          {
            id: 'analysis-5',
            projectId: 'project-2',
            projectName: 'Snack Packaging Feedback',
            type: 'response',
            sourceId: 'resp-5',
            sourceName: 'Response to Packaging Design Question',
            createdAt: '2025-04-13T09:45:00Z',
            status: 'completed',
            emotionSummary: {
              primary: 'Joy',
              score: 0.78
            },
            textSummary: {
              sentiment: 'positive',
              score: 0.85
            },
            keyInsights: [
              "Bold colors and clear product imagery generated strong positive emotions",
              "Sustainability messaging added significant positive sentiment",
              "Voice emotion analysis confirmed genuine enthusiasm for the design"
            ]
          }
        ];
        
        setAnalyses(mockAnalyses);
        setFilteredAnalyses(mockAnalyses);
        setLoading(false);
      } catch (err) {
        setError('Failed to load analyses. Please try again.');
        setLoading(false);
      }
    };
    
    fetchAnalyses();
  }, []);

  useEffect(() => {
    // Filter analyses based on search term
    if (searchTerm.trim() === '') {
      setFilteredAnalyses(analyses);
    } else {
      const filtered = analyses.filter(analysis => 
        analysis.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.keyInsights.some(insight => insight.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredAnalyses(filtered);
    }
    
    // Reset to first page when search changes
    setPage(0);
  }, [searchTerm, analyses]);

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
              <TableCell>Analysis ID</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Primary Emotion</TableCell>
              <TableCell>Sentiment</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAnalyses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((analysis) => (
                <TableRow key={analysis.id}>
                  <TableCell component="th" scope="row">
                    <Link 
                      to={`/admin/analyses/${analysis.id}`}
                      style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'medium' }}
                    >
                      {analysis.id}
                    </Link>
                  </TableCell>
                  <TableCell>{analysis.projectName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getAnalysisTypeLabel(analysis.type)} 
                      size="small" 
                      color={getAnalysisTypeColor(analysis.type)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{truncateText(analysis.sourceName, 30)}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={<SentimentIcon fontSize="small" />}
                      label={analysis.emotionSummary.primary} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={analysis.textSummary.sentiment.charAt(0).toUpperCase() + analysis.textSummary.sentiment.slice(1)} 
                      size="small"
                      color={getSentimentColor(analysis.textSummary.sentiment)}
                    />
                  </TableCell>
                  <TableCell>{formatDate(analysis.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      component={Link}
                      to={`/admin/analyses/${analysis.id}`}
                      title="View Analysis"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    
                    <IconButton 
                      size="small" 
                      color="primary"
                      component={Link}
                      to={`/admin/analyses/${analysis.id}/download`}
                      title="Download Analysis"
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            
            {filteredAnalyses.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No analyses found
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
        {filteredAnalyses
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((analysis) => (
            <Grid item xs={12} md={6} key={analysis.id}>
              <Card variant="outlined">
                <CardContent>
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
                  
                  <Typography variant="h6" gutterBottom>
                    {truncateText(analysis.sourceName, 50)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Project: {analysis.projectName}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Key Insights:
                  </Typography>
                  
                  <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    {analysis.keyInsights.map((insight, index) => (
                      <li key={index}>
                        <Typography variant="body2">
                          {insight}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />}
                    component={Link}
                    to={`/admin/analyses/${analysis.id}`}
                  >
                    View Details
                  </Button>
                  
                  <Button 
                    size="small" 
                    color="primary"
                    startIcon={<DownloadIcon />}
                    component={Link}
                    to={`/admin/analyses/${analysis.id}/download`}
                  >
                    Download
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        
        {filteredAnalyses.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAl
(Content truncated due to size limit. Use line ranges to read in chunks)