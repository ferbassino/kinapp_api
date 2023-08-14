const { Schema, model } = require("mongoose");

const referenceSchema = new Schema({
  motionType: {
    type: String,
  },
  corporalPart: {
    type: String,
  },
  segment: {
    type: String,
  },
  motion: {
    type: String,
  },
  maxRefAngle: {
    type: Number,
  },
  minRefAngle: {
    type: Number,
  },
});

module.exports = model("Reference", referenceSchema);
