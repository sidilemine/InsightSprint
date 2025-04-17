import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required')
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setSuccess('');
      
      await register(values.name, values.email, values.password);
      
      setSuccess('Registration successful! Redirecting to login...');
      resetForm();
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
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
              Register
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
                        name="name"
                        label="Full Name"
                        variant="outlined"
                        error={touched.name && Boolean(errors.name)}
                        helperText={<ErrorMessage name="name" />}
                      />
                    </Grid>
                    
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
                      <Field
                        as={TextField}
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        variant="outlined"
                        error={touched.password && Boolean(errors.password)}
                        helperText={<ErrorMessage name="password" />}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        variant="outlined"
                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                        helperText={<ErrorMessage name="confirmPassword" />}
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
                        {isSubmitting ? 'Registering...' : 'Register'}
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
            
            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  Login
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
