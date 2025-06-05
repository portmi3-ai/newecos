import time
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import subprocess

# Setup logging
log_file = r"D:\.aGITHUB REPO\Queen\logs\api_key_creation_selenium.log"
logging.basicConfig(filename=log_file, level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

def create_openai_key(email, password):
    driver = webdriver.Chrome()
    try:
        driver.get("https://platform.openai.com/account/api-keys")
        time.sleep(2)
        # Login
        driver.find_element(By.NAME, "email").send_keys(email)
        driver.find_element(By.NAME, "email").send_keys(Keys.RETURN)
        time.sleep(2)
        driver.find_element(By.NAME, "password").send_keys(password)
        driver.find_element(By.NAME, "password").send_keys(Keys.RETURN)
        time.sleep(5)
        # Create new key
        driver.find_element(By.XPATH, "//button[contains(text(),'Create new secret key')]").click()
        time.sleep(2)
        key_elem = driver.find_element(By.XPATH, "//input[@type='text']")
        api_key = key_elem.get_attribute("value")
        logging.info("OpenAI API key created (not logged here for security).")
        # Store in GCP Secret Manager
        subprocess.run([
            "gcloud", "secrets", "create", "OPENAI_API_KEY", "--replication-policy=automatic", "--project", "mp135595"
        ], stderr=subprocess.DEVNULL)
        subprocess.run([
            "gcloud", "secrets", "versions", "add", "OPENAI_API_KEY", "--data-file=-", "--project", "mp135595"
        ], input=api_key.encode(), stderr=subprocess.DEVNULL)
    finally:
        driver.quit()

if __name__ == "__main__":
    email = input("Enter your OpenAI email: ")
    password = input("Enter your OpenAI password: ")
    create_openai_key(email, password)
    print("OpenAI API key created and stored in GCP Secret Manager. Check the log for details.") 