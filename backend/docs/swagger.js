const yaml = require("yamljs");
const path = require("path");

// Đọc trực tiếp file tài liệu YAML
const swaggerSpec = yaml.load(path.join(__dirname, "swagger.yaml"));

module.exports = swaggerSpec;