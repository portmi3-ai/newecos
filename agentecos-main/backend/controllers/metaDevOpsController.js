import { parseIntent } from '../services/nlpService.js';
import { runTestScript } from './devopsController.js';
import { askLLM } from '../services/llmService.js';
import { saveMemory, getMemory } from '../services/memoryService.js';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import net from 'net';
import fs from 'fs/promises';
import path from 'path';

// Helper to run shell commands
async function runShellCommand(cmd, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      if (error) return reject({ error: error.message, stderr });
      resolve({ stdout, stderr });
    });
  });
}

// Helper to check if a port is open
async function checkPort(port) {
  return new Promise(resolve => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => resolve(false));
    socket.connect(port, '127.0.0.1');
  });
}

export const handleMetaDevOpsCommand = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.sub;
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    // Retrieve relevant memories for the user
    const memories = await getMemory(userId);

    // Parse intent using NLP/NLU service
    const intent = await parseIntent(message);
    let llmAdvice = null;
    let result = null;
    let reply = '';
    let sessionId = uuidv4();

    // Route intent to backend actions
    switch (intent.name) {
      case 'run_test':
        req.body.scriptName = intent.params.scriptName;
        req.user = { sub: userId };
        result = await runTestScript(req, res, true); // true = internal call, don't send response
        reply = result.reply || 'Test executed.';
        break;
      case 'start_backend': {
        const backendUp = await checkPort(5000);
        if (backendUp) {
          reply = 'Backend server is already running on port 5000.';
        } else {
          result = await runShellCommand('npm install && npm run start:backend', process.cwd() + '/agentecos-main/backend');
          reply = result.stdout || result.stderr || 'Backend server started.';
        }
        break;
      }
      case 'start_frontend': {
        const frontendUp = await checkPort(3000);
        if (frontendUp) {
          reply = 'Frontend server is already running on port 3000.';
        } else {
          result = await runShellCommand('npm install && npm start', process.cwd() + '/website');
          reply = result.stdout || result.stderr || 'Frontend server started.';
        }
        break;
      }
      case 'check_servers': {
        const backendUp = await checkPort(5000);
        const frontendUp = await checkPort(3000);
        reply = `Backend running: ${backendUp}, Frontend running: ${frontendUp}`;
        break;
      }
      case 'start_all_servers': {
        // 1. Fix frontend start script if needed
        const pkgPath = path.join(process.cwd(), 'website', 'package.json');
        let pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
        let frontendFixed = false;
        if (pkg.scripts.start === 'node backend/server.js') {
          pkg.scripts.start = 'react-scripts start';
          await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
          frontendFixed = true;
        }
        // 2. Start frontend if not running
        const frontendUp = await checkPort(3000);
        let frontendMsg = '';
        if (frontendUp) {
          frontendMsg = 'Frontend server is already running on port 3000.';
        } else {
          if (frontendFixed) frontendMsg = 'Fixed frontend start script. ';
          await runShellCommand('npm install', process.cwd() + '/website');
          const resFront = await runShellCommand('npm start', process.cwd() + '/website');
          frontendMsg += resFront.stdout || resFront.stderr || 'Frontend server started.';
        }
        // 3. Start backend if not running
        const backendUp = await checkPort(5000);
        let backendMsg = '';
        if (backendUp) {
          backendMsg = 'Backend server is already running on port 5000.';
        } else {
          await runShellCommand('npm install', process.cwd() + '/agentecos-main/backend');
          const resBack = await runShellCommand('npm run start:backend', process.cwd() + '/agentecos-main/backend');
          backendMsg = resBack.stdout || resBack.stderr || 'Backend server started.';
        }
        reply = `${frontendMsg}\n${backendMsg}`;
        break;
      }
      // TODO: Add more cases for deploy, monitor, etc.
      default:
        // If unsure, ask LLM for advice
        llmAdvice = await askLLM(`User asked: "${message}". Here is what I know about their past actions: ${JSON.stringify(memories)}. What should I do?`);
        reply = `I'm not sure how to handle that request yet. Here's some advice: ${llmAdvice}`;
        break;
    }

    // Save memory of this interaction
    await saveMemory(userId, sessionId, {
      message,
      intent,
      result,
      llmAdvice,
      memoriesUsed: memories.map(m => m.sessionId || ''),
    });

    // Respond to user
    if (res.headersSent) return; // If runTestScript already sent response
    res.status(200).json({ reply, intent, result, llmAdvice, memories });
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ error: error.message });
  }
}; 