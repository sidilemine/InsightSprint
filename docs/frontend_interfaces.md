# Frontend Interfaces for Rapid Consumer Sentiment Analysis

## Overview

This document outlines the frontend interfaces required for the Rapid Consumer Sentiment Analysis service. The system requires multiple interfaces to serve different user types and use cases:

1. **Admin Dashboard** - For Jade Kite team to manage projects and analyze results
2. **Client Portal** - For clients to view insights and reports
3. **Respondent Interface** - For interview participants to engage with the AI-moderated interviews

Each interface is designed with specific user needs in mind while maintaining a consistent brand identity and user experience.

## 1. Admin Dashboard

### Purpose
The Admin Dashboard serves as the central control panel for Jade Kite team members to manage all aspects of the Rapid Consumer Sentiment Analysis service.

### Technology Stack
- **Framework**: React.js with TypeScript
- **UI Library**: Material-UI
- **State Management**: Redux Toolkit
- **Charts**: Recharts
- **Authentication**: JWT with role-based access control

### Key Features

#### Project Management
```jsx
// ProjectList.tsx
import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Chip 
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, selectAllProjects } from '../store/projectsSlice';
import { formatDate } from '../utils/dateUtils';
import { ProjectStatus } from '../types/project';
import { AppDispatch } from '../store/store';
import { Link } from 'react-router-dom';

const statusColors = {
  [ProjectStatus.DRAFT]: 'default',
  [ProjectStatus.IN_PROGRESS]: 'primary',
  [ProjectStatus.COLLECTING]: 'secondary',
  [ProjectStatus.ANALYZING]: 'info',
  [ProjectStatus.COMPLETED]: 'success',
};

const ProjectList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector(selectAllProjects);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      await dispatch(fetchProjects());
      setLoading(false);
    };
    
    loadProjects();
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchProjects());
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Projects
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            component={Link} 
            to="/projects/new"
          >
            New Project
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Product Category</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Responses</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell component="th" scope="row">
                  <Link to={`/projects/${project.id}`}>
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell>{project.client.name}</TableCell>
                <TableCell>{project.productCategory}</TableCell>
                <TableCell>{formatDate(project.createdAt)}</TableCell>
                <TableCell>
                  <Chip 
                    label={project.status} 
                    color={statusColors[project.status]} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{project.responseCount} / {project.targetResponseCount}</TableCell>
                <TableCell>
                  <Button 
                    variant="text" 
                    size="small" 
                    component={Link} 
                    to={`/projects/${project.id}`}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProjectList;
```

#### Project Creation Wizard
```jsx
// ProjectCreationWizard.tsx
import React, { useState } from 'react';
import { 
  Box, Stepper, Step, StepLabel, Button, Typography, 
  Paper, TextField, FormControl, InputLabel, Select, MenuItem,
  FormHelperText, Grid, Divider, Chip
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { createProject } from '../store/projectsSlice';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AppDispatch } from '../store/store';
import ClientSelector from '../components/ClientSelector';
import InterviewTemplateSelector from '../components/InterviewTemplateSelector';

const steps = ['Basic Information', 'Interview Setup', 'Review & Create'];

const ProjectCreationWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      clientId: '',
      productCategory: '',
      targetAudience: '',
      objectives: '',
      targetResponseCount: 10,
      interviewTemplateId: '',
      customQuestions: [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Project name is required'),
      clientId: Yup.string().required('Client is required'),
      productCategory: Yup.string().required('Product category is required'),
      targetAudience: Yup.string().required('Target audience is required'),
      objectives: Yup.string().required('Project objectives are required'),
      targetResponseCount: Yup.number()
        .min(5, 'Minimum 5 responses required')
        .max(50, 'Maximum 50 responses allowed')
        .required('Target response count is required'),
      interviewTemplateId: Yup.string().required('Interview template is required'),
    }),
    onSubmit: async (values) => {
      await dispatch(createProject(values));
      navigate('/projects');
    },
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      formik.submitForm();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const isStepValid = () => {
    if (activeStep === 0) {
      return formik.values.name && 
             formik.values.clientId && 
             formik.values.productCategory &&
             !formik.errors.name &&
             !formik.errors.clientId &&
             !formik.errors.productCategory;
    } else if (activeStep === 1) {
      return formik.values.targetAudience &&
             formik.values.objectives &&
             formik.values.interviewTemplateId &&
             !formik.errors.targetAudience &&
             !formik.errors.objectives &&
             !formik.errors.interviewTemplateId &&
             !formik.errors.targetResponseCount;
    }
    return true;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Project Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Project Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Project Description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
              <Grid item xs={12}>
                <ClientSelector
                  value={formik.values.clientId}
                  onChange={(value) => formik.setFieldValue('clientId', value)}
                  error={formik.touched.clientId && Boolean(formik.errors.clientId)}
                  helperText={formik.touched.clientId && formik.errors.clientId}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="productCategory"
                  name="productCategory"
                  label="Product Category"
                  value={formik.values.productCategory}
                  onChange={formik.handleChange}
                  error={formik.touched.productCategory && Boolean(formik.errors.productCategory)}
                  helperText={formik.touched.productCategory && formik.errors.productCategory}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Interview Setup
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="targetAudience"
                  name="targetAudience"
                  label="Target Audience"
                  multiline
                  rows={2}
                  value={formik.values.targetAudience}
                  onChange={formik.handleChange}
                  error={formik.touched.targetAudience && Boolean(formik.errors.targetAudience)}
                  helperText={formik.touched.targetAudience && formik.errors.targetAudience}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="objectives"
                  name="objectives"
                  label="Research Objectives"
                  multiline
                  rows={3}
                  value={formik.values.objectives}
                  onChange={formik.handleChange}
                  error={formik.touched.objectives && Boolean(formik.errors.objectives)}
                  helperText={formik.touched.objectives && formik.errors.objectives}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="targetResponseCount"
                  name="targetResponseCount"
                  label="Target Response Count"
                  type="number"
                  value={formik.values.targetResponseCount}
                  onChange={formik.handleChange}
                  error={formik.touched.targetResponseCount && Boolean(formik.errors.targetResponseCount)}
                  helperText={formik.touched.targetResponseCount && formik.errors.targetResponseCount}
                />
              </Grid>
              <Grid item xs={12}>
                <InterviewTemplateSelector
                  value={formik.values.interviewTemplateId}
                  onChange={(value) => formik.setFieldValue('interviewTemplateId', value)}
                  error={formik.touched.interviewTemplateId && Boolean(formik.errors.interviewTemplateId)}
                  helperText={formik.touched.interviewTemplateId && formik.errors.interviewTemplateId}
                  productCategory={formik.values.productCategory}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Project Details
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Project Name</Typography>
                  <Typography variant="body1" gutterBottom>{formik.values.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Product Category</Typography>
                  <Typography variant="body1" gutterBottom>{formik.values.productCategory}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Target Audience</Typography>
                  <Typography variant="body1" gutterBottom>{formik.values.targetAudience}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Target Responses</Typography>
                  <Typography variant="body1" gutterBottom>{formik.values.targetResponseCount}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Research Objectives</Typography>
                  <Typography variant="body1" gutterBottom>{formik.values.objectives}</Typography>
                </Grid>
              </Grid>
            </Paper>
            <Typography variant="body2" color="text.secondary">
              By creating this project, the system will generate a dynamic interview based on your selected template and project details. You'll be able to review and customize the interview before launching.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Create New Project
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        {renderStepContent()}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        {activeStep > 0 && (
          <Button onClick={handleBack} sx={{ mr: 1 }}>
            Back
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!isStepValid()}
        >
          {activeStep === steps.length - 1 ? 'Create Project' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectCreationWizard;
```

