
const express = require('express');
const bcrypt = require('bcrypt');
const Docker = require('dockerode');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const User = require('../models/user'); // ✅ Use Mongoose User model
const CONFIG = require('../config/db')
const router = express.Router();
const docker = new Docker();
const execAsync = util.promisify(exec);

// Admin credentials (hash stored - for demo only, store in DB in production)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: '$2b$10$deWGKiFUtQDSIpYdCjM.f.Z9yjHrVMnHWylmVNpwLmRRqgjqSTYmS' // 'admin123'
};

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
    if (req.session.isAdmin) return next();
    res.status(401).json({ error: 'Admin authentication required' });
};

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (username === ADMIN_CREDENTIALS.username &&
            await bcrypt.compare(password, ADMIN_CREDENTIALS.password)) {
            req.session.isAdmin = true;
            req.session.adminUsername = username;
            return res.json({ success: true, message: 'Admin login successful' });
        }
        res.status(401).json({ error: 'Invalid admin credentials' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.isAdmin = false;
    req.session.adminUsername = null;
    res.json({ success: true, message: 'Admin logged out' });
});

// Get all users
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ success: true, users });
    } catch (error) {
        console.error('Fetching users failed:', error);
        res.status(500).json({ error: 'Could not retrieve users' });
    }
});

// Delete user
router.delete('/user/:userId', requireAdmin, async (req, res) => {
    const { userId } = req.params;
    const VMManager = req.app.locals.VMManager;

    try {
        const vmData = await VMManager.loadVMData();
        if (vmData[userId]) {
            try {
                const container = docker.getContainer(vmData[userId].containerId);
                await container.remove({ force: true });
                await VMManager.removeNginxConfig(vmData[userId].subdomain);
                delete vmData[userId];
                await VMManager.saveVMData(vmData);
            } catch (error) {
                console.error('Error deleting container:', error.message);
            }
        }

        const result = await User.deleteOne({ _id: userId });
        if (result.deletedCount > 0) {
            res.json({ success: true, message: 'User and VM deleted' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('User delete error:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
});

// System stats
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const VMManager = req.app.locals.VMManager;
        const userCount = await User.countDocuments();
        const vmData = await VMManager.loadVMData();
        const containers = await docker.listContainers();
        const runningVMs = containers.filter(c => c.Names[0].startsWith('/vm_')).length;
        const systemInfo = await docker.info();

        res.json({
            success: true,
            stats: {
                users: userCount,
                totalVMs: Object.keys(vmData).length,
                runningVMs,
                stoppedVMs: Object.keys(vmData).length - runningVMs,
                usedSSHPorts: Object.values(vmData).map(vm => vm.sshPort).length,
                usedHTTPPorts: Object.values(vmData).map(vm => vm.httpPort).length,
                systemInfo: {
                    containers: systemInfo.Containers,
                    images: systemInfo.Images,
                    memTotal: systemInfo.MemTotal,
                    cpus: systemInfo.NCPU
                }
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

module.exports = router;


