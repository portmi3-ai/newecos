# MCP Server (Master Control Program)

A high-performance, scalable server designed to manage and orchestrate thousands of AI agents concurrently. Built with FastAPI, Redis, and PostgreSQL for optimal performance and reliability.

## Features

- **Scalable Architecture**: Handles thousands of concurrent AI agents
- **Real-time Communication**: WebSocket support for live agent updates
- **Load Balancing**: Intelligent distribution of agent workloads
- **Fault Tolerance**: Automatic recovery and failover mechanisms
- **Monitoring**: Prometheus metrics integration for system health
- **Security**: JWT authentication and role-based access control
- **API Documentation**: Auto-generated OpenAPI documentation
- **Database Management**: PostgreSQL with async support
- **Caching**: Redis-based caching for improved performance
- **Task Queue**: Celery integration for background tasks
- **Logging**: Structured logging with correlation IDs

## System Requirements

- Python 3.9+
- PostgreSQL 13+
- Redis 6+
- Docker (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/mport-media-group/mcp-server.git
cd mcp-server
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy the example environment file:
```bash
cp .env.example .env
```

5. Configure your environment variables in `.env`

## Running the Server

### Development Mode
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker Deployment
```bash
docker-compose up -d
```

## Architecture

The MCP Server is built with a microservices architecture:

1. **API Layer**: FastAPI-based REST and WebSocket endpoints
2. **Agent Manager**: Handles agent lifecycle and coordination
3. **Task Scheduler**: Distributes and monitors agent tasks
4. **State Manager**: Maintains system state and agent status
5. **Monitoring**: Tracks system metrics and performance
6. **Security Layer**: Handles authentication and authorization

## API Documentation

Once running, access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Agent Management

Agents can be:
- Registered with unique identifiers
- Assigned tasks based on capabilities
- Monitored for health and performance
- Scaled up/down based on demand
- Isolated for security and resource management

## Monitoring and Metrics

The server exposes Prometheus metrics at `/metrics` including:
- Active agent count
- Task completion rates
- System resource usage
- Error rates
- Response times

## Security

- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation
- Secure WebSocket connections
- Encrypted communication

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# AgentEcos MCP SSE Server

This directory contains both Python and Node.js templates for a global MCP (Model Context Protocol) SSE server for AgentEcos. Use this to orchestrate and scale agents and tools across local and remote environments.

## Features
- SSE (Server-Sent Events) transport for real-time orchestration
- Example tools: add, subtract, deploy_agent, list_agents
- Modular and extensible for new tools/agents
- Python (FastMCP) and Node.js (@modelcontextprotocol/sdk) implementations

---

## Python MCP Server (FastMCP)

### Setup
1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install mcp mcp[cli] python-dotenv
   ```
3. Copy `.env.example` to `.env` and fill in your secrets.
4. Start the server:
   ```bash
   python server.py
   ```
5. The server will listen on `http://0.0.0.0:39300` (SSE transport).

---

## Node.js MCP Server (@modelcontextprotocol/sdk)

### Setup
1. Initialize Node.js project:
   ```bash
   npm init -y
   npm install @modelcontextprotocol/sdk dotenv
   ```
2. Copy `.env.example` to `.env` and fill in your secrets.
3. Start the server:
   ```bash
   node index.js
   ```
4. The server will listen on `http://localhost:39300/model_context_protocol/2024-11-05/sse` (SSE transport).

---

## Scaling & Cloud Deployment
- Both servers can be containerized with Docker for deployment to GCP, AWS, or other cloud providers.
- Expose port 39300 and set environment variables via secrets manager or CI/CD.
- For high availability, use managed services or orchestration (e.g., Cloud Run, ECS, Kubernetes).

---

## Troubleshooting
- Ensure all dependencies are installed and .env is configured.
- Check port 39300 is open and not in use.
- Review logs for errors on startup.
- For more, see official MCP and Cursor docs.

---

## Extending
- Add new tools by defining new @tool (Python) or server.tool (Node.js) functions.
- Integrate with agent deployment, monitoring, and analytics as AgentEcos grows. 