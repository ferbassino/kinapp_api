const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
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
