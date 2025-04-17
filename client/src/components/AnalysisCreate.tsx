import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Save as SaveIcon,
  Assessment as AssessmentIcon,
  Source as SourceIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  InsightsOutlined as InsightsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const AnalysisCreate = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [projects, setProjects] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [responses, setResponses] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [analysisOptions, setAnalysisOptions] = useState({
    includeEmotionAnalysis: true,
    includeTextAnalysis: true,
    includeMixedAnalysis: true,
    generateRecommendations: true,
    detectionThreshold: 0.5
  });
  const [previewData, setPreviewData] = useState(null);

  const steps = ['Select Project', 'Choose Source', 'Configure Analysis', 'Review & Create'];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // In a real implementation, this would fetch data from the API
        // For now, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockProjects = [
          {
            id: 'project-1',
            name: 'Beverage Product Testing',
            description: 'Consumer testing for new beverage product line',
            status: 'active'
          },
          {
            id: 'project-2',
            name: 'Snack Packaging Feedback',
            description: 'Consumer feedback on new packaging designs',
            status: 'active'
          },
          {
            id: 'project-3',
            name: 'Brand Perception Study',
            description: 'Analysis of consumer perception of brand values',
            status: 'active'
          }
        ];
        
        setProjects(mockProjects);
      } catch (err) {
        setError('Failed to load projects. Please try again.');
      }
    };
    
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchSources = async () => {
      if (!selectedProject || !selectedSourceType) return;
      
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // Mock data based on selected project and source type
        if (selectedSourceType === 'interview') {
          const mockInterviews = [
            {
              id: 'interview-1',
              projectId: 'project-1',
              participantId: 'part-101',
              status: 'completed',
              completedAt: '2025-04-12T10:30:00Z',
              title: 'Interview with Participant 101'
            },
            {
              id: 'interview-2',
              projectId: 'project-1',
              participantId: 'part-102',
              status: 'completed',
              completedAt: '2025-04-12T13:45:00Z',
              title: 'Interview with Participant 102'
            },
            {
              id: 'interview-3',
              projectId: 'project-2',
              participantId: 'part-201',
              status: 'completed',
              completedAt: '2025-04-13T09:15:00Z',
              title: 'Interview with Participant 201'
            }
          ];
          
          // Filter by selected project
          const filteredInterviews = mockInterviews.filter(interview => interview.projectId === selectedProject);
          setInterviews(filteredInterviews);
        } else if (selectedSourceType === 'response') {
          const mockResponses = [
            {
              id: 'resp-1',
              projectId: 'project-1',
              interviewId: 'interview-1',
              participantId: 'part-101',
              questionId: 1,
              questionText: 'What are your first impressions of this new beverage concept?',
              status: 'completed',
              title: 'Response to First Impressions Question (Participant 101)'
            },
            {
              id: 'resp-2',
              projectId: 'project-1',
              interviewId: 'interview-1',
              participantId: 'part-101',
              questionId: 2,
              questionText: 'How would you rate the appeal of the packaging design on a scale of 1-5?',
              status: 'completed',
              title: 'Response to Packaging Appeal Question (Participant 101)'
            },
            {
              id: 'resp-4',
              projectId: 'project-1',
              interviewId: 'interview-2',
              participantId: 'part-102',
              questionId: 1,
              questionText: 'What are your first impressions of this new beverage concept?',
              status: 'completed',
              title: 'Response to First Impressions Question (Participant 102)'
            },
            {
              id: 'resp-5',
              projectId: 'project-2',
              interviewId: 'interview-3',
              participantId: 'part-201',
              questionId: 1,
              questionText: 'What do you think about the new packaging design?',
              status: 'completed',
              title: 'Response to Packaging Design Question (Participant 201)'
            }
          ];
          
          // Filter by selected project
          const filteredResponses = mockResponses.filter(response => response.projectId === selectedProject);
          setResponses(filteredResponses);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load sources. Please try again.');
        setLoading(false);
      }
    };
    
    fetchSources();
  }, [selectedProject, selectedSourceType]);

  useEffect(() => {
    // Generate preview data when all selections are made
    if (activeStep === 3 && selectedProject && selectedSourceType && selectedSourceId) {
      generatePreview();
    }
  }, [activeStep, selectedProject, selectedSourceType, selectedSourceId, analysisOptions]);

  const generatePreview = async () => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get project name
      const project = projects.find(p => p.id === selectedProject);
      
      // Get source name
      let sourceName = '';
      if (selectedSourceType === 'interview') {
        const interview = interviews.find(i => i.id === selectedSourceId);
        sourceName = interview ? interview.title : '';
      } else if (selectedSourceType === 'response') {
        const response = responses.find(r => r.id === selectedSourceId);
        sourceName = response ? response.title : '';
      } else if (selectedSourceType === 'project') {
        sourceName = `${project.name} - Aggregate Analysis`;
      }
      
      // Mock preview data
      const mockPreview = {
        projectName: project ? project.name : '',
        sourceType: selectedSourceType,
        sourceName: sourceName,
        estimatedDuration: selectedSourceType === 'project' ? '3-5 minutes' : '1-2 minutes',
        analysisComponents: [],
        sampleInsights: []
      };
      
      // Add analysis components based on options
      if (analysisOptions.includeEmotionAnalysis) {
        mockPreview.analysisComponents.push('Voice Emotion Analysis');
      }
      
      if (analysisOptions.includeTextAnalysis) {
        mockPreview.analysisComponents.push('Text Sentiment Analysis');
      }
      
      if (analysisOptions.includeMixedAnalysis) {
        mockPreview.analysisComponents.push('Mixed Voice-Text Analysis');
      }
      
      if (analysisOptions.generateRecommendations) {
        mockPreview.analysisComponents.push('Strategic Recommendations');
      }
      
      // Add sample insights based on source type
      if (selectedSourceType === 'interview') {
        mockPreview.sampleInsights = [
          "Voice emotion patterns will be analyzed across all responses",
          "Text sentiment will be evaluated for consistency and authenticity",
          "Correlation between voice emotion and text content will reveal deeper insights",
          "Strategic recommendations will be generated based on the combined analysis"
        ];
      } else if (selectedSourceType === 'response') {
        mockPreview.sampleInsights = [
          "Detailed emotion analysis of voice patterns in this specific response",
          "In-depth text analysis to identify key themes and sentiments",
          "Comparison of stated opinions versus emotional reactions",
          "Specific recommendations based on this response"
        ];
      } else if (selectedSourceType === 'project') {
        mockPreview.sampleInsights = [
          "Aggregate analysis of all interviews and responses in the project",
          "Identification of common emotional patterns across participants",
          "Synthesis of key themes and sentiments from all text responses",
          "Strategic recommendations based on the entire project dataset"
        ];
      }
      
      setPreviewData(mockPreview);
      setLoading(false);
    } catch (err) {
      setError('Failed to generate preview. Please try again.');
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
    setSelectedSourceId(''); // Reset source selection when project changes
  };

  const handleSourceTypeChange = (event) => {
    setSelectedSourceType(event.target.value);
    setSelectedSourceId(''); // Reset source ID when type changes
  };

  const handleSourceIdChange = (event) => {
    setSelectedSourceId(event.target.value);
  };

  const handleAnalysisOptionChange = (option, value) => {
    setAnalysisOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const handleCreateAnalysis = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful creation
      setSuccess(true);
      setLoading(false);
      
      // Redirect to the analysis list after a short delay
      setTimeout(() => {
        navigate('/admin/analyses');
      }, 2000);
    } catch (err) {
      setError('Failed to create analysis. Please try again.');
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderProjectSelection();
      case 1:
        return renderSourceSelection();
      case 2:
        return renderAnalysisConfiguration();
      case 3:
        return renderReview();
      default:
        return null;
    }
  };

  const renderProjectSelection = () => {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Project
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Choose the project for which you want to create an analysis.
        </Typography>
        
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="project-select-label">Project</InputLabel>
          <Select
            labelId="project-select-label"
            id="project-select"
            value={selectedProject}
            label="Project"
            onChange={handleProjectChange}
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select a project to analyze</FormHelperText>
        </FormControl>
        
        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={!selectedProject}
          >
            Next
          </Button>
        </Box>
      </Paper>
    );
  };

  const renderSourceSelection = () => {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Choose Analysis Source
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Select the type of analysis you want to perform and the specific source.
        </Typography>
        
        <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
          <InputLabel id="source-type-select-label">Analysis Type</InputLabel>
          <Select
            labelId="source-type-select-label"
            id="source-type-select"
            value={selectedSourceType}
            label="Analysis Type"
            onChange={handleSourceTypeChange}
          >
            <MenuItem value="interview">Interview Analysis</MenuItem>
            <MenuItem value="response">Response Analysis</MenuItem>
            <MenuItem value="project">Project Analysis</MenuItem>
          </Select>
          <FormHelperText>Select the type of analysis to perform</FormHelperText>
        </FormControl>
        
        {selectedSourceType && selectedSourceType !== 'project' && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="source-select-label">
              {selectedSourceType === 'interview' ? 'Interview' : 'Response'}
            </InputLabel>
            <Select
              labelId="source-select-label"
              id="source-select"
              value={selectedSourceId}
              label={selectedSourceType === 'interview' ? 'Interview' : 'Response'}
              onChange={handleSourceIdChange}
              disabled={loading}
            >
              {selectedSourceType === 'interview' ? (
                interviews.map((interview) => (
                  <MenuItem key={interview.id} value={interview.id}>
                    {interview.title}
                  </MenuItem>
                ))
              ) : (
                responses.map((response) => (
                  <MenuItem key={response.id} value={response.id}>
                    {response.title}
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>
              {selectedSourceType === 'interview' 
                ? 'Select the interview to analyze' 
                : 'Select the response to analyze'}
            </FormHelperText>
          </FormControl>
        )}
        
        {selectedSourceType === 'project' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Project analysis will analyze all interviews and responses in the selected project.
            This may take longer to process than individual analyses.
          </Alert>
        )}
        
        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button
            variant="outlined"
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Button
            var
(Content truncated due to size limit. Use line ranges to read in chunks)