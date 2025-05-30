@echo off
set /p BUCKET=Enter your Google Cloud Storage bucket name (must already exist): 

echo Syncing files to bucket...
gsutil rsync -R . gs://%BUCKET%

echo Setting website configuration...
gsutil web set -m index.html -e 404.html gs://%BUCKET%

echo Making bucket public...
gsutil iam ch allUsers:objectViewer gs://%BUCKET%

echo Deployment complete!
echo Your site should be live at: http://%BUCKET%.storage.googleapis.com/
pause 