# Mport Media Group – Static Website

## Local Testing

1. Install Node.js from [nodejs.org](https://nodejs.org/).
2. Install http-server globally:
   ```sh
   npm install -g http-server
   ```
3. Serve the site locally:
   ```sh
   cd public
   http-server -p 8000
   ```
4. Open [http://localhost:8000](http://localhost:8000) in your browser.

## Google Cloud Deployment

1. [Install Google Cloud SDK](https://cloud.google.com/sdk/docs/install) and initialize:
   ```sh
   gcloud init
   ```
2. Create a unique-named storage bucket:
   ```sh
   gsutil mb -l us-central1 gs://your-unique-bucket-name/
   ```
3. Deploy using the provided batch script or manually:
   ```sh
   gsutil rsync -R ./public gs://your-unique-bucket-name
   gsutil web set -m index.html -e 404.html gs://your-unique-bucket-name
   gsutil iam ch allUsers:objectViewer gs://your-unique-bucket-name
   ```
4. Your site will be live at:
   - http://your-unique-bucket-name.storage.googleapis.com/

## Custom Domain & HTTPS
- See [Google Cloud docs](https://cloud.google.com/storage/docs/hosting-static-website#mapping-custom-domains) for custom domain and HTTPS setup. 