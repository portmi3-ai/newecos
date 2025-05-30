#!/bin/bash
set -e

# Unpack the project (try tar.gz first, then zip)
if [ -f agentecos-main.tar.gz ]; then
  echo "Extracting agentecos-main.tar.gz..."
  tar -xzvf agentecos-main.tar.gz
elif [ -f agentecos-main.zip ]; then
  echo "Extracting agentecos-main.zip..."
  unzip agentecos-main.zip
else
  echo "No agentecos-main archive found. Please upload agentecos-main.tar.gz or agentecos-main.zip."
  exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t us-docker.pkg.dev/agentecos-1748475661/agentecos-main-repo/agentecos-main:latest ./agentecos-main

# Push the image to Artifact Registry
echo "Pushing Docker image..."
docker push us-docker.pkg.dev/agentecos-1748475661/agentecos-main-repo/agentecos-main:latest

# Set the GCP project
echo "Setting GCP project..."
gcloud config set project agentecos-1748475661

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy agentecos-main \
  --image=us-docker.pkg.dev/agentecos-1748475661/agentecos-main-repo/agentecos-main:latest \
  --region=us-central1 --platform=managed --allow-unauthenticated \
  --set-env-vars=AUTH0_AUDIENCE=placeholder,AUTH0_ISSUER_BASE_URL=placeholder,GCP_PROJECT_ID=agentecos-1748475661,GOOGLE_CLIENT_ID=placeholder,GOOGLE_CLIENT_SECRET=placeholder,GOOGLE_CALLBACK_URL=placeholder,JWT_SECRET=placeholder

echo "\nDeployment complete! Check the Cloud Run service in your GCP console." 