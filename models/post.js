const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  corporalPart: String,
  segment: String,
  movement: String,
  maxAngle: Number,
  minAngle: Number,
  averageAngle: Number,
  arthrology: Object,
  myology: Object,
  neurology: Object,
  observations: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

module.exports = model("post", postSchema);
