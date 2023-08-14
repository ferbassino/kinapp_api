const router = require("express").Router();

const {
  createClient,
  getClients,
  getClient,
  deleteClient,
  updateClient,
} = require("../controllers/client");

router.get("/api/clients", getClients);
router.post("/api/client", getClient);
// router.get("/api/clients/:id", getClient);
router.post("/api/client/create", createClient);
router.delete("/api/client/:id", deleteClient);
router.put("/api/client/:id", updateClient);

module.exports = router;
