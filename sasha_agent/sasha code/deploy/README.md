# Sasha GCP Deployment Guide

## Requirements
- Google Cloud CLI (`gcloud`)
- GCP Project with:
  - Cloud Build enabled
  - Cloud Run enabled
  - Google TTS API enabled
  - Firestore (Native mode)
- Service account with `roles/cloudbuild.builds.editor`, `roles/run.admin`, `roles/storage.admin`

## One-liner to Deploy
```bash
chmod +x deploy/deploy_to_gcp.sh
./deploy/deploy_to_gcp.sh
```
Make sure you have exported:
- `PROJECT_ID`
- `GEMINI_API_KEY`
- `GOOGLE_APPLICATION_CREDENTIALS`

You can add these in a `.env` or your shell profile.
