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
} = require("../controllers/client");

router.get("/api/clients", getClients);
router.post("/api/client", signInClient);
router.get("/api/client/:id", getClient);
router.post("/api/client/create", createClient);
router.delete("/api/client/:id", deleteClient);
router.put("/api/client/:id", updateClient);
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

// Endpoint para enviar un correo electrónico
router.post("/api/client/notifications/email", sendEmailNotification);

// Endpoint para enviar un mensaje de WhatsApp
router.post("/api/client/notifications/whatsapp", sendWhatsAppNotification);

module.exports = router;