#### Interview Management
```jsx
// InterviewManagement.tsx
import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Tabs, Tab, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Tooltip 
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProjectDetails, 
  fetchInterviewResponses,
  toggleInterviewCollection,
  selectProjectById,
  selectInterviewResponses
} from '../store/projectsSlice';
import { formatDate, formatDuration } from '../utils/dateUtils';
import { AppDispatch } from '../store/store';
import InterviewResponseModal from '../components/InterviewResponseModal';
import { InterviewResponse, InterviewStatus } from '../types/interview';

const InterviewManagement: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const project = useSelector((state) => selectProjectById(state, projectId));
  const responses = useSelector(selectInterviewResponses);
  const [tabValue, setTabValue] = useState(0);
  const [selectedResponse, setSelectedResponse] = useState<InterviewResponse | null>(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectDetails(projectId));
      dispatch(fetchInterviewResponses(projectId));
    }
  }, [dispatch, projectId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleToggleCollection = () => {
    if (projectId) {
      dispatch(toggleInterviewCollection(projectId));
    }
  };

  const handleViewResponse = (response: InterviewResponse) => {
    setSelectedResponse(response);
    setResponseModalOpen(true);
  };

  const handleCloseResponseModal = () => {
    setResponseModalOpen(false);
  };

  const handleExportResponses = () => {
    // Implementation for exporting responses
    console.log('Export responses');
  };

  const getFilteredResponses = () => {
    if (!responses) return [];
    
    switch (tabValue) {
      case 0: // All
        return responses;
      case 1: // Completed
        return responses.filter(r => r.status === InterviewStatus.COMPLETED);
      case 2: // In Progress
        return responses.filter(r => r.status === InterviewStatus.IN_PROGRESS);
      case 3: // Abandoned
        return responses.filter(r => r.status === InterviewStatus.ABANDONED);
      default:
        return responses;
    }
  };

  const getStatusColor = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.COMPLETED:
        return 'success';
      case InterviewStatus.IN_PROGRESS:
        return 'primary';
      case InterviewStatus.ABANDONED:
        return 'error';
      default:
        return 'default';
    }
  };

  if (!project) {
    return <Typography>Loading project details...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Interview Management: {project.name}
        </Typography>
        <Box>
          <Button
            variant={project.isCollecting ? 'outlined' : 'contained'}
            color={project.isCollecting ? 'error' : 'success'}
            startIcon={project.isCollecting ? <PauseIcon /> : <PlayArrowIcon />}
            onClick={handleToggleCollection}
            sx={{ mr: 2 }}
          >
            {project.isCollecting ? 'Pause Collection' : 'Start Collection'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportResponses}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="body1">
          Responses: {project.responseCount} / {project.targetResponseCount}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Collection URL: {project.collectionUrl}
        </Typography>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={`All (${responses?.length || 0})`} />
          <Tab label={`Completed (${responses?.filter(r => r.status === InterviewStatus.COMPLETED).length || 0})`} />
          <Tab label={`In Progress (${responses?.filter(r => r.status === InterviewStatus.IN_PROGRESS).length || 0})`} />
          <Tab label={`Abandoned (${responses?.filter(r => r.status === InterviewStatus.ABANDONED).length || 0})`} />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Respondent ID</TableCell>
                <TableCell>Started</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Completion %</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredResponses().map((response) => (
                <TableRow key={response.id}>
                  <TableCell>{response.respondentId}</TableCell>
                  <TableCell>{formatDate(response.startedAt)}</TableCell>
                  <TableCell>{formatDuration(response.duration)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={response.status} 
                      color={getStatusColor(response.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{response.completionPercentage}%</TableCell>
                  <TableCell>
                    <Tooltip title="View Response">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewResponse(response)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <InterviewResponseModal
        open={responseModalOpen}
        onClose={handleCloseResponseModal}
        response={selectedResponse}
      />
    </Box>
  );
};

export default InterviewManagement;
```

