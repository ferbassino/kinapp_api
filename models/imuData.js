const { Schema, model } = require("mongoose");

const ImuDataSchema = new Schema({
  name: String,
  identifier: String,
  array: Array,
  object: Object,
  date: { type: Date, default: Date.now },
});

module.exports = model("imuData", ImuDataSchema);
