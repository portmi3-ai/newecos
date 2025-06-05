import sys
import os
import json
import webbrowser
import requests
from PIL import Image
from io import BytesIO
import pyautogui
import keyboard
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout,
                            QHBoxLayout, QPushButton, QTextEdit, QLabel,
                            QLineEdit, QMessageBox, QDialog, QFormLayout,
                            QSpinBox, QComboBox, QFrame, QScrollArea,
                            QFileDialog, QCheckBox)
from PyQt6.QtCore import Qt, pyqtSignal, QSize, QThread
from PyQt6.QtGui import QIcon, QPalette, QColor, QPixmap
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import keyring
import base64
from cryptography.fernet import Fernet
import getpass
from datetime import datetime

# Default model settings
DEFAULT_MODEL = "gemini-1.5-pro-latest"
AVAILABLE_MODELS = [
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro",
    "gemini-pro-vision"
]

# Mode settings
MODES = {
    'CHAT': 'chat',
    'IMAGE': 'image',
    'CODE': 'code',
    'RESEARCH': 'research',
    'DATA': 'data',
    'WEB': 'web',
    'KNOWLEDGE': 'knowledge',
    'SASHA': 'sasha'  # New Sasha mode
}

class APIConfigDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("API Configuration")
        self.setMinimumWidth(400)
        
        layout = QFormLayout()
        
        # Gemini API Key
        self.api_key_input = QLineEdit()
        self.api_key_input.setEchoMode(QLineEdit.EchoMode.Password)
        layout.addRow("Gemini API Key:", self.api_key_input)
        
        # Model Selection
        self.model_combo = QComboBox()
        self.model_combo.addItems(AVAILABLE_MODELS)
        layout.addRow("Model:", self.model_combo)
        
        # Temperature
        self.temp_spin = QSpinBox()
        self.temp_spin.setRange(0, 100)
        self.temp_spin.setValue(70)
        layout.addRow("Temperature (0-100):", self.temp_spin)
        
        # Buttons
        button_box = QHBoxLayout()
        save_btn = QPushButton("Save")
        cancel_btn = QPushButton("Cancel")
        
        save_btn.clicked.connect(self.accept)
        cancel_btn.clicked.connect(self.reject)
        
        button_box.addWidget(save_btn)
        button_box.addWidget(cancel_btn)
        layout.addRow("", button_box)
        
        self.setLayout(layout)
        
        # Load current settings
        self.load_current_settings()
    
    def load_current_settings(self):
        load_dotenv()
        api_key = os.getenv('GEMINI_API_KEY', '')
        self.api_key_input.setText(api_key)
        
        model = os.getenv('GEMINI_MODEL', DEFAULT_MODEL)
        index = self.model_combo.findText(model)
        if index >= 0:
            self.model_combo.setCurrentIndex(index)
        
        temp = int(float(os.getenv('GEMINI_TEMPERATURE', '0.7')) * 100)
        self.temp_spin.setValue(temp)
    
    def save_settings(self):
        env_path = Path('.env')
        
        # Read existing contents
        if env_path.exists():
            with open(env_path, 'r') as f:
                lines = f.readlines()
        else:
            lines = []
        
        # Update or add new settings
        settings = {
            'GEMINI_API_KEY': self.api_key_input.text(),
            'GEMINI_MODEL': self.model_combo.currentText(),
            'GEMINI_TEMPERATURE': str(self.temp_spin.value() / 100)
        }
        
        new_lines = []
        for line in lines:
            key = line.split('=')[0].strip() if '=' in line else ''
            if key not in settings:
                new_lines.append(line)
        
        for key, value in settings.items():
            new_lines.append(f'{key}={value}\n')
        
        # Write back to file
        with open(env_path, 'w') as f:
            f.writelines(new_lines)
        
        # Update Gemini configuration
        genai.configure(api_key=settings['GEMINI_API_KEY'])
        return settings

class SideButton(QPushButton):
    def __init__(self, text, parent=None):
        super().__init__(text, parent)
        self.setMinimumSize(QSize(150, 40))
        self.setStyleSheet("""
            QPushButton {
                background-color: #2b2b2b;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 10px;
                text-align: left;
                margin: 2px;
            }
            QPushButton:hover {
                background-color: #3b3b3b;
            }
            QPushButton:pressed {
                background-color: #404040;
            }
        """)

