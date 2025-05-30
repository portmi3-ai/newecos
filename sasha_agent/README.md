# Sasha Agent (Meta Agent Runner)

A secure, extensible Python agent that can run code, interact with Discord, GCP, Google APIs, and Hugging Face on your behalf.

## Features
- Discord bot integration (send/receive commands, notifications)
- GCP integration (deploy, manage, monitor)
- Hugging Face integration (AI/ML tasks)
- Google API integration (NLP, Sheets, etc.)
- Secure config and logging

## Setup
1. **Clone this repo and enter the `sasha_agent` directory.**
2. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
3. **Configure your secrets:**
   - Copy `config.yaml` and fill in your API keys and tokens.
   - Or create a `.env` file based on `.env.example` (not committed to version control).
   - Download your GCP service account JSON and set the path in config.
4. **Run the agent:**
   ```sh
   python main.py
   ```

## Security Note
- **Never commit your real API keys or service account files to public repos.**
- Use `.env` or `config.yaml` for local secrets only.

## Integrations
- **Discord:** Responds to commands and sends notifications.
- **GCP:** Deploys and manages cloud resources.
- **Hugging Face:** Runs AI/ML models.
- **Google APIs:** Uses your Google API key for NLP, Sheets, etc.

---

*Extend Sasha with more plugins as needed!* 