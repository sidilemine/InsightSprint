import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/**
 * VisualizationDashboard Component
 * Displays visualization of sentiment analysis data
 */
const VisualizationDashboard = ({ analysisData, visualizationData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('sentiment');

  // Prepare chart data when visualization data changes
  const sentimentChartData = {
    labels: visualizationData?.sentiment_over_time?.map(item => 
      `${Math.floor(item.timestamp / 60)}:${String(Math.floor(item.timestamp % 60)).padStart(2, '0')}`
    ) || [],
    datasets: [
      {
        label: 'Sentiment',
        data: visualizationData?.sentiment_over_time?.map(item => item.sentiment) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const sentimentChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sentiment Over Time',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const sentiment = visualizationData?.sentiment_over_time?.[index]?.sentiment || 0;
            const text = visualizationData?.sentiment_over_time?.[index]?.text || '';
            return [`Sentiment: ${sentiment.toFixed(2)}`, `"${text}"`];
          },
        },
      },
    },
    scales: {
      y: {
        min: -1,
        max: 1,
        ticks: {
          callback: (value) => {
            if (value === 1) return 'Very Positive';
            if (value === 0.5) return 'Positive';
            if (value === 0) return 'Neutral';
            if (value === -0.5) return 'Negative';
            if (value === -1) return 'Very Negative';
            return '';
          },
        },
      },
    },
  };

  const emotionChartData = {
    labels: Object.keys(visualizationData?.emotion_distribution || {}),
    datasets: [
      {
        data: Object.values(visualizationData?.emotion_distribution || {}),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(201, 203, 207, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const emotionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Emotion Distribution',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${context.label}: ${value}%`;
          },
        },
      },
    },
  };

  const topicChartData = {
    labels: visualizationData?.topic_clusters?.map(item => item.name) || [],
    datasets: [
      {
        label: 'Topic Relevance',
        data: visualizationData?.topic_clusters?.map(item => item.size) || [],
        backgroundColor: visualizationData?.topic_clusters?.map(item => {
          const sentiment = item.sentiment;
          if (sentiment > 0.3) return 'rgba(75, 192, 192, 0.6)';
          if (sentiment < -0.3) return 'rgba(255, 99, 132, 0.6)';
          return 'rgba(255, 205, 86, 0.6)';
        }) || [],
        borderColor: visualizationData?.topic_clusters?.map(item => {
          const sentiment = item.sentiment;
          if (sentiment > 0.3) return 'rgba(75, 192, 192, 1)';
          if (sentiment < -0.3) return 'rgba(255, 99, 132, 1)';
          return 'rgba(255, 205, 86, 1)';
        }) || [],
        borderWidth: 1,
      },
    ],
  };

  const topicChartOptions = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Key Topics',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const topic = visualizationData?.topic_clusters?.[index];
            if (!topic) return '';
            
            const sentiment = topic.sentiment;
            let sentimentText = 'Neutral';
            if (sentiment > 0.3) sentimentText = 'Positive';
            if (sentiment < -0.3) sentimentText = 'Negative';
            
            return [`Relevance: ${topic.size}`, `Sentiment: ${sentimentText}`];
          },
        },
      },
    },
  };

  const wordFrequencyData = {
    labels: visualizationData?.word_frequency?.slice(0, 15).map(item => item.word) || [],
    datasets: [
      {
        label: 'Word Frequency',
        data: visualizationData?.word_frequency?.slice(0, 15).map(item => item.count) || [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const wordFrequencyOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Word Frequency',
      },
    },
  };

  // Render insights from analysis
  const renderInsights = () => {
    if (!analysisData?.structured_data) {
      return <Alert variant="info">No analysis data available</Alert>;
    }

    const { themes, insights, recommendations } = analysisData.structured_data;

    return (
      <div className="insights-container">
        {themes && themes.length > 0 && (
          <div className="mb-4">
            <h5>Key Themes</h5>
            <ul className="list-group">
              {themes.map((theme, index) => (
                <li key={index} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">{theme.name}</span>
                    <span className={`badge ${
                      theme.sentiment === 'positive' ? 'bg-success' :
                      theme.sentiment === 'negative' ? 'bg-danger' :
                      'bg-secondary'
                    }`}>
                      {theme.sentiment}
                    </span>
                  </div>
                  {theme.description && <p className="mb-0 mt-1">{theme.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {insights && insights.length > 0 && (
          <div className="mb-4">
            <h5>Actionable Insights</h5>
            <ul className="list-group">
              {insights.map((insight, index) => (
                <li key={index} className="list-group-item">{insight}</li>
              ))}
            </ul>
          </div>
        )}

        {recommendations && recommendations.length > 0 && (
          <div>
            <h5>Recommendations</h5>
            <ul className="list-group">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="list-group-item">{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="mb-4">
        <Card.Header>Analysis Visualization</Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading visualization data...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
        <Card.Header>Analysis Visualization</Card.Header>
        <Card.Body>
          <Alert variant="danger">{error}</Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!visualizationData) {
    return (
      <Card className="mb-4">
        <Card.Header>Analysis Visualization</Card.Header>
        <Card.Body>
          <Alert variant="info">No visualization data available</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header>Analysis Visualization</Card.Header>
      <Card.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="sentiment" title="Sentiment Analysis">
            <div className="chart-container mb-4" style={{ height: '300px' }}>
              <Line data={sentimentChartData} options={sentimentChartOptions} />
            </div>
          </Tab>
          
          <Tab eventKey="emotions" title="Emotion Distribution">
            <div className="chart-container mb-4" style={{ height: '300px' }}>
              <div className="row">
                <div className="col-md-6">
                  <Doughnut data={emotionChartData} options={emotionChartOptions} />
                </div>
                <div className="col-md-6">
                  <div className="emotion-legend mt-4">
                    <h5>Emotion Breakdown</h5>
                    <ul className="list-group">
                      {Object.entries(visualizationData.emotion_distribution || {}).map(([emotion, percentage]) => (
                        <li key={emotion} className="list-group-item d-flex justify-content-between align-items-center">
                          {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                          <span className="badge bg-primary rounded-pill">{percentage}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Tab>
          
          <Tab eventKey="topics" title="Key Topics">
            <div className="chart-container mb-4" style={{ height: '400px' }}>
              <Bar data={topicChartData} options={topicChartOptions} />
            </div>
          </Tab>
          
          <Tab eventKey="words" title="Word Frequency">
            <div className="chart-container mb-4" style={{ height: '300px' }}>
              <Bar data={wordFrequencyData} options={wordFrequencyOptions} />
            </div>
          </Tab>
          
          <Tab eventKey="insights" title="Insights">
            {renderInsights()}
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
};

export default VisualizationDashboard;
