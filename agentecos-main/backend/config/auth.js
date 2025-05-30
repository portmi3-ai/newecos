import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { firestore, collections } from './db.js';

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists in database
        const userRef = firestore.collection(collections.USERS).doc(profile.id);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
          // Create new user
          const newUser = {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0].value,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          
          await userRef.set(newUser);
          return done(null, newUser);
        }
        
        // Update existing user's last login
        await userRef.update({
          lastLogin: new Date().toISOString(),
        });
        
        return done(null, userDoc.data());
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const userRef = firestore.collection(collections.USERS).doc(id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return done(new Error('User not found'), null);
    }
    
    return done(null, userDoc.data());
  } catch (error) {
    return done(error, null);
  }
});

// Generate JWT token
export const generateToken = (user) => {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
  };
  
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

// Initialize passport
export const initializeAuth = (app) => {
  app.use(passport.initialize());
  
  return passport;
};