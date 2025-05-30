# Devin: DevOps Runner Discord Bot

Devin is a universal, secure, and extensible DevOps runner bot for Discord. It allows you (and your AI assistant) to trigger deployments, run scripts, and manage your infrastructure from Discord, with full admin control and auditability.

---

## Features
- **/deploy**: Build, push, and deploy your backend to Cloud Run
- **/run <script>**: Run a whitelisted script or command
- **/status**: Report last deployment/build status
- **/logs**: Fetch and post recent logs from Cloud Run or local scripts
- **Role-based access**: Only authorized users can trigger actions
- **Admin/AI access**: You and your AI assistant have full control

---

## Universal Setup (Windows, Linux, or Cloud VM)

### 1. Prerequisites
- Node.js v18+ ([Download](https://nodejs.org/))
- Docker (for build/deploy commands)
- Google Cloud SDK (`gcloud` CLI) installed and authenticated
- Discord bot token ([Create a bot](https://discord.com/developers/applications))
- GCP service account key (JSON) with permissions for Artifact Registry and Cloud Run

### 2. Clone and Install
```sh
git clone <your-repo-url> Devin
cd Devin
npm install
```

### 3. Configure Environment
Create a `.env` file in the root:
```
DISCORD_TOKEN=your-discord-bot-token
DISCORD_GUILD_ID=your-discord-server-id
DISCORD_CHANNEL_ID=your-channel-id
ADMIN_USER_IDS=comma,separated,discord,user,ids
GCP_PROJECT_ID=agentecos-1748475661
GCP_REGION=us-central1
GCP_SA_KEY_PATH=./gcp-service-account.json
```
- Place your GCP service account key at the path specified above.
- Set `ADMIN_USER_IDS` to your Discord user ID and the AI's Discord user ID.

### 4. Run Devin
```sh
node index.js
```

Devin will connect to Discord and listen for commands in the specified channel.

---

## Usage
- `/deploy` — Triggers the Cloud Run deployment workflow
- `/run <script>` — Runs a whitelisted script (e.g., `deploy_cloudshell.sh`)
- `/status` — Reports last deployment/build status
- `/logs` — Posts recent logs

---

## Security & Admin
- Only users in `ADMIN_USER_IDS` can trigger sensitive actions
- All actions are logged to Discord for auditability
- You can extend Devin with new commands by editing `commands/` or `index.js`

---

## Support
If you need help, ask your AI assistant or open an issue in this repo. 