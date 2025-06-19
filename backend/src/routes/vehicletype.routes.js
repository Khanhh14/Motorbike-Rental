const express = require("express");
const router = express.Router();
const vehicleTypeController = require("../controllers/vehicletype.controllers");

router.get("/", vehicleTypeController.getAllVehicleTypes);
router.post("/", vehicleTypeController.createVehicleType);
router.put("/:id", vehicleTypeController.updateVehicleType);
router.delete("/:id", vehicleTypeController.deleteVehicleType);

module.exports = router;
