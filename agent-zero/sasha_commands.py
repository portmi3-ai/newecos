import os
import sys
import logging
import subprocess
import json
from pathlib import Path
from typing import Optional, Dict, Any
import winreg
import keyring

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SashaSettings:
    def __init__(self):
        self.settings_file = Path(__file__).parent / "sasha_settings.json"
        self.default_settings = {
            "voice_enabled": True,
            "auto_start": False,
            "active_model": "Gemini Pro",
            "notifications_enabled": True,
            "theme": "dark",
            "language": "en",
            "max_history": 100,
            "api_keys": {}
        }
        self.settings = self.load_settings()
        
    def load_settings(self) -> Dict[str, Any]:
        """Load settings from file."""
        try:
            if self.settings_file.exists():
                with open(self.settings_file, 'r') as f:
                    return json.load(f)
            return self.default_settings.copy()
        except Exception as e:
            logger.error(f"Error loading settings: {e}")
            return self.default_settings.copy()
            
    def save_settings(self):
        """Save settings to file."""
        try:
            with open(self.settings_file, 'w') as f:
                json.dump(self.settings, f, indent=4)
        except Exception as e:
            logger.error(f"Error saving settings: {e}")
            
    def get_setting(self, key: str, default: Any = None) -> Any:
        """Get a setting value."""
        return self.settings.get(key, default)
        
    def set_setting(self, key: str, value: Any):
        """Set a setting value."""
        self.settings[key] = value
        self.save_settings()
        
    def set_auto_start(self, enabled: bool):
        """Set whether Sasha should start with Windows."""
        try:
            key = winreg.OpenKey(
                winreg.HKEY_CURRENT_USER,
                r"Software\Microsoft\Windows\CurrentVersion\Run",
                0, winreg.KEY_SET_VALUE
            )
            
            if enabled:
                exe_path = str(Path(__file__).parent / "dist" / "sasha.exe")
                winreg.SetValueEx(key, "Sasha", 0, winreg.REG_SZ, exe_path)
            else:
                try:
                    winreg.DeleteValue(key, "Sasha")
                except WindowsError:
                    pass
                    
            winreg.CloseKey(key)
            self.set_setting("auto_start", enabled)
            
        except Exception as e:
            logger.error(f"Error setting auto-start: {e}")
            
    def save_api_key(self, service: str, key: str):
        """Save an API key securely."""
        try:
            keyring.set_password("sasha", service, key)
            self.settings["api_keys"][service] = True  # Just store that we have a key
            self.save_settings()
        except Exception as e:
            logger.error(f"Error saving API key: {e}")
            
    def get_api_key(self, service: str) -> Optional[str]:
        """Get a saved API key."""
        try:
            return keyring.get_password("sasha", service)
        except Exception as e:
            logger.error(f"Error getting API key: {e}")
            return None

