import os
import sys
import logging
import subprocess
from pathlib import Path
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SashaController:
    def __init__(self):
        self.process: Optional[subprocess.Popen] = None
        self.is_running = False
        self.exe_path = self._get_exe_path()
        
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
            
    def status(self) -> bool:
        """Get Sasha's running status."""
        return self.is_running

def handle_command(command: str) -> str:
    """Handle Sasha commands from the IDE."""
    controller = SashaController()
    
    if command == "/sasha-on":
        controller.start()
        return "Sasha is starting..."
    elif command == "/sasha-off":
        controller.stop()
        return "Sasha is stopping..."
    elif command == "/sasha-status":
        status = "running" if controller.status() else "stopped"
        return f"Sasha is {status}"
    else:
        return "Unknown command. Available commands: /sasha-on, /sasha-off, /sasha-status"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(handle_command(sys.argv[1])) 