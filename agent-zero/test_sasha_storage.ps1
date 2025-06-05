# Test Sasha Storage Path
$storageRoot = "D:\.aGITHUB REPO\Queen"
$logFile = Join-Path $storageRoot "logs\test_storage_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
Start-Transcript -Path $logFile

Write-Host "[TEST] Checking storage root: $storageRoot"
if (Test-Path $storageRoot) {
    Write-Host "[PASS] Storage root exists."
} else {
    Write-Host "[FAIL] Storage root does not exist."
}

$folders = @("logs", "cache", "secrets", "models")
foreach ($folder in $folders) {
    $fullPath = Join-Path $storageRoot $folder
    Write-Host "[TEST] Checking $fullPath"
    if (Test-Path $fullPath) {
        Write-Host "[PASS] $folder exists."
    } else {
        Write-Host "[FAIL] $folder missing."
    }
}

# Test write/read
$testFile = Join-Path $storageRoot "cache\sasha_test.txt"
"Sasha test $(Get-Date)" | Set-Content $testFile
if (Test-Path $testFile) {
    $content = Get-Content $testFile
    Write-Host "[PASS] Write/read test succeeded: $content"
    Remove-Item $testFile
} else {
    Write-Host "[FAIL] Write/read test failed."
}

Write-Host "[INFO] Storage path test complete."
Stop-Transcript 
