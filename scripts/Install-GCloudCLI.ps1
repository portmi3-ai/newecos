# Install-GCloudCLI.ps1
# PowerShell script to download and install Google Cloud CLI (gcloud) on Windows

$ErrorActionPreference = 'Stop'

# Define the download URL and installer path
$gcloudUrl = "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe"
$installerPath = "$env:TEMP\GoogleCloudSDKInstaller.exe"

Write-Host "Downloading Google Cloud CLI installer..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $gcloudUrl -OutFile $installerPath

Write-Host "Running the Google Cloud CLI installer..." -ForegroundColor Cyan
Start-Process -FilePath $installerPath -Wait

Write-Host "Google Cloud CLI installation complete." -ForegroundColor Green
Write-Host "To initialize gcloud, open a new Command Prompt or PowerShell window and run: gcloud init" -ForegroundColor Yellow 