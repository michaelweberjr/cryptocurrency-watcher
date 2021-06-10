const express = require('express');
const tensorController = require('../controllers/tensorController.js');

const router = express.Router();

router.post('/', tensorController.getPrediction, (req, res) => {
    res.status(200).json(res.locals);
})

module.exports = router;