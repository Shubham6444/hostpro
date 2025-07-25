const phpNginxConfig = `
server {
    listen 80;
    server_name localhost;

    root /var/www/html;
    index index.php index.html index.htm;

    location / {
        try_files \$uri \$uri/ /index.php?\$args;
    }

    location ~ \\.php\$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
    }

    location ~ /\\.ht {
        deny all;
    }
}
`;

const applyPhpNginxConfig = async (docker, containerId) => {
    const container = docker.getContainer(containerId);

    const cmd = `
# Ensure PHP run dir exists
mkdir -p /run/php

# Clear any stale php-fpm sockets or PIDs
[ -e /run/php/php8.4-fpm.sock ] && rm -f /run/php/php8.4-fpm.sock
[ -e /run/php/php8.4-fpm.pid ] && rm -f /run/php/php8.4-fpm.pid

# Write PHP + NGINX config
cat <<EOF > /etc/nginx/sites-enabled/default
${phpNginxConfig}
EOF

# Restart PHP-FPM after config cleanup
php8.4-fpm -t && service php8.4-fpm restart

# Start/reload NGINX based on PID availability
if [ -f /run/nginx.pid ]; then
  nginx -t && nginx -s reload
else
  nginx -t && nginx
fi
    `.trim();

    try {
        const exec = await container.exec({
            Cmd: ["/bin/bash", "-c", cmd],
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await exec.start({ hijack: true, stdin: false });

        stream.on("data", (chunk) => {
            process.stdout.write(chunk.toString());
        });

        stream.on("end", () => {
            console.log("✅ PHP NGINX config applied");
        });

    } catch (err) {
        console.error("❌ Failed to apply PHP NGINX config:", err.message || err);
    }
};

module.exports = {
    phpNginxConfig,
    applyPhpNginxConfig,
};
