const mongoose = require("mongoose");

const motionTestSchema = new mongoose.Schema({
  motionType: {
    type: String,
    required: true,
  },
  corporalPart: {
    type: String,
  },
  segment: {
    type: String,
  },
  side: {
    type: String,
  },
  motion: {
    type: String,
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
  },
  age: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  size: {
    type: Number,
  },
  gender: {
    type: String,
  },
  pALevel: {
    type: String,
  },
  mPActivity: {
    type: String,
  },
  mFComponents: {
    type: String,
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
