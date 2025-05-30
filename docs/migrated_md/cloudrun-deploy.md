# Deploying Your Static Site to Google Cloud Run

## Prerequisites
- Google Cloud SDK installed and initialized (`gcloud init`)
- Docker installed
- Billing enabled on your Google Cloud project
- You are authenticated with `gcloud auth login`

## 1. Build the Docker Image
```
docker build -t gcr.io/PROJECT-ID/mport-media-site:latest .
```
Replace `PROJECT-ID` with your actual Google Cloud project ID.

## 2. Push the Image to Google Container Registry
```
gcloud auth configure-docker
docker push gcr.io/PROJECT-ID/mport-media-site:latest
```

## 3. Deploy to Google Cloud Run
```
gcloud run deploy mport-media-site \
  --image gcr.io/PROJECT-ID/mport-media-site:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```
- Choose a region close to you if desired.
- The `--allow-unauthenticated` flag makes your site public.

## 4. Access Your Live Site
- After deployment, the command line will display your live HTTPS URL.

## 5. (Optional) Custom Domain & HTTPS
- Follow the [Cloud Run custom domain guide](https://cloud.google.com/run/docs/mapping-custom-domains) to map your own domain. 