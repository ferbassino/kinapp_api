const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  adminId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  userId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  date: {
    type: String, // Usamos ISO 8601 (YYYY-MM-DD)
    required: true,
  },
  time: {
    type: String, // Hora en formato de texto HH:mm
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "cancelled", "completed"], // Valores permitidos
    default: "pending",
  },
  position: {
    type: String,
  },
  notes: {
    type: String, // Campo opcional para notas adicionales
  },
  location: {
    type: String, // Ubicación del turno (opcional)
  },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
