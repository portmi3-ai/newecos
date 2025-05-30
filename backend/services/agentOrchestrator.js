import { PubSub } from '@google-cloud/pubsub';
import { Storage } from '@google-cloud/storage';
import { firestore, collections } from '../config/db.js';
import { AGENT_STATES, AGENT_TOPICS, getAgentTopic, getAgentBucket } from '../config/agent.js';
import { Logging } from '@google-cloud/logging';
import fetch from 'node-fetch';

// Initialize clients
const pubsub = new PubSub();
const storage = new Storage();
const logging = new Logging();
const log = logging.log('agent-orchestrator');

// Orchestrator class to manage agent lifecycle and coordination
class AgentOrchestrator {
  constructor() {
    this.deploymentTopic = null;
    this.statusChangeTopic = null;
    this.interactionTopic = null;
    this.initialized = false;
  }
  
  // Initialize the orchestrator
  async initialize() {
    try {
      // Get PubSub topics
      this.deploymentTopic = await getAgentTopic('DEPLOYMENT');
      this.statusChangeTopic = await getAgentTopic('STATUS_CHANGE');
      this.interactionTopic = await getAgentTopic('INTERACTION');
      
      this.initialized = true;
      console.log('Agent Orchestrator initialized');
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Agent Orchestrator:', error);
      return false;
    }
  }
  
  // Deploy an agent
  async deployAgent(agentId, config) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Get the agent
      const agentRef = firestore.collection(collections.AGENTS).doc(agentId);
      const agentDoc = await agentRef.get();
      
      if (!agentDoc.exists) {
        throw new Error(`Agent ${agentId} not found`);
      }
      
      const agent = agentDoc.data();
      
      // Create deployment record
      const deploymentRef = firestore.collection(collections.DEPLOYMENTS).doc();
      const deploymentId = deploymentRef.id;
      
