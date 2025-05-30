import os
import time
from pathlib import Path
import pywinauto
from pywinauto.application import Application
from pywinauto.keyboard import send_keys
from pywinauto import mouse
import logging
import win32gui
import win32con
import subprocess
import sys
import winreg
import win32com.client
import traceback
import json
from datetime import datetime
from functools import wraps
from neural.startup import NeuroStartup

def retry_operation(max_retries=3, delay=2):
    """Decorator for retrying operations with exponential backoff"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            self = args[0]  # Get the instance from args
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    wait_time = delay * (2 ** attempt)
                    self.logger.warning(f"Operation failed, attempt {attempt + 1}/{max_retries}. Retrying in {wait_time}s...")
                    self.logger.warning(f"Error: {str(e)}")
                    time.sleep(wait_time)
                    
                    # Try to recover based on error type
                    if isinstance(e, pywinauto.findwindows.ElementNotFoundError):
                        self.logger.info("Attempting UI recovery...")
                        self._attempt_ui_recovery()
                    elif "not responding" in str(e).lower():
                        self.logger.info("Attempting to restart Filmora...")
                        self.close()
                        time.sleep(5)
                        self.start_filmora()
            
            # If we get here, all retries failed
            self.logger.error(f"Operation failed after {max_retries} attempts")
            raise last_exception
        return wrapper
    return decorator

class FilmoraController:
    def __init__(self):
        # Initialize Neuro first
        self.neuro = NeuroStartup()
        self.neuro.initialize()
        
        # Set up paths from NEURO_REFERENCE
        self.video_dir = "F:\\Birthday_Video_Project\\Activities"
        self.output_dir = "F:\\Birthday_Video_Project\\Processed"
        
        # Parameters from NEURO_REFERENCE.md
        self.min_duration = 0.3
        self.max_duration = 8.0
        self.motion_threshold = 0.6
        self.unhinged_mode = True
        
        # Window management
        self.window_handle = None
        self.window_rect = None
        self.relative_coords = {}
        
        # Add crash monitoring setup
        self.crash_log_file = "filmora_crashes.json"
        self.current_operation = None
        self.last_action_time = None
        self.crash_data = self._load_crash_history()
        
        # Enhanced logging setup
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('filmora_automation.log', encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Verify video directory exists
        if not os.path.exists(self.video_dir):
            os.makedirs(self.video_dir, exist_ok=True)
            self.logger.warning(f"Created video directory: {self.video_dir}")
            
        # Verify we can access specific video files from NEURO_REFERENCE
        test_videos = [
            os.path.join(self.video_dir, "Activities_20220328_132518.mp4"),
            os.path.join(self.video_dir, "Activities_20220325_134337.mp4"),
            os.path.join(self.video_dir, "Activities_20220325_131447.mp4")
        ]
        
        videos_found = 0
        for test_video in test_videos:
            if os.path.exists(test_video):
                size_mb = os.path.getsize(test_video) / (1024 * 1024)
                self.logger.info(f"Found video: {os.path.basename(test_video)} ({size_mb:.2f} MB)")
                videos_found += 1
            else:
                self.logger.error(f"Could not find video at: {test_video}")
                
        if videos_found == 0:
            self.logger.error("No test videos found. Please verify video paths.")
        elif videos_found < len(test_videos):
            self.logger.warning(f"Found {videos_found}/{len(test_videos)} test videos.")
        else:
            self.logger.info("All test videos found successfully.")
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
        
    def _load_crash_history(self):
        """Load previous crash history"""
        try:
            if os.path.exists(self.crash_log_file):
                with open(self.crash_log_file, 'r') as f:
                    return json.load(f)
            return {"crashes": [], "total_crashes": 0}
        except Exception as e:
            return {"crashes": [], "total_crashes": 0}
            
    def _save_crash_data(self, crash_info):
        """Save crash information to history"""
        try:
            self.crash_data["crashes"].append(crash_info)
            self.crash_data["total_crashes"] += 1
            
            with open(self.crash_log_file, 'w') as f:
                json.dump(self.crash_data, f, indent=2)
        except Exception as e:
            self.logger.error(f"Failed to save crash data: {str(e)}")
            
    def _log_crash(self, error, operation=None):
        """Log detailed crash information"""
        try:
            crash_info = {
                "timestamp": datetime.now().isoformat(),
                "operation": operation or self.current_operation,
                "error_type": type(error).__name__,
                "error_message": str(error),
                "traceback": traceback.format_exc(),
                "last_action_time": self.last_action_time.isoformat() if self.last_action_time else None,
                "system_info": {
                    "filmora_window_found": bool(self.find_filmora_window()),
                    "workspace_path": self.video_dir,
                }
            }
            
            # Check for specific error patterns
            if isinstance(error, pywinauto.findwindows.ElementNotFoundError):
                crash_info["probable_cause"] = "UI element not found - possible interface change or timing issue"
            elif isinstance(error, pywinauto.timings.TimeoutError):
                crash_info["probable_cause"] = "Operation timed out - possible performance issue or hanging process"
            elif isinstance(error, win32gui.error):
                crash_info["probable_cause"] = "Window handling error - possible application not responding"
                
            self._save_crash_data(crash_info)
            
            # Log detailed crash information
            self.logger.error("\n=== CRASH REPORT ===")
            self.logger.error(f"Operation: {crash_info['operation']}")
            self.logger.error(f"Error Type: {crash_info['error_type']}")
            self.logger.error(f"Error Message: {crash_info['error_message']}")
            self.logger.error(f"Probable Cause: {crash_info.get('probable_cause', 'Unknown')}")
            self.logger.error("===================\n")
            
            return crash_info
        except Exception as e:
            self.logger.error(f"Failed to log crash: {str(e)}")
            return None

    def _attempt_ui_recovery(self):
        """Attempt to recover from UI-related issues"""
        try:
            # Try to refocus the window
            if hasattr(self, 'main_window'):
                self.main_window.set_focus()
                
            # Try to bring window to front
            hwnd = self.find_filmora_window()
            if hwnd:
                win32gui.SetForegroundWindow(hwnd)
                
            # Clear any potential dialogs
            send_keys('{ESC}')
            time.sleep(0.5)
            send_keys('{ENTER}')
            
            self.logger.info("[+] UI recovery attempt completed")
        except Exception as e:
            self.logger.warning(f"UI recovery failed: {str(e)}")

    def _operation_wrapper(self, func, operation_name):
        """Enhanced wrapper to track operations and handle crashes with retries"""
        @retry_operation()
        def wrapped_operation(self):
            self.current_operation = operation_name
            self.last_action_time = datetime.now()
            try:
                result = func()
                return result
            except Exception as e:
                crash_info = self._log_crash(e)
                if crash_info.get("probable_cause"):
                    self.logger.warning(f"Suggested Recovery: {self._get_recovery_suggestion(crash_info)}")
                raise
            finally:
                self.current_operation = None
        
        return wrapped_operation(self)

    def _get_recovery_suggestion(self, crash_info):
        """Get recovery suggestions based on crash type"""
        cause = crash_info.get("probable_cause", "")
        if "UI element not found" in cause:
            return "Try increasing wait times or verifying UI layout"
        elif "timed out" in cause:
            return "Consider increasing timeout values or checking system resources"
        elif "not responding" in cause:
            return "Try force-closing and restarting Filmora"
        return "Consider restarting the application and checking system resources"

    def find_filmora_path(self):
        """Find Filmora installation path from registry and common locations"""
        try:
            # Try user's specific installation first
            user_specific_paths = [
                "C:\\Users\\it2it\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Wondershare\\Wondershare Filmora\\Wondershare Filmora.lnk",
                "C:\\Users\\it2it\\AppData\\Local\\Wondershare\\Filmora\\Filmora.exe",
                "C:\\Users\\it2it\\AppData\\Local\\Programs\\Wondershare\\Filmora\\Filmora.exe"
            ]
            
            for path in user_specific_paths:
                if os.path.exists(path):
                    # If it's a shortcut, resolve it
                    if path.endswith('.lnk'):
                        shell = win32com.client.Dispatch("WScript.Shell")
                        shortcut = shell.CreateShortCut(path)
                        target_path = shortcut.Targetpath
                        if os.path.exists(target_path):
                            self.logger.info(f"Found Filmora shortcut target: {target_path}")
                            return target_path
                    else:
                        self.logger.info(f"Found Filmora executable: {path}")
                        return path
            
            # Try registry paths
            reg_paths = [
                (winreg.HKEY_CURRENT_USER, "SOFTWARE\\Wondershare\\Filmora"),
                (winreg.HKEY_LOCAL_MACHINE, "SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Wondershare Filmora"),
                (winreg.HKEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Wondershare Filmora")
            ]
            
            for root, subkey in reg_paths:
                try:
                    key = winreg.OpenKey(root, subkey, 0, winreg.KEY_READ)
                    install_location = winreg.QueryValueEx(key, "InstallLocation")[0]
                    winreg.CloseKey(key)
                    exe_path = os.path.join(install_location, "Filmora.exe")
                    if os.path.exists(exe_path):
                        self.logger.info(f"Found Filmora in registry: {exe_path}")
                        return exe_path
                except:
                    continue
            
            # Try common installation paths
            common_paths = [
                "C:\\Program Files\\Wondershare\\Filmora\\Filmora.exe",
                "C:\\Program Files (x86)\\Wondershare\\Filmora\\Filmora.exe",
                os.path.expandvars("%LOCALAPPDATA%\\Wondershare\\Filmora\\Filmora.exe"),
                "C:\\Program Files\\Wondershare\\Filmora X\\Filmora.exe",
                "C:\\Program Files (x86)\\Wondershare\\Filmora X\\Filmora.exe",
                os.path.expandvars("%LOCALAPPDATA%\\Wondershare\\Filmora X\\Filmora.exe")
            ]
            
            for path in common_paths:
                if os.path.exists(path):
                    self.logger.info(f"Found Filmora in common path: {path}")
                    return path
            
            # Search Program Files directories
            program_dirs = [
                "C:\\Program Files", 
                "C:\\Program Files (x86)",
                os.path.expandvars("%LOCALAPPDATA%"),
                os.path.expandvars("%APPDATA%")
            ]
            
            for program_dir in program_dirs:
                self.logger.info(f"Searching in {program_dir}...")
                for root, dirs, files in os.walk(program_dir):
                    if "Filmora.exe" in files:
                        path = os.path.join(root, "Filmora.exe")
                        self.logger.info(f"Found Filmora by search: {path}")
                        return path
            
            self.logger.error("Could not find Filmora installation in any location")
            return None
        except Exception as e:
            self.logger.error(f"Error finding Filmora path: {str(e)}")
            return None
        
    def find_filmora_window(self):
        """Find the Filmora window by title"""
        def callback(hwnd, windows):
            if win32gui.IsWindowVisible(hwnd):
                title = win32gui.GetWindowText(hwnd)
                if any(x in title.lower() for x in ["filmora", "wondershare"]):
                    windows.append(hwnd)
            return True
        
        windows = []
        win32gui.EnumWindows(callback, windows)
        return windows[0] if windows else None
        
    def _calculate_relative_coords(self):
        """Calculate relative coordinates based on window size"""
        if not self.window_rect:
            return
            
        # Get window dimensions
        x, y, right, bottom = self.window_rect
        width = right - x
        height = bottom - y
        
        # Calculate relative positions for UI elements
        self.relative_coords = {
            "file_menu": (width * 0.05, height * 0.05),  # Top-left
            "import_button": (width * 0.1, height * 0.05),  # Next to file menu
            "effects_tab": (width * 0.2, height * 0.05),  # Effects section
            "timeline": (width * 0.5, height * 0.8),  # Bottom center
            "export_button": (width * 0.9, height * 0.05),  # Top-right
            "preview": (width * 0.5, height * 0.4),  # Center
            "properties": (width * 0.9, height * 0.5)  # Right side
        }
        
        self.logger.info("Relative coordinates calculated")
        for name, coords in self.relative_coords.items():
            self.logger.info(f"{name}: {coords}")
            
    def _get_absolute_coords(self, element_name):
        """Convert relative coordinates to absolute screen coordinates"""
        if not self.window_rect or element_name not in self.relative_coords:
            return None
            
        rel_x, rel_y = self.relative_coords[element_name]
        abs_x = self.window_rect[0] + rel_x
        abs_y = self.window_rect[1] + rel_y
        
        return (int(abs_x), int(abs_y))
        
    def maximize_window(self):
        """Ensure Filmora window is maximized"""
        try:
            if not self.window_handle:
                return False
                
            # Get current placement
            placement = win32gui.GetWindowPlacement(self.window_handle)
            
            if placement[1] != win32con.SW_SHOWMAXIMIZED:
                # Maximize window
                win32gui.ShowWindow(self.window_handle, win32con.SW_MAXIMIZE)
                time.sleep(1)  # Wait for maximize animation
                
                # Update window rect
                self.window_rect = win32gui.GetWindowRect(self.window_handle)
                self._calculate_relative_coords()
                
            return True
        except Exception as e:
            self.logger.error(f"Error maximizing window: {e}")
            return False
            
    @retry_operation(max_retries=5, delay=3)
    def start_filmora(self):
        """Launch Filmora and wait for it to be ready"""
        try:
            self.logger.info("Starting Filmora...")
            
            # Find Filmora installation
            filmora_path = self.find_filmora_path()
            if not filmora_path:
                raise Exception("Could not find Filmora installation")
                
            self.logger.info(f"Found Filmora at: {filmora_path}")
            
            # Try to connect to existing instance first
            hwnd = self.find_filmora_window()
            if hwnd:
                try:
                    win32gui.SetForegroundWindow(hwnd)
                    self.app = Application(backend="uia").connect(handle=hwnd)
                    self.logger.info("[+] Connected to existing Filmora instance")
                except:
                    # If connection fails, close existing and start new
                    win32gui.PostMessage(hwnd, win32con.WM_CLOSE, 0, 0)
                    time.sleep(5)
                    hwnd = None
            
            if not hwnd:
                # Launch new instance
                subprocess.Popen([filmora_path])
                time.sleep(15)  # Give more time to initialize
                
                # Try to find the window
                hwnd = self.find_filmora_window()
                if not hwnd:
                    raise Exception("Could not find Filmora window after launch")
                    
                self.app = Application(backend="uia").connect(handle=hwnd)
            
            self.window_handle = hwnd
            self.window_rect = win32gui.GetWindowRect(hwnd)
            
            # Maximize window and calculate coordinates
            if not self.maximize_window():
                raise Exception("Failed to maximize Filmora window")
            
            # Find main window with extended retry
            for attempt in range(10):
                try:
                    self.main_window = self.app.window(title_re=".*(?:Filmora|Wondershare).*")
                    self.main_window.wait('visible', timeout=10)
                    self.main_window.set_focus()
                    break
                except Exception as e:
                    if attempt == 9:
                        raise Exception(f"Could not initialize Filmora window: {str(e)}")
                    time.sleep(3)
            
            self.logger.info("[+] Filmora ready")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to start Filmora: {e}")
            raise

    @retry_operation(max_retries=3, delay=1)
    def click_element_by_name(self, element_name, double=False, right_click=False):
        """Click UI element by its name using relative coordinates"""
        try:
            coords = self._get_absolute_coords(element_name)
            if not coords:
                raise Exception(f"Could not find coordinates for {element_name}")
                
            self.logger.info(f"Clicking {element_name} at {coords}")
            return self.click_element_by_coords(*coords, double, right_click)
            
        except Exception as e:
            self.logger.error(f"Failed to click {element_name}: {e}")
            raise

    @retry_operation(max_retries=3, delay=1)
    def click_element_by_coords(self, x, y, double=False, right_click=False):
        """Click at specific coordinates with more options"""
        try:
            # Ensure window is focused before clicking
            if hasattr(self, 'main_window'):
                self.main_window.set_focus()
            
            if right_click:
                mouse.right_click(coords=(x, y))
            else:
                mouse.click(coords=(x, y))
                if double:
                    time.sleep(0.1)
                    mouse.click(coords=(x, y))
            time.sleep(0.5)
            return True
        except Exception as e:
            self.logger.error(f"Failed to click at ({x}, {y}): {str(e)}")
            raise  # Let retry decorator handle it

    @retry_operation()
    def create_project(self):
        """Create a new project with our parameters"""
        try:
            # Ensure main window is ready
            if hasattr(self, 'main_window'):
                self.main_window.set_focus()
            
            # Try menu first
            try:
                self.click_element_by_name("file_menu")
                time.sleep(1)
                self.click_element_by_name("import_button")
            except Exception as menu_error:
                self.logger.warning(f"Menu method failed: {str(menu_error)}, trying alternative...")
                # Alternative: Try right-click on project area
                self.click_element_by_coords(400, 300, right_click=True)
                time.sleep(1)
                send_keys("n")  # New Project shortcut
                
            time.sleep(2)
            
            # Set project name with timestamp to avoid conflicts
            project_name = f"Birthday_Video_March2022_{int(time.time())}"
            send_keys(project_name)
            send_keys("{ENTER}")
            time.sleep(2)
            
            self.logger.info(f"[+] Created new project: {project_name}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to create project: {str(e)}")
            raise  # Let retry decorator handle it

    @retry_operation(max_retries=4, delay=2)
    def import_videos(self):
        """Import videos sorted by size"""
        try:
            # Specific video files to process
            target_videos = [
                "F:\\Birthday_Video_Project\\Activities\\Activities_20220328_134041.mp4"  # Focus on the 41.mp4 video
            ]
            
            # Verify all videos exist before starting
            for video_path in target_videos:
                if not os.path.exists(video_path):
                    raise FileNotFoundError(f"Missing video file: {video_path}")
                else:
                    size = os.path.getsize(video_path)
                    self.logger.info(f"Found video: {os.path.basename(video_path)} ({size/1024/1024:.2f} MB)")
            
            # Try different import methods with more reliable coordinates
            import_methods = [
                # Method 1: Import button (top toolbar)
                lambda: self.click_element_by_name("import_button"),
                # Method 2: File menu -> Import
                lambda: (self.click_element_by_name("file_menu"), 
                        time.sleep(1),
                        self.click_element_by_name("import_button")),
                # Method 3: Media button
                lambda: self.click_element_by_name("effects_tab"),
                # Method 4: Keyboard shortcut
                lambda: send_keys("^i"),
                # Method 5: Right-click menu in timeline
                lambda: (self.click_element_by_coords(400, 300, right_click=True),
                        time.sleep(1),
                        send_keys("i"))
            ]
            
            # Try each import method until one works
            import_success = False
            for i, method in enumerate(import_methods, 1):
                try:
                    self.logger.info(f"Trying import method {i}/{len(import_methods)}...")
                    method()
                    time.sleep(2)
                    import_success = True
                    break
                except Exception as e:
                    self.logger.warning(f"Import method {i} failed: {str(e)}")
                    continue
            
            if not import_success:
                raise Exception("All import methods failed")
            
            # Import each video
            for video_path in target_videos:
                # Clear any existing text
                send_keys("^a")
                send_keys("{DELETE}")
                time.sleep(0.5)
                
                # Type path and press Enter
                for char in video_path:
                    send_keys(char)
                    time.sleep(0.05)  # Slow down typing to ensure accuracy
                
                send_keys("{ENTER}")
                time.sleep(5)  # Wait for import
                
                size = os.path.getsize(video_path)
                self.logger.info(f"[+] Imported {os.path.basename(video_path)} ({size/1024/1024:.2f} MB)")
            
            # Verify imports by checking timeline
            time.sleep(2)
            self.click_element_by_coords(400, 500)  # Click timeline area
            send_keys("^a")  # Select all clips
            
            self.logger.info("[+] Successfully imported all videos")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to import videos: {str(e)}")
            raise  # Let retry decorator handle it

    @retry_operation(max_retries=4, delay=2)
    def apply_creative_effects(self):
        """Apply effects based on our parameters"""
        try:
            if not self.unhinged_mode:
                return True
                
            # Ensure window is focused and maximized
            if not self.maximize_window():
                raise Exception("Failed to maximize window for effects")
                
            # Try different methods to access effects
            effect_methods = [
                # Method 1: Effects tab
                lambda: (self.click_element_by_name("effects_tab"),
                        time.sleep(1)),
                # Method 2: Keyboard navigation
                lambda: (send_keys("{TAB}{TAB}{TAB}{ENTER}"),
                        time.sleep(1)),
                # Method 3: Right-click menu
                lambda: (self.click_element_by_coords(400, 300, right_click=True),
                        time.sleep(1),
                        send_keys("e"))
            ]
            
            # Try each method until one works
            effect_success = False
            for i, method in enumerate(effect_methods, 1):
                try:
                    self.logger.info(f"Trying effect method {i}/{len(effect_methods)}...")
                    method()
                    effect_success = True
                    break
                except Exception as e:
                    self.logger.warning(f"Effect method {i} failed: {e}")
                    continue
            
            if not effect_success:
                raise Exception("All effect methods failed")
            
            # Apply effects at various positions relative to window size
            effect_positions = [
                (0.3, 0.2),  # Top effect
                (0.3, 0.4),  # Middle effect
                (0.3, 0.6)   # Bottom effect
            ]
            
            for rel_x, rel_y in effect_positions:
                x = int(self.window_rect[0] + (self.window_rect[2] - self.window_rect[0]) * rel_x)
                y = int(self.window_rect[1] + (self.window_rect[3] - self.window_rect[1]) * rel_y)
                self.click_element_by_coords(x, y, double=True)
                time.sleep(1)
                send_keys("{ENTER}")  # Confirm effect
                time.sleep(1)
            
            # Similar process for transitions with relative coordinates
            transition_methods = [
                lambda: self.click_element_by_name("effects_tab"),
                lambda: send_keys("^t"),
                lambda: (self.click_element_by_coords(400, 300, right_click=True),
                        time.sleep(1),
                        send_keys("t"))
            ]
            
            transition_success = False
            for i, method in enumerate(transition_methods, 1):
                try:
                    self.logger.info(f"Trying transition method {i}/{len(transition_methods)}...")
                    method()
                    transition_success = True
                    break
                except Exception as e:
                    self.logger.warning(f"Transition method {i} failed: {e}")
                    continue
            
            if not transition_success:
                self.logger.warning("All transition methods failed, continuing without transitions")
            else:
                # Apply transitions with relative coordinates
                transition_positions = [
                    (0.35, 0.2),  # Top transition
                    (0.35, 0.4),  # Middle transition
                    (0.35, 0.6)   # Bottom transition
                ]
                
                for rel_x, rel_y in transition_positions:
                    x = int(self.window_rect[0] + (self.window_rect[2] - self.window_rect[0]) * rel_x)
                    y = int(self.window_rect[1] + (self.window_rect[3] - self.window_rect[1]) * rel_y)
                    self.click_element_by_coords(x, y, double=True)
                    time.sleep(1)
                    send_keys("{ENTER}")  # Confirm transition
                    time.sleep(1)
            
            self.logger.info("[+] Applied creative effects")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to apply effects: {e}")
            raise

    def adjust_clip_durations(self):
        """Adjust clips to meet our duration parameters"""
        try:
            # Ensure window is focused and maximized
            if not self.maximize_window():
                raise Exception("Failed to maximize window for duration adjustment")
            
            # Click timeline area using relative coordinates
            self.click_element_by_name("timeline")
            time.sleep(1)
            
            # Select all clips
            send_keys("^a")
            time.sleep(1)
            
            # Try different methods to open properties
            property_methods = [
                lambda: self.click_element_by_name("properties"),
                lambda: send_keys("^p"),
                lambda: (self.click_element_by_coords(400, 300, right_click=True),
                        time.sleep(1),
                        send_keys("p"))
            ]
            
            property_success = False
            for i, method in enumerate(property_methods, 1):
                try:
                    self.logger.info(f"Trying property method {i}/{len(property_methods)}...")
                    method()
                    property_success = True
                    break
                except Exception as e:
                    self.logger.warning(f"Property method {i} failed: {e}")
                    continue
            
            if not property_success:
                raise Exception("Could not access clip properties")
            
            time.sleep(1)
            
            # Set duration limits
            send_keys(str(self.max_duration))
            send_keys("{TAB}")
            send_keys(str(self.min_duration))
            send_keys("{ENTER}")
            
            self.logger.info("[+] Adjusted clip durations")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to adjust durations: {e}")
            raise

    @retry_operation(max_retries=3, delay=5)  # Longer delay for export operations
    def export_video(self):
        """Export the final video"""
        try:
            # Ensure window is focused and maximized
            if not self.maximize_window():
                raise Exception("Failed to maximize window for export")
            
            # Try different export methods with relative coordinates
            export_methods = [
                lambda: self.click_element_by_name("export_button"),
                lambda: send_keys("^e"),
                lambda: (self.click_element_by_coords(400, 300, right_click=True),
                        time.sleep(1),
                        send_keys("e"))
            ]
            
            export_success = False
            for i, method in enumerate(export_methods, 1):
                try:
                    self.logger.info(f"Trying export method {i}/{len(export_methods)}...")
                    method()
                    export_success = True
                    break
                except Exception as e:
                    self.logger.warning(f"Export method {i} failed: {e}")
                    continue
            
            if not export_success:
                raise Exception("All export methods failed")
            
            time.sleep(2)
            
            # Set output path with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = os.path.join(self.output_dir, f"Birthday_Video_Final_{timestamp}.mp4")
            
            # Clear any existing text
            send_keys("^a")
            send_keys("{DELETE}")
            time.sleep(0.5)
            
            # Type path and navigate to quality settings
            for char in output_path:
                send_keys(char)
                time.sleep(0.05)
            
            send_keys("{TAB}")
            time.sleep(0.5)
            
            # Navigate to and set quality
            for _ in range(3):
                send_keys("{TAB}")
                time.sleep(0.5)
            send_keys("Best")
            send_keys("{ENTER}")
            
            # Start export and monitor progress
            start_time = time.time()
            export_timeout = 7200  # 2 hours
            
            while time.time() - start_time < export_timeout:
                try:
                    # Check for progress window
                    progress_hwnd = win32gui.FindWindow(None, "Export Progress")
                    if not progress_hwnd:
                        # Verify if export completed
                        time.sleep(5)
                        if os.path.exists(output_path):
                            file_size = os.path.getsize(output_path)
                            if file_size > 0:
                                self.logger.info(f"[+] Export completed: {output_path} ({file_size/1024/1024:.2f} MB)")
                                return True
                except Exception as e:
                    self.logger.warning(f"Error checking export progress: {e}")
                
                time.sleep(5)
            
            raise Exception(f"Export timed out after {export_timeout/3600:.1f} hours")
            
        except Exception as e:
            self.logger.error(f"Failed to export video: {e}")
            raise

    def close(self):
        """Close Filmora"""
        try:
            # Try to save project first
            save_methods = [
                lambda: send_keys("^s"),
                lambda: (self.click_element_by_name("file_menu"),  # File menu
                        time.sleep(1),
                        self.click_element_by_coords(50, 120)),  # Save
                lambda: (self.click_element_by_coords(400, 300, right_click=True),
                        time.sleep(1),
                        send_keys("s"))
            ]
            
            for method in save_methods:
                try:
                    method()
                    time.sleep(2)
                    break
                except:
                    continue
            
            # Try different close methods
            close_methods = [
                lambda: send_keys("%{F4}"),
                lambda: (hwnd := self.find_filmora_window()) and win32gui.PostMessage(hwnd, win32con.WM_CLOSE, 0, 0),
                lambda: os.system("taskkill /f /im Filmora.exe")
            ]
            
            for method in close_methods:
                try:
                    method()
                    time.sleep(2)
                    if not self.find_filmora_window():
                        break
                except:
                    continue
                    
            self.logger.info("[+] Closed Filmora")
        except Exception as e:
            self.logger.error(f"Error closing Filmora: {str(e)}")

    def process_videos(self):
        """Main processing function with enhanced crash recovery"""
        try:
            # Store progress in a simple file
            progress_file = "filmora_progress.txt"
            last_completed_step = ""
            if os.path.exists(progress_file):
                with open(progress_file, "r") as f:
                    last_completed_step = f.read().strip()
                    self.logger.info(f"Resuming from step: {last_completed_step}")

            steps = [
                (self.start_filmora, "Starting Filmora"),
                (self.create_project, "Creating project"),
                (self.import_videos, "Importing videos"),
                (self.apply_creative_effects, "Applying effects"),
                (self.adjust_clip_durations, "Adjusting durations"),
                (self.export_video, "Exporting video")
            ]
            
            # Find where to resume
            start_index = 0
            if last_completed_step:
                for i, (_, step_name) in enumerate(steps):
                    if step_name == last_completed_step:
                        start_index = i + 1
                        break

            # Process each step with enhanced crash handling
            for i in range(start_index, len(steps)):
                step_func, step_name = steps[i]
                self.logger.info(f"\nStarting: {step_name}")
                retry_count = 0
                success = False
                
                while retry_count < 3 and not success:
                    try:
                        # Wrap the step execution with crash monitoring
                        if self._operation_wrapper(
                            lambda: step_func(), 
                            step_name
                        ):
                            self.logger.info(f"[+] Completed: {step_name}")
                            with open(progress_file, "w") as f:
                                f.write(step_name)
                            success = True
                        else:
                            raise Exception(f"Step returned False: {step_name}")
                            
                    except Exception as e:
                        retry_count += 1
                        crash_info = self._log_crash(e, step_name)
                        
                        if retry_count < 3:
                            self.logger.warning(f"Retrying {step_name} (attempt {retry_count + 1}/3)")
                            # Add recovery attempt based on crash type
                            if crash_info and crash_info.get("probable_cause"):
                                self.logger.info(f"Attempting recovery: {self._get_recovery_suggestion(crash_info)}")
                            time.sleep(5)
                        else:
                            self.logger.error(f"Failed to complete {step_name} after 3 attempts")
                            return False
                
                time.sleep(3)
            
            if os.path.exists(progress_file):
                os.remove(progress_file)
            
            return True
            
        except Exception as e:
            self._log_crash(e, "process_videos")
            return False
        finally:
            try:
                self.close()
            except:
                pass

if __name__ == "__main__":
    controller = None
    try:
        controller = FilmoraController()
        print("Neuro Filmora Controller Initialized")
        print("===================================")
        if not controller.process_videos():
            sys.exit(1)
    except KeyboardInterrupt:
        print("\nProcess interrupted by user. Cleaning up...")
        if controller:
            try:
                controller.close()
            except:
                pass
        sys.exit(0)
    except Exception as e:
        if controller:
            controller._log_crash(e, "main")
        print(f"Fatal error: {str(e)}")
        sys.exit(1) 