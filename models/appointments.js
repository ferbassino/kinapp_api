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
  sessionId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
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
  paid: {
    type: String,
    enum: ["unpaid", "paid", "partial"], // Valores permitidos
    default: "unpaid",
  },
  payment: {
    type: Number,
    default: 0,
  },
  remainsToPay: {
    type: Number,
    default: 0,
  },
  serviceType: {
    type: String,
  },
  location: {
    type: String,
  },
  position: {
    type: String,
  },
  notes: {
    type: String, // Campo opcional para notas adicionales
  },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
