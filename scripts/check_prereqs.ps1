# Check for .env file
$envPath = Join-Path $PSScriptRoot '..' 'agentecos-main' '.env'
if (-Not (Test-Path $envPath)) {
    Write-Host "[ERROR] .env file not found in agentecos-main/.env. Please create it from .env.example and add your Google OAuth credentials." -ForegroundColor Red
    exit 1
}

# Check for required variables in .env
$envContent = Get-Content $envPath | Where-Object { $_ -notmatch '^#' -and $_ -match '=' }
$vars = @{}
foreach ($line in $envContent) {
    $parts = $line -split '=', 2
    if ($parts.Length -eq 2) { $vars[$parts[0].Trim()] = $parts[1].Trim() }
}

$required = @('GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL')
foreach ($key in $required) {
    if (-Not $vars.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($vars[$key])) {
        Write-Host "[ERROR] $key is missing or empty in agentecos-main/.env. Please set it for Google OAuth to work." -ForegroundColor Red
        exit 1
    }
}

# Check Node.js version
$nodeVersion = node -v 2>$null
if (-Not $nodeVersion) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH." -ForegroundColor Red
    exit 1
}
$nodeMajor = [int]($nodeVersion.TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 18) {
    Write-Host "[ERROR] Node.js version 18 or higher is required. Found $nodeVersion." -ForegroundColor Red
    exit 1
}

# Check npm version
$npmVersion = npm -v 2>$null
if (-Not $npmVersion) {
    Write-Host "[ERROR] npm is not installed or not in PATH." -ForegroundColor Red
    exit 1
}
$npmMajor = [int]($npmVersion.Split('.')[0])
if ($npmMajor -lt 8) {
    Write-Host "[ERROR] npm version 8 or higher is required. Found $npmVersion." -ForegroundColor Red
    exit 1
}

# Check for key documentation files
$docsDir = Join-Path $PSScriptRoot '..' 'docs'
$guidesDir = Join-Path $docsDir 'guides'
$requiredDocs = @(
    'google-functions.md',
    'firebase-hosting.md',
    'fastapi-mcp-server.md',
    'gradio-mcp-guide.md',
    'huggingface-mcp-course.md',
    'security-best-practices.md',
    'cursor-best-practices.md'
)
$missingDocs = @()
foreach ($doc in $requiredDocs) {
    $docPath = Join-Path $guidesDir $doc
    if (-Not (Test-Path $docPath)) {
        $missingDocs += $doc
    }
}
if (-Not (Test-Path (Join-Path $docsDir 'cursor_best_practices.md'))) {
    $missingDocs += 'cursor_best_practices.md'
}
if (-Not (Test-Path (Join-Path $PSScriptRoot '..' 'README.md'))) {
    $missingDocs += 'README.md'
}
if ($missingDocs.Count -gt 0) {
    Write-Host "[WARNING] The following documentation files are missing:" -ForegroundColor Yellow
    $missingDocs | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
    Write-Host "Refer to docs/resources.md for instructions on regenerating or updating documentation." -ForegroundColor Yellow
}

Write-Host "[SUCCESS] All prerequisites are met. You are ready to launch the dev environment!" -ForegroundColor Green
Write-Host "---" -ForegroundColor Green
Write-Host "[INFO] Onboarding: README.md" -ForegroundColor Green
Write-Host "[INFO] Best Practices: docs/cursor_best_practices.md" -ForegroundColor Green
Write-Host "[INFO] Key Guides: docs/guides/ (see resources.md for full list)" -ForegroundColor Green
Write-Host "[INFO] Resources Index: docs/resources.md" -ForegroundColor Green 