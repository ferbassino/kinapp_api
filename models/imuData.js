const { Schema, model } = require("mongoose");

const ImuDataSchema = new Schema({
  name: String,
  identifier: String,
  mass: Number,
  array: Array,
  object: Object,
  testTime: Number,
  accX: Array,
  accY: Array,
  accZ: Array,
  accT: Array,
  date: { type: Date, default: Date.now },
});

module.exports = model("imuData", ImuDataSchema);
