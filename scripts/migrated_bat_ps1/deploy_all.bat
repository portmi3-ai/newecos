@echo off
REM === Mport Media Group: Full Google Cloud Static Site Deployment Script ===

REM Check for gsutil
where gsutil >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Google Cloud SDK (gsutil) not found. Please install from https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Prompt for bucket name
set /p BUCKET=Enter a unique Google Cloud Storage bucket name (e.g., mport-media-website): 

REM Prompt for region (default to us-central1)
set /p REGION=Enter region for bucket [us-central1]: 
if "%REGION%"=="" set REGION=us-central1

REM Create the bucket
call gsutil mb -l %REGION% gs://%BUCKET%
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to create bucket. It may already exist or the name is not unique.
    pause
    exit /b 1
)

REM Sync files from ./public
cd public
call gsutil rsync -R . gs://%BUCKET%
cd ..

REM Set website configuration
call gsutil web set -m index.html -e 404.html gs://%BUCKET%

REM Make bucket public
call gsutil iam ch allUsers:objectViewer gs://%BUCKET%

REM Print live URL
set URL=http://%BUCKET%.storage.googleapis.com/
echo.
echo Deployment complete!
echo Your site should be live at: %URL%
pause 