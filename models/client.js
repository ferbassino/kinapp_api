const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  cellPhone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  verificationCode: {
    type: String,
  },
  verificationCodeExpires: {
    type: Date, // Fecha y hora de expiración del código
  },
  verified: {
    type: Boolean,
    default: false,
    required: true,
  },
  registered: {
    type: Boolean,
    default: false,
    required: true,
  },

  avatar: String,
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }],
  sessionsHistory: { type: Array },
  personalData: { type: Object },
  personalHistory: { type: Object },
  familyHistory: { type: Array },
  birthDate: {
    type: String,
  },
  size: {
    type: Number,
  },
  gender: {
    type: String,
  },
  roles: {
    type: String,
    default: "bronze",
  },
  data: {
    type: Object,
  },
  date: { type: Date, default: Date.now },
  cMJValidateNumbers: {
    type: Number,
  },
  appointmentId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],
  sessionId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
  ],
  userId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  motionId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Motion",
    },
  ],
  adminId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  ],
});

module.exports = mongoose.model("Client", clientSchema);
