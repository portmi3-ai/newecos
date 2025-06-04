# Load environment variables from .env file
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value, 'Process')
        }
    }
} else {
    Write-Error ".env file not found. Please create it with your API keys."
    exit 1
}

# Activate virtual environment if it exists
if (Test-Path ".venv/Scripts/activate.ps1") {
    . .venv/Scripts/activate.ps1
}

# Run the application on port 8001
$env:PORT = "8001"
python main.py 