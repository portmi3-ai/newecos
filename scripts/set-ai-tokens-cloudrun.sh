#!/bin/bash
# set-ai-tokens-cloudrun.sh
# Bash script to deploy to Cloud Run with Hugging Face and Gemini API keys as environment variables

set -euo pipefail

PROJECT_ID="mp135595"
REGION="us-central1"
SERVICE_NAME="agent-media-site"
IMAGE="us-central1-docker.pkg.dev/$PROJECT_ID/agent-media-site-repo/agent-media-site:latest"

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

# Deploy to Cloud Run with both tokens as env vars
echo "Deploying to Cloud Run with HF_TOKEN and GEMINI_API_KEY as environment variables..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars=HF_TOKEN="$HF_TOKEN",GEMINI_API_KEY="$GEMINI_API_KEY"

echo "Deployment complete!" 