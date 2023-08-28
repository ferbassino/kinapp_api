const mongoose = require("mongoose");

const motionTestSchema = new mongoose.Schema({
  motionType: {
    type: String,
    required: true,
  },
  corporalPart: {
    type: String,
    required: true,
  },
  segment: {
    type: String,
    required: true,
  },
  side: {
    type: String,
    default: "",
  },
  motion: {
    type: String,
    required: true,
  },
  accData: {
    type: Array,
  },
  gyroData: {
    type: Array,
  },
  magData: {
    type: Array,
  },
  testTime: {
    type: Number,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
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
  pALevel: {
    type: String,
    required: true,
  },
  mPActivity: {
    type: String,
    required: true,
  },
  mFComponents: {
    type: String,
    required: true,
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

module.exports = mongoose.model("MotionTest", motionTestSchema);
