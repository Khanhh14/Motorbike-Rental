// controllers/captcha.controller.js
const svgCaptcha = require('svg-captcha');

const getCaptcha = (req, res) => {
  const captcha = svgCaptcha.create({
    size: 5,          // số ký tự captcha
    noise: 2,         // số đường nhiễu
    color: true,
    background: '#cc9966'
  });

  req.session.captcha = captcha.text; // lưu captcha text vào session

  res.type('svg');
  res.status(200).send(captcha.data);
};

module.exports = {
  getCaptcha,
};
