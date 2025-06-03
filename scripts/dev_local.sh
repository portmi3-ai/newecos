#!/bin/bash
# RULE: Always ensure the target directory exists before creating or writing any new script file.
# This prevents errors due to missing paths.
set -e

# Check prerequisites
SCRIPT_DIR="$(dirname "$0")"
if ! bash "$SCRIPT_DIR/check_prereqs.sh"; then
  echo "[ERROR] Prerequisite check failed. Aborting dev environment launch." >&2
  exit 1
fi

# Launch backend
cd agentecos-main
npm install
npm start &
BACK_PID=$!
cd ..

# Launch frontend
cd website
npm install
npm start &
FRONT_PID=$!
cd ..

# Wait for both to exit
trap "kill $BACK_PID $FRONT_PID" EXIT
wait $BACK_PID $FRONT_PID 