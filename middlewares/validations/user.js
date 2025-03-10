const { check, validationResult } = require("express-validator");

exports.validateUserSignUp = [
  check("userName")
    .trim()
    .not()
    .isEmpty()
    .withMessage("username is required!")
    .isString()
    .withMessage("Must be a valid name!")
    .isLength({ min: 3, max: 20 })
    .withMessage("username must be within 3 to 20 character!"),
  check("email").isEmail().withMessage("Invalid email!"),
  // check("email").normalizeEmail().isEmail().withMessage("Invalid email!"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is empty!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8 to 20 characters long!"),
  check("confirmPassword")
    .trim()
    .not()
    .isEmpty()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Both password must be same!");
      }
      return true;
    }),
];
exports.userValidation = (req, res, next) => {
  const result = validationResult(req).array();

  if (!result.length) return next();

  const error = result[0].msg;
  res.json({ success: false, message: error });
};

exports.validateUserSignIn = [
  check("email").trim().isEmail().withMessage("email / password is required!"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("email / password is required!"),
];

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.roles === "admin") {
    next(); // El usuario es administrador, continuar
  } else {
    res.status(403).json({
      success: false,
      message: "Acceso denegado. Se requiere rol de administrador.",
    });
  }
};
