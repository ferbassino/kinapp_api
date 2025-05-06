const router = require("express").Router();

const {
  createClient,
  getClients,
  getClient,
  deleteClient,
  updateClient,
  signInClient,
  addTreatmentToClient,
  addNewTreatmentToClient,
  addDailyReview,
  findClientByName,
  sendEmailNotification,
  sendWhatsAppNotification,
  updateClientPersonalHistory,
  updateClientFamilyHistory,
  updateClientDiagnostics,
  deactivateTreatmentForClient,
  updateClientCurrentCondition,
  updateClientLifeStyle,
  updateSession,
  deleteTreatmentFromClient,
  updateClientDiagnosticsGoals,
  savePasswordAndSendVerificationCode,
  verifyCode,
  generateNewVerificationCode,
  forgotPassword,
  resetPassword,
  authenticateClient,
  addAsynchronousSession,
  getAllAsyncSessions,
  getSingleAsyncSession,
  updateAsyncSession,
  deleteAsyncSession,
} = require("../controllers/client");

router.get("/api/clients", getClients);
router.post("/api/client", signInClient);
router.get("/api/client/:id", getClient);
router.post("/api/client/create", createClient);
router.delete("/api/client/:id", deleteClient);
router.put("/api/client/:id", updateClient);
// autogestion
router.post("/api/client/save-password", savePasswordAndSendVerificationCode);
router.post("/api/client/login", authenticateClient);
router.post("/api/client/verify-code", verifyCode);
router.post("/api/client/generate-new-code", generateNewVerificationCode);
router.post("/api/client/forgot-password", forgotPassword);
router.post("/api/client/reset-password", resetPassword);

router.put("/api/client/personal_history/:id", updateClientPersonalHistory);
router.put("/api/client/family_history/:id", updateClientFamilyHistory);

router.put("/api/client/:id/update-diagnostics", updateClientDiagnostics);
router.put("/api/client/:id/update-goals", updateClientDiagnosticsGoals);

router.put(
  "/api/client/:id/update-current-condition",
  updateClientCurrentCondition
);

router.put("/api/client/:id/update-lifestyle", updateClientLifeStyle);
router.put(
  "/api/client/:id/deactivate-treatment",
  deactivateTreatmentForClient
);

router.put("/api/client/:id/add-treatment", addTreatmentToClient);
router.delete("/api/client/:id/delete-treatment", deleteTreatmentFromClient);

router.put("/api/client/:id/update-session", updateSession);

router.put("/api/client/:id/add-new-treatment", addNewTreatmentToClient);
router.put("/api/client/:id/add-daily-review", addDailyReview);

router.post("/api/client/find-client-by-name", findClientByName);
// rutas para las sesiones asincronas
router.patch("/api/client/:id/add-async-session", addAsynchronousSession);
router.get("/api/client/:id/async-sessions", getAllAsyncSessions);
router.get("/api/client/:id/async-session/:sessionId", getSingleAsyncSession);
router.patch("/api/client/:id/update-async-session", updateAsyncSession);
router.delete("/api/client/:id/async-session/:sessionId", deleteAsyncSession);

module.exports = router;
