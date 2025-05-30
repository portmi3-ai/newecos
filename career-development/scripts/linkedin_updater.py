"""
LinkedIn Profile Automation Script
Uses Selenium WebDriver to automate LinkedIn profile updates
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import json
import os
from dotenv import load_dotenv
import time
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='linkedin_updates.log'
)

class LinkedInUpdater:
    def __init__(self):
        self.load_config()
        self.setup_driver()
        
    def load_config(self):
        """Load credentials and configuration from .env file"""
        load_dotenv()
        self.email = os.getenv('LINKEDIN_EMAIL')
        self.password = os.getenv('LINKEDIN_PASSWORD')
        
        if not self.email or not self.password:
            raise ValueError("LinkedIn credentials not found in .env file")
            
    def setup_driver(self):
        """Initialize Chrome WebDriver with appropriate options"""
        options = webdriver.ChromeOptions()
        options.add_argument('--start-maximized')
        options.add_argument('--disable-notifications')
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
        
    def login(self):
        """Login to LinkedIn"""
        try:
            self.driver.get('https://www.linkedin.com/login')
            
            # Enter email
            email_field = self.wait.until(
                EC.presence_of_element_located((By.ID, "username"))
            )
            email_field.send_keys(self.email)
            
            # Enter password
            password_field = self.driver.find_element(By.ID, "password")
            password_field.send_keys(self.password)
            
            # Click login button
            login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            login_button.click()
            
            logging.info("Successfully logged in to LinkedIn")
            
        except Exception as e:
            logging.error(f"Login failed: {str(e)}")
            raise
            
    def navigate_to_profile(self):
        """Navigate to profile page"""
        try:
            self.driver.get('https://www.linkedin.com/in/me')
            time.sleep(2)  # Allow profile page to load
            logging.info("Successfully navigated to profile page")
        except Exception as e:
            logging.error(f"Failed to navigate to profile: {str(e)}")
            raise
            
    def update_about_section(self, new_content):
        """Update the About section"""
        try:
            # Click edit button for About section
            about_pencil = self.wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "[aria-label='Edit about']"))
            )
            about_pencil.click()
            
            # Enter new content
            about_field = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[aria-label='Edit summary']"))
            )
            about_field.clear()
            about_field.send_keys(new_content)
            
            # Save changes
            save_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            save_button.click()
            
            logging.info("Successfully updated About section")
            
        except Exception as e:
            logging.error(f"Failed to update About section: {str(e)}")
            raise
            
    def update_experience(self, experience_data):
        """Update or add experience entries"""
        try:
            # Navigate to experience section
            experience_section = self.wait.until(
                EC.presence_of_element_located((By.ID, "experience-section"))
            )
            
            # Click add experience button
            add_button = experience_section.find_element(By.CSS_SELECTOR, "button[aria-label='Add experience']")
            add_button.click()
            
            # Fill in experience details
            title_field = self.wait.until(
                EC.presence_of_element_located((By.ID, "title-typeahead"))
            )
            title_field.send_keys(experience_data['title'])
            
            # Fill other fields...
            
            logging.info("Successfully updated experience section")
            
        except Exception as e:
            logging.error(f"Failed to update experience: {str(e)}")
            raise
            
    def update_skills(self, skills_list):
        """Update skills section"""
        try:
            # Navigate to skills section
            self.driver.get('https://www.linkedin.com/in/me/edit/skills/')
            
            # Add each skill
            for skill in skills_list:
                add_button = self.wait.until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "[aria-label='Add skill']"))
                )
                add_button.click()
                
                skill_field = self.wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "input[aria-label='Add skill']"))
                )
                skill_field.send_keys(skill)
                
                # Select first suggestion
                suggestion = self.wait.until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, ".basic-typeahead__selectable"))
                )
                suggestion.click()
                
            logging.info("Successfully updated skills")
            
        except Exception as e:
            logging.error(f"Failed to update skills: {str(e)}")
            raise
            
    def cleanup(self):
        """Close browser and cleanup"""
        try:
            self.driver.quit()
            logging.info("Browser closed successfully")
        except Exception as e:
            logging.error(f"Failed to close browser: {str(e)}")
            
    def run_update(self, update_data):
        """Main method to run all updates"""
        try:
            self.login()
            self.navigate_to_profile()
            
            if 'about' in update_data:
                self.update_about_section(update_data['about'])
                
            if 'experience' in update_data:
                for exp in update_data['experience']:
                    self.update_experience(exp)
                    
            if 'skills' in update_data:
                self.update_skills(update_data['skills'])
                
            logging.info("All updates completed successfully")
            
        except Exception as e:
            logging.error(f"Update process failed: {str(e)}")
        finally:
            self.cleanup()

if __name__ == "__main__":
    # Example usage
    update_data = {
        'about': 'Your new about section content...',
        'experience': [
            {
                'title': 'New Position',
                'company': 'Company Name',
                'location': 'Location',
                'description': 'Role description...'
            }
        ],
        'skills': ['Skill 1', 'Skill 2', 'Skill 3']
    }
    
    updater = LinkedInUpdater()
    updater.run_update(update_data) 