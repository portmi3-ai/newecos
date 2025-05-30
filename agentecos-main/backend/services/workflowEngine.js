import { firestore } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import orchestrator from './agentOrchestrator.js';

// Workflow Engine to manage multi-agent workflows
class WorkflowEngine {
  constructor() {
    this.workflows = new Map();
    this.executions = new Map();
  }
  
  // Create a new workflow
  async createWorkflow(name, description, agents, steps, userId) {
    try {
      // Validate workflow
      if (!name || !Array.isArray(agents) || agents.length === 0 || !Array.isArray(steps) || steps.length === 0) {
        throw new Error('Invalid workflow definition');
      }
      
      // Create workflow ID
      const workflowId = uuidv4();
      
      // Ensure steps have IDs
      const stepsWithIds = steps.map(step => ({
        id: step.id || uuidv4(),
        ...step
      }));
      
      // Store workflow in Firestore
      const workflow = {
        id: workflowId,
        name,
        description,
        agentIds: agents.map(a => a.id || a),
        steps: stepsWithIds,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await firestore.collection('workflows').doc(workflowId).set(workflow);
      
      // Store workflow in memory for faster access
      this.workflows.set(workflowId, workflow);
      
      return {
        id: workflowId,
        ...workflow
      };
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }
  
  // Execute a workflow
  async executeWorkflow(workflowId, input, context = {}) {
    try {
      // Get the workflow
      let workflow = this.workflows.get(workflowId);
      
      if (!workflow) {
        // Try to fetch from Firestore
        const workflowDoc = await firestore.collection('workflows').doc(workflowId).get();
        
        if (!workflowDoc.exists) {
          throw new Error(`Workflow ${workflowId} not found`);
        }
        
        workflow = workflowDoc.data();
        this.workflows.set(workflowId, workflow);
      }
      
      // Create execution ID
      const executionId = uuidv4();
      
      // Create execution record
      const execution = {
        id: executionId,
        workflowId,
        userId: workflow.userId,
        status: 'running',
        input,
        context: { ...context },
        results: {},
        startTime: new Date().toISOString(),
        endTime: null,
        currentStep: null
      };
      
      // Store execution in Firestore
      await firestore.collection('workflow-executions').doc(executionId).set(execution);
      
      // Store execution in memory
      this.executions.set(executionId, execution);
      
      // Start execution in background
      this.runExecution(executionId, workflow, input, context)
        .catch(error => console.error(`Execution ${executionId} failed:`, error));
      
      return {
        executionId,
        workflowId,
        status: 'running',
        startTime: execution.startTime
      };
    } catch (error) {
      console.error('Error starting workflow execution:', error);
      throw error;
    }
  }
  
  // Run workflow execution (internal method)
  async runExecution(executionId, workflow, input, context) {
    try {
      // Get execution
      let execution = this.executions.get(executionId);
      
      if (!execution) {
        const executionDoc = await firestore.collection('workflow-executions').doc(executionId).get();
        execution = executionDoc.data();
        this.executions.set(executionId, execution);
      }
      
      // Initialize execution context
      const workflowContext = { ...context, input, executionId };
      
      // Execute steps
      for (const step of workflow.steps) {
        try {
          // Update current step
          execution.currentStep = step.id;
          await firestore.collection('workflow-executions').doc(executionId).update({
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
          const result = await orchestrator.queryAgent(agentId, stepInput, {
            workflowId,
            executionId,
            stepId: step.id
          });
          
          // Store result in context
          workflowContext.lastOutput = result.output;
          workflowContext[step.id] = result;
          
          // Update execution with step result
          execution.results[step.id] = result;
          await firestore.collection('workflow-executions').doc(executionId).update({
            [`results.${step.id}`]: result,
            updatedAt: new Date().toISOString()
          });
          
          // Check for conditional next steps
          if (step.conditions && step.conditions.length > 0) {
            for (const condition of step.conditions) {
              // Evaluate condition
              if (this.evaluateCondition(result, condition.condition)) {
                // Set the next step based on condition
                if (condition.nextStepId) {
                  // Find the next step
                  const nextStepIndex = workflow.steps.findIndex(s => s.id === condition.nextStepId);
                  
                  if (nextStepIndex !== -1) {
                    // Adjust the workflow steps to go to this step next
                    const currentIndex = workflow.steps.findIndex(s => s.id === step.id);
                    
                    if (nextStepIndex > currentIndex + 1) {
                      // Move the next step right after the current one
                      const nextStep = workflow.steps[nextStepIndex];
                      workflow.steps.splice(nextStepIndex, 1);
                      workflow.steps.splice(currentIndex + 1, 0, nextStep);
                    }
                  }
                }
                break;
              }
            }
          }
        } catch (stepError) {
          // Log step failure
          console.error(`Step ${step.id} failed:`, stepError);
          
          // Update execution with failure
          await firestore.collection('workflow-executions').doc(executionId).update({
            [`results.${step.id}`]: {
              error: stepError.message,
              timestamp: new Date().toISOString()
            },
            status: 'failed',
            error: `Step ${step.id} failed: ${stepError.message}`,
            endTime: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          
          throw stepError;
        }
      }
      
      // Complete execution
      const endTime = new Date().toISOString();
      await firestore.collection('workflow-executions').doc(executionId).update({
        status: 'completed',
        endTime,
        output: workflowContext.lastOutput,
        updatedAt: endTime
      });
      
      // Update execution in memory
      execution.status = 'completed';
      execution.endTime = endTime;
      execution.output = workflowContext.lastOutput;
      
      return {
        executionId,
        status: 'completed',
        output: workflowContext.lastOutput,
        results: execution.results
      };
    } catch (error) {
      console.error(`Execution ${executionId} failed:`, error);
      
      // Update execution with failure if not already updated
      await firestore.collection('workflow-executions').doc(executionId).update({
        status: 'failed',
        error: error.message,
        endTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
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
    
    if (condition.includes('contains')) {
      const [left, right] = condition.split('contains').map(s => s.trim());
      
      // Extract left value from result
      let leftValue;
      if (left.startsWith('$.')) {
        const path = left.substring(2).split('.');
        leftValue = path.reduce((obj, key) => obj && obj[key], result);
      } else {
        leftValue = left;
      }
      
      // Check if string contains substring
      return typeof leftValue === 'string' && leftValue.includes(right.replace(/['"]/g, ''));
    }
    
    // Default
    return false;
  }
  
  // Get workflow execution status
  async getExecutionStatus(executionId) {
    try {
      // Try memory cache first
      let execution = this.executions.get(executionId);
      
      if (!execution) {
        // Fetch from Firestore
        const executionDoc = await firestore.collection('workflow-executions').doc(executionId).get();
        
        if (!executionDoc.exists) {
          throw new Error(`Execution ${executionId} not found`);
        }
        
        execution = executionDoc.data();
        
        // Cache for future requests
        this.executions.set(executionId, execution);
      }
      
      return {
        executionId,
        workflowId: execution.workflowId,
        status: execution.status,
        currentStep: execution.currentStep,
        startTime: execution.startTime,
        endTime: execution.endTime,
        ...(execution.status === 'completed' ? { output: execution.output } : {}),
        ...(execution.status === 'failed' ? { error: execution.error } : {})
      };
    } catch (error) {
      console.error(`Error getting execution ${executionId} status:`, error);
      throw error;
    }
  }
  
  // Get workflow execution results
  async getExecutionResults(executionId) {
    try {
      // Try memory cache first
      let execution = this.executions.get(executionId);
      
      if (!execution) {
        // Fetch from Firestore
        const executionDoc = await firestore.collection('workflow-executions').doc(executionId).get();
        
        if (!executionDoc.exists) {
          throw new Error(`Execution ${executionId} not found`);
        }
        
        execution = executionDoc.data();
        
        // Cache for future requests
        this.executions.set(executionId, execution);
      }
      
      return {
        executionId,
        workflowId: execution.workflowId,
        status: execution.status,
        input: execution.input,
        results: execution.results,
        output: execution.output,
        startTime: execution.startTime,
        endTime: execution.endTime
      };
    } catch (error) {
      console.error(`Error getting execution ${executionId} results:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const workflowEngine = new WorkflowEngine();

export default workflowEngine;