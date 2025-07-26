#!/bin/bash

echo "🚀 Installing CI/CD Webhook Server..."

# Install dependencies
sudo apt update
sudo apt install -y git nodejs npm
# Clone the repo
sudo git clone https://github.com/Shubham6444/hookhtml.git /opt/autodeploy || echo "📁 Repo already exists"

# Install dependencies
cd /opt/autodeploy
sudo npm install

# Create systemd service
SERVICE_FILE=/etc/systemd/system/autodeploy.service
sudo tee $SERVICE_FILE > /dev/null <<EOF
[Unit]
Description=CI/CD Webhook Server
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/autodeploy/hello.js
WorkingDirectory=/opt/autodeploy
Restart=always
User=root
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Enable + start service
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable --now autodeploy
sudo sudo systemctl status autodeploy

echo "✅ CI/CD Server is running at http://localhost:1000"
