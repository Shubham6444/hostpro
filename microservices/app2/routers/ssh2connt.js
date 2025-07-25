const express = require("express");
const router = express.Router();
const expressWs = require("express-ws");
const { Client } = require("ssh2");

// Enable WebSocket support
expressWs(router);

router.ws("/ssh", (ws, req) => {
  const conn = new Client();

  let shellStream = null;
  let connected = false;

  // Expect credentials as the first message
  ws.once("message", function (msg) {
    let creds;
    try {
      creds = JSON.parse(msg);
    } catch (err) {
      ws.send("❌ Invalid credentials format");
      ws.close();
      return;
    }

    const { host, port = 22, username, password } = creds;

    conn.on("ready", () => {
      connected = true;
      console.log(`✅ SSH ready: ${username}@${host}`);
      ws.send("\r\n✅ Connected to SSH server\r\n");

      conn.shell((err, stream) => {
        if (err) {
          ws.send("❌ Shell error: " + err.message);
          ws.close();
          return;
        }

        shellStream = stream;

        stream.on("data", data => {
          ws.send(data.toString());
        });

        stream.stderr.on("data", data => {
          ws.send(data.toString());
        });

        ws.on("message", data => {
          // Skip new JSON messages (extra credential send)
          if (typeof data === "string" && data.trim().startsWith("{") && data.includes("host")) return;
          if (shellStream && ws.readyState === 1) {
            shellStream.write(data);
          }
        });

        ws.on("close", () => {
          console.log("🔌 WebSocket closed");
          conn.end();
        });
      });
    });

    conn.on("error", err => {
      console.log("❌ SSH error:", err.message);
      if (ws.readyState === 1) ws.send("❌ SSH Error: " + err.message);
      ws.close();
    });

    conn.on("close", () => {
      if (ws.readyState === 1) ws.send("\r\n🔚 SSH session closed\r\n");
      ws.close();
    });

    // Connect to SSH server
    conn.connect({
      host,
      port,
      username,
      password,
      tryKeyboard: true,
      readyTimeout: 15000
    });
  });

  ws.on("error", (err) => {
    console.log("❌ WebSocket error:", err.message);
    if (!connected) conn.end();
  });
});

module.exports = router;
