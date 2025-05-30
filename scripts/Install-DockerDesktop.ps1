# Install-DockerDesktop.ps1
# PowerShell script to download and launch Docker Desktop installer for Windows

$ErrorActionPreference = 'Stop'

# Define the download URL and installer path
$dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
$installerPath = "$env:TEMP\DockerDesktopInstaller.exe"

Write-Host "Downloading Docker Desktop installer..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $dockerUrl -OutFile $installerPath

Write-Host "Launching Docker Desktop installer..." -ForegroundColor Cyan
Start-Process -FilePath $installerPath

Write-Host "Docker Desktop installer launched. Please follow the on-screen instructions to complete the installation." -ForegroundColor Yellow
Write-Host "After installation, restart your computer if prompted and ensure Docker Desktop is running (whale icon in system tray)." -ForegroundColor Yellow
Write-Host "Verify installation by running: docker --version in a new terminal window." -ForegroundColor Green 