const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controllers');

router.post('/', qrController.taoQR);

module.exports = router;
