import { auth } from 'express-oauth2-jwt-bearer';
import { OAuth2Client } from 'google-auth-library';

// Auth0 JWT validation middleware
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

// Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Google OAuth token verification middleware
export const verifyGoogleToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Check user subscription middleware
export const checkSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // In a real implementation, this would check the user's subscription status
    // from the database or a subscription service
    
    // For now, we'll assume all users are subscribed
    req.user.hasSubscription = true;
    
    next();
  } catch (error) {
    next(error);
  }
};