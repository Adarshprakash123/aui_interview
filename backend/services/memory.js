import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

let client = null;
let db = null;

/**
 * Initialize MongoDB connection
 * Requires MONGODB_URI environment variable (MongoDB Atlas connection string)
 */
export async function initDB() {
  if (client) return;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'ai_interviewer';

  if (!uri) {
    const error = new Error('MONGODB_URI environment variable is required. Please set up MongoDB Atlas and configure the connection string.');
    console.error('MongoDB configuration error:', error.message);
    throw error;
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to MongoDB Atlas: ${dbName}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Save resume data to database
 * @param {Object} resumeData - Structured resume data
 * @param {string} resumeText - Raw resume text
 * @returns {Promise<string>} Session ID
 */
export async function saveResumeData(resumeData, resumeText) {
  if (!client) await initDB();
  
  const sessionId = uuidv4();
  const collection = db.collection('sessions');

  await collection.insertOne({
    sessionId,
    resumeData,
    resumeText,
    conversationHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return sessionId;
}

/**
 * Get interview session from database
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object|null>} Session data
 */
export async function getInterviewSession(sessionId) {
  if (!client) await initDB();
  
  const collection = db.collection('sessions');
  const session = await collection.findOne({ sessionId });

  return session;
}

/**
 * Update conversation history in session
 * @param {string} sessionId - Session ID
 * @param {Array} messages - New messages to add
 * @returns {Promise<void>}
 */
export async function updateConversationHistory(sessionId, messages) {
  if (!client) await initDB();
  
  const collection = db.collection('sessions');
  
  await collection.updateOne(
    { sessionId },
    {
      $push: { conversationHistory: { $each: messages } },
      $set: { updatedAt: new Date() }
    }
  );
}

/**
 * Add question and answer to session
 * @param {string} sessionId - Session ID
 * @param {string} question - Question asked
 * @param {string} answer - Answer given
 * @returns {Promise<void>}
 */
export async function addQAToSession(sessionId, question, answer) {
  if (!client) await initDB();
  
  const collection = db.collection('sessions');
  
  // Add to conversation history
  await updateConversationHistory(sessionId, [
    { role: 'assistant', content: question },
    { role: 'user', content: answer }
  ]);
}

/**
 * Mark interview as started
 * @param {string} sessionId - Session ID
 * @returns {Promise<void>}
 */
export async function markInterviewStarted(sessionId) {
  if (!client) await initDB();
  
  const collection = db.collection('sessions');
  
  await collection.updateOne(
    { sessionId },
    {
      $set: { 
        interviewStarted: true,
        interviewStartedAt: new Date(),
        updatedAt: new Date()
      }
    }
  );
}