#### Analysis Dashboard
```jsx
// AnalysisDashboard.tsx
import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Grid, Tabs, Tab, 
  Button, CircularProgress, Divider 
} from '@mui/material';
import { 
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProjectAnalysis, 
  generateProjectReport,
  selectProjectById,
  selectProjectAnalysis
} from '../store/projectsSlice';
import { AppDispatch } from '../store/store';
import EmotionAnalysisChart from '../components/analysis/EmotionAnalysisChart';
import ThemeAnalysisChart from '../components/analysis/ThemeAnalysisChart';
import SentimentTimeline from '../components/analysis/SentimentTimeline';
import KeyInsightsList from '../components/analysis/KeyInsightsList';
import RecommendationsList from '../components/analysis/RecommendationsList';
import EmotionalDriversChart from '../components/analysis/EmotionalDriversChart';

const AnalysisDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const project = useSelector((state) => selectProjectById(state, projectId));
  const analysis = useSelector(selectProjectAnalysis);
  const [tabValue, setTabValue] = useState(0);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectAnalysis(projectId));
    }
  }, [dispatch, projectId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefreshAnalysis = () => {
    if (projectId) {
      dispatch(fetchProjectAnalysis(projectId));
    }
  };

  const handleGenerateReport = async () => {
    if (projectId) {
      setIsGeneratingReport(true);
      await dispatch(generateProjectReport(projectId));
      setIsGeneratingReport(false);
    }
  };

  if (!project || !analysis) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Overview
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Key Insights
                </Typography>
                <KeyInsightsList insights={analysis.keyInsights} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Emotional Drivers
                </Typography>
                <EmotionalDriversChart drivers={analysis.emotionalDrivers} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recommendations
                </Typography>
                <RecommendationsList recommendations={analysis.recommendations} />
              </Paper>
            </Grid>
          </Grid>
        );
      case 1: // Emotion Analysis
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Emotion Distribution
                </Typography>
                <EmotionAnalysisChart emotionData={analysis.emotionAnalysis.distribution} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Emotional Journey
                </Typography>
                <SentimentTimeline timelineData={analysis.emotionAnalysis.journey} />
              </Paper>
            </Grid>
          </Grid>
        );
      case 2: // Language Analysis
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Key Themes
                </Typography>
                <ThemeAnalysisChart themeData={analysis.languageAnalysis.keyThemes} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Implicit Needs
                </Typography>
                <Box>
                  {analysis.languageAnalysis.implicitNeeds.map((need, index) => (
                    <Box key={index} mb={2}>
                      <Typography variant="subtitle1">{need.need}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Evidence: {need.evidence}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Confidence: {need.confidence}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Decision Factors
                </Typography>
                <Box>
                  {analysis.languageAnalysis.decisionFactors.map((factor, index) => (
                    <Box key={index} mb={2}>
                      <Typography variant="subtitle1">{factor.factor}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Importance: {factor.importance}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quote: "{factor.quotes[0]}"
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        );
      case 3: // Opportunities
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Opportunity Areas
                </Typography>
                <Box>
                  {analysis.opportunityAreas.map((opportunity, index) => (
                    <Box key={index} mb={3}>
                      <Typography variant="subtitle1">{opportunity.area}</Typography>
                      <Typography variant="body1" paragraph>
                        {opportunity.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Potential Impact: {opportunity.potentialImpact}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Implementation Complexity: {opportunity.implementationComplexity}
                        </Typography>
                      </Box>
                      <Divider sx={{ mt: 2 }} />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Analysis Dashboard: {project.name}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshAnalysis}
            sx={{ mr: 2 }}
          >
            Refresh Analysis
          </Button>
          <Button
            variant="contained"
            startIcon={isGeneratingReport ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? 'Generating...' : 'Generate Report'}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Overview" />
          <Tab label="Emotion Analysis" />
          <Tab label="Language Analysis" />
          <Tab label="Opportunities" />
        </Tabs>

        <Box p={3}>
          {renderTabContent()}
        </Box>
      </Paper>
    </Box>
  );
};

export default AnalysisDashboard;
```

