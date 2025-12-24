import express from 'express';
import { generateLiveKitToken } from '../services/livekit.js';

const router = express.Router();

/**
 * POST /api/token/generate
 * Generate LiveKit access token for video room
 */
router.post('/generate', async (req, res) => {
  try {
    const { roomName, participantName, sessionId } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({ error: 'Room name and participant name are required' });
    }

    const token = await generateLiveKitToken(roomName, participantName, sessionId);

    res.json({
      success: true,
      token,
      url: process.env.LIVEKIT_URL
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate token' });
  }
});

export default router;

