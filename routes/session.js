const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/session");

// Rutas básicas para sesiones
router.post("/api/sessions", sessionController.createSession);
router.get("/api/sessions/", sessionController.getAllSessions);

router.get(
  "/api/sessions/by-client/:clientId",
  sessionController.getSessionsByClientId
);
router.get("/api/sessions/:id", sessionController.getSessionById);
router.get(
  "/api/sessions/by-appointment/:appointmentId",
  sessionController.getSessionByAppointmentId
);
router.put("/api/sessions/:id", sessionController.updateSession);
router.delete("/:id", sessionController.deleteSession);

// Rutas para manejo de items de rutina
router.post("/:sessionId/routine", sessionController.addRoutineItem);
router.put(
  "/:sessionId/routine/:routineItemId",
  sessionController.updateRoutineItem
);
router.delete(
  "/:sessionId/routine/:routineItemId",
  sessionController.deleteRoutineItem
);

// Rutas para manejo de ejercicios dentro de items de rutina
router.post(
  "/:sessionId/routine/:routineItemId/exercises",
  sessionController.addExerciseToRoutine
);
router.put(
  "/:sessionId/routine/:routineItemId/exercises/:exerciseId",
  sessionController.updateExerciseInRoutine
);
router.delete(
  "/:sessionId/routine/:routineItemId/exercises/:exerciseId",
  sessionController.deleteExerciseFromRoutine
);

// Rutas para manejo de sets dentro de ejercicios
router.post(
  "/:sessionId/routine/:routineItemId/exercises/:exerciseId/sets",
  sessionController.addSetToExercise
);
router.put(
  "/:sessionId/routine/:routineItemId/exercises/:exerciseId/sets/:setId",
  sessionController.updateSetInExercise
);
router.delete(
  "/:sessionId/routine/:routineItemId/exercises/:exerciseId/sets/:setId",
  sessionController.deleteSetFromExercise
);

module.exports = router;
