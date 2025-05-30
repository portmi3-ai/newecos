import yaml
import logging
from discord_bot import run_discord_bot
from gcp_client import GCPClient
from huggingface_client import HuggingFaceClient

# Setup logging
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')

# Load config
def load_config():
    with open('config.yaml', 'r') as f:
        return yaml.safe_load(f)

def main():
    config = load_config()
    logging.info('Sasha Agent starting up...')

    # Initialize integrations
    gcp = GCPClient(config['gcp'])
    hf = HuggingFaceClient(config['huggingface']['api_key'])

    # Start Discord bot
    run_discord_bot(
        token=config['discord']['bot_token'],
        guild_id=config['discord']['guild_id'],
        channel_id=config['discord']['channel_id'],
        gcp=gcp,
        hf=hf,
        google_api_key=config['google']['api_key']
    )

if __name__ == '__main__':
    main() 