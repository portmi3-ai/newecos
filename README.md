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
