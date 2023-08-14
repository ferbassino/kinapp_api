const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  motionType: {
    type: String,
  },
  segment: {
    type: String,
  },
  side: {
    type: String,
  },
  size: {
    type: String,
  },
  weight: {
    type: Number,
  },
  gender: {
    type: String,
    required: true,
  },
  pALevel: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  accX: {
    type: Array,
  },
  accY: {
    type: Array,
  },
  accZ: {
    type: Array,
  },
  accTime: {
    type: Array,
  },
  velX: {
    type: Array,
  },
  velY: {
    type: Array,
  },
  velZ: {
    type: Array,
  },
  velTime: {
    type: Array,
  },
  magX: {
    type: Array,
  },
  magY: {
    type: Array,
  },
  magZ: {
    type: Array,
  },
  magTime: {
    type: Array,
  },
  testTime: {
    type: Number,
  },
  dataArray: {
    type: Array,
  },
  dataObject: {
    type: Object,
  },
  date: { type: Date, default: Date.now },
  userId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  clientId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
  ],
});

module.exports = mongoose.model("Tests", testSchema);
