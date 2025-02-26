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
  creteUserCourses,
  updateUserCourses,
  resendUserCode,
} = require("../controllers/user");

const {
  validateUserSignUp,
  userValidation,
  validateUserSignIn,
  isAdmin,
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

router.get("/users", getUsers);
router.get("/api/user/:id", getUser);
router.post("/create-user", validateUserSignUp, userValidation, createUser);
router.post("/api/user/resend-code", resendUserCode);

router.put("/user/:id", updateUser);
router.delete("/api/user/:id", deleteUser);
router.put("/create-user-courses/:id", creteUserCourses);
router.put("/update-user-courses/:id", updateUserCourses);
router.post("/sign-in", validateUserSignIn, userValidation, signIn);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", isResetTokenValid, resetPassword);
router.get("/verify-token", isResetTokenValid, (req, res) => {
  res.json({ success: true });
});
router.get("/sign-out", isAuth, signOut);

router.get("/profile", isAuth, (request, response) => {
  if (!request.user)
    return response.json({ success: false, message: "unauthorized access" });

  response.json({
    success: true,
    userName: request.user.userName,
    email: request.user.email,
    id: request.user._id,
    verified: request.user.verified,
    roles: request.user.roles,
    level: request.user.level,
    initialDate: request.user.initialDate,
    payday: request.user.payday,
    currentDate: request.user.currentDate,
  });
});

router.post(
  "/upload-profile",
  isAuth,
  uploads.single("profile"),
  uploadProfile
);

router.get("/users", getAllUsers);

// Rutas para administradores

router.post("/api/admin/users", createUser); // Crear un nuevo usuario
router.put("/api/admin/users/:id", isAuth, isAdmin, updateUser); // Actualizar un usuario
router.delete("/api/admin/users/:id", isAuth, isAdmin, deleteUser); // Eliminar un usuario
router.get("/api/admin/users", isAuth, isAdmin, getUsers); // Obtener todos los usuarios
router.get("/api/admin/users/:id", isAuth, isAdmin, getUser); // Obtener un usuario específico
module.exports = router;