class SashaController:
    def __init__(self):
        self.process: Optional[subprocess.Popen] = None
        self.is_running = False
        self.exe_path = self._get_exe_path()
        self.settings = SashaSettings()
        
    def _get_exe_path(self) -> Path:
        """Get the path to Sasha's executable."""
        if getattr(sys, 'frozen', False):
            # Running as compiled exe
            return Path(sys.executable)
        else:
            # Running as script
            return Path(__file__).parent / "dist" / "sasha.exe"
            
    def start(self):
        """Start Sasha."""
        if self.is_running:
            logger.info("Sasha is already running")
            return
            
        try:
            if self.exe_path.exists():
                # Run the executable
                self.process = subprocess.Popen([str(self.exe_path)])
            else:
                # Run the Python script
                script_path = Path(__file__).parent / "agent_gui.py"
                self.process = subprocess.Popen([sys.executable, str(script_path)])
                
            self.is_running = True
            logger.info("Sasha started successfully")
            
        except Exception as e:
            logger.error(f"Failed to start Sasha: {e}")
            self.is_running = False
            
    def stop(self):
        """Stop Sasha."""
        if not self.is_running:
            logger.info("Sasha is not running")
            return
            
        try:
            if self.process:
                self.process.terminate()
                self.process.wait(timeout=5)
            self.is_running = False
            logger.info("Sasha stopped successfully")
            
        except Exception as e:
            logger.error(f"Failed to stop Sasha: {e}")
            
    def restart(self):
        """Restart Sasha."""
        self.stop()
        self.start()
            
    def status(self) -> bool:
        """Get Sasha's running status."""
        return self.is_running
        
    def set_voice_enabled(self, enabled: bool):
        """Set whether voice is enabled."""
        self.settings.set_setting("voice_enabled", enabled)
        
    def set_active_model(self, model: str):
        """Set the active AI model."""
        self.settings.set_setting("active_model", model)
        
    def set_theme(self, theme: str):
        """Set the UI theme."""
        self.settings.set_setting("theme", theme)
        
    def set_language(self, language: str):
        """Set the UI language."""
        self.settings.set_setting("language", language)
        
    def set_max_history(self, max_history: int):
        """Set the maximum conversation history length."""
        self.settings.set_setting("max_history", max_history)
        
    def set_notifications(self, enabled: bool):
        """Set whether notifications are enabled."""
        self.settings.set_setting("notifications_enabled", enabled)
        
    def save_api_key(self, service: str, key: str):
        """Save an API key."""
        self.settings.save_api_key(service, key)
        
    def get_api_key(self, service: str) -> Optional[str]:
        """Get a saved API key."""
        return self.settings.get_api_key(service)

def handle_command(command: str) -> str:
    """Handle Sasha commands from the IDE."""
    controller = SashaController()
    
    # Basic commands
    if command == "/sasha-on":
        controller.start()
        return "Sasha is starting..."
    elif command == "/sasha-off":
        controller.stop()
        return "Sasha is stopping..."
    elif command == "/sasha-restart":
        controller.restart()
        return "Sasha is restarting..."
    elif command == "/sasha-status":
        status = "running" if controller.status() else "stopped"
        return f"Sasha is {status}"
        
    # Settings commands
    elif command.startswith("/sasha-settings"):
        parts = command.split()
        if len(parts) < 3:
            return "Usage: /sasha-settings <setting> <value>"
            
        setting = parts[1]
        value = parts[2]
        
        if setting == "voice":
            controller.set_voice_enabled(value.lower() == "on")
            return f"Voice is now {'enabled' if value.lower() == 'on' else 'disabled'}"
        elif setting == "model":
            controller.set_active_model(value)
            return f"Active model set to {value}"
        elif setting == "theme":
            controller.set_theme(value)
            return f"Theme set to {value}"
        elif setting == "language":
            controller.set_language(value)
            return f"Language set to {value}"
        elif setting == "history":
            try:
                max_history = int(value)
                controller.set_max_history(max_history)
                return f"Maximum history set to {max_history}"
            except ValueError:
                return "Invalid history value. Please provide a number."
        elif setting == "notifications":
            controller.set_notifications(value.lower() == "on")
            return f"Notifications are now {'enabled' if value.lower() == 'on' else 'disabled'}"
        else:
            return f"Unknown setting: {setting}"
            
    # API key commands
    elif command.startswith("/sasha-api"):
        parts = command.split()
        if len(parts) < 3:
            return "Usage: /sasha-api <service> <key>"
            
        service = parts[1]
        key = parts[2]
        controller.save_api_key(service, key)
        return f"API key for {service} saved successfully"
        
    # Help command
    elif command == "/sasha-help":
        return """Available commands:
/sasha-on - Start Sasha
/sasha-off - Stop Sasha
/sasha-restart - Restart Sasha
/sasha-status - Check Sasha's status
/sasha-settings <setting> <value> - Change settings
/sasha-api <service> <key> - Save API key
/sasha-help - Show this help message

Settings:
- voice (on/off)
- model (Gemini Pro/Gemini Ultra/PaLM 2)
- theme (dark/light)
- language (en/es/fr/de)
- history (number)
- notifications (on/off)"""
        
    else:
        return "Unknown command. Use /sasha-help for available commands."

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(handle_command(sys.argv[1])) 