const express = require("express");
const router = express.Router();
const multer = require("multer");

const { uploadPaper, uploadUrl } = require("../controllers/papers");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload", upload.single("pdf"), uploadPaper);
router.post("/upload-url", uploadUrl); // Ruta para procesar la UR

module.exports = router;
