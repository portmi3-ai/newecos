import { z } from 'zod';
import { RELATIONSHIP_TYPES } from '../config/agent.js';

// Validation schema for relationships
export const relationshipSchema = z.object({
  sourceAgentId: z.string(),
  targetAgentId: z.string(),
  type: z.enum([...RELATIONSHIP_TYPES])
});

// Validate relationship request
export const validateRelationship = (data) => {
  return relationshipSchema.parse(data);
};