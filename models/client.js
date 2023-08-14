const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  birthDate: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  roles: {
    type: String,
    default: "bronze",
  },
  data: {
    type: Object,
  },
  date: { type: Date, default: Date.now },
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  motion: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tests",
    },
  ],
});

module.exports = mongoose.model("Client", clientSchema);
