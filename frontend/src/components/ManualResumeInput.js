import React, { useState } from 'react';
import axios from 'axios';
import './ManualResumeInput.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function ManualResumeInput({ onResumeProcessed }) {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    if (!resumeText.trim()) {
      setError('Please enter your resume information');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/resume/manual`, {
        resumeText: resumeText.trim()
      });

      if (response.data.success) {
        setSuccess('Resume processed successfully!');
        setTimeout(() => {
          onResumeProcessed(response.data);
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process resume');
      console.error('Manual input error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Enter Resume Information</h2>
      <div className="input-group">
        <label htmlFor="resume-text">
          Paste your resume text, skills, experience, projects, etc.
        </label>
        <textarea
          id="resume-text"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Example:&#10;Skills: JavaScript, React, Node.js&#10;Experience: 3 years as Full Stack Developer&#10;Projects: Built e-commerce platform using React and Node.js&#10;Technologies: MongoDB, Express, AWS..."
          disabled={loading}
        />
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <button
        className="button"
        onClick={handleSubmit}
        disabled={!resumeText.trim() || loading}
      >
        {loading ? 'Processing...' : 'Process Resume'}
        {loading && <span className="loading"></span>}
      </button>
    </div>
  );
}

export default ManualResumeInput;

