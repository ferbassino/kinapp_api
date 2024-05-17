const { Schema, model } = require("mongoose");

const ImuDataSchema = new Schema({
  name: String,
  version: String,
  downloads: Number,
  date: { type: Date, default: Date.now },
});

module.exports = model("imuData", ImuDataSchema);
