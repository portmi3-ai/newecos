# add-git-docker-to-path.ps1
# PowerShell script to add Git and Docker binary directories to the user PATH

$ErrorActionPreference = 'Stop'

# Define paths
$gitPath = "C:\Program Files\Git\bin"
$dockerPath = "C:\Program Files\Docker\Docker\resources\bin"

# Get current user PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")

# Add Git path if not present
if ($currentPath -notlike "*$gitPath*") {
    $currentPath += ";$gitPath"
    Write-Host "Added Git to PATH: $gitPath" -ForegroundColor Green
} else {
    Write-Host "Git path already in PATH." -ForegroundColor Yellow
}

# Add Docker path if not present
if ($currentPath -notlike "*$dockerPath*") {
    $currentPath += ";$dockerPath"
    Write-Host "Added Docker to PATH: $dockerPath" -ForegroundColor Green
} else {
    Write-Host "Docker path already in PATH." -ForegroundColor Yellow
}

# Update user PATH
[Environment]::SetEnvironmentVariable("PATH", $currentPath, "User")
Write-Host "PATH updated. Please restart your terminal for changes to take effect." -ForegroundColor Cyan 