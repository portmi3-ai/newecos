#!/bin/bash
# build-push-deploy-fetch-url.sh
# Bash script to authenticate, build, push Docker image, deploy to Cloud Run with AI tokens, and fetch the service URL

set -euo pipefail

PROJECT_ID="mp135595"
REGION="us-central1"
REPO_NAME="agent-media-site-repo"
IMAGE_NAME="agent-media-site"
TAG="latest"
SERVICE_NAME="agent-media-site"
ARTIFACT_REPO="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$TAG"

# Get tokens from arguments or prompt
if [ $# -ge 2 ]; then
  HF_TOKEN="$1"
  GEMINI_API_KEY="$2"
else
  read -sp "Enter your Hugging Face token: " HF_TOKEN
  echo
  read -sp "Enter your Gemini API key: " GEMINI_API_KEY
  echo
fi

# Authenticate Docker with Artifact Registry
echo "Authenticating Docker with Artifact Registry..."
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet

# Build Docker image
echo "Building Docker image..."
docker build -t "$ARTIFACT_REPO" .

# Push Docker image
echo "Pushing Docker image to Artifact Registry..."
docker push "$ARTIFACT_REPO"

echo "Deploying to Cloud Run with HF_TOKEN and GEMINI_API_KEY as environment variables..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$ARTIFACT_REPO" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars=HF_TOKEN="$HF_TOKEN",GEMINI_API_KEY="$GEMINI_API_KEY"

echo "Fetching deployed service URL..."
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)')
echo "\nDeployment complete! Your service is live at: $SERVICE_URL" 