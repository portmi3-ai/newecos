#!/bin/bash
set -e

# Check for .env file
ENV_PATH="$(dirname "$0")/../agentecos-main/.env"
if [ ! -f "$ENV_PATH" ]; then
  echo "[ERROR] .env file not found in agentecos-main/.env. Please create it from .env.example and add your Google OAuth credentials." >&2
  exit 1
fi

# Check for required variables in .env
missing_var=0
for var in GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET GOOGLE_CALLBACK_URL; do
  if ! grep -q "^$var=" "$ENV_PATH" || [ -z "$(grep "^$var=" "$ENV_PATH" | cut -d'=' -f2-)" ]; then
    echo "[ERROR] $var is missing or empty in agentecos-main/.env. Please set it for Google OAuth to work." >&2
    missing_var=1
  fi
done
if [ $missing_var -eq 1 ]; then exit 1; fi

# Check Node.js version
if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js is not installed or not in PATH." >&2
  exit 1
fi
NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "[ERROR] Node.js version 18 or higher is required. Found $(node -v)." >&2
  exit 1
fi

# Check npm version
if ! command -v npm >/dev/null 2>&1; then
  echo "[ERROR] npm is not installed or not in PATH." >&2
  exit 1
fi
NPM_MAJOR=$(npm -v | cut -d. -f1)
if [ "$NPM_MAJOR" -lt 8 ]; then
  echo "[ERROR] npm version 8 or higher is required. Found $(npm -v)." >&2
  exit 1
fi

# Check for key documentation files
DOCS_DIR="$(dirname "$0")/../docs"
GUIDES_DIR="$DOCS_DIR/guides"
REQUIRED_DOCS=(
  google-functions.md
  firebase-hosting.md
  fastapi-mcp-server.md
  gradio-mcp-guide.md
  huggingface-mcp-course.md
  security-best-practices.md
  cursor-best-practices.md
)
MISSING_DOCS=()
autofixed_docs=()
for doc in "${REQUIRED_DOCS[@]}"; do
  if [ ! -f "$GUIDES_DIR/$doc" ]; then
    MISSING_DOCS+=("$doc")
    if [ -t 0 ]; then
      read -p "Would you like to auto-generate a placeholder for $doc? (y/n): " yn
      if [[ "$yn" =~ ^[Yy]$ ]]; then
        echo "# $doc\n\nThis is a placeholder. Please update with real content." > "$GUIDES_DIR/$doc"
        autofixed_docs+=("$doc")
        continue
      fi
    fi
  fi
done
[ ! -f "$DOCS_DIR/cursor_best_practices.md" ] && MISSING_DOCS+=(cursor_best_practices.md)
[ ! -f "$(dirname "$0")/../README.md" ] && MISSING_DOCS+=(README.md)
if [ ${#MISSING_DOCS[@]} -gt 0 ]; then
  echo "[WARNING] The following documentation files are missing:" >&2
  for doc in "${MISSING_DOCS[@]}"; do
    echo " - $doc" >&2
  done
  echo "Refer to docs/resources.md for instructions on regenerating or updating documentation." >&2
fi

echo "[SUCCESS] All prerequisites are met. You are ready to launch the dev environment!"
echo "---"
echo "[INFO] Onboarding: README.md"
echo "[INFO] Best Practices: docs/cursor_best_practices.md"
echo "[INFO] Key Guides: docs/guides/ (see resources.md for full list)"
echo "[INFO] Resources Index: docs/resources.md"

if [ ${#autofixed_vars[@]} -gt 0 ]; then
  echo "[INFO] The following environment variables were auto-added to .env: ${autofixed_vars[*]}"
fi
if [ ${#autofixed_docs[@]} -gt 0 ]; then
  echo "[INFO] The following documentation placeholders were auto-generated: ${autofixed_docs[*]}"
fi 