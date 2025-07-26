const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { CONFIG } = require("../config/db");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const Docker = require("dockerode");
const docker = new Docker();
const { Mutex } = require("async-mutex");
const createLock = new Mutex();
const net = require("net");
const { createDockerNetwork } = require("../utils/dockerNetwork");
const { applyPhpNginxConfig } = require("../utils/phpconfig");

async function isPortFreeTCP(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once("error", () => resolve(false))
      .once("listening", () => {
        server.close();
        resolve(true);
      })
      .listen(port, "0.0.0.0");
  });
}

async function isPortFreeInDocker(port) {
  const containers = await docker.listContainers({ all: true });
  for (const container of containers) {
    for (const portBinding of container.Ports || []) {
      if (portBinding.PublicPort === port) {
        return false;
      }
    }
  }
  return true;
}

async function isPortFree(port) {
  const [tcpFree, dockerFree] = await Promise.all([
    isPortFreeTCP(port),
    isPortFreeInDocker(port),
  ]);
  return tcpFree && dockerFree;
}

class VMManager {
  static async getNextAvailablePorts() {
    let sshPort = CONFIG.SSH_PORT_START;
    let httpPort = CONFIG.HTTP_PORT_START;
    while (!(await isPortFree(sshPort))) sshPort++;
    while (!(await isPortFree(httpPort))) httpPort++;
    return { sshPort, httpPort };
  }

  static async loadVMData() {
    try {
      await fs.ensureFile(CONFIG.DATA_FILE);
      const data = await fs.readJson(CONFIG.DATA_FILE);
      return data || {};
    } catch {
      return {};
    }
  }

  static async saveVMData(data) {
    await fs.ensureDir(path.dirname(CONFIG.DATA_FILE));
    await fs.writeJson(CONFIG.DATA_FILE, data, { spaces: 2 });
  }

  static async createContainer(userId, password) {
    const release = await createLock.acquire();
    try {
      const { sshPort, httpPort } = await this.getNextAvailablePorts();
      const containers = await docker.listContainers({ all: true });
      for (const container of containers) {
        for (const port of container.Ports || []) {
          if ([sshPort, httpPort].includes(port.PublicPort)) {
            throw new Error(`Port ${port.PublicPort} is already in use.`);
          }
        }
      }
      return await this._createContainerInternal(userId, password, sshPort, httpPort);
    } finally {
      release();
    }
  }

  static async _createContainerInternal(userId, password, sshPort, httpPort) {
    const networkInfo = await createDockerNetwork(userId);
    const containerName = `vm_${userId}`;
    const actualPassword = password?.trim() || "defaultpass123";
    const userVolumePath = path.resolve("/users/public/users", userId);
    const userhostdata = path.resolve(__dirname, "..", "Hostedfiles", userId);

    await fs.ensureDir(`${userVolumePath}/etc/letsencrypt`);
    await fs.ensureDir(`${userVolumePath}/var/lib/letsencrypt`);
    await fs.ensureDir(`${userVolumePath}/var/www/html`);
    await execAsync(`chown -R root:root ${userVolumePath}`);
    await execAsync(`chmod -R 755 ${userVolumePath}`);


    const container = await docker.createContainer({
      Image: "ubuntu:22.04",
      name: containerName,
      Hostname: `vm-${userId}`, // ✅ Correct place
      Labels: {
    maintainer: "OceanCloud",
    project: "OceanCloud VPS",
    user: userId
  },
     Cmd: [
  "/bin/bash",
  "-c",
  `
set -e

# Default HTML file
[ -f /var/www/html/index.html ] || echo "<h1>Welcome to your VM!</h1><p>SSH Port: ${sshPort}</p>" > /var/www/html/index.html

# Supervisor log directory
mkdir -p /var/log/supervisor && chmod 755 /var/log/supervisor

# Home dir
mkdir -p /home/vpsuser
chown -R vpsuser:vpsuser /home/vpsuser
chmod 755 /home/vpsuser

# Fix sudo
chown root:root /usr/bin/sudo
chmod 4755 /usr/bin/sudo

# Create user
id vpsuser 2>/dev/null || useradd -m -s /bin/bash vpsuser
echo "vpsuser:${actualPassword}" | chpasswd
usermod -aG sudo vpsuser

# Safe sudoers
echo 'vpsuser ALL=(ALL) NOPASSWD: /usr/bin/nano, /usr/bin/cat, /bin/ls, /usr/bin/tail, /usr/bin/head, /usr/bin/htop, /usr/bin/du, /usr/bin/vim, /usr/bin/wget, /usr/bin/curl' > /etc/sudoers.d/vpsuser
echo 'Defaults:vpsuser logfile=/var/log/sudo-vpsuser.log' >> /etc/sudoers.d/vpsuser

# Block dangerous rm globally (secure wrapper)
cat << 'EOF_RM' > /usr/local/bin/rm
#!/bin/bash
if [[ "$1" == "-rf" && ( "$2" == "/" || "$2" == "/app" || "$2" == "app" || "$2" == "/html" || "$2" == "html" ) ]]; then
  echo "🚫 Operation not allowed: Attempt to remove protected directory."
  exit 1
else
  /bin/rm "$@"
fi
EOF_RM
chmod +x /usr/local/bin/rm

# Setup .bashrc
cat << 'EOF' >> /home/vpsuser/.bashrc

clear
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐  Welcome to OceanCloud VPS - powered by ociancloud.com"
echo "👤  User      : $(whoami)"
echo "📅  Date      : $(date)"
echo "📂  Directory : $(pwd)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧  Common Commands:"
echo "     ▶ restartweb - Reload Nginx"
echo "     ▶ editweb    - Edit HTML index"
echo ""
echo "📢  Tip: Use 'sudo' carefully. Some commands are blocked for safety."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Safe aliases
alias restartweb='sudo nginx -s reload'
alias editweb='sudo nano /var/www/html/index.html'

alias apt='echo 🚫 apt is blocked in this container for safety.'
alias apt-get='echo 🚫 apt-get is blocked in this container.'
alias rm='echo ⚠️  rm is disabled to prevent accidental deletion.'
alias systemctl='echo ❌ systemctl is not available in this container.'
alias dpkg='echo 🔒 dpkg is restricted for security reasons.'
alias shutdown='echo ❌ shutdown is not allowed.'
alias reboot='echo ❌ reboot is blocked.'

EOF

# Permissions
chown vpsuser:vpsuser /home/vpsuser/.bashrc

# Start supervisor
exec /usr/bin/supervisord -n
`
],

      ExposedPorts: {
        "22/tcp": {},
        "80/tcp": {},
      },
      HostConfig: {
        NetworkMode: networkInfo.name,
        Tmpfs: { "/tmp": "size=100m" },
        PortBindings: {
          "22/tcp": [{ HostPort: sshPort.toString() }],
          "80/tcp": [{ HostPort: httpPort.toString() }],
        },
        // CapAdd: ["ALL"],
 CapAdd: ["ALL"],
// SecurityOpt: ["no-new-privileges"], if unccomin sudo not woking
        Binds: [
          `${userVolumePath}/etc/letsencrypt:/etc/letsencrypt`,
          `${userVolumePath}/var/lib/letsencrypt:/var/lib/letsencrypt`,
          `${userhostdata}:/app`,
          `${userhostdata}/html/:/var/www/html`,
            "/dev/pts:/dev/pts",   

        ],
        MemoryReservation: 256 * 1024 * 1024,
        CpuPeriod: 100000,
        CpuQuota: 50000, // Half core3

        // ✅ Add this here
        RestartPolicy: {
          Name: "always"
        },

        // SecurityOpt: ["no-new-privileges"],
        CapDrop: ["ALL"],

      },
      Healthcheck: {
        Test: ["CMD-SHELL", "curl -f http://localhost || exit 1"],
        Interval: 30 * 1e9,      // 30s in nanoseconds
        Timeout: 5 * 1e9,        // 5s timeout
        Retries: 3,              // After 3 fails → unhealthy
        StartPeriod: 10 * 1e9    // Wait 10s before checking
      },
      // User: "vpsuser",
      Tty: true,
      OpenStdin: true,
    });

    await container.start();
await new Promise(r => setTimeout(r, 2000)); // wait for supervisord to start nginx/php
await applyPhpNginxConfig(docker, container.id);
    const data = await this.loadVMData();
    data[userId] = { sshPort, httpPort, containerId: container.id };
    await this.saveVMData(data);

    try {
      await execAsync("sudo nginx -t && sudo systemctl reload nginx");
    } catch (err) {
      console.error("Failed to reload host Nginx:", err.stderr || err.message);
    }

    return container;
  }

