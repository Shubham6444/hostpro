const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const mappingFile = path.join(__dirname, "../../data/vm_mappings.json");

// GET all users and their VM details
router.get("/all_vm_status", (req, res) => {
  fs.readFile(mappingFile, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading user mapping:", err);
      return res.status(500).json({ error: "Failed to load user mappings" });
    }

    try {
      const mappings = JSON.parse(data);
      const users = Object.keys(mappings).map(username => ({
        username,
        ...mappings[username]
      }));
      res.json(users);
    } catch (err) {
      console.error("JSON parse error:", err);
      res.status(500).json({ error: "Invalid mapping file format" });
    }
  });
});

module.exports = router;
