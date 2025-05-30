// test_advisor_agent_team.js
// Usage:
//   API_URL=http://localhost:5000 JWT_TOKEN=your_jwt_token node test_advisor_agent_team.js
//
// This script tests the Advisor Agent Team meta agent endpoint.

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';
const JWT_TOKEN = process.env.JWT_TOKEN;

if (!JWT_TOKEN) {
  console.error('Error: JWT_TOKEN environment variable is required.');
  process.exit(1);
}

async function testAdvisorAgentTeam() {
  try {
    const response = await axios.post(
      `${API_URL}/api/meta-agents/advisor-team`,
      { deploy: true },
      {
        headers: {
          Authorization: `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('--- Advisor Agent Team Test Response ---');
    console.dir(response.data, { depth: null, colors: true });
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Request Error:', error.message);
    }
    process.exit(1);
  }
}

testAdvisorAgentTeam(); 