const express = require("express");

const {
  createImuData,
  getImuDatas,
  getImuData,
  deleteImuData,
} = require("../controllers/imuData");

const router = express.Router();

router.post("/api/imudata", createImuData);
router.get("/api/imudata", getImuDatas);
router.get("/api/imudata/:id", getImuData);
router.delete("/api/imudata/:id", deleteImuData);

module.exports = router;
