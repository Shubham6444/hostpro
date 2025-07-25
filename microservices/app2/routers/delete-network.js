const express = require("express");
const Docker = require("dockerode");
const router = express.Router();
const docker = new Docker();

router.delete("/network/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const network = docker.getNetwork(name);
    await network.remove();
    res.json({ success: true, message: `Network '${name}' deleted.` });
  } catch (err) {
    console.error("Delete network error:", err.message);
    res.status(500).json({ success: false, error: `Failed to delete network '${name}'.` });
  }
});

module.exports = router;
