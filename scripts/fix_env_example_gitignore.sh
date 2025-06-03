#!/bin/bash

# 1. Remove .env.example from project .gitignore if present
if [ -f .gitignore ]; then
    sed -i.bak '/\.env\.example/d' .gitignore
    echo "Removed .env.example from .gitignore (backup saved as .gitignore.bak)"
fi

# 2. Remove .env.example from global gitignore if present
GLOBAL_GITIGNORE=$(git config --get core.excludesfile)
if [ -n "$GLOBAL_GITIGNORE" ] && [ -f "$GLOBAL_GITIGNORE" ]; then
    sed -i.bak '/\.env\.example/d' "$GLOBAL_GITIGNORE"
    echo "Removed .env.example from global gitignore (backup saved as $GLOBAL_GITIGNORE.bak)"
fi

# 3. Add .env.example to Git tracking
git add .env.example
echo ".env.example is now tracked by git. Review with 'git status' and commit if desired." 