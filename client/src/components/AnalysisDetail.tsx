import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';

// Mock data for development
const mockEmotionData = [
  { name: 'Joy', value: 35, color: '#4CAF50' },
  { name: 'Surprise', value: 20, color: '#2196F3' },
  { name: 'Sadness', value: 15, color: '#9C27B0' },
  { name: 'Anger', value: 10, color: '#F44336' },
  { name: 'Fear', value: 10, color: '#FF9800' },
  { name: 'Disgust', value: 5, color: '#795548' },
  { name: 'Neutral', value: 5, color: '#9E9E9E' }
];

const mockLanguageData = [
  { category: 'Positive', value: 65, color: '#4CAF50' },
  { category: 'Negative', value: 25, color: '#F44336' },
  { category: 'Neutral', value: 10, color: '#9E9E9E' }
];

const mockKeyThemes = [
  { theme: 'Product Quality', count: 28, sentiment: 'positive' },
  { theme: 'Ease of Use', count: 22, sentiment: 'positive' },
  { theme: 'Customer Service', count: 15, sentiment: 'negative' },
  { theme: 'Price', count: 12, sentiment: 'negative' },
  { theme: 'Packaging', count: 10, sentiment: 'neutral' }
];

const mockEmotionLanguageCorrelation = [
  { emotion: 'Joy', positiveLanguage: 85, negativeLanguage: 5, neutralLanguage: 10 },
  { emotion: 'Surprise', positiveLanguage: 60, negativeLanguage: 25, neutralLanguage: 15 },
  { emotion: 'Sadness', positiveLanguage: 10, negativeLanguage: 80, neutralLanguage: 10 },
  { emotion: 'Anger', positiveLanguage: 5, negativeLanguage: 90, neutralLanguage: 5 },
  { emotion: 'Fear', positiveLanguage: 15, negativeLanguage: 75, neutralLanguage: 10 },
  { emotion: 'Disgust', positiveLanguage: 5, negativeLanguage: 85, neutralLanguage: 10 },
  { emotion: 'Neutral', positiveLanguage: 30, negativeLanguage: 30, neutralLanguage: 40 }
];

const AnalysisDetail = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  
  // In a real implementation, we would fetch the analysis data from the API
  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        // Mock API call
        // const response = await axios.get(`/api/analyses/${id}`);
        // setAnalysis(response.data);
        
        // For development, use mock data
        setTimeout(() => {
          setAnalysis({
            title: 'Product Feedback Analysis - Q1 2025',
            description: 'Analysis of customer feedback for our new product line launched in Q1 2025',
            projectName: 'New Product Launch Feedback',
            createdAt: '2025-04-01T12:00:00Z',
            totalResponses: 150,
            emotionData: mockEmotionData,
            languageData: mockLanguageData,
            keyThemes: mockKeyThemes,
            emotionLanguageCorrelation: mockEmotionLanguageCorrelation
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching analysis:', error);
        setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!analysis) {
    return (
      <Box>
        <Typography variant="h5" component="h2">
          Analysis not found
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {analysis.title}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        {analysis.description}
      </Typography>
      
      <Box sx={{ mb: 4, display: 'flex', gap: 1 }}>
        <Chip label={`Project: ${analysis.projectName}`} color="primary" />
        <Chip label={`Responses: ${analysis.totalResponses}`} color="secondary" />
        <Chip label={`Created: ${new Date(analysis.createdAt).toLocaleDateString()}`} variant="outlined" />
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      <Typography variant="h5" component="h2" gutterBottom>
        Voice Emotion Analysis
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Emotional Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysis.emotionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analysis.emotionData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Language Sentiment Analysis
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analysis.languageData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="value" name="Percentage" radius={[5, 5, 0, 0]}>
                      {analysis.languageData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Typography variant="h5" component="h2" gutterBottom>
        Mixed Emotion-Language Analysis
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Emotion-Language Correlation
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This analysis shows how emotional expressions correlate with language sentiment, revealing deeper insights into consumer feedback.
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analysis.emotionLanguageCorrelation}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="emotion" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="positiveLanguage" name="Positive Language" stackId="a" fill="#4CAF50" />
                    <Bar dataKey="neutralLanguage" name="Neutral Language" stackId="a" fill="#9E9E9E" />
                    <Bar dataKey="negativeLanguage" name="Negative Language" stackId="a" fill="#F44336" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>Key Insight:</strong> While joy and surprise emotions typically correlate with positive language, 
                we observe that surprise can also be associated with negative language (25%). This suggests that some product 
                features may be surprising in a negative way, warranting further investigation.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Typography variant="h5" component="h2" gutterBottom>
        Key Themes
      </Typography>
      
      <TableContainer component={Paper} sx={{ mb: 6 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Theme</strong></TableCell>
              <TableCell align="right"><strong>Mention Count</strong></TableCell>
              <TableCell align="right"><strong>Sentiment</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analysis.keyThemes.map((theme: any) => (
              <TableRow key={theme.theme}>
                <TableCell component="th" scope="row">
                  {theme.theme}
                </TableCell>
                <TableCell align="right">{theme.count}</TableCell>
                <TableCell align="right">
                  <Chip 
                    label={theme.sentiment} 
                    color={
                      theme.sentiment === 'positive' ? 'success' : 
                      theme.sentiment === 'negative' ? 'error' : 'default'
                    } 
                    size="small" 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button variant="contained" color="primary">
          Export PDF Report
        </Button>
        <Button variant="outlined">
          Share Analysis
        </Button>
      </Box>
    </Box>
  );
};

export default AnalysisDetail;