      const deployment = {
        id: deploymentId,
        agentId,
        userId: agent.userId,
        status: AGENT_STATES.DEPLOYING,
        config: {
          serviceType: config.serviceType || 'serverless',
          instanceSize: config.instanceSize || 'small',
          autoScaling: config.autoScaling !== undefined ? config.autoScaling : true,
          minInstances: config.minInstances || 0,
          maxInstances: config.maxInstances || 10,
          environmentVariables: config.environmentVariables || {}
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        logs: [
          {
            timestamp: new Date().toISOString(),
            message: 'Deployment initiated',
            level: 'info'
          }
        ]
      };
      
      await deploymentRef.set(deployment);
      
      // Update agent status
      await agentRef.update({
        status: AGENT_STATES.DEPLOYING,
        updatedAt: new Date().toISOString()
      });
      
      // Generate agent package (for real deployment)
      // In a production system, this would create necessary deployment artifacts
      
      // Simulate deployment process
      setTimeout(async () => {
        try {
          // Update deployment with success
          await deploymentRef.update({
            status: AGENT_STATES.DEPLOYED,
            serviceUrl: `https://agents-${config.serviceType}.mport.ai/agent-${agentId}`,
            updatedAt: new Date().toISOString(),
            logs: firestore.FieldValue.arrayUnion(
              {
                timestamp: new Date().toISOString(),
                message: 'Deployment completed successfully',
                level: 'info'
              }
            )
          });
          
          // Update agent status
          await agentRef.update({
            deployed: true,
            active: true,
            status: AGENT_STATES.DEPLOYED,
            lastDeployed: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          
          // Publish status change event
          await this.statusChangeTopic.publish(Buffer.from(JSON.stringify({
            agentId,
            status: AGENT_STATES.DEPLOYED,
            timestamp: new Date().toISOString()
          })));
          
          // Log success
          const metadata = {
            resource: { type: 'global' },
            severity: 'INFO',
          };
          
          const entry = log.entry(metadata, {
            deploymentId,
            agentId,
            action: 'deployment_succeeded',
            timestamp: new Date().toISOString(),
          });
          
          log.write(entry);
          
        } catch (innerError) {
          console.error('Error finalizing deployment:', innerError);
          
          // Update deployment with failure
          await deploymentRef.update({
            status: AGENT_STATES.FAILED,
            updatedAt: new Date().toISOString(),
            logs: firestore.FieldValue.arrayUnion(
              {
                timestamp: new Date().toISOString(),
                message: `Deployment failed: ${innerError.message}`,
                level: 'error'
              }
            )
          });
          
          // Update agent status
          await agentRef.update({
            status: AGENT_STATES.FAILED,
            updatedAt: new Date().toISOString()
          });
        }
      }, 5000); // Simulate deployment delay
      
      return deploymentId;
    } catch (error) {
      console.error('Deployment error:', error);
      
      // Log failure
      const metadata = {
        resource: { type: 'global' },
        severity: 'ERROR',
      };
      
      const entry = log.entry(metadata, {
        agentId,
        action: 'deployment_failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      
      log.write(entry);
      
      throw error;
    }
  }
  
  // Send a request to an agent
  async queryAgent(agentId, input, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Get the agent
      const agentRef = firestore.collection(collections.AGENTS).doc(agentId);
      const agentDoc = await agentRef.get();
      
      if (!agentDoc.exists) {
        throw new Error(`Agent ${agentId} not found`);
      }
      
      const agent = agentDoc.data();
      
      // Check if agent is active
      if (!agent.active) {
        throw new Error(`Agent ${agentId} is not active`);
      }
      
      // Get deployment details
      const deploymentsRef = firestore.collection(collections.DEPLOYMENTS);
      const deploymentSnapshot = await deploymentsRef
        .where('agentId', '==', agentId)
        .where('status', '==', AGENT_STATES.DEPLOYED)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
        
      if (deploymentSnapshot.empty) {
        throw new Error(`No active deployment found for agent ${agentId}`);
      }
      
      let deploymentUrl;
      deploymentSnapshot.forEach(doc => {
        deploymentUrl = doc.data().serviceUrl;
      });
      
      if (!deploymentUrl) {
        throw new Error(`No service URL found for agent ${agentId}`);
      }
      
      // In a real implementation, this would call the deployed agent
      // For demo, we'll simulate a response
      
      // Record the interaction start time
      const startTime = Date.now();
      
      // Simulate network request to the agent
      // const response = await fetch(deploymentUrl, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${options.token || ''}`
      //   },
      //   body: JSON.stringify({
      //     input,
      //     options
      //   })
      // });
      
      // Simulate a response
      const response = {
        ok: true,
        json: async () => ({
          output: `Response to: ${input}`,
          metadata: {
            processingTime: Math.floor(Math.random() * 500) + 100,
            model: 'gpt-4',
            usage: {
              promptTokens: Math.floor(Math.random() * 100) + 50,
              completionTokens: Math.floor(Math.random() * 200) + 100,
              totalTokens: Math.floor(Math.random() * 300) + 150
            }
          }
        })
      };
      
      if (!response.ok) {
        throw new Error(`Agent request failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      // Record interaction
      await this.interactionTopic.publish(Buffer.from(JSON.stringify({
        agentId,
        input,
        responseTime,
        timestamp: new Date().toISOString(),
        success: true,
        metadata: result.metadata
      })));
      
      return result;
    } catch (error) {
      console.error('Agent query error:', error);
      
      // Record failed interaction
      await this.interactionTopic.publish(Buffer.from(JSON.stringify({
        agentId,
        input,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      })));
      
      throw error;
    }
  }
  
  // Update agent status
  async updateAgentStatus(agentId, status) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Validate status
      if (!Object.values(AGENT_STATES).includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }
      
      // Get the agent
      const agentRef = firestore.collection(collections.AGENTS).doc(agentId);
      const agentDoc = await agentRef.get();
      
      if (!agentDoc.exists) {
        throw new Error(`Agent ${agentId} not found`);
      }
      
      // Update agent status
      await agentRef.update({
        status,
        active: status === AGENT_STATES.DEPLOYED,
        updatedAt: new Date().toISOString()
      });
      
      // Publish status change event
      await this.statusChangeTopic.publish(Buffer.from(JSON.stringify({
        agentId,
        status,
        timestamp: new Date().toISOString()
      })));
      
      return true;
    } catch (error) {
      console.error('Status update error:', error);
      throw error;
    }
  }
  
  // Create multi-agent workflow
  async createWorkflow(name, description, agentIds, steps) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Validate workflow
      if (!name || !Array.isArray(agentIds) || agentIds.length === 0 || !Array.isArray(steps) || steps.length === 0) {
        throw new Error('Invalid workflow definition');
      }
      
      // Get user ID from the first agent
      const agentRef = firestore.collection(collections.AGENTS).doc(agentIds[0]);
      const agentDoc = await agentRef.get();
      
      if (!agentDoc.exists) {
        throw new Error(`Agent ${agentIds[0]} not found`);
      }
      
      const userId = agentDoc.data().userId;
      
      // Create workflow
      const workflowRef = firestore.collection('workflows').doc();
      const workflow = {
        id: workflowRef.id,
        name,
        description: description || '',
        agentIds,
        steps,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await workflowRef.set(workflow);
      
      return {
        id: workflowRef.id,
        ...workflow
      };
    } catch (error) {
      console.error('Workflow creation error:', error);
      throw error;
    }
  }
  
  // Execute multi-agent workflow
  async executeWorkflow(workflowId, input, context = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Get the workflow
      const workflowRef = firestore.collection('workflows').doc(workflowId);
      const workflowDoc = await workflowRef.get();
      
      if (!workflowDoc.exists) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      
      const workflow = workflowDoc.data();
      
      // Create execution record
      const executionRef = firestore.collection('workflow-executions').doc();
      const execution = {
        id: executionRef.id,
        workflowId,
        userId: workflow.userId,
        status: 'running',
        input,
        context,
        results: {},
        startTime: new Date().toISOString(),
        endTime: null
      };
      
      await executionRef.set(execution);
      
      // Execute steps in sequence
      const workflowContext = { ...context, input };
      
      for (const step of workflow.steps) {
        try {
          // Update execution with current step
          await executionRef.update({
            currentStep: step.id,
            updatedAt: new Date().toISOString()
          });
          
          // Get agent for this step
          const agentId = step.agentId;
          
          // Prepare input for this step
          let stepInput;
          if (step.inputMapping) {
            // Apply input mapping to get the right input for this step
            stepInput = this.applyInputMapping(workflowContext, step.inputMapping);
          } else {
            // Use the original input or the previous step's output
            stepInput = workflowContext.lastOutput || input;
          }
          
          // Execute agent query
          const result = await this.queryAgent(agentId, stepInput, {
            workflowId,
            executionId: executionRef.id,
            stepId: step.id
          });
          
          // Store result in context
          workflowContext.lastOutput = result.output;
          workflowContext[step.id] = result;
          
          // Update execution with step result
          await executionRef.update({
            [`results.${step.id}`]: result,
            updatedAt: new Date().toISOString()
          });
          
          // Check for conditional next steps
          if (step.conditions && step.conditions.length > 0) {
            let conditionMet = false;
            
            for (const condition of step.conditions) {
              // Evaluate condition
              if (this.evaluateCondition(result, condition.condition)) {
                // Set the next step based on condition
                if (condition.nextStepId) {
                  // Find the index of the next step
                  const nextStepIndex = workflow.steps.findIndex(s => s.id === condition.nextStepId);
                  
                  if (nextStepIndex !== -1) {
                    // Adjust the loop to go to this step next
                    workflow.steps = [
                      ...workflow.steps.slice(0, workflow.steps.indexOf(step) + 1),
                      workflow.steps[nextStepIndex],
                      ...workflow.steps.slice(workflow.steps.indexOf(step) + 1)
                        .filter(s => s.id !== condition.nextStepId)
                    ];
                  }
                }
                
                conditionMet = true;
                break;
              }
            }
            
            // If no conditions met and there's a default next step
            if (!conditionMet && step.defaultNextStepId) {
              const nextStepIndex = workflow.steps.findIndex(s => s.id === step.defaultNextStepId);
              
              if (nextStepIndex !== -1) {
                // Adjust the loop to go to this step next
                workflow.steps = [
                  ...workflow.steps.slice(0, workflow.steps.indexOf(step) + 1),
                  workflow.steps[nextStepIndex],
                  ...workflow.steps.slice(workflow.steps.indexOf(step) + 1)
                    .filter(s => s.id !== step.defaultNextStepId)
                ];
              }
            }
          }
        } catch (stepError) {
          // Log step failure
          console.error(`Step ${step.id} failed:`, stepError);
          
          // Update execution with failure
          await executionRef.update({
            [`results.${step.id}`]: {
              error: stepError.message,
              timestamp: new Date().toISOString()
            },
            status: 'failed',
            error: `Step ${step.id} failed: ${stepError.message}`,
            endTime: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          
          throw new Error(`Workflow execution failed at step ${step.id}: ${stepError.message}`);
        }
      }
      
      // Complete execution
      await executionRef.update({
        status: 'completed',
        endTime: new Date().toISOString(),
        output: workflowContext.lastOutput,
        updatedAt: new Date().toISOString()
      });
      
      // Return the final result
      return {
        executionId: executionRef.id,
        status: 'completed',
        output: workflowContext.lastOutput,
        results: workflowContext
      };
    } catch (error) {
      console.error('Workflow execution error:', error);
      throw error;
    }
  }
  
  // Helper method to apply input mapping
  applyInputMapping(context, inputMapping) {
    // Simple input mapping implementation
    // In a real system, this would be more sophisticated
    
    let result;
    
    if (typeof inputMapping === 'string') {
      // Direct reference to a context value
      if (inputMapping.startsWith('$.')) {
        const path = inputMapping.substring(2).split('.');
        result = path.reduce((obj, key) => obj && obj[key], context);
      } else {
        // Literal string
        result = inputMapping;
      }
    } else if (typeof inputMapping === 'object') {
      // Object with mappings
      result = {};
      
      for (const [key, value] of Object.entries(inputMapping)) {
        if (typeof value === 'string' && value.startsWith('$.')) {
          const path = value.substring(2).split('.');
          result[key] = path.reduce((obj, key) => obj && obj[key], context);
        } else {
          result[key] = value;
        }
      }
    }
    
    return result;
  }
  
  // Helper method to evaluate conditions
  evaluateCondition(result, condition) {
    // Simple condition evaluation
    // In a real system, this would be more sophisticated
    
    if (condition.includes('==')) {
      const [left, right] = condition.split('==').map(s => s.trim());
      
      // Extract left value from result
      let leftValue;
      if (left.startsWith('$.')) {
        const path = left.substring(2).split('.');
        leftValue = path.reduce((obj, key) => obj && obj[key], result);
      } else {
        leftValue = left;
      }
      
      // Compare
      return leftValue == right;
    }
    
    if (condition.includes('!=')) {
      const [left, right] = condition.split('!=').map(s => s.trim());
      
      // Extract left value from result
      let leftValue;
      if (left.startsWith('$.')) {
        const path = left.substring(2).split('.');
        leftValue = path.reduce((obj, key) => obj && obj[key], result);
      } else {
        leftValue = left;
      }
      
      // Compare
      return leftValue != right;
    }
    
    // Default
    return false;
  }
}

// Create singleton instance
const orchestrator = new AgentOrchestrator();

export default orchestrator;