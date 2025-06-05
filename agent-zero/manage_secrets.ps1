# Sasha API Key Management Script (Manual Entry)
# Prompts for each API key, stores in GCP Secret Manager, logs all actions (not values)

$storageRoot = "D:\.aGITHUB REPO\Queen"
$logFile = Join-Path $storageRoot "logs\manage_secrets_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
Start-Transcript -Path $logFile

$PROJECT_ID = "mp135595"
$secrets = @(
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_STORAGE_BUCKET",
    "FIREBASE_MESSAGING_SENDER_ID",
    "FIREBASE_APP_ID",
    "FIREBASE_MEASUREMENT_ID",
    "GOOGLE_API_KEY",
    "OPENAI_API_KEY",
    "HUGGINGFACE_API_KEY",
    "ANTHROPIC_API_KEY",
    "MISTRAL_API_KEY",
    "GROQ_API_KEY",
    "TOGETHER_API_KEY",
    "REPLICATE_API_KEY",
    "STABILITY_API_KEY",
    "ELEVENLABS_API_KEY"
)

foreach ($secret in $secrets) {
    $value = Read-Host "Enter value for $secret"
    Write-Host "[INFO] Storing $secret in GCP Secret Manager..."
    gcloud secrets create $secret --replication-policy="automatic" --project $PROJECT_ID 2>$null
    $value | gcloud secrets versions add $secret --data-file=- --project $PROJECT_ID
    Write-Host "[LOG] $secret stored in GCP Secret Manager."
}

Write-Host "[INFO] All secrets managed. Log saved to $logFile."
Stop-Transcript 