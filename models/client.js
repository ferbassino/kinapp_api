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
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Client", clientSchema);
