import { AccessToken } from 'livekit-server-sdk';

/**
 * Generate LiveKit access token for video room
 * @param {string} roomName - Name of the room
 * @param {string} participantName - Name of the participant
 * @param {string} sessionId - Optional session ID
 * @returns {Promise<string>} Access token
 */
export async function generateLiveKitToken(roomName, participantName, sessionId = null) {
  try {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('LiveKit API key and secret must be set in environment variables');
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      metadata: sessionId ? JSON.stringify({ sessionId }) : undefined
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    });

    return await at.toJwt();
  } catch (error) {
    console.error('LiveKit token generation error:', error);
    throw new Error(`Failed to generate LiveKit token: ${error.message}`);
  }
}

