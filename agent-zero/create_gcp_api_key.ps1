# Sasha GCP API Key Creation Script
$storageRoot = "D:\.aGITHUB REPO\Queen"
$logFile = Join-Path $storageRoot "logs\gcp_api_key_creation_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
Start-Transcript -Path $logFile

$PROJECT_ID = "mp135595"

Write-Host "[INFO] Creating new GCP API key..."
$key = gcloud alpha services api-keys create --display-name="Sasha Auto Key $(Get-Date -Format 'yyyyMMdd_HHmmss')" --project=$PROJECT_ID --format="value(keyString)"
Write-Host "[INFO] New GCP API Key created."

gcloud secrets create GOOGLE_API_KEY --replication-policy="automatic" --project $PROJECT_ID 2>$null
$key | gcloud secrets versions add GOOGLE_API_KEY --data-file=- --project $PROJECT_ID
Write-Host "[LOG] GOOGLE_API_KEY stored in GCP Secret Manager."

Stop-Transcript
Write-Host "[INFO] GCP API key creation complete. Log saved to $logFile." 