import logging
import time
import threading
import tkinter as tk
from tkinter import scrolledtext
from voice_chat import initialize_voice_chat
from google_ai_integration import GoogleAIIntegration

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TranscriptGUI:
    def __init__(self, title="Sasha Live Transcript"):
        self.root = tk.Tk()
        self.root.title(title)
        self.text_area = scrolledtext.ScrolledText(self.root, wrap=tk.WORD, width=60, height=20, font=("Consolas", 12))
        self.text_area.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)
        self.text_area.config(state=tk.DISABLED)
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)
        self.closed = False

    def add_message(self, speaker, message):
        self.text_area.config(state=tk.NORMAL)
        self.text_area.insert(tk.END, f"{speaker}: {message}\n")
        self.text_area.see(tk.END)
        self.text_area.config(state=tk.DISABLED)

    def run(self):
        self.root.mainloop()

    def on_close(self):
        self.closed = True
        self.root.destroy()

def main():
    try:
        google_ai = GoogleAIIntegration()
        voice_chat = initialize_voice_chat(google_ai)
        if not voice_chat:
            logger.error("Failed to initialize voice chat")
            return

        gui = TranscriptGUI()

        def handle_response(text: str):
            logger.info(f"Sasha: {text}")
            gui.add_message("You", text)
            # Sasha talks back
            voice_chat.speak(f"You said: {text}")

        # Start GUI in a separate thread
        gui_thread = threading.Thread(target=gui.run, daemon=True)
        gui_thread.start()

        logger.info("Starting Sasha voice chat test with TTS and transcript GUI...")
        logger.info("Press Ctrl+C to exit")
        voice_chat.start_listening(callback=handle_response)

        # Keep the main thread alive until GUI is closed
        while not gui.closed:
            time.sleep(1)

    except KeyboardInterrupt:
        logger.info("\nStopping Sasha voice chat test...")
    except Exception as e:
        logger.error(f"Error during test: {e}")
    finally:
        if 'voice_chat' in locals():
            voice_chat.cleanup()

if __name__ == "__main__":
    main() 