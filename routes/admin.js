const {
  createAdmin,
  getAllAdmins,
  getAdminById,
  resendAdminCode,
  signInAdmin,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getAdminProfile,
  updateAdmin,
} = require("../controllers/admin");
const {
  validateAdminSignUp,
  adminValidation,
  validateAdminSignIn,
  isResetAdminTokenValid,
  isAuth,
} = require("../middlewares/validations/admin");

const router = require("express").Router();

router.get("/api/admins", getAllAdmins);
router.get("/api/admins/:id", getAdminById);
router.post(
  "/api/create-admin",
  validateAdminSignUp,
  adminValidation,
  createAdmin
);
router.put("/api/admins/:id", updateAdmin);
router.post("/api/admins/resend-code", resendAdminCode);
router.post(
  "/api/admins/sign-in",
  validateAdminSignIn,
  adminValidation,
  signInAdmin
);

router.post("/api/admins/verify-email", verifyEmail);
router.post("/api/admins/forgot-password", forgotPassword);
router.post(
  "/api/admins/reset-password",
  isResetAdminTokenValid,
  resetPassword
);
router.get("/api/admins/profile", isAuth, getAdminProfile);
router.get("/api/admin/verify-token", isResetAdminTokenValid, (req, res) => {
  res.json({ success: true });
});

module.exports = router;
