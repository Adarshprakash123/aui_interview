import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { analyzeResumeWithLLM as llmAnalyze } from './llm.js';

/**
 * Parse resume file and extract text
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} Extracted text
 */
export async function parseResume(fileBuffer, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(fileBuffer);
      return data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Resume parsing error:', error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}

/**
 * Analyze resume text with LLM to extract structured data
 * @param {string} resumeText - Raw resume text
 * @returns {Promise<Object>} Structured resume data
 */
export async function analyzeResumeWithLLM(resumeText) {
  return await llmAnalyze(resumeText);
}