  static async generateNginxConfig(userId, httpPort, subdomain) {
    const configContent = `server {
      listen 443 ssl http2;
      server_name ${subdomain}.${CONFIG.DOMAIN};
      ssl_certificate /etc/letsencrypt/live/${CONFIG.DOMAIN}-0001/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/${CONFIG.DOMAIN}-0001/privkey.pem;
      ssl_protocols TLSv1.2 TLSv1.3;
      ssl_ciphers HIGH:!aNULL:!MD5;
      resolver 8.8.8.8;  # ✅ Moved here, outside location

      location / {
          proxy_pass http://localhost:${httpPort};
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          
      }
    }`;

    const configPath = path.join(CONFIG.NGINX_CONFIG_PATH, `${subdomain}.${CONFIG.DOMAIN}`);
    const enabledPath = path.join(CONFIG.NGINX_ENABLED_PATH, `${subdomain}.${CONFIG.DOMAIN}`);
    await fs.writeFile(configPath, configContent);
    try {
      await fs.symlink(configPath, enabledPath);
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
    await execAsync("nginx -t");
    // await execAsync("systemctl reload nginx");
    await execAsync("nginx -t && nginx -s reload");

  }

  static async removeNginxConfig(subdomain) {
    const configPath = path.join(CONFIG.NGINX_CONFIG_PATH, `${subdomain}.${CONFIG.DOMAIN}`);
    const enabledPath = path.join(CONFIG.NGINX_ENABLED_PATH, `${subdomain}.${CONFIG.DOMAIN}`);
    await fs.remove(enabledPath);
    await fs.remove(configPath);
    await execAsync("systemctl reload nginx");
  }

  static async fixContainerPassword(containerId, password) {
    try {
      const container = docker.getContainer(containerId);
      const actualPassword = password?.trim() || "defaultpass123";
      const commands = [
        `echo 'vpsuser:${actualPassword}' | chpasswd`,
        "usermod -aG sudo vpsuser",
        "grep -q 'vpsuser ALL=(ALL) NOPASSWD:ALL' /etc/sudoers || echo 'vpsuser ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers",
        "service ssh restart",
      ];
      for (const cmd of commands) {
        try {
          const exec = await container.exec({
            Cmd: ["/bin/bash", "-c", cmd],
            AttachStdout: true,
            AttachStderr: true,
          });
          const stream = await exec.start();
        } catch (error) {
          console.error(`Error executing: ${cmd}`, error);
        }
      }
      return true;
    } catch (error) {
      console.error("Password fix error:", error);
      return false;
    }
  }
}

module.exports = VMManager;
