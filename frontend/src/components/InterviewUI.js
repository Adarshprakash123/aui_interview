import React, { useState, useEffect, useRef } from 'react';
import VideoRoom from './VideoRoom';
import axios from 'axios';
import './InterviewUI.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function InterviewUI({ sessionId, resumeData, onBack }) {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [roomName] = useState(`interview-${sessionId}`);
  const [liveKitToken, setLiveKitToken] = useState(null);
  const [liveKitUrl, setLiveKitUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isRecordingRef = useRef(false);
  const recordingTimerRef = useRef(null);
  const aiAudioRef = useRef(null);
  const isPlayingAudioRef = useRef(false);
  const MAX_RECORDING_DURATION = 120; // Maximum 2 minutes

  // Initialize interview and get LiveKit token
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        // Get LiveKit token
        const tokenResponse = await axios.post(`${API_BASE_URL}/token/generate`, {
          roomName: roomName,
          participantName: `candidate-${sessionId}`,
          sessionId: sessionId
        });

        if (tokenResponse.data.success) {
          setLiveKitToken(tokenResponse.data.token);
          setLiveKitUrl(tokenResponse.data.url);
        }

        // Start interview
        const interviewResponse = await axios.post(`${API_BASE_URL}/interview/start`, {
          sessionId: sessionId
        });

        if (interviewResponse.data.success) {
          setCurrentQuestion(interviewResponse.data.interviewSession.question);
          setInterviewStarted(true);
          
          // Play initial question audio
          if (interviewResponse.data.interviewSession.audioBase64) {
            window.dispatchEvent(new CustomEvent('playAIResponse', {
              detail: { audioBase64: interviewResponse.data.interviewSession.audioBase64 }
            }));
          }
        }
      } catch (error) {
        console.error('Failed to initialize interview:', error);
        alert('Failed to start interview. Please try again.');
      }
    };

    if (sessionId) {
      initializeInterview();
    }
  }, [sessionId, roomName]);

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setIsRecording(true);
      setRecordingDuration(0);
      setTranscription('🎤 Recording... Speak now!');

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          // Auto-stop if max duration reached
          if (newDuration >= MAX_RECORDING_DURATION) {
            stopRecording();
            return MAX_RECORDING_DURATION;
          }
          return newDuration;
        });
      }, 1000);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setRecordingDuration(0);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      isRecordingRef.current = true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      setRecordingDuration(0);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  // Stop recording and process audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      mediaRecorderRef.current.stop();
      isRecordingRef.current = false;
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setTranscription('Processing your answer...');
    }
  };

  // Process audio chunk
  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    setTranscription('Processing...');

    try {
      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (audioBlob.size > maxSize) {
        setTranscription('Error: Recording is too long. Please keep answers under 2 minutes.');
        setIsProcessing(false);
        alert('Recording is too large. Please keep your answer under 2 minutes.');
        return;
      }

      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];

        // Check base64 size (should be ~33% larger than original)
        if (base64Audio.length > maxSize * 1.4) {
          setTranscription('Error: Recording is too long. Please keep answers under 2 minutes.');
          setIsProcessing(false);
          alert('Recording is too large. Please keep your answer under 2 minutes.');
          return;
        }

        try {
          const response = await axios.post(`${API_BASE_URL}/interview/audio`, {
            sessionId: sessionId,
            audioBase64: base64Audio,
            audioFormat: 'webm'
          }, {
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 60000 // 60 second timeout for processing
          });

          if (response.data.success) {
            setTranscription(response.data.transcribedText);
            setCurrentQuestion(response.data.response);
            
            // Play AI response audio
            if (response.data.audioBase64) {
              // Trigger audio playback event
              window.dispatchEvent(new CustomEvent('playAIResponse', {
                detail: { audioBase64: response.data.audioBase64 }
              }));
            }
          }
        } catch (error) {
          console.error('Failed to process audio:', error);
          if (error.response?.status === 413) {
            setTranscription('Error: Recording is too large. Please keep answers under 2 minutes and try again.');
            alert('Recording is too large. Please keep your answer under 2 minutes.');
          } else if (error.response?.status === 400) {
            setTranscription('Error: Invalid audio format. Please try recording again.');
            alert('Invalid audio format. Please try recording again.');
          } else {
            setTranscription('Error processing audio. Please try again.');
            alert('Failed to process audio. Please check your connection and try again.');
          }
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Failed to convert audio:', error);
      setIsProcessing(false);
    }
  };

  const handleStartAnswer = () => {
    startRecording();
  };

  const handleStopAnswer = () => {
    stopRecording();
  };

  // Format duration in MM:SS format
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Listen for AI audio playback events
  useEffect(() => {
    const handlePlayAIResponse = async (event) => {
      const { audioBase64 } = event.detail;
      
      // Prevent duplicate playback - check if already playing
      if (isPlayingAudioRef.current) {
        console.log('⚠️ AI audio is already playing, ignoring duplicate event');
        return;
      }
      
      // Prevent duplicate playback - if audio is already playing, stop it first
      if (aiAudioRef.current && !aiAudioRef.current.paused) {
        console.log('🛑 Stopping previous audio to play new one');
        aiAudioRef.current.pause();
        aiAudioRef.current.currentTime = 0;
        aiAudioRef.current = null;
        isPlayingAudioRef.current = false;
      }
      
      // Mark as playing immediately to prevent duplicates
      isPlayingAudioRef.current = true;
      
      try {
        // Convert base64 to blob
        const audioBlob = base64ToBlob(audioBase64, 'audio/mpeg');
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create audio element and play
        const audio = new Audio(audioUrl);
        aiAudioRef.current = audio;
        
        // Set AI speaking state
        setIsAISpeaking(true);
        
        // Play audio
        audio.play().catch(err => {
          console.error('❌ Failed to play AI response audio:', err);
          setIsAISpeaking(false);
          isPlayingAudioRef.current = false;
          aiAudioRef.current = null;
        });

        // Handle when audio ends
        audio.onended = () => {
          console.log('✅ AI audio finished playing');
          setIsAISpeaking(false);
          isPlayingAudioRef.current = false;
          URL.revokeObjectURL(audioUrl);
          aiAudioRef.current = null;
        };

        // Handle errors
        audio.onerror = () => {
          console.error('❌ Audio playback error');
          setIsAISpeaking(false);
          isPlayingAudioRef.current = false;
          URL.revokeObjectURL(audioUrl);
          aiAudioRef.current = null;
        };
      } catch (error) {
        console.error('❌ Failed to play AI response:', error);
        setIsAISpeaking(false);
        isPlayingAudioRef.current = false;
        aiAudioRef.current = null;
      }
    };

    // Helper function to convert base64 to blob
    const base64ToBlob = (base64, mimeType) => {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    };

    window.addEventListener('playAIResponse', handlePlayAIResponse);

    window.addEventListener('playAIResponse', handlePlayAIResponse);

    return () => {
      window.removeEventListener('playAIResponse', handlePlayAIResponse);
      // Cleanup audio if component unmounts
      if (aiAudioRef.current) {
        aiAudioRef.current.pause();
        aiAudioRef.current = null;
      }
      isPlayingAudioRef.current = false;
      setIsAISpeaking(false);
    };
  }, []); // Empty dependency array - only register listener once

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  if (!interviewStarted || !liveKitToken) {
    return (
      <div className="interview-container">
        <div className="interview-header">
          <button className="button back-button" onClick={onBack}>
            ← Back to Resume
          </button>
          <h2>AI Video Interview</h2>
        </div>

        <div className="interview-content">
          {/* Video Section Shimmer */}
          <div className="video-section shimmer-container">
            <div className="shimmer-box shimmer-video"></div>
          </div>

          {/* Interview Panel Shimmer */}
          <div className="interview-panel-shimmer">
            <div className="shimmer-box shimmer-question"></div>
            <div className="shimmer-box shimmer-transcription"></div>
            <div className="shimmer-box shimmer-controls"></div>
            <div className="shimmer-box shimmer-profile"></div>
          </div>
        </div>

        <div className="shimmer-loading-text">
          <div className="loading"></div>
          <p>Initializing interview room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-container">
      <div className="interview-header">
        <button className="button back-button" onClick={onBack}>
          ← Back to Resume
        </button>
        <h2>AI Video Interview</h2>
      </div>

      <div className="interview-content">
        <div className="video-section">
          <VideoRoom
            roomName={roomName}
            token={liveKitToken}
            url={liveKitUrl}
            sessionId={sessionId}
          />
        </div>

        <div className="interview-panel">
          <div className="question-section">
            <h3>Current Question</h3>
            <div className="question-box">
              {currentQuestion || 'Waiting for question...'}
            </div>
          </div>

          <div className="transcription-section">
            <h3>Your Answer</h3>
            <div className={`transcription-box ${isRecording ? 'recording' : ''}`}>
              {isRecording ? (
                <div className="recording-indicator">
                  <div className="recording-pulse"></div>
                  <span>🎤 Recording... ({formatDuration(recordingDuration)} / {formatDuration(MAX_RECORDING_DURATION)})</span>
                </div>
              ) : (
                transcription || (isProcessing ? 'Processing...' : 'Click "Start Answering" to respond')
              )}
            </div>
          </div>

          <div className="controls-section">
            {isAISpeaking && (
              <div className="ai-speaking-indicator">
                <div className="loading"></div>
                <span>🎙️ AI is speaking... Please wait</span>
              </div>
            )}
            {!isRecording && !isProcessing && !isAISpeaking ? (
              <button className="button answer-button" onClick={handleStartAnswer}>
                🎤 Start Answering
              </button>
            ) : !isRecording && !isProcessing && isAISpeaking ? (
              <button className="button answer-button" disabled>
                🎤 Start Answering (Wait for AI to finish)
              </button>
            ) : (
              <button 
                className={`button stop-button ${isRecording ? 'recording-active' : ''}`}
                onClick={handleStopAnswer}
                disabled={!isRecording && isProcessing}
              >
                {isRecording ? (
                  <>
                    <span className="recording-dot"></span>
                    Stop Recording ({formatDuration(recordingDuration)})
                  </>
                ) : (
                  '⏹ Stop & Submit'
                )}
              </button>
            )}
            {isProcessing && (
              <div className="processing-indicator">
                <div className="loading"></div>
                <span>Processing your answer...</span>
              </div>
            )}
          </div>

          {resumeData && (
            <div className="resume-summary">
              <h4>Your Profile</h4>
              <p><strong>Level:</strong> {resumeData.seniorityLevel}</p>
              <p><strong>Experience:</strong> {resumeData.yearsOfExperience} years</p>
              <p><strong>Skills:</strong> {resumeData.skills?.slice(0, 5).join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewUI;
