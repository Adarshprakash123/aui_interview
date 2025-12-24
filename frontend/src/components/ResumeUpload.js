import React, { useState } from 'react';
import axios from 'axios';
import './ResumeUpload.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function ResumeUpload({ onResumeProcessed }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or DOCX file');
        setFile(null);
        return;
      }
      
      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post(`${API_BASE_URL}/resume/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('Resume processed successfully!');
        setTimeout(() => {
          onResumeProcessed(response.data);
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload resume');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Upload Resume</h2>
      <div className="input-group">
        <label htmlFor="resume-file">Select PDF or DOCX file</label>
        <input
          type="file"
          id="resume-file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          disabled={loading}
        />
        {file && (
          <div className="file-info">
            <p>Selected: {file.name}</p>
            <p className="file-size">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <button
        className="button"
        onClick={handleUpload}
        disabled={!file || loading}
      >
        {loading ? 'Processing...' : 'Upload & Process Resume'}
        {loading && <span className="loading"></span>}
      </button>
    </div>
  );
}

export default ResumeUpload;

