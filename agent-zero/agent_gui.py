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
                            QFileDialog)
from PyQt6.QtCore import Qt, pyqtSignal, QSize, QThread
from PyQt6.QtGui import QIcon, QPalette, QColor, QPixmap
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup

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
    'KNOWLEDGE': 'knowledge'
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

class AgentGUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.current_model = None
        self.current_mode = MODES['CHAT']
        self.web_search_thread = None
        self.image_gen_thread = None
        self.init_ui()
        
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
        buttons = [
            ("🤖 Chat Mode", self.switch_to_chat),
            ("🎨 Image Generation", self.switch_to_image_gen),
            ("📝 Code Assistant", self.switch_to_code),
            ("🔍 Research Mode", self.switch_to_research),
            ("📊 Data Analysis", self.switch_to_data),
            ("🌐 Web Search", self.switch_to_web),
            ("📚 Knowledge Base", self.switch_to_knowledge)
        ]
        
        for text, callback in buttons:
            btn = SideButton(text)
            btn.clicked.connect(callback)
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
        text = self.input_field.toPlainText().strip()
        if not text:
            return
            
        self.chat_display.append(f"You: {text}")
        self.input_field.clear()
        
        try:
            if not self.current_model:
                self.initialize_gemini()
                if not self.current_model:
                    return

            if self.current_mode == MODES['WEB']:
                self.perform_web_search(text)
            elif self.current_mode == MODES['IMAGE']:
                self.generate_image(text)
            elif self.current_mode == MODES['CODE']:
                self.handle_code_request(text)
            elif self.current_mode == MODES['RESEARCH']:
                self.perform_research(text)
            else:
                response = self.current_model.generate_content(text)
                self.chat_display.append(f"Agent Zero: {response.text}\n")
            
        except Exception as e:
            self.chat_display.append(f"Error: {str(e)}\n")
            if "404" in str(e):
                self.chat_display.append("Attempting to reinitialize with correct model...\n")
                self.initialize_gemini()

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