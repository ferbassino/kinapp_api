const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const resetAdminTokenSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin", // Referencia al modelo Admin
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 3600, // El token expira después de 1 hora (3600 segundos)
    default: Date.now(),
  },
});

// Middleware para hashear el token antes de guardarlo
resetAdminTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    const hash = await bcrypt.hash(this.token, 8);
    this.token = hash;
  }
  next();
});

// Método para comparar tokens
resetAdminTokenSchema.methods.compareToken = async function (token) {
  if (!token) throw new Error("Token is missing, cannot compare!");
  try {
    const result = await bcrypt.compare(token, this.token);
    return result;
  } catch (error) {
    console.log("Error while comparing token:", error.message);
    return false;
  }
};

// Método estático para verificar si un correo electrónico está en uso
resetAdminTokenSchema.statics.isThisEmailInUse = async function (email) {
  if (!email) throw new Error("Invalid Email");
  try {
    const admin = await this.findOne({ email }); // Buscar en el modelo Admin

    if (admin) return false; // El correo ya está en uso

    return true; // El correo no está en uso
  } catch (error) {
    console.log("Error inside isThisEmailInUse method:", error.message);
    return false;
  }
};

module.exports = mongoose.model("ResetAdminToken", resetAdminTokenSchema);
