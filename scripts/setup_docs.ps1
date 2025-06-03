$ErrorActionPreference = 'Continue'
$docsDir = Join-Path $PSScriptRoot '..' 'docs'
$guidesDir = Join-Path $docsDir 'guides'
$newsFile = Join-Path $docsDir 'news.md'
$resourcesFile = Join-Path $docsDir 'resources.md'

if (!(Test-Path $guidesDir)) { New-Item -ItemType Directory -Path $guidesDir | Out-Null }

# 1. MCP server directories are referenced in resources.md (manual curation recommended)
Write-Host "[INFO] MCP server directories are referenced in $resourcesFile. Manual curation recommended for summaries."

# 2. Download/refresh Hugging Face and Anthropic official MCP guides
# Example: Download FastAPI MCP guide as markdown
try {
    $url = 'https://huggingface.co/blog/lynn-mikami/fastapi-mcp-server'
    $html = Invoke-WebRequest -Uri $url -UseBasicParsing
    $mdPath = Join-Path $guidesDir 'fastapi-mcp-server.md'
    $html.Content | pandoc.exe -f html -t markdown -o $mdPath
} catch { Write-Warning "Could not fetch FastAPI MCP guide." }
# Add more guides as needed

# 3. Validate all links in docs/resources.md
if (Test-Path $resourcesFile) {
    Write-Host "[INFO] Validating links in $resourcesFile..."
    $urls = Select-String -Path $resourcesFile -Pattern '(?<=\()https?://[^)]+' -AllMatches | ForEach-Object { $_.Matches } | ForEach-Object { $_.Value }
    foreach ($url in $urls) {
        try {
            $resp = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10
            if ($resp.StatusCode -ne 200) { Write-Host "[ERROR] Broken link: $url" }
        } catch { Write-Host "[ERROR] Broken link: $url" }
    }
} else {
    Write-Warning "$resourcesFile not found."
}

# 4. Fetch latest news from Reddit r/MCP and MCPshare (optional, simple append)
"# MCP Community News (latest run: $(Get-Date))`n" | Out-File $newsFile
"## Reddit r/MCP (top 3 posts)" | Out-File $newsFile -Append
try {
    $reddit = Invoke-WebRequest -Uri 'https://www.reddit.com/r/mcp/top/.json?limit=3&t=week' -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
    $json = $reddit.Content | ConvertFrom-Json
    foreach ($post in $json.data.children) {
        $title = $post.data.title
        $permalink = $post.data.permalink
        "- [$title](https://reddit.com$permalink)" | Out-File $newsFile -Append
    }
} catch { Write-Warning "Could not fetch Reddit news." }
"`n## MCPshare.com (link)`n- [MCPshare.com](https://mcpshare.com/)" | Out-File $newsFile -Append

# 5. Print summary
Write-Host "[INFO] Documentation setup and validation complete. See $guidesDir, $newsFile, and $resourcesFile." 