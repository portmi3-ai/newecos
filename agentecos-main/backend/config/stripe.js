// Stripe configuration
// Loads the Stripe API key from the environment variable STRIPE_API_KEY.
// Ensure you set STRIPE_API_KEY in your .env file. Do NOT commit .env to version control.

import Stripe from 'stripe';

const STRIPE_API_KEY = process.env.STRIPE_API_KEY;

if (!STRIPE_API_KEY) {
  throw new Error('STRIPE_API_KEY is not set in environment variables.');
}

const stripe = new Stripe(STRIPE_API_KEY, {
  apiVersion: '2022-11-15',
});

export default stripe; 