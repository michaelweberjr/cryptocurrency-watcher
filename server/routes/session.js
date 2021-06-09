const express = require('express');
const userController = require('../controllers/userController.js');
const sessionController = require('../controllers/sessionController.js');
const app = require('../server.js');

const router = express.Router();

router.get('/', sessionController.validateSession, userController.getUser, (req, res) => {
    if(res.locals.id) {
        res.locals.watchers = res.locals.user.watchers;
        delete res.locals.id;
        delete res.locals.user;
        res.status(200).json(res.locals);
    }
    else res.status(200).json({tab:3, watchers: []});
})

module.exports = router;