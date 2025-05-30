import os
from mcp import MCPServer, tool
from dotenv import load_dotenv

load_dotenv()

server = MCPServer(name="AgentEcos MCP SSE Server")

@tool()
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b

@tool()
def subtract(a: int, b: int) -> int:
    """Subtract b from a."""
    return a - b

@tool()
def deploy_agent(agent_name: str) -> str:
    """Mock deploy a new agent by name."""
    # In production, trigger actual deployment logic here
    return f"Agent '{agent_name}' deployed successfully."

@tool()
def list_agents() -> list:
    """List all deployed agents (mocked)."""
    return ["real_estate_agent", "healthcare_agent", "fintech_agent"]

if __name__ == "__main__":
    # Run the MCP server with SSE transport
    server.run(transport="sse", host="0.0.0.0", port=39300) 