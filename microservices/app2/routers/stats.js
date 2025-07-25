const express = require("express");
const router = express.Router();
const Docker = require("dockerode");
const docker = new Docker();
const requireAuth = require("../middlewares/requireAuth");

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

router.get("/container-usage",requireAuth, async (req, res) => {
   const userId = req.user.username.toString();

  try {
    const containers = await docker.listContainers({ all: true });
    const usageInfo = [];

    for (const containerInfo of containers) {
      const name = containerInfo.Names?.[0]?.replace(/^\//, "") || "";
      if (!name.includes(`vm_${userId}`)) continue; // Only match containers owned by userId

      const container = docker.getContainer(containerInfo.Id);
      const inspect = await container.inspect({ size: true });

      usageInfo.push({
        name: inspect.Name.replace(/^\//, ""),
        id: inspect.Id,
        image: inspect.Config.Image,
        sizeRootFs: formatBytes(inspect.SizeRootFs || 0),
        sizeRw: formatBytes(inspect.SizeRw || 0),
        state: inspect.State.Status,
      });
    }

    res.json(usageInfo);
  } catch (err) {
    console.error("Error fetching container usage:", err);
    res.status(500).json({ error: "Failed to fetch container usage" });
  }
});

module.exports = router;
