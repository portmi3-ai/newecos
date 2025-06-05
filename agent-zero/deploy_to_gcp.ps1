# Sasha GCP Deployment Script
$storageRoot = "D:\.aGITHUB REPO\Queen"
$logFile = Join-Path $storageRoot "logs\deploy_to_gcp_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
Start-Transcript -Path $logFile

$PROJECT_ID = "mp135595"

Write-Host "[INFO] Deploying to Firebase Hosting (if applicable)..."
try {
    firebase deploy --project $PROJECT_ID
    Write-Host "[SUCCESS] Firebase deployment complete."
} catch {
    Write-Host "[WARN] Firebase deployment failed or not applicable."
}

Write-Host "[INFO] Deploying to App Engine (if applicable)..."
try {
    gcloud app deploy --project $PROJECT_ID
    Write-Host "[SUCCESS] App Engine deployment complete."
} catch {
    Write-Host "[WARN] App Engine deployment failed or not applicable."
}

Write-Host "[INFO] Deploying to Cloud Run (if applicable)..."
try {
    gcloud run deploy --project $PROJECT_ID
    Write-Host "[SUCCESS] Cloud Run deployment complete."
} catch {
    Write-Host "[WARN] Cloud Run deployment failed or not applicable."
}

Stop-Transcript
Write-Host "[INFO] Deployment script complete. Log saved to $logFile." 