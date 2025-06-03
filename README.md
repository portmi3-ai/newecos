# Meta DevOps Agent Platform for Mport Media Group

## Overview
The Meta DevOps Agent platform is a cloud-native, AI-driven system designed to automate the creation, deployment, and management of industry-specific AI agents on Google Cloud Platform (GCP). Leveraging Hugging Face, Gemini, and Stripe APIs, the platform enables single-command agent creation and deployment, supporting industries such as real estate, fintech, healthcare, senior living, and telecom.

## Business Goals
- **Automate DevOps workflows** for rapid agent deployment and management.
- **Enable industry-specific AI agents** with minimal manual intervention.
- **Ensure security, scalability, and extensibility** for production environments.
- **Leverage best-in-class APIs and cloud services** (Hugging Face, Gemini, Stripe, GCP).

## Quickstart

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd mport-media-group
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or for backend/frontend separately
   cd agentecos-main && npm install
   cd ../../website && npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and add your API keys (Hugging Face, Google, Stripe, etc.)
   - For cloud deployment, set secrets in GCP or Firebase console
4. **Run locally:**
   - Backend: `npm start` in `agentecos-main`
   - Frontend: `npm start` in `website`

## Environment Setup

Before running the development environment, you must set up your environment variables:

1. **Copy the example file:**
   ```sh
   cp agentecos-main/.env.example agentecos-main/.env
   ```
2. **Edit `agentecos-main/.env` and fill in real values** for all required keys (Google OAuth, Auth0, GCP, etc.).
   - The `.env.example` file documents all required variables and their purpose.
   - Never commit your real `.env` file to version control.

**If you need more details, see the comments in `.env.example`.**

## Automated Documentation & Best Practices

To ensure you always have the latest MCP server directories, integration guides, and best practices:

- **Run the setup script:**
  - On Linux/Mac: `bash scripts/setup_docs.sh`
  - On Windows: `./scripts/setup_docs.ps1` (PowerShell)
- This will:
  - Download and update all key documentation and guides in `docs/guides/`
  - Validate all links in `docs/resources.md`
  - Fetch the latest community news into `docs/news.md`
  - Print a summary of any issues or broken links
- **docs/resources.md** is your always-up-to-date index of the best MCP directories, official repos, and integration best practices.
- **docs/guides/** contains the latest downloaded guides (e.g., FastAPI MCP, Gradio MCP, etc.)
- **docs/news.md** contains the latest top news from the MCP community (Reddit, MCPshare)
- **CI/CD:** A GitHub Action runs this validation automatically on every push and daily, so the docs stay fresh for all contributors.

**All new developers should run the setup script after cloning the repo to ensure they have the latest documentation and best practices.**

## Deployment

- **One-command deploy:**
  ```sh
  ./deploy.sh
  ```
- **CI/CD:**
  - Push to `main` branch triggers GitHub Actions workflow for build and deploy
- **Firebase Hosting/Functions:**
  - See `FIREBASE_AND_BUILD_DOCS.md` and `/docs` for details

## Extensibility

- Add new agent types by creating templates and updating workflows
- Integrate new APIs by updating service modules

## Documentation

- All documentation is in `/docs`.
- See [project_overview.md](docs/project_overview.md) for business goals and vision.

## Testing
- **Unit and integration tests:**
  - Run `npm test` for backend tests.
  - See `/tests/` for test cases and mock data.

## References
- [Hugging Face API Docs](https://huggingface.co/docs/api-inference/index)
- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Cursor AI Prompting Best Practices](docs/cursor_best_practices.md)

---
For further details, see the `/docs/` directory and in-code comments. For issues or feature requests, please open a GitHub issue or contact the Mport Media Group DevOps team.
