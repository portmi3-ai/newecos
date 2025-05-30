#!/bin/bash
# Add AgentEcos MCP SSE Server to Cursor MCP config
echo "Adding MCP server to Cursor MCP config..."
CONFIG="$HOME/.cursor/mcp.json"
SERVER_URL="http://localhost:39300/model_context_protocol/2024-11-05/sse"

jq '.servers += [{"name": "AgentEcos MCP SSE Server", "type": "sse", "url": "'$SERVER_URL'", "env": {"HF_TOKEN": "$HF_TOKEN", "GEMINI_API_KEY": "$GEMINI_API_KEY"}}]' "$CONFIG" > "$CONFIG.tmp" && mv "$CONFIG.tmp" "$CONFIG"
echo "Done."
echo "You may need to restart Cursor for changes to take effect." 