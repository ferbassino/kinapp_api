const router = require("express").Router();

const {
  createMotionTest,
  getMotionTests,
  getMotionTest,
  updateMotion,
} = require("../controllers/motion");

router.get("/api/motion/motionTests", getMotionTests);
router.get("/api/motion/motionTests/:id", getMotionTest);
router.post("/api/motion/create", createMotionTest);
router.put("/api/motion/:id", updateMotion);

module.exports = router;