class WebSearchThread(QThread):
    finished = pyqtSignal(str)
    error = pyqtSignal(str)
    
    def __init__(self, query):
        super().__init__()
        self.query = query
    
    def run(self):
        try:
            # Use DuckDuckGo API for web search
            url = f"https://api.duckduckgo.com/?q={self.query}&format=json"
            response = requests.get(url)
            data = response.json()
            
            results = []
            if 'AbstractText' in data and data['AbstractText']:
                results.append(f"Summary: {data['AbstractText']}\n")
            
            if 'RelatedTopics' in data:
                for topic in data['RelatedTopics'][:5]:
                    if 'Text' in topic:
                        results.append(f"- {topic['Text']}")
            
            if results:
                self.finished.emit("\n".join(results))
            else:
                self.finished.emit("No results found.")
        except Exception as e:
            self.error.emit(f"Search error: {str(e)}")

class ImageGenerationThread(QThread):
    finished = pyqtSignal(str)
    error = pyqtSignal(str)
    
    def __init__(self, prompt, model):
        super().__init__()
        self.prompt = prompt
        self.model = model
    
    def run(self):
        try:
            response = self.model.generate_content(
                self.prompt,
                generation_config={"temperature": 0.9}
            )
            self.finished.emit(response.text)
        except Exception as e:
            self.error.emit(f"Image generation error: {str(e)}")

class CredentialManager:
    def __init__(self):
        self.key = self._get_or_create_key()
        self.fernet = Fernet(self.key)
        self.credentials = self._load_credentials()
    
    def _get_or_create_key(self):
        key = keyring.get_password("sasha", "encryption_key")
        if not key:
            key = Fernet.generate_key()
            keyring.set_password("sasha", "encryption_key", key.decode())
        return key
    
    def _load_credentials(self):
        try:
            creds = keyring.get_password("sasha", "credentials")
            if creds:
                return json.loads(self.fernet.decrypt(creds.encode()).decode())
            return {}
        except:
            return {}
    
    def _save_credentials(self):
        encrypted = self.fernet.encrypt(json.dumps(self.credentials).encode())
        keyring.set_password("sasha", "credentials", encrypted.decode())
    
    def save_credential(self, service, username, password):
        if service not in self.credentials:
            self.credentials[service] = {}
        self.credentials[service][username] = password
        self._save_credentials()
    
    def get_credential(self, service, username):
        return self.credentials.get(service, {}).get(username)
    
    def list_services(self):
        return list(self.credentials.keys())
    
    def list_usernames(self, service):
        return list(self.credentials.get(service, {}).keys())

class CredentialDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Save Credentials")
        self.setMinimumWidth(400)
        
        layout = QFormLayout()
        
        self.service_input = QLineEdit()
        layout.addRow("Service:", self.service_input)
        
        self.username_input = QLineEdit()
        layout.addRow("Username:", self.username_input)
        
        self.password_input = QLineEdit()
        self.password_input.setEchoMode(QLineEdit.EchoMode.Password)
        layout.addRow("Password:", self.password_input)
        
        self.save_checkbox = QCheckBox("Save for future use")
        self.save_checkbox.setChecked(True)
        layout.addRow("", self.save_checkbox)
        
        button_box = QHBoxLayout()
        save_btn = QPushButton("Save")
        cancel_btn = QPushButton("Cancel")
        
        save_btn.clicked.connect(self.accept)
        cancel_btn.clicked.connect(self.reject)
        
        button_box.addWidget(save_btn)
        button_box.addWidget(cancel_btn)
        layout.addRow("", button_box)
        
        self.setLayout(layout)

