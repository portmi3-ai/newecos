# Remove .env.example from project .gitignore if present
$gitignore = Join-Path (Join-Path $PSScriptRoot '..') '.gitignore'
if (Test-Path $gitignore) {
    $content = Get-Content $gitignore
    $newContent = $content | Where-Object { $_ -notmatch '\.env\.example' }
    $backup = "$gitignore.bak"
    Copy-Item $gitignore $backup -Force
    $newContent | Set-Content $gitignore
    Write-Host "Removed .env.example from .gitignore (backup saved as .gitignore.bak)"
}

# Remove .env.example from global gitignore if present
$globalGitignore = git config --get core.excludesfile
if ($globalGitignore -and (Test-Path $globalGitignore)) {
    $content = Get-Content $globalGitignore
    $newContent = $content | Where-Object { $_ -notmatch '\.env\.example' }
    $backup = "$globalGitignore.bak"
    Copy-Item $globalGitignore $backup -Force
    $newContent | Set-Content $globalGitignore
    Write-Host "Removed .env.example from global gitignore (backup saved as $globalGitignore.bak)"
}

# Add .env.example to Git tracking
$envExample = Join-Path (Join-Path (Join-Path $PSScriptRoot '..') 'agentecos-main') '.env.example'
if (Test-Path $envExample) {
    git add $envExample
    Write-Host ".env.example is now tracked by git. Review with 'git status' and commit if desired."
} else {
    Write-Host ".env.example not found in agentecos-main. Please create it first."
} 