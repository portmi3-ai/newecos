#!/bin/bash

# Make sure gcloud is installed and configured
echo "Deploying Sasha to Google Cloud Run..."

gcloud builds submit --config cloudbuild.yaml --project=$PROJECT_ID

echo "Deployment initiated. Visit your Cloud Run dashboard to monitor."
