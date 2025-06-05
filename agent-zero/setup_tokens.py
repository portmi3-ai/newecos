import os
import sys
from pathlib import Path
from token_manager import TokenManager
from rich.console import Console
from rich.prompt import Prompt, Confirm
from rich.panel import Panel
from rich.table import Table

console = Console()

def setup_environment():
    """Set up the environment for token management."""
    # Create necessary directories
    Path("cache").mkdir(exist_ok=True)
    Path("cache/github").mkdir(exist_ok=True)
    Path("cache/huggingface").mkdir(exist_ok=True)
    Path("cache/models").mkdir(exist_ok=True)
    Path("cache/repositories").mkdir(exist_ok=True)
    Path("cache/downloads").mkdir(exist_ok=True)
    Path("cache/temp").mkdir(exist_ok=True)
    
    # Create .env file if it doesn't exist
    if not Path(".env").exists():
        Path(".env").touch()

def get_token_input(service: str) -> str:
    """Get token input from user with validation."""
    while True:
        token = Prompt.ask(f"Enter your {service} API token", password=True)
        if len(token) >= 20:
            return token
        console.print(f"[red]Invalid token for {service}. Token must be at least 20 characters long.[/red]")

def main():
    console.print(Panel.fit(
        "[bold blue]Sasha Meta Agent Token Setup[/bold blue]\n"
        "This script will help you set up and validate your API tokens.",
        title="Setup"
    ))

    # Initialize token manager
    token_manager = TokenManager()
    
    # Check existing tokens
    validation_results = token_manager.validate_tokens()
    missing_tokens = token_manager.get_missing_tokens()
    
    if not missing_tokens:
        console.print("[green]All required tokens are already configured![/green]")
        if Confirm.ask("Would you like to update any tokens?"):
            for service in token_manager.tokens.keys():
                if Confirm.ask(f"Update {service} token?"):
                    token = get_token_input(service)
                    token_manager.update_token(service, token)
    else:
        console.print("[yellow]Missing tokens detected. Let's set them up.[/yellow]")
        for service in missing_tokens:
            token = get_token_input(service)
            token_manager.update_token(service, token)
    
    # Save tokens to .env
    token_manager.save_tokens_to_env()
    
    # Show final status
    console.print("\n[bold]Final Token Status:[/bold]")
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Service")
    table.add_column("Status")
    
    for service, is_valid in token_manager.validate_tokens().items():
        status = "[green]✓[/green]" if is_valid else "[red]✗[/red]"
        table.add_row(service, status)
    
    console.print(table)
    
    # Show next steps
    console.print("\n[bold]Next Steps:[/bold]")
    console.print("1. Start Sasha using: python agent_gui.py")
    console.print("2. Use /status command to verify all integrations")
    console.print("3. Use /help to see available commands")

if __name__ == "__main__":
    setup_environment()
    main() 
