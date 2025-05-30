# deploy.ps1

# Set variables
$DockerImage = "us-central1-docker.pkg.dev/mp135595/agent-media-site-repo/agent-media-site:latest"
$GCPRegion = "us-central1"
$ServiceName = "agent-media-site"
$ServerJs = Join-Path $PWD "backend\server.js"

# Patch server.js for Cloud Run PORT if it exists
if (Test-Path $ServerJs) {
    Write-Host "Ensuring server.js uses environment PORT..."
    $serverJsContent = Get-Content $ServerJs -Raw
    $pattern = 'app\.listen\(.*\);'
    $replacement = "const port = process.env.PORT || 8080;`napp.listen(port, () => { console.log(`Server running on port ${port}`); });"
    if ($serverJsContent -match $pattern) {
        $serverJsContent = [System.Text.RegularExpressions.Regex]::Replace($serverJsContent, $pattern, $replacement)
        Set-Content $ServerJs $serverJsContent
        Write-Host "server.js updated."
    } else {
        Write-Host "No app.listen() found or already updated."
    }
} else {
    Write-Host "backend/server.js not found, skipping port patch."
}

# Build Docker image
Write-Host "Building Docker image..."
docker build -t $DockerImage .

# Push Docker image
Write-Host "Pushing Docker image..."
docker push $DockerImage

# Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..."
gcloud run deploy $ServiceName --image=$DockerImage --region=$GCPRegion --platform=managed --allow-unauthenticated

Write-Host "Deployment complete."