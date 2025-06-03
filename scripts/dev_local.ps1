# RULE: Always ensure the target directory exists before creating or writing any new script file.
# This prevents errors due to missing paths.

# Check prerequisites
$checkScript = Join-Path $PSScriptRoot 'check_prereqs.ps1'
$check = & $checkScript
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Prerequisite check failed. Aborting dev environment launch." -ForegroundColor Red
    exit 1
}

$backendDir = Resolve-Path "$PSScriptRoot/../agentecos-main"
$frontendDir = Resolve-Path "$PSScriptRoot/../website"

Write-Host "[INFO] Starting backend in $backendDir..."
Push-Location $backendDir
npm install
$backendProc = Start-Process "npm" -ArgumentList "start" -NoNewWindow -PassThru
Pop-Location

Write-Host "[INFO] Starting frontend in $frontendDir..."
Push-Location $frontendDir
npm install
$frontendProc = Start-Process "npm" -ArgumentList "start" -NoNewWindow -PassThru
Pop-Location

Write-Host "[INFO] Both backend and frontend are running. Press Ctrl+C to stop."

# Wait for both processes to exit
try {
    $backendProc.WaitForExit()
    $frontendProc.WaitForExit()
} finally {
    if (!$backendProc.HasExited) { $backendProc.Kill() }
    if (!$frontendProc.HasExited) { $frontendProc.Kill() }
    Write-Host "[INFO] Both processes terminated."
} 