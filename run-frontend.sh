#!/bin/bash
# Helper script to start the frontend dev server from anywhere
set -e
cd "$(dirname "$0")/website"
echo "[Sasha] Running in: $(pwd)"
npm run dev 