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
  TableRow,
  Tabs,
  Tab
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
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
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
  { theme: 'Product Quality', count: 28, sentiment: 'positive', emotions: ['Joy', 'Surprise'] },
  { theme: 'Ease of Use', count: 22, sentiment: 'positive', emotions: ['Joy'] },
  { theme: 'Customer Service', count: 15, sentiment: 'negative', emotions: ['Anger', 'Sadness'] },
  { theme: 'Price', count: 12, sentiment: 'negative', emotions: ['Disgust', 'Surprise'] },
  { theme: 'Packaging', count: 10, sentiment: 'neutral', emotions: ['Neutral', 'Surprise'] }
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

const mockEmotionIntensityData = [
  { emotion: 'Joy', intensity: 0.8, frequency: 35, sentiment: 'positive' },
  { emotion: 'Surprise', intensity: 0.6, frequency: 20, sentiment: 'mixed' },
  { emotion: 'Sadness', intensity: 0.7, frequency: 15, sentiment: 'negative' },
  { emotion: 'Anger', intensity: 0.9, frequency: 10, sentiment: 'negative' },
  { emotion: 'Fear', intensity: 0.5, frequency: 10, sentiment: 'negative' },
  { emotion: 'Disgust', intensity: 0.4, frequency: 5, sentiment: 'negative' },
  { emotion: 'Neutral', intensity: 0.2, frequency: 5, sentiment: 'neutral' }
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ClientAnalysisDetail = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
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
            emotionLanguageCorrelation: mockEmotionLanguageCorrelation,
            emotionIntensityData: mockEmotionIntensityData
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
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="analysis tabs">
          <Tab label="Overview" id="analysis-tab-0" aria-controls="analysis-tabpanel-0" />
          <Tab label="Emotion Analysis" id="analysis-tab-1" aria-controls="analysis-tabpanel-1" />
          <Tab label="Language Analysis" id="analysis-tab-2" aria-controls="analysis-tabpanel-2" />
          <Tab label="Mixed Analysis" id="analysis-tab-3" aria-controls="analysis-tabpanel-3" />
          <Tab label="Key Themes" id="analysis-tab-4" aria-controls="analysis-tabpanel-4" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={4}>
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
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Key Insights
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>1. Emotional Response:</strong> Customers predominantly express joy (35%) and surprise (20%) when discussing the product, indicating a generally positive emotional response.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>2. Language Sentiment:</strong> 65% of the language used is positive, reinforcing the positive emotional response. However, 25% negative language suggests areas for improvement.
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>3. Mixed Analysis:</strong> While joy correlates strongly with positive language (85%), surprise shows a mixed pattern with 25% negative language, suggesting some product features may be surprising in an unpleasant way.
                </Typography>
                <Typography variant="body1">
                  <strong>4. Key Themes:</strong> Product Quality and Ease of Use are the most mentioned positive themes, while Customer Service and Price are the primary negative themes.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={4}>
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
                  Emotion Intensity Analysis
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <CartesianGrid />
                      <XAxis type="number" dataKey="intensity" name="Intensity" unit="" domain={[0, 1]} />
                      <YAxis type="number" dataKey="frequency" name="Frequency" unit="%" />
                      <ZAxis type="category" dataKey="emotion" name="Emotion" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [value, name]} />
                      <Legend />
                      <Scatter 
                        name="Emotions" 
                        data={analysis.emotionIntensityData} 
                        fill="#8884d8"
                        shape="circle"
                      >
                        {analysis.emotionIntensityData.map((entry: any, index: number) => {
                          let color;
                          if (entry.sentiment === 'positive') color = '#4CAF50';
                          else if (entry.sentiment === 'negative') color = '#F44336';
                          else if (entry.sentiment === 'mixed') color = '#FF9800';
                          else color = '#9E9E9E';
                          
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Note:</strong> Bubble size represents the frequency of the emotion. Anger shows the highest intensity (0.9) despite lower frequency (10%).
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Emotion Analysis Insights
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Voice Emotion Recognition</strong> has detected nuances that text analysis alone would miss:
                </Typography>
                <Typography variant="body1" paragraph>
                  1. <strong>Intensity Matters:</strong> While joy is the most frequent emotion (35%), anger shows the highest intensity (0.9), suggesting that negative experiences, though fewer, are more intensely felt.
                </Typography>
                <Typography variant="body1" paragraph>
                  2. <strong>Surprise is Complex:</strong> Surprise shows moderate intensity (0.6) and is classified as "mixed" sentiment, indicating it can be either positive or negative depending on context.
                </Typography>
                <Typography variant="body1">
                  3. <strong>Hidden Emotions:</strong> Neutral language often masks underlying emotions - our analysis detected emotional undertones in seemingly neutral responses, providing deeper insights into customer feelings.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typ
(Content truncated due to size limit. Use line ranges to read in chunks)