require('dotenv').config();
const { MCPServer } = require('@modelcontextprotocol/sdk');

const server = new MCPServer({
  name: 'AgentEcos MCP SSE Server',
  transport: 'sse',
  host: '0.0.0.0',
  port: 39300,
  basePath: '/model_context_protocol/2024-11-05/sse',
});

server.tool('add', async ({ a, b }) => a + b);
server.tool('subtract', async ({ a, b }) => a - b);
server.tool('deploy_agent', async ({ agent_name }) => `Agent '${agent_name}' deployed successfully.`);
server.tool('list_agents', async () => ['real_estate_agent', 'healthcare_agent', 'fintech_agent']);

server.start().then(() => {
  console.log('AgentEcos MCP SSE Server running on http://localhost:39300/model_context_protocol/2024-11-05/sse');
}); 