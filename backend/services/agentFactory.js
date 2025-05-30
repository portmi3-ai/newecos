import { v4 as uuidv4 } from 'uuid';
import { Storage } from '@google-cloud/storage';
import { firestore, collections } from '../config/db.js';
import { AGENT_STATES } from '../config/agent.js';
import { Logging } from '@google-cloud/logging';

// Initialize clients
const storage = new Storage();
const logging = new Logging();
const log = logging.log('agent-factory');

// Define templates for different industries and roles
const AGENT_TEMPLATES = {
  'real-estate': {
    'listing-assistant': {
      name: 'Listing Assistant',
      description: 'Helps create, manage, and optimize property listings',
      capabilities: ['property-description', 'market-analysis', 'pricing-recommendations'],
      agentType: 'specialized',
      modelConfig: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2048
      },
      promptTemplate: `You are a Real Estate Listing Assistant designed to help real estate agents create and optimize property listings. Your goal is to provide compelling property descriptions, market analysis, and pricing recommendations.

When given information about a property, you should:
1. Create an engaging property description that highlights key features
2. Analyze the market conditions for similar properties
3. Recommend optimal pricing based on comparables
4. Suggest improvements to maximize appeal

Property Information:
{{propertyInfo}}

Please provide a comprehensive response covering the above points.`
    },
    'executive-director': {
      name: 'Executive Director',
      description: 'Oversees and coordinates all real estate operations',
      capabilities: ['strategic-planning', 'team-coordination', 'performance-monitoring'],
      agentType: 'executive',
      modelConfig: {
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 2048
      },
      promptTemplate: `You are a Real Estate Executive Director responsible for overseeing all aspects of a real estate operation. Your goal is to provide strategic leadership, coordinate team efforts, and monitor overall performance.

When presented with a situation or query, you should:
1. Analyze the strategic implications
2. Recommend resource allocation and team coordination
3. Establish performance metrics and goals
4. Make executive decisions based on market conditions

Current Situation:
{{situation}}

Please provide executive-level guidance on this matter.`
    }
  },
  'fintech': {
    'financial-advisor': {
      name: 'Financial Advisor',
      description: 'Provides personalized financial advice and recommendations',
      capabilities: ['investment-analysis', 'risk-assessment', 'portfolio-optimization'],
      agentType: 'specialized',
      modelConfig: {
        model: 'gpt-4',
        temperature: 0.2,
        maxTokens: 2048
      },
      promptTemplate: `You are a Financial Advisor AI assistant designed to provide personalized financial advice and investment recommendations. Your goal is to help clients make informed financial decisions based on their goals, risk tolerance, and market conditions.

When given financial information, you should:
1. Analyze the client's financial situation
2. Assess risk tolerance and investment goals
3. Provide tailored investment recommendations
4. Explain the rationale behind your advice

Client Information:
{{clientInfo}}

Please provide comprehensive financial advice addressing the client's needs.`
    }
  }
  // Additional industry templates would be defined here
};

// Agent Factory service for creating agent instances
class AgentFactory {
  // Create a new agent from template
  async createAgentFromTemplate(params) {
    try {
      const { 
        name, 
        industry, 
        template, 
        description = '',
        userId,
        role,
        parentAgentId,
        capabilities = []
      } = params;
      
      // Validate template exists
      if (!AGENT_TEMPLATES[industry] || !AGENT_TEMPLATES[industry][template]) {
        throw new Error(`Template not found for industry: ${industry}, template: ${template}`);
      }
      
      const templateConfig = AGENT_TEMPLATES[industry][template];
      
      // Create agent document
      const agentRef = firestore.collection(collections.AGENTS).doc();
      const agentId = agentRef.id;
      
      // Combine template capabilities with custom capabilities
      const combinedCapabilities = [
        ...templateConfig.capabilities,
        ...capabilities
      ];
      
      // Create agent object
      const agent = {
        id: agentId,
        name,
        description: description || templateConfig.description,
        industry,
        template,
        role: role || templateConfig.agentType,
        active: false,
        deployed: false,
        status: AGENT_STATES.CREATED,
        createdAt: new Date().toISOString(),
        lastDeployed: null,
        parentAgentId: parentAgentId || null,
        userId,
        capabilities: combinedCapabilities
      };
      
      // Create agent configuration for deployment
      const agentConfig = {
        id: agentId,
        name,
        description: description || templateConfig.description,
        industry,
        template,
        promptTemplate: templateConfig.promptTemplate,
        modelConfig: templateConfig.modelConfig
      };
      
      // Store agent in Firestore
      await agentRef.set(agent);
      
      // Store agent configuration in Cloud Storage
      const bucket = await getAgentBucket();
      const configFile = bucket.file(`agents/${agentId}/config.json`);
      
      await configFile.save(JSON.stringify(agentConfig, null, 2), {
        contentType: 'application/json'
      });
      
      // If parent agent specified, create relationship
      if (parentAgentId) {
        const relationshipRef = firestore.collection(collections.RELATIONSHIPS).doc();
        
        // Create reports_to relationship
        await relationshipRef.set({
          sourceAgentId: agentId,
          targetAgentId: parentAgentId,
          type: 'reports_to',
          createdAt: new Date().toISOString(),
          userId
        });
        
        // Create supervises relationship
        const superviseRef = firestore.collection(collections.RELATIONSHIPS).doc();
        await superviseRef.set({
          sourceAgentId: parentAgentId,
          targetAgentId: agentId,
          type: 'supervises',
          createdAt: new Date().toISOString(),
          userId
        });
        
        // Update parent agent to include this child
        const parentRef = firestore.collection(collections.AGENTS).doc(parentAgentId);
        await parentRef.update({
          childAgentIds: firestore.FieldValue.arrayUnion(agentId)
        });
      }
      
      // Log creation
      const metadata = {
        resource: { type: 'global' },
        severity: 'INFO',
      };
      
      const entry = log.entry(metadata, {
        agentId,
        userId,
        template: `${industry}/${template}`,
        action: 'agent_created',
        timestamp: new Date().toISOString(),
      });
      
      log.write(entry);
      
      return {
        id: agentId,
        ...agent
      };
    } catch (error) {
      console.error('Error creating agent from template:', error);
      
      // Log error
      const metadata = {
        resource: { type: 'global' },
        severity: 'ERROR',
      };
      
      const entry = log.entry(metadata, {
        industry: params.industry,
        template: params.template,
        error: error.message,
        action: 'agent_creation_failed',
        timestamp: new Date().toISOString(),
      });
      
      log.write(entry);
      
      throw error;
    }
  }
  
