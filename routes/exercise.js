const express = require("express");
const router = express.Router();
const exerciseController = require("../controllers/exercise");

router
  .route("/api/exercise")
  .get(exerciseController.getAllExercises)
  .post(exerciseController.createExercise);

router
  .route("/api/exercise/:id")
  .get(exerciseController.getExercise)
  .patch(exerciseController.updateExercise)
  .delete(exerciseController.deleteExercise);

module.exports = router;
