const express = require('express');
const authController = require('../controllers/authController.js');
const app = require('../server.js');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({tag:2, err:''});
});

router.post('/', authController.createUser, (req, res) => {
    if(res.locals.id) res.status(200).json({tag: 0, watchers: [] });
    else res.status(400).json({tag:2, err:'Unable to unable to create user, username already taken'});
})

module.exports = router;