  // Create a blueprint of agents
  async createAgentsFromBlueprint(blueprintId, selectedRoles, userId) {
    try {
      // In a real implementation, this would fetch the blueprint from Firestore
      // For demo, we'll use a static blueprint
      
      // Simulate blueprint fetch
      const blueprint = {
        id: blueprintId,
        name: 'Real Estate Agency',
        industryId: 'real-estate',
        description: 'Complete hierarchy for real estate operations',
        roles: [
          {
            id: 're-executive-director',
            name: 'Real Estate Executive Director',
            level: 'executive',
            responsibilities: [
              'Strategic oversight of all real estate operations',
              'Resource allocation across departments'
            ]
          },
          {
            id: 're-listing-manager',
            name: 'Listing Department Manager',
            level: 'management',
            reportsTo: 're-executive-director',
            responsibilities: [
              'Oversee property listing creation and management',
              'Coordinate listing team activities'
            ]
          },
          {
            id: 're-content-creator',
            name: 'Property Content Creator',
            level: 'operational',
            reportsTo: 're-listing-manager',
            responsibilities: [
              'Create compelling property descriptions',
              'Optimize listing content for search'
            ]
          }
        ]
      };
      
      // Filter roles if selected roles provided
      const rolesToDeploy = selectedRoles.length > 0
        ? blueprint.roles.filter(role => selectedRoles.includes(role.id))
        : blueprint.roles;
      
      if (rolesToDeploy.length === 0) {
        throw new Error('No roles selected for deployment');
      }
      
      // Create batch for transaction
      const batch = firestore.batch();
      
      // Track created agents to establish relationships later
      const createdAgents = {};
      
      // First pass: create agents
      for (const role of rolesToDeploy) {
        const agentRef = firestore.collection(collections.AGENTS).doc();
        const agentId = agentRef.id;
        
        const newAgent = {
          name: role.name,
          description: `${role.name} from ${blueprint.name} blueprint`,
          industry: blueprint.industryId,
          template: role.id,
          role: role.level,
          active: false,
          deployed: false,
          status: AGENT_STATES.CREATED,
          createdAt: new Date().toISOString(),
          lastDeployed: null,
          parentAgentId: null, // Will be set in second pass
          userId,
          capabilities: [], // Would be derived from role in real implementation
          fromBlueprint: blueprintId,
          responsibilities: role.responsibilities
        };
        
        batch.set(agentRef, newAgent);
        
        // Store reference for relationship creation
        createdAgents[role.id] = {
          id: agentId,
          roleData: role
        };
      }
      
      // Second pass: establish relationships
      for (const roleId in createdAgents) {
        const { id: agentId, roleData } = createdAgents[roleId];
        
        // If this role reports to another role that was deployed
        if (roleData.reportsTo && createdAgents[roleData.reportsTo]) {
          const parentAgentId = createdAgents[roleData.reportsTo].id;
          
          // Update agent with parent reference
          const agentRef = firestore.collection(collections.AGENTS).doc(agentId);
          batch.update(agentRef, {
            parentAgentId
          });
          
          // Create reports_to relationship
          const reportsToRef = firestore.collection(collections.RELATIONSHIPS).doc();
          batch.set(reportsToRef, {
            sourceAgentId: agentId,
            targetAgentId: parentAgentId,
            type: 'reports_to',
            userId,
            createdAt: new Date().toISOString()
          });
          
          // Create supervises relationship
          const supervisesRef = firestore.collection(collections.RELATIONSHIPS).doc();
          batch.set(supervisesRef, {
            sourceAgentId: parentAgentId,
            targetAgentId: agentId,
            type: 'supervises',
            userId,
            createdAt: new Date().toISOString()
          });
        }
      }
      
      // Commit the batch
      await batch.commit();
      
      // Log blueprint deployment
      const metadata = {
        resource: { type: 'global' },
        severity: 'INFO',
      };
      
      const entry = log.entry(metadata, {
        blueprintId,
        userId,
        agentCount: rolesToDeploy.length,
        action: 'blueprint_deployed',
        timestamp: new Date().toISOString(),
      });
      
      log.write(entry);
      
      return {
        deployedRoles: rolesToDeploy.length,
        agents: Object.values(createdAgents).map(a => ({
          id: a.id,
          name: a.roleData.name,
          role: a.roleData.level
        }))
      };
    } catch (error) {
      console.error('Error creating agents from blueprint:', error);
      
      // Log error
      const metadata = {
        resource: { type: 'global' },
        severity: 'ERROR',
      };
      
      const entry = log.entry(metadata, {
        blueprintId,
        error: error.message,
        action: 'blueprint_deployment_failed',
        timestamp: new Date().toISOString(),
      });
      
      log.write(entry);
      
      throw error;
    }
  }
}

// Create singleton instance
const agentFactory = new AgentFactory();

export default agentFactory;