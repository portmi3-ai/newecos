import metaAgentOrchestrator from '../services/metaAgentOrchestrator.js';

// Simple rules-based parser for demo purposes
function parseCommandString(commandStr, userId) {
  // Example: "Create a healthcare agent with Q&A"
  // This is a placeholder. Replace with LLM/NLP for production.
  const lower = commandStr.toLowerCase();
  let industry = 'meta-devops';
  let template = 'autonomous-devops-agent';
  let name = 'Meta DevOps Agent';
  let description = '';
  if (lower.includes('healthcare')) {
    industry = 'healthcare';
    template = 'qna-agent';
    name = 'Healthcare Q&A Agent';
    description = 'Agent for medical Q&A';
  } else if (lower.includes('real estate')) {
    industry = 'real-estate';
    template = 'listing-assistant';
    name = 'Real Estate Listing Assistant';
    description = 'Helps with property listings';
  } else if (lower.includes('fintech')) {
    industry = 'fintech';
    template = 'financial-advisor';
    name = 'Fintech Advisor';
    description = 'Provides financial advice';
  }
  // Add more rules as needed
  return { name, industry, template, description, userId };
}

export const createMetaAgent = async (req, res) => {
  try {
    const userId = req.user.sub;
    let command;
    if (typeof req.body.command === 'string') {
      // Parse free-form command string
      command = parseCommandString(req.body.command, userId);
    } else {
      // Structured payload
      command = { ...req.body, userId };
    }
    const result = await metaAgentOrchestrator.createMetaAgent(command);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createAdvisorAgentTeam = async (req, res) => {
  try {
    const userId = req.user.sub;
    const deploy = req.body.deploy !== false; // default true
    const result = await metaAgentOrchestrator.createAdvisorAgentTeam({ userId, deploy });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 