#!/bin/bash
# deploy-cloudrun-artifact.sh
# Bash script to build, push, and deploy Docker image to Google Artifact Registry and Cloud Run
# Usage: ./deploy-cloudrun-artifact.sh /path/to/service-account-key.json

set -euo pipefail

# Configurable variables
PROJECT_ID="mp135595"
REGION="us-central1"
REPO_NAME="agent-media-site-repo"
IMAGE_NAME="agent-media-site"
SERVICE_NAME="agent-media-site"
TAG="latest"
ARTIFACT_REPO="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$TAG"

# Check for service account key argument
if [ $# -lt 1 ]; then
  echo "Usage: $0 /path/to/service-account-key.json"
  exit 1
fi
SA_KEY="$1"

# Authenticate with service account
echo "Activating service account..."
gcloud auth activate-service-account --key-file="$SA_KEY"
gcloud config set project "$PROJECT_ID"

echo "Enabling Artifact Registry API (if needed)..."
gcloud services enable artifactregistry.googleapis.com || true

echo "Creating Artifact Registry Docker repo (if needed)..."
gcloud artifacts repositories create "$REPO_NAME" --repository-format=docker --location="$REGION" --description="Docker repo for $IMAGE_NAME" 2>/dev/null || true

echo "Configuring Docker authentication for Artifact Registry..."
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet

echo "Building Docker image..."
docker build -t "$ARTIFACT_REPO" .

echo "Pushing Docker image to Artifact Registry..."
docker push "$ARTIFACT_REPO"

echo "Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$ARTIFACT_REPO" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated

echo "Fetching deployed service URL..."
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)')
echo "\nDeployment complete! Your service is live at: $SERVICE_URL" 