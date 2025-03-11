const { isValidObjectId } = require("mongoose");
const { sendError } = require("../helper/errors");
const User = require("../models/user");
const Admin = require("../models/admin");
const ResetToken = require("../models/resetToken");

exports.isResetTokenValid = async (req, res, next) => {
  const { token, id } = req.query;

  if (!token || !id) return sendError(res, "Invalid request!");
  if (!isValidObjectId(id)) return sendError(res, "Invalid user!");

  const user = await User.findById(id);
  if (!user) return sendError(res, "User not found!");

  const resetToken = await ResetToken.findOne({ owner: user._id });
  if (!resetToken) return sendError(res, "Reset token not found!");

  const isValid = await resetToken.compareToken(token);
  if (!isValid) return sendError(res, "Reset token is invalid!");

  // Verifica si el usuario es un administrador
  const admin = await Admin.findOne({ user: user._id });
  if (!admin || admin.roles !== "admin") {
    return sendError(res, "Access denied. You are not an admin!");
  }

  req.user = user;
  req.admin = admin; // Adjunta el objeto admin a la solicitud para su uso posterior
  next();
};
