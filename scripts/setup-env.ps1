# Setup environment variables for Docker
$env:ENCRYPTION_KEY = "sasha_secure_encryption_key_$(Get-Random -Minimum 100000 -Maximum 999999)"
$env:VERTEX_AI_PROJECT_ID = "mport-media-group"
$env:GOOGLE_CLIENT_ID = "sasha_google_client_id_$(Get-Random -Minimum 100000 -Maximum 999999)"
$env:GOOGLE_CLIENT_SECRET = "sasha_google_client_secret_$(Get-Random -Minimum 100000 -Maximum 999999)"
$env:HUGGINGFACE_API_KEY = "sasha_huggingface_key_$(Get-Random -Minimum 100000 -Maximum 999999)"
$env:JWT_SECRET = "sasha_jwt_secret_$(Get-Random -Minimum 100000 -Maximum 999999)"

# Export variables to Docker environment
$envFile = @"
ENCRYPTION_KEY=$env:ENCRYPTION_KEY
VERTEX_AI_PROJECT_ID=$env:VERTEX_AI_PROJECT_ID
GOOGLE_CLIENT_ID=$env:GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$env:GOOGLE_CLIENT_SECRET
HUGGINGFACE_API_KEY=$env:HUGGINGFACE_API_KEY
JWT_SECRET=$env:JWT_SECRET
"@

$envFile | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "Environment variables have been set and exported to .env file" 