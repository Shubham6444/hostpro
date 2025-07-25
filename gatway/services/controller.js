// services/controller.js
const { spawn } = require('child_process');
const path = require('path');

const processes = {};

function startService(name, filePath) {
  return new Promise((resolve, reject) => {
    if (processes[name]) {
      return resolve({ error: `${name} already running` });
    }

    const fullPath = path.resolve(__dirname, '../../microservices', filePath);
    console.log('🔁 Starting service from:', fullPath);

    const proc = spawn('node', [fullPath], {
      cwd: path.dirname(fullPath),
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    proc.stdout.on('data', (data) => {
      const msg = data.toString();
      output += msg;
      console.log(`[${name}] ${msg.trim()}`);
    });

    proc.stderr.on('data', (data) => {
      const msg = data.toString();
      errorOutput += msg;
      console.error(`[${name} ERROR] ${msg.trim()}`);
    });

    proc.on('error', (err) => {
      reject({ error: `Failed to spawn process: ${err.message}` });
    });

    proc.on('exit', (code) => {
      console.log(`🔴 ${name} exited with code ${code}`);
      delete processes[name];
    });

    // Give it 1s to capture some output before resolving
    setTimeout(() => {
      processes[name] = proc;
      resolve({
        message: `${name} started`,
        pid: proc.pid,
        stdout: output.trim(),
        stderr: errorOutput.trim()
      });
    }, 1000);
  });
}

function forceKillServiceByName(filePath) {
  const match = path.basename(filePath);
  spawn(`pkill -f "${match}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(`❌ Failed to kill ${match}:`, stderr.trim());
    } else {
      console.log(`🛑 Force killed ${match}`);
    }
  });
}
function stopService(name) {
  const proc = processes[name];
  if (!proc) return { error: `${name} not running` };

  proc.kill();
  delete processes[name];

  console.log(`🛑 ${name} stopped.`);
  return { message: `${name} stopped` };
}

module.exports = { startService, stopService };