### Admin Dashboard Routing and Layout

```jsx
// App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';
import theme from './theme';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import ProjectCreationWizard from './pages/ProjectCreationWizard';
import ProjectDetails from './pages/ProjectDetails';
import InterviewManagement from './pages/InterviewManagement';
import AnalysisDashboard from './pages/AnalysisDashboard';
import ClientList from './pages/ClientList';
import ClientDetails from './pages/ClientDetails';
import Settings from './pages/Settings';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              <Route path="projects">
                <Route index element={<ProjectList />} />
                <Route path="new" element={<ProjectCreationWizard />} />
                <Route path=":projectId">
                  <Route index element={<ProjectDetails />} />
                  <Route path="interviews" element={<InterviewManagement />} />
                  <Route path="analysis" element={<AnalysisDashboard />} />
                </Route>
              </Route>
              
              <Route path="clients">
                <Route index element={<ClientList />} />
                <Route path=":clientId" element={<ClientDetails />} />
              </Route>
              
              <Route path="settings" element={<Settings />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
```

```jsx
// AdminLayout.tsx
import React, { useState } from 'react';
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, 
  Divider, IconButton, ListItem, ListItemIcon, 
  ListItemText, Avatar, Menu, MenuItem, Tooltip 
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../store/authSlice';

const drawerWidth = 240;

const AdminLayout: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Projects', icon: <AssignmentIcon />, path: '/projects' },
    { text: 'Clients', icon: <BusinessIcon />, path: '/clients' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: (theme) => theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Jade Kite Admin
          </Typography>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls="menu-appbar"
              aria-haspopup="true"
            >
              <Avatar alt={currentUser?.name} src={currentUser?.avatar} />
            </IconButton>
          </Tooltip>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={() => navigate('/settings/profile')}>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            ...(open ? {
              overflowX: 'hidden',
              transition: (theme) => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            } : {
              overflowX: 'hidden',
              transition: (theme) => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              width: (theme) => theme.spacing(7),
              [theme.breakpoints.up('sm')]: {
                width: (theme) => theme.spacing(9),
              },
            }),
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname.startsWith(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : 72}px)` },
          ml: { sm: `${open ? drawerWidth : 72}px` },
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
```

## 2. Client Portal

### Purpose
The Client Portal provides clients with a secure, user-friendly interface to view project progress, insights, and reports.

### Technology Stack
- **Framework**: React.js with TypeScript
- **UI Library**: Material-UI
- **State Management**: Redux Toolkit
- **Charts**: Recharts
- **Authentication**: JWT with client-specific access

### Key Features

#### Client Dashboard
```jsx
// ClientDashboard.tsx
import React, { useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Button, 
  Card, CardContent, CardActions, Chip 
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientProjects, selectClientProjects } from '../store/projectsSlice';
import { selectCurrentClient } from '../store/authSlice';
import { formatDate } from '../utils/dateUtils';
import { Link } from 'react-router-dom';
import { ProjectStatus } from '../types/project';
import ProjectStatusChart from '../components/client/ProjectStatusChart';

const statusColors = {
  [ProjectStatus.DRAFT]: 'default',
  [ProjectStatus.IN_PROGRESS]: 'primary',
  [ProjectStatus.COLLECTING]: 'secondary',
  [ProjectStatus.ANALYZING]: 'info',
  [ProjectStatus.COMPLETED]: 'success',
};

const ClientDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const projects = useSelector(selectClientProjects);
  const client = useSelector(selectCurrentClient);

  useEffect(() => {
    dispatch(fetchClientProjects());
  }, [dispatch]);

  const recentProjects = projects.slice(0, 3);
  const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Welcome, {client?.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h4">{projects.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Projects
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h4">
                    {projects.filter(p => p.status === ProjectStatus.IN_PROGRESS || p.status === ProjectStatus.COLLECTING).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Projects
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h4">{completedProjects.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Projects
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Typography variant="h6" gutterBottom>
            Recent Projects
          </Typography>
          <Grid container spacing={3}>
            {recentProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {formatDate(project.createdAt)}
                    </Typography>
                    <Chip 
                      label={project.status} 
                      color={statusColors[project.status]} 
                      size="small" 
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2">
                      {project.productCategory}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<VisibilityIcon />}
                      component={Link}
                      to={`/projects/${project.id}`}
                    >
                      View
                    </Button>
                    {project.status === ProjectStatus.COMPLETED && (
                      <Button 
                        size="small" 
                        startIcon={<DownloadIcon />}
                        component={Link}
                        to={`/projects/${project.id}/report`}
                      >
                        Report
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Status
            </Typography>
            <ProjectStatusChart projects={projects} />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Reports
            </Typography>
            {completedProjects.slice(0, 5).map((project) => (
              <Box key={project.id} mb={2} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body1">{project.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(project.completedAt)}
                  </Typography>
                </Box>
                <Button 
                  size="small" 
                  startIcon={<DownloadIcon />}
                  component={Link}
                  to={`/projects/${project.id}/report`}
                >
                  Download
                </Button>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientDashboard;
```

#### Project Details View
```jsx
// ClientProjectDetails.tsx
import React, { useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Chip, 
  Button, Divider, LinearProgress 
} from '@mui/material';
import { 
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProjectDetails, 
  selectProjectById 
} from '../store/projectsSlice';
import { formatDate } from '../utils/dateUtils';
import { ProjectStatus } from '../types/project';
import ProjectTimeline from '../components/client/ProjectTimeline';

const statusColors = {
  [ProjectStatus.DRAFT]: 'default',
  [ProjectStatus.IN_PROGRESS]: 'primary',
  [ProjectStatus.COLLECTING]: 'secondary',
  [ProjectStatus.ANALYZING]: 'info',
  [ProjectStatus.COMPLETED]: 'success',
};

const ClientProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch();
  const project = useSelector((state) => selectProjectById(state, projectId));

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectDetails(projectId));
    }
  }, [dispatch, projectId]);

  if (!project) {
    return <Typography>Loading project details...</Typography>;
  }

  const getProgressPercentage = () => {
    switch (project.status) {
      case ProjectStatus.DRAFT:
        return 10;
      case ProjectStatus.IN_PROGRESS:
        return 30;
      case ProjectStatus.COLLECTING:
        return 50 + (project.responseCount / project.targetResponseCount) * 20;
      case ProjectStatus.ANALYZING:
        return 80;
      case ProjectStatus.COMPLETED:
        return 100;
      default:
        return 0;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          {project.name}
        </Typography>
        {project.status === ProjectStatus.COMPLETED && (
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            href={`/api/projects/${projectId}/report`}
          >
            Download Report
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Product Category
            </Typography>
            <Typography variant="body1" gutterBottom>
              {project.productCategory}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip 
              label={project.status} 
              color={statusColors[project.status]} 
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Created On
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(project.createdAt)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Target Responses
            </Typography>
            <Typography variant="body1" gutterBottom>
              {project.responseCount} / {project.targetResponseCount}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Project Progress
            </Typography>
            <Box display="flex" alignItems="center">
              <Box width="100%" mr={1}>
                <LinearProgress 
                  variant="determinate" 
                  value={getProgressPercentage()} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Box minWidth={35}>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(getProgressPercentage())}%
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Project Timeline
            </Typography>
            <ProjectTimeline project={project} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" mt={2}>
              Research Objectives
            </Typography>
            <Typography variant="body1" paragraph>
              {project.objectives}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary">
              Target Audience
            </Typography>
            <Typography variant="body1" paragraph>
              {project.targetAudience}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">
              {project.description}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {project.status === ProjectStatus.COMPLETED && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Key Insights Preview
          </Typography>
          <Box mt={2}>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              href={`/projects/${projectId}/insights`}
              sx={{ mr: 2 }}
            >
              View Full Insights
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              href={`/api/projects/${projectId}/report`}
            >
              Download Report
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ClientProjectDetails;
```

#### Insights View
```jsx
// ClientInsightsView.tsx
import React, { useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, 
  Divider, Chip, List, ListItem, ListItemText 
} from '@mui/material';
import { 
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProjectInsights, 
  selectProjectById,
  selectProjectInsights
} from '../store/projectsSlice';
import EmotionAnalysisChart from '../components/client/EmotionAnalysisChart';
import ThemeAnalysisChart from '../components/client/ThemeAnalysisChart';
import RecommendationCard from '../components/client/RecommendationCard';

const ClientInsightsView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch();
  const project = useSelector((state) => selectProjectById(state, projectId));
  const insights = useSelector(selectProjectInsights);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectInsights(projectId));
    }
  }, [dispatch, projectId]);

  if (!project || !insights) {
    return <Typography>Loading insights...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            component={Link}
            to={`/projects/${projectId}`}
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back to Project
          </Button>
          <Typography variant="h5" component="h1">
            Insights: {project.name}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          href={`/api/projects/${projectId}/report`}
        >
          Download Full Report
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Executive Summary
        </Typography>
        <Typography variant="body1" paragraph>
          {insights.executiveSummary.summary}
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom>
          Key Takeaways
        </Typography>
        <List>
          {insights.executiveSummary.keyTakeaways.map((takeaway, index) => (
            <ListItem key={index}>
              <ListItemText 
                primary={takeaway.title} 
                secondary={takeaway.description} 
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Emotional Analysis
            </Typography>
            <EmotionAnalysisChart emotionData={insights.emotionAnalysis} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Emotional Drivers
            </Typography>
            <Box>
              {insights.emotionalDrivers.map((driver, index) => (
                <Box key={index} mb={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Chip 
                      label={driver.emotion} 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 1 }} 
                    />
                    <Typography variant="subtitle2">
                      {driver.description}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Triggers: {driver.triggers.join(', ')}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Key Themes
            </Typography>
            <ThemeAnalysisChart themeData={insights.keyThemes} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Unmet Needs
            </Typography>
            <List>
              {insights.unmetNeeds.map((need, index) => (
                <ListItem key={index} alignItems="flex-start">
                  <ListItemText
                    primary={need.need}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          Evidence:
                        </Typography>
                        {" " + need.evidence.emotional}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Recommendations
      </Typography>
      <Grid container spacing={3}>
        {insights.recommendations.map((recommendation, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <RecommendationCard recommendation={recommendation} />
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Opportunity Areas
        </Typography>
        <Grid container spacing={3}>
          {insights.opportunityAreas.map((opportunity, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box mb={2}>
                <Typography variant="subtitle1">{opportunity.area}</Typography>
                <Typography variant="body2" paragraph>
                  {opportunity.description}
                </Typography>
                <Box display="flex" justifyContent="space-between">
                  <Chip 
                    label={`Impact: ${opportunity.potentialImpact}`} 
                    size="small" 
                    color={
                      opportunity.potentialImpact === 'high' ? 'success' : 
                      opportunity.potentialImpact === 'medium' ? 'primary' : 'default'
                    }
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={`Complexity: ${opportunity.implementationComplexity}`} 
                    size="small"
                    color={
                      opportunity.implementationComplexity === 'low' ? 'success' : 
                      opportunity.implementationComplexity === 'medium' ? 'primary' : 'error'
                    }
                  />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ClientInsightsView;
```

### Client Portal Routing and Layout

```jsx
// ClientApp.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';
import clientTheme from './theme/clientTheme';
import ClientLayout from './layouts/ClientLayout';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProjectList from './pages/client/ClientProjectList';
import ClientProjectDetails from './pages/client/ClientProjectDetails';
import ClientInsightsView from './pages/client/ClientInsightsView';
import ClientReportView from './pages/client/ClientReportView';
import ClientLogin from './pages/client/ClientLogin';
import ClientPrivateRoute from './components/client/ClientPrivateRoute';

const ClientApp: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={clientTheme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<ClientLogin />} />
            
            <Route path="/" element={
              <ClientPrivateRoute>
                <ClientLayout />
              </ClientPrivateRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<ClientDashboard />} />
              
              <Route path="projects">
                <Route index element={<ClientProjectList />} />
                <Route path=":projectId">
                  <Route index element={<ClientProjectDetails />} />
                  <Route path="insights" element={<ClientInsightsView />} />
                  <Route path="report" element={<ClientReportView />} />
                </Route>
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

export default ClientApp;
```

```jsx
// ClientLayout.tsx
import React, { useState } from 'react';
import { 
  Box, AppBar, Toolbar, Typography, Button, 
  Container, Avatar, Menu, MenuItem, IconButton, 
  Drawer, List, ListItem, ListItemIcon, ListItemText, 
  Divider, useMediaQuery, useTheme 
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentClient } from '../store/authSlice';

const ClientLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const client = useSelector(selectCurrentClient);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Projects', icon: <AssignmentIcon />, path: '/projects' },
  ];

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div">
          Jade Kite
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            selected={location.pathname.startsWith(item.path)}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Jade Kite Client Portal
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
              {client?.name}
            </Typography>
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              aria-controls="menu-appbar"
              aria-haspopup="true"
            >
              <Avatar alt={client?.name} src={client?.logo} />
            </IconButton>
          </Box>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          mt: '64px',
        }}
      >
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default ClientLayout;
```

## 3. Respondent Interface

### Purpose
The Respondent Interface provides a clean, engaging experience for interview participants to interact with the AI-moderated interview.

### Technology Stack
- **Framework**: React.js with TypeScript
- **UI Library**: Material-UI with custom styling
- **State Management**: React Context API
- **Audio Recording**: MediaRecorder API
- **Animation**: Framer Motion

### Key Features

#### Interview Landing Page
```jsx
// InterviewLanding.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Stepper, 
  Step, StepLabel, CircularProgress, Container 
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchInterviewDetails } from '../api/interviewApi';
import { useInterviewContext } from '../contexts/InterviewContext';
import AudioPermissionCheck from '../components/interview/AudioPermissionCheck';
import BrowserCompatibilityCheck from '../components/interview/BrowserCompatibilityCheck';

const steps = ['Compatibility Check', 'Audio Permission', 'Ready to Begin'];

const InterviewLanding: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const { setInterviewData } = useInterviewContext();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [browserCompatible, setBrowserCompatible] = useState(false);
  const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);

  useEffect(() => {
    const loadInterviewDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchInterviewDetails(interviewId);
        setInterviewData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load interview. Please check the URL and try again.');
        setLoading(false);
      }
    };

    loadInterviewDetails();
  }, [interviewId, setInterviewData]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBrowserCompatibilityResult = (isCompatible: boolean) => {
    setBrowserCompatible(isCompatible);
    if (isCompatible) {
      handleNext();
    }
  };

  const handleAudioPermissionResult = (isGranted: boolean) => {
    setAudioPermissionGranted(isGranted);
    if (isGranted) {
      handleNext();
    }
  };

  const handleStartInterview = () => {
    navigate(`/interview/${interviewId}/questions`);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <BrowserCompatibilityCheck 
            onResult={handleBrowserCompatibilityResult} 
          />
        );
      case 1:
        return (
          <AudioPermissionCheck 
            onResult={handleAudioPermissionResult} 
          />
        );
      case 2:
        return (
          <Box textAlign="center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h5" gutterBottom>
                You're all set!
              </Typography>
              <Typography variant="body1" paragraph>
                Thank you for taking the time to share your thoughts with us. This interview will take approximately 5-10 minutes to complete.
              </Typography>
              <Typography variant="body1" paragraph>
                Please find a quiet place where you can speak freely. Your responses will be recorded and analyzed to help improve products and services.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleStartInterview}
                sx={{ mt: 2 }}
              >
                Start Interview
              </Button>
            </motion.div>
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error
          </Typography>
          <Typography variant="body1">
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
          }}
        >
          <Box mb={4} textAlign="center">
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to Your Interview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Let's make sure everything is set up correctly before we begin.
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box py={2}>
            {renderStepContent()}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default InterviewLanding;
```

#### Interview Question Interface
```jsx
// InterviewQuestions.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Button, Paper, CircularProgress, 
  LinearProgress, Container, IconButton, Fade 
} from '@mui/material';
import { 
  Mic as MicIcon, 
  Stop as StopIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterviewContext } from '../contexts/InterviewContext';
import { 
  startRecording, 
  stopRecording, 
  submitResponse,
  fetchNextQuestion
} from '../api/interviewApi';
import AudioWaveform from '../components/interview/AudioWaveform';
import AIResponseBubble from '../components/interview/AIResponseBubble';

const InterviewQuestions: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const { interviewData, updateProgress } = useInterviewContext();
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const fetchFirstQuestion = async () => {
      try {
        setLoading(true);
        const question = await fetchNextQuestion(interviewId);
        setCurrentQuestion(question);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch first question:', err);
        setLoading(false);
      }
    };

    fetchFirstQuestion();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [interviewId]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks of the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
        
        // Auto-stop after 2 minutes
        if (seconds >= 120) {
          handleStopRecording();
        }
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSubmitResponse = async () => {
    if (!audioBlob) return;
    
    try {
      setSubmitting(true);
      
      const response = await submitResponse(
        interviewId, 
        currentQuestion.id, 
        audioBlob
      );
      
      // Update progress
      updateProgress(response.progress);
      
      // Show AI response
      setAiResponse(response.aiResponse);
      
      // Check for follow-up question
      if (response.followUpQuestion) {
        setFollowUpQuestion(response.followUpQuestion);
        setShowFollowUp(true);
      } else {
        // Wait for animation and then proceed
        setTimeout(() => {
          handleProceedToNextQuestion();
        }, 3000);
      }
      
      setSubmitting(false);
    } catch (err) {
      console.error('Error submitting response:', err);
      setSubmitting(false);
    }
  };

  const handleProceedToNextQuestion = async () => {
    try {
      setLoading(true);
      setAiResponse(null);
      setFollowUpQuestion(null);
      setShowFollowUp(false);
      setAudioBlob(null);
      
      const nextQuestion = await fetchNextQuestion(interviewId);
      
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
        setLoading(false);
      } else {
        // Interview is complete
        setInterviewComplete(true);
        setTimeout(() => {
          navigate(`/interview/${interviewId}/complete`);
        }, 2000);
      }
    } catch (err) {
      console.error('Error fetching next question:', err);
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading && !currentQuestion) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Box mb={2}>
          <LinearProgress 
            variant="determinate" 
            value={interviewData?.progress || 0} 
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body2" color="text.secondary">
              Progress: {Math.round(interviewData?.progress || 0)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Question {currentQuestion?.questionNumber} of {interviewData?.totalQuestions}
            </Typography>
          </Box>
        </Box>

        <AnimatePresence mode="wait">
          {interviewComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  borderRadius: 2,
                  textAlign: 'center',
                  background: 'linear-gradient(to right bottom, #e8f5e9, #c8e6c9)'
                }}
              >
                <Typography variant="h5" gutterBottom>
                  Interview Complete!
                </Typography>
                <Typography variant="body1">
                  Thank you for your responses. Redirecting to the completion page...
                </Typography>
                <CircularProgress sx={{ mt: 2 }} />
              </Paper>
            </motion.div>
          ) : (
            <motion.div
              key={currentQuestion?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  borderRadius: 2,
                  background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
                }}
              >
                <Typography variant="h5" gutterBottom>
                  {followUpQuestion && showFollowUp ? 'Follow-up Question' : currentQuestion?.sectionTitle}
                </Typography>
                
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
                  {followUpQuestion && showFollowUp ? followUpQuestion : currentQuestion?.text}
                </Typography>
                
                {aiResponse && (
                  <Box mb={4}>
                    <AIResponseBubble text={aiResponse} />
                  </Box>
                )}
                
                <Box mt={4}>
                  {!audioBlob ? (
                    <Box textAlign="center">
                      {isRecording ? (
                        <Box>
                          <AudioWaveform isRecording={isRecording} />
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Recording: {formatTime(recordingTime)}
                          </Typography>
                          <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<StopIcon />}
                            onClick={handleStopRecording}
                            sx={{ mt: 2 }}
                          >
                            Stop Recording
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<MicIcon />}
                          onClick={handleStartRecording}
                          size="large"
                        >
                          Start Recording
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <Box textAlign="center">
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Recording complete: {formatTime(recordingTime)}
                      </Typography>
                      
                      <Box display="flex" justifyContent="center" mt={2}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setAudioBlob(null);
                            setRecordingTime(0);
                          }}
                          sx={{ mr: 2 }}
                        >
                          Discard & Re-record
                        </Button>
                        
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSubmitResponse}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <CircularProgress size={24} />
                          ) : (
                            'Submit Response'
                          )}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
                
                {showFollowUp && (
                  <Fade in={showFollowUp}>
                    <Box textAlign="right" mt={3}>
                      <Button
                        variant="text"
                        color="primary"
                        endIcon={<ArrowForwardIcon />}
                        onClick={handleProceedToNextQuestion}
                      >
                        Skip follow-up & continue
                      </Button>
                    </Box>
                  </Fade>
                )}
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Container>
  );
};

export default InterviewQuestions;
```

#### Interview Completion Page
```jsx
// InterviewComplete.tsx
import React, { useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Container, 
  Divider, List, ListItem, ListItemIcon, ListItemText 
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  ThumbUp as ThumbUpIcon,
  InsertEmoticon as InsertEmoticonIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useInterviewContext } from '../contexts/InterviewContext';
import { completeInterview } from '../api/interviewApi';

const InterviewComplete: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const { interviewData } = useInterviewContext();

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Mark interview as complete
    if (interviewId) {
      completeInterview(interviewId).catch(err => {
        console.error('Error completing interview:', err);
      });
    }
  }, [interviewId]);

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2,
              background: 'linear-gradient(to right bottom, #e8f5e9, #c8e6c9)'
            }}
          >
            <Box textAlign="center" mb={4}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2
                }}
              >
                <CheckCircleIcon 
                  color="success" 
                  sx={{ fontSize: 80, mb: 2 }} 
                />
              </motion.div>
              
              <Typography variant="h4" component="h1" gutterBottom>
                Thank You!
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Your interview has been successfully completed
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Box mb={4}>
              <Typography variant="body1" paragraph>
                We appreciate you taking the time to share your thoughts and experiences with us. Your feedback is incredibly valuable and will help improve {interviewData?.productCategory} products and services.
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Your responses have been recorded" 
                    secondary="All your answers have been successfully saved in our system"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ThumbUpIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Your insights will make a difference" 
                    secondary="Your feedback will directly influence future improvements"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InsertEmoticonIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Your emotional responses were captured" 
                    secondary="Our system analyzed both what you said and how you felt"
                  />
                </ListItem>
              </List>
            </Box>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary" paragraph>
                You may now close this window or return to the website that directed you here.
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => window.close()}
                sx={{ mt: 2 }}
              >
                Close Window
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default InterviewComplete;
```

### Respondent Interface Routing

```jsx
// RespondentApp.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import respondentTheme from './theme/respondentTheme';
import { InterviewProvider } from './contexts/InterviewContext';
import InterviewLanding from './pages/interview/InterviewLanding';
import InterviewQuestions from './pages/interview/InterviewQuestions';
import InterviewComplete from './pages/interview/InterviewComplete';
import NotFound from './pages/NotFound';

