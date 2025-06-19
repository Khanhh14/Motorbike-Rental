// routes/captcha.route.js
const express = require('express');
const router = express.Router();
const captchaController = require('../controllers/captcha.controllers');

router.get('/', captchaController.getCaptcha);

module.exports = router;
