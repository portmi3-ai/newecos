# install-gitbash-wsl.ps1
# PowerShell script to install Git Bash and WSL on Windows

$ErrorActionPreference = 'Stop'

# Install Git Bash
Write-Host "Downloading Git for Windows (Git Bash)..." -ForegroundColor Cyan
$gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.45.1.windows.1/Git-2.45.1-64-bit.exe"
$gitInstaller = "$env:TEMP\Git-2.45.1-64-bit.exe"
Invoke-WebRequest -Uri $gitUrl -OutFile $gitInstaller

Write-Host "Installing Git Bash..." -ForegroundColor Cyan
Start-Process -FilePath $gitInstaller -ArgumentList "/VERYSILENT" -Wait

# Enable WSL
Write-Host "Enabling Windows Subsystem for Linux (WSL)..." -ForegroundColor Cyan
wsl --install

Write-Host "If prompted, please restart your computer to complete WSL installation." -ForegroundColor Yellow
Write-Host "After restart, you can open 'Git Bash' from the Start menu or run 'wsl' from any terminal." -ForegroundColor Green 