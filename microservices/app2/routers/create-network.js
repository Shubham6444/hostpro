const express = require("express");
const router = express.Router();
const { createDockerNetwork } = require("../utils/dockerNetwork");
const requireAuth = require("../middlewares/requireAuth");

router.post("/create-network",requireAuth, async (req, res) => {
  const { userId } = req.body;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ success: false, error: "Missing or invalid userId." });
  }

  try {
    const result = await createDockerNetwork(userId);
    return res.json(result);
  } catch (err) {
    console.error("Network creation failed:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
