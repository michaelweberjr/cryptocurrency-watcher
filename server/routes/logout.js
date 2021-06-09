const express = require('express');
const userController = require('../controllers/userController.js');
const sessionController = require('../controllers/sessionController.js');
const app = require('../server.js');

const router = express.Router();

router.post('/', sessionController.endSession, (req, res) => {
    res.status(200).json({tab: 3, watchers: []});
})

module.exports = router;