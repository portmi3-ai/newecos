# PowerShell script to open essential documentation URLs for GCP, Hugging Face, Firebase, and DevOps

$urls = @(
    # Google Cloud Platform
    "https://cloud.google.com/docs",
    "https://cloud.google.com/run/docs",
    "https://cloud.google.com/functions/docs",
    "https://cloud.google.com/storage/docs",
    "https://cloud.google.com/build/docs",
    "https://cloud.google.com/artifact-registry/docs",
    "https://cloud.google.com/iam/docs",
    "https://cloud.google.com/vpc/docs",
    "https://cloud.google.com/sql/docs",
    "https://cloud.google.com/firestore/docs",
    "https://cloud.google.com/bigquery/docs",
    "https://cloud.google.com/deployment-manager/docs",
    "https://cloud.google.com/monitoring/docs",
    "https://cloud.google.com/logging/docs",
    "https://cloud.google.com/products/calculator",

    # AI & ML
    "https://huggingface.co/docs/api-inference/index",
    "https://huggingface.co/models",
    "https://cloud.google.com/vertex-ai/docs",

    # DevOps & CI/CD
    "https://docs.github.com/en/actions",
    "https://cloud.google.com/deploy/docs",

    # Firebase
    "https://firebase.google.com/docs",
    "https://firebase.google.com/docs/auth",
    "https://firebase.google.com/docs/functions",
    "https://firebase.google.com/docs/hosting",

    # Best Practices & Templates
    "https://github.com/GoogleCloudPlatform",
    "https://github.com/huggingface",
    "https://github.com/GoogleCloudPlatform/cloud-deploy-samples",
    "https://github.com/GoogleCloudPlatform/deploymentmanager-samples",
    "https://docs.cursor.so/"
)

foreach ($url in $urls) {
    Start-Process $url
    Start-Sleep -Milliseconds 500
} 