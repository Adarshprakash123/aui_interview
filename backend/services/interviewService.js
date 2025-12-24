import { speechToText } from './whisper.js';
import { textToSpeechBase64 } from './tts.js';
import { generateInterviewQuestion, processAnswer } from './llm.js';
import { 
  getInterviewSession as getSessionFromMemory, 
  updateConversationHistory, 
  addQAToSession,
  markInterviewStarted 
} from './memory.js';

/**
 * Start a new interview session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Interview session with first question
 */
export async function startInterview(sessionId) {
  try {
    const session = await getSessionFromMemory(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    // Mark interview as started
    await markInterviewStarted(sessionId);

    // Generate first question
    const firstQuestion = await generateInterviewQuestion(
      session.resumeData,
      [],
      true
    );

    // Add question to conversation history
    await updateConversationHistory(sessionId, [
      { role: 'assistant', content: firstQuestion }
    ]);

    // Convert to speech
    const audioBase64 = await textToSpeechBase64(firstQuestion);

    return {
      sessionId,
      question: firstQuestion,
      audioBase64,
      conversationHistory: [
        { role: 'assistant', content: firstQuestion }
      ]
    };
  } catch (error) {
    console.error('Start interview error:', error);
    throw error;
  }
}

/**
 * Process audio chunk and generate AI response
 * @param {string} sessionId - Session ID
 * @param {string} audioBase64 - Base64 encoded audio
 * @param {string} audioFormat - Audio format
 * @returns {Promise<Object>} Response with next question/feedback and audio
 */
export async function processInterviewAudio(sessionId, audioBase64, audioFormat = 'webm') {
  try {
    // Get session
    const session = await getSessionFromMemory(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    // Convert speech to text
    const transcribedText = await speechToText(audioBase64, audioFormat);
    
    if (!transcribedText || transcribedText.trim().length === 0) {
      return {
        transcribedText: '',
        response: 'I didn\'t catch that. Could you please repeat?',
        audioBase64: await textToSpeechBase64('I didn\'t catch that. Could you please repeat?'),
        shouldContinue: true
      };
    }

    // Get last question from conversation history
    const conversationHistory = session.conversationHistory || [];
    const lastQuestion = conversationHistory
      .filter(msg => msg.role === 'assistant')
      .slice(-1)[0]?.content || 'Tell me about yourself.';

    // Process answer and generate response
    const aiResponse = await processAnswer(
      transcribedText,
      lastQuestion,
      session.resumeData,
      conversationHistory
    );

    // Add Q&A to conversation history
    await addQAToSession(sessionId, lastQuestion, transcribedText);
    await updateConversationHistory(sessionId, [
      { role: 'assistant', content: aiResponse.response }
    ]);

    // Convert response to speech
    const responseAudioBase64 = await textToSpeechBase64(aiResponse.response);

    return {
      transcribedText,
      response: aiResponse.response,
      audioBase64: responseAudioBase64,
      shouldContinue: aiResponse.shouldContinue
    };
  } catch (error) {
    console.error('Process interview audio error:', error);
    throw error;
  }
}

/**
 * Get interview session data
 * Re-exported from memory.js for convenience
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Session data
 */
export async function getInterviewSession(sessionId) {
  return await getSessionFromMemory(sessionId);
}