class WebAutomationThread(QThread):
    finished = pyqtSignal(str)
    error = pyqtSignal(str)
    credential_request = pyqtSignal(str, str, str)  # service, username, password
    screenshot_ready = pyqtSignal(str)  # path to screenshot
    
    def __init__(self, url, action, credentials=None, options=None):
        super().__init__()
        self.url = url
        self.action = action
        self.credentials = credentials
        self.options = options or {}
        self.driver = None
    
    def run(self):
        try:
            options = webdriver.ChromeOptions()
            if not self.options.get('show_browser', False):
                options.add_argument('--headless')
            options.add_argument('--disable-gpu')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            
            # Add user agent
            options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            
            self.driver = webdriver.Chrome(options=options)
            self.driver.set_window_size(1920, 1080)
            
            self.driver.get(self.url)
            
            if self.action == "login" and self.credentials:
                self._handle_login()
            elif self.action == "scrape":
                self._handle_scrape()
            elif self.action == "screenshot":
                self._handle_screenshot()
            elif self.action == "fill_form":
                self._handle_form_fill()
            
            self.driver.quit()
        except Exception as e:
            self.error.emit(str(e))
            if self.driver:
                self.driver.quit()
    
    def _handle_login(self):
        try:
            # Wait for username field
            username_field = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text'], input[type='email'], input[name*='user'], input[name*='email']"))
            )
            username_field.clear()
            username_field.send_keys(self.credentials['username'])
            
            # Find and fill password field
            password_field = self.driver.find_element(By.CSS_SELECTOR, "input[type='password'], input[name*='pass']")
            password_field.clear()
            password_field.send_keys(self.credentials['password'])
            
            # Find and click submit button
            submit_button = self.driver.find_element(By.CSS_SELECTOR, 
                "button[type='submit'], input[type='submit'], button:contains('Login'), button:contains('Sign in')")
            submit_button.click()
            
            # Wait for login to complete
            WebDriverWait(self.driver, 10).until(
                EC.url_changes(self.url)
            )
            
            # Take screenshot after login
            screenshot_path = self._take_screenshot("login_success")
            self.screenshot_ready.emit(screenshot_path)
            
            self.finished.emit("Successfully logged in")
        except Exception as e:
            screenshot_path = self._take_screenshot("login_error")
            self.screenshot_ready.emit(screenshot_path)
            self.error.emit(f"Login failed: {str(e)}")
    
    def _handle_scrape(self):
        try:
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Get page content
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            
            # Extract text content
            text_content = soup.get_text(separator='\n', strip=True)
            
            # Extract links
            links = [a.get('href') for a in soup.find_all('a', href=True)]
            
            # Extract images
            images = [img.get('src') for img in soup.find_all('img', src=True)]
            
            result = {
                'text': text_content,
                'links': links,
                'images': images,
                'title': soup.title.string if soup.title else 'No title'
            }
            
            self.finished.emit(json.dumps(result, indent=2))
        except Exception as e:
            self.error.emit(f"Scraping failed: {str(e)}")
    
    def _handle_screenshot(self):
        try:
            screenshot_path = self._take_screenshot("page")
            self.screenshot_ready.emit(screenshot_path)
            self.finished.emit(f"Screenshot saved to {screenshot_path}")
        except Exception as e:
            self.error.emit(f"Screenshot failed: {str(e)}")
    
    def _handle_form_fill(self):
        try:
            form_data = self.options.get('form_data', {})
            for field_name, value in form_data.items():
                # Try different selectors to find the field
                selectors = [
                    f"input[name='{field_name}']",
                    f"input[id='{field_name}']",
                    f"textarea[name='{field_name}']",
                    f"textarea[id='{field_name}']"
                ]
                
                for selector in selectors:
                    try:
                        element = WebDriverWait(self.driver, 5).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                        )
                        element.clear()
                        element.send_keys(value)
                        break
                    except:
                        continue
            
            if self.options.get('submit', True):
                submit_button = self.driver.find_element(By.CSS_SELECTOR, 
                    "button[type='submit'], input[type='submit']")
                submit_button.click()
            
            self.finished.emit("Form filled successfully")
        except Exception as e:
            self.error.emit(f"Form filling failed: {str(e)}")
    
    def _take_screenshot(self, prefix):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{prefix}_{timestamp}.png"
        path = os.path.join("screenshots", filename)
        os.makedirs("screenshots", exist_ok=True)
        self.driver.save_screenshot(path)
        return path

class AgentIntegrations:
    def __init__(self):
        # Initialize any necessary integrations
        pass

    def search_github(self, query, language="python"):
        # Implement GitHub search logic
        pass

    def search_huggingface(self, query):
        # Implement Hugging Face search logic
        pass

    def download_huggingface_model(self, model_id):
        # Implement Hugging Face model download logic
        pass

    def integrate_code(self, url, target_path):
        # Implement code integration logic
        pass

    def get_integration_status(self):
        # Implement integration status logic
        pass

class AgentGUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.current_model = None
        self.current_mode = MODES['CHAT']
        self.web_search_thread = None
        self.image_gen_thread = None
        self.web_automation_thread = None
        self.credential_manager = CredentialManager()
        self.agent_integrations = AgentIntegrations()
        self.init_ui()
        
        # Create screenshots directory
        os.makedirs("screenshots", exist_ok=True)
    
    def init_ui(self):
        self.setWindowTitle('Agent Zero')
        self.setMinimumSize(1000, 600)
        
        # Main widget and layout
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        main_layout = QHBoxLayout(main_widget)
        
        # Side panel
        side_panel = QWidget()
        side_panel.setMaximumWidth(200)
        side_panel.setStyleSheet("background-color: #1e1e1e;")
        side_layout = QVBoxLayout(side_panel)
        side_layout.setSpacing(5)
        side_layout.setContentsMargins(10, 10, 10, 10)
        
        # Side buttons
        self.create_side_buttons(side_layout)
        
        # Add stretch to push buttons to top
        side_layout.addStretch()
        
        # Settings button at bottom
        settings_btn = SideButton("⚙️ Settings")
        settings_btn.clicked.connect(self.show_settings)
        side_layout.addWidget(settings_btn)
        
        # Main content area
        content_widget = QWidget()
        content_layout = QVBoxLayout(content_widget)
        
        # Chat display
        self.chat_display = QTextEdit()
        self.chat_display.setReadOnly(True)
        content_layout.addWidget(self.chat_display)
        
        # Input area
        input_layout = QHBoxLayout()
        self.input_field = QTextEdit()
        self.input_field.setMaximumHeight(100)
        send_button = QPushButton("Send")
        send_button.clicked.connect(self.send_message)
        input_layout.addWidget(self.input_field)
        input_layout.addWidget(send_button)
        content_layout.addLayout(input_layout)
        
        # Add panels to main layout
        main_layout.addWidget(side_panel)
        main_layout.addWidget(content_widget)
        
        # Initialize Gemini
        self.initialize_gemini()
        
        self.show()
    
    def create_side_buttons(self, layout):
        # Create buttons for each mode
        for mode, mode_id in MODES.items():
            btn = SideButton(f"🤖 {mode}")
            if mode_id == 'chat':
                btn.clicked.connect(self.switch_to_chat)
            elif mode_id == 'image':
                btn.clicked.connect(self.switch_to_image_gen)
            elif mode_id == 'code':
                btn.clicked.connect(self.switch_to_code)
            elif mode_id == 'research':
                btn.clicked.connect(self.switch_to_research)
            elif mode_id == 'data':
                btn.clicked.connect(self.switch_to_data)
            elif mode_id == 'web':
                btn.clicked.connect(self.switch_to_web)
            elif mode_id == 'knowledge':
                btn.clicked.connect(self.switch_to_knowledge)
            elif mode_id == 'sasha':
                btn.clicked.connect(self.switch_to_sasha)
            layout.addWidget(btn)
    
    def initialize_gemini(self):
        try:
            load_dotenv()
            api_key = os.getenv('GEMINI_API_KEY')
            model_name = os.getenv('GEMINI_MODEL', DEFAULT_MODEL)
            
            if not api_key:
                self.show_settings()
                return
            
            genai.configure(api_key=api_key)
            self.current_model = genai.GenerativeModel(model_name)
            
            # Test the connection
            response = self.current_model.generate_content("Test connection")
            if response:
                self.chat_display.append("Agent Zero initialized successfully!\n")
            
        except Exception as e:
            self.chat_display.append(f"Error initializing Gemini: {str(e)}\n")
            self.show_settings()
    
    def show_settings(self):
        dialog = APIConfigDialog(self)
        if dialog.exec():
            settings = dialog.save_settings()
            try:
                self.current_model = genai.GenerativeModel(settings['GEMINI_MODEL'])
                QMessageBox.information(self, "Success", "API settings updated successfully!")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Could not initialize model: {str(e)}")
    
    def send_message(self):
        message = self.input_field.text().strip()
        if not message:
            return

        self.chat_display.append(f"\n👤 You: {message}\n")
        self.input_field.clear()

        if self.current_mode == MODES['SASHA']:
            self.handle_sasha_command(message)
        elif self.current_mode == MODES['CHAT']:
            try:
                if self.current_model:
                    response = self.current_model.generate_content(
                        message,
                        generation_config={"temperature": 0.7}
                    )
                    self.chat_display.append(f"\n🤖 Assistant: {response.text}\n")
                else:
                    self.chat_display.append("\n⚠️ Error: Model not initialized. Please check your API settings.\n")
            except Exception as e:
                self.chat_display.append(f"\n⚠️ Error: {str(e)}\n")
        elif self.current_mode == MODES['WEB']:
            self.perform_web_search(message)
        elif self.current_mode == MODES['IMAGE']:
            self.generate_image(message)
        elif self.current_mode == MODES['CODE']:
            self.handle_code_request(message)
        elif self.current_mode == MODES['RESEARCH']:
            self.perform_research(message)

    def perform_web_search(self, query):
        self.web_search_thread = WebSearchThread(query)
        self.web_search_thread.finished.connect(self.handle_search_results)
        self.web_search_thread.error.connect(lambda e: self.chat_display.append(f"{e}\n"))
        self.web_search_thread.start()
        
        # Also open in default browser
        webbrowser.open(f"https://www.google.com/search?q={query}")

    def handle_search_results(self, results):
        self.chat_display.append("Search Results:\n")
        self.chat_display.append(results + "\n")

    def generate_image(self, prompt):
        self.image_gen_thread = ImageGenerationThread(prompt, self.current_model)
        self.image_gen_thread.finished.connect(self.handle_image_generation)
        self.image_gen_thread.error.connect(lambda e: self.chat_display.append(f"{e}\n"))
        self.image_gen_thread.start()

    def handle_image_generation(self, result):
        self.chat_display.append("Image Generation Result:\n")
        self.chat_display.append(result + "\n")

    def handle_code_request(self, prompt):
        try:
            # Add programming context to the prompt
            enhanced_prompt = f"As a code assistant, please help with: {prompt}\nProvide code with explanations."
            response = self.current_model.generate_content(enhanced_prompt)
            self.chat_display.append(f"Agent Zero (Code Assistant):\n{response.text}\n")
        except Exception as e:
            self.chat_display.append(f"Code generation error: {str(e)}\n")

    def perform_research(self, query):
        try:
            # Combine web search with AI analysis
            self.chat_display.append("Researching...\n")
            
            # Web search
            self.perform_web_search(query)
            
            # AI analysis
            analysis_prompt = f"Please analyze and synthesize information about: {query}"
            response = self.current_model.generate_content(analysis_prompt)
            self.chat_display.append(f"\nAnalysis:\n{response.text}\n")
        except Exception as e:
            self.chat_display.append(f"Research error: {str(e)}\n")

    # Mode switching functions with actual functionality
    def switch_to_chat(self):
        self.current_mode = MODES['CHAT']
        self.chat_display.append("Switched to Chat Mode - Ask me anything!\n")

    def switch_to_image_gen(self):
        self.current_mode = MODES['IMAGE']
        self.chat_display.append("Switched to Image Generation Mode - Describe the image you want to generate!\n")

    def switch_to_code(self):
        self.current_mode = MODES['CODE']
        self.chat_display.append("Switched to Code Assistant Mode - Ask coding questions or request code examples!\n")

    def switch_to_research(self):
        self.current_mode = MODES['RESEARCH']
        self.chat_display.append("Switched to Research Mode - Enter a topic to research!\n")

    def switch_to_data(self):
        self.current_mode = MODES['DATA']
        self.chat_display.append("Switched to Data Analysis Mode - Send data or ask analysis questions!\n")

    def switch_to_web(self):
        self.current_mode = MODES['WEB']
        self.chat_display.append("Switched to Web Search Mode - Enter your search query!\n")

    def switch_to_knowledge(self):
        self.current_mode = MODES['KNOWLEDGE']
        self.chat_display.append("Switched to Knowledge Base Mode - Access and query stored knowledge!\n")

    def switch_to_sasha(self):
        self.current_mode = MODES['SASHA']
        self.chat_display.clear()
        self.chat_display.append("🤖 Sasha Mode Activated\n")
        self.chat_display.append("I am Sasha, your Meta Agent. How can I assist you today?\n")
        self.chat_display.append("Available commands:\n")
        self.chat_display.append("- /help: Show available commands\n")
        self.chat_display.append("- /clear: Clear conversation\n")
        self.chat_display.append("- /mode: Switch between different modes\n")
        self.chat_display.append("- /system: Access system commands\n")
        self.chat_display.append("- /web: Perform web searches\n")
        self.chat_display.append("- /code: Generate or analyze code\n")
        self.chat_display.append("- /image: Generate or analyze images\n")

    def handle_sasha_command(self, command):
        if command.startswith('/'):
            cmd = command[1:].lower()
            if cmd == 'help':
                self.chat_display.append("\nAvailable commands:\n")
                self.chat_display.append("- /help: Show available commands\n")
                self.chat_display.append("- /clear: Clear conversation\n")
                self.chat_display.append("- /mode: Switch between different modes\n")
                self.chat_display.append("- /system: Access system commands\n")
                self.chat_display.append("- /web: Perform web searches\n")
                self.chat_display.append("- /code: Generate or analyze code\n")
                self.chat_display.append("- /image: Generate or analyze images\n")
                self.chat_display.append("- /login [url]: Login to a website\n")
                self.chat_display.append("- /scrape [url]: Scrape website content\n")
                self.chat_display.append("- /screenshot [url]: Take a screenshot\n")
                self.chat_display.append("- /fill [url] [form_data]: Fill a form\n")
                self.chat_display.append("- /credentials: List saved credentials\n")
                self.chat_display.append("- /credentials delete [service]: Delete saved credentials\n")
                self.chat_display.append("- /github search [query]: Search GitHub repositories\n")
                self.chat_display.append("- /github code [query]: Search GitHub code\n")
                self.chat_display.append("- /hf search [query]: Search Hugging Face models\n")
                self.chat_display.append("- /hf download [model_id]: Download a Hugging Face model\n")
                self.chat_display.append("- /integrate [url]: Integrate code from GitHub or Hugging Face\n")
                self.chat_display.append("- /status: Check integration status\n")
            elif cmd.startswith('screenshot'):
                url = command[11:].strip()
                if url:
                    self.handle_screenshot_request(url)
            elif cmd.startswith('fill'):
                parts = command[5:].strip().split(' ', 1)
                if len(parts) == 2:
                    url, form_data = parts
                    try:
                        form_data = json.loads(form_data)
                        self.handle_form_fill_request(url, form_data)
                    except json.JSONDecodeError:
                        self.chat_display.append("\n⚠️ Error: Invalid form data format. Use JSON format.\n")
            elif cmd.startswith('credentials delete'):
                service = command[18:].strip()
                if service:
                    self.delete_credentials(service)
            elif cmd == 'clear':
                self.chat_display.clear()
                self.chat_display.append("🤖 Sasha Mode Activated\n")
            elif cmd == 'mode':
                self.chat_display.append("\nAvailable modes:\n")
                for mode in MODES.keys():
                    self.chat_display.append(f"- {mode}\n")
            elif cmd == 'system':
                self.chat_display.append("\nSystem commands:\n")
                self.chat_display.append("- /system status: Check system status\n")
                self.chat_display.append("- /system update: Update system\n")
                self.chat_display.append("- /system restart: Restart system\n")
            elif cmd.startswith('web'):
                query = command[4:].strip()
                if query:
                    self.perform_web_search(query)
            elif cmd.startswith('code'):
                query = command[5:].strip()
                if query:
                    self.handle_code_request(query)
            elif cmd.startswith('image'):
                query = command[6:].strip()
                if query:
                    self.generate_image(query)
            elif cmd.startswith('login'):
                url = command[6:].strip()
                if url:
                    self.handle_login_request(url)
            elif cmd.startswith('scrape'):
                url = command[7:].strip()
                if url:
                    self.handle_scrape_request(url)
            elif cmd.startswith('github search'):
                query = command[13:].strip()
                if query:
                    self.handle_github_search(query)
            elif cmd.startswith('github code'):
                query = command[11:].strip()
                if query:
                    self.handle_github_code_search(query)
            elif cmd.startswith('hf search'):
                query = command[9:].strip()
                if query:
                    self.handle_hf_search(query)
            elif cmd.startswith('hf download'):
                model_id = command[11:].strip()
                if model_id:
                    self.handle_hf_download(model_id)
            elif cmd.startswith('integrate'):
                url = command[9:].strip()
                if url:
                    self.handle_code_integration(url)
            elif cmd == 'status':
                self.handle_integration_status()
            elif cmd == 'credentials':
                self.list_saved_credentials()
            else:
                self.chat_display.append(f"\nUnknown command: {cmd}\n")
                self.chat_display.append("Type /help for available commands\n")
        else:
            # Handle regular conversation with Sasha
            try:
                if self.current_model:
                    response = self.current_model.generate_content(
                        command,
                        generation_config={"temperature": 0.7}
                    )
                    self.chat_display.append(f"\n🤖 Sasha: {response.text}\n")
                else:
                    self.chat_display.append("\n⚠️ Error: Model not initialized. Please check your API settings.\n")
            except Exception as e:
                self.chat_display.append(f"\n⚠️ Error: {str(e)}\n")

    def handle_login_request(self, url):
        dialog = CredentialDialog(self)
        if dialog.exec():
            service = dialog.service_input.text()
            username = dialog.username_input.text()
            password = dialog.password_input.text()
            
            if dialog.save_checkbox.isChecked():
                self.credential_manager.save_credential(service, username, password)
                self.chat_display.append(f"\n✅ Credentials saved for {service}\n")
            
            self.web_automation_thread = WebAutomationThread(
                url,
                "login",
                {"username": username, "password": password}
            )
            self.web_automation_thread.finished.connect(self.handle_web_automation_result)
            self.web_automation_thread.error.connect(self.handle_web_automation_error)
            self.web_automation_thread.start()
    
    def handle_scrape_request(self, url):
        self.web_automation_thread = WebAutomationThread(url, "scrape")
        self.web_automation_thread.finished.connect(self.handle_web_automation_result)
        self.web_automation_thread.error.connect(self.handle_web_automation_error)
        self.web_automation_thread.start()
    
    def handle_web_automation_result(self, result):
        self.chat_display.append(f"\n🌐 Web Automation Result:\n{result}\n")
    
    def handle_web_automation_error(self, error):
        self.chat_display.append(f"\n⚠️ Web Automation Error: {error}\n")
    
    def list_saved_credentials(self):
        services = self.credential_manager.list_services()
        if not services:
            self.chat_display.append("\nNo saved credentials found.\n")
            return
        
        self.chat_display.append("\nSaved Credentials:\n")
        for service in services:
            usernames = self.credential_manager.list_usernames(service)
            self.chat_display.append(f"\n{service}:\n")
            for username in usernames:
                self.chat_display.append(f"- {username}\n")

    def handle_screenshot_request(self, url):
        self.web_automation_thread = WebAutomationThread(
            url,
            "screenshot",
            options={'show_browser': True}
        )
        self.web_automation_thread.finished.connect(self.handle_web_automation_result)
        self.web_automation_thread.error.connect(self.handle_web_automation_error)
        self.web_automation_thread.screenshot_ready.connect(self.handle_screenshot_ready)
        self.web_automation_thread.start()
    
    def handle_form_fill_request(self, url, form_data):
        self.web_automation_thread = WebAutomationThread(
            url,
            "fill_form",
            options={'form_data': form_data}
        )
        self.web_automation_thread.finished.connect(self.handle_web_automation_result)
        self.web_automation_thread.error.connect(self.handle_web_automation_error)
        self.web_automation_thread.start()
    
    def handle_screenshot_ready(self, path):
        self.chat_display.append(f"\n📸 Screenshot saved: {path}\n")
        # Open the screenshot
        os.startfile(path)
    
    def delete_credentials(self, service):
        if service in self.credential_manager.credentials:
            del self.credential_manager.credentials[service]
            self.credential_manager._save_credentials()
            self.chat_display.append(f"\n✅ Credentials deleted for {service}\n")
        else:
            self.chat_display.append(f"\n⚠️ No credentials found for {service}\n")

    def handle_github_search(self, query):
        try:
            results = self.agent_integrations.search_github(query)
            if results:
                self.chat_display.append("\n🔍 GitHub Search Results:\n")
                for result in results[:5]:  # Show top 5 results
                    self.chat_display.append(f"\nRepository: {result['name']}")
                    self.chat_display.append(f"Description: {result['description']}")
                    self.chat_display.append(f"Stars: {result['stars']}")
                    self.chat_display.append(f"Language: {result['language']}")
                    self.chat_display.append(f"URL: {result['url']}\n")
            else:
                self.chat_display.append("\nNo GitHub repositories found.\n")
        except Exception as e:
            self.chat_display.append(f"\n⚠️ Error searching GitHub: {str(e)}\n")

    def handle_github_code_search(self, query):
        try:
            results = self.agent_integrations.search_github(query, language="python")
            if results:
                self.chat_display.append("\n🔍 GitHub Code Search Results:\n")
                for result in results[:5]:
                    self.chat_display.append(f"\nRepository: {result['name']}")
                    self.chat_display.append(f"Description: {result['description']}")
                    self.chat_display.append(f"URL: {result['url']}\n")
            else:
                self.chat_display.append("\nNo code found.\n")
        except Exception as e:
            self.chat_display.append(f"\n⚠️ Error searching code: {str(e)}\n")

    def handle_hf_search(self, query):
        try:
            results = self.agent_integrations.search_huggingface(query)
            if results:
                self.chat_display.append("\n🤖 Hugging Face Search Results:\n")
                for result in results[:5]:
                    self.chat_display.append(f"\nModel: {result['id']}")
                    self.chat_display.append(f"Task: {result['pipeline_tag']}")
                    self.chat_display.append(f"Downloads: {result['downloads']}")
                    self.chat_display.append(f"Likes: {result['likes']}")
                    self.chat_display.append(f"URL: {result['url']}\n")
            else:
                self.chat_display.append("\nNo models found.\n")
        except Exception as e:
            self.chat_display.append(f"\n⚠️ Error searching Hugging Face: {str(e)}\n")

    def handle_hf_download(self, model_id):
        try:
            self.chat_display.append(f"\n📥 Downloading model: {model_id}\n")
            success = self.agent_integrations.download_huggingface_model(model_id)
            if success:
                self.chat_display.append(f"\n✅ Successfully downloaded model: {model_id}\n")
            else:
                self.chat_display.append(f"\n⚠️ Failed to download model: {model_id}\n")
        except Exception as e:
            self.chat_display.append(f"\n⚠️ Error downloading model: {str(e)}\n")

    def handle_code_integration(self, url):
        try:
            self.chat_display.append(f"\n🔄 Integrating code from: {url}\n")
            target_path = Path("integrated_code")
            success = self.agent_integrations.integrate_code(url, target_path)
            if success:
                self.chat_display.append(f"\n✅ Successfully integrated code to: {target_path}\n")
            else:
                self.chat_display.append(f"\n⚠️ Failed to integrate code from: {url}\n")
        except Exception as e:
            self.chat_display.append(f"\n⚠️ Error integrating code: {str(e)}\n")

    def handle_integration_status(self):
        try:
            status = self.agent_integrations.get_integration_status()
            self.chat_display.append("\n📊 Integration Status:\n")
            
            # GitHub status
            self.chat_display.append("\nGitHub:")
            self.chat_display.append(f"Enabled: {'✅' if status['github']['enabled'] else '❌'}")
            self.chat_display.append(f"Cache Size: {status['github']['cache_size'] / 1024 / 1024:.2f} MB")
            
            # Hugging Face status
            self.chat_display.append("\nHugging Face:")
            self.chat_display.append(f"Enabled: {'✅' if status['huggingface']['enabled'] else '❌'}")
            self.chat_display.append(f"Cache Size: {status['huggingface']['cache_size'] / 1024 / 1024:.2f} MB")
            
            # Gemini status
            self.chat_display.append("\nGemini:")
            self.chat_display.append(f"Enabled: {'✅' if status['gemini']['enabled'] else '❌'}")
            self.chat_display.append(f"Model: {status['gemini']['model']}\n")
            
        except Exception as e:
            self.chat_display.append(f"\n⚠️ Error getting integration status: {str(e)}\n")

