import { z } from 'zod';

export const metaAgentSchema = z.object({
  name: z.string().min(1),
  industry: z.string().min(1),
  template: z.string().min(1),
  description: z.string().optional(),
  userId: z.string().min(1),
  role: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
  deploy: z.boolean().optional().default(true),
}); 