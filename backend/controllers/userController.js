import { firestore, collections } from '../config/db.js';
import { generateToken } from '../config/auth.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Google auth callback
export const googleAuthCallback = (req, res) => {
  try {
    // User is already authenticated by Passport
    const user = req.user;
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    res.status(500);
    throw new Error('Authentication error: ' + error.message);
  }
};

// Login with email/password
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }
    
    // Find user by email
    const usersRef = firestore.collection(collections.USERS);
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();
    
    if (snapshot.empty) {
      res.status(401);
      throw new Error('Invalid credentials');
    }
    
    let user;
    snapshot.forEach(doc => {
      user = {
        id: doc.id,
        ...doc.data()
      };
    });
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    await usersRef.doc(user.id).update({
      lastLogin: new Date().toISOString()
    });
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Register with email/password
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email and password');
    }
    
    // Check if email already exists
    const usersRef = firestore.collection(collections.USERS);
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (!snapshot.empty) {
      res.status(400);
      throw new Error('User already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const userDoc = usersRef.doc();
    const userId = userDoc.id;
    
    const user = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      authType: 'email',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    await userDoc.set(user);
    
    // Generate token
    const token = generateToken(user);
    
    // Don't return the password
    delete user.password;
    
    res.status(201).json({
      ...user,
      token
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const userRef = firestore.collection(collections.USERS).doc(userId);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error('User not found');
    }
    
    const user = doc.data();
    
    // Don't return password
    delete user.password;
    
    res.json(user);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { name } = req.body;
    
    if (!name) {
      res.status(400);
      throw new Error('Please provide name');
    }
    
    const userRef = firestore.collection(collections.USERS).doc(userId);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error('User not found');
    }
    
    // Update user
    await userRef.update({
      name,
      updatedAt: new Date().toISOString()
    });
    
    // Get updated user
    const updatedDoc = await userRef.get();
    const user = updatedDoc.data();
    
    // Don't return password
    delete user.password;
    
    res.json(user);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Get user subscription
export const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // In a real implementation, this would fetch from the subscription database
    // For demo, we'll return a mock subscription
    
    const subscription = {
      id: 'sub_123456',
      status: 'active',
      plan: 'pro',
      currentPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false
    };
    
    res.json(subscription);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};