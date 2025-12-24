import express from 'express';
import multer from 'multer';
import { parseResume, analyzeResumeWithLLM } from '../services/resumeParser.js';
import { saveResumeData } from '../services/memory.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
  }
});

/**
 * POST /api/resume/upload
 * Upload and parse a resume file (PDF or DOCX)
 */
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from resume
    const resumeText = await parseResume(req.file.buffer, req.file.mimetype);
    
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from resume' });
    }

    // Analyze resume with LLM
    const resumeData = await analyzeResumeWithLLM(resumeText);

    // Save to database
    const sessionId = await saveResumeData(resumeData, resumeText);

    res.json({
      success: true,
      sessionId,
      resumeData
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to process resume' });
  }
});

/**
 * POST /api/resume/manual
 * Process manually entered resume text
 */
router.post('/manual', async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    // Analyze resume with LLM
    const resumeData = await analyzeResumeWithLLM(resumeText);

    // Save to database
    const sessionId = await saveResumeData(resumeData, resumeText);

    res.json({
      success: true,
      sessionId,
      resumeData
    });
  } catch (error) {
    console.error('Manual resume processing error:', error);
    res.status(500).json({ error: error.message || 'Failed to process resume' });
  }
});

export default router;

