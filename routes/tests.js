const express = require("express");
const router = express.Router();
const {
  getTests,
  createTest,
  getTest,
  deleteTest,
} = require("../controllers/testsControllers");

router.get("/api/tests", getTests);
router.get("/api/test/:id", getTest);
router.post("/api/tests", createTest);
router.delete("/api/test/:id", deleteTest);

module.exports = router;
