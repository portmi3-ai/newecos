# move_backend_project.ps1

# Define source and destination
$source = "D:\.aGITHUB REPO\agentecos-main"
$destination = "C:\mport-media-group\agentecos-main"

# Create destination directory if it doesn't exist
if (-not (Test-Path "C:\mport-media-group")) {
    New-Item -ItemType Directory -Path "C:\mport-media-group"
}

# Move the directory
Move-Item -Path $source -Destination $destination -Force

# Change to the new directory
Set-Location $destination

# Reinstall dependencies
npm install

# Run tests
npm test

Write-Host "Project moved, dependencies installed, and tests run in $destination." 