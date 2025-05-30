// Devin: Universal DevOps Runner Discord Bot
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const { exec } = require('child_process');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS ? process.env.ADMIN_USER_IDS.split(',') : [];

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

client.once(Events.ClientReady, () => {
  console.log(`Devin is online as ${client.user.tag}`);
  const channel = client.channels.cache.get(CHANNEL_ID);
  if (channel) channel.send('Devin is online and ready for DevOps commands!');
});

client.on(Events.MessageCreate, async (message) => {
  if (message.channel.id !== CHANNEL_ID || message.author.bot) return;
  if (!ADMIN_USER_IDS.includes(message.author.id)) {
    await message.reply('You are not authorized to use Devin.');
    return;
  }

  const content = message.content.trim();

  if (content === '/deploy') {
    await message.reply('Starting deployment...');
    // TODO: Run deploy_cloudshell.sh or equivalent GCP/Docker commands
    exec('bash ./deploy_cloudshell.sh', (error, stdout, stderr) => {
      if (error) {
        message.reply(`Deployment failed: ${error.message}`);
        return;
      }
      if (stderr) {
        message.reply(`Deployment stderr: ${stderr}`);
      }
      message.reply(`Deployment output:\n${stdout}`);
    });
  } else if (content.startsWith('/run ')) {
    const script = content.replace('/run ', '').trim();
    // TODO: Whitelist scripts for security
    await message.reply(`Running script: ${script}`);
    exec(`bash ${script}`, (error, stdout, stderr) => {
      if (error) {
        message.reply(`Script failed: ${error.message}`);
        return;
      }
      if (stderr) {
        message.reply(`Script stderr: ${stderr}`);
      }
      message.reply(`Script output:\n${stdout}`);
    });
  } else if (content === '/status') {
    // TODO: Implement status check (last deploy/build)
    await message.reply('Status check not yet implemented.');
  } else if (content === '/logs') {
    // TODO: Fetch and post recent logs from Cloud Run or local scripts
    await message.reply('Log fetching not yet implemented.');
  } else if (content.startsWith('/shell ')) {
    const shellCmd = content.replace('/shell ', '').trim();
    await message.reply(`Running shell command: ${shellCmd}`);
    exec(shellCmd, (error, stdout, stderr) => {
      if (error) {
        message.reply(`Shell command failed: ${error.message}`);
        return;
      }
      if (stderr) {
        message.reply(`Shell stderr: ${stderr}`);
      }
      message.reply(`Shell output:\n${stdout}`);
    });
  }
});

client.login(DISCORD_TOKEN); 