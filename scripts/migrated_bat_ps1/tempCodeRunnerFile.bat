@echo off
REM === Deploy Static Site to Google Cloud Run (shining-camp-457118-m2) ===

set PROJECT_ID=shining-camp-457118-m2
set IMAGE=gcr.io/%PROJECT_ID%/mport-media-site:latest
set REGION=us-central1
set SERVICE=mport-media-site

REM Check for Docker
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker not found. Please install Docker Desktop.
    pause
    exit /b 1
)

REM Check for gcloud
where gcloud >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Google Cloud SDK (gcloud) not found. Please install from https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Authenticate Docker with Google Cloud
call gcloud auth configure-docker

REM Build Docker image

echo Building Docker image...
docker build -t %IMAGE% .
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker build failed.
    pause
    exit /b 1
)

REM Push Docker image to Google Container Registry

echo Pushing Docker image to Google Container Registry...
docker push %IMAGE%
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker push failed.
    pause
    exit /b 1
)

REM Deploy to Google Cloud Run

echo Deploying to Google Cloud Run...
gcloud run deploy %SERVICE% --image %IMAGE% --platform managed --region %REGION% --allow-unauthenticated
if %ERRORLEVEL% neq 0 (
    echo ERROR: Cloud Run deployment failed.
    pause
    exit /b 1
)

echo.
echo Deployment complete! Look above for your live HTTPS URL.
pause 