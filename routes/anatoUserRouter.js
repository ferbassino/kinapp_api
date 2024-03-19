const router = require("express").Router();

const {
  createAnatoUser,
  signIn,
  getProfile,
} = require("../controllers/anatoUserControllers");

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

router.post(
  "/api/anato-user",
  validateUserSignUp,
  userValidation,
  createAnatoUser
);
router.post(
  "/api/anato-user/sign-in",
  validateUserSignIn,
  userValidation,
  signIn
);
// router.get("/sign-out", isAuth, signOut);

// router.get("/users", getAllUsers);
router.get("/api/anato-user/profile", isAuth, getProfile);
module.exports = router;
