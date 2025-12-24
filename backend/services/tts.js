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
 * Convert text to speech using OpenAI TTS
 * @param {string} text - Text to convert to speech
 * @param {string} voice - Voice to use (alloy, echo, fable, onyx, nova, shimmer)
 * @returns {Promise<Buffer>} Audio buffer
 */
export async function textToSpeech(text, voice = 'nova') {
  try {
    const response = await getOpenAIClient().audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: text,
      speed: 1.0
    });

    // Convert response to buffer
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('OpenAI TTS error:', error);
    throw new Error(`Text-to-speech failed: ${error.message}`);
  }
}

/**
 * Convert text to speech and return as base64
 * @param {string} text - Text to convert to speech
 * @param {string} voice - Voice to use
 * @returns {Promise<string>} Base64 encoded audio
 */
export async function textToSpeechBase64(text, voice = 'nova') {
  try {
    const audioBuffer = await textToSpeech(text, voice);
    return audioBuffer.toString('base64');
  } catch (error) {
    console.error('TTS base64 conversion error:', error);
    throw error;
  }
}

