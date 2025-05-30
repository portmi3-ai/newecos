const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '656424752070-fqk14rlvds71aaok82tvta3g0mpqq9v3.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

async function verifyGoogleToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) return res.status(401).json({ error: 'Missing or invalid Authorization header' });

  const idToken = match[1];
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });
    req.user = ticket.getPayload();
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid ID token' });
  }
}

module.exports = verifyGoogleToken; 