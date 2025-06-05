import sys
import os
from pathlib import Path
from PyQt6.QtWidgets import (QSystemTrayIcon, QMenu, QApplication, 
                            QDialog, QVBoxLayout, QPushButton, QLabel,
                            QLineEdit, QComboBox, QCheckBox, QMessageBox)
from PyQt6.QtGui import QIcon, QAction, QKeySequence, QShortcut
from PyQt6.QtCore import Qt, QTimer, pyqtSignal
import logging
from typing import Optional, Callable, Dict
import json
import keyboard
import win32gui
import win32con
import time
import zipfile

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QuickActionDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Add Quick Action")
        self.setup_ui()
        
    def setup_ui(self):
        layout = QVBoxLayout()
        
        # Action name
        self.name_edit = QLineEdit()
        self.name_edit.setPlaceholderText("Action Name")
        layout.addWidget(QLabel("Action Name:"))
        layout.addWidget(self.name_edit)
        
        # Action type
        self.type_combo = QComboBox()
        self.type_combo.addItems(["Text Command", "System Command", "URL", "File"])
        layout.addWidget(QLabel("Action Type:"))
        layout.addWidget(self.type_combo)
        
        # Action value
        self.value_edit = QLineEdit()
        self.value_edit.setPlaceholderText("Action Value")
        layout.addWidget(QLabel("Action Value:"))
        layout.addWidget(self.value_edit)
        
        # Shortcut
        self.shortcut_edit = QLineEdit()
        self.shortcut_edit.setPlaceholderText("Press keys for shortcut...")
        self.shortcut_edit.setReadOnly(True)
        layout.addWidget(QLabel("Shortcut:"))
        layout.addWidget(self.shortcut_edit)
        
        # Buttons
        buttons_layout = QVBoxLayout()
        self.save_button = QPushButton("Save")
        self.cancel_button = QPushButton("Cancel")
        buttons_layout.addWidget(self.save_button)
        buttons_layout.addWidget(self.cancel_button)
        layout.addLayout(buttons_layout)
        
        self.setLayout(layout)
        
        # Connect signals
        self.save_button.clicked.connect(self.accept)
        self.cancel_button.clicked.connect(self.reject)
        self.shortcut_edit.mousePressEvent = self.start_shortcut_capture
        
    def start_shortcut_capture(self, event):
        self.shortcut_edit.setText("Press keys...")
        keyboard.hook(self.capture_shortcut)
        
    def capture_shortcut(self, event):
        if event.event_type == keyboard.KEY_DOWN:
            keys = keyboard.get_hotkey_name()
            self.shortcut_edit.setText(keys)
            keyboard.unhook_all()
            return False

