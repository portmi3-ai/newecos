# Update Sasha Modules to Use New Storage Path
$storageRoot = "D:\.aGITHUB REPO\Queen"
$logFile = Join-Path $storageRoot "logs\update_paths_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
Start-Transcript -Path $logFile

$files = Get-ChildItem -Path "D:\.aGITHUB REPO\Queen" -Recurse -Include *.py,*.ps1,*.yaml,*.yml,*.json
foreach ($file in $files) {
    (Get-Content $file.PSPath) -replace 'C:\\mport-media-group\\agent-zero', $storageRoot | Set-Content $file.PSPath
    (Get-Content $file.PSPath) -replace 'D:\.aGITHUB REPO\Queen', $storageRoot | Set-Content $file.PSPath
    (Get-Content $file.PSPath) -replace 'D:/\.aGITHUB REPO/Queen', $storageRoot | Set-Content $file.PSPath
    Write-Host "[INFO] Updated $($file.FullName)"
}
Write-Host "[INFO] All modules updated to use $storageRoot."
Stop-Transcript 
