import os
import requests

API_URL = os.environ.get("DOCS_API_URL", "http://localhost:5000/api/docs/upload")
DOCS_DIR = os.environ.get("DOCS_DIR", "docs")

success, failed = [], []

for root, _, files in os.walk(DOCS_DIR):
    for file in files:
        if file.endswith(".md"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            data = {"filename": file, "path": path, "content": content}
            try:
                resp = requests.post(API_URL, json=data)
                if resp.status_code == 200:
                    success.append(path)
                else:
                    print(f"Failed to upload {path}: {resp.status_code} {resp.text}")
                    failed.append(path)
            except Exception as e:
                print(f"Error uploading {path}: {e}")
                failed.append(path)

print(f"\nUploaded: {len(success)} files")
if failed:
    print(f"Failed: {len(failed)} files: {failed}") 