const express = require('express');
const userController = require('../controllers/userController.js');
const sessionController = require('../controllers/sessionController.js');
const app = require('../server.js');

const router = express.Router();

router.get('/', userController.validateUser, sessionController.startSession, (req, res) => {
    if(res.locals.id) {
        res.status(200).json({tab: 0, watchers: res.locals.watchers });
    }
    else res.status(400).json({tab:3, watchers: [], err:'Unable to login, username or password incorrect'});
})

module.exports = router;
