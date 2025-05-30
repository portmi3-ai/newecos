import os
import subprocess
import sys

PROJECT_ID = "mp135595"
REGION = "us-central1"
REPO_NAME = "agent-media-site-repo"
IMAGE_NAME = "agent-media-site"
TAG = "latest"
SERVICE_NAME = "agent-media-site"
ARTIFACT_REPO = f"{REGION}-docker.pkg.dev/{PROJECT_ID}/{REPO_NAME}/{IMAGE_NAME}:{TAG}"

def run(cmd, shell=False):
    print(f"\n>>> {cmd if isinstance(cmd, str) else ' '.join(cmd)}")
    result = subprocess.run(cmd, shell=shell, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr)
        sys.exit(f"Error running command: {cmd}")
    print(result.stdout)
    return result.stdout

def main():
    hf_token = os.environ.get("HF_TOKEN") or input("Enter your Hugging Face token: ")
    gemini_key = os.environ.get("GEMINI_API_KEY") or input("Enter your Gemini API key: ")

    # Authenticate Docker with Artifact Registry
    run(["gcloud", "auth", "configure-docker", f"{REGION}-docker.pkg.dev", "--quiet"])

    # Build Docker image
    run(["docker", "build", "-t", ARTIFACT_REPO, "."])

    # Push Docker image
    run(["docker", "push", ARTIFACT_REPO])

    # Deploy to Cloud Run
    deploy_cmd = [
        "gcloud", "run", "deploy", SERVICE_NAME,
        "--image", ARTIFACT_REPO,
        "--platform", "managed",
        "--region", REGION,
        "--allow-unauthenticated",
        f"--set-env-vars=HF_TOKEN={hf_token},GEMINI_API_KEY={gemini_key}"
    ]
    run(deploy_cmd)

    # Fetch and print service URL
    url = run([
        "gcloud", "run", "services", "describe", SERVICE_NAME,
        "--region", REGION,
        "--format=value(status.url)"
    ]).strip()
    print(f"\nDeployment complete! Your service is live at: {url}")

if __name__ == "__main__":
    main() 