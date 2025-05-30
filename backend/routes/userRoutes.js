import express from 'express';
import passport from 'passport';
import * as userController from '../controllers/userController.js';
import { checkJwt } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auth routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  userController.googleAuthCallback
);

// Login with email/password (JWT)
router.post('/login', userController.login);

// Register with email/password
router.post('/register', userController.register);

// Protected routes
router.use(checkJwt);

// Get current user
router.get('/me', userController.getCurrentUser);

// Update user
router.put('/me', userController.updateUser);

// Get user subscription
router.get('/subscription', userController.getUserSubscription);

export default router;