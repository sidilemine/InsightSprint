import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  CircularProgress,
  TextField,
  Paper,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Mic as MicIcon,
  Stop as StopIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

// Mock interview questions
const mockInterview = {
  title: "Product Experience Interview",
  description: "This interview will gather your thoughts and feelings about our new product line.",
  questions: [
    {
      id: "q1",
      text: "How would you describe your overall experience with our product?",
      type: "open"
    },
    {
      id: "q2",
      text: "What features do you find most useful?",
      type: "open"
    },
    {
      id: "q3",
      text: "What aspects of the product could be improved?",
      type: "open"
    },
    {
      id: "q4",
      text: "How does the product compare to similar products you've used?",
      type: "open"
    },
    {
      id: "q5",
      text: "Would you recommend this product to others? Why or why not?",
      type: "open"
    }
  ]
};

const InterviewSession = () => {
  const { accessCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [responses, setResponses] = useState<any>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  
  // In a real implementation, we would fetch the interview data from the API
  useEffect(() => {
    const fetchInterview = async () => {
      setLoading(true);
      try {
        // Mock API call
        // const response = await axios.get(`/api/interviews/access/${accessCode}`);
        // setInterview(response.data);
        
        // For development, use mock data
        setTimeout(() => {
          setInterview(mockInterview);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching interview:', error);
        setLoading(false);
      }
    };
    
    fetchInterview();
  }, [accessCode]);
  
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);
  
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // In a real implementation, we would start recording using the browser's MediaRecorder API
    console.log('Starting recording...');
  };
  
  const handleStopRecording = () => {
    setIsRecording(false);
    
    // In a real implementation, we would stop recording and process the audio
    console.log('Stopping recording...');
    
    // Mock response data
    const currentQuestion = interview.questions[activeStep];
    setResponses({
      ...responses,
      [currentQuestion.id]: {
        audioUrl: "mock-audio-url.mp3",
        transcription: "This is a mock transcription of the user's response.",
        duration: recordingTime
      }
    });
  };
  
  const handleNext = () => {
    if (activeStep === interview.questions.length - 1) {
      // Last question, show confirmation dialog
      setOpenDialog(true);
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  const handleCompleteInterview = () => {
    setOpenDialog(false);
    
    // In a real implementation, we would submit all responses to the API
    console.log('Submitting responses:', responses);
    
    // Navigate to completion page
    navigate(`/interview/${accessCode}/complete`);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!interview) {
    return (
      <Box>
        <Typography variant="h5" component="h2">
          Interview not found
        </Typography>
      </Box>
    );
  }
  
  const currentQuestion = interview.questions[activeStep];
  const hasResponse = responses[currentQuestion.id];
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {interview.title}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        {interview.description}
      </Typography>
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {interview.questions.map((question: any, index: number) => (
          <Step key={question.id} completed={responses[question.id] !== undefined}>
            <StepLabel>Question {index + 1}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Question {activeStep + 1}
        </Typography>
        
        <Typography variant="h6" component="h3" gutterBottom>
          {currentQuestion.text}
        </Typography>
        
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {!hasResponse ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {isRecording ? (
                  <>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                      Recording: {formatTime(recordingTime)}
                    </Typography>
                    <IconButton 
                      color="error" 
                      size="large" 
                      onClick={handleStopRecording}
                      sx={{ 
                        width: 64, 
                        height: 64,
                        animation: 'pulse 1.5s infinite',
                        '@keyframes pulse': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.5 },
                          '100%': { opacity: 1 }
                        }
                      }}
                    >
                      <StopIcon fontSize="large" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                      Click to start recording
                    </Typography>
                    <IconButton 
                      color="primary" 
                      size="large" 
                      onClick={handleStartRecording}
                      sx={{ width: 64, height: 64 }}
                    >
                      <MicIcon fontSize="large" />
                    </IconButton>
                  </>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Speak naturally and share your honest thoughts and feelings
              </Typography>
            </>
          ) : (
            <Box sx={{ width: '100%' }}>
              <Typography variant="body1" gutterBottom>
                <strong>Your response:</strong>
              </Typography>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="body1">
                    {responses[currentQuestion.id].transcription}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Duration: {formatTime(responses[currentQuestion.id].duration)}
                  </Typography>
                </CardContent>
              </Card>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => {
                  // Remove the response and allow re-recording
                  const newResponses = {...responses};
                  delete newResponses[currentQuestion.id];
                  setResponses(newResponses);
                }}
              >
                Record Again
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<BackIcon />}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!hasResponse}
          endIcon={<NextIcon />}
        >
          {activeStep === interview.questions.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </Box>
      
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Complete Interview</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to complete this interview? You won't be able to change your responses after submission.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCompleteInterview} variant="contained" color="primary">
            Submit Interview
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewSession;
