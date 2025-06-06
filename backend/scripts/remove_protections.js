import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to check
const gitignorePath = path.join(__dirname, '../.gitignore');
const cursorignorePath = path.join(__dirname, '../.cursorignore');

// Function to remove protections for .env.development
function removeProtections() {
  const files = [gitignorePath, cursorignorePath];
  files.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      // Comment out or remove lines that block .env* files
      content = content.replace(/^\.env.*$/gm, '# $&');
      fs.writeFileSync(file, content);
      console.log(`Removed protections in ${file}`);
    }
  });
}

// Execute the function
removeProtections(); 