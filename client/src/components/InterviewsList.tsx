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
  PlayArrow as PlayArrowIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const InterviewsList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, this would fetch data from the API
        // For now, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockInterviews = [
          {
            id: 'interview-1',
            projectId: 'project-1',
            projectName: 'Beverage Product Testing',
            participantId: 'part-101',
            status: 'completed',
            duration: 420, // seconds
            completedAt: '2025-04-12T10:15:00Z',
            emotionSummary: {
              primary: 'Interest',
              secondary: 'Joy'
            },
            hasAnalysis: true
          },
          {
            id: 'interview-2',
            projectId: 'project-1',
            projectName: 'Beverage Product Testing',
            participantId: 'part-102',
            status: 'completed',
            duration: 380,
            completedAt: '2025-04-12T11:30:00Z',
            emotionSummary: {
              primary: 'Joy',
              secondary: 'Interest'
            },
            hasAnalysis: true
          },
          {
            id: 'interview-3',
            projectId: 'project-1',
            projectName: 'Beverage Product Testing',
            participantId: 'part-103',
            status: 'completed',
            duration: 450,
            completedAt: '2025-04-12T14:45:00Z',
            emotionSummary: {
              primary: 'Surprise',
              secondary: 'Interest'
            },
            hasAnalysis: true
          },
          {
            id: 'interview-4',
            projectId: 'project-2',
            projectName: 'Snack Packaging Feedback',
            participantId: 'part-201',
            status: 'completed',
            duration: 395,
            completedAt: '2025-04-13T09:20:00Z',
            emotionSummary: {
              primary: 'Interest',
              secondary: 'Surprise'
            },
            hasAnalysis: true
          },
          {
            id: 'interview-5',
            projectId: 'project-2',
            projectName: 'Snack Packaging Feedback',
            participantId: 'part-202',
            status: 'in_progress',
            duration: null,
            completedAt: null,
            emotionSummary: null,
            hasAnalysis: false
          }
        ];
        
        setInterviews(mockInterviews);
        setFilteredInterviews(mockInterviews);
        setLoading(false);
      } catch (err) {
        setError('Failed to load interviews. Please try again.');
        setLoading(false);
      }
    };
    
    fetchInterviews();
  }, []);

  useEffect(() => {
    // Filter interviews based on search term
    if (searchTerm.trim() === '') {
      setFilteredInterviews(interviews);
    } else {
      const filtered = interviews.filter(interview => 
        interview.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.participantId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInterviews(filtered);
    }
    
    // Reset to first page when search changes
    setPage(0);
  }, [searchTerm, interviews]);

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
      day: 'numeric' 
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'scheduled':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderTableView = () => {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Interview ID</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Participant</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Completed</TableCell>
              <TableCell>Primary Emotion</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInterviews
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell component="th" scope="row">
                    <Link 
                      to={`/admin/interviews/${interview.id}`}
                      style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'medium' }}
                    >
                      {interview.id}
                    </Link>
                  </TableCell>
                  <TableCell>{interview.projectName}</TableCell>
                  <TableCell>{interview.participantId}</TableCell>
                  <TableCell>
                    <Chip 
                      label={interview.status.replace('_', ' ').charAt(0).toUpperCase() + interview.status.replace('_', ' ').slice(1)} 
                      color={getStatusColor(interview.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDuration(interview.duration)}</TableCell>
                  <TableCell>{formatDate(interview.completedAt)}</TableCell>
                  <TableCell>
                    {interview.emotionSummary?.primary || 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      component={Link}
                      to={`/admin/interviews/${interview.id}`}
                      title="View Interview"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    
                    {interview.status === 'in_progress' && (
                      <IconButton 
                        size="small" 
                        color="primary"
                        component={Link}
                        to={`/admin/interviews/${interview.id}/monitor`}
                        title="Monitor Live"
                      >
                        <PlayArrowIcon fontSize="small" />
                      </IconButton>
                    )}
                    
                    {interview.hasAnalysis && (
                      <IconButton 
                        size="small" 
                        color="secondary"
                        component={Link}
                        to={`/admin/interviews/${interview.id}/analysis`}
                        title="View Analysis"
                      >
                        <AssessmentIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            
            {filteredInterviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No interviews found
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
        {filteredInterviews
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((interview) => (
            <Grid item xs={12} md={6} lg={4} key={interview.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1">
                      {interview.participantId}
                    </Typography>
                    <Chip 
                      label={interview.status.replace('_', ' ').charAt(0).toUpperCase() + interview.status.replace('_', ' ').slice(1)} 
                      color={getStatusColor(interview.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Project: {interview.projectName}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="body2">
                        {formatDuration(interview.duration)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(interview.completedAt)}
                      </Typography>
                    </Grid>
                    
                    {interview.emotionSummary && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Primary Emotions
                        </Typography>
                        <Box display="flex" gap={1} mt={0.5}>
                          <Chip 
                            label={interview.emotionSummary.primary} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={interview.emotionSummary.secondary} 
                            size="small" 
                            color="secondary" 
                            variant="outlined" 
                          />
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link}
                    to={`/admin/interviews/${interview.id}`}
                  >
                    View Details
                  </Button>
                  
                  {interview.status === 'in_progress' && (
                    <Button 
                      size="small" 
                      color="primary"
                      component={Link}
                      to={`/admin/interviews/${interview.id}/monitor`}
                    >
                      Monitor Live
                    </Button>
                  )}
                  
                  {interview.hasAnalysis && (
                    <Button 
                      size="small" 
                      color="secondary"
                      component={Link}
                      to={`/admin/interviews/${interview.id}/analysis`}
                    >
                      View Analysis
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        
        {filteredInterviews.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No interviews found
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Interviews
        </Typography>
        
        <Button 
          variant="outlined" 
          startIcon={<FilterListIcon />}
        >
          Filter
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search interviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={5}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                {renderTableView()}
              </Box>
              
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {renderCardView()}
              </Box>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredInterviews.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default InterviewsList;
