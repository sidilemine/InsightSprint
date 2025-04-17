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
  TextField,
  InputAdornment,
  TablePagination
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  QuestionAnswer as QuestionAnswerIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ProjectsList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, this would fetch data from the API
        // For now, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockProjects = [
          {
            id: 'project-1',
            name: 'Beverage Product Testing',
            description: 'Consumer testing for new beverage product line with focus on taste, packaging, and brand perception.',
            status: 'active',
            interviewsCount: 5,
            responsesCount: 12,
            analysesCount: 3,
            createdAt: '2025-04-01T10:00:00Z',
            lastUpdated: '2025-04-15T14:30:00Z',
            clientName: 'Refresh Beverages Inc.',
            tags: ['beverage', 'product testing', 'consumer feedback']
          },
          {
            id: 'project-2',
            name: 'Snack Packaging Feedback',
            description: 'Consumer feedback on new packaging designs for premium snack line, focusing on visual appeal and sustainability messaging.',
            status: 'active',
            interviewsCount: 3,
            responsesCount: 9,
            analysesCount: 2,
            createdAt: '2025-04-05T09:30:00Z',
            lastUpdated: '2025-04-13T10:15:00Z',
            clientName: 'Crunch Innovations LLC',
            tags: ['snacks', 'packaging', 'sustainability']
          },
          {
            id: 'project-3',
            name: 'Brand Perception Study',
            description: 'Analysis of consumer perception of brand values and messaging after recent rebranding initiative.',
            status: 'active',
            interviewsCount: 8,
            responsesCount: 24,
            analysesCount: 4,
            createdAt: '2025-03-20T11:15:00Z',
            lastUpdated: '2025-04-10T16:45:00Z',
            clientName: 'EcoFresh Foods',
            tags: ['brand perception', 'rebranding', 'consumer attitudes']
          },
          {
            id: 'project-4',
            name: 'Plant-Based Alternatives Feedback',
            description: 'Consumer testing for new line of plant-based meat alternatives, focusing on taste, texture, and overall appeal.',
            status: 'active',
            interviewsCount: 6,
            responsesCount: 18,
            analysesCount: 3,
            createdAt: '2025-03-25T14:00:00Z',
            lastUpdated: '2025-04-08T11:30:00Z',
            clientName: 'GreenPlate Foods',
            tags: ['plant-based', 'meat alternatives', 'product testing']
          },
          {
            id: 'project-5',
            name: 'Premium Coffee Experience',
            description: 'Research on consumer experience with premium coffee products and in-home brewing methods.',
            status: 'completed',
            interviewsCount: 10,
            responsesCount: 30,
            analysesCount: 5,
            createdAt: '2025-02-15T09:00:00Z',
            lastUpdated: '2025-03-20T15:45:00Z',
            clientName: 'Artisan Coffee Roasters',
            tags: ['coffee', 'premium', 'consumer experience']
          }
        ];
        
        setProjects(mockProjects);
        setFilteredProjects(mockProjects);
        setLoading(false);
      } catch (err) {
        setError('Failed to load projects. Please try again.');
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  useEffect(() => {
    // Filter projects based on search term
    if (searchTerm.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProjects(filtered);
    }
    
    // Reset to first page when search changes
    setPage(0);
  }, [searchTerm, projects]);

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search projects..."
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
            <Grid container spacing={3}>
              {filteredProjects
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((project) => (
                  <Grid item xs={12} key={project.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="h6" component="h2" gutterBottom>
                              {project.name}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {project.description}
                            </Typography>
                            
                            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
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
                          </Box>
                          
                          <Chip 
                            label={project.status.charAt(0).toUpperCase() + project.status.slice(1)} 
                            color={project.status === 'active' ? 'success' : 'default'} 
                            size="small"
                          />
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Client
                              </Typography>
                              <Typography variant="body1">
                                {project.clientName}
                              </Typography>
                            </Box>
                            
                            <Box mt={2}>
                              <Typography variant="body2" color="text.secondary">
                                Created
                              </Typography>
                              <Typography variant="body1">
                                {formatDate(project.createdAt)}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Last Updated
                              </Typography>
                              <Typography variant="body1">
                                {formatDate(project.lastUpdated)}
                              </Typography>
                            </Box>
                            
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                              <Grid item xs={4}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="primary">
                                    {project.interviewsCount}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Interviews
                                  </Typography>
                                </Box>
                              </Grid>
                              
                              <Grid item xs={4}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="primary">
                                    {project.responsesCount}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Responses
                                  </Typography>
                                </Box>
                              </Grid>
                              
                              <Grid item xs={4}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="primary">
                                    {project.analysesCount}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Analyses
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                        
                        <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
                          <Button 
                            variant="outlined" 
                            startIcon={<AssessmentIcon />}
                            component={Link}
                            to={`/client/projects/${project.id}/analyses`}
                          >
                            View Analyses
                          </Button>
                          
                          <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<VisibilityIcon />}
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
              
              {filteredProjects.length === 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No projects found
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredProjects.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ProjectsList;
