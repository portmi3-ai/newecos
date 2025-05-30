// This service uses Hugging Face and Gemini API keys from environment variables.
// Ensure you set HUGGINGFACE_API_KEY and GEMINI_API_KEY in your .env file.
// Do NOT commit your .env file to version control.

import axios from 'axios';

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Parse a natural language message into a structured intent using Hugging Face and Gemini APIs.
 * @param {string} message
 * @returns {Promise<{ name: string, params: object, confidence?: number, source: string }>}
 */
export async function parseIntent(message) {
  let hfResult = null;
  let geminiResult = null;

  // Hugging Face Inference API (example placeholder)
  if (HUGGINGFACE_API_KEY) {
    try {
      // TODO: Replace with your actual Hugging Face model endpoint and payload
      const hfResponse = await axios.post(
        'https://api-inference.huggingface.co/models/your-nlu-model',
        { inputs: message },
        { headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` } }
      );
      hfResult = hfResponse.data; // Adjust parsing as needed
    } catch (err) {
      console.error('Hugging Face NLU error:', err.message);
    }
  }

  // Gemini API (example placeholder)
  if (GEMINI_API_KEY) {
    try {
      // TODO: Replace with your actual Gemini API endpoint and payload
      const geminiResponse = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY,
        {
          contents: [{ parts: [{ text: message }] }],
        }
      );
      geminiResult = geminiResponse.data; // Adjust parsing as needed
    } catch (err) {
      console.error('Gemini NLU error:', err.message);
    }
  }

  // TODO: Parse and normalize results from both APIs to a common intent format
  // For now, prefer Hugging Face if available, else Gemini, else fallback
  if (hfResult && hfResult.intent) {
    return { ...hfResult.intent, source: 'huggingface' };
  }
  if (geminiResult && geminiResult.intent) {
    return { ...geminiResult.intent, source: 'gemini' };
  }
  // Fallback: unknown intent
  return { name: 'unknown', params: {}, source: 'none' };
} 