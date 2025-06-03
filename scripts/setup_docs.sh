#!/bin/bash
set -e

DOCS_DIR="$(dirname "$0")/../docs"
GUIDES_DIR="$DOCS_DIR/guides"
NEWS_FILE="$DOCS_DIR/news.md"
RESOURCES_FILE="$DOCS_DIR/resources.md"

mkdir -p "$GUIDES_DIR"

# 1. Download/refresh MCP server lists (just update links in resources.md for now)
echo "[INFO] MCP server directories are referenced in $RESOURCES_FILE. Manual curation recommended for summaries."

# 2. Download/refresh Hugging Face and Anthropic official MCP guides
# Example: Download FastAPI MCP guide as markdown
curl -sSL "https://huggingface.co/blog/lynn-mikami/fastapi-mcp-server" | pandoc -f html -t markdown -o "$GUIDES_DIR/fastapi-mcp-server.md" || echo "[WARN] Could not fetch FastAPI MCP guide."
# Add more guides as needed

# 3. Validate all links in docs/resources.md
if [ -f "$RESOURCES_FILE" ]; then
  echo "[INFO] Validating links in $RESOURCES_FILE..."
  grep -oP '(?<=\()https?://[^)]+' "$RESOURCES_FILE" | while read -r url; do
    if ! curl -s --head --fail "$url" > /dev/null; then
      echo "[ERROR] Broken link: $url"
    fi
  done
else
  echo "[WARN] $RESOURCES_FILE not found."
fi

# 4. Fetch latest news from Reddit r/MCP and MCPshare (optional, simple append)
echo "# MCP Community News (latest run: $(date))\n" > "$NEWS_FILE"
echo "## Reddit r/MCP (top 3 posts)" >> "$NEWS_FILE"
curl -s "https://www.reddit.com/r/mcp/top/.json?limit=3&t=week" -A "Mozilla/5.0" | jq -r '.data.children[] | "- [\(.data.title)](https://reddit.com\(.data.permalink))"' >> "$NEWS_FILE" || echo "[WARN] Could not fetch Reddit news."
echo -e "\n## MCPshare.com (link)\n- [MCPshare.com](https://mcpshare.com/)" >> "$NEWS_FILE"

# 5. Print summary
echo "[INFO] Documentation setup and validation complete. See $GUIDES_DIR, $NEWS_FILE, and $RESOURCES_FILE." 