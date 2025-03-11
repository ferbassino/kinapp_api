const { check, validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");
const { sendError } = require("../../helper/errors");
const Admin = require("../../models/admin");
const ResetAdminToken = require("../../models/resetAdminToken");
const jwt = require("jsonwebtoken");

exports.isResetAdminTokenValid = async (req, res, next) => {
  const { token, id } = req.query;

  if (!token || !id) return sendError(res, "Invalid request!");
  if (!isValidObjectId(id)) return sendError(res, "Invalid admin!");

  const admin = await Admin.findById(id);
  if (!admin) return sendError(res, "Admin not found!");

  const resetToken = await ResetAdminToken.findOne({ owner: admin._id });

  if (!resetToken) return sendError(res, "Reset token not found!");

  const isValid = await resetToken.compareToken(token);
  if (!isValid) return sendError(res, "Reset token is invalid!");

  req.admin = Admin;
  next();
};

// Validaciones para el registro de un administrador
exports.validateAdminSignUp = [
  check("userName")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Username is required!")
    .isString()
    .withMessage("Must be a valid name!")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be within 3 to 20 characters!"),
  check("email").isEmail().withMessage("Invalid email!"),
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
    .withMessage("Confirm password is empty!")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Both passwords must be the same!");
      }
      return true;
    }),
  check("roles")
    .optional()
    .isString()
    .withMessage("Roles must be a string!")
    .isIn(["admin", "superadmin"])
    .withMessage("Invalid role! Must be 'admin' or 'superadmin'."),
  check("permissions")
    .optional()
    .isObject()
    .withMessage("Permissions must be an object!"),
  check("isSuperAdmin")
    .optional()
    .isBoolean()
    .withMessage("isSuperAdmin must be a boolean!"),
];

// Validaciones para el inicio de sesión de un administrador
exports.validateAdminSignIn = [
  check("email").trim().isEmail().withMessage("Email / password is required!"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Email / password is required!"),
];

// Middleware para manejar errores de validación
exports.adminValidation = (req, res, next) => {
  const result = validationResult(req).array();

  if (!result.length) return next();

  const error = result[0].msg;
  res.json({ success: false, message: error });
};

// Middleware para verificar si el usuario es un administrador
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

// Middleware para verificar si el usuario es un superadmin
exports.isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.isSuperAdmin === true) {
    next(); // El usuario es superadmin, continuar
  } else {
    res.status(403).json({
      success: false,
      message: "Acceso denegado. Se requiere rol de superadministrador.",
    });
  }
};

exports.isAuth = async (request, response, next) => {
  // Verificar si hay cabeceras y autorización
  if (request.headers && request.headers.authorization) {
    const token = request.headers.authorization.split(" ")[1]; // Obtener el token de la cabecera

    try {
      // Verificar y decodificar el token
      const decode = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar el administrador por su ID (el token contiene adminId)
      const admin = await Admin.findById(decode.adminId);

      if (!admin) {
        return response.status(401).json({
          success: false,
          message: "Unauthorized access! Admin not found.",
        });
      }

      // Adjuntar el administrador al objeto request
      request.admin = admin;
      next(); // Continuar con la siguiente función de middleware
    } catch (error) {
      console.log("JsonWebTokenError:", error);

      // Manejar errores específicos de JWT
      if (error.name === "JsonWebTokenError") {
        return response.status(401).json({
          success: false,
          message: "Unauthorized access! Invalid token.",
        });
      }

      if (error.name === "TokenExpiredError") {
        console.log("TokenExpiredError:", error);
        return response.status(401).json({
          success: false,
          message: "Session expired. Please sign in again.",
        });
      }

      // Manejar otros errores internos del servidor
      console.log("Internal server error:", error);
      return response.status(500).json({
        success: false,
        message: "Internal server error!",
      });
    }
  } else {
    // Si no hay cabeceras o autorización
    console.log("Unauthorized access! No token provided.");
    return response.status(401).json({
      success: false,
      message: "Unauthorized access! No token provided.",
    });
  }
};
