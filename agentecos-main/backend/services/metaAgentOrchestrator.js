import agentFactory from './agentFactory.js';
import orchestrator from './agentOrchestrator.js';
import workflowEngine from './workflowEngine.js';
import { z } from 'zod';
import { metaAgentSchema } from '../models/metaAgentModel.js';

class MetaAgentOrchestrator {
  async createMetaAgent(command) {
    // Validate input
    const parseResult = metaAgentSchema.safeParse(command);
    if (!parseResult.success) {
      throw new Error('Invalid meta agent command: ' + JSON.stringify(parseResult.error.issues));
    }
    const { name, industry, template, description, userId, role, capabilities = [], deploy = true } = command;
    try {
      // Create agent from template
      const agent = await agentFactory.createAgentFromTemplate({
        name,
        industry,
        template,
        description,
        userId,
        role,
        capabilities
      });
      let deployment = null;
      if (deploy) {
        // Deploy the agent
        deployment = await orchestrator.deployAgent(agent.id, {
          serviceType: 'serverless',
          environmentVariables: {},
        });
      }
      return {
        agentId: agent.id,
        status: deploy ? 'deployed' : 'created',
        deploymentId: deployment,
      };
    } catch (error) {
      console.error('MetaAgentOrchestrator error:', error);
      throw error;
    }
  }

  // Create the Advisor Agent Team blueprint, deploy all agents, and create a workflow
  async createAdvisorAgentTeam({ userId, deploy = true }) {
    try {
      // Blueprint ID for Advisor Agent Team (should match blueprint in agentFactory)
      const blueprintId = 'advisor-agent-team';
      // For demo, deploy all roles in the blueprint
      const selectedRoles = [];
      // Create agents from blueprint
      const { agents } = await agentFactory.createAgentsFromBlueprint(blueprintId, selectedRoles, userId);
      // Deploy each agent if requested
      let deployments = [];
      if (deploy) {
        deployments = await Promise.all(
          agents.map(async (agent) => {
            const deploymentId = await orchestrator.deployAgent(agent.id, {
              serviceType: 'serverless',
              environmentVariables: {},
            });
            return { agentId: agent.id, deploymentId };
          })
        );
      }
      // Create a workflow for the team
      const workflowName = 'Advisor Agent Team Workflow';
      const workflowDescription = 'Orchestrates the Advisor Agent Team for funding and investment.';
      // Simple sequential steps for each agent
      const steps = agents.map((agent, idx) => ({
        id: `step-${idx + 1}`,
        agentId: agent.id,
        name: agent.name,
        inputMapping: idx === 0 ? '$.input' : `$.step-${idx}`
      }));
      const workflow = await workflowEngine.createWorkflow(
        workflowName,
        workflowDescription,
        agents,
        steps,
        userId
      );
      return {
        agents,
        deployments,
        workflow
      };
    } catch (error) {
      console.error('AdvisorAgentTeam error:', error);
      throw error;
    }
  }
}

const metaAgentOrchestrator = new MetaAgentOrchestrator();
export default metaAgentOrchestrator; 