const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  testObject: {
    type: Array,
    default: [
      {
        downloadedJump: 0,
      },
    ],
  },
});

module.exports = mongoose.model("Tests", testSchema);
