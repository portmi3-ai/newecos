import os
import sys
import json
import win32gui
import win32con
import win32api
import winreg
import logging
import pywinauto
from pywinauto.application import Application
from datetime import datetime
import subprocess
import ctypes
from pathlib import Path

class FilmoraDiagnostics:
    def __init__(self):
        self.setup_logging()
        self.results = {
            "system_info": {},
            "filmora_info": {},
            "screen_info": {},
            "ui_elements": {},
            "test_results": {},
            "timestamp": datetime.now().isoformat()
        }
        
    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('filmora_diagnostics.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def get_system_info(self):
        """Gather system information"""
        self.logger.info("Gathering system information...")
        try:
            self.results["system_info"] = {
                "os_version": sys.getwindowsversion(),
                "python_version": sys.version,
                "screen_resolution": (win32api.GetSystemMetrics(0), win32api.GetSystemMetrics(1)),
                "dpi_awareness": ctypes.windll.user32.GetDpiForSystem(),
                "username": os.getenv("USERNAME"),
                "computer_name": os.getenv("COMPUTERNAME")
            }
        except Exception as e:
            self.logger.error(f"Error gathering system info: {e}")

    def find_filmora_version(self):
        """Find Filmora installation and version"""
        self.logger.info("Locating Filmora installation...")
        try:
            reg_paths = [
                (winreg.HKEY_CURRENT_USER, "SOFTWARE\\Wondershare\\Filmora"),
                (winreg.HKEY_LOCAL_MACHINE, "SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Wondershare Filmora"),
                (winreg.HKEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Wondershare Filmora")
            ]
            
            for root, subkey in reg_paths:
                try:
                    key = winreg.OpenKey(root, subkey, 0, winreg.KEY_READ)
                    install_location = winreg.QueryValueEx(key, "InstallLocation")[0]
                    version = winreg.QueryValueEx(key, "DisplayVersion")[0]
                    winreg.CloseKey(key)
                    
                    self.results["filmora_info"]["installation"] = {
                        "path": install_location,
                        "version": version,
                        "registry_key": f"{root}\\{subkey}"
                    }
                    break
                except:
                    continue
                    
            # Check common installation paths
            common_paths = [
                "C:\\Program Files\\Wondershare\\Filmora\\Filmora.exe",
                "C:\\Program Files (x86)\\Wondershare\\Filmora\\Filmora.exe",
                os.path.expandvars("%LOCALAPPDATA%\\Wondershare\\Filmora\\Filmora.exe")
            ]
            
            for path in common_paths:
                if os.path.exists(path):
                    self.results["filmora_info"]["executable"] = path
                    break
                    
        except Exception as e:
            self.logger.error(f"Error finding Filmora version: {e}")

    def analyze_ui_elements(self):
        """Analyze Filmora UI elements and their positions"""
        self.logger.info("Analyzing Filmora UI elements...")
        try:
            # Try to connect to existing Filmora instance
            def callback(hwnd, windows):
                if win32gui.IsWindowVisible(hwnd):
                    title = win32gui.GetWindowText(hwnd)
                    if "filmora" in title.lower():
                        windows.append((hwnd, title))
                return True
            
            windows = []
            win32gui.EnumWindows(callback, windows)
            
            if not windows:
                self.logger.info("No Filmora window found. Starting Filmora...")
                if "executable" in self.results["filmora_info"]:
                    subprocess.Popen([self.results["filmora_info"]["executable"]])
                    import time
                    time.sleep(10)
                    win32gui.EnumWindows(callback, windows)
            
            if windows:
                hwnd, title = windows[0]
                self.results["ui_elements"]["window"] = {
                    "handle": hwnd,
                    "title": title,
                    "rect": win32gui.GetWindowRect(hwnd)
                }
                
                try:
                    app = Application(backend="uia").connect(handle=hwnd)
                    main_window = app.window(title_re=".*(?:Filmora|Wondershare).*")
                    
                    # Get UI element tree
                    self.results["ui_elements"]["tree"] = self._get_element_tree(main_window)
                    
                    # Try to find common UI elements
                    elements_to_find = [
                        "Import", "Media", "Export", "Effects",
                        "Timeline", "Preview", "Properties"
                    ]
                    
                    for element_name in elements_to_find:
                        try:
                            element = main_window.child_window(title_re=f".*{element_name}.*", control_type="Button")
                            if element.exists():
                                rect = element.rectangle()
                                self.results["ui_elements"][element_name] = {
                                    "found": True,
                                    "position": (rect.left, rect.top, rect.right, rect.bottom),
                                    "visible": element.is_visible()
                                }
                        except:
                            self.results["ui_elements"][element_name] = {
                                "found": False
                            }
                            
                except Exception as e:
                    self.logger.error(f"Error analyzing UI elements: {e}")
                    
        except Exception as e:
            self.logger.error(f"Error in UI analysis: {e}")

    def _get_element_tree(self, element, level=0, max_level=3):
        """Recursively get UI element tree"""
        if level >= max_level:
            return None
            
        try:
            result = {
                "control_type": element.control_type(),
                "class_name": element.class_name(),
                "title": element.window_text(),
                "visible": element.is_visible() if hasattr(element, "is_visible") else None,
                "enabled": element.is_enabled() if hasattr(element, "is_enabled") else None,
                "rectangle": element.rectangle() if hasattr(element, "rectangle") else None
            }
            
            children = []
            for child in element.children():
                child_info = self._get_element_tree(child, level + 1, max_level)
                if child_info:
                    children.append(child_info)
                    
            if children:
                result["children"] = children
                
            return result
        except:
            return None

    def test_interactions(self):
        """Test basic interactions with Filmora"""
        self.logger.info("Testing basic interactions...")
        try:
            if "window" not in self.results["ui_elements"]:
                self.logger.error("No Filmora window found for interaction testing")
                return
                
            hwnd = self.results["ui_elements"]["window"]["handle"]
            
            # Test window focus
            self.results["test_results"]["focus"] = {
                "success": win32gui.SetForegroundWindow(hwnd),
                "timestamp": datetime.now().isoformat()
            }
            
            # Test window state
            placement = win32gui.GetWindowPlacement(hwnd)
            self.results["test_results"]["window_state"] = {
                "minimized": placement[1] == win32con.SW_SHOWMINIMIZED,
                "maximized": placement[1] == win32con.SW_SHOWMAXIMIZED,
                "normal": placement[1] == win32con.SW_SHOWNORMAL
            }
            
        except Exception as e:
            self.logger.error(f"Error in interaction testing: {e}")

    def save_results(self):
        """Save diagnostic results"""
        try:
            output_file = f"filmora_diagnostics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(output_file, 'w') as f:
                json.dump(self.results, f, indent=2, default=str)
            self.logger.info(f"Diagnostic results saved to {output_file}")
            return output_file
        except Exception as e:
            self.logger.error(f"Error saving results: {e}")
            return None

    def run_diagnostics(self):
        """Run all diagnostic tests"""
        self.logger.info("Starting Filmora diagnostics...")
        
        self.get_system_info()
        self.find_filmora_version()
        self.analyze_ui_elements()
        self.test_interactions()
        
        return self.save_results()

def main():
    diagnostics = FilmoraDiagnostics()
    results_file = diagnostics.run_diagnostics()
    
    if results_file:
        print(f"\nDiagnostics completed successfully!")
        print(f"Results saved to: {results_file}")
        print("\nPlease provide this file for analysis of Filmora automation issues.")
    else:
        print("\nError running diagnostics. Please check the log file.")

if __name__ == "__main__":
    main() 