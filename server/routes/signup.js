const express = require('express');
const userController = require('../controllers/userController.js');
const sessionController = require('../controllers/sessionController.js');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({tab:2, err:''});
});

router.post('/', userController.createUser, sessionController.startSession, (req, res) => {
    if(res.locals.id) res.status(200).json({tab: 0, watchers: [] });
    else res.status(400).json({tab:2, err:'Unable to unable to create user, username already taken'});
})

module.exports = router;
