const router = require("express").Router();
const {
  createPreference,
  getNotifications,
} = require("../controllers/products");

router.post("/create_preference", createPreference);
router.post("/webhook", getNotifications);

module.exports = router;
