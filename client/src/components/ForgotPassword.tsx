import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Box,
  Alert
} from '@mui/material';

const ForgotPassword = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialValues = {
    email: ''
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required')
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setSuccess('');
      
      // In a real implementation, this would call an API endpoint
      // For now, we'll just simulate a successful password reset request
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Password reset instructions have been sent to your email.');
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Paper elevation={3}>
          <Box p={4}>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              Forgot Password
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            
            <Typography variant="body1" paragraph>
              Enter your email address below and we'll send you instructions to reset your password.
            </Typography>
            
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, touched, errors }) => (
                <Form>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        fullWidth
                        name="email"
                        label="Email Address"
                        variant="outlined"
                        error={touched.email && Boolean(errors.email)}
                        helperText={<ErrorMessage name="email" />}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                        sx={{ mt: 2 }}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
            
            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                Remember your password?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  Back to Login
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
