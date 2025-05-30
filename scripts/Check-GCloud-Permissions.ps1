# Check-GCloud-Permissions.ps1
# PowerShell script to check gcloud authentication and IAM roles for diagnosing permission issues

$ErrorActionPreference = 'Stop'

Write-Host "Checking current gcloud authenticated account..." -ForegroundColor Cyan
gcloud auth list

Write-Host "\nChecking active gcloud project..." -ForegroundColor Cyan
gcloud config get-value project

Write-Host "\nGetting current user's email..." -ForegroundColor Cyan
$userEmail = (gcloud auth list --filter=status:ACTIVE --format="value(account)")
Write-Host "Active account: $userEmail" -ForegroundColor Yellow

Write-Host "\nListing IAM roles for the current user on the active project..." -ForegroundColor Cyan
$project = (gcloud config get-value project --quiet)
gcloud projects get-iam-policy $project --flatten="bindings[].members" --format='table(bindings.role)' --filter="bindings.members:$userEmail"

Write-Host "\nIf you do not see roles like Owner, Editor, Artifact Registry Admin, or Cloud Run Admin, you may need to request additional permissions from your GCP admin." -ForegroundColor Yellow 