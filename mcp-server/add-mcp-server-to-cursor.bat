@echo off
REM Add AgentEcos MCP SSE Server to Cursor MCP config
set CONFIG=%USERPROFILE%\.cursor\mcp.json
set SERVER_URL=http://localhost:39300/model_context_protocol/2024-11-05/sse

REM Requires jq for Windows: https://stedolan.github.io/jq/download/
if not exist "%CONFIG%" (
  echo MCP config not found at %CONFIG%.
  exit /b 1
)

jq ".servers += [{\"name\": \"AgentEcos MCP SSE Server\", \"type\": \"sse\", \"url\": \"%SERVER_URL%\", \"env\": {\"HF_TOKEN\": "%HF_TOKEN%", \"GEMINI_API_KEY\": "%GEMINI_API_KEY%"}}]" "%CONFIG%" > "%CONFIG%.tmp" && move /Y "%CONFIG%.tmp" "%CONFIG%"
echo Done.
echo You may need to restart Cursor for changes to take effect. 