#!/bin/bash
# Helper script to start the backend server from anywhere
set -e
cd "$(dirname "$0")/backend"
echo "[Sasha] Running in: $(pwd)"
npm run start 