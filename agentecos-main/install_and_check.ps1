# install_and_check.ps1

# Move to the project directory
Set-Location "D:\.aGITHUB REPO\agentecos-main"

Write-Host "Installing Node.js production dependencies..."
npm install

Write-Host "Installing recommended dev dependencies (jest, eslint)..."
npm install --save-dev jest eslint

# Check for Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Docker not found. Please install Docker Desktop: https://www.docker.com/products/docker-desktop/"
} else {
    Write-Host "[OK] Docker is installed."
}

# Check for gcloud
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "[!] gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install"
} else {
    Write-Host "[OK] gcloud CLI is installed."
}

# Check for Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Git not found. Please install: https://git-scm.com/downloads"
} else {
    Write-Host "[OK] Git is installed."
}

Write-Host "All checks complete. If any tools are missing, please install them and re-run this script." 