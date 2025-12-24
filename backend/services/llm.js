import OpenAI from 'openai';

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
 * Analyze resume text and extract structured information
 * @param {string} resumeText - Raw resume text
 * @returns {Promise<Object>} Structured resume data
 */
export async function analyzeResumeWithLLM(resumeText) {
  try {
    const prompt = `Analyze the following resume and extract structured information. Return a JSON object with the following structure:
{
  "skills": ["skill1", "skill2", ...],
  "yearsOfExperience": number,
  "projects": ["project1", "project2", ...],
  "technologies": ["tech1", "tech2", ...],
  "seniorityLevel": "junior" | "mid" | "senior",
  "summary": "Brief summary of the candidate"
}

Resume text:
${resumeText.substring(0, 8000)} // Limit to avoid token limits

Return ONLY valid JSON, no additional text.`;

    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a resume analyzer. Extract structured information from resumes and return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const resumeData = JSON.parse(content);

    // Validate and set defaults
    return {
      skills: resumeData.skills || [],
      yearsOfExperience: resumeData.yearsOfExperience || 0,
      projects: resumeData.projects || [],
      technologies: resumeData.technologies || [],
      seniorityLevel: resumeData.seniorityLevel || 'junior',
      summary: resumeData.summary || 'No summary available'
    };
  } catch (error) {
    console.error('LLM resume analysis error:', error);
    throw new Error(`Failed to analyze resume: ${error.message}`);
  }
}

/**
 * Generate interview question based on resume and conversation history
 * @param {Object} resumeData - Structured resume data
 * @param {Array} conversationHistory - Previous messages in the interview
 * @param {boolean} isFirstQuestion - Whether this is the first question
 * @returns {Promise<string>} Interview question
 */
export async function generateInterviewQuestion(resumeData, conversationHistory = [], isFirstQuestion = false) {
  try {
    const systemPrompt = `You are an AI technical interviewer conducting a live video interview. 
Your goal is to assess the candidate's technical skills, problem-solving ability, and communication skills.

Candidate Profile:
- Seniority Level: ${resumeData.seniorityLevel}
- Years of Experience: ${resumeData.yearsOfExperience}
- Skills: ${resumeData.skills.join(', ')}
- Technologies: ${resumeData.technologies.join(', ')}
- Summary: ${resumeData.summary}

Guidelines:
- Ask ONE question at a time
- Adjust difficulty based on seniority level
- Ask follow-up questions based on previous answers
- Be conversational and professional
- Keep questions concise (1-2 sentences)
- DO NOT introduce yourself with a name or say "my name is" - just say "I am AI" or simply start the interview naturally
${isFirstQuestion ? '- Start with a friendly greeting: "Hello! I am AI. Let\'s begin the interview." Then ask the first question.' : '- Reference previous answers when relevant'}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      {
        role: 'user',
        content: isFirstQuestion 
          ? 'Start the interview with a greeting and first question.'
          : 'Generate the next interview question based on the conversation so far.'
      }
    ];

    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('LLM question generation error:', error);
    throw new Error(`Failed to generate question: ${error.message}`);
  }
}

/**
 * Process candidate answer and generate follow-up or feedback
 * @param {string} answer - Candidate's spoken answer
 * @param {string} currentQuestion - The question that was asked
 * @param {Object} resumeData - Structured resume data
 * @param {Array} conversationHistory - Previous messages
 * @returns {Promise<Object>} Response with next question or feedback
 */
export async function processAnswer(answer, currentQuestion, resumeData, conversationHistory) {
  try {
    const systemPrompt = `You are an AI technical interviewer. Analyze the candidate's answer and decide:
1. If the answer is good, ask a follow-up question or move to the next topic
2. If the answer needs clarification, ask a clarifying question
3. Provide brief, natural feedback when appropriate

Candidate Profile:
- Seniority Level: ${resumeData.seniorityLevel}
- Skills: ${resumeData.skills.join(', ')}

Guidelines:
- Keep responses conversational and concise (1-2 sentences)
- DO NOT introduce yourself with a name or say "my name is" - you are just AI
- Be natural and professional in your responses`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      {
        role: 'user',
        content: `Question: ${currentQuestion}\n\nCandidate Answer: ${answer}\n\nGenerate your response (question or feedback).`
      }
    ];

    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 200
    });

    return {
      response: response.choices[0].message.content.trim(),
      shouldContinue: true
    };
  } catch (error) {
    console.error('LLM answer processing error:', error);
    throw new Error(`Failed to process answer: ${error.message}`);
  }
}

