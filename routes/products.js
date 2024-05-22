const router = require("express").Router();
const { createPreference } = require("../controllers/products");

router.post("/create_preference", createPreference);

module.exports = router;
