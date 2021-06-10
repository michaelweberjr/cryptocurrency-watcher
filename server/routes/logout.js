const express = require('express');
const sessionController = require('../controllers/sessionController.js');

const router = express.Router();

router.post('/', sessionController.endSession, (req, res) => {
    res.status(200).json({tab: 3, watchers: []});
})

module.exports = router;