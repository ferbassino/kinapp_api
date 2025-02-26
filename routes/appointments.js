const express = require("express");
const {
  getAllAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointments");

const router = express.Router();

router.get("/api/appointments", getAllAppointments);
router.get("/api/appointments/:id", getAppointment);
router.post("/api/appointment/:clientId", createAppointment);
router.put("/api/appointments/:id", updateAppointment);
router.delete("/api/appointments/:id", deleteAppointment);

module.exports = router;
