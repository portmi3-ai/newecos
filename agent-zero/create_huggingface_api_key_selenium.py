import time
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import subprocess

# Setup logging
log_file = r"D:\.aGITHUB REPO\Queen\logs\huggingface_api_key_creation_selenium.log"
logging.basicConfig(filename=log_file, level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

def create_huggingface_key(email, password):
    driver = webdriver.Chrome()
    try:
        driver.get("https://huggingface.co/login")
        time.sleep(2)
        # Login
        driver.find_element(By.ID, "username").send_keys(email)
        driver.find_element(By.ID, "password").send_keys(password)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        time.sleep(5)
        # Go to settings/tokens page
        driver.get("https://huggingface.co/settings/tokens")
        time.sleep(3)
        # Create new token
        driver.find_element(By.XPATH, "//button[contains(text(),'New token')]").click()
        time.sleep(2)
        driver.find_element(By.ID, "token-name").send_keys("Sasha Auto Key")
        driver.find_element(By.XPATH, "//button[contains(text(),'Generate')]").click()
        time.sleep(2)
        key_elem = driver.find_element(By.XPATH, "//input[@type='text' and contains(@value,'hf_')]")
        api_key = key_elem.get_attribute("value")
        logging.info("Hugging Face API key created (not logged here for security).")
        # Store in GCP Secret Manager
        subprocess.run([
            "gcloud", "secrets", "create", "HUGGINGFACE_API_KEY", "--replication-policy=automatic", "--project", "mp135595"
        ], stderr=subprocess.DEVNULL)
        subprocess.run([
            "gcloud", "secrets", "versions", "add", "HUGGINGFACE_API_KEY", "--data-file=-", "--project", "mp135595"
        ], input=api_key.encode(), stderr=subprocess.DEVNULL)
    finally:
        driver.quit()

if __name__ == "__main__":
    email = input("Enter your Hugging Face email: ")
    password = input("Enter your Hugging Face password: ")
    create_huggingface_key(email, password)
    print("Hugging Face API key created and stored in GCP Secret Manager. Check the log for details.") 