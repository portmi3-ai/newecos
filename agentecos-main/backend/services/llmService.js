// LLM Service: Allows the agent to interact with an LLM (Gemini, OpenAI, or Cursor API)
// Uses GEMINI_API_KEY or OPENAI_API_KEY from environment variables
// Extend to support more providers as needed

import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Ask an LLM for advice, code, or clarification.
 * @param {string} prompt
 * @param {object} [options]
 * @returns {Promise<string>} LLM response
 */
export async function askLLM(prompt, options = {}) {
  // Prefer Gemini if available
  if (GEMINI_API_KEY) {
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY,
        { contents: [{ parts: [{ text: prompt }] }] }
      );
      // TODO: Parse Gemini response as needed
      return response.data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(response.data);
    } catch (err) {
      console.error('Gemini LLM error:', err.message);
    }
  }
  // Fallback to OpenAI if available
  if (OPENAI_API_KEY) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: options.model || 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          ...options
        },
        { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
      );
      return response.data.choices?.[0]?.message?.content || JSON.stringify(response.data);
    } catch (err) {
      console.error('OpenAI LLM error:', err.message);
    }
  }
  // No LLM available
  return 'No LLM API key configured.';
} 