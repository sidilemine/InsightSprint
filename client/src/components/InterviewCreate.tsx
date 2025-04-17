import React, { useState } from 'react';
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
  Divider,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

const InterviewCreate = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [questions, setQuestions] = useState([
    { id: 1, text: '', type: 'open_ended' }
  ]);
  const [successMessage, setSuccessMessage] = useState('');

  const steps = ['Basic Information', 'Questions Setup', 'Participant Criteria', 'Review & Create'];

  const validationSchema = Yup.object({
    projectId: Yup.string().required('Project is required'),
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    objective: Yup.string().required('Research objective is required'),
    duration: Yup.number()
      .required('Estimated duration is required')
      .min(1, 'Duration must be at least 1 minute')
      .max(60, 'Duration must be at most 60 minutes'),
  });

  const formik = useFormik({
    initialValues: {
      projectId: '',
      title: '',
      description: '',
      objective: '',
      duration: 15,
      ageRange: 'all',
      gender: 'all',
      location: 'all',
      customCriteria: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // In a real implementation, this would send data to the API
        console.log('Form values:', values);
        console.log('Questions:', questions);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSuccessMessage('Interview created successfully!');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/admin/interviews');
        }, 2000);
      } catch (error) {
        console.error('Error creating interview:', error);
      }
    },
  });

  const handleNext = () => {
    if (activeStep === 1) {
      // Validate that we have at least one question
      if (questions.length === 0 || questions.some(q => !q.text.trim())) {
        return;
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { id: questions.length + 1, text: '', type: 'open_ended' }
    ]);
  };

  const handleRemoveQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(question => question.id !== id));
    }
  };

  const handleQuestionChange = (id, field, value) => {
    setQuestions(questions.map(question => 
      question.id === id ? { ...question, [field]: value } : question
    ));
  };

  const getProjectOptions = () => {
    // In a real implementation, this would fetch from the API
    return [
      { id: 'project-1', name: 'Beverage Product Testing' },
      { id: 'project-2', name: 'Snack Packaging Feedback' },
      { id: 'project-3', name: 'New Product Concept Evaluation' }
    ];
  };

  const renderBasicInformation = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.projectId && Boolean(formik.errors.projectId)}>
            <InputLabel id="project-label">Project</InputLabel>
            <Select
              labelId="project-label"
              id="projectId"
              name="projectId"
              value={formik.values.projectId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Project"
            >
              {getProjectOptions().map(project => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.projectId && formik.errors.projectId && (
              <FormHelperText>{formik.errors.projectId}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="title"
            name="title"
            label="Interview Title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            multiline
            rows={3}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="objective"
            name="objective"
            label="Research Objective"
            multiline
            rows={2}
            value={formik.values.objective}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.objective && Boolean(formik.errors.objective)}
            helperText={formik.touched.objective && formik.errors.objective}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="duration"
            name="duration"
            label="Estimated Duration (minutes)"
            type="number"
            value={formik.values.duration}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.duration && Boolean(formik.errors.duration)}
            helperText={formik.touched.duration && formik.errors.duration}
            InputProps={{ inputProps: { min: 1, max: 60 } }}
          />
        </Grid>
      </Grid>
    );
  };

  const renderQuestionsSetup = () => {
    return (
      <>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Interview Questions
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddQuestion}
          >
            Add Question
          </Button>
        </Box>
        
        {questions.map((question, index) => (
          <Card key={question.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1">
                  Question {index + 1}
                </Typography>
                
                <IconButton 
                  size="small" 
                  color="error" 
                  onClick={() => handleRemoveQuestion(question.id)}
                  disabled={questions.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Question Text"
                    value={question.text}
                    onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                    required
                    error={!question.text.trim()}
                    helperText={!question.text.trim() ? 'Question text is required' : ''}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Question Type</InputLabel>
                    <Select
                      value={question.type}
                      onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
                      label="Question Type"
                    >
                      <MenuItem value="open_ended">Open-Ended</MenuItem>
                      <MenuItem value="scale">Scale (1-5)</MenuItem>
                      <MenuItem value="yes_no">Yes/No</MenuItem>
                      <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
        
        {questions.length === 0 && (
          <Alert severity="warning">
            At least one question is required
          </Alert>
        )}
      </>
    );
  };

  const renderParticipantCriteria = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Age Range</InputLabel>
            <Select
              id="ageRange"
              name="ageRange"
              value={formik.values.ageRange}
              onChange={formik.handleChange}
              label="Age Range"
            >
              <MenuItem value="all">All Ages</MenuItem>
              <MenuItem value="18-24">18-24</MenuItem>
              <MenuItem value="25-34">25-34</MenuItem>
              <MenuItem value="35-44">35-44</MenuItem>
              <MenuItem value="45-54">45-54</MenuItem>
              <MenuItem value="55+">55+</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              id="gender"
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              label="Gender"
            >
              <MenuItem value="all">All Genders</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="non_binary">Non-Binary</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              id="location"
              name="location"
              value={formik.values.location}
              onChange={formik.handleChange}
              label="Location"
            >
              <MenuItem value="all">All Locations</MenuItem>
              <MenuItem value="us">United States</MenuItem>
              <MenuItem value="ca">Canada</MenuItem>
              <MenuItem value="uk">United Kingdom</MenuItem>
              <MenuItem value="eu">Europe</MenuItem>
              <MenuItem value="asia">Asia</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="customCriteria"
            name="customCriteria"
            label="Additional Criteria (Optional)"
            multiline
            rows={3}
            value={formik.values.customCriteria}
            onChange={formik.handleChange}
            placeholder="E.g., Regular consumers of plant-based beverages (at least once per week)"
          />
        </Grid>
      </Grid>
    );
  };

  const renderReview = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Project
                </Typography>
                <Typography variant="body1">
                  {getProjectOptions().find(p => p.id === formik.values.projectId)?.name || ''}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Title
                </Typography>
                <Typography variant="body1">
                  {formik.values.title}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">
                  {formik.values.description}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Research Objective
                </Typography>
                <Typography variant="body1">
                  {formik.values.objective}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Estimated Duration
                </Typography>
                <Typography variant="body1">
                  {formik.values.duration} minutes
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Questions ({questions.length})
            </Typography>
            
            {questions.map((question, index) => (
              <Box key={question.id} mb={2}>
                <Typography variant="subtitle2">
                  Question {index + 1}: {question.text}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {question.type.replace('_', ' ').charAt(0).toUpperCase() + question.type.replace('_', ' ').slice(1)}
                </Typography>
                {index < questions.length - 1 && <Divider sx={{ mt: 1 }} />}
              </Box>
            ))}
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Participant Criteria
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Age Range
                </Typography>
                <Typography variant="body1">
                  {formik.values.ageRange === 'all' ? 'All Ages' : formik.values.ageRange}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Gender
                </Typography>
                <Typography variant="body1">
                  {formik.values.gender === 'all' ? 'All Genders' : formik.values.gender.charAt(0).toUpperCase() + formik.values.gender.slice(1).replace('_', ' ')}
                </Typography>
 
(Content truncated due to size limit. Use line ranges to read in chunks)