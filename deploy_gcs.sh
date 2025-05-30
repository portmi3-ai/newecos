#!/bin/bash

# Exit on error
set -e

# Variables
PROJECT_ID="mp135595"
BUCKET_NAME="mp135595-metaagent-frontend"
FRONTEND_DIR="website"
BUILD_DIR="$FRONTEND_DIR/build"

# Build the React app
cd $FRONTEND_DIR
npm install
npm run build
cd ..

# Create the bucket if it doesn't exist
gsutil ls -b gs://$BUCKET_NAME || gsutil mb -p $PROJECT_ID -l us-central1 gs://$BUCKET_NAME

# Set the bucket for website hosting
gsutil web set -m index.html -e 404.html gs://$BUCKET_NAME

# Copy build output to the bucket
gsutil -m rsync -R $BUILD_DIR gs://$BUCKET_NAME

echo "\nDeployment complete!"
echo "Your site is live at: https://storage.googleapis.com/$BUCKET_NAME/index.html or via your custom domain if configured." 