import { z } from 'zod';

// Validation schema for deployments
export const deploymentSchema = z.object({
  serviceType: z.enum(['serverless', 'container', 'function']).optional(),
  instanceSize: z.enum(['small', 'medium', 'large']).optional(),
  autoScaling: z.boolean().optional(),
  minInstances: z.number().min(0).optional(),
  maxInstances: z.number().min(1).optional(),
  environmentVariables: z.record(z.string()).optional(),
  secrets: z.record(z.string()).optional()
});

// Validate deployment request
export const validateDeployment = (data) => {
  return deploymentSchema.parse(data);
};