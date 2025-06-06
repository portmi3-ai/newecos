#!/bin/bash

# Usage: ./create_gcp_service_account_key.sh [SERVICE_ACCOUNT_EMAIL] [PROJECT_ID]
# Example: ./create_gcp_service_account_key.sh my-sa@my-project.iam.gserviceaccount.com my-project

SERVICE_ACCOUNT_EMAIL="$1"
PROJECT_ID="$2"
KEY_PATH="backend/keys/gcp-service-account.json"

if [ -z "$SERVICE_ACCOUNT_EMAIL" ]; then
  read -p "Enter your service account email: " SERVICE_ACCOUNT_EMAIL
fi
if [ -z "$PROJECT_ID" ]; then
  read -p "Enter your GCP project ID: " PROJECT_ID
fi

mkdir -p backend/keys

echo "Creating service account key for $SERVICE_ACCOUNT_EMAIL in project $PROJECT_ID..."
gcloud iam service-accounts keys create "$KEY_PATH" \
  --iam-account="$SERVICE_ACCOUNT_EMAIL" \
  --project="$PROJECT_ID"

if [ $? -eq 0 ]; then
  echo "Key created and saved to $KEY_PATH"
else
  echo "Failed to create key. Check your gcloud authentication and permissions."
  exit 1
fi 