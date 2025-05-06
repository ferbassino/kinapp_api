const mongoose = require("mongoose");

const motionSchema = new mongoose.Schema({
  email: {
    type: String,
  },
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
  opposite: {
    type: String,
    default: "",
  },
  motion: {
    type: String,
  },
  values: {
    type: Object,
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
  timestamp: {
    type: Array,
  },
  kinoveaData: {
    type: Array,
  },
  videoFrameRate: {
    type: Number,
  },
  refDistance: {
    type: Number,
  },
  testTime: {
    type: Number,
  },
  mass: {
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
  jumpNumber: {
    type: Number,
  },
  dataObj: { type: mongoose.Schema.Types.Mixed },
  dataArr: [{ type: mongoose.Schema.Types.Mixed }],
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
  adminId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Motion", motionSchema);
