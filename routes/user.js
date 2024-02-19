const router = require("express").Router();

const { check } = require("express-validator");
const {
  createUser,
  signIn,
  uploadProfile,
  signOut,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getUsers,
  updateUser,
  getUser,
  deleteUser,
} = require("../controllers/user");

const {
  validateUserSignUp,
  userValidation,
  validateUserSignIn,
} = require("../middlewares/validations/user");
const { isAuth } = require("../middlewares/auth");

const multer = require("multer");
const { isResetTokenValid } = require("../middlewares/user");

const storage = multer.diskStorage({});

const fileFilter = (request, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("invalid image file!", false);
  }
};
const uploads = multer({ storage, fileFilter });
router.post("/create-user", validateUserSignUp, userValidation, createUser);
router.post("/sign-in", validateUserSignIn, userValidation, signIn);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", isResetTokenValid, resetPassword);
router.get("/verify-token", isResetTokenValid, (req, res) => {
  res.json({ success: true });
});
router.get("/sign-out", isAuth, signOut);
router.get("/users", getUsers);
router.put("/user/:id", updateUser);
router.get("/api/user/:id", getUser);
router.delete("/api/user/:id", deleteUser);

router.get("/profile", isAuth, (request, response) => {
  if (!request.user)
    return response.json({ success: false, message: "unauthorized access" });

  response.json({
    success: true,
    userName: request.user.userName,
    email: request.user.email,
    avatar: request.user.avatar,
    id: request.user._id,
    verified: request.user.verified,
    roles: request.user.roles,
  });
});

router.post(
  "/upload-profile",
  isAuth,
  uploads.single("profile"),
  uploadProfile
);

router.get("/users", getAllUsers);

module.exports = router;
