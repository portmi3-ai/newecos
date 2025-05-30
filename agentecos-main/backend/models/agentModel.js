import { z } from 'zod';
import { AGENT_ROLE_LEVELS } from '../config/agent.js';

// Validation schema for creating agents
export const createAgentSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  industry: z.string().min(2).max(50),
  template: z.string().min(2).max(50),
  role: z.enum([...AGENT_ROLE_LEVELS]).optional(),
  parentAgentId: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional()
});

// Validation schema for updating agents
export const updateAgentSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  industry: z.string().min(2).max(50).optional(),
  template: z.string().min(2).max(50).optional(),
  role: z.enum([...AGENT_ROLE_LEVELS]).optional(),
  active: z.boolean().optional(),
  parentAgentId: z.string().optional().nullable(),
  capabilities: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional()
});

// Validate create agent request
export const validateCreateAgent = (data) => {
  return createAgentSchema.parse(data);
};

// Validate update agent request
export const validateUpdateAgent = (data) => {
  return updateAgentSchema.parse(data);
};