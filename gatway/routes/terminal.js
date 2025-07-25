const { Server } = require('socket.io');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ioNamespace = '/';
let initialized = false;

module.exports = function(io) {
  if (initialized) return;
  initialized = true;

  const userDirs = {};
  const nsp = io.of(ioNamespace);

  nsp.on('connection', (socket) => {
    console.log('📟 Terminal connected:', socket.id);
    userDirs[socket.id] = process.cwd();

    socket.on('run-command', (cmd) => {
      const currentDir = userDirs[socket.id];

      if (cmd.trim().startsWith('cd ')) {
        const target = cmd.slice(3).trim();
        const newDir = path.resolve(currentDir, target || '.');

        try {
          fs.accessSync(newDir);
          userDirs[socket.id] = newDir;
          socket.emit('output', `📂 Changed to ${newDir}\n`);

          // List contents
          const listProc = spawn(process.platform === 'win32' ? 'dir' : 'ls', {
            cwd: newDir,
            shell: true
          });

          listProc.stdout.on('data', (data) => {
            socket.emit('output', data.toString());
          });

          listProc.stderr.on('data', (data) => {
            socket.emit('output', data.toString());
          });

        } catch {
          socket.emit('output', `❌ Directory not found: ${target}\n`);
        }

        return;
      }

      // Run any other command
      const proc = spawn(cmd, {
        cwd: currentDir,
        shell: true
      });

      proc.stdout.on('data', (data) => {
        socket.emit('output', data.toString());
      });

      proc.stderr.on('data', (data) => {
        socket.emit('output', data.toString());
      });

      proc.on('close', (code) => {
        socket.emit('output', `\n🔚 Exit code: ${code}\n`);
      });
    });

    socket.on('disconnect', () => {
      delete userDirs[socket.id];
    });
  });
};
