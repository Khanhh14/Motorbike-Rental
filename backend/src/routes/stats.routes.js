const express = require('express');
const router = express.Router();
const statsController = require("../controllers/stats.controllers");

router.get('/summary', statsController.getSummary);
router.get('/revenue-by-month', statsController.getRevenueByMonth);
router.get('/rentals-by-month', statsController.getRentalsByMonth);
router.get('/top-motorbikes', statsController.getTopMotorbikes);

module.exports = router;
