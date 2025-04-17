import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ProjectCreate = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const steps = ['Project Details', 'Interview Questions', 'Participant Criteria', 'Review & Create'];
  
  const initialValues = {
    name: '',
    description: '',
    objective: '',
    category: '',
    targetResponseCount: 30,
    questions: [
      { id: 1, text: '', type: 'open_ended' }
    ],
    participantCriteria: {
      ageRange: 'all',
      gender: 'all',
      location: 'all',
      customCriteria: ''
    }
  };
  
  const validationSchema = Yup.object({
    name: Yup.string().required('Project name is required'),
    description: Yup.string().required('Description is required'),
    objective: Yup.string().required('Research objective is required'),
    category: Yup.string().required('Category is required'),
    targetResponseCount: Yup.number()
      .min(10, 'Minimum 10 responses required')
      .max(100, 'Maximum 100 responses allowed')
      .required('Target response count is required'),
    questions: Yup.array().of(
      Yup.object({
        text: Yup.string().required('Question text is required'),
        type: Yup.string().required('Question type is required')
      })
    ).min(1, 'At least one question is required')
  });
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleAddQuestion = (values, setValues) => {
    const newQuestion = {
      id: values.questions.length + 1,
      text: '',
      type: 'open_ended'
    };
    
    setValues({
      ...values,
      questions: [...values.questions, newQuestion]
    });
  };
  
  const handleRemoveQuestion = (questionId, values, setValues) => {
    if (values.questions.length === 1) {
      return; // Don't remove the last question
    }
    
    setValues({
      ...values,
      questions: values.questions.filter(q => q.id !== questionId)
    });
  };
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      setError('');
      
      // In a real implementation, this would call an API endpoint
      // For now, we'll just simulate a successful project creation
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Project created:', values);
      
      // Redirect to projects list
      navigate('/admin/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };
  
  const renderStepContent = (step, formikProps) => {
    const { values, errors, touched, setValues } = formikProps;
    
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Field
                as={TextField}
                fullWidth
                name="name"
                label="Project Name"
                variant="outlined"
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Field
                as={TextField}
                fullWidth
                name="description"
                label="Project Description"
                variant="outlined"
                multiline
                rows={3}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Field
                as={TextField}
                fullWidth
                name="objective"
                label="Research Objective"
                variant="outlined"
                multiline
                rows={2}
                error={touched.objective && Boolean(errors.objective)}
                helperText={touched.objective && errors.objective}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" error={touched.category && Boolean(errors.category)}>
                <InputLabel id="category-label">Category</InputLabel>
                <Field
                  as={Select}
                  labelId="category-label"
                  name="category"
                  label="Category"
                >
                  <MenuItem value="">Select a category</MenuItem>
                  <MenuItem value="food">Food</MenuItem>
                  <MenuItem value="beverage">Beverage</MenuItem>
                  <MenuItem value="snacks">Snacks</MenuItem>
                  <MenuItem value="dairy">Dairy</MenuItem>
                  <MenuItem value="organic">Organic</MenuItem>
                  <MenuItem value="packaging">Packaging</MenuItem>
                  <MenuItem value="branding">Branding</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Field>
                {touched.category && errors.category && (
                  <Typography variant="caption" color="error">
                    {errors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Field
                as={TextField}
                fullWidth
                name="targetResponseCount"
                label="Target Response Count"
                variant="outlined"
                type="number"
                InputProps={{ inputProps: { min: 10, max: 100 } }}
                error={touched.targetResponseCount && Boolean(errors.targetResponseCount)}
                helperText={touched.targetResponseCount && errors.targetResponseCount}
              />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="body1" paragraph>
              Define the questions for your voice interviews. These questions will be presented to participants during the AI-moderated interviews.
            </Typography>
            
            {values.questions.map((question, index) => (
              <Box key={question.id} mb={3} p={2} bgcolor="background.paper" borderRadius={1} boxShadow={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Question {index + 1}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name={`questions[${index}].text`}
                      label="Question Text"
                      variant="outlined"
                      multiline
                      rows={2}
                      error={
                        touched.questions?.[index]?.text && 
                        Boolean(errors.questions?.[index]?.text)
                      }
                      helperText={
                        touched.questions?.[index]?.text && 
                        errors.questions?.[index]?.text
                      }
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id={`question-type-label-${index}`}>Question Type</InputLabel>
                      <Field
                        as={Select}
                        labelId={`question-type-label-${index}`}
                        name={`questions[${index}].type`}
                        label="Question Type"
                      >
                        <MenuItem value="open_ended">Open-Ended</MenuItem>
                        <MenuItem value="scale">Scale (1-5)</MenuItem>
                        <MenuItem value="yes_no">Yes/No</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6} display="flex" justifyContent="flex-end" alignItems="center">
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleRemoveQuestion(question.id, values, setValues)}
                      disabled={values.questions.length === 1}
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ))}
            
            <Box mt={2}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleAddQuestion(values, setValues)}
              >
                Add Question
              </Button>
            </Box>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="body1" paragraph>
              Define the criteria for participants in your study. This will help target the right audience for your research.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="age-range-label">Age Range</InputLabel>
                  <Field
                    as={Select}
                    labelId="age-range-label"
                    name="participantCriteria.ageRange"
                    label="Age Range"
                  >
                    <MenuItem value="all">All Ages</MenuItem>
                    <MenuItem value="18-24">18-24</MenuItem>
                    <MenuItem value="25-34">25-34</MenuItem>
                    <MenuItem value="35-44">35-44</MenuItem>
                    <MenuItem value="45-54">45-54</MenuItem>
                    <MenuItem value="55+">55+</MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Field
                    as={Select}
                    labelId="gender-label"
                    name="participantCriteria.gender"
                    label="Gender"
                  >
                    <MenuItem value="all">All Genders</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="non_binary">Non-Binary</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="location-label">Location</InputLabel>
                  <Field
                    as={Select}
                    labelId="location-label"
                    name="participantCriteria.location"
                    label="Location"
                  >
                    <MenuItem value="all">All Locations</MenuItem>
                    <MenuItem value="us">United States</MenuItem>
                    <MenuItem value="canada">Canada</MenuItem>
                    <MenuItem value="uk">United Kingdom</MenuItem>
                    <MenuItem value="europe">Europe</MenuItem>
                    <MenuItem value="asia">Asia</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  fullWidth
                  name="participantCriteria.customCriteria"
                  label="Additional Criteria (Optional)"
                  variant="outlined"
                  multiline
                  rows={3}
                  placeholder="Describe any additional criteria for participants..."
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Project Summary
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Project Name
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {values.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {values.category.charAt(0).toUpperCase() + values.category.slice(1)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {values.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Research Objective
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {values.objective}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Target Response Count
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {values.targetResponseCount} responses
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Typography variant="h6" gutterBottom>
              Interview Questions ({values.questions.length})
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              {values.questions.map((question, index) => (
                <Box key={question.id} mb={index < values.questions.length - 1 ? 2 : 0}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Question {index + 1} ({question.type.replace('_', ' ')})
                  </Typography>
                  <Typography variant="body1" paragraph={index < values.questions.length - 1}>
                    {question.text}
                  </Typography>
                  {index < values.questions.length - 1 && <Divider sx={{ my
(Content truncated due to size limit. Use line ranges to read in chunks)