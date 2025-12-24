import React, { useState } from 'react';
import './App.css';
import ResumeUpload from './components/ResumeUpload';
import ManualResumeInput from './components/ManualResumeInput';
import InterviewUI from './components/InterviewUI';

function App() {
  const [step, setStep] = useState('resume'); // 'resume', 'interview'
  const [sessionId, setSessionId] = useState(null);
  const [resumeData, setResumeData] = useState(null);

  const handleResumeProcessed = (data) => {
    setSessionId(data.sessionId);
    setResumeData(data.resumeData);
    setStep('interview');
  };

  const handleBackToResume = () => {
    setStep('resume');
    setSessionId(null);
    setResumeData(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Video Interviewer</h1>
        <p>Upload your resume or enter your details to start an AI-powered interview</p>
      </header>

      <main className="App-main">
        {step === 'resume' ? (
          <div className="resume-input-container">
            <ResumeUpload onResumeProcessed={handleResumeProcessed} />
            <div className="divider">
              <span>OR</span>
            </div>
            <ManualResumeInput onResumeProcessed={handleResumeProcessed} />
          </div>
        ) : (
          <InterviewUI 
            sessionId={sessionId}
            resumeData={resumeData}
            onBack={handleBackToResume}
          />
        )}
      </main>
    </div>
  );
}

export default App;

