const router = require("express").Router();
const { createPreference, getPayments } = require("../controllers/products");

router.post("/create_preference", createPreference);
router.get("/payment", getPayments);

module.exports = router;