def main():
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    
    # Set dark theme
    palette = QPalette()
    palette.setColor(QPalette.ColorRole.Window, QColor(53, 53, 53))
    palette.setColor(QPalette.ColorRole.WindowText, Qt.GlobalColor.white)
    palette.setColor(QPalette.ColorRole.Base, QColor(25, 25, 25))
    palette.setColor(QPalette.ColorRole.AlternateBase, QColor(53, 53, 53))
    palette.setColor(QPalette.ColorRole.ToolTipBase, Qt.GlobalColor.white)
    palette.setColor(QPalette.ColorRole.ToolTipText, Qt.GlobalColor.white)
    palette.setColor(QPalette.ColorRole.Text, Qt.GlobalColor.white)
    palette.setColor(QPalette.ColorRole.Button, QColor(53, 53, 53))
    palette.setColor(QPalette.ColorRole.ButtonText, Qt.GlobalColor.white)
    palette.setColor(QPalette.ColorRole.BrightText, Qt.GlobalColor.red)
    palette.setColor(QPalette.ColorRole.Link, QColor(42, 130, 218))
    palette.setColor(QPalette.ColorRole.Highlight, QColor(42, 130, 218))
    palette.setColor(QPalette.ColorRole.HighlightedText, Qt.GlobalColor.black)
    
    app.setPalette(palette)
    
    ex = AgentGUI()
    sys.exit(app.exec())

if __name__ == '__main__':
    main() 