import { auth } from 'express-oauth2-jwt-bearer';
import { loadConfig } from '../config/environment.js';

// Initialize config
let config;
(async () => {
  config = await loadConfig();
})();

// JWT Auth Middleware
export const authenticateJWT = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

// Role-based authorization middleware
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.auth || !req.auth.payload) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const roles = req.auth.payload[`${process.env.AUTH0_ISSUER_BASE_URL}/roles`] || [];
    
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

// User ID verification middleware
export const verifyUserId = (req, res, next) => {
  if (!req.auth || !req.auth.payload) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = req.auth.payload.sub;
  if (!userId) {
    return res.status(401).json({ error: 'Invalid user ID' });
  }

  req.user = { sub: userId };
  next();
}; 