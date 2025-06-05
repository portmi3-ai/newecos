# Sasha Storage Migration Script
# This script sets up the storage directories for Sasha and migrates any existing data.

$storageRoot = "D:\.aGITHUB REPO\Queen"
$folders = @("logs", "cache", "secrets", "models")
$logFile = Join-Path $storageRoot "logs\migration_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Ensure root directory exists
if (-not (Test-Path $storageRoot)) {
    New-Item -Path $storageRoot -ItemType Directory | Out-Null
}

# Create subfolders
foreach ($folder in $folders) {
    $fullPath = Join-Path $storageRoot $folder
    if (-not (Test-Path $fullPath)) {
        New-Item -Path $fullPath -ItemType Directory | Out-Null
    }
}

# Start logging
Start-Transcript -Path $logFile
Write-Host "[INFO] Migration started at $(Get-Date)"

# Define previous locations (customize as needed)
$previousLocations = @(
    "D:\.aGITHUB REPO\Queen\logs",
    "D:\.aGITHUB REPO\Queen\cache",
    "D:\.aGITHUB REPO\Queen\secrets",
    "D:\.aGITHUB REPO\Queen\models"
)

foreach ($oldPath in $previousLocations) {
    if (Test-Path $oldPath) {
        $folderName = Split-Path $oldPath -Leaf
        $destPath = Join-Path $storageRoot $folderName
        Write-Host "[INFO] Migrating $oldPath to $destPath"
        Copy-Item -Path $oldPath\* -Destination $destPath -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "[WARN] $oldPath does not exist, skipping."
    }
}

Write-Host "[INFO] Migration complete. All data is now under $storageRoot."
Stop-Transcript 