class SashaTrayIcon(QSystemTrayIcon):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.app = QApplication.instance()
        self.quick_actions: Dict[str, Dict] = {}
        self.load_quick_actions()
        self.setup_icon()
        self.setup_menu()
        self.setup_tooltip()
        self.setup_status_timer()
        self.setup_shortcuts()
        
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
        
        # Quick Actions submenu
        self.quick_actions_menu = menu.addMenu("Quick Actions")
        self.add_quick_action = QAction("Add Quick Action...", self.quick_actions_menu)
        self.quick_actions_menu.addAction(self.add_quick_action)
        self.quick_actions_menu.addSeparator()
        self.update_quick_actions_menu()
        
        # Settings actions
        settings_menu = menu.addMenu("Settings")
        
        # General settings
        general_menu = settings_menu.addMenu("General")
        self.auto_start_action = QAction("Start with Windows", general_menu)
        self.auto_start_action.setCheckable(True)
        general_menu.addAction(self.auto_start_action)
        
        self.minimize_to_tray_action = QAction("Minimize to Tray", general_menu)
        self.minimize_to_tray_action.setCheckable(True)
        self.minimize_to_tray_action.setChecked(True)
        general_menu.addAction(self.minimize_to_tray_action)
        
        # Voice settings
        voice_menu = settings_menu.addMenu("Voice Settings")
        self.voice_enabled_action = QAction("Enable Voice", voice_menu)
        self.voice_enabled_action.setCheckable(True)
        self.voice_enabled_action.setChecked(True)
        voice_menu.addAction(self.voice_enabled_action)
        
        # Model settings
        model_menu = settings_menu.addMenu("AI Model")
        self.model_actions = {}
        for model in ["Gemini Pro", "Gemini Ultra", "PaLM 2"]:
            action = QAction(model, model_menu)
            action.setCheckable(True)
            if model == "Gemini Pro":
                action.setChecked(True)
            self.model_actions[model] = action
            model_menu.addAction(action)
            
        # Backup/Restore settings
        backup_menu = settings_menu.addMenu("Backup/Restore")
        self.backup_action = QAction("Backup Settings", backup_menu)
        self.restore_action = QAction("Restore Settings", backup_menu)
        backup_menu.addAction(self.backup_action)
        backup_menu.addAction(self.restore_action)
        
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
        
    def setup_shortcuts(self):
        """Set up global shortcuts."""
        for action_name, action_data in self.quick_actions.items():
            if "shortcut" in action_data:
                try:
                    keyboard.add_hotkey(
                        action_data["shortcut"],
                        lambda a=action_data: self.execute_quick_action(a)
                    )
                except Exception as e:
                    logger.error(f"Error setting up shortcut for {action_name}: {e}")
                    
    def load_quick_actions(self):
        """Load quick actions from file."""
        try:
            actions_file = Path(__file__).parent / "quick_actions.json"
            if actions_file.exists():
                with open(actions_file, 'r') as f:
                    self.quick_actions = json.load(f)
        except Exception as e:
            logger.error(f"Error loading quick actions: {e}")
            
    def save_quick_actions(self):
        """Save quick actions to file."""
        try:
            actions_file = Path(__file__).parent / "quick_actions.json"
            with open(actions_file, 'w') as f:
                json.dump(self.quick_actions, f, indent=4)
        except Exception as e:
            logger.error(f"Error saving quick actions: {e}")
            
    def update_quick_actions_menu(self):
        """Update the quick actions menu."""
        self.quick_actions_menu.clear()
        self.quick_actions_menu.addAction(self.add_quick_action)
        self.quick_actions_menu.addSeparator()
        
        for action_name, action_data in self.quick_actions.items():
            action = QAction(action_name, self.quick_actions_menu)
            if "shortcut" in action_data:
                action.setText(f"{action_name} ({action_data['shortcut']})")
            action.triggered.connect(lambda checked, a=action_data: self.execute_quick_action(a))
            self.quick_actions_menu.addAction(action)
            
    def add_quick_action(self):
        """Add a new quick action."""
        dialog = QuickActionDialog()
        if dialog.exec():
            name = dialog.name_edit.text()
            action_type = dialog.type_combo.currentText()
            value = dialog.value_edit.text()
            shortcut = dialog.shortcut_edit.text()
            
            if name and value:
                self.quick_actions[name] = {
                    "type": action_type,
                    "value": value,
                    "shortcut": shortcut
                }
                self.save_quick_actions()
                self.update_quick_actions_menu()
                self.setup_shortcuts()
                
    def execute_quick_action(self, action_data: Dict):
        """Execute a quick action."""
        try:
            action_type = action_data["type"]
            value = action_data["value"]
            
            if action_type == "Text Command":
                # Send text to active window
                win32gui.SetForegroundWindow(win32gui.GetForegroundWindow())
                keyboard.write(value)
                keyboard.press_and_release('enter')
            elif action_type == "System Command":
                os.system(value)
            elif action_type == "URL":
                os.startfile(value)
            elif action_type == "File":
                os.startfile(value)
                
        except Exception as e:
            logger.error(f"Error executing quick action: {e}")
            self.show_notification("Error", f"Failed to execute action: {e}")
            
    def backup_settings(self):
        """Backup all settings."""
        try:
            from sasha_commands import SashaController
            controller = SashaController()
            
            # Get backup directory
            backup_dir = Path.home() / "SashaBackups"
            backup_dir.mkdir(exist_ok=True)
            
            # Create backup
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            backup_file = backup_dir / f"sasha_backup_{timestamp}.zip"
            
            # Add files to backup
            files_to_backup = [
                "sasha_settings.json",
                "quick_actions.json",
                "sasha.ico"
            ]
            
            with zipfile.ZipFile(backup_file, 'w') as zipf:
                for file in files_to_backup:
                    file_path = Path(__file__).parent / file
                    if file_path.exists():
                        zipf.write(file_path, file)
                        
            self.show_notification("Backup", f"Settings backed up to {backup_file}")
            
        except Exception as e:
            logger.error(f"Error backing up settings: {e}")
            self.show_notification("Error", f"Failed to backup settings: {e}")
            
    def restore_settings(self):
        """Restore settings from backup."""
        try:
            # Get backup directory
            backup_dir = Path.home() / "SashaBackups"
            if not backup_dir.exists():
                self.show_notification("Error", "No backup directory found")
                return
                
            # Get list of backups
            backups = list(backup_dir.glob("sasha_backup_*.zip"))
            if not backups:
                self.show_notification("Error", "No backups found")
                return
                
            # Show backup selection dialog
            dialog = QDialog()
            dialog.setWindowTitle("Select Backup")
            layout = QVBoxLayout()
            
            combo = QComboBox()
            for backup in backups:
                combo.addItem(backup.name)
            layout.addWidget(combo)
            
            buttons = QHBoxLayout()
            ok_button = QPushButton("Restore")
            cancel_button = QPushButton("Cancel")
            buttons.addWidget(ok_button)
            buttons.addWidget(cancel_button)
            layout.addLayout(buttons)
            
            dialog.setLayout(layout)
            
            if dialog.exec():
                selected_backup = backup_dir / combo.currentText()
                
                # Extract backup
                with zipfile.ZipFile(selected_backup, 'r') as zipf:
                    zipf.extractall(Path(__file__).parent)
                    
                # Reload settings
                self.load_quick_actions()
                self.update_quick_actions_menu()
                self.setup_shortcuts()
                
                self.show_notification("Restore", "Settings restored successfully")
                
        except Exception as e:
            logger.error(f"Error restoring settings: {e}")
            self.show_notification("Error", f"Failed to restore settings: {e}")
            
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
        self.add_quick_action.triggered.connect(self.add_quick_action)
        self.backup_action.triggered.connect(self.backup_settings)
        self.restore_action.triggered.connect(self.restore_settings)
        
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
