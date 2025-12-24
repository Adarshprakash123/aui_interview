import OpenAI from 'openai';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lazy initialization of OpenAI client to ensure env vars are loaded
let openai = null;

function getOpenAIClient() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({
      apiKey: apiKey
    });
  }
  return openai;
}

/**
 * Convert audio buffer (base64) to text using OpenAI Whisper
 * @param {string} audioBase64 - Base64 encoded audio data
 * @param {string} audioFormat - Audio format (webm, mp3, wav, etc.)
 * @returns {Promise<string>} Transcribed text
 */
export async function speechToText(audioBase64, audioFormat = 'webm') {
  try {
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    // Create temporary file
    const tempDir = join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = join(tempDir, `audio-${uuidv4()}.${audioFormat}`);
    
    try {
      // Write buffer to file
      fs.writeFileSync(tempFilePath, audioBuffer);
      
      // Transcribe using Whisper
      const transcription = await getOpenAIClient().audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'en'
      });
      
      return transcription.text;
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  } catch (error) {
    console.error('Whisper STT error:', error);
    throw new Error(`Speech-to-text failed: ${error.message}`);
  }
}

