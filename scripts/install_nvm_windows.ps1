# install_nvm_windows.ps1
# PowerShell script to download and install nvm-windows (Node Version Manager for Windows)
# Usage: Run as administrator for best results

$ErrorActionPreference = 'Stop'

# Define variables
$nvmVersion = '1.1.12'
$nvmInstallerUrl = "https://github.com/coreybutler/nvm-windows/releases/download/$nvmVersion/nvm-setup.exe"
$nvmInstallerPath = "$env:TEMP\nvm-setup.exe"

# Check if nvm is already installed
$nvmCheck = Get-Command nvm -ErrorAction SilentlyContinue
if ($nvmCheck) {
    Write-Host "nvm is already installed at $($nvmCheck.Source). Skipping installation."
    nvm version
    exit 0
}

# Download the installer
Write-Host "Downloading nvm-windows installer from $nvmInstallerUrl ..."
Invoke-WebRequest -Uri $nvmInstallerUrl -OutFile $nvmInstallerPath

# Run the installer
Write-Host "Running nvm-windows installer... (You may be prompted for admin rights)"
Start-Process -FilePath $nvmInstallerPath -Wait

# Remove installer
Remove-Item $nvmInstallerPath -Force

# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')

# Verify installation
$nvmCheck = Get-Command nvm -ErrorAction SilentlyContinue
if ($nvmCheck) {
    Write-Host "nvm installed successfully! Version:" -ForegroundColor Green
    nvm version
} else {
    Write-Host "nvm installation failed. Please restart your terminal and try again." -ForegroundColor Red
    exit 1
}