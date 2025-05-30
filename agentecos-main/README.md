# Mport Media Group Node.js API

## Overview
A production-ready, modular Node.js/Express API for Mport Media Group, deployable to Google Cloud Run.

## Project Structure
```
agentecos-main/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   │   └── index.js
│   └── server.js
├── tests/
│   └── sample.test.js
├── Dockerfile
├── package.json
├── README.md
├── .dockerignore
├── deploy.ps1
└── install_and_check.ps1
```

## API Endpoints
- `GET /` — Returns a hello message.

## Local Development
1. Install dependencies:
   ```
   npm install
   ```
2. Start the server:
   ```
   npm start
   ```
3. Visit [http://localhost:8080](http://localhost:8080)

## Testing
Run all Jest tests:
```
npm test
```

## Deployment (Local to Google Cloud Run)

1. Ensure Docker, gcloud CLI, and PowerShell are installed.
2. Authenticate with Google Cloud:
   ```
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
3. Run the deployment script:
   ```
   ./deploy.ps1
   ```
4. Set environment variables in Cloud Run for production secrets.

**Note:** The script will update `server.js` to use the correct port for Cloud Run.

### Best Practices
- Never commit `.env` or secrets to git.
- Use GCP Secret Manager for production secrets.
- Regularly rotate credentials. 