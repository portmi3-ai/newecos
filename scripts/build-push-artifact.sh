#!/bin/bash
# build-push-artifact.sh
# Bash script to authenticate, build, and push Docker image to Artifact Registry

set -euo pipefail

PROJECT_ID="mp135595"
REGION="us-central1"
REPO_NAME="agent-media-site-repo"
IMAGE_NAME="agent-media-site"
TAG="latest"
ARTIFACT_REPO="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$TAG"

# Authenticate Docker with Artifact Registry
echo "Authenticating Docker with Artifact Registry..."
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet

# Build Docker image
echo "Building Docker image..."
docker build -t "$ARTIFACT_REPO" .

# Push Docker image
echo "Pushing Docker image to Artifact Registry..."
docker push "$ARTIFACT_REPO"

echo "Image pushed successfully: $ARTIFACT_REPO" 