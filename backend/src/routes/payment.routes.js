const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controllers");

router.get("/", paymentController.getAllPayments);
router.post("/", paymentController.createPayment);
router.get("/:rental_id", paymentController.getPaymentsByRental);
router.put("/:id", paymentController.updatePaymentStatus); 


module.exports = router;