const RespondentApp: React.FC = () => {
  return (
    <ThemeProvider theme={respondentTheme}>
      <CssBaseline />
      <InterviewProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/not-found" replace />} />
            <Route path="/interview/:interviewId" element={<InterviewLanding />} />
            <Route path="/interview/:interviewId/questions" element={<InterviewQuestions />} />
            <Route path="/interview/:interviewId/complete" element={<InterviewComplete />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </BrowserRouter>
      </InterviewProvider>
    </ThemeProvider>
  );
};

export default RespondentApp;
```

## Implementation Plan

### Phase 1: Admin Dashboard (Weeks 1-3)
1. Set up project structure and base components
2. Implement authentication and user management
3. Create project management interfaces
4. Develop interview management screens
5. Build analysis dashboard with visualization components

### Phase 2: Client Portal (Weeks 4-5)
1. Set up client authentication and access control
2. Create client dashboard and project list views
3. Implement insights and report viewing interfaces
4. Develop project timeline and status tracking

### Phase 3: Respondent Interface (Weeks 6-7)
1. Create interview flow and question presentation
2. Implement audio recording and submission
3. Develop AI response display and follow-up handling
4. Build completion and thank you screens

### Phase 4: Integration and Testing (Week 8)
1. Connect all interfaces to backend APIs
2. Implement end-to-end testing
3. Perform cross-browser and responsive design testing
4. Optimize performance and accessibility

## Conclusion

The frontend interfaces for the Rapid Consumer Sentiment Analysis service provide a comprehensive set of tools for all stakeholders:

1. **Admin Dashboard** gives the Jade Kite team complete control over project management, interview moderation, and insight generation with powerful visualization tools.

2. **Client Portal** provides clients with an intuitive interface to track project progress, view insights, and access reports, enhancing transparency and client engagement.

3. **Respondent Interface** delivers a seamless, engaging experience for interview participants with clear guidance, real-time feedback, and a conversational feel that encourages rich, emotional responses.

All interfaces are designed with responsive layouts to work across devices, accessibility features for inclusive use, and performance optimizations to ensure smooth operation. The modular architecture allows for easy maintenance and future enhancements as the service evolves.
