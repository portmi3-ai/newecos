import sys
import os
from pathlib import Path
from PyQt6.QtWidgets import QSystemTrayIcon, QMenu, QApplication
from PyQt6.QtGui import QIcon, QAction
from PyQt6.QtCore import Qt, QTimer
import logging
from typing import Optional, Callable

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SashaTrayIcon(QSystemTrayIcon):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.app = QApplication.instance()
        self.setup_icon()
        self.setup_menu()
        self.setup_tooltip()
        self.setup_status_timer()
        
    def setup_icon(self):
        """Set up the tray icon."""
        icon_path = Path(__file__).parent / "sasha.ico"
        if not icon_path.exists():
            # Create icon if it doesn't exist
            from create_icon import create_icon
            create_icon()
        
        self.setIcon(QIcon(str(icon_path)))
        self.setVisible(True)
        
    def setup_menu(self):
        """Set up the tray menu."""
        menu = QMenu()
        
        # Status action (non-clickable)
        self.status_action = QAction("Status: Initializing...", menu)
        self.status_action.setEnabled(False)
        menu.addAction(self.status_action)
        menu.addSeparator()
        
        # Control actions
        self.start_action = QAction("Start Sasha", menu)
        self.stop_action = QAction("Stop Sasha", menu)
        self.restart_action = QAction("Restart Sasha", menu)
        
        menu.addAction(self.start_action)
        menu.addAction(self.stop_action)
        menu.addAction(self.restart_action)
        menu.addSeparator()
        
        # Settings actions
        settings_menu = menu.addMenu("Settings")
        self.auto_start_action = QAction("Start with Windows", settings_menu)
        self.auto_start_action.setCheckable(True)
        settings_menu.addAction(self.auto_start_action)
        
        # Voice settings submenu
        voice_menu = settings_menu.addMenu("Voice Settings")
        self.voice_enabled_action = QAction("Enable Voice", voice_menu)
        self.voice_enabled_action.setCheckable(True)
        self.voice_enabled_action.setChecked(True)
        voice_menu.addAction(self.voice_enabled_action)
        
        # Model settings submenu
        model_menu = settings_menu.addMenu("AI Model")
        self.model_actions = {}
        for model in ["Gemini Pro", "Gemini Ultra", "PaLM 2"]:
            action = QAction(model, model_menu)
            action.setCheckable(True)
            if model == "Gemini Pro":
                action.setChecked(True)
            self.model_actions[model] = action
            model_menu.addAction(action)
            
        menu.addSeparator()
        
        # Exit action
        exit_action = QAction("Exit", menu)
        exit_action.triggered.connect(self.app.quit)
        menu.addAction(exit_action)
        
        self.setContextMenu(menu)
        
    def setup_tooltip(self):
        """Set up the tooltip with status information."""
        self.setToolTip("Sasha - AI Assistant\nStatus: Initializing...")
        
    def setup_status_timer(self):
        """Set up timer for status updates."""
        self.status_timer = QTimer()
        self.status_timer.timeout.connect(self.update_status)
        self.status_timer.start(5000)  # Update every 5 seconds
        
    def update_status(self):
        """Update the status display."""
        try:
            from sasha_commands import SashaController
            controller = SashaController()
            status = "running" if controller.status() else "stopped"
            self.status_action.setText(f"Status: {status.capitalize()}")
            self.setToolTip(f"Sasha - AI Assistant\nStatus: {status.capitalize()}")
        except Exception as e:
            logger.error(f"Error updating status: {e}")
            
    def set_callbacks(self, 
                     on_start: Callable,
                     on_stop: Callable,
                     on_restart: Callable,
                     on_voice_toggle: Callable,
                     on_model_change: Callable):
        """Set callback functions for menu actions."""
        self.start_action.triggered.connect(on_start)
        self.stop_action.triggered.connect(on_stop)
        self.restart_action.triggered.connect(on_restart)
        self.voice_enabled_action.triggered.connect(on_voice_toggle)
        
        # Connect model actions
        for model, action in self.model_actions.items():
            action.triggered.connect(lambda checked, m=model: on_model_change(m))
            
    def show_notification(self, title: str, message: str, duration: int = 5000):
        """Show a notification in the system tray."""
        self.showMessage(title, message, QSystemTrayIcon.Information, duration)
        
    def set_auto_start(self, enabled: bool):
        """Set whether Sasha should start with Windows."""
        self.auto_start_action.setChecked(enabled)
        
    def set_voice_enabled(self, enabled: bool):
        """Set whether voice is enabled."""
        self.voice_enabled_action.setChecked(enabled)
        
    def set_active_model(self, model: str):
        """Set the active AI model."""
        for m, action in self.model_actions.items():
            action.setChecked(m == model)

def create_tray_icon() -> SashaTrayIcon:
    """Create and return a SashaTrayIcon instance."""
    app = QApplication.instance()
    if not app:
        app = QApplication(sys.argv)
        
    tray = SashaTrayIcon()
    return tray

if __name__ == "__main__":
    # Test the tray icon
    app = QApplication(sys.argv)
    tray = create_tray_icon()
    sys.exit(app.exec()) 