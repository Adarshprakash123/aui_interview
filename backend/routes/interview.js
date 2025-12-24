import express from 'express';
import { processInterviewAudio, getInterviewSession, startInterview } from '../services/interviewService.js';

const router = express.Router();

/**
 * POST /api/interview/start
 * Initialize a new interview session
 */
router.post('/start', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const interviewSession = await startInterview(sessionId);

    res.json({
      success: true,
      interviewSession
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ error: error.message || 'Failed to start interview' });
  }
});

/**
 * POST /api/interview/audio
 * Process audio chunk and get AI response
 */
router.post('/audio', async (req, res) => {
  try {
    const { sessionId, audioBase64, audioFormat } = req.body;

    if (!sessionId || !audioBase64) {
      return res.status(400).json({ error: 'Session ID and audio data are required' });
    }

    const result = await processInterviewAudio(sessionId, audioBase64, audioFormat || 'webm');

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Process audio error:', error);
    res.status(500).json({ error: error.message || 'Failed to process audio' });
  }
});

/**
 * GET /api/interview/session/:sessionId
 * Get interview session data
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await getInterviewSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: error.message || 'Failed to get session' });
  }
});

export default router;

