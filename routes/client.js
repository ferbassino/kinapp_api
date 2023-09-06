const router = require("express").Router();

const {
  createClient,
  getClients,
  getClient,
  deleteClient,
  updateClient,
  signInClient,
} = require("../controllers/client");

router.get("/api/clients", getClients);
router.post("/api/client", signInClient);
router.get("/api/client/:id", getClient);
router.post("/api/client/create", createClient);
router.delete("/api/client/:id", deleteClient);
router.put("/api/client/:id", updateClient);

module.exports = router;
