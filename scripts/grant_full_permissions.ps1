# Grant full permissions to the project directory for the current user
$ProjectPath = "$PSScriptRoot\.."

Write-Host "Granting full permissions to $ProjectPath ..."
icacls $ProjectPath /grant "$($env:USERNAME):(OI)(CI)F" /T

Write-Host "Enabling script execution policy for current user ..."
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

Write-Host "Done. For system-wide actions, run PowerShell as Administrator." 