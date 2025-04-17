import React, { useState, useRef } from 'react';
import { Card, Button, Form, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import axios from 'axios';

/**
 * AudioRecorder Component
 * Handles recording and uploading audio using AssemblyAI
 */
const AudioRecorder = ({ onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState('');
  const [transcriptionId, setTranscriptionId] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Start recording audio
  const startRecording = async () => {
    try {
      setError('');
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to access microphone. Please ensure you have granted permission.');
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Upload audio to AssemblyAI
  const uploadAudio = async () => {
    if (!audioBlob) {
      setError('No audio recorded');
      return;
    }
    
    try {
      setIsUploading(true);
      setError('');
      
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      // Upload audio file
      const uploadResponse = await axios.post('/api/assemblyai/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (uploadResponse.data.success) {
        const audioUrl = uploadResponse.data.data.upload_url;
        
        // Submit for transcription
        const transcribeResponse = await axios.post('/api/assemblyai/transcribe', {
          audioUrl,
          options: {
            sentiment_analysis: true,
            content_safety: true
          }
        });
        
        if (transcribeResponse.data.success) {
          const transcriptId = transcribeResponse.data.data.id;
          setTranscriptionId(transcriptId);
          
          // Start polling for transcription completion
          pollTranscription(transcriptId);
        } else {
          setError('Failed to transcribe audio');
        }
      } else {
        setError('Failed to upload audio');
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      setError('Failed to upload and transcribe audio');
    } finally {
      setIsUploading(false);
    }
  };

  // Poll for transcription completion
  const pollTranscription = async (transcriptId) => {
    try {
      setIsProcessing(true);
      
      let attempts = 0;
      const maxAttempts = 30;
      const interval = 2000;
      
      const poll = async () => {
        attempts++;
        setProcessingProgress(Math.min((attempts / maxAttempts) * 100, 95));
        
        const response = await axios.get(`/api/assemblyai/transcription/${transcriptId}`);
        
        if (response.data.success) {
          const transcription = response.data.data;
          
          if (transcription.status === 'completed') {
            setIsProcessing(false);
            setProcessingProgress(100);
            
            // Call the callback with the completed transcription
            if (onTranscriptionComplete) {
              onTranscriptionComplete(transcription);
            }
            
            return;
          } else if (transcription.status === 'error') {
            setIsProcessing(false);
            setError(`Transcription failed: ${transcription.error}`);
            return;
          }
        }
        
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          setIsProcessing(false);
          setError('Transcription timed out');
        }
      };
      
      poll();
    } catch (error) {
      console.error('Error polling transcription:', error);
      setIsProcessing(false);
      setError('Failed to get transcription status');
    }
  };

  // Process audio end-to-end
  const processAudio = async () => {
    if (!audioBlob) {
      setError('No audio recorded');
      return;
    }
    
    try {
      setIsUploading(true);
      setError('');
      
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      // Upload audio file
      const uploadResponse = await axios.post('/api/assemblyai/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (uploadResponse.data.success) {
        const audioUrl = uploadResponse.data.data.upload_url;
        
        // Process audio end-to-end
        setIsUploading(false);
        setIsProcessing(true);
        
        const processResponse = await axios.post('/api/assemblyai/process', {
          audioUrl,
          insightPrompt: 'Analyze this response for key themes, emotional patterns, and actionable insights.',
          options: {
            sentiment_analysis: true,
            content_safety: true
          }
        });
        
        if (processResponse.data.success) {
          setIsProcessing(false);
          setProcessingProgress(100);
          
          // Call the callback with the completed results
          if (onTranscriptionComplete) {
            onTranscriptionComplete(processResponse.data.data);
          }
        } else {
          setError('Failed to process audio');
        }
      } else {
        setError('Failed to upload audio');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setError('Failed to process audio');
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>Audio Recorder</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="d-flex flex-column gap-3">
          {/* Recording controls */}
          <div className="d-flex gap-2">
            {!isRecording ? (
              <Button 
                variant="primary" 
                onClick={startRecording}
                disabled={isUploading || isProcessing}
              >
                Start Recording
              </Button>
            ) : (
              <Button 
                variant="danger" 
                onClick={stopRecording}
              >
                Stop Recording
              </Button>
            )}
          </div>
          
          {/* Audio playback */}
          {audioBlob && !isRecording && (
            <div>
              <audio 
                controls 
                src={URL.createObjectURL(audioBlob)} 
                className="w-100 mb-3"
              />
              
              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={processAudio}
                  disabled={isUploading || isProcessing}
                >
                  {isUploading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Uploading...
                    </>
                  ) : isProcessing ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Processing...
                    </>
                  ) : (
                    'Process Audio'
                  )}
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setAudioBlob(null)}
                  disabled={isUploading || isProcessing}
                >
                  Discard
                </Button>
              </div>
            </div>
          )}
          
          {/* Processing progress */}
          {isProcessing && (
            <div className="mt-3">
              <ProgressBar 
                now={processingProgress} 
                label={`${Math.round(processingProgress)}%`} 
                animated
              />
              <small className="text-muted mt-1 d-block">
                Transcribing and analyzing audio...
              </small>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default AudioRecorder;
