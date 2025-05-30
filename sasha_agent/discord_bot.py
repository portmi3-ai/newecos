import logging
import discord
from discord.ext import commands

def run_discord_bot(token, guild_id, channel_id, gcp, hf, google_api_key):
    intents = discord.Intents.default()
    bot = commands.Bot(command_prefix='!', intents=intents)

    @bot.event
    async def on_ready():
        logging.info(f'Sasha Discord bot is online as {bot.user}!')
        channel = bot.get_channel(int(channel_id))
        if channel:
            await channel.send('Sasha is online and ready to help!')

    # Example command
    @bot.command()
    async def ping(ctx):
        await ctx.send('Pong! Sasha is here.')

    @bot.command()
    async def dmme(ctx):
        try:
            await ctx.author.send('👑 Hello KING! This is Jada (Sasha) DMing you as requested. If you need anything, just ask!')
            await ctx.send(f"I've sent you a DM, KING!")
        except Exception as e:
            await ctx.send(f"Sorry, I couldn't DM you: {e}")

    # TODO: Add more commands for GCP, Hugging Face, etc.

    bot.run(token) 