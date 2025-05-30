# Deploy-To-ArtifactRegistry.ps1
# PowerShell script to build, push, and deploy Docker image to Google Artifact Registry and Cloud Run

$ErrorActionPreference = 'Stop'

$PROJECT_ID = "mp135595"
$REGION = "us-central1"
$REPO_NAME = "agent-media-site-repo"
$IMAGE_NAME = "agent-media-site"
$SERVICE_NAME = "agent-media-site"
$TAG = "latest"
$ARTIFACT_REPO = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME`:$TAG"

# 1. Enable Artifact Registry API
Write-Host "Enabling Artifact Registry API..." -ForegroundColor Cyan
gcloud services enable artifactregistry.googleapis.com

# 2. Create Artifact Registry Docker repo (if not exists)
Write-Host "Creating Artifact Registry Docker repository (if needed)..." -ForegroundColor Cyan
gcloud artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION --description="Docker repo for $IMAGE_NAME" 2>$null

# 3. Authenticate Docker for Artifact Registry
Write-Host "Configuring Docker authentication for Artifact Registry..." -ForegroundColor Cyan
gcloud auth configure-docker $REGION-docker.pkg.dev

# 4. Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t $ARTIFACT_REPO .

# 5. Push Docker image to Artifact Registry
Write-Host "Pushing Docker image to Artifact Registry..." -ForegroundColor Cyan
docker push $ARTIFACT_REPO

# 6. Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..." -ForegroundColor Cyan
gcloud run deploy $SERVICE_NAME --image $ARTIFACT_REPO --platform managed --region $REGION --allow-unauthenticated

Write-Host "Deployment complete! Check the Cloud Run service URL above." -ForegroundColor Green 