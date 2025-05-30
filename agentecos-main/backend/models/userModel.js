import { z } from 'zod';

// Validation schema for user login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Validation schema for user registration
export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6)
});

// Validation schema for user update
export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional()
});

// Validate login request
export const validateLogin = (data) => {
  return loginSchema.parse(data);
};

// Validate registration request
export const validateRegister = (data) => {
  return registerSchema.parse(data);
};

// Validate user update request
export const validateUserUpdate = (data) => {
  return updateUserSchema.parse(data);
};