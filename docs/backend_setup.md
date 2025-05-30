# AgentEcos Backend Setup

This document provides instructions for setting up and deploying the AgentEcos backend on Google Cloud Platform.

## Architecture Overview

The AgentEcos backend consists of the following components:

1. **API Server**: Express.js REST API for agent management
2. **Agent Orchestration Layer**: Services for agent lifecycle management and coordination
3. **Database**: Firestore for agent data and configuration
4. **Authentication**: JWT authentication with Google OAuth support
5. **Pub/Sub**: For event-driven communication between system components
6. **Cloud Storage**: For storing agent artifacts and configuration
7. **Cloud Logging**: For centralized logging and monitoring

## Prerequisites

- Google Cloud account with billing enabled
- Google Cloud CLI (`gcloud`) installed and configured
- Node.js v18+ and npm installed
- Docker installed (for containerized deployments)

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
# Application Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Google Cloud Configuration
GCP_PROJECT_ID=your-gcp-project-id
GCP_REGION=us-central1
GCP_KEY_FILE=your-key-file.json

# Authentication
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/users/auth/google/callback

# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://api.agentecos.com
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com

# Agent Configuration
AGENT_ARTIFACTS_BUCKET=agent-ecos-artifacts
```

## Local Development Setup

1. Install dependencies:

```bash
npm install
```

2. Start the backend development server:

```bash
npm run start:backend
```

3. Start both frontend and backend concurrently:

```bash
npm run dev:full
```

## Google Cloud Setup

### 1. Create a Google Cloud Project

```bash
gcloud projects create agent-ecos --name="Agent Ecos Platform"
gcloud config set project agent-ecos
```

### 2. Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable pubsub.googleapis.com
```

### 3. Create Service Account

```bash
gcloud iam service-accounts create agent-ecos-service
gcloud projects add-iam-policy-binding agent-ecos \
    --member="serviceAccount:agent-ecos-service@agent-ecos.iam.gserviceaccount.com" \
    --role="roles/owner"
```

### 4. Create and Configure Firestore Database

```bash
gcloud firestore databases create --region=us-central
```

### 5. Create Cloud Storage Bucket

```bash
gcloud storage buckets create gs://agent-ecos-artifacts
```

### 6. Set Up Pub/Sub Topics

```bash
gcloud pubsub topics create agent-deployment
gcloud pubsub topics create agent-status-change
gcloud pubsub topics create agent-interaction
```

### 7. Store Secrets in Secret Manager

```bash
echo -n "your_jwt_secret" | gcloud secrets create jwt-secret --data-file=-
echo -n "your_google_client_id" | gcloud secrets create google-client-id --data-file=-
echo -n "your_google_client_secret" | gcloud secrets create google-client-secret --data-file=-
```

## Deployment

### Deploy to Cloud Run

1. Build the Docker image:

```bash
docker build -t gcr.io/agent-ecos/api:latest .
```

2. Push the image to Google Container Registry:

```bash
docker push gcr.io/agent-ecos/api:latest
```

3. Deploy to Cloud Run:

```bash
gcloud run deploy agent-ecos-api \
  --image gcr.io/agent-ecos/api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=8080,GCP_PROJECT_ID=agent-ecos \
  --set-secrets JWT_SECRET=jwt-secret:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest
```

## API Endpoints

The backend exposes the following API endpoints:

### Authentication

- `POST /api/users/login` - Login with email/password
- `POST /api/users/register` - Register with email/password
- `GET /api/users/auth/google` - Login with Google
- `GET /api/users/auth/google/callback` - Google OAuth callback
- `GET /api/users/me` - Get current user

### Agents

- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get agent by ID
- `POST /api/agents` - Create a new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `PATCH /api/agents/:id/status` - Toggle agent status

### Deployments

- `GET /api/deployments` - Get all deployments
- `GET /api/deployments/:id` - Get deployment by ID
- `POST /api/deployments/:agentId` - Deploy agent
- `GET /api/deployments/:id/status` - Get deployment status
- `GET /api/deployments/:id/logs` - Get deployment logs

### Relationships

- `GET /api/relationships` - Get all relationships
- `POST /api/relationships` - Create a relationship
- `DELETE /api/relationships/:sourceAgentId/:targetAgentId` - Delete relationship
- `GET /api/relationships/hierarchy` - Get agent hierarchy
- `GET /api/relationships/network` - Get agent network

### Blueprints

- `GET /api/blueprints` - Get all blueprints
- `GET /api/blueprints/:id` - Get blueprint by ID
- `GET /api/blueprints/industry/:industryId` - Get blueprints by industry
- `POST /api/blueprints/:id/deploy` - Deploy blueprint
- `POST /api/blueprints` - Create custom blueprint

### Metrics

- `GET /api/metrics/ecosystem` - Get ecosystem metrics
- `GET /api/metrics/agent/:agentId` - Get agent metrics
- `GET /api/metrics/industry/:industryId` - Get industry metrics
- `GET /api/metrics/relationships` - Get relationship metrics

## Monitoring and Logging

The backend uses Google Cloud Logging for centralized logging. All API requests, deployments, and errors are logged to Google Cloud.

To view logs:

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=agent-ecos-api"
```

## Security Considerations

1. **Authentication**: All API endpoints (except public endpoints) require a valid JWT token.
2. **HTTPS**: All communication should use HTTPS.
3. **API Keys**: Store API keys in Secret Manager, not in code.
4. **CORS**: The API server is configured to accept requests only from allowed origins.
5. **Rate Limiting**: Implement rate limiting in production to prevent abuse.

## Agent Deployment Process

When an agent is deployed, the following steps occur:

1. A deployment record is created in Firestore.
2. The agent configuration is packaged and stored in Cloud Storage.
3. A deployment event is published to the agent-deployment Pub/Sub topic.
4. The deployment service (Cloud Function or Cloud Run service) picks up the event.
5. The agent is deployed as a Cloud Run service.
6. The deployment status is updated in Firestore.
7. A status change event is published to the agent-status-change Pub/Sub topic.