const express = require("express");
const router = express.Router();
const VMManager = require("../utils/VMManager"); // ✅ Import class, don't define again
const requireAuth = require("../middlewares/requireAuth");
const { CONFIG } = require("../config/db")
const fs = require("fs-extra")
const Docker = require("dockerode");
const user = require("../models/user");
const { createDockerNetwork } = require("../utils/dockerNetwork");
const path = require('path');

const docker = new Docker()
// All VM endpoints...

router.post("/api/create-vm", requireAuth, async (req, res) => {
    try {
        const { vmPassword, customDomain } = req.body
        const userId = req.user.username.toString()
// console.log(req.body)
        console.log(`VM creation request from user ${userId}`)

        if (!vmPassword) {
            return res.status(400).json({ error: "VM password is required" })
        }
         // ✅ Validate customDomain
    if (!/^[a-zA-Z0-9-]+$/.test(customDomain)) {
      return res.status(400).json({ error: "Invalid subdomain format" });
    }

    
    // ✅ Check if subdomain already exists in nginx config
    const subdomainConfPath = path.join(
      CONFIG.NGINX_CONFIG_PATH,
      `${customDomain}.${CONFIG.DOMAIN}`
    );
    if (await fs.pathExists(subdomainConfPath)) {
      return res.status(409).json({ error: "Subdomain is already in use" });
    }
    const networkInfo = await createDockerNetwork(userId);
        console.log(networkInfo)
        // Check if user already has a VM
        const vmData = await VMManager.loadVMData()
        
        if (vmData[userId]) {
            return res.status(400).json({ error: "User already has a VM" })
        }

        // Get available ports
        const { sshPort, httpPort, rdpPort } = await VMManager.getNextAvailablePorts()
        console.log(`Assigned ports - SSH: ${sshPort}, HTTP: ${httpPort}`)

        // Generate subdomain
        const subdomain = customDomain || `${userId.slice(-6)}`
        console.log(`Using subdomain: ${subdomain}`)

        // Create container
        console.log("Starting container creation...")
        const container = await VMManager.createContainer(userId, vmPassword, sshPort, httpPort, rdpPort)

        // Generate Nginx config
        console.log("Generating Nginx configuration...")
        await VMManager.generateNginxConfig(userId, httpPort, subdomain)

        // Save VM data
     const containerInfo = await container.inspect(); // ⬅️ To get container IP
const networkName = networkInfo.name; // Same network name used during creation

// Get container's IP address from the specific network
const ip = containerInfo.NetworkSettings.Networks[networkName]?.IPAddress || "N/A";
const subnet = networkInfo.subnet || "N/A";

vmData[userId] = {
  containerId: container.id,
  containerName: `vm_${userId}`,
  sshPort,
  httpPort,
  subdomain,
  domain: `${subdomain}.${CONFIG.DOMAIN}`,
  createdAt: new Date().toISOString(),
  status: "running",

  // 📡 Network metadata (clean + helpful)
  network: {
    name: networkName,
    subnet,
    ipAddress: ip,
  },
};

        await VMManager.saveVMData(vmData)
        console.log(`VM data saved for user ${userId}`)

        res.json({
            success: true,
            vm: vmData[userId],
            message: "VM created successfully! Please wait 1-2 minutes for full initialization.",
        })
    } catch (error) {
        console.error("VM creation error:", error)
        res.status(500).json({ error: "Failed to create VM: " + error.message })
    }
})






router.get("/api/vm-status", requireAuth, async (req, res) => {
    try {
        const userId = req.user.username.toString();
        const vmData = await VMManager.loadVMData();
        const userVM = vmData[userId];

        if (!userVM) {
            return res.json({ hasVM: false });
        }

        try {
            const container = docker.getContainer(userVM.containerId);
            const info = await container.inspect();

            // Status: running or stopped
            userVM.status = info.State.Running ? "running" : "stopped";

            // Add health status if available
            if (info.State.Health && info.State.Health.Status) {
                userVM.health = info.State.Health.Status; // healthy, unhealthy, starting
            } else {
                userVM.health = "unknown";
            }

        } catch (error) {
            userVM.status = "error";
            userVM.health = "unknown";
        }

        res.json({
            hasVM: true,
            vm: userVM,
        });
    } catch (error) {
        console.error("VM status error:", error);
        res.status(500).json({ error: "Failed to get VM status" });
    }
});
router.post("/api/vm-action", requireAuth, async (req, res) => {
  try {
    const { action } = req.body;
    const userId = req.user.username.toString();
    const vmData = await VMManager.loadVMData();
    const userVM = vmData[userId];

    if (!userVM) {
      return res.status(404).json({ error: "VM not found" });
    }

    const container = docker.getContainer(userVM.containerId);

    // Check if container still exists
    let containerInfo;
    try {
      containerInfo = await container.inspect();
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(410).json({ error: "Container not found or already deleted." });
      }
      throw err;
    }

    console.log(`▶️ VM Action requested: ${action}`);

    switch (action) {
      case "start":
        try {
          await container.start();
          userVM.status = "running";
        } catch (err) {
          return res.status(500).json({ error: "Failed to start container: " + err.message });
        }
        break;

      case "stop":
        try {
          await container.stop();
          userVM.status = "stopped";
        } catch (err) {
          return res.status(500).json({ error: "Failed to stop container: " + err.message });
        }
        break;

      case "restart":
        try {
          await container.restart();
          userVM.status = "running";
        } catch (err) {
          return res.status(500).json({ error: "Failed to restart container: " + err.message });
        }
        break;

      case "remove":
        try {
          await container.remove({ force: true });
        } catch (err) {
          if (err.statusCode !== 404) {
            return res.status(500).json({ error: "Failed to remove container: " + err.message });
          } else {
            console.warn(`⚠️ Container already deleted: ${userVM.containerId}`);
          }
        }

        try {
          await VMManager.removeNginxConfig(userVM.subdomain);
        } catch (err) {
          console.warn(`⚠️ Failed to remove Nginx config for ${userVM.subdomain}:`, err.message);
        }

        delete vmData[userId];
        await VMManager.saveVMData(vmData);
        return res.json({ success: true, message: "VM removed successfully" });

      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    await VMManager.saveVMData(vmData);
    res.json({ success: true, vm: userVM });

  } catch (error) {
    console.error("VM action error:", error);
    res.status(500).json({ error: "Failed to perform VM action: " + error.message });
  }
});

router.post("/api/fix-vm-password", requireAuth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.username.toString();
    const vmData = await VMManager.loadVMData();
    const userVM = vmData[userId];

    if (!userVM) {
      return res.status(404).json({ error: "VM not found" });
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ error: "A valid new password is required (min 4 characters)" });
    }

    // Check if container exists first
    const container = docker.getContainer(userVM.containerId);
    let containerInfo;
    try {
      containerInfo = await container.inspect();
    } catch (err) {
      if (err.statusCode === 404) {
                console.log('not found vps');

        return res.status(410).json({ error: "Container not found or already deleted." });
      }
      throw err;
    }

    // Fix password logic
    const success = await VMManager.fixContainerPassword(userVM.containerId, newPassword);

    if (success) {
      res.json({
        success: true,
        message: "🔑 Password updated successfully. Try SSH again in ~30 seconds.",
      });
    } else {
      res.status(500).json({ error: "❌ Failed to update password inside the container." });
    }
  } catch (error) {
    console.error("🔧 Password fix error:", error);
    res.status(500).json({ error: "Unexpected server error: " + error.message });
  }
});

module.exports = router